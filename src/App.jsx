import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Cloud,
  CreditCard,
  LayoutDashboard,
  LineChart,
  Moon,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Sun,
  Tags,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  UserCircle2,
  Wallet,
  X,
  KeyRound,
} from "lucide-react";

const STORAGE_KEY = "sentimo_transactions_v7";
const USER_KEY = "sentimo_user_v7";
const THEME_KEY = "sentimo_theme_v5";
const FIXED_KEY = "sentimo_fixed_expenses_v6";
const CATEGORIES_KEY = "sentimo_categories_v5";
const SETTINGS_KEY = "sentimo_settings_v5";
const SESSIONS_KEY = "sentimo_trading_sessions_v4";
const PIN_KEY = "sentimo_pin_v3";
const AUTH_MODE_KEY = "sentimo_auth_mode_v3";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const demoUser = {
  id: "demo-founder-user",
  name: "Chris Holanda",
  email: "c.mail@me.com",
};

const seedCategories = [
  { id: "cat-housing", name: "Housing", color: "#64748b", subcategories: ["Rent", "Council Tax", "Repairs"] },
  { id: "cat-food", name: "Food", color: "#22c55e", subcategories: ["Groceries", "Restaurants", "Coffee"] },
  { id: "cat-utilities", name: "Utilities", color: "#14b8a6", subcategories: ["Phones", "Electricity", "Internet", "Water"] },
  { id: "cat-transport", name: "Transport", color: "#f97316", subcategories: ["Fuel", "Parking", "Train", "Taxi"] },
  { id: "cat-education", name: "Education", color: "#8b5cf6", subcategories: ["School Fees", "Activities", "Ballet"] },
  { id: "cat-business", name: "Business", color: "#3b82f6", subcategories: ["Software", "Services", "Contractors"] },
  { id: "cat-trading", name: "Trading", color: "#ec4899", subcategories: ["Deposits", "Withdrawals", "Broker Fees"] },
  { id: "cat-savings", name: "Savings / Internal", color: "#94a3b8", subcategories: ["To Savings", "From Savings"] },
];

const seedFixedExpenses = [
  { id: "fx-1", name: "Rent", category: "Housing", subcategory: "Rent", frequency: "Monthly", amount: 4500, dueDay: 1, nextDueDate: "2026-05-01", status: "Scheduled", autoIncludeTarget: true },
  { id: "fx-2", name: "Car / Insurance", category: "Transport", subcategory: "Fuel", frequency: "Monthly", amount: 425, dueDay: 12, nextDueDate: "2026-05-12", status: "Paid", autoIncludeTarget: true },
  { id: "fx-3", name: "School / Activities", category: "Education", subcategory: "School Fees", frequency: "Monthly", amount: 1250, dueDay: 15, nextDueDate: "2026-05-15", status: "Pending", autoIncludeTarget: true },
  { id: "fx-4", name: "Subscriptions", category: "Business", subcategory: "Software", frequency: "Monthly", amount: 98, dueDay: 20, nextDueDate: "2026-05-20", status: "Overdue", autoIncludeTarget: true },
];

const seedTransactions = [
  { id: "tx-1", date: "2026-04-01", description: "Monthly rent income", merchant: "Rental Income", category: "Income", subcategory: "Rental Income", direction: "income", nature: "real", status: "counted", amount: 500 },
  { id: "tx-2", date: "2026-04-23", description: "Restaurant", merchant: "Local Restaurant", category: "Food", subcategory: "Restaurants", direction: "expense", nature: "real", status: "counted", amount: 64.9 },
  { id: "tx-3", date: "2026-04-24", description: "Trading withdrawal", merchant: "Trading 212", category: "Trading", subcategory: "Withdrawals", direction: "income", nature: "broker_transfer", status: "watch", amount: 1200 },
  { id: "tx-4", date: "2026-04-25", description: "Transfer to Savings", merchant: "Savings", category: "Savings / Internal", subcategory: "To Savings", direction: "expense", nature: "savings_transfer", status: "excluded", amount: 1500 },
  { id: "tx-5", date: "2026-04-25", description: "Transfer from Savings", merchant: "Savings", category: "Savings / Internal", subcategory: "From Savings", direction: "income", nature: "savings_transfer", status: "excluded", amount: 2000 },
  { id: "tx-6", date: "2026-04-28", description: "Groceries", merchant: "Tesco", category: "Food", subcategory: "Groceries", direction: "expense", nature: "real", status: "counted", amount: 86.42 },
  { id: "tx-7", date: "2026-04-27", description: "Fuel", merchant: "Shell", category: "Transport", subcategory: "Fuel", direction: "expense", nature: "real", status: "counted", amount: 72.31 },
  { id: "tx-8", date: "2026-04-26", description: "School fees payment", merchant: "School", category: "Education", subcategory: "School Fees", direction: "expense", nature: "real", status: "counted", amount: 1250 },
];

const seedTradingSessions = [
  { id: "sess-1", date: "2026-04-24", instrument: "DAX", currency: "GBP", pnl: 380, notes: "Morning session, short from rejection area." },
  { id: "sess-2", date: "2026-04-26", instrument: "MARA", currency: "GBP", pnl: -95, notes: "Late entry, cut quickly." },
];

const defaultSettings = {
  currency: "GBP",
  variableAverageDays: 30,
  customDailyTarget: "",
};

function formatCurrency(value) {
  return gbp.format(Number(value || 0));
}

function daysInMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function toDateInput(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function monthlyEquivalent(frequency, amount) {
  const value = Number(amount || 0);
  if (frequency === "Weekly") return (value * 52) / 12;
  if (frequency === "Monthly") return value;
  if (frequency === "Quarterly") return value / 3;
  if (frequency === "Annual") return value / 12;
  return value;
}

function getThemeVars(theme) {
  if (theme === "light") {
    return {
      "--bg": "#f2f5fa",
      "--bg-secondary": "#ffffff",
      "--panel": "#ffffff",
      "--panel-2": "#f7f9fc",
      "--border": "#d8e0eb",
      "--text": "#1b2432",
      "--muted": "#6e7b91",
      "--accent": "#2f6aa3",
      "--accent-soft": "rgba(47,106,163,0.08)",
      "--success": "#10b981",
      "--danger": "#ef4444",
      "--warning": "#eab308",
      "--nav": "#2f527f",
      "--nav-active": "#446895",
      "--nav-text": "#eff4fb",
      "--nav-muted": "rgba(239,244,251,0.78)",
      "--shadow": "0 8px 20px rgba(15, 23, 42, 0.05)",
      "--hero-glow": "rgba(65, 105, 165, 0.08)",
    };
  }

  return {
    "--bg": "#142038",
    "--bg-secondary": "#18253d",
    "--panel": "#253248",
    "--panel-2": "#222f44",
    "--border": "#36465f",
    "--text": "#e8edf5",
    "--muted": "#97a5bc",
    "--accent": "#20c997",
    "--accent-soft": "rgba(32,201,151,0.10)",
    "--success": "#20c997",
    "--danger": "#ff5b57",
    "--warning": "#f59e0b",
    "--nav": "#0f182b",
    "--nav-active": "#23324a",
    "--nav-text": "#eef3fa",
    "--nav-muted": "rgba(238,243,250,0.74)",
    "--shadow": "0 10px 24px rgba(0,0,0,0.18)",
    "--hero-glow": "rgba(32, 201, 151, 0.10)",
  };
}

function injectTheme(theme) {
  const vars = getThemeVars(theme);
  Object.entries(vars).forEach(([k, v]) => {
    document.documentElement.style.setProperty(k, v);
  });
  document.documentElement.setAttribute("data-theme", theme);
}

function getCountedRealExpenses(transactions) {
  return transactions.filter(
    (t) => t.direction === "expense" && t.status === "counted" && t.nature === "real"
  );
}

function getCountedRealIncome(transactions) {
  return transactions.filter(
    (t) => t.direction === "income" && t.status === "counted" && t.nature === "real"
  );
}

function sumAmounts(rows) {
  return rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
}

function statusClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "counted" || value === "paid") return "status-green";
  if (value === "excluded" || value === "scheduled") return "status-blue";
  if (value === "watch" || value === "pending") return "status-amber";
  if (value === "overdue") return "status-red";
  return "status-gray";
}

function matchPeriod(dateStr, mode) {
  const d = new Date(dateStr);
  const now = new Date("2026-04-29T12:00:00");
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (mode === "7d") return diffDays <= 7;
  if (mode === "30d") return diffDays <= 30;
  if (mode === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (mode === "year") return d.getFullYear() === now.getFullYear();
  return true;
}

function sameDay(a, b) {
  return a === b;
}

function appStyles() {
  return `
    :root {
      color-scheme: light dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    html, body, #root { margin: 0; min-height: 100%; }
    body {
      background: var(--bg);
      color: var(--text);
      transition: background 0.2s ease, color 0.2s ease;
    }
    button, input, select, textarea { font: inherit; }
    button { cursor: pointer; }

    .app-shell {
      min-height: 100vh;
      background:
        radial-gradient(circle at top right, var(--hero-glow), transparent 24%),
        linear-gradient(180deg, var(--bg), var(--bg-secondary));
      color: var(--text);
    }

    .layout {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 194px 1fr;
    }

    .sidebar {
      background: var(--nav);
      border-right: 1px solid rgba(255,255,255,0.06);
      color: var(--nav-text);
      display: grid;
      grid-template-rows: auto auto 1fr auto;
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 16px 14px 10px;
    }

    .brand-badge {
      width: 26px;
      height: 26px;
      border-radius: 7px;
      display: grid;
      place-items: center;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.10);
      flex: 0 0 auto;
    }

    .brand-title {
      font-weight: 600;
      line-height: 1.05;
      font-size: 12px;
      color: var(--nav-text);
    }

    .brand-sub {
      font-size: 8px;
      color: var(--nav-muted);
      letter-spacing: 0.09em;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .daily-card,
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: var(--shadow);
    }

    .daily-card {
      margin: 6px 8px 8px;
      padding: 10px 12px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.10);
      box-shadow: none;
    }

    .daily-line {
      height: 4px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      overflow: hidden;
      margin: 8px 0 7px;
    }

    .daily-line span {
      display: block;
      width: 0%;
      height: 100%;
      background: var(--accent);
    }

    .sidebar-nav {
      display: grid;
      align-content: start;
      gap: 1px;
      padding: 0 6px;
    }

    .sidebar-nav button {
      width: 100%;
      border: 0;
      background: transparent;
      color: var(--nav-muted);
      text-align: left;
      padding: 11px 12px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      font-weight: 500;
      position: relative;
      z-index: 2;
    }

    .sidebar-nav button.active {
      background: var(--nav-active);
      color: var(--nav-text);
    }

    .sidebar-footer {
      padding: 8px;
    }

    .sidebar-bottom-card {
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(255,255,255,0.03);
      border-radius: 10px;
      padding: 8px;
    }

    .theme-single-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 8px;
    }

    .theme-chip {
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.05);
      color: var(--nav-text);
      border-radius: 8px;
      padding: 7px 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      font-size: 11px;
      min-height: 32px;
      font-weight: 500;
      position: relative;
      z-index: 2;
    }

    .theme-chip.active {
      outline: 1px solid var(--accent);
      background: rgba(255,255,255,0.08);
    }

    .sidebar-userrow {
      display: flex;
      gap: 8px;
      align-items: center;
      padding-top: 4px;
      position: relative;
      z-index: 2;
    }

    .main {
      padding: 16px 18px;
      position: relative;
      z-index: 1;
    }

    .header {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: flex-start;
      margin-bottom: 14px;
    }

    .header .eyebrow {
      font-size: 10px;
      color: var(--muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .header h1 {
      margin: 0;
      font-size: 22px;
      line-height: 1.05;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .muted { color: var(--muted); }

    .header-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn {
      border: 1px solid var(--border);
      background: var(--panel);
      color: var(--text);
      border-radius: 10px;
      padding: 8px 11px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 11px;
      min-height: 34px;
      font-weight: 500;
      position: relative;
      z-index: 2;
    }

    .btn-primary {
      background: #eef2f7;
      color: #111827;
      border-color: #eef2f7;
    }

    .btn-soft {
      background: var(--accent-soft);
      color: var(--text);
    }

    .btn-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      padding: 0;
      justify-content: center;
      min-height: 28px;
    }

    .grid-4, .grid-3, .grid-2 {
      display: grid;
      gap: 10px;
    }
    .grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }

    .card { padding: 12px; }

    .metric-card .label {
      color: var(--muted);
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }

    .metric-card .value {
      margin-top: 7px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .metric-card .sub {
      margin-top: 4px;
      color: var(--muted);
      font-size: 10px;
      line-height: 1.35;
      font-weight: 400;
    }

    .section-title {
      margin: 0 0 5px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .section-sub {
      margin: 0 0 10px;
      color: var(--muted);
      font-size: 10px;
      line-height: 1.4;
      font-weight: 400;
    }

    .mini-tabs {
      display: inline-flex;
      gap: 5px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .mini-tabs button {
      border: 1px solid var(--border);
      background: transparent;
      color: var(--muted);
      border-radius: 8px;
      padding: 6px 9px;
      font-size: 10px;
      font-weight: 500;
    }

    .mini-tabs button.active {
      background: var(--accent-soft);
      color: var(--text);
    }

    .table-wrap {
      overflow: auto;
      border: 1px solid var(--border);
      border-radius: 12px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 10px 10px;
      border-top: 1px solid var(--border);
      text-align: left;
      vertical-align: top;
      font-size: 11px;
      font-weight: 400;
    }

    th {
      color: var(--muted);
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      background: transparent;
      border-top: 0;
      font-weight: 600;
    }

    .status-pill {
      display: inline-block;
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 9px;
      border: 1px solid transparent;
      line-height: 1.2;
      font-weight: 600;
    }

    .status-green { background: rgba(16,185,129,0.12); color: #10b981; border-color: rgba(16,185,129,0.25); }
    .status-blue { background: rgba(59,130,246,0.12); color: #60a5fa; border-color: rgba(59,130,246,0.25); }
    .status-amber { background: rgba(245,158,11,0.12); color: #f59e0b; border-color: rgba(245,158,11,0.25); }
    .status-red { background: rgba(239,68,68,0.12); color: #ff6b6b; border-color: rgba(239,68,68,0.25); }
    .status-gray { background: rgba(148,163,184,0.12); color: #94a3b8; border-color: rgba(148,163,184,0.25); }

    .progress {
      width: 100%;
      height: 6px;
      border-radius: 999px;
      overflow: hidden;
      background: var(--panel-2);
    }

    .progress span {
      display: block;
      height: 100%;
      background: var(--accent);
      border-radius: 999px;
    }

    .form-grid {
      display: grid;
      gap: 8px;
    }

    .input, select, textarea {
      width: 100%;
      border: 1px solid var(--border);
      background: var(--panel-2);
      color: var(--text);
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 11px;
      resize: vertical;
      font-weight: 400;
      position: relative;
      z-index: 2;
    }

    .split-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .empty-box {
      min-height: 140px;
      display: grid;
      place-items: center;
      text-align: center;
      color: var(--muted);
      border: 1px solid var(--border);
      border-radius: 12px;
      background: rgba(255,255,255,0.02);
      font-size: 11px;
      font-weight: 400;
    }

    .category-list {
      display: grid;
      gap: 8px;
    }

    .category-item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 11px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: rgba(255,255,255,0.02);
    }

    .category-left {
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .category-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      flex: 0 0 auto;
      margin-top: 4px;
    }

    .hero-panel { min-height: 185px; }

    .table-footer-total {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 10px 4px 0;
      font-weight: 600;
      color: var(--text);
      font-size: 11px;
    }

    .action-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
    }

    .fx-name {
      font-weight: 600;
      margin-bottom: 3px;
      font-size: 11px;
    }

    .fx-sub {
      color: var(--muted);
      font-size: 9px;
      font-weight: 400;
    }

    .fx-kicker {
      color: var(--muted);
      font-size: 9px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .compact-title {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .tcard {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      background: rgba(255,255,255,0.02);
    }

    .tcard-label {
      font-size: 9px;
      color: var(--muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 7px;
      font-weight: 500;
    }

    .tcard-value {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(3, 8, 18, 0.52);
      display: grid;
      place-items: center;
      padding: 20px;
      z-index: 60;
    }

    .modal-card {
      width: 100%;
      max-width: 500px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: 0 18px 46px rgba(0,0,0,0.28);
      padding: 16px;
    }

    .modal-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 12px;
    }

    .cover-good { color: var(--success); font-weight: 600; }
    .cover-bad { color: var(--danger); font-weight: 600; }

    .auth-wrap {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background:
        radial-gradient(circle at top right, var(--hero-glow), transparent 30%),
        linear-gradient(180deg, var(--bg), var(--bg-secondary));
    }

    .auth-card {
      width: 100%;
      max-width: 390px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: var(--shadow);
      padding: 20px;
    }

    .auth-head {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }

    .auth-logo {
      width: 34px;
      height: 34px;
      border-radius: 11px;
      display: grid;
      place-items: center;
      border: 1px solid var(--border);
      background: var(--panel-2);
    }

    .auth-title {
      font-size: 18px;
      font-weight: 600;
      line-height: 1.1;
      margin: 0;
    }

    .auth-sub {
      font-size: 9px;
      color: var(--muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .pin-dots {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin: 10px 0 18px;
    }

    .pin-dot {
      width: 12px;
      height: 12px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: transparent;
    }

    .pin-dot.filled {
      background: var(--accent);
      border-color: var(--accent);
    }

    .pin-keypad {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .pin-key {
      min-height: 42px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--panel-2);
      color: var(--text);
      font-size: 14px;
      font-weight: 600;
    }

    @media (max-width: 1200px) {
      .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 960px) {
      .layout { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      .grid-4, .grid-3, .grid-2, .split-2 { grid-template-columns: 1fr; }
      .header { flex-direction: column; }
      .header h1 { font-size: 21px; }
      .main { padding: 12px; }
    }
  `;
}

function MetricCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="card metric-card">
      <div className="label">
        <Icon size={12} />
        {label}
      </div>
      <div className="value">{value}</div>
      <div className="sub">{sub}</div>
    </div>
  );
}

function LoginScreen({ onLogin, theme }) {
  const [email, setEmail] = useState("c.mail@me.com");
  const [password, setPassword] = useState("founder-demo");

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-head">
          <div className="auth-logo">
            <LineChart size={17} />
          </div>
          <div>
            <div className="auth-title">Sentimo</div>
            <div className="auth-sub">Financial Control</div>
          </div>
        </div>

        <h2 style={{ margin: "0 0 8px", fontSize: 19, letterSpacing: "-0.02em", fontWeight: 600 }}>Sign in</h2>
        <p className="muted" style={{ marginTop: 0, fontSize: 11, lineHeight: 1.45 }}>
          Enter your email and password. After sign-in, you’ll create a PIN for faster access next time.
        </p>

        <div className="form-grid" style={{ marginTop: 12 }}>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
          <button className="btn btn-primary" onClick={() => onLogin({ ...demoUser, email })}>
            Sign in
          </button>
        </div>

        <div style={{ marginTop: 12, fontSize: 10 }} className="muted">
          Theme: {theme === "dark" ? "Dark Navy" : "Light"}
        </div>
      </div>
    </div>
  );
}

function PinSetupModal({ open, onSave }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (open) {
      setPin("");
      setConfirmPin("");
      setStep(1);
    }
  }, [open]);

  if (!open) return null;

  function press(n) {
    if (step === 1) {
      if (pin.length >= 4) return;
      const next = pin + n;
      setPin(next);
      if (next.length === 4) setStep(2);
      return;
    }
    if (confirmPin.length >= 4) return;
    setConfirmPin(confirmPin + n);
  }

  function backspace() {
    if (step === 1) setPin((s) => s.slice(0, -1));
    else setConfirmPin((s) => s.slice(0, -1));
  }

  const ready = pin.length === 4 && confirmPin.length === 4;
  const match = ready && pin === confirmPin;

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 410 }}>
        <div className="modal-head">
          <div>
            <div className="fx-kicker">Quick access</div>
            <h3 className="section-title" style={{ fontSize: 17, marginBottom: 4 }}>Create PIN</h3>
            <div className="section-sub" style={{ marginBottom: 0 }}>
              Use a 4-digit PIN for faster future access.
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 11, marginBottom: 4 }}>
          {step === 1 ? "Enter new PIN" : "Confirm PIN"}
        </div>

        <div className="pin-dots">
          {[0, 1, 2, 3].map((i) => {
            const active = step === 1 ? pin.length > i : confirmPin.length > i;
            return <div key={i} className={`pin-dot ${active ? "filled" : ""}`} />;
          })}
        </div>

        {ready && !match && (
          <div style={{ color: "var(--danger)", textAlign: "center", fontSize: 11, marginBottom: 10 }}>
            PINs do not match. Press clear and try again.
          </div>
        )}

        <div className="pin-keypad">
          {["1","2","3","4","5","6","7","8","9"].map((n) => (
            <button key={n} className="pin-key" onClick={() => press(n)}>{n}</button>
          ))}
          <button className="pin-key" onClick={() => { setPin(""); setConfirmPin(""); setStep(1); }}>Clear</button>
          <button className="pin-key" onClick={() => press("0")}>0</button>
          <button className="pin-key" onClick={backspace}>⌫</button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button className="btn btn-primary" disabled={!match} style={{ opacity: match ? 1 : 0.45 }} onClick={() => match && onSave(pin)}>
            Save PIN
          </button>
        </div>
      </div>
    </div>
  );
}

function PinUnlockScreen({ onUnlock, onUsePassword }) {
  const [pin, setPin] = useState("");
  const savedPin = localStorage.getItem(PIN_KEY) || "";

  function press(n) {
    if (pin.length >= 4) return;
    const next = pin + n;
    setPin(next);
    if (next.length === 4) {
      if (next === savedPin) setTimeout(() => onUnlock(), 120);
      else setTimeout(() => setPin(""), 200);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 350 }}>
        <div className="auth-head">
          <div className="auth-logo">
            <KeyRound size={17} />
          </div>
          <div>
            <div className="auth-title">Quick PIN Access</div>
            <div className="auth-sub">Sentimo</div>
          </div>
        </div>

        <p className="muted" style={{ marginTop: 0, fontSize: 11, lineHeight: 1.45 }}>
          Enter your PIN to unlock quickly.
        </p>

        <div className="pin-dots">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`pin-dot ${pin.length > i ? "filled" : ""}`} />
          ))}
        </div>

        <div className="pin-keypad">
          {["1","2","3","4","5","6","7","8","9"].map((n) => (
            <button key={n} className="pin-key" onClick={() => press(n)}>{n}</button>
          ))}
          <button className="pin-key" onClick={() => setPin("")}>Clear</button>
          <button className="pin-key" onClick={() => press("0")}>0</button>
          <button className="pin-key" onClick={() => setPin((s) => s.slice(0, -1))}>⌫</button>
        </div>

        <button className="btn" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} onClick={onUsePassword}>
          Sign in with email instead
        </button>
      </div>
    </div>
  );
}

function Sidebar({ activePage, setActivePage, user, theme, setTheme }) {
  const nav = [
    [LayoutDashboard, "Dashboard"],
    [LineChart, "Trading P&L"],
    [CreditCard, "Fixed Expenses"],
    [Wallet, "Daily Expenses"],
    [ArrowDownToLine, "Income & Deposits"],
    [Target, "Daily Target"],
    [BarChart3, "Analytics"],
    [CalendarDays, "Overall"],
    [Tags, "Categories"],
    [Shield, "Rules"],
    [Upload, "Import CSV"],
    [Settings, "Settings"],
    [Shield, "Admin Panel"],
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-badge">
          <LineChart size={14} />
        </div>
        <div>
          <div className="brand-title">Sentimo</div>
          <div className="brand-sub">Expense Tracker</div>
        </div>
      </div>

      <div className="daily-card">
        <div className="brand-sub" style={{ marginBottom: 8 }}>Daily Target</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--nav-text)" }}>0%</div>
        <div className="daily-line"><span /></div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--nav-muted)", fontSize: 9 }}>
          <span>Spent £0</span>
          <span>£151 left</span>
        </div>
      </div>

      <div className="sidebar-nav">
        {nav.map(([Icon, label]) => (
          <button
            key={label}
            className={activePage === label ? "active" : ""}
            onClick={() => setActivePage(label)}
            type="button"
          >
            <Icon size={13} />
            <span style={{ flex: 1 }}>{label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-bottom-card">
          <div className="theme-single-row">
            <button className={`theme-chip ${theme === "dark" ? "active" : ""}`} onClick={() => setTheme("dark")} type="button">
              <Moon size={10} />
              Dark
            </button>
            <button className={`theme-chip ${theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")} type="button">
              <Sun size={10} />
              Light
            </button>
          </div>

          <div className="sidebar-userrow">
            <UserCircle2 size={17} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{user.name}</div>
              <div style={{ fontSize: 9, color: "var(--nav-muted)" }}>{user.email}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function DashboardPage({ transactions, fixedExpenses }) {
  const realIncome = sumAmounts(getCountedRealIncome(transactions));
  const realExpenses = sumAmounts(getCountedRealExpenses(transactions));
  const net = realIncome - realExpenses;
  const internalTotal = sumAmounts(
    transactions.filter((t) => t.nature === "internal_transfer" || t.nature === "savings_transfer")
  );
  const fixedMonthly = fixedExpenses
    .filter((f) => f.status !== "Archived")
    .reduce((sum, item) => sum + monthlyEquivalent(item.frequency, item.amount), 0);

  const categoryRows = useMemo(() => {
    const map = new Map();
    getCountedRealExpenses(transactions).forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + Number(t.amount));
    });
    return Array.from(map.entries()).map(([name, amount]) => ({ name, amount }));
  }, [transactions]);

  return (
    <>
      <div className="grid-4">
        <MetricCard icon={ArrowDownToLine} label="This Month" value={formatCurrency(realIncome)} sub="Real income" />
        <MetricCard icon={ArrowUpFromLine} label="This Month" value={formatCurrency(realExpenses)} sub="Real expenses" />
        <MetricCard icon={LineChart} label="This Year" value={formatCurrency(net)} sub="Net position" />
        <MetricCard icon={Target} label="30D Var Avg" value={formatCurrency(realExpenses / 30 || 0)} sub="Rolling average" />
      </div>

      <div className="grid-3" style={{ marginTop: 10 }}>
        <div className="card hero-panel" style={{ gridColumn: "span 2" }}>
          <h3 className="section-title">Category Budget Tracker</h3>
          <p className="section-sub">Past month vs current budget performance.</p>

          {categoryRows.length === 0 ? (
            <div className="empty-box">No spending data yet.</div>
          ) : (
            <div className="form-grid">
              {categoryRows.map((row) => {
                const budget = Math.max(row.amount * 1.25, row.amount);
                const pct = Math.min(100, Math.round((row.amount / budget) * 100));
                return (
                  <div key={row.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 11 }}>{row.name}</div>
                        <div className="muted" style={{ fontSize: 9 }}>Budget {formatCurrency(budget)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600, fontSize: 11 }}>{formatCurrency(row.amount)}</div>
                        <div className="muted" style={{ fontSize: 9 }}>{pct}% used</div>
                      </div>
                    </div>
                    <div className="progress"><span style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="section-title">Fixed Obligations</h3>
          <p className="section-sub">Current recurring burden.</p>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{formatCurrency(fixedMonthly)}</div>
          <div className="muted" style={{ fontSize: 11 }}>/ month</div>

          <div className="grid-2" style={{ marginTop: 12 }}>
            <div>
              <div className="muted" style={{ fontSize: 9 }}>Weekly</div>
              <div style={{ fontWeight: 600, fontSize: 11 }}>{formatCurrency(fixedMonthly / 4.333)}</div>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 9 }}>Daily</div>
              <div style={{ fontWeight: 600, fontSize: 11 }}>{formatCurrency(fixedMonthly / 30)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: 10 }}>
        <div className="card">
          <h3 className="section-title">Monthly Net Position</h3>
          <p className="section-sub">Income received minus total expenses this month.</p>
          <div style={{ fontSize: 21, fontWeight: 600, color: net >= 0 ? "var(--success)" : "var(--danger)" }}>
            {net >= 0 ? "+" : ""}{formatCurrency(net)}
          </div>
          <div className="muted" style={{ marginTop: 5, fontSize: 10 }}>
            {formatCurrency(realIncome)} in · {formatCurrency(realExpenses)} out
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Savings / Internal</h3>
          <p className="section-sub">Tracked but excluded from real totals.</p>
          <div style={{ fontSize: 21, fontWeight: 600 }}>{formatCurrency(internalTotal)}</div>
        </div>

        <div className="card">
          <h3 className="section-title">Recent Income</h3>
          <p className="section-sub">Latest counted inflows.</p>
          <div className="form-grid">
            {getCountedRealIncome(transactions).slice(0, 3).map((t) => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 11 }}>
                <span>{t.description}</span>
                <strong style={{ fontWeight: 600 }}>{formatCurrency(t.amount)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function FixedExpensesPage({ fixedExpenses, setFixedExpenses }) {
  const [tab, setTab] = useState("All");
  const [draft, setDraft] = useState({
    name: "",
    category: "Housing",
    subcategory: "Rent",
    frequency: "Monthly",
    amount: "",
    dueDay: "",
  });

  const monthlyTotal = fixedExpenses
    .filter((x) => x.status !== "Paid" && x.status !== "Archived")
    .reduce((sum, x) => sum + monthlyEquivalent(x.frequency, x.amount), 0);

  const weeklyEquiv = monthlyTotal / 4.333;
  const pendingRows = fixedExpenses.filter((x) => x.status === "Pending");
  const overdueRows = fixedExpenses.filter((x) => x.status === "Overdue");
  const scheduledRows = fixedExpenses.filter((x) => x.status === "Scheduled");
  const paidRows = fixedExpenses.filter((x) => x.status === "Paid");

  const pendingValue = pendingRows.reduce((sum, x) => sum + monthlyEquivalent(x.frequency, x.amount), 0);
  const overdueValue = overdueRows.reduce((sum, x) => sum + monthlyEquivalent(x.frequency, x.amount), 0);

  const visible = fixedExpenses.filter((x) => {
    if (tab === "All") return true;
    return x.status === tab;
  });

  const activeMonthlyTotal = fixedExpenses
    .filter((x) => x.status !== "Archived" && x.status !== "Paid")
    .reduce((sum, x) => sum + monthlyEquivalent(x.frequency, x.amount), 0);

  function addExpense() {
    if (!draft.name || !draft.amount) return;
    setFixedExpenses([
      {
        id: `fx-${Date.now()}`,
        name: draft.name,
        category: draft.category,
        subcategory: draft.subcategory,
        frequency: draft.frequency,
        amount: Number(draft.amount),
        dueDay: Number(draft.dueDay || 1),
        nextDueDate: "",
        status: "Scheduled",
        autoIncludeTarget: true,
      },
      ...fixedExpenses,
    ]);
    setDraft({
      name: "",
      category: "Housing",
      subcategory: "Rent",
      frequency: "Monthly",
      amount: "",
      dueDay: "",
    });
  }

  function cycleStatus(id) {
    const order = ["Scheduled", "Pending", "Paid", "Overdue"];
    setFixedExpenses((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const currentIndex = order.indexOf(item.status);
        const next = order[(currentIndex + 1) % order.length];
        return { ...item, status: next };
      })
    );
  }

  return (
    <>
      <div className="header-actions" style={{ justifyContent: "flex-end", marginBottom: 10 }}>
        <button className="btn btn-primary" onClick={addExpense} type="button">
          <Plus size={12} />
          Add Expense
        </button>
      </div>

      <div className="grid-4">
        <MetricCard icon={CreditCard} label="Monthly Total" value={formatCurrency(monthlyTotal)} sub="Excl. paid" />
        <MetricCard icon={CalendarDays} label="Weekly Equiv." value={formatCurrency(weeklyEquiv)} sub="Recurring burden" />
        <MetricCard icon={Clock3} label="Pending" value={formatCurrency(pendingValue)} sub={`${pendingRows.length} item${pendingRows.length === 1 ? "" : "s"}`} />
        <MetricCard icon={Target} label="Overdue" value={formatCurrency(overdueValue)} sub={`${overdueRows.length} item${overdueRows.length === 1 ? "" : "s"}`} />
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <div className="mini-tabs">
          {[
            { label: "All", count: fixedExpenses.length },
            { label: "Pending", count: pendingRows.length },
            { label: "Overdue", count: overdueRows.length },
            { label: "Scheduled", count: scheduledRows.length },
            { label: "Paid", count: paidRows.length },
          ].map((item) => (
            <button
              key={item.label}
              className={tab === item.label ? "active" : ""}
              onClick={() => setTab(item.label)}
              type="button"
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Category</th>
                <th>Frequency</th>
                <th>Amount</th>
                <th>Monthly Eq.</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="fx-name">{item.name}</div>
                    <div className="fx-sub">{item.subcategory}</div>
                  </td>
                  <td>
                    <span className={`status-pill ${statusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.frequency}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(monthlyEquivalent(item.frequency, item.amount))}</td>
                  <td>
                    <div>{item.nextDueDate || `Day ${item.dueDay}`}</div>
                    <div className="fx-sub">{item.status === "Paid" ? "Completed" : "Upcoming"}</div>
                  </td>
                  <td>
                    <div className="action-row">
                      <button className="btn btn-icon" title="Cycle status" onClick={() => cycleStatus(item.id)} type="button">
                        {item.status === "Paid" ? <Check size={11} /> : <Clock3 size={11} />}
                      </button>
                      <button className="btn btn-icon" title="Edit" type="button">
                        <Pencil size={11} />
                      </button>
                      <button className="btn btn-icon" title="Delete" onClick={() => setFixedExpenses((prev) => prev.filter((x) => x.id !== item.id))} type="button">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <div className="empty-box" style={{ minHeight: 100 }}>
                      No fixed expenses in this status.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer-total">
          <span>Active Total</span>
          <span>{formatCurrency(activeMonthlyTotal)} / mo</span>
        </div>
      </div>
    </>
  );
}

function DailyExpensesPage({ transactions, setTransactions, categories }) {
  const [period, setPeriod] = useState("30d");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [draft, setDraft] = useState({
    date: toDateInput(new Date("2026-04-29")),
    description: "",
    merchant: "",
    category: "Food",
    subcategory: "Groceries",
    amount: "",
  });

  const expenseRows = getCountedRealExpenses(transactions).filter((t) => {
    const periodMatch = matchPeriod(t.date, period);
    const categoryMatch = categoryFilter === "All categories" ? true : t.category === categoryFilter;
    return periodMatch && categoryMatch;
  });

  const total = sumAmounts(expenseRows);
  const transactionsCount = expenseRows.length;
  const dailyAvg = total / (period === "7d" ? 7 : period === "30d" ? 30 : 30);

  function addExpense() {
    if (!draft.description || !draft.amount) return;
    setTransactions([
      {
        id: `tx-${Date.now()}`,
        date: draft.date,
        description: draft.description,
        merchant: draft.merchant || draft.description,
        category: draft.category,
        subcategory: draft.subcategory,
        direction: "expense",
        nature: "real",
        status: "counted",
        amount: Number(draft.amount),
      },
      ...transactions,
    ]);
    setDraft({
      date: toDateInput(new Date("2026-04-29")),
      description: "",
      merchant: "",
      category: "Food",
      subcategory: "Groceries",
      amount: "",
    });
  }

  return (
    <>
      <div className="header-actions" style={{ justifyContent: "flex-end", marginBottom: 10 }}>
        <button className="btn" type="button">
          <Plus size={12} />
          Log Multiple
        </button>
        <button className="btn btn-primary" onClick={addExpense} type="button">
          <Plus size={12} />
          Add Single
        </button>
      </div>

      <div className="card">
        <div className="mini-tabs">
          <button className={period === "7d" ? "active" : ""} onClick={() => setPeriod("7d")} type="button">7 Days</button>
          <button className={period === "30d" ? "active" : ""} onClick={() => setPeriod("30d")} type="button">30 Days</button>
          <button className={period === "month" ? "active" : ""} onClick={() => setPeriod("month")} type="button">This Month</button>
          <button type="button">This Year</button>
        </div>

        <div className="split-2" style={{ marginBottom: 10 }}>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option>All categories</option>
            {categories.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid-3">
          <MetricCard icon={Wallet} label="Period Total" value={formatCurrency(total)} sub="Selected period" />
          <MetricCard icon={BarChart3} label="Transactions" value={String(transactionsCount)} sub="Entries" />
          <MetricCard icon={TrendingUp} label="Daily Average" value={formatCurrency(dailyAvg)} sub="Rolling average" />
        </div>

        <div style={{ marginTop: 10 }}>
          {expenseRows.length === 0 ? (
            <div className="empty-box">
              <div>
                <div style={{ marginBottom: 10 }}>No expenses in this period</div>
                <button className="btn btn-primary" onClick={addExpense} type="button">Log Expense</button>
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Merchant</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Sub-category</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.date}</td>
                      <td>{row.merchant}</td>
                      <td>{row.description}</td>
                      <td>{row.category}</td>
                      <td>{row.subcategory}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(row.amount)}</td>
                      <td>
                        <button className="btn btn-icon" onClick={() => setTransactions((prev) => prev.filter((x) => x.id !== row.id))} type="button">
                          <Trash2 size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function IncomeDepositsPage({ transactions, setTransactions }) {
  const [draft, setDraft] = useState({
    date: "2026-04-29",
    source: "Trading Income",
    description: "",
    amount: "",
  });

  const rows = getCountedRealIncome(transactions);
  const totalReceived = sumAmounts(rows);
  const totalSpentMonth = sumAmounts(getCountedRealExpenses(transactions).filter((t) => matchPeriod(t.date, "month")));
  const net = totalReceived - totalSpentMonth;

  const bySource = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      const key = r.subcategory || "Other";
      map.set(key, (map.get(key) || 0) + Number(r.amount));
    });
    return Array.from(map.entries()).map(([name, amount]) => ({ name, amount }));
  }, [rows]);

  function addIncome() {
    if (!draft.description || !draft.amount) return;
    setTransactions([
      {
        id: `tx-${Date.now()}`,
        date: draft.date,
        description: draft.description,
        merchant: draft.source,
        category: "Income",
        subcategory: draft.source,
        direction: "income",
        nature: "real",
        status: "counted",
        amount: Number(draft.amount),
      },
      ...transactions,
    ]);
    setDraft({
      date: "2026-04-29",
      source: "Trading Income",
      description: "",
      amount: "",
    });
  }

  return (
    <>
      <div className="header-actions" style={{ justifyContent: "flex-end", marginBottom: 10 }}>
        <button className="btn" type="button">
          <Plus size={12} />
          Log Multiple
        </button>
        <button className="btn btn-primary" onClick={addIncome} type="button">
          <Plus size={12} />
          Add Single
        </button>
      </div>

      <div className="grid-3">
        <MetricCard icon={ArrowDownToLine} label="Total Received" value={formatCurrency(totalReceived)} sub="In selected period" />
        <MetricCard icon={ArrowUpFromLine} label="Total Spent (Month)" value={formatCurrency(totalSpentMonth)} sub="Variable expenses this month" />
        <MetricCard icon={LineChart} label="Net Position" value={`${net >= 0 ? "+" : ""}${formatCurrency(net)}`} sub="Received minus spent" />
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h3 className="section-title">Income by Source</h3>
        <div className="grid-2">
          {bySource.map((item) => {
            const pct = totalReceived > 0 ? Math.round((item.amount / totalReceived) * 100) : 0;
            return (
              <div key={item.name} className="card" style={{ padding: 10 }}>
                <div className="muted" style={{ fontSize: 9 }}>{item.name}</div>
                <div style={{ marginTop: 6, fontWeight: 600, fontSize: 17 }}>{formatCurrency(item.amount)}</div>
                <div className="progress" style={{ marginTop: 8 }}><span style={{ width: `${pct}%` }} /></div>
                <div className="muted" style={{ marginTop: 5, fontSize: 9 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h3 className="section-title">Entries</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Running Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, index) => {
                const running = rows.slice(0, index + 1).reduce((s, x) => s + Number(x.amount), 0);
                return (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td><span className="status-pill status-blue">{r.subcategory}</span></td>
                    <td>{r.description}</td>
                    <td style={{ fontWeight: 600 }}>+{formatCurrency(r.amount)}</td>
                    <td>{formatCurrency(running)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function TradingPnlModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    date: "2026-04-29",
    currency: "GBP",
    instrument: "",
    pnl: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        date: "2026-04-29",
        currency: "GBP",
        instrument: "",
        pnl: "",
        notes: "",
      });
    }
  }, [open]);

  if (!open) return null;

  function submit() {
    if (form.pnl === "") return;
    onSave({
      id: `sess-${Date.now()}`,
      date: form.date,
      currency: form.currency,
      instrument: form.instrument || "General",
      pnl: Number(form.pnl),
      notes: form.notes,
    });
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <div className="fx-kicker">Today — 29 Apr 2026</div>
            <h3 className="section-title" style={{ fontSize: 16, marginBottom: 4 }}>Log Trading Session</h3>
            <div className="section-sub" style={{ marginBottom: 0 }}>
              Record manual daily performance and compare it against your expenses.
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose} type="button">
            <X size={12} />
          </button>
        </div>

        <div className="form-grid">
          <div className="split-2">
            <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              <option>GBP</option>
              <option>EUR</option>
              <option>USD</option>
            </select>
          </div>

          <input className="input" placeholder="Instrument (optional) e.g. EURUSD, DAX, Gold, BTC" value={form.instrument} onChange={(e) => setForm({ ...form, instrument: e.target.value })} />
          <input className="input" placeholder="P&L amount e.g. 450 or -120" type="number" value={form.pnl} onChange={(e) => setForm({ ...form, pnl: e.target.value })} />
          <textarea className="input" rows="3" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
          <button className="btn" onClick={onClose} type="button">Cancel</button>
          <button className="btn btn-primary" onClick={submit} type="button">Log Session</button>
        </div>
      </div>
    </div>
  );
}

function TradingPnLPage({ transactions, sessions, setSessions }) {
  const [isOpen, setIsOpen] = useState(false);

  const today = "2026-04-29";
  const todaySessions = sessions.filter((s) => sameDay(s.date, today));
  const todayTrading = todaySessions.reduce((sum, s) => sum + Number(s.pnl || 0), 0);
  const todayExpenses = getCountedRealExpenses(transactions)
    .filter((t) => sameDay(t.date, today))
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const todayNet = todayTrading - todayExpenses;

  const last60 = useMemo(() => {
    return [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 60);
  }, [sessions]);

  function saveSession(session) {
    setSessions((prev) => [session, ...prev]);
  }

  return (
    <>
      <div className="header-actions" style={{ justifyContent: "flex-end", marginBottom: 10 }}>
        <button className="btn btn-primary" onClick={() => setIsOpen(true)} type="button">
          <Plus size={12} />
          Log Session
        </button>
      </div>

      <div className="card">
        <div className="fx-kicker">Today — 29 Apr 2026</div>
        <h2 className="compact-title">Daily Performance</h2>
        <p className="section-sub" style={{ marginTop: 5 }}>
          Daily performance vs expenses — did trading cover the day?
        </p>

        <div className="grid-3" style={{ marginTop: 10 }}>
          <div className="tcard">
            <div className="tcard-label">Trading P&L</div>
            <div className="tcard-value" style={{ color: todayTrading >= 0 ? "var(--success)" : "var(--danger)" }}>
              {todayTrading >= 0 ? "+" : ""}{formatCurrency(todayTrading)}
            </div>
          </div>
          <div className="tcard">
            <div className="tcard-label">Expenses</div>
            <div className="tcard-value" style={{ color: "var(--warning)" }}>
              {formatCurrency(todayExpenses)}
            </div>
          </div>
          <div className="tcard">
            <div className="tcard-label">Net</div>
            <div className="tcard-value" style={{ color: todayNet >= 0 ? "var(--success)" : "var(--danger)" }}>
              {todayNet >= 0 ? "+" : ""}{formatCurrency(todayNet)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 11 }}>
          {todaySessions.length === 0 && todayExpenses === 0 && (
            <span className="muted">No trading sessions or expenses logged today.</span>
          )}
          {(todaySessions.length > 0 || todayExpenses > 0) && (
            <span className={todayNet >= 0 ? "cover-good" : "cover-bad"}>
              {todayNet >= 0 ? "Trading covered the day." : "Trading did not cover the day yet."}
            </span>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <div className="fx-kicker">Day-by-day comparison — last 60 days</div>
        {last60.length === 0 ? (
          <div className="empty-box">
            <div>
              <div style={{ marginBottom: 10 }}>No trading sessions yet</div>
              <button className="btn btn-primary" onClick={() => setIsOpen(true)} type="button">
                Log Trading Session
              </button>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Instrument</th>
                  <th>Currency</th>
                  <th>P&L</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {last60.map((session) => (
                  <tr key={session.id}>
                    <td>{session.date}</td>
                    <td>{session.instrument}</td>
                    <td>{session.currency}</td>
                    <td style={{ fontWeight: 600, color: session.pnl >= 0 ? "var(--success)" : "var(--danger)" }}>
                      {session.pnl >= 0 ? "+" : ""}{formatCurrency(session.pnl)}
                    </td>
                    <td className="muted">{session.notes || "—"}</td>
                    <td>
                      <button className="btn btn-icon" onClick={() => setSessions((prev) => prev.filter((x) => x.id !== session.id))} type="button">
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TradingPnlModal open={isOpen} onClose={() => setIsOpen(false)} onSave={saveSession} />
    </>
  );
}

function DailyTargetPage({ transactions, fixedExpenses, settings }) {
  const fixedMonthly = fixedExpenses
    .filter((f) => f.autoIncludeTarget && f.status !== "Archived")
    .reduce((sum, item) => sum + monthlyEquivalent(item.frequency, item.amount), 0);

  const variableExpenses = getCountedRealExpenses(transactions).filter((t) => matchPeriod(t.date, "30d"));
  const variableAvg = sumAmounts(variableExpenses) / Number(settings.variableAverageDays || 30);
  const autoTarget = fixedMonthly / daysInMonth(new Date("2026-04-29")) + variableAvg;
  const target = settings.customDailyTarget ? Number(settings.customDailyTarget) : autoTarget;
  const todaySpent = sumAmounts(getCountedRealExpenses(transactions).filter((t) => t.date === "2026-04-29"));
  const remaining = target - todaySpent;
  const pct = target > 0 ? Math.max(0, Math.min(100, Math.round((todaySpent / target) * 100))) : 0;

  return (
    <>
      <div className="grid-2">
        <div className="card">
          <div className="eyebrow muted">Wed, 29 Apr 2026 · Daily Target</div>
          <h3 className="section-title" style={{ fontSize: 13 }}>Daily Target</h3>

          <div style={{ display: "grid", placeItems: "center", padding: "14px 0" }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                border: "9px solid var(--panel-2)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 30, fontWeight: 600 }}>{pct}%</div>
                <div className="muted" style={{ fontSize: 10 }}>of target</div>
              </div>
            </div>
          </div>

          <div className="grid-3">
            <div>
              <div className="muted" style={{ fontSize: 9 }}>Today Spent</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(todaySpent)}</div>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 9 }}>Target</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(target)}</div>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 9 }}>Remaining</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: remaining >= 0 ? "var(--success)" : "var(--danger)" }}>
                {formatCurrency(remaining)}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Daily Withdrawal Target</h3>
          <div style={{ fontSize: 28, fontWeight: 600 }}>
            {formatCurrency(target)} <span className="muted" style={{ fontSize: 13 }}>/ day</span>
          </div>
          <p className="section-sub">Auto-calculated from fixed monthly obligations plus variable rolling average.</p>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 8 }}>
            <div style={{ color: "var(--muted)", marginBottom: 8, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Target Composition
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
              <span className="muted">Fixed expenses (daily equiv.)</span>
              <strong style={{ fontWeight: 600 }}>{formatCurrency(fixedMonthly / daysInMonth(new Date("2026-04-29")))}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
              <span className="muted">Variable avg (rolling)</span>
              <strong style={{ fontWeight: 600 }}>{formatCurrency(variableAvg)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontWeight: 600, fontSize: 11 }}>
              <span>Daily target</span>
              <span>{formatCurrency(target)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <h3 className="section-title">Daily Spend vs Target</h3>
        <p className="section-sub">7d / 14d / 30d / 60d graph block reserved for next build step.</p>
        <div className="empty-box">Chart area placeholder</div>
      </div>
    </>
  );
}

function AnalyticsPage({ transactions, fixedExpenses, settings }) {
  const spend30 = getCountedRealExpenses(transactions).filter((t) => matchPeriod(t.date, "30d"));
  const totalSpend = sumAmounts(spend30);
  const categories = [...new Set(spend30.map((x) => x.category))];
  const dailyAvg = totalSpend / 30;
  const fixedMonthly = fixedExpenses
    .filter((f) => f.autoIncludeTarget && f.status !== "Archived")
    .reduce((sum, item) => sum + monthlyEquivalent(item.frequency, item.amount), 0);
  const dailyTarget = settings.customDailyTarget
    ? Number(settings.customDailyTarget)
    : fixedMonthly / daysInMonth(new Date("2026-04-29")) + dailyAvg;

  return (
    <>
      <div className="mini-tabs">
        <button type="button">Last 7 Days</button>
        <button className="active" type="button">Last 30 Days</button>
        <button type="button">This Month</button>
        <button type="button">This Year</button>
      </div>

      <div className="grid-4">
        <MetricCard icon={ArrowUpFromLine} label="Total Spend" value={formatCurrency(totalSpend)} sub="Last 30 days" />
        <MetricCard icon={Tags} label="Categories" value={String(categories.length)} sub="Used in period" />
        <MetricCard icon={TrendingUp} label="Daily Avg" value={formatCurrency(dailyAvg)} sub="Rolling" />
        <MetricCard icon={Target} label="Daily Target" value={formatCurrency(dailyTarget)} sub="Budget pressure" />
      </div>

      <div className="grid-2" style={{ marginTop: 10 }}>
        <div className="card">
          <h3 className="section-title">Spend by Category</h3>
          <div className="empty-box">No data for this period</div>
        </div>
        <div className="card">
          <h3 className="section-title">Category Breakdown</h3>
          <div className="empty-box">No data for this period</div>
        </div>
      </div>
    </>
  );
}

function OverallPage({ transactions, fixedExpenses }) {
  const thisMonthIncome = sumAmounts(getCountedRealIncome(transactions).filter((t) => matchPeriod(t.date, "month")));
  const thisMonthExpenses = sumAmounts(getCountedRealExpenses(transactions).filter((t) => matchPeriod(t.date, "month")));
  const previousMonthIncome = thisMonthIncome * 0.8;
  const previousMonthExpenses = thisMonthExpenses * 1.1;
  const budgetMonth = fixedExpenses.reduce((sum, item) => sum + monthlyEquivalent(item.frequency, item.amount), 0) + 1000;

  return (
    <>
      <div className="mini-tabs">
        <button type="button">Week</button>
        <button className="active" type="button">Month</button>
        <button type="button">Year</button>
        <button type="button">Budget</button>
      </div>

      <div className="grid-3">
        <div className="card">
          <h3 className="section-title">This Month</h3>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
              <span className="muted">Income</span>
              <strong style={{ fontWeight: 600 }}>{formatCurrency(thisMonthIncome)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
              <span className="muted">Expenses</span>
              <strong style={{ fontWeight: 600 }}>{formatCurrency(thisMonthExpenses)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 11 }}>
              <span>Net</span>
              <strong>{formatCurrency(thisMonthIncome - thisMonthExpenses)}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Previous Month</h3>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
              <span className="muted">Income</span>
              <strong style={{ fontWeight: 600 }}>{formatCurrency(previousMonthIncome)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
              <span className="muted">Expenses</span>
              <strong style={{ fontWeight: 600 }}>{formatCurrency(previousMonthExpenses)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 11 }}>
              <span>Net</span>
              <strong>{formatCurrency(previousMonthIncome - previousMonthExpenses)}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Budget Month</h3>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
              <span className="muted">Budgeted Expenses</span>
              <strong style={{ fontWeight: 600 }}>{formatCurrency(budgetMonth)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
              <span className="muted">Target Income</span>
              <strong style={{ fontWeight: 600 }}>{formatCurrency(budgetMonth)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 11 }}>
              <span>Target Net</span>
              <strong>{formatCurrency(0)}</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CategoriesPage({ categories, setCategories }) {
  const [draft, setDraft] = useState({
    name: "",
    color: "#64748b",
    subcategories: "",
  });

  function addCategory() {
    if (!draft.name.trim()) return;

    const parsedSubs = draft.subcategories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setCategories((prev) => [
      ...prev,
      {
        id: `cat-${Date.now()}`,
        name: draft.name.trim(),
        color: draft.color || "#64748b",
        subcategories: parsedSubs,
      },
    ]);

    setDraft({
      name: "",
      color: "#64748b",
      subcategories: "",
    });
  }

  return (
    <>
      <div className="header-actions" style={{ justifyContent: "flex-end", marginBottom: 10 }}>
        <button className="btn" type="button">
          <Plus size={12} />
          Seed Keywords
        </button>
        <button className="btn btn-primary" onClick={addCategory} type="button">
          <Plus size={12} />
          New Category
        </button>
      </div>

      <div className="card" style={{ marginBottom: 10 }}>
        <h3 className="section-title">Add Category</h3>
        <p className="section-sub">Add a main category and optional sub-categories separated by commas.</p>

        <div className="split-2">
          <input
            className="input"
            placeholder="Category name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <input
            className="input"
            placeholder="#64748b"
            value={draft.color}
            onChange={(e) => setDraft({ ...draft, color: e.target.value })}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <input
            className="input"
            placeholder="Sub-categories e.g. Rent, Council Tax, Repairs"
            value={draft.subcategories}
            onChange={(e) => setDraft({ ...draft, subcategories: e.target.value })}
          />
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Categories</h3>
        <p className="section-sub">Main categories and visible sub-categories for transaction classification.</p>

        <div className="category-list">
          {categories.map((category) => (
            <div className="category-item" key={category.id}>
              <div className="category-left">
                <span className="category-dot" style={{ background: category.color }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 11 }}>{category.name}</div>
                  <div className="muted" style={{ fontSize: 9, marginTop: 3 }}>
                    {category.subcategories.length ? category.subcategories.join(" · ") : "No sub-categories yet"}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-icon"
                onClick={() => setCategories((prev) => prev.filter((c) => c.id !== category.id))}
                title="Delete category"
                type="button"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SettingsPage({ theme, setTheme, settings, setSettings, fixedExpenses }) {
  const fixedMonthly = fixedExpenses.reduce((sum, item) => sum + monthlyEquivalent(item.frequency, item.amount), 0);
  const autoTarget = fixedMonthly / 30;

  return (
    <>
      <div className="card" style={{ maxWidth: 760 }}>
        <h3 className="section-title">Settings</h3>

        <div className="card" style={{ marginTop: 10 }}>
          <div className="brand-sub" style={{ marginBottom: 8 }}>Currency Settings</div>
          <div className="split-2">
            <div>
              <div className="muted" style={{ marginBottom: 6, fontSize: 9 }}>Base Currency</div>
              <select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
                <option>GBP</option>
                <option>EUR</option>
                <option>USD</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 10 }}>
          <div className="brand-sub" style={{ marginBottom: 8 }}>Theme</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`btn ${theme === "dark" ? "btn-soft" : ""}`} onClick={() => setTheme("dark")} type="button">
              <Moon size={11} />
              Dark
            </button>
            <button className={`btn ${theme === "light" ? "btn-soft" : ""}`} onClick={() => setTheme("light")} type="button">
              <Sun size={11} />
              Light
            </button>
          </div>
        </div>

        <div className="card" style={{ marginTop: 10 }}>
          <div className="brand-sub" style={{ marginBottom: 8 }}>Daily Target Settings</div>
          <div className="grid-2" style={{ marginBottom: 10 }}>
            <div className="card" style={{ padding: 10 }}>
              <div className="muted" style={{ fontSize: 9 }}>Auto-calculated target</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{formatCurrency(autoTarget)}</div>
              <div className="muted" style={{ fontSize: 10 }}>Fixed daily + variable avg</div>
            </div>
            <div className="card" style={{ padding: 10 }}>
              <div className="muted" style={{ fontSize: 9 }}>Fixed monthly total</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--danger)" }}>{formatCurrency(fixedMonthly)}</div>
              <div className="muted" style={{ fontSize: 10 }}>All active fixed expenses</div>
            </div>
          </div>

          <div className="form-grid">
            <div>
              <div className="muted" style={{ fontSize: 9, marginBottom: 6 }}>Daily Target Override</div>
              <input
                className="input"
                value={settings.customDailyTarget}
                onChange={(e) => setSettings({ ...settings, customDailyTarget: e.target.value })}
                placeholder="150.83"
              />
            </div>

            <div>
              <div className="muted" style={{ fontSize: 9, marginBottom: 6 }}>Variable Average Window (Days)</div>
              <input
                className="input"
                type="number"
                value={settings.variableAverageDays}
                onChange={(e) => setSettings({ ...settings, variableAverageDays: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 12 }} type="button">
          <Save size={12} />
          Save Settings
        </button>
      </div>
    </>
  );
}

function AdminPanelPage({ user }) {
  return (
    <>
      <div className="grid-4">
        <MetricCard icon={UserCircle2} label="All Users" value="1" sub="Registered" />
        <MetricCard icon={CheckCircle2} label="Active" value="0" sub="Paid licences" />
        <MetricCard icon={Target} label="On Trial" value="0" sub="Trial period" />
        <MetricCard icon={TrendingUp} label="New This Month" value="1" sub="Signups" />
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>Users</h3>
          <button className="btn" type="button">
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Licence</th>
                <th>Last Active</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className="status-pill status-gray">admin</span></td>
                <td><span className="status-pill status-gray">No licence</span></td>
                <td>29 Apr 2026</td>
                <td>09 Apr 2026</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button className="btn" type="button">Licence</button>
                  <button className="btn" type="button">Demote</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ImportCsvPage() {
  const inputRef = useRef(null);

  return (
    <div className="card">
      <h3 className="section-title">Import CSV</h3>
      <p className="section-sub">Upload bank statements and categorise transactions automatically.</p>
      <div className="empty-box" onClick={() => inputRef.current?.click()} style={{ cursor: "pointer" }}>
        <div>
          <Upload size={20} style={{ marginBottom: 8 }} />
          <div>Drop or select your CSV statement</div>
        </div>
        <input ref={inputRef} type="file" accept=".csv" style={{ display: "none" }} />
      </div>
    </div>
  );
}

function RulesPage() {
  return (
    <div className="card">
      <h3 className="section-title">Rules</h3>
      <p className="section-sub">Keyword-based auto-categorisation rules will be managed here.</p>
      <div className="empty-box">Rules engine placeholder</div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [activePage, setActivePage] = useState("Dashboard");
  const [transactions, setTransactions] = useState(seedTransactions);
  const [fixedExpenses, setFixedExpenses] = useState(seedFixedExpenses);
  const [categories, setCategories] = useState(seedCategories);
  const [settings, setSettings] = useState(defaultSettings);
  const [sessions, setSessions] = useState(seedTradingSessions);
  const [needsPinSetup, setNeedsPinSetup] = useState(false);
  const [authView, setAuthView] = useState("pin_or_password");

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.setAttribute("data-sentimo-styles", "true");
    styleTag.innerHTML = appStyles();
    document.head.appendChild(styleTag);
    return () => styleTag.remove();
  }, []);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      const savedTheme = localStorage.getItem(THEME_KEY);
      const savedTransactions = localStorage.getItem(STORAGE_KEY);
      const savedFixed = localStorage.getItem(FIXED_KEY);
      const savedCategories = localStorage.getItem(CATEGORIES_KEY);
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      const savedSessions = localStorage.getItem(SESSIONS_KEY);
      const pin = localStorage.getItem(PIN_KEY);
      const authMode = localStorage.getItem(AUTH_MODE_KEY);

      if (savedTheme) setTheme(savedTheme);
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedFixed) setFixedExpenses(JSON.parse(savedFixed));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      if (savedSessions) setSessions(JSON.parse(savedSessions));

      if (savedUser) {
        if (pin && authMode !== "password") setAuthView("pin");
        else setAuthView("password");
        setUser(JSON.parse(savedUser));
      } else {
        setAuthView("password");
      }
    } catch {
      setAuthView("password");
    }
  }, []);

  useEffect(() => {
    injectTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem(FIXED_KEY, JSON.stringify(fixedExpenses)), [fixedExpenses]);
  useEffect(() => localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)), [sessions]);

  function handlePasswordLogin(nextUser) {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    const existingPin = localStorage.getItem(PIN_KEY);
    if (!existingPin) setNeedsPinSetup(true);
    else localStorage.setItem(AUTH_MODE_KEY, "pin");
  }

  function handlePinSaved(pin) {
    localStorage.setItem(PIN_KEY, pin);
    localStorage.setItem(AUTH_MODE_KEY, "pin");
    setNeedsPinSetup(false);
  }

  function usePasswordInstead() {
    setUser(null);
    setAuthView("password");
    localStorage.setItem(AUTH_MODE_KEY, "password");
  }

  const storedPin = typeof window !== "undefined" ? localStorage.getItem(PIN_KEY) : null;

  if (authView === "pin" && storedPin) {
    return <PinUnlockScreen onUnlock={() => setAuthView("app")} onUsePassword={usePasswordInstead} />;
  }

  if (!user) {
    return <LoginScreen onLogin={handlePasswordLogin} theme={theme} />;
  }

  return (
    <div className="app-shell">
      <div className="layout">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          user={user}
          theme={theme}
          setTheme={setTheme}
        />

        <main className="main">
          <div className="header">
            <div>
              <div className="eyebrow">
                {activePage === "Daily Target"
                  ? "Wed, 29 Apr 2026 · Daily Target"
                  : activePage === "Analytics"
                  ? "Spending Intelligence"
                  : activePage === "Categories"
                  ? "Expense Classification"
                  : activePage === "Admin Panel"
                  ? "Platform Overview — Sentimo"
                  : activePage}
              </div>
              <h1>{activePage}</h1>
              <p className="muted" style={{ marginTop: 6, maxWidth: 900, fontSize: 11, lineHeight: 1.45, fontWeight: 400 }}>
                {activePage === "Income & Deposits" && "All money received — trading draws, commissions, dividends, and more."}
                {activePage === "Fixed Expenses" && "Recurring obligations and structured monthly commitments."}
                {activePage === "Daily Expenses" && "Day-to-day spending control with category and period filters."}
                {activePage === "Daily Target" && "How much you can spend today — or need to earn — to stay on track."}
                {activePage === "Analytics" && "Budgeting and spending intelligence across categories and periods."}
                {activePage === "Overall" && "Compare this period, previous period, and target budget side by side."}
                {activePage === "Categories" && "Categories, sub-categories, and keyword-ready classification logic."}
                {activePage === "Dashboard" && "Control panel for spending, income, fixed obligations, and overall position."}
                {activePage === "Trading P&L" && "Daily performance vs expenses — did trading cover the day?"}
                {activePage === "Settings" && "Portal configuration, target settings, and theme selection."}
                {activePage === "Admin Panel" && "Future licence and user-management layer for commercial rollout."}
                {activePage === "Import CSV" && "Import bank statements and classify transactions."}
                {activePage === "Rules" && "Define how descriptions and merchants are categorised automatically."}
              </p>
            </div>

            <div className="header-actions">
              <button className="btn" type="button">
                <Cloud size={12} />
                Cloud Connected
              </button>
            </div>
          </div>

          {activePage === "Dashboard" && <DashboardPage transactions={transactions} fixedExpenses={fixedExpenses} />}
          {activePage === "Trading P&L" && <TradingPnLPage transactions={transactions} sessions={sessions} setSessions={setSessions} />}
          {activePage === "Fixed Expenses" && <FixedExpensesPage fixedExpenses={fixedExpenses} setFixedExpenses={setFixedExpenses} />}
          {activePage === "Daily Expenses" && <DailyExpensesPage transactions={transactions} setTransactions={setTransactions} categories={categories} />}
          {activePage === "Income & Deposits" && <IncomeDepositsPage transactions={transactions} setTransactions={setTransactions} />}
          {activePage === "Daily Target" && <DailyTargetPage transactions={transactions} fixedExpenses={fixedExpenses} settings={settings} />}
          {activePage === "Analytics" && <AnalyticsPage transactions={transactions} fixedExpenses={fixedExpenses} settings={settings} />}
          {activePage === "Overall" && <OverallPage transactions={transactions} fixedExpenses={fixedExpenses} />}
          {activePage === "Categories" && <CategoriesPage categories={categories} setCategories={setCategories} />}
          {activePage === "Import CSV" && <ImportCsvPage />}
          {activePage === "Rules" && <RulesPage />}
          {activePage === "Settings" && <SettingsPage theme={theme} setTheme={setTheme} settings={settings} setSettings={setSettings} fixedExpenses={fixedExpenses} />}
          {activePage === "Admin Panel" && <AdminPanelPage user={user} />}
        </main>
      </div>

      <PinSetupModal open={needsPinSetup} onSave={handlePinSaved} />
    </div>
  );
}
