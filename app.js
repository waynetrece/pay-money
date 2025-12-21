const subscriptions = [
  {
    platform: "Netflix",
    billing: "monthly",
    startDate: "2023-05-15",
    status: "paid",
    amount: 390,
    currency: "TWD",
    method: "Credit Card",
    note: ""
  },
  {
    platform: "Spotify",
    billing: "monthly",
    startDate: "2022-02-28",
    status: "paid",
    amount: 149,
    currency: "TWD",
    method: "Apple Pay",
    note: ""
  },
  {
    platform: "Notion",
    billing: "yearly",
    startDate: "2021-11-30",
    status: "paid",
    amount: 1500,
    currency: "TWD",
    method: "Credit Card",
    note: "Team workspace"
  },
  {
    platform: "Adobe CC",
    billing: "yearly",
    startDate: "2020-01-31",
    status: "overdue",
    amount: 19800,
    currency: "TWD",
    method: "Bank Transfer",
    note: "Seat renewal"
  },
  {
    platform: "Figma",
    billing: "monthly",
    startDate: "2023-07-04",
    status: "paid",
    amount: 450,
    currency: "TWD",
    method: "Credit Card",
    note: ""
  },
  {
    platform: "ChatGPT Plus",
    billing: "monthly",
    startDate: "2023-09-23",
    status: "paid",
    amount: 650,
    currency: "TWD",
    method: "Credit Card",
    note: ""
  }
];

const paymentHistory = [
  {
    platform: "Netflix",
    date: "2024-08-15",
    amount: 390,
    currency: "TWD",
    method: "Credit Card"
  },
  {
    platform: "Spotify",
    date: "2024-08-28",
    amount: 149,
    currency: "TWD",
    method: "Apple Pay"
  },
  {
    platform: "Figma",
    date: "2024-08-04",
    amount: 450,
    currency: "TWD",
    method: "Credit Card"
  },
  {
    platform: "ChatGPT Plus",
    date: "2024-08-23",
    amount: 650,
    currency: "TWD",
    method: "Credit Card"
  },
  {
    platform: "Notion",
    date: "2023-11-30",
    amount: 1500,
    currency: "TWD",
    method: "Credit Card"
  }
];

const billingLabels = {
  monthly: "Monthly",
  yearly: "Yearly"
};

const statusLabels = {
  paid: "Paid",
  overdue: "Overdue",
  active: "Active"
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const tableBody = document.getElementById("tableBody");
const alertsList = document.getElementById("alerts");
const historyList = document.getElementById("history");
const monthlyTotalEl = document.getElementById("monthlyTotal");
const nextChargeEl = document.getElementById("nextCharge");
const nextChargeMetaEl = document.getElementById("nextChargeMeta");
const annualTotalEl = document.getElementById("annualTotal");
const themeToggle = document.getElementById("themeToggle");

const today = startOfDay(new Date());

const computedSubscriptions = subscriptions
  .map((subscription) => {
    const { date, note } = computeNextCharge(subscription, today);
    const daysUntil = Math.round((date - today) / MS_PER_DAY);
    const mergedNote = [subscription.note, note].filter(Boolean).join(" / ");

    return {
      ...subscription,
      billingLabel: billingLabels[subscription.billing] || subscription.billing,
      nextCharge: date,
      nextChargeText: formatDate(date),
      daysUntil,
      note: mergedNote
    };
  })
  .sort((a, b) => a.nextCharge - b.nextCharge);

renderSummary(computedSubscriptions);
renderTable(computedSubscriptions);
renderAlerts(computedSubscriptions);
renderHistory(paymentHistory);
setupFilter();
setupTheme();

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDate(value) {
  const parts = value.split("-").map((item) => Number(item));
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function addMonthsKeepingDay(baseDate, monthsToAdd, originalDay) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth() + monthsToAdd;
  const target = new Date(year, month, 1);
  const lastDay = daysInMonth(target.getFullYear(), target.getMonth());
  target.setDate(Math.min(originalDay, lastDay));
  return target;
}

function addYearsKeepingDay(baseDate, yearsToAdd, originalDay) {
  const year = baseDate.getFullYear() + yearsToAdd;
  const month = baseDate.getMonth();
  const target = new Date(year, month, 1);
  const lastDay = daysInMonth(year, month);
  target.setDate(Math.min(originalDay, lastDay));
  return target;
}

// Calculate the next charge date while preserving the original day-of-month rule.
function computeNextCharge(subscription, now) {
  const start = parseDate(subscription.startDate);
  const originalDay = start.getDate();
  let candidate = new Date(start);

  if (subscription.billing === "yearly") {
    while (candidate < now) {
      candidate = addYearsKeepingDay(candidate, 1, originalDay);
    }
  } else {
    while (candidate < now) {
      candidate = addMonthsKeepingDay(candidate, 1, originalDay);
    }
  }

  const lastDay = daysInMonth(candidate.getFullYear(), candidate.getMonth());
  const note = originalDay > lastDay ? `Original day: ${originalDay}` : "";
  return { date: candidate, note };
}

function formatCurrency(amount, currency) {
  const value = Number(amount || 0);
  if (currency === "TWD") {
    return `NT$${value.toLocaleString("en-US")}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(value);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (match) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    };
    return map[match];
  });
}

function renderSummary(items) {
  if (!items.length) {
    monthlyTotalEl.textContent = "NT$0";
    annualTotalEl.textContent = "NT$0";
    nextChargeEl.textContent = "--/--";
    nextChargeMetaEl.textContent = "--";
    return;
  }

  const monthlyTotal = items.reduce((sum, item) => {
    const amount = Number(item.amount || 0);
    if (item.billing === "monthly") {
      return sum + amount;
    }
    if (item.billing === "yearly") {
      return sum + amount / 12;
    }
    return sum;
  }, 0);

  const annualTotal = items.reduce((sum, item) => {
    const amount = Number(item.amount || 0);
    if (item.billing === "monthly") {
      return sum + amount * 12;
    }
    if (item.billing === "yearly") {
      return sum + amount;
    }
    return sum;
  }, 0);

  const nextItem = items[0];
  monthlyTotalEl.textContent = `NT$${Math.round(monthlyTotal).toLocaleString("en-US")}`;
  annualTotalEl.textContent = `NT$${Math.round(annualTotal).toLocaleString("en-US")}`;
  nextChargeEl.textContent = nextItem.nextChargeText;
  nextChargeMetaEl.textContent = `${nextItem.platform} • ${nextItem.billingLabel} • in ${nextItem.daysUntil} days`;
}

function renderTable(items) {
  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = items
    .map((item) => {
      const statusText = statusLabels[item.status] || statusLabels.active;
      const statusClass = item.status === "overdue" ? "status overdue" : "status";
      const note = item.note
        ? `<span class="note-pill">${escapeHtml(item.note)}</span>`
        : "-";

      return `
        <div class="table-row" data-billing="${escapeHtml(item.billing)}">
          <div>${escapeHtml(item.platform)}</div>
          <div><span class="tag">${escapeHtml(item.billingLabel)}</span></div>
          <div>${formatDate(parseDate(item.startDate))}</div>
          <div>${item.nextChargeText}</div>
          <div><span class="${statusClass}">${escapeHtml(statusText)}</span></div>
          <div class="amount">${formatCurrency(item.amount, item.currency)}</div>
          <div>${escapeHtml(item.currency)}</div>
          <div>${escapeHtml(item.method)}</div>
          <div>${note}</div>
        </div>
      `;
    })
    .join("");
}

function renderAlerts(items) {
  if (!alertsList) {
    return;
  }

  const alertItems = items.filter((item) => [0, 3, 7].includes(item.daysUntil));

  if (!alertItems.length) {
    alertsList.innerHTML = `
      <div class="alert-item">
        <div class="alert-title">No alerts today</div>
        <div class="alert-sub">You are all caught up.</div>
      </div>
    `;
    return;
  }

  alertsList.innerHTML = alertItems
    .map((item) => {
      return `
        <div class="alert-item">
          <div class="alert-title">${escapeHtml(item.platform)}</div>
          <div class="alert-sub">${escapeHtml(item.billingLabel)} billing • Next charge ${item.nextChargeText}</div>
          <div class="alert-meta">
            <span>In ${item.daysUntil} days</span>
            <span>${formatCurrency(item.amount, item.currency)}</span>
            <span>${escapeHtml(item.method)}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderHistory(items) {
  if (!historyList) {
    return;
  }

  historyList.innerHTML = items
    .map((item) => {
      const date = formatDate(parseDate(item.date));
      return `
        <div class="history-item">
          <div class="history-title">${escapeHtml(item.platform)} • ${formatCurrency(item.amount, item.currency)}</div>
          <div class="history-sub">${date} • ${escapeHtml(item.method)}</div>
        </div>
      `;
    })
    .join("");
}

function setupFilter() {
  const chips = document.querySelectorAll(".chip");
  if (!chips.length || !tableBody) {
    return;
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
      const filter = chip.dataset.filter;
      const rows = tableBody.querySelectorAll(".table-row");
      rows.forEach((row) => {
        const match = filter === "all" || row.dataset.billing === filter;
        row.style.display = match ? "grid" : "none";
      });
    });
  });
}

function setupTheme() {
  if (!themeToggle) {
    return;
  }

  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  updateThemeButton();

  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const nextTheme = isDark ? "light" : "dark";
    if (nextTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", nextTheme);
    updateThemeButton();
  });
}

function updateThemeButton() {
  if (!themeToggle) {
    return;
  }

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
  themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
}
