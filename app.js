const defaultSubscriptions = [
  {
    id: "sub_netflix",
    platform: "Netflix",
    billing: "monthly",
    startDate: "2023-05-15",
    amount: 390,
    currency: "TWD",
    method: "Credit Card",
    note: ""
  },
  {
    id: "sub_spotify",
    platform: "Spotify",
    billing: "monthly",
    startDate: "2022-02-28",
    amount: 149,
    currency: "TWD",
    method: "Apple Pay",
    note: ""
  },
  {
    id: "sub_notion",
    platform: "Notion",
    billing: "yearly",
    startDate: "2021-11-30",
    amount: 1500,
    currency: "TWD",
    method: "Credit Card",
    note: "Team workspace"
  },
  {
    id: "sub_adobe",
    platform: "Adobe CC",
    billing: "yearly",
    startDate: "2020-01-31",
    amount: 19800,
    currency: "TWD",
    method: "Bank Transfer",
    note: "Seat renewal"
  },
  {
    id: "sub_figma",
    platform: "Figma",
    billing: "monthly",
    startDate: "2023-07-04",
    amount: 450,
    currency: "TWD",
    method: "Credit Card",
    note: ""
  },
  {
    id: "sub_chatgpt",
    platform: "ChatGPT Plus",
    billing: "monthly",
    startDate: "2023-09-23",
    amount: 650,
    currency: "TWD",
    method: "Credit Card",
    note: ""
  }
];

const defaultSettings = {
  dailyTime: "09:00",
  recipientEmail: "yourname@gmail.com",
  usdRate: 31.5
};

const defaultPaymentHistory = [
  {
    id: "pay_netflix_20240815",
    subscriptionId: "sub_netflix",
    platform: "Netflix",
    date: "2024-08-15",
    amount: 390,
    currency: "TWD",
    method: "Credit Card",
    note: ""
  },
  {
    id: "pay_spotify_20240828",
    subscriptionId: "sub_spotify",
    platform: "Spotify",
    date: "2024-08-28",
    amount: 149,
    currency: "TWD",
    method: "Apple Pay",
    note: ""
  },
  {
    id: "pay_figma_20240804",
    subscriptionId: "sub_figma",
    platform: "Figma",
    date: "2024-08-04",
    amount: 450,
    currency: "TWD",
    method: "Credit Card",
    note: ""
  },
  {
    id: "pay_chatgpt_20240823",
    subscriptionId: "sub_chatgpt",
    platform: "ChatGPT Plus",
    date: "2024-08-23",
    amount: 650,
    currency: "TWD",
    method: "Credit Card",
    note: ""
  },
  {
    id: "pay_notion_20231130",
    subscriptionId: "sub_notion",
    platform: "Notion",
    date: "2023-11-30",
    amount: 1500,
    currency: "TWD",
    method: "Credit Card",
    note: ""
  }
];

const billingLabels = {
  monthly: "Monthly",
  yearly: "Yearly"
};

const statusLabels = {
  paid: "Paid",
  due: "Due",
  upcoming: "Upcoming",
  overdue: "Overdue"
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const STORAGE_KEYS = {
  subscriptions: "subpulse.subscriptions",
  payments: "subpulse.payments",
  settings: "subpulse.settings"
};

let subscriptions = loadSubscriptions(defaultSubscriptions);
let paymentHistory = loadPaymentHistory(defaultPaymentHistory);
let settings = loadSettings();

const tableBody = document.getElementById("tableBody");
const alertsList = document.getElementById("alerts");
const historyList = document.getElementById("history");
const monthlyTotalEl = document.getElementById("monthlyTotal");
const nextChargeEl = document.getElementById("nextCharge");
const nextChargeMetaEl = document.getElementById("nextChargeMeta");
const annualTotalEl = document.getElementById("annualTotal");
const themeToggle = document.getElementById("themeToggle");
const navItems = document.querySelectorAll(".nav-item");
const pageTitle = document.querySelector(".page-title");
const pageSub = document.querySelector(".page-sub");
const addSubscriptionButton = document.getElementById("addSubscription");
const addPaymentButton = document.getElementById("addPayment");
const subscriptionModal = document.getElementById("subscriptionModal");
const subscriptionForm = document.getElementById("subscriptionForm");
const modalTitle = document.getElementById("modalTitle");
const modalSubmitButton = subscriptionForm
  ? subscriptionForm.querySelector('button[type="submit"]')
  : null;
const paymentModal = document.getElementById("paymentModal");
const paymentForm = document.getElementById("paymentForm");
const paymentModalTitle = document.getElementById("paymentModalTitle");
const paymentSubmitButton = paymentForm
  ? paymentForm.querySelector('button[type="submit"]')
  : null;
const dailyTimeInput = document.getElementById("dailyTime");
const recipientEmailInput = document.getElementById("recipientEmail");
const usdRateInput = document.getElementById("usdRate");
const saveSettingsButton = document.getElementById("saveSettings");

let activeFilter = "all";
let computedSubscriptions = [];
let editingId = null;
let editingPaymentId = null;

refreshData();
setupFilter();
setupTheme();
setupNavigation();
setupModal();
setupPaymentModal();
setupPaymentActions();
setupSettings();
setupRowActions();

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

  let last = null;
  if (candidate > start) {
    if (subscription.billing === "yearly") {
      last = addYearsKeepingDay(candidate, -1, originalDay);
    } else {
      last = addMonthsKeepingDay(candidate, -1, originalDay);
    }
  }

  const lastDay = daysInMonth(candidate.getFullYear(), candidate.getMonth());
  const note = originalDay > lastDay ? `Original day: ${originalDay}` : "";
  return { next: candidate, last, note, start };
}

function formatCurrency(amount, currency) {
  const value = Number(amount || 0);
  if (currency === "TWD") {
    return formatTwd(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(value);
}

function formatTwd(value) {
  return `NT$${Math.round(value).toLocaleString("en-US")}`;
}

function formatRate(rate) {
  const value = Number(rate || 0);
  if (!value) {
    return "";
  }
  return value.toFixed(2).replace(/\.00$/, "");
}

function formatDaysUntil(days) {
  if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  }
  if (days === 0) {
    return "due today";
  }
  return `in ${days} days`;
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

function generateId(prefix) {
  const safePrefix = prefix || "item";
  return `${safePrefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function ensureIds(list) {
  return list.map((item) => ({
    ...item,
    id: item.id || generateId("sub")
  }));
}

function loadSubscriptions(fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.subscriptions);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        return ensureIds(parsed);
      }
    }
  } catch (error) {
    console.warn("Failed to load subscriptions", error);
  }
  return ensureIds(fallback || []);
}

function saveSubscriptions() {
  try {
    localStorage.setItem(STORAGE_KEYS.subscriptions, JSON.stringify(subscriptions));
  } catch (error) {
    console.warn("Failed to save subscriptions", error);
  }
}

function resolveSubscriptionIdByPlatform(platform) {
  if (!platform) {
    return "";
  }
  const match = subscriptions.find((item) => item.platform === platform);
  return match ? match.id : "";
}

function normalizePayments(list) {
  return list.map((item) => {
    const subscriptionId = item.subscriptionId || resolveSubscriptionIdByPlatform(item.platform);
    return {
      ...item,
      id: item.id || generateId("pay"),
      subscriptionId,
      platform: item.platform || ""
    };
  });
}

function loadPaymentHistory(fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.payments);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return normalizePayments(parsed);
      }
    }
  } catch (error) {
    console.warn("Failed to load payments", error);
  }
  return normalizePayments(fallback || []);
}

function savePaymentHistory() {
  try {
    localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(paymentHistory));
  } catch (error) {
    console.warn("Failed to save payments", error);
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultSettings,
        ...parsed
      };
    }
  } catch (error) {
    console.warn("Failed to load settings", error);
  }
  return { ...defaultSettings };
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch (error) {
    console.warn("Failed to save settings", error);
  }
}

function getExchangeRate(item) {
  if (item.currency !== "USD") {
    return 0;
  }
  if (item.exchangeRate) {
    return Number(item.exchangeRate);
  }
  return Number(settings.usdRate || 0);
}

function getAmountTwd(item) {
  const amount = Number(item.amount || 0);
  if (item.currency === "USD") {
    const rate = getExchangeRate(item);
    if (!rate) {
      return 0;
    }
    return amount * rate;
  }
  return amount;
}

function getPaymentsForSubscription(subscription) {
  return paymentHistory.filter((payment) => {
    if (payment.subscriptionId) {
      return payment.subscriptionId === subscription.id;
    }
    if (payment.platform) {
      return payment.platform === subscription.platform;
    }
    return false;
  });
}

function hasPaymentInCycle(subscription, cycleStart, nextCharge) {
  if (!cycleStart || !nextCharge) {
    return false;
  }

  const payments = getPaymentsForSubscription(subscription);
  return payments.some((payment) => {
    const date = startOfDay(parseDate(payment.date));
    return date >= cycleStart && date <= nextCharge;
  });
}

function resolveCycleStart(startDate, lastCharge) {
  if (!lastCharge) {
    return startDate;
  }
  if (lastCharge < startDate) {
    return startDate;
  }
  return lastCharge;
}

function resolvePaymentPlatform(payment) {
  const subscription = subscriptions.find((item) => item.id === payment.subscriptionId);
  if (subscription) {
    return subscription.platform;
  }
  return payment.platform || "Unknown";
}

function formatPaymentAmountLine(payment) {
  const currency = payment.currency || "TWD";
  const base = formatCurrency(payment.amount, currency);
  if (currency === "USD") {
    const rate = Number(settings.usdRate || 0);
    if (rate) {
      const converted = formatTwd(Number(payment.amount || 0) * rate);
      return `${base} • ≈ ${converted}`;
    }
  }
  return base;
}

function getPaymentFormFields() {
  if (!paymentForm) {
    return {};
  }
  return {
    subscriptionSelect: paymentForm.querySelector('select[name="subscriptionId"]'),
    dateInput: paymentForm.querySelector('input[name="date"]'),
    amountInput: paymentForm.querySelector('input[name="amount"]'),
    currencyInput: paymentForm.querySelector('select[name="currency"]'),
    methodInput: paymentForm.querySelector('select[name="method"]'),
    noteInput: paymentForm.querySelector('input[name="note"]')
  };
}

function applySubscriptionDefaults(subscription, fields, force) {
  if (!subscription) {
    return;
  }
  if (fields.currencyInput && (force || !fields.currencyInput.value)) {
    fields.currencyInput.value = subscription.currency || "TWD";
  }
  if (fields.methodInput && (force || !fields.methodInput.value)) {
    fields.methodInput.value = subscription.method || "Credit Card";
  }
  if (fields.amountInput && (force || !fields.amountInput.value)) {
    fields.amountInput.value = subscription.amount || "";
  }
}

function populatePaymentSubscriptions(selectedId, fallbackLabel) {
  const fields = getPaymentFormFields();
  if (!fields.subscriptionSelect) {
    return;
  }

  const sorted = [...subscriptions].sort((a, b) =>
    a.platform.localeCompare(b.platform, "en")
  );

  if (!sorted.length) {
    fields.subscriptionSelect.innerHTML = `<option value="">尚無訂閱</option>`;
    fields.subscriptionSelect.disabled = true;
    if (paymentSubmitButton) {
      paymentSubmitButton.disabled = true;
    }
    return;
  }

  fields.subscriptionSelect.disabled = false;
  if (paymentSubmitButton) {
    paymentSubmitButton.disabled = false;
  }
  fields.subscriptionSelect.innerHTML = sorted
    .map(
      (item) =>
        `<option value="${escapeHtml(item.id)}">${escapeHtml(item.platform)}</option>`
    )
    .join("");

  if (selectedId && !sorted.find((item) => item.id === selectedId)) {
    const label = fallbackLabel ? `${fallbackLabel} (已刪除)` : "已刪除的訂閱";
    fields.subscriptionSelect.insertAdjacentHTML(
      "afterbegin",
      `<option value="${escapeHtml(selectedId)}">${escapeHtml(label)}</option>`
    );
  }

  fields.subscriptionSelect.value =
    selectedId || (sorted.length ? sorted[0].id : "");
}

function refreshData() {
  const today = startOfDay(new Date());
  computedSubscriptions = subscriptions
    .map((subscription) => {
      const { next, last, note, start } = computeNextCharge(subscription, today);
      const daysUntil = Math.round((next - today) / MS_PER_DAY);
      const amountTwd = getAmountTwd(subscription);
      const exchangeRateUsed = getExchangeRate(subscription);
      const missingRate = subscription.currency === "USD" && !exchangeRateUsed;
      const mergedNote = [subscription.note, note, missingRate ? "缺少匯率" : ""]
        .filter(Boolean)
        .join(" / ");
      const cycleStart = resolveCycleStart(start, last);
      const paid = hasPaymentInCycle(subscription, cycleStart, next);
      let status = "upcoming";

      if (paid) {
        status = "paid";
      } else if (daysUntil < 0) {
        status = "overdue";
      } else if (daysUntil === 0) {
        status = "due";
      }

      return {
        ...subscription,
        billingLabel: billingLabels[subscription.billing] || subscription.billing,
        nextCharge: next,
        nextChargeText: formatDate(next),
        daysUntil,
        daysUntilText: formatDaysUntil(daysUntil),
        note: mergedNote,
        amountTwd,
        exchangeRateUsed,
        status
      };
    })
    .sort((a, b) => a.nextCharge - b.nextCharge);

  renderSummary(computedSubscriptions);
  renderTable(computedSubscriptions);
  renderAlerts(computedSubscriptions);
  renderHistory(paymentHistory);
  applyFilter(activeFilter);
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
    const amount = Number(item.amountTwd || 0);
    if (item.billing === "monthly") {
      return sum + amount;
    }
    if (item.billing === "yearly") {
      return sum + amount / 12;
    }
    return sum;
  }, 0);

  const annualTotal = items.reduce((sum, item) => {
    const amount = Number(item.amountTwd || 0);
    if (item.billing === "monthly") {
      return sum + amount * 12;
    }
    if (item.billing === "yearly") {
      return sum + amount;
    }
    return sum;
  }, 0);

  const nextItem = items[0];
  monthlyTotalEl.textContent = formatTwd(monthlyTotal);
  annualTotalEl.textContent = formatTwd(annualTotal);
  nextChargeEl.textContent = nextItem.nextChargeText;
  nextChargeMetaEl.textContent = `${nextItem.platform} • ${nextItem.billingLabel} • ${nextItem.daysUntilText}`;
}

function renderTable(items) {
  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = items
    .map((item) => {
      const statusText = statusLabels[item.status] || statusLabels.upcoming;
      const statusClass = `status ${item.status}`;
      const note = item.note
        ? `<span class="note-pill">${escapeHtml(item.note)}</span>`
        : "-";
      const amountText = formatCurrency(item.amount, item.currency);
      let amountSub = "";

      if (item.currency === "USD") {
        if (item.exchangeRateUsed) {
          amountSub = `<div class="amount-sub">≈ ${formatTwd(item.amountTwd)} @ ${escapeHtml(
            formatRate(item.exchangeRateUsed)
          )}</div>`;
        } else {
          amountSub = `<div class="amount-sub">缺少匯率</div>`;
        }
      }

      return `
        <div class="table-row" data-billing="${escapeHtml(item.billing)}">
          <div>${escapeHtml(item.platform)}</div>
          <div><span class="tag">${escapeHtml(item.billingLabel)}</span></div>
          <div>${formatDate(parseDate(item.startDate))}</div>
          <div>${item.nextChargeText}</div>
          <div><span class="${statusClass}">${escapeHtml(statusText)}</span></div>
          <div class="amount">${amountText}${amountSub}</div>
          <div>${escapeHtml(item.currency)}</div>
          <div>${escapeHtml(item.method)}</div>
          <div>${note}</div>
          <div>
            <div class="row-actions">
              <button class="action-button" type="button" data-action="edit" data-id="${escapeHtml(
                item.id
              )}">編輯</button>
              <button class="action-button danger" type="button" data-action="delete" data-id="${escapeHtml(
                item.id
              )}">刪除</button>
            </div>
          </div>
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
      let amountLine = formatCurrency(item.amount, item.currency);
      if (item.currency === "USD" && item.exchangeRateUsed) {
        amountLine = `${amountLine} • ≈ ${formatTwd(item.amountTwd)}`;
      }
      return `
        <div class="alert-item">
          <div class="alert-title">${escapeHtml(item.platform)}</div>
          <div class="alert-sub">${escapeHtml(item.billingLabel)} billing • Next charge ${item.nextChargeText}</div>
          <div class="alert-meta">
            <span>${item.daysUntilText}</span>
            <span>${amountLine}</span>
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

  if (!items.length) {
    historyList.innerHTML = `
      <div class="history-item">
        <div class="history-title">No payment records yet</div>
        <div class="history-sub">Add a payment to get started.</div>
      </div>
    `;
    return;
  }

  const sorted = [...items].sort((a, b) => parseDate(b.date) - parseDate(a.date));

  historyList.innerHTML = sorted
    .map((item) => {
      const date = formatDate(parseDate(item.date));
      const platformName = resolvePaymentPlatform(item);
      const amountLine = formatPaymentAmountLine(item);
      const method = item.method || "-";
      const currency = item.currency || "-";
      const note = item.note
        ? `<div class="history-note">${escapeHtml(item.note)}</div>`
        : "";

      return `
        <div class="history-item">
          <div class="history-header">
            <div class="history-title">${escapeHtml(platformName)} • ${amountLine}</div>
            <div class="history-actions">
              <button class="action-button small" type="button" data-action="edit-payment" data-id="${escapeHtml(
                item.id
              )}">編輯</button>
              <button class="action-button small danger" type="button" data-action="delete-payment" data-id="${escapeHtml(
                item.id
              )}">刪除</button>
            </div>
          </div>
          <div class="history-sub">${date} • ${escapeHtml(method)} • ${escapeHtml(currency)}</div>
          ${note}
        </div>
      `;
    })
    .join("");
}

function applyFilter(filter) {
  if (!tableBody) {
    return;
  }

  const rows = tableBody.querySelectorAll(".table-row");
  rows.forEach((row) => {
    const match = filter === "all" || row.dataset.billing === filter;
    row.style.display = match ? "grid" : "none";
  });
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
      const filter = chip.dataset.filter || "all";
      activeFilter = filter;
      applyFilter(filter);
    });
  });
}

function setupPaymentActions() {
  if (!historyList) {
    return;
  }

  historyList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const action = button.dataset.action;
    const id = button.dataset.id;
    const target = paymentHistory.find((item) => item.id === id);

    if (!target) {
      return;
    }

    if (action === "edit-payment") {
      openPaymentModal(target);
      return;
    }

    if (action === "delete-payment") {
      const confirmed = window.confirm(`刪除付款記錄（${resolvePaymentPlatform(target)}）嗎？`);
      if (!confirmed) {
        return;
      }
      paymentHistory = paymentHistory.filter((item) => item.id !== id);
      savePaymentHistory();
      refreshData();
    }
  });
}

function setupRowActions() {
  if (!tableBody) {
    return;
  }

  tableBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const action = button.dataset.action;
    const id = button.dataset.id;
    const target = subscriptions.find((item) => item.id === id);

    if (!target) {
      return;
    }

    if (action === "edit") {
      openModal(target);
      return;
    }

    if (action === "delete") {
      const confirmed = window.confirm(`刪除 ${target.platform} 嗎？付款記錄會保留。`);
      if (!confirmed) {
        return;
      }
      subscriptions = subscriptions.filter((item) => item.id !== id);
      saveSubscriptions();
      refreshData();
    }
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
  themeToggle.textContent = isDark ? "淺色模式 / Light" : "深色模式 / Dark";
  themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
}

function setupSettings() {
  if (!dailyTimeInput || !recipientEmailInput || !usdRateInput || !saveSettingsButton) {
    return;
  }

  dailyTimeInput.value = settings.dailyTime || defaultSettings.dailyTime;
  recipientEmailInput.value = settings.recipientEmail || defaultSettings.recipientEmail;
  usdRateInput.value = settings.usdRate || "";

  const persistSettings = () => {
    settings = {
      dailyTime: dailyTimeInput.value || defaultSettings.dailyTime,
      recipientEmail: recipientEmailInput.value || defaultSettings.recipientEmail,
      usdRate: Number(usdRateInput.value || 0)
    };
    saveSettings();
    refreshData();
  };

  saveSettingsButton.addEventListener("click", persistSettings);
  dailyTimeInput.addEventListener("change", persistSettings);
  recipientEmailInput.addEventListener("change", persistSettings);
  usdRateInput.addEventListener("input", persistSettings);
}

function setupNavigation() {
  if (!navItems.length) {
    return;
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");
      const section = item.dataset.section || "overview";
      setView(section);
    });
  });

  const initialView = document.body.dataset.view || "overview";
  setView(initialView);
  const activeItem = Array.from(navItems).find(
    (item) => item.dataset.section === initialView
  );
  if (activeItem) {
    navItems.forEach((nav) => nav.classList.remove("active"));
    activeItem.classList.add("active");
  }
}

function setView(view) {
  const viewMeta = {
    overview: {
      title: "訂閱儀表板",
      sub: "Subscription Overview"
    },
    subscriptions: {
      title: "訂閱清單",
      sub: "Subscriptions"
    },
    payments: {
      title: "付款記錄",
      sub: "Payment History"
    },
    notifications: {
      title: "通知設定",
      sub: "Notifications"
    }
  };

  const meta = viewMeta[view] || viewMeta.overview;
  document.body.dataset.view = view;
  if (pageTitle) {
    pageTitle.textContent = meta.title;
  }
  if (pageSub) {
    pageSub.textContent = meta.sub;
  }
}

function setupModal() {
  if (!subscriptionModal || !subscriptionForm || !addSubscriptionButton) {
    return;
  }

  const closeButtons = subscriptionModal.querySelectorAll("[data-modal-close]");
  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  addSubscriptionButton.addEventListener("click", () => openModal());
  subscriptionForm.addEventListener("submit", handleFormSubmit);
}

function openModal(subscription) {
  if (!subscriptionModal || !subscriptionForm || !modalTitle || !modalSubmitButton) {
    return;
  }

  subscriptionForm.reset();
  const startDateInput = subscriptionForm.querySelector('input[name="startDate"]');
  const platformInput = subscriptionForm.querySelector('input[name="platform"]');
  const billingInput = subscriptionForm.querySelector('select[name="billing"]');
  const amountInput = subscriptionForm.querySelector('input[name="amount"]');
  const currencyInput = subscriptionForm.querySelector('select[name="currency"]');
  const methodInput = subscriptionForm.querySelector('select[name="method"]');
  const noteInput = subscriptionForm.querySelector('input[name="note"]');

  if (subscription) {
    editingId = subscription.id;
    modalTitle.textContent = "編輯訂閱";
    modalSubmitButton.textContent = "更新訂閱";
    if (platformInput) {
      platformInput.value = subscription.platform || "";
    }
    if (billingInput) {
      billingInput.value = subscription.billing || "monthly";
    }
    if (startDateInput) {
      startDateInput.value = subscription.startDate || "";
    }
    if (amountInput) {
      amountInput.value = subscription.amount || "";
    }
    if (currencyInput) {
      currencyInput.value = subscription.currency || "TWD";
    }
    if (methodInput) {
      methodInput.value = subscription.method || "Credit Card";
    }
    if (noteInput) {
      noteInput.value = subscription.note || "";
    }
  } else {
    editingId = null;
    modalTitle.textContent = "新增訂閱";
    modalSubmitButton.textContent = "新增訂閱";
    if (platformInput) {
      platformInput.value = "";
    }
    if (billingInput) {
      billingInput.value = "monthly";
    }
    if (amountInput) {
      amountInput.value = "";
    }
    if (currencyInput) {
      currencyInput.value = "TWD";
    }
    if (methodInput) {
      methodInput.value = "Credit Card";
    }
    if (noteInput) {
      noteInput.value = "";
    }
  }

  if (startDateInput) {
    if (!startDateInput.value) {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      startDateInput.value = `${today.getFullYear()}-${month}-${day}`;
    }
  }

  subscriptionModal.classList.add("is-open");
  subscriptionModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  if (!subscriptionModal) {
    return;
  }

  subscriptionModal.classList.remove("is-open");
  subscriptionModal.setAttribute("aria-hidden", "true");
  editingId = null;
}

function setupPaymentModal() {
  if (!paymentModal || !paymentForm || !addPaymentButton) {
    return;
  }

  const closeButtons = paymentModal.querySelectorAll("[data-payment-close]");
  closeButtons.forEach((button) => {
    button.addEventListener("click", closePaymentModal);
  });

  addPaymentButton.addEventListener("click", () => openPaymentModal());
  paymentForm.addEventListener("submit", handlePaymentSubmit);

  const fields = getPaymentFormFields();
  if (fields.subscriptionSelect) {
    fields.subscriptionSelect.addEventListener("change", () => {
      const selected = subscriptions.find((item) => item.id === fields.subscriptionSelect.value);
      applySubscriptionDefaults(selected, fields, false);
    });
  }
}

function openPaymentModal(payment) {
  if (!paymentModal || !paymentForm || !paymentModalTitle || !paymentSubmitButton) {
    return;
  }

  paymentForm.reset();

  const fields = getPaymentFormFields();
  const existing = payment || null;

  if (existing) {
    editingPaymentId = existing.id;
    paymentModalTitle.textContent = "編輯付款";
    paymentSubmitButton.textContent = "更新付款";
    populatePaymentSubscriptions(existing.subscriptionId, existing.platform);
    if (fields.dateInput) {
      fields.dateInput.value = existing.date || "";
    }
    if (fields.amountInput) {
      fields.amountInput.value = existing.amount || "";
    }
    if (fields.currencyInput) {
      fields.currencyInput.value = existing.currency || "TWD";
    }
    if (fields.methodInput) {
      fields.methodInput.value = existing.method || "Credit Card";
    }
    if (fields.noteInput) {
      fields.noteInput.value = existing.note || "";
    }
  } else {
    editingPaymentId = null;
    paymentModalTitle.textContent = "新增付款";
    paymentSubmitButton.textContent = "新增付款";
    populatePaymentSubscriptions("", "");
    const selected = subscriptions.find(
      (item) => fields.subscriptionSelect && item.id === fields.subscriptionSelect.value
    );
    applySubscriptionDefaults(selected, fields, true);
    if (fields.dateInput && !fields.dateInput.value) {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      fields.dateInput.value = `${today.getFullYear()}-${month}-${day}`;
    }
  }

  paymentModal.classList.add("is-open");
  paymentModal.setAttribute("aria-hidden", "false");
}

function closePaymentModal() {
  if (!paymentModal) {
    return;
  }

  paymentModal.classList.remove("is-open");
  paymentModal.setAttribute("aria-hidden", "true");
  editingPaymentId = null;
}

function handlePaymentSubmit(event) {
  event.preventDefault();
  const fields = getPaymentFormFields();
  if (!fields.subscriptionSelect) {
    return;
  }

  const subscriptionId = fields.subscriptionSelect.value;
  const subscription = subscriptions.find((item) => item.id === subscriptionId);
  const existing = editingPaymentId
    ? paymentHistory.find((item) => item.id === editingPaymentId)
    : null;
  const platformName = subscription ? subscription.platform : existing ? existing.platform : "";

  const newPayment = {
    id: editingPaymentId || generateId("pay"),
    subscriptionId,
    platform: platformName,
    date: fields.dateInput ? fields.dateInput.value : "",
    amount: Number(fields.amountInput ? fields.amountInput.value : 0),
    currency: fields.currencyInput ? fields.currencyInput.value : "TWD",
    method: fields.methodInput ? fields.methodInput.value : "Credit Card",
    note: fields.noteInput ? fields.noteInput.value.trim() : ""
  };

  if (editingPaymentId) {
    const index = paymentHistory.findIndex((item) => item.id === editingPaymentId);
    if (index !== -1) {
      paymentHistory[index] = newPayment;
    } else {
      paymentHistory.unshift(newPayment);
    }
  } else {
    paymentHistory.unshift(newPayment);
  }

  savePaymentHistory();
  refreshData();
  closePaymentModal();
}

function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(subscriptionForm);
  const currency = formData.get("currency");
  const amount = Number(formData.get("amount") || 0);

  const newSubscription = {
    id: editingId || generateId("sub"),
    platform: String(formData.get("platform") || "").trim(),
    billing: formData.get("billing") || "monthly",
    startDate: formData.get("startDate") || "",
    amount,
    currency: currency || "TWD",
    method: formData.get("method") || "Credit Card",
    note: String(formData.get("note") || "").trim()
  };

  if (editingId) {
    const index = subscriptions.findIndex((item) => item.id === editingId);
    if (index !== -1) {
      subscriptions[index] = newSubscription;
    } else {
      subscriptions.unshift(newSubscription);
    }

    paymentHistory = paymentHistory.map((payment) => {
      if (payment.subscriptionId === editingId) {
        return {
          ...payment,
          platform: newSubscription.platform
        };
      }
      return payment;
    });
    savePaymentHistory();
  } else {
    subscriptions.unshift(newSubscription);
  }

  saveSubscriptions();
  refreshData();
  closeModal();
}
