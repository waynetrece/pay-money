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
  usdRate: 31.5,
  reminderTemplates: {
    seven: "您的訂閱即將在 7 天後扣款。請確認付款方式與金額。",
    three: "距離扣款日還有 3 天，提醒您留意帳單與餘額。",
    sameDay: "今天是扣款日，若付款失敗請儘速更新付款方式。"
  }
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
  paid: "已繳費",
  due: "今日到期",
  upcoming: "即將到期",
  overdue: "已逾期"
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const STORAGE_KEYS = {
  subscriptions: "subpulse.subscriptions",
  payments: "subpulse.payments",
  settings: "subpulse.settings",
  notifications: "subpulse.notifications"
};

let subscriptions = loadSubscriptions(defaultSubscriptions);
let paymentHistory = loadPaymentHistory(defaultPaymentHistory);
let settings = loadSettings();
let notificationLog = loadNotificationLog();

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
const exportButton = document.getElementById("exportData");
const importButton = document.getElementById("importData");
const reminderButton = document.getElementById("showReminderTemplates");
const viewAllPaymentsButton = document.getElementById("viewAllPayments");
const subscriptionModal = document.getElementById("subscriptionModal");
const subscriptionForm = document.getElementById("subscriptionForm");
const modalTitle = document.getElementById("modalTitle");
const modalSubmitButton = subscriptionForm
  ? subscriptionForm.querySelector('button[type="submit"]')
  : null;
const paymentModal = document.getElementById("paymentModal");
const reminderModal = document.getElementById("reminderModal");
const reminderTemplateInputs = reminderModal
  ? reminderModal.querySelectorAll("[data-template-key]")
  : [];
const saveTemplatesButton = document.getElementById("saveTemplates");
const paymentForm = document.getElementById("paymentForm");
const paymentModalTitle = document.getElementById("paymentModalTitle");
const paymentSubmitButton = paymentForm
  ? paymentForm.querySelector('button[type="submit"]')
  : null;
const importModal = document.getElementById("importModal");
const importForm = document.getElementById("importForm");
const importPreview = document.getElementById("importPreview");
const importMeta = document.getElementById("importMeta");
const importHint = document.getElementById("importHint");
const previewImportButton = document.getElementById("previewImport");
const confirmImportButton = document.getElementById("confirmImport");
const importTypeSelect = importForm ? importForm.querySelector('select[name="importType"]') : null;
const importFileInput = importForm ? importForm.querySelector('input[name="importFile"]') : null;
const importTextInput = importForm ? importForm.querySelector('textarea[name="importText"]') : null;
const notificationLogList = document.getElementById("notificationLog");
const dailyTimeInput = document.getElementById("dailyTime");
const recipientEmailInput = document.getElementById("recipientEmail");
const usdRateInput = document.getElementById("usdRate");
const saveSettingsButton = document.getElementById("saveSettings");

let activeFilter = "all";
let computedSubscriptions = [];
let editingId = null;
let editingPaymentId = null;
let pendingImport = null;

refreshData();
setupFilter();
setupTheme();
setupNavigation();
setupModal();
setupPaymentModal();
setupPaymentActions();
setupReminderModal();
setupExport();
setupImport();
setupViewAllPayments();
setupSettings();
setupRowActions();
setupAlertActions();

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseDate(value) {
  const parts = value.split("-").map((item) => Number(item));
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function normalizeDateInput(value) {
  if (!value) {
    return "";
  }
  const cleaned = String(value).trim();
  if (!cleaned) {
    return "";
  }
  const parts = cleaned.split(/[-/.]/).map((item) => item.trim());
  if (parts.length !== 3) {
    return "";
  }
  const [year, month, day] = parts;
  const yearNum = Number(year);
  const monthNum = Number(month);
  const dayNum = Number(day);
  if (!yearNum || !monthNum || !dayNum) {
    return "";
  }
  const safeMonth = String(monthNum).padStart(2, "0");
  const safeDay = String(dayNum).padStart(2, "0");
  return `${yearNum}-${safeMonth}-${safeDay}`;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value) {
  const normalized = normalizeDateInput(value);
  if (!normalized) {
    return value || "-";
  }
  return formatDate(parseDate(normalized));
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(date)} ${hours}:${minutes}`;
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
  const note = originalDay > lastDay ? `原始日: ${originalDay}` : "";
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
    return `逾期 ${Math.abs(days)} 天`;
  }
  if (days === 0) {
    return "今天到期";
  }
  return `還有 ${days} 天`;
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

function normalizeHeaderKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;
  const source = String(text || "").replace(/^\uFEFF/, "");

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(current);
      if (row.some((cell) => String(cell).trim() !== "")) {
        rows.push(row);
      }
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length || row.length) {
    row.push(current);
    if (row.some((cell) => String(cell).trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function normalizeAmount(value) {
  if (value === null || value === undefined) {
    return 0;
  }
  const cleaned = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "")
    .trim();
  const numberValue = Number(cleaned);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeBilling(value) {
  const text = normalizeKey(value);
  if (text.includes("year") || text.includes("年")) {
    return "yearly";
  }
  if (text.includes("month") || text.includes("月")) {
    return "monthly";
  }
  return "monthly";
}

function normalizeCurrency(value) {
  const text = normalizeKey(value);
  if (text.includes("usd")) {
    return "USD";
  }
  return "TWD";
}

function normalizeMethod(value) {
  const text = String(value || "").trim();
  const lower = text.toLowerCase();
  if (!text) {
    return "Credit Card";
  }
  if (lower.includes("apple")) {
    return "Apple Pay";
  }
  if (lower.includes("google")) {
    return "Google Pay";
  }
  if (lower.includes("debit") || text.includes("金融")) {
    return "Debit Card";
  }
  if (lower.includes("bank") || text.includes("轉帳")) {
    return "Bank Transfer";
  }
  if (lower.includes("cash") || text.includes("現金")) {
    return "Cash";
  }
  if (lower.includes("credit") || text.includes("信用")) {
    return "Credit Card";
  }
  return text;
}

function normalizeSubscriptionRecord(raw) {
  if (!raw) {
    return null;
  }
  const platform = String(raw.platform || "").trim();
  const startDate = normalizeDateInput(raw.startDate || "");
  if (!platform || !startDate) {
    return null;
  }
  const billing = normalizeBilling(raw.billing || "");
  return {
    platform,
    billing,
    startDate,
    amount: normalizeAmount(raw.amount),
    currency: normalizeCurrency(raw.currency),
    method: normalizeMethod(raw.method),
    note: String(raw.note || "").trim()
  };
}

function normalizePaymentRecord(raw) {
  if (!raw) {
    return null;
  }
  const platform = String(raw.platform || "").trim();
  const date = normalizeDateInput(raw.date || "");
  if (!platform || !date) {
    return null;
  }
  return {
    platform,
    date,
    amount: normalizeAmount(raw.amount),
    currency: normalizeCurrency(raw.currency),
    method: normalizeMethod(raw.method),
    note: String(raw.note || "").trim()
  };
}

function buildSubscriptionKey(item) {
  return normalizeKey(item.platform);
}

function buildPaymentKey(item) {
  if (!item.platform || !item.date) {
    return "";
  }
  return `${normalizeKey(item.platform)}|${normalizeDateInput(item.date)}`;
}

function areSubscriptionsEqual(a, b) {
  return (
    normalizeKey(a.platform) === normalizeKey(b.platform) &&
    normalizeKey(a.billing) === normalizeKey(b.billing) &&
    normalizeDateInput(a.startDate) === normalizeDateInput(b.startDate) &&
    Number(a.amount || 0) === Number(b.amount || 0) &&
    normalizeCurrency(a.currency) === normalizeCurrency(b.currency) &&
    normalizeMethod(a.method) === normalizeMethod(b.method) &&
    String(a.note || "").trim() === String(b.note || "").trim()
  );
}

function arePaymentsEqual(a, b) {
  return (
    normalizeKey(a.platform) === normalizeKey(b.platform) &&
    normalizeDateInput(a.date) === normalizeDateInput(b.date) &&
    Number(a.amount || 0) === Number(b.amount || 0) &&
    normalizeCurrency(a.currency) === normalizeCurrency(b.currency) &&
    normalizeMethod(a.method) === normalizeMethod(b.method) &&
    String(a.note || "").trim() === String(b.note || "").trim()
  );
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

function loadNotificationLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.notifications);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Failed to load notification log", error);
  }
  return [];
}

function saveNotificationLog() {
  try {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notificationLog));
  } catch (error) {
    console.warn("Failed to save notification log", error);
  }
}

function getReminderTemplates() {
  return settings.reminderTemplates || defaultSettings.reminderTemplates;
}

function fillReminderTemplates() {
  if (!reminderTemplateInputs.length) {
    return;
  }

  const templates = getReminderTemplates();
  reminderTemplateInputs.forEach((input) => {
    const key = input.dataset.templateKey;
    if (!key) {
      return;
    }
    input.value = templates[key] || "";
  });
}

function saveReminderTemplates() {
  if (!reminderTemplateInputs.length) {
    return;
  }

  const templates = {};
  reminderTemplateInputs.forEach((input) => {
    const key = input.dataset.templateKey;
    if (!key) {
      return;
    }
    templates[key] = input.value.trim();
  });
  settings = {
    ...settings,
    reminderTemplates: {
      ...defaultSettings.reminderTemplates,
      ...templates
    }
  };
  saveSettings();
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
  let manualStatusChanged = false;
  computedSubscriptions = subscriptions
    .map((subscription) => {
      const { next, last, note, start } = computeNextCharge(subscription, today);
      const cycleKey = formatIsoDate(next);
      let manualStatus = subscription.manualStatus || "";
      if (manualStatus) {
        if (subscription.manualStatusCycle && subscription.manualStatusCycle !== cycleKey) {
          subscription.manualStatus = "";
          subscription.manualStatusCycle = "";
          manualStatus = "";
          manualStatusChanged = true;
        } else if (!subscription.manualStatusCycle) {
          subscription.manualStatusCycle = cycleKey;
          manualStatusChanged = true;
        }
      }
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

      if (manualStatus === "paid" || manualStatus === "overdue") {
        status = manualStatus;
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
        status,
        manualStatus
      };
    })
    .sort((a, b) => a.nextCharge - b.nextCharge);

  if (manualStatusChanged) {
    saveSubscriptions();
  }

  renderSummary(computedSubscriptions);
  renderTable(computedSubscriptions);
  renderAlerts(computedSubscriptions);
  renderNotificationLog();
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
      const statusValue = item.status || "upcoming";
      const statusText = statusLabels[statusValue] || statusLabels.upcoming;
      const statusClass = `status ${statusValue}`;
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
          <div class="status-cell">
            <span class="${statusClass}">${escapeHtml(statusText)}</span>
            <div class="status-toggle" role="group" aria-label="付款狀態">
              <button class="status-toggle-button ${item.manualStatus === "paid" ? "is-active" : ""}" type="button" data-action="set-status" data-status="paid" data-id="${escapeHtml(
                item.id
              )}" aria-pressed="${item.manualStatus === "paid"}">已繳</button>
              <button class="status-toggle-button ${item.manualStatus === "overdue" ? "is-active" : ""}" type="button" data-action="set-status" data-status="overdue" data-id="${escapeHtml(
                item.id
              )}" aria-pressed="${item.manualStatus === "overdue"}">已過</button>
            </div>
          </div>
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
  const queueItems = alertItems.filter((item) => !isAlertLogged(buildAlertKey(item)));

  if (!queueItems.length) {
    alertsList.innerHTML = `
      <div class="alert-item">
        <div class="alert-title">佇列已清空</div>
        <div class="alert-sub">目前沒有需要寄送的提醒。</div>
      </div>
    `;
    return;
  }

  const showActions = document.body.dataset.view === "notifications";

  alertsList.innerHTML = queueItems
    .map((item) => {
      let amountLine = formatCurrency(item.amount, item.currency);
      if (item.currency === "USD" && item.exchangeRateUsed) {
        amountLine = `${amountLine} • ≈ ${formatTwd(item.amountTwd)}`;
      }
      const alertKey = buildAlertKey(item);
      const actionButtons = showActions
        ? `
          <div class="alert-actions">
            <button class="action-button small" type="button" data-action="mark-sent" data-id="${escapeHtml(
              item.id
            )}" data-key="${escapeHtml(alertKey)}" data-days="${item.daysUntil}" data-charge="${formatIsoDate(
              item.nextCharge
            )}">已寄送</button>
            <button class="action-button small" type="button" data-action="reschedule" data-id="${escapeHtml(
              item.id
            )}" data-key="${escapeHtml(alertKey)}" data-days="${item.daysUntil}" data-charge="${formatIsoDate(
              item.nextCharge
            )}">重新排程</button>
          </div>
        `
        : "";
      return `
        <div class="alert-item">
          <div class="alert-title">${escapeHtml(item.platform)}</div>
          <div class="alert-sub">${escapeHtml(item.billingLabel)} billing • Next charge ${item.nextChargeText}</div>
          <div class="alert-meta">
            <span>${item.daysUntilText}</span>
            <span>${amountLine}</span>
            <span>${escapeHtml(item.method)}</span>
          </div>
          ${actionButtons}
        </div>
      `;
    })
    .join("");
}

function buildAlertKey(item) {
  const idPart = item.id || item.platform || "unknown";
  const chargeKey = item.nextCharge ? formatIsoDate(item.nextCharge) : item.nextChargeText || "";
  return `${idPart}|${chargeKey}|${item.daysUntil}`;
}

function isAlertLogged(key) {
  return notificationLog.some((entry) => entry.key === key);
}

function renderNotificationLog() {
  if (!notificationLogList) {
    return;
  }

  if (!notificationLog.length) {
    notificationLogList.innerHTML = `
      <div class="log-item">
        <div class="log-title">尚無通知紀錄</div>
        <div class="log-sub">標記寄送後會顯示在這裡。</div>
      </div>
    `;
    return;
  }

  const sorted = [...notificationLog].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  notificationLogList.innerHTML = sorted
    .map((entry) => {
      const label = entry.daysUntil === 0 ? "當天提醒" : `${entry.daysUntil} 天提醒`;
      const statusLabel = entry.status === "rescheduled" ? "已重新排程" : "已寄送";
      const timeLine =
        entry.status === "rescheduled"
          ? `改排 ${formatDisplayDate(entry.scheduledFor)}`
          : `寄送時間 ${formatDateTime(entry.sentAt)}`;
      const amountLine = formatCurrency(entry.amount || 0, entry.currency || "TWD");
      const nextChargeText = formatDisplayDate(entry.nextCharge);
      return `
        <div class="log-item">
          <div class="log-title">${escapeHtml(entry.platform)} • ${label}</div>
          <div class="log-sub">扣款日 ${escapeHtml(nextChargeText)} • ${escapeHtml(entry.method || "-")}</div>
          <div class="log-meta">
            <span>${statusLabel}</span>
            <span>${timeLine}</span>
            <span>${amountLine}</span>
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
        <div class="history-title">尚無付款記錄</div>
        <div class="history-sub">新增付款後會顯示在這裡。</div>
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

function setupAlertActions() {
  if (!alertsList) {
    return;
  }

  alertsList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const action = button.dataset.action;
    const id = button.dataset.id;
    const daysUntil = Number(button.dataset.days || 0);
    const chargeDate = button.dataset.charge || "";
    const alertKey = button.dataset.key || buildAlertKey(target);
    const target = computedSubscriptions.find((item) => item.id === id);

    if (!target) {
      return;
    }

    if (isAlertLogged(alertKey)) {
      return;
    }

    if (action === "mark-sent") {
      notificationLog.unshift({
        id: generateId("log"),
        key: alertKey,
        subscriptionId: target.id,
        platform: target.platform,
        billing: target.billing,
        daysUntil,
        nextCharge: chargeDate,
        amount: target.amount,
        currency: target.currency,
        method: target.method,
        status: "sent",
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      saveNotificationLog();
      refreshData();
      return;
    }

    if (action === "reschedule") {
      const suggested = formatIsoDate(addDays(new Date(), 1));
      const input = window.prompt("重新排程日期 (YYYY-MM-DD)", suggested);
      if (!input) {
        return;
      }
      const normalized = normalizeDateInput(input);
      if (!normalized) {
        window.alert("日期格式不正確，請使用 YYYY-MM-DD。");
        return;
      }
      notificationLog.unshift({
        id: generateId("log"),
        key: alertKey,
        subscriptionId: target.id,
        platform: target.platform,
        billing: target.billing,
        daysUntil,
        nextCharge: chargeDate,
        amount: target.amount,
        currency: target.currency,
        method: target.method,
        status: "rescheduled",
        scheduledFor: normalized,
        createdAt: new Date().toISOString()
      });
      saveNotificationLog();
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

    if (action === "set-status") {
      const nextStatus = button.dataset.status;
      if (nextStatus === "paid" || nextStatus === "overdue") {
        const { next } = computeNextCharge(target, startOfDay(new Date()));
        target.manualStatus = nextStatus;
        target.manualStatusCycle = formatIsoDate(next);
        saveSubscriptions();
        refreshData();
      }
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

function applySettingsToInputs() {
  if (!dailyTimeInput || !recipientEmailInput || !usdRateInput) {
    return;
  }

  dailyTimeInput.value = settings.dailyTime || defaultSettings.dailyTime;
  recipientEmailInput.value = settings.recipientEmail || defaultSettings.recipientEmail;
  usdRateInput.value = settings.usdRate || "";
}

function setupSettings() {
  if (!dailyTimeInput || !recipientEmailInput || !usdRateInput || !saveSettingsButton) {
    return;
  }

  applySettingsToInputs();

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
      const section = item.dataset.section || "overview";
      setView(section);
    });
  });

  const initialView = document.body.dataset.view || "overview";
  setView(initialView);
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
  updateNavActive(view);
  renderAlerts(computedSubscriptions);
  renderNotificationLog();
}

function updateNavActive(view) {
  if (!navItems.length) {
    return;
  }

  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.section === view);
  });
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

function setupReminderModal() {
  if (!reminderModal || !reminderButton) {
    return;
  }

  const closeButtons = reminderModal.querySelectorAll("[data-reminder-close]");
  closeButtons.forEach((button) => {
    button.addEventListener("click", closeReminderModal);
  });

  reminderButton.addEventListener("click", openReminderModal);
  if (saveTemplatesButton) {
    saveTemplatesButton.addEventListener("click", () => {
      saveReminderTemplates();
    });
  }
}

function openReminderModal() {
  if (!reminderModal) {
    return;
  }
  fillReminderTemplates();
  reminderModal.classList.add("is-open");
  reminderModal.setAttribute("aria-hidden", "false");
}

function closeReminderModal() {
  if (!reminderModal) {
    return;
  }
  reminderModal.classList.remove("is-open");
  reminderModal.setAttribute("aria-hidden", "true");
}

function setupExport() {
  if (!exportButton) {
    return;
  }

  exportButton.addEventListener("click", () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      settings,
      subscriptions,
      payments: paymentHistory
    };
    const filename = `subpulse_export_${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(`${JSON.stringify(payload, null, 2)}\n`, filename, "application/json");
  });
}

function setupImport() {
  if (!importButton || !importModal || !importForm) {
    return;
  }

  const closeButtons = importModal.querySelectorAll("[data-import-close]");
  closeButtons.forEach((button) => {
    button.addEventListener("click", closeImportModal);
  });

  importButton.addEventListener("click", openImportModal);
  importForm.addEventListener("submit", handleImportSubmit);
  if (previewImportButton) {
    previewImportButton.addEventListener("click", handleImportPreview);
  }
  if (importTypeSelect) {
    importTypeSelect.addEventListener("change", () => resetImportState(false));
  }
  if (importFileInput) {
    importFileInput.addEventListener("change", () => resetImportState(false));
  }
  if (importTextInput) {
    importTextInput.addEventListener("input", () => resetImportState(false));
  }
}

function openImportModal() {
  if (!importModal) {
    return;
  }
  resetImportState(true);
  importModal.classList.add("is-open");
  importModal.setAttribute("aria-hidden", "false");
}

function closeImportModal() {
  if (!importModal) {
    return;
  }
  importModal.classList.remove("is-open");
  importModal.setAttribute("aria-hidden", "true");
}

function resetImportState(clearInputs) {
  pendingImport = null;
  if (confirmImportButton) {
    confirmImportButton.disabled = true;
  }
  if (importMeta) {
    importMeta.textContent = "尚未解析資料";
  }
  if (importPreview) {
    importPreview.innerHTML = "";
  }
  updateImportHint();
  if (clearInputs) {
    if (importFileInput) {
      importFileInput.value = "";
    }
    if (importTextInput) {
      importTextInput.value = "";
    }
  }
}

function updateImportHint() {
  if (!importHint || !importTypeSelect) {
    return;
  }
  const type = importTypeSelect.value;
  if (type === "subscriptions") {
    importHint.textContent =
      "CSV 欄位建議：platform,billing,startDate,amount,currency,method,note";
    return;
  }
  if (type === "payments") {
    importHint.textContent = "CSV 欄位建議：platform,date,amount,currency,method,note";
    return;
  }
  importHint.textContent = "JSON 支援匯出格式：{ settings, subscriptions, payments }";
}

async function handleImportPreview() {
  if (!importTypeSelect) {
    return;
  }

  try {
    const rawText = await readImportText();
    const parsed = parseImportPayload(rawText, importTypeSelect.value);
    pendingImport = parsed;
    renderImportSummary(parsed);
    if (confirmImportButton) {
      confirmImportButton.disabled = false;
    }
  } catch (error) {
    if (importMeta) {
      importMeta.textContent = error.message || "解析失敗";
    }
    if (importPreview) {
      importPreview.innerHTML = "";
    }
    if (confirmImportButton) {
      confirmImportButton.disabled = true;
    }
  }
}

async function handleImportSubmit(event) {
  event.preventDefault();
  if (!pendingImport) {
    await handleImportPreview();
  }
  if (!pendingImport) {
    return;
  }

  const result = applyImportPayload(pendingImport);
  refreshData();
  closeImportModal();
  window.alert(result);
}

function readImportText() {
  if (importFileInput && importFileInput.files && importFileInput.files[0]) {
    return readFileAsText(importFileInput.files[0]);
  }
  if (importTextInput && importTextInput.value.trim()) {
    return Promise.resolve(importTextInput.value);
  }
  return Promise.reject(new Error("尚未提供匯入資料"));
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("讀取檔案失敗"));
    reader.readAsText(file);
  });
}

function parseImportPayload(rawText, type) {
  const text = String(rawText || "").trim();
  if (!text) {
    throw new Error("尚未提供匯入資料");
  }
  const looksLikeJson = text.startsWith("{") || text.startsWith("[");
  if (looksLikeJson) {
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      throw new Error("JSON 格式錯誤");
    }
    return parseJsonImport(parsed, type);
  }
  if (type === "json") {
    throw new Error("完整 JSON 匯入僅支援 JSON 格式");
  }
  return parseCsvImport(text, type);
}

function parseCsvImport(text, type) {
  const rows = parseCsv(text);
  if (!rows.length) {
    throw new Error("CSV 無內容");
  }
  const { records, invalidCount } =
    type === "subscriptions"
      ? parseSubscriptionCsvRows(rows)
      : parsePaymentCsvRows(rows);
  const summary = buildImportSummary(type, records);
  return {
    type,
    records,
    invalidCount,
    summary
  };
}

function parseJsonImport(parsed, type) {
  const payload = parsed && typeof parsed === "object" ? parsed : {};
  if (type === "subscriptions") {
    const records = Array.isArray(parsed)
      ? parsed.map(normalizeSubscriptionRecord).filter(Boolean)
      : Array.isArray(payload.subscriptions)
      ? payload.subscriptions.map(normalizeSubscriptionRecord).filter(Boolean)
      : [];
    const summary = buildImportSummary("subscriptions", records);
    return { type: "subscriptions", records, invalidCount: 0, summary };
  }
  if (type === "payments") {
    const records = Array.isArray(parsed)
      ? parsed.map(normalizePaymentRecord).filter(Boolean)
      : Array.isArray(payload.payments)
      ? payload.payments.map(normalizePaymentRecord).filter(Boolean)
      : [];
    const summary = buildImportSummary("payments", records);
    return { type: "payments", records, invalidCount: 0, summary };
  }

  const subscriptionRecords = Array.isArray(payload.subscriptions)
    ? payload.subscriptions.map(normalizeSubscriptionRecord).filter(Boolean)
    : [];
  const paymentRecords = Array.isArray(payload.payments)
    ? payload.payments.map(normalizePaymentRecord).filter(Boolean)
    : [];
  const settingsPayload = payload.settings && typeof payload.settings === "object" ? payload.settings : null;
  return {
    type: "json",
    subscriptions: {
      records: subscriptionRecords,
      summary: buildImportSummary("subscriptions", subscriptionRecords)
    },
    payments: {
      records: paymentRecords,
      summary: buildImportSummary("payments", paymentRecords)
    },
    settings: settingsPayload
  };
}

function parseSubscriptionCsvRows(rows) {
  const headerMap = resolveCsvHeaderMap(rows[0]);
  if (!headerMap.platform || !headerMap.startDate) {
    throw new Error("訂閱 CSV 需要 platform 與 startDate 欄位");
  }
  const records = [];
  let invalidCount = 0;
  rows.slice(1).forEach((row) => {
    const record = mapCsvRow(row, headerMap);
    const normalized = normalizeSubscriptionRecord(record);
    if (normalized) {
      records.push(normalized);
    } else {
      invalidCount += 1;
    }
  });
  return { records, invalidCount };
}

function parsePaymentCsvRows(rows) {
  const headerMap = resolveCsvHeaderMap(rows[0]);
  if (!headerMap.platform || !headerMap.date) {
    throw new Error("付款 CSV 需要 platform 與 date 欄位");
  }
  const records = [];
  let invalidCount = 0;
  rows.slice(1).forEach((row) => {
    const record = mapCsvRow(row, headerMap);
    const normalized = normalizePaymentRecord(record);
    if (normalized) {
      records.push(normalized);
    } else {
      invalidCount += 1;
    }
  });
  return { records, invalidCount };
}

function resolveCsvHeaderMap(headers) {
  const aliasMap = {
    platform: ["platform", "平台", "平台名稱", "名稱", "service"],
    billing: ["billing", "付款型態", "型態", "cycle", "方案"],
    startDate: ["startdate", "起始日", "開始日", "start", "起始日期"],
    date: ["date", "付款日期", "日期", "扣款日", "實際扣款日"],
    amount: ["amount", "金額", "費用", "price", "cost"],
    currency: ["currency", "幣別"],
    method: ["method", "扣款方式", "付款方式", "paymentmethod"],
    note: ["note", "備註", "memo", "remark"]
  };

  const normalizedAliases = {};
  Object.keys(aliasMap).forEach((key) => {
    normalizedAliases[key] = aliasMap[key].map((value) => normalizeHeaderKey(value));
  });

  const map = {};
  headers.forEach((header, index) => {
    const normalized = normalizeHeaderKey(header);
    Object.keys(normalizedAliases).forEach((key) => {
      if (normalizedAliases[key].includes(normalized)) {
        map[key] = index;
      }
    });
  });
  return map;
}

function mapCsvRow(row, headerMap) {
  const record = {};
  Object.keys(headerMap).forEach((key) => {
    record[key] = row[headerMap[key]] ? String(row[headerMap[key]]).trim() : "";
  });
  return record;
}

function buildImportSummary(type, records) {
  const keyFn = type === "subscriptions" ? buildSubscriptionKey : buildPaymentKey;
  const compareFn = type === "subscriptions" ? areSubscriptionsEqual : arePaymentsEqual;
  const existingMap = new Map();
  const source = type === "subscriptions" ? subscriptions : paymentHistory;
  source.forEach((item) => {
    const key = keyFn(item);
    if (key) {
      existingMap.set(key, item);
    }
  });

  let added = 0;
  let updated = 0;
  let skipped = 0;
  const preview = [];

  records.forEach((record, index) => {
    const key = keyFn(record);
    let action = "略過";
    if (!key) {
      skipped += 1;
    } else {
      const existing = existingMap.get(key);
      if (!existing) {
        added += 1;
        action = "新增";
      } else if (compareFn(existing, record)) {
        skipped += 1;
        action = "略過";
      } else {
        updated += 1;
        action = "更新";
      }
    }
    if (index < 5) {
      preview.push({ record, action });
    }
  });

  return { added, updated, skipped, preview };
}

function renderImportSummary(payload) {
  if (!importMeta || !importPreview) {
    return;
  }

  if (payload.type === "json") {
    const subSummary = payload.subscriptions.summary;
    const paySummary = payload.payments.summary;
    const settingsChange = countSettingsChanges(payload.settings);
    importMeta.textContent =
      `訂閱：新增 ${subSummary.added}、更新 ${subSummary.updated}、略過 ${subSummary.skipped} | ` +
      `付款：新增 ${paySummary.added}、更新 ${paySummary.updated}、略過 ${paySummary.skipped}` +
      (settingsChange ? ` | 設定變更 ${settingsChange}` : "");
    importPreview.innerHTML =
      buildPreviewTable("訂閱預覽", subSummary.preview, "subscriptions") +
      buildPreviewTable("付款預覽", paySummary.preview, "payments");
    return;
  }

  importMeta.textContent =
    `新增 ${payload.summary.added}、更新 ${payload.summary.updated}、略過 ${payload.summary.skipped}` +
    (payload.invalidCount ? `（忽略無效 ${payload.invalidCount} 筆）` : "");
  importPreview.innerHTML = buildPreviewTable(
    payload.type === "subscriptions" ? "訂閱預覽" : "付款預覽",
    payload.summary.preview,
    payload.type
  );
}

function buildPreviewTable(title, previewRows, type) {
  if (!previewRows.length) {
    return `<div class="import-empty">${escapeHtml(title)}：沒有可預覽的資料。</div>`;
  }

  if (type === "subscriptions") {
    return `
      <table class="preview-table">
        <thead>
          <tr>
            <th>${escapeHtml(title)}</th>
            <th>型態</th>
            <th>起始日</th>
            <th>金額</th>
            <th>幣別</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${previewRows
            .map(
              (item) => `
            <tr>
              <td>${escapeHtml(item.record.platform)}</td>
              <td>${escapeHtml(billingLabels[item.record.billing] || item.record.billing)}</td>
              <td>${escapeHtml(formatDisplayDate(item.record.startDate))}</td>
              <td>${escapeHtml(String(item.record.amount))}</td>
              <td>${escapeHtml(item.record.currency)}</td>
              <td>${escapeHtml(item.action)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  return `
    <table class="preview-table">
      <thead>
        <tr>
          <th>${escapeHtml(title)}</th>
          <th>日期</th>
          <th>金額</th>
          <th>幣別</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${previewRows
          .map(
            (item) => `
          <tr>
            <td>${escapeHtml(item.record.platform)}</td>
            <td>${escapeHtml(formatDisplayDate(item.record.date))}</td>
            <td>${escapeHtml(String(item.record.amount))}</td>
            <td>${escapeHtml(item.record.currency)}</td>
            <td>${escapeHtml(item.action)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function applyImportPayload(payload) {
  let message = "匯入完成";
  if (payload.type === "subscriptions") {
    const result = mergeSubscriptions(payload.records);
    message = `訂閱匯入完成：新增 ${result.added}、更新 ${result.updated}、略過 ${result.skipped}`;
  } else if (payload.type === "payments") {
    const result = mergePayments(payload.records);
    message = `付款匯入完成：新增 ${result.added}、更新 ${result.updated}、略過 ${result.skipped}`;
  } else if (payload.type === "json") {
    const subResult = mergeSubscriptions(payload.subscriptions.records);
    const payResult = mergePayments(payload.payments.records);
    const settingsUpdated = applySettingsImport(payload.settings);
    message =
      `JSON 匯入完成：訂閱新增 ${subResult.added}/更新 ${subResult.updated}，` +
      `付款新增 ${payResult.added}/更新 ${payResult.updated}` +
      (settingsUpdated ? "，設定已更新" : "");
  }
  return message;
}

function mergeSubscriptions(records) {
  const keyMap = new Map();
  subscriptions.forEach((item) => {
    const key = buildSubscriptionKey(item);
    if (key) {
      keyMap.set(key, item);
    }
  });

  let added = 0;
  let updated = 0;
  let skipped = 0;

  records.forEach((record) => {
    const key = buildSubscriptionKey(record);
    if (!key) {
      skipped += 1;
      return;
    }
    const existing = keyMap.get(key);
    if (!existing) {
      subscriptions.unshift({
        ...record,
        id: generateId("sub"),
        manualStatus: "",
        manualStatusCycle: ""
      });
      added += 1;
      return;
    }
    if (areSubscriptionsEqual(existing, record)) {
      skipped += 1;
      return;
    }
    const index = subscriptions.findIndex((item) => item.id === existing.id);
    if (index !== -1) {
      subscriptions[index] = {
        ...existing,
        ...record
      };
    }
    updated += 1;
  });

  saveSubscriptions();
  return { added, updated, skipped };
}

function mergePayments(records) {
  const keyMap = new Map();
  paymentHistory.forEach((item) => {
    const key = buildPaymentKey(item);
    if (key) {
      keyMap.set(key, item);
    }
  });

  let added = 0;
  let updated = 0;
  let skipped = 0;

  records.forEach((record) => {
    const key = buildPaymentKey(record);
    if (!key) {
      skipped += 1;
      return;
    }
    const existing = keyMap.get(key);
    if (!existing) {
      paymentHistory.unshift({
        ...record,
        id: generateId("pay"),
        subscriptionId: resolveSubscriptionIdByPlatform(record.platform)
      });
      added += 1;
      return;
    }
    if (arePaymentsEqual(existing, record)) {
      skipped += 1;
      return;
    }
    const index = paymentHistory.findIndex((item) => item.id === existing.id);
    if (index !== -1) {
      paymentHistory[index] = {
        ...existing,
        ...record,
        subscriptionId: existing.subscriptionId || resolveSubscriptionIdByPlatform(record.platform)
      };
    }
    updated += 1;
  });

  paymentHistory = normalizePayments(paymentHistory);
  savePaymentHistory();
  return { added, updated, skipped };
}

function applySettingsImport(imported) {
  if (!imported) {
    return false;
  }
  let changed = false;
  const next = {
    ...settings
  };

  if (imported.dailyTime && imported.dailyTime !== settings.dailyTime) {
    next.dailyTime = imported.dailyTime;
    changed = true;
  }
  if (imported.recipientEmail && imported.recipientEmail !== settings.recipientEmail) {
    next.recipientEmail = imported.recipientEmail;
    changed = true;
  }
  const nextRate = Number(imported.usdRate);
  if (Number.isFinite(nextRate) && nextRate !== settings.usdRate) {
    next.usdRate = nextRate;
    changed = true;
  }
  if (imported.reminderTemplates && typeof imported.reminderTemplates === "object") {
    next.reminderTemplates = {
      ...defaultSettings.reminderTemplates,
      ...settings.reminderTemplates,
      ...imported.reminderTemplates
    };
    changed = true;
  }

  if (changed) {
    settings = next;
    saveSettings();
    applySettingsToInputs();
  }
  return changed;
}

function countSettingsChanges(imported) {
  if (!imported) {
    return 0;
  }
  let count = 0;
  if (imported.dailyTime && imported.dailyTime !== settings.dailyTime) {
    count += 1;
  }
  if (imported.recipientEmail && imported.recipientEmail !== settings.recipientEmail) {
    count += 1;
  }
  const nextRate = Number(imported.usdRate);
  if (Number.isFinite(nextRate) && nextRate !== settings.usdRate) {
    count += 1;
  }
  if (imported.reminderTemplates && typeof imported.reminderTemplates === "object") {
    count += 1;
  }
  return count;
}

function setupViewAllPayments() {
  if (!viewAllPaymentsButton) {
    return;
  }

  viewAllPaymentsButton.addEventListener("click", () => {
    setView("payments");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
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
  const existing = editingId
    ? subscriptions.find((item) => item.id === editingId)
    : null;

  const newSubscription = {
    id: editingId || generateId("sub"),
    platform: String(formData.get("platform") || "").trim(),
    billing: formData.get("billing") || "monthly",
    startDate: formData.get("startDate") || "",
    amount,
    currency: currency || "TWD",
    method: formData.get("method") || "Credit Card",
    note: String(formData.get("note") || "").trim(),
    manualStatus: existing ? existing.manualStatus : "",
    manualStatusCycle: existing ? existing.manualStatusCycle : ""
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
