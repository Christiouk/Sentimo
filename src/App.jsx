import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Cloud,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  LineChart,
  LogOut,
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
} from "lucide-react";

const STORAGE_KEY = "sentimo_transactions_v14";
const USER_KEY = "sentimo_user_v14";
const THEME_KEY = "sentimo_theme_v12";
const FIXED_KEY = "sentimo_fixed_expenses_v13";
const CATEGORIES_KEY = "sentimo_categories_v12";
const SETTINGS_KEY = "sentimo_settings_v12";
const SESSIONS_KEY = "sentimo_trading_sessions_v11";
const PIN_KEY = "sentimo_pin_v10";
const AUTH_MODE_KEY = "sentimo_auth_mode_v10";
const PRIORITY_KEY = "sentimo_priority_payments_v2";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const TODAY = "2026-04-29";

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

const seedPriorityPayments = [
  {
    id: "pp-1",
    title: "Trip with Lewis",
    amount: 500,
    dueDate: "2026-04-30",
    priority: "High",
    type: "Payment",
    status: "Open",
    note: "Need to make money trading or separate £500 before travel.",
  },
  {
    id: "pp-2",
    title: "Fuel / travel cash",
    amount: 120,
    dueDate: "2026-04-30",
    priority: "Medium",
    type: "Travel",
    status: "Open",
    note: "Keep ready for immediate trip spending.",
  },
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
  if (value === "counted" || value === "paid" || value === "completed") return "status-green";
  if (value === "excluded" || value === "scheduled") return "status-blue";
  if (value === "watch" || value === "pending" || value === "open") return "status-amber";
  if (value === "overdue" || value === "high") return "status-red";
  return "status-gray";
}

function priorityClass(priority) {
  const value = String(priority || "").toLowerCase();
  if (value === "high") return "status-red";
  if (value === "medium") return "status-amber";
  if (value === "low") return "status-blue";
  return "status-gray";
}

function matchPeriod(dateStr, mode) {
  const d = new Date(dateStr);
  const now = new Date(`${TODAY}T12:00:00`);
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

function datePlusDays(dateStr, days) {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysDiffFromToday(dateStr) {
  const today = new Date(`${TODAY}T12:00:00`);
  const due = new Date(`${dateStr}T12:00:00`);
  return Math.floor((due - today) / (1000 * 60 * 60 * 24));
}

function getPriorityGroups(items) {
  const openItems = items.filter((x) => x.status === "Open");
  const today = openItems.filter((x) => daysDiffFromToday(x.dueDate) === 0);
  const tomorrow = openItems.filter((x) => daysDiffFromToday(x.dueDate) === 1);
  const week = openItems.filter((x) => {
    const diff = daysDiffFromToday(x.dueDate);
    return diff >= 0 && diff <= 7;
  });
  const overdue = openItems.filter((x) => daysDiffFromToday(x.dueDate) < 0);

  return { today, tomorrow, week, overdue, openItems };
}

function buildUserFromSession(session) {
  const authUser = session?.user;
  if (!authUser) return null;

  return {
    id: authUser.id,
    name:
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split("@")[0] ||
      "Sentimo User",
    email: authUser.email || "",
  };
}

function getSubcategoriesForCategory(categories, categoryName) {
  const found = categories.find((c) => c.name === categoryName);
  return found?.subcategories || [];
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
      grid-template-columns: 188px 1fr;
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
      gap: 8px;
      padding: 16px 10px 10px;
    }

    .brand-badge {
      width: 25px;
      height: 25px;
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
      font-size: 11px;
      color: var(--nav-text);
    }

    .brand-sub {
      font-size: 7px;
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
      margin: 6px 10px 10px;
      padding: 10px 10px;
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
      padding: 0 8px;
    }

    .sidebar-nav button {
      width: 100%;
      border: 0;
      background: transparent;
      color: var(--nav-muted);
      text-align: left;
      padding: 9px 10px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 7px;
      font-size: 11px;
      font-weight: 500;
      position: relative;
      z-index: 2;
    }

    .sidebar-nav button.active {
      background: var(--nav-active);
      color: var(--nav-text);
    }

    .sidebar-footer {
      padding: 8px 10px 10px;
    }

    .sidebar-bottom-card {
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(255,255,255,0.03);
      border-radius: 10px;
      padding: 7px;
    }

    .theme-single-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;
      margin-bottom: 7px;
    }

    .theme-chip {
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.05);
      color: var(--nav-text);
      border-radius: 8px;
      padding: 7px 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 10px;
      min-height: 30px;
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
      gap: 7px;
      align-items: center;
      padding-top: 3px;
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

    .error-text {
      color: var(--danger);
      font-size: 10px;
      line-height: 1.4;
      margin-top: 4px;
    }

    .success-text {
      color: var(--success);
      font-size: 10px;
      line-height: 1.4;
      margin-top: 4px;
    }

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

    .btn:disabled {
      opacity: 0.55;
      cursor: default;
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

    .priority-list {
      display: grid;
      gap: 8px;
    }

    .priority-item {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 11px;
      background: rgba(255,255,255,0.02);
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
    }

    .priority-left {
      min-width: 0;
      flex: 1;
    }

    .priority-title {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .priority-meta {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 6px;
    }

    .priority-note {
      font-size: 10px;
      color: var(--muted);
      line-height: 1.4;
    }

    .priority-right {
      text-align: right;
      min-width: 122px;
    }

    .priority-amount {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
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
      .priority-item { flex-direction: column; }
      .priority-right { text-align: left; min-width: 0; width: 100%; }
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

function LoginScreen({ onLogin, onSignUp, loading, authMessage, authError, theme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
          Enter your email and password. After your first login, you can create a PIN for faster future access.
        </p>

        <div className="form-grid" style={{ marginTop: 12 }}>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            autoComplete="email"
          />
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            autoComplete="current-password"
          />

          {authError ? <div className="error-text">{authError}</div> : null}
          {authMessage ? <div className="success-text">{authMessage}</div> : null}

          <button
            className="btn btn-primary"
            onClick={() => onLogin({ email, password })}
            disabled={loading}
            type="button"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <button
            className="btn"
            onClick={() => onSignUp({ email, password })}
            disabled={loading}
            type="button"
          >
            {loading ? "Please wait..." : "Create account"}
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

        {ready && !match ? (
          <div style={{ color: "var(--danger)", textAlign: "center", fontSize: 11, marginBottom: 10 }}>
            PINs do not match. Press clear and try again.
          </div>
        ) : null}

        <div className="pin-keypad">
          {["1","2","3","4","5","6","7","8","9"].map((n) => (
            <button key={n} className="pin-key" onClick={() => press(n)} type="button">{n}</button>
          ))}
          <button className="pin-key" onClick={() => { setPin(""); setConfirmPin(""); setStep(1); }} type="button">Clear</button>
          <button className="pin-key" onClick={() => press("0")} type="button">0</button>
          <button className="pin-key" onClick={backspace} type="button">⌫</button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button className="btn btn-primary" disabled={!match} style={{ opacity: match ? 1 : 0.45 }} onClick={() => match && onSave(pin)} type="button">
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
            <button key={n} className="pin-key" onClick={() => press(n)} type="button">{n}</button>
          ))}
          <button className="pin-key" onClick={() => setPin("")} type="button">Clear</button>
          <button className="pin-key" onClick={() => press("0")} type="button">0</button>
          <button className="pin-key" onClick={() => setPin((s) => s.slice(0, -1))} type="button">⌫</button>
        </div>

        <button className="btn" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} onClick={onUsePassword} type="button">
          Sign in with email instead
        </button>
      </div>
    </div>
  );
}

function PriorityPaymentModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    dueDate: datePlusDays(TODAY, 1),
    priority: "High",
    type: "Payment",
    note: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: "",
        amount: "",
        dueDate: datePlusDays(TODAY, 1),
        priority: "High",
        type: "Payment",
        note: "",
      });
    }
  }, [open]);

  if (!open) return null;

  function submit() {
    if (!form.title || !form.amount || !form.dueDate) return;

    onSave({
      id: `pp-${Date.now()}`,
      title: form.title,
      amount: Number(form.amount),
      dueDate: form.dueDate,
      priority: form.priority,
      type: form.type,
      status: "Open",
      note: form.note,
    });
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <div className="fx-kicker">Urgent cash / payment</div>
            <h3 className="section-title" style={{ fontSize: 16, marginBottom: 4 }}>Add Priority Payment</h3>
            <div className="section-sub" style={{ marginBottom: 0 }}>
              Track what cannot be delayed and roll it forward if needed.
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose} type="button">
            <X size={12} />
          </button>
        </div>

        <div className="form-grid">
          <input
            className="input"
            placeholder="Title e.g. Trip with Lewis"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div className="split-2">
            <input
              className="input"
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <input
              className="input"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <div className="split-2">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Payment</option>
              <option>Travel</option>
              <option>Target</option>
              <option>Reminder</option>
            </select>
          </div>

          <textarea
            className="input"
            rows="3"
            placeholder="Note"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
          <button className="btn" onClick={onClose} type="button">Cancel</button>
          <button className="btn btn-primary" onClick={submit} type="button">Add Priority</button>
        </div>
      </div>
    </div>
  );
}

function ExpenseModal({ open, onClose, onSave, categories }) {
  const defaultCategory = categories[0]?.name || "";
  const defaultSub = getSubcategoriesForCategory(categories, defaultCategory)[0] || "";

  const [form, setForm] = useState({
    date: TODAY,
    merchant: "",
    description: "",
    category: defaultCategory,
    subcategory: defaultSub,
    amount: "",
  });

  useEffect(() => {
    if (open) {
      const firstCategory = categories[0]?.name || "";
      const firstSub = getSubcategoriesForCategory(categories, firstCategory)[0] || "";
      setForm({
        date: TODAY,
        merchant: "",
        description: "",
        category: firstCategory,
        subcategory: firstSub,
        amount: "",
      });
    }
  }, [open, categories]);

  if (!open) return null;

  const subcategories = getSubcategoriesForCategory(categories, form.category);

  function updateCategory(nextCategory) {
    const nextSubs = getSubcategoriesForCategory(categories, nextCategory);
    setForm((prev) => ({
      ...prev,
      category: nextCategory,
      subcategory: nextSubs[0] || "",
    }));
  }

  function submit() {
    if (!form.date || !form.category || !form.amount) return;

    onSave({
      id: `tx-${Date.now()}`,
      date: form.date,
      merchant: form.merchant || form.description || "Manual Expense",
      description: form.description || form.merchant || "Manual Expense",
      category: form.category,
      subcategory: form.subcategory || "General",
      direction: "expense",
      nature: "real",
      status: "counted",
      amount: Number(form.amount),
    });
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            <div className="fx-kicker">Daily expenses</div>
            <h3 className="section-title" style={{ fontSize: 16, marginBottom: 4 }}>Add Expense</h3>
            <div className="section-sub" style={{ marginBottom: 0 }}>
              Log a real expense and classify it properly.
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose} type="button">
            <X size={12} />
          </button>
        </div>

        <div className="form-grid">
          <div className="split-2">
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <input
              className="input"
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>

          <div className="split-2">
            <input
              className="input"
              placeholder="Merchant"
              value={form.merchant}
              onChange={(e) => setForm({ ...form, merchant: e.target.value })}
            />
            <input
              className="input"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="split-2">
            <select value={form.category} onChange={(e) => updateCategory(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })}>
              {subcategories.length ? (
                subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))
              ) : (
                <option value="">No sub-category</option>
              )}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
          <button className="btn" onClick={onClose} type="button">Cancel</button>
          <button className="btn btn-primary" onClick={submit} type="button">Add Expense</button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ activePage, setActivePage, user, theme, setTheme, onLogout }) {
  const nav = [
    [LayoutDashboard, "Dashboard"],
    [AlertTriangle, "Priority Payments"],
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
          <LineChart size={13} />
        </div>
        <div>
          <div className="brand-title">Sentimo</div>
          <div className="brand-sub">Expense Tracker</div>
        </div>
      </div>

      <div className="daily-card">
        <div className="brand-sub" style={{ marginBottom: 8 }}>Daily Target</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--nav-text)" }}>Live</div>
        <div className="daily-line"><span style={{ width: "46%" }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--nav-muted)", fontSize: 9 }}>
          <span>Track</span>
          <span>Plan</span>
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
            <Icon size={12} />
            <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
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

          <div className="sidebar-userrow" style={{ justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <UserCircle2 size={17} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 11 }}>{user.name}</div>
                <div style={{ fontSize: 8.5, color: "var(--nav-muted)" }}>{user.email}</div>
              </div>
            </div>
            <button className="btn btn-icon" onClick={onLogout} type="button" title="Logout">
              <LogOut size={11} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function DashboardPage({ transactions, fixedExpenses, priorityPayments, setActivePage }) {
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

  const { today, tomorrow, week, overdue } = getPriorityGroups(priorityPayments);
  const todayTotal = sumAmounts(today);
  const tomorrowTotal = sumAmounts(tomorrow);
  const weekTotal = sumAmounts(week);
  const overdueTotal = sumAmounts(overdue);

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

      <div className="grid-2" style={{ marginTop: 10 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <h3 className="section-title" style={{ marginBottom: 4 }}>Priority Payments</h3>
              <p className="section-sub" style={{ marginBottom: 0 }}>What cannot be delayed.</p>
            </div>
            <button className="btn" onClick={() => setActivePage("Priority Payments")} type="button">
              Open
              <ChevronRight size={12} />
            </button>
          </div>

          <div className="grid-4">
            <div className="tcard">
              <div className="tcard-label">Today</div>
              <div className="tcard-value">{formatCurrency(todayTotal)}</div>
              <div className="muted" style={{ fontSize: 9, marginTop: 4 }}>{today.length} item(s)</div>
            </div>
            <div className="tcard">
              <div className="tcard-label">Tomorrow</div>
              <div className="tcard-value">{formatCurrency(tomorrowTotal)}</div>
              <div className="muted" style={{ fontSize: 9, marginTop: 4 }}>{tomorrow.length} item(s)</div>
            </div>
            <div className="tcard">
              <div className="tcard-label">This Week</div>
              <div className="tcard-value">{formatCurrency(weekTotal)}</div>
              <div className="muted" style={{ fontSize: 9, marginTop: 4 }}>{week.length} item(s)</div>
            </div>
            <div className="tcard">
              <div className="tcard-label">Overdue</div>
              <div className="tcard-value" style={{ color: overdue.length ? "var(--danger)" : "var(--text)" }}>{formatCurrency(overdueTotal)}</div>
              <div className="muted" style={{ fontSize: 9, marginTop: 4 }}>{overdue.length} item(s)</div>
            </div>
          </div>

          <div style={{ marginTop: 10 }} className="priority-list">
            {week.slice(0, 3).map((item) => (
              <div key={item.id} className="priority-item">
                <div className="priority-left">
                  <div className="priority-title">{item.title}</div>
                  <div className="priority-meta">
                    <span className={`status-pill ${priorityClass(item.priority)}`}>{item.priority}</span>
                    <span className="status-pill status-blue">{item.type}</span>
                    <span className="status-pill status-gray">{item.dueDate}</span>
                  </div>
                  <div className="priority-note">{item.note || "—"}</div>
                </div>
                <div className="priority-right">
                  <div className="priority-amount">{formatCurrency(item.amount)}</div>
                </div>
              </div>
            ))}
            {week.length === 0 ? <div className="empty-box" style={{ minHeight: 90 }}>No urgent items this week</div> : null}
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Monthly Net Position</h3>
          <p className="section-sub">Income received minus total expenses this month.</p>
          <div style={{ fontSize: 21, fontWeight: 600, color: net >= 0 ? "var(--success)" : "var(--danger)" }}>
            {net >= 0 ? "+" : ""}{formatCurrency(net)}
          </div>
          <div className="muted" style={{ marginTop: 5, fontSize: 10 }}>
            {formatCurrency(realIncome)} in · {formatCurrency(realExpenses)} out
          </div>

          <div style={{ marginTop: 16 }}>
            <h3 className="section-title">Savings / Internal</h3>
            <p className="section-sub">Tracked but excluded from real totals.</p>
            <div style={{ fontSize: 21, fontWeight: 600 }}>{formatCurrency(internalTotal)}</div>
          </div>

          <div style={{ marginTop: 16 }}>
            <h3 className="section-title">Recent Income</h3>
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
      </div>
    </>
  );
}

function PriorityPaymentsPage({ priorityPayments, setPriorityPayments }) {
  const [activeTab, setActiveTab] = useState("Today");
  const [openModal, setOpenModal] = useState(false);

  const { today, tomorrow, week, overdue, openItems } = getPriorityGroups(priorityPayments);
  const completed = priorityPayments.filter((x) => x.status === "Completed");

  const visible =
    activeTab === "Today"
      ? today
      : activeTab === "Tomorrow"
      ? tomorrow
      : activeTab === "This Week"
      ? week
      : activeTab === "Overdue"
      ? overdue
      : activeTab === "Completed"
      ? completed
      : openItems;

  function addPriority(item) {
    setPriorityPayments((prev) => [item, ...prev]);
  }

  function markCompleted(id) {
    setPriorityPayments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Completed" } : item
      )
    );
  }

  function moveTomorrow(id) {
    setPriorityPayments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, dueDate: datePlusDays(TODAY, 1), status: "Open" }
          : item
      )
    );
  }

  function moveNextWeek(id) {
    setPriorityPayments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, dueDate: datePlusDays(TODAY, 7), status: "Open" }
          : item
      )
    );
  }

  function deleteItem(id) {
    setPriorityPayments((prev) => prev.filter((item) => item.id !== id));
  }

  const todayTotal = sumAmounts(today);
  const weekTotal = sumAmounts(week);
  const overdueTotal = sumAmounts(overdue);

  return (
    <>
      <div className="header-actions" style={{ justifyContent: "flex-end", marginBottom: 10 }}>
        <button className="btn btn-primary" onClick={() => setOpenModal(true)} type="button">
          <Plus size={12} />
          Add Priority
        </button>
      </div>

      <div className="grid-3">
        <MetricCard icon={AlertTriangle} label="Today" value={formatCurrency(todayTotal)} sub={`${today.length} urgent item(s)`} />
        <MetricCard icon={CalendarDays} label="This Week" value={formatCurrency(weekTotal)} sub={`${week.length} planned item(s)`} />
        <MetricCard icon={CircleDollarSign} label="Overdue" value={formatCurrency(overdueTotal)} sub={`${overdue.length} overdue item(s)`} />
      </div>

      <div className="card" style={{ marginTop: 10 }}>
        <div className="mini-tabs">
          {[
            ["Today", today.length],
            ["Tomorrow", tomorrow.length],
            ["This Week", week.length],
            ["Overdue", overdue.length],
            ["All Open", openItems.length],
            ["Completed", completed.length],
          ].map(([label, count]) => (
            <button
              key={label}
              className={activeTab === label ? "active" : ""}
              onClick={() => setActiveTab(label)}
              type="button"
            >
              {label} ({count})
            </button>
          ))}
        </div>

        <div className="priority-list">
          {visible.map((item) => (
            <div className="priority-item" key={item.id}>
              <div className="priority-left">
                <div className="priority-title">{item.title}</div>
                <div className="priority-meta">
                  <span className={`status-pill ${priorityClass(item.priority)}`}>{item.priority}</span>
                  <span className="status-pill status-blue">{item.type}</span>
                  <span className={`status-pill ${statusClass(item.status)}`}>{item.status}</span>
                  <span className="status-pill status-gray">{item.dueDate}</span>
                </div>
                <div className="priority-note">{item.note || "—"}</div>
              </div>

              <div className="priority-right">
                <div className="priority-amount">{formatCurrency(item.amount)}</div>
                <div className="action-row" style={{ justifyContent: "flex-end" }}>
                  {item.status !== "Completed" ? (
                    <>
                      <button className="btn btn-icon" onClick={() => markCompleted(item.id)} type="button" title="Complete">
                        <Check size={11} />
                      </button>
                      <button className="btn btn-icon" onClick={() => moveTomorrow(item.id)} type="button" title="Move to tomorrow">
                        <Clock3 size={11} />
                      </button>
                      <button className="btn btn-icon" onClick={() => moveNextWeek(item.id)} type="button" title="Move to next week">
                        <CalendarDays size={11} />
                      </button>
                    </>
                  ) : null}
                  <button className="btn btn-icon" onClick={() => deleteItem(item.id)} type="button" title="Delete">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {visible.length === 0 ? (
            <div className="empty-box">
              No items in this view.
            </div>
          ) : null}
        </div>
      </div>

      <PriorityPaymentModal open={openModal} onClose={() => setOpenModal(false)} onSave={addPriority} />
    </>
  );
}

function FixedExpensesPage({ fixedExpenses, setFixedExpenses }) {
  const [tab, setTab] = useState("All");

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
              {visible.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty-box" style={{ minHeight: 100 }}>
                      No fixed expenses in this status.
                    </div>
                  </td>
                </tr>
              ) : null}
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
  const [openModal, setOpenModal] = useState(false);

  const expenseRows = getCountedRealExpenses(transactions).filter((t) => matchPeriod(t.date, period));
  const total = sumAmounts(expenseRows);
  const transactionsCount = expenseRows.length;
  const dailyAvg = total / (period === "7d" ? 7 : period === "30d" ? 30 : 30);

  function addExpense(item) {
    setTransactions((prev) => [item, ...prev]);
  }

  return (
    <>
      <div className="header-actions" style={{ justifyContent: "flex-end", marginBottom: 10 }}>
        <button className="btn btn-primary" onClick={() => setOpenModal(true)} type="button">
          <Plus size={12} />
          Add Expense
        </button>
      </div>

      <div className="card">
        <div className="mini-tabs">
          <button className={period === "7d" ? "active" : ""} onClick={() => setPeriod("7d")} type="button">7 Days</button>
          <button className={period === "30d" ? "active" : ""} onClick={() => setPeriod("30d")} type="button">30 Days</button>
          <button className={period === "month" ? "active" : ""} onClick={() => setPeriod("month")} type="button">This Month</button>
          <button type="button">This Year</button>
        </div>

        <div className="grid-3">
          <MetricCard icon={Wallet} label="Period Total" value={formatCurrency(total)} sub="Selected period" />
          <MetricCard icon={BarChart3} label="Transactions" value={String(transactionsCount)} sub="Entries" />
          <MetricCard icon={TrendingUp} label="Daily Average" value={formatCurrency(dailyAvg)} sub="Rolling average" />
        </div>

        <div style={{ marginTop: 10 }}>
          {expenseRows.length === 0 ? (
            <div className="empty-box">No expenses in this period</div>
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

      <ExpenseModal open={openModal} onClose={() => setOpenModal(false)} onSave={addExpense} categories={categories} />
    </>
  );
}

function IncomeDepositsPage({ transactions }) {
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

  return (
    <>
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
    </>
  );
}

function TradingPnlModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    date: TODAY,
    currency: "GBP",
    instrument: "",
    pnl: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        date: TODAY,
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

  const today = TODAY;
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
          {todaySessions.length === 0 && todayExpenses === 0 ? (
            <span className="muted">No trading sessions or expenses logged today.</span>
          ) : (
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

function DailyTargetPage({ transactions, fixedExpenses, settings, priorityPayments }) {
  const fixedMonthly = fixedExpenses
    .filter((f) => f.autoIncludeTarget && f.status !== "Archived")
    .reduce((sum, item) => sum + monthlyEquivalent(item.frequency, item.amount), 0);

  const variableExpenses = getCountedRealExpenses(transactions).filter((t) => matchPeriod(t.date, "30d"));
  const variableAvg = sumAmounts(variableExpenses) / Number(settings.variableAverageDays || 30);
  const baseTarget = settings.customDailyTarget ? Number(settings.customDailyTarget) : fixedMonthly / daysInMonth(new Date(`${TODAY}T12:00:00`)) + variableAvg;

  const { today, week } = getPriorityGroups(priorityPayments);
  const urgentToday = sumAmounts(today);
  const urgentWeek = sumAmounts(week);
  const target = baseTarget + urgentToday;

  const todaySpent = sumAmounts(getCountedRealExpenses(transactions).filter((t) => t.date === TODAY));
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
              <div className="muted" style={{ fontSize: 9 }}>Required Today</div>
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
          <p className="section-sub">Base target plus urgent non-delayable cash needs due today.</p>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 8 }}>
            <div style={{ color: "var(--muted)", marginBottom: 8, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Target Composition
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
              <span className="muted">Base daily target</span>
              <strong style={{ fontWeight: 600 }}>{formatCurrency(baseTarget)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
              <span className="muted">Urgent payments today</span>
              <strong style={{ fontWeight: 600, color: urgentToday > 0 ? "var(--danger)" : "var(--text)" }}>{formatCurrency(urgentToday)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
              <span className="muted">Urgent this week</span>
              <strong style={{ fontWeight: 600 }}>{formatCurrency(urgentWeek)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontWeight: 600, fontSize: 11 }}>
              <span>Required today</span>
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
    : fixedMonthly / daysInMonth(new Date(`${TODAY}T12:00:00`)) + dailyAvg;

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
  const [priorityPayments, setPriorityPayments] = useState(seedPriorityPayments);
  const [needsPinSetup, setNeedsPinSetup] = useState(false);
  const [authView, setAuthView] = useState("password");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.setAttribute("data-sentimo-styles", "true");
    styleTag.innerHTML = appStyles();
    document.head.appendChild(styleTag);
    return () => styleTag.remove();
  }, []);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      const savedTransactions = localStorage.getItem(STORAGE_KEY);
      const savedFixed = localStorage.getItem(FIXED_KEY);
      const savedCategories = localStorage.getItem(CATEGORIES_KEY);
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      const savedSessions = localStorage.getItem(SESSIONS_KEY);
      const savedPriorities = localStorage.getItem(PRIORITY_KEY);

      if (savedTheme) setTheme(savedTheme);
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedFixed) setFixedExpenses(JSON.parse(savedFixed));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      if (savedSessions) setSessions(JSON.parse(savedSessions));
      if (savedPriorities) setPriorityPayments(JSON.parse(savedPriorities));
    } catch {
      // ignore local storage parse errors
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
  useEffect(() => localStorage.setItem(PRIORITY_KEY, JSON.stringify(priorityPayments)), [priorityPayments]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!supabase) {
        if (mounted) {
          setAuthError("Supabase environment variables are missing.");
          setAuthReady(true);
          setAuthView("password");
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const builtUser = buildUserFromSession(session);
      const pin = localStorage.getItem(PIN_KEY);
      const authMode = localStorage.getItem(AUTH_MODE_KEY);

      if (!mounted) return;

      if (builtUser) {
        setUser(builtUser);
        localStorage.setItem(USER_KEY, JSON.stringify(builtUser));

        if (pin && authMode !== "password") {
          setAuthView("pin");
        } else {
          setAuthView("app");
        }
      } else {
        setAuthView("password");
      }

      setAuthReady(true);
    }

    initAuth();

    let subscription;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const builtUser = buildUserFromSession(session);

        if (builtUser) {
          setUser(builtUser);
          localStorage.setItem(USER_KEY, JSON.stringify(builtUser));
          const pin = localStorage.getItem(PIN_KEY);
          const authMode = localStorage.getItem(AUTH_MODE_KEY);
          if (pin && authMode !== "password") {
            setAuthView("pin");
          } else {
            setAuthView("app");
          }
        } else {
          setUser(null);
          localStorage.removeItem(USER_KEY);
          setAuthView("password");
        }
      });

      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function handlePasswordLogin({ email, password }) {
    setAuthError("");
    setAuthMessage("");

    if (!supabase) {
      setAuthError("Supabase client is not configured.");
      return;
    }

    if (!email || !password) {
      setAuthError("Please enter both email and password.");
      return;
    }

    try {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message || "Unable to sign in.");
        return;
      }

      const builtUser = buildUserFromSession(data.session);
      if (builtUser) {
        setUser(builtUser);
        localStorage.setItem(USER_KEY, JSON.stringify(builtUser));
      }

      const existingPin = localStorage.getItem(PIN_KEY);
      if (!existingPin) {
        setNeedsPinSetup(true);
      } else {
        localStorage.setItem(AUTH_MODE_KEY, "pin");
      }

      setAuthView("app");
    } catch (err) {
      setAuthError(err?.message || "Unexpected sign-in error.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignUp({ email, password }) {
    setAuthError("");
    setAuthMessage("");

    if (!supabase) {
      setAuthError("Supabase client is not configured.");
      return;
    }

    if (!email || !password) {
      setAuthError("Please enter both email and password.");
      return;
    }

    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message || "Unable to create account.");
        return;
      }

      setAuthMessage("Account created. If email confirmation is enabled, please confirm your email before signing in.");
    } catch (err) {
      setAuthError(err?.message || "Unexpected sign-up error.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    setAuthError("");
    setAuthMessage("");

    if (!supabase) {
      setUser(null);
      setAuthView("password");
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setAuthView("password");
    localStorage.setItem(AUTH_MODE_KEY, "password");
  }

  function handlePinSaved(pin) {
    localStorage.setItem(PIN_KEY, pin);
    localStorage.setItem(AUTH_MODE_KEY, "pin");
    setNeedsPinSetup(false);
  }

  function usePasswordInstead() {
    setAuthView("password");
    localStorage.setItem(AUTH_MODE_KEY, "password");
  }

  if (!authReady) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-head">
            <div className="auth-logo">
              <LineChart size={17} />
            </div>
            <div>
              <div className="auth-title">Sentimo</div>
              <div className="auth-sub">Loading session</div>
            </div>
          </div>
          <div className="muted" style={{ fontSize: 11 }}>Please wait...</div>
        </div>
      </div>
    );
  }

  if (authView === "pin" && user && localStorage.getItem(PIN_KEY)) {
    return <PinUnlockScreen onUnlock={() => setAuthView("app")} onUsePassword={usePasswordInstead} />;
  }

  if (!user || authView === "password") {
    return (
      <LoginScreen
        onLogin={handlePasswordLogin}
        onSignUp={handleSignUp}
        loading={authLoading}
        authError={authError}
        authMessage={authMessage}
        theme={theme}
      />
    );
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
          onLogout={handleLogout}
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
                {activePage === "Priority Payments" && "Track urgent payments, travel cash, priority obligations, and items you may need to move forward."}
                {activePage === "Income & Deposits" && "All money received — trading draws, commissions, dividends, and more."}
                {activePage === "Fixed Expenses" && "Recurring obligations and structured monthly commitments."}
                {activePage === "Daily Expenses" && "Day-to-day spending control with real entry logging and category classification."}
                {activePage === "Daily Target" && "How much you can spend today — or need to earn — including urgent obligations due now."}
                {activePage === "Analytics" && "Budgeting and spending intelligence across categories and periods."}
                {activePage === "Overall" && "Compare this period, previous period, and target budget side by side."}
                {activePage === "Categories" && "Categories, sub-categories, and keyword-ready classification logic."}
                {activePage === "Dashboard" && "Control panel for spending, income, fixed obligations, urgent payments, and overall position."}
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

          {activePage === "Dashboard" && (
            <DashboardPage
              transactions={transactions}
              fixedExpenses={fixedExpenses}
              priorityPayments={priorityPayments}
              setActivePage={setActivePage}
            />
          )}
          {activePage === "Priority Payments" && (
            <PriorityPaymentsPage
              priorityPayments={priorityPayments}
              setPriorityPayments={setPriorityPayments}
            />
          )}
          {activePage === "Trading P&L" && <TradingPnLPage transactions={transactions} sessions={sessions} setSessions={setSessions} />}
          {activePage === "Fixed Expenses" && <FixedExpensesPage fixedExpenses={fixedExpenses} setFixedExpenses={setFixedExpenses} />}
          {activePage === "Daily Expenses" && (
            <DailyExpensesPage
              transactions={transactions}
              setTransactions={setTransactions}
              categories={categories}
            />
          )}
          {activePage === "Income & Deposits" && <IncomeDepositsPage transactions={transactions} />}
          {activePage === "Daily Target" && (
            <DailyTargetPage
              transactions={transactions}
              fixedExpenses={fixedExpenses}
              settings={settings}
              priorityPayments={priorityPayments}
            />
          )}
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
