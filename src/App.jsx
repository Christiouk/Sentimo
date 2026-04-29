import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Cloud,
  CloudOff,
  CreditCard,
  LayoutDashboard,
  LineChart,
  PiggyBank,
  Save,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  Upload,
  UserCircle2,
  Wallet,
} from "lucide-react";

const STORAGE_KEY = "sentimo_transactions_v2";
const USER_KEY = "sentimo_user_v2";
const CLOUD_KEY = "sentimo_cloud_settings_v1";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const demoUser = {
  id: "demo-founder-user",
  name: "Chris Holanda",
  email: "chris@sentimo.cloud",
  plan: "Founder Build",
};

const startingTransactions = [
  { id: "1", date: "2026-04-29", name: "Monthly rent income", type: "income", category: "Property Income", entityType: "Company", entity: "Tenant / Rent", amount: 500, status: "counted", source: "manual", synced: false },
  { id: "2", date: "2026-04-28", name: "Groceries", type: "expense", category: "Food & Groceries", entityType: "Company", entity: "Tesco", amount: 86.42, status: "counted", source: "manual", synced: false },
  { id: "3", date: "2026-04-27", name: "Fuel", type: "expense", category: "Transport", entityType: "Company", entity: "Shell", amount: 72.31, status: "counted", source: "manual", synced: false },
  { id: "4", date: "2026-04-26", name: "School fees payment", type: "expense", category: "Education", entityType: "Company", entity: "School", amount: 1250, status: "counted", source: "manual", synced: false },
  { id: "5", date: "2026-04-25", name: "Transfer from Savings", type: "internal_in", category: "Internal Savings", entityType: "Internal", entity: "Savings", amount: 2000, status: "excluded", source: "manual", synced: false },
  { id: "6", date: "2026-04-25", name: "Transfer to Savings", type: "internal_out", category: "Internal Savings", entityType: "Internal", entity: "Savings", amount: 1500, status: "excluded", source: "manual", synced: false },
  { id: "7", date: "2026-04-24", name: "Trading 212 withdrawal", type: "investment_in", category: "Investments", entityType: "Broker", entity: "Trading 212", amount: 1200, status: "watch", source: "manual", synced: false },
  { id: "8", date: "2026-04-23", name: "Restaurant", type: "expense", category: "Restaurants", entityType: "Company", entity: "Local Restaurant", amount: 64.9, status: "counted", source: "manual", synced: false },
];

const fixedObligationsSeed = [
  { id: 1, name: "Rent", monthly: 4500, due: "01", status: "scheduled" },
  { id: 2, name: "Car / Insurance", monthly: 425, due: "12", status: "active" },
  { id: 3, name: "Subscriptions", monthly: 98, due: "Various", status: "active" },
  { id: 4, name: "School / Activities", monthly: 1250, due: "Term", status: "active" },
];

const budgetTargetsSeed = [
  { category: "Food & Groceries", budget: 900 },
  { category: "Transport", budget: 650 },
  { category: "Restaurants", budget: 450 },
  { category: "Education", budget: 1600 },
  { category: "Business", budget: 1200 },
  { category: "Shopping", budget: 700 },
  { category: "Property Income", budget: 0 },
  { category: "Internal Savings", budget: 0 },
  { category: "Investments", budget: 0 },
  { category: "Uncategorised", budget: 500 },
];

const rulesSeed = [
  { id: 1, contains: ["savings", "vault", "pocket", "revpoints spare change"], type: "internal_out", category: "Internal Savings", entityType: "Internal", entity: "Savings", status: "excluded" },
  { id: 2, contains: ["withdrawing savings", "from savings", "withdraw from savings"], type: "internal_in", category: "Internal Savings", entityType: "Internal", entity: "Savings", status: "excluded" },
  { id: 3, contains: ["trading 212", "interactive brokers", "etoro", "coinbase", "kraken", "binance"], type: "investment_in", category: "Investments", entityType: "Broker", entity: "Broker / Investment", status: "watch" },
  { id: 4, contains: ["tesco", "sainsbury", "waitrose", "aldi", "lidl", "asda"], type: "expense", category: "Food & Groceries", entityType: "Company", entity: "Supermarket", status: "counted" },
  { id: 5, contains: ["shell", "bp", "esso", "fuel", "uber", "trainline", "parking"], type: "expense", category: "Transport", entityType: "Company", entity: "Transport", status: "counted" },
  { id: 6, contains: ["school", "stowe", "swanbourne", "ballet", "club"], type: "expense", category: "Education", entityType: "Company", entity: "Education", status: "counted" },
  { id: 7, contains: ["restaurant", "cafe", "deliveroo", "ubereats", "just eat"], type: "expense", category: "Restaurants", entityType: "Company", entity: "Restaurant / Food Out", status: "counted" },
  { id: 8, contains: ["amazon", "apple", "netflix", "spotify", "openai", "google"], type: "expense", category: "Shopping", entityType: "Company", entity: "Online / Subscription", status: "counted" },
];

function calcTotals(transactions) {
  const counted = transactions.filter((t) => t.status === "counted");
  const income = counted.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = counted.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const internalIn = transactions.filter((t) => t.type === "internal_in").reduce((s, t) => s + Number(t.amount), 0);
  const internalOut = transactions.filter((t) => t.type === "internal_out").reduce((s, t) => s + Number(t.amount), 0);
  const unsynced = transactions.filter((t) => !t.synced).length;
  return { income, expenses, net: income - expenses, internalIn, internalOut, unsynced };
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseAmount(value) {
  if (value === undefined || value === null) return 0;
  const text = String(value).trim();
  const negativeFromParentheses = /^\(.*\)$/.test(text);
  const clean = text.replace(/£/g, "").replace(/,/g, "").replace(/\s/g, "").replace(/[()]/g, "");
  const num = Number(clean);
  if (!Number.isFinite(num)) return 0;
  return negativeFromParentheses ? -Math.abs(num) : num;
}

function autoCategorise(row, rules) {
  const raw = Object.values(row).join(" ").toLowerCase();
  const amount = parseAmount(
    row.Amount ||
    row.amount ||
    row.Value ||
    row.value ||
    row.Paid ||
    row.paid ||
    row.Money ||
    row.money ||
    row["Amount (GBP)"] ||
    row["Amount GBP"] ||
    row.Total ||
    row.total ||
    row["Paid Out"] ||
    row["Paid In"]
  );
  const direction = String(row.Type || row.type || row.Direction || row.direction || "").toLowerCase();
  const description = row.Description || row.description || row.Reference || row.reference || row.Name || row.name || row.Merchant || row.merchant || "Imported transaction";
  const date = row.Date || row.date || row.Started || row.started || row["Completed Date"] || new Date().toISOString().slice(0, 10);

  const matched = rules.find((rule) => rule.contains.some((term) => raw.includes(term.toLowerCase())));
  let base = matched
    ? { ...matched }
    : {
        type: amount >= 0 || direction.includes("credit") ? "income" : "expense",
        category: "Uncategorised",
        entityType: "Company",
        entity: description,
        status: "counted",
      };

  if (base.category === "Internal Savings" && raw.includes("withdrawing")) base.type = "internal_in";
  if (base.category === "Internal Savings" && (raw.includes("depositing") || raw.includes("spare change") || raw.includes("to savings"))) base.type = "internal_out";

  let finalAmount = Math.abs(amount);
  if (finalAmount === 0) {
    finalAmount = Math.abs(
      parseAmount(
        row["Amount (GBP)"] ||
        row["Amount GBP"] ||
        row.Total ||
        row.total ||
        row["Paid Out"] ||
        row["Paid In"]
      )
    );
  }

  if (!matched && finalAmount > 0) {
    const looksIncome =
      amount > 0 ||
      direction.includes("credit") ||
      raw.includes("cashback") ||
      raw.includes("salary") ||
      raw.includes("income") ||
      row["Paid In"];
    base.type = looksIncome ? "income" : "expense";
  }

  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: String(date).slice(0, 10),
    name: String(description).replace(/^Card Payment to\s*/i, "").slice(0, 70),
    type: base.type,
    category: base.category,
    entityType: base.entityType,
    entity: base.entity || String(description).slice(0, 40),
    amount: finalAmount,
    status: base.status,
    source: "csv",
    synced: false,
  };
}

function downloadFile(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("chris@sentimo.cloud");
  const [password, setPassword] = useState("founder-demo");

  return (
    <div className="login-wrap app-shell">
      <div className="card login-card">
        <div className="brand">
          <div className="brand-badge"><LineChart size={20} /></div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Sentimo</div>
            <div className="muted small">Financial Control</div>
          </div>
        </div>
        <h1 style={{ marginBottom: 8 }}>Sign in</h1>
        <p className="muted">Prototype login now. Supabase Auth can replace this later.</p>
        <div className="form-grid" style={{ marginTop: 16 }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
          <button className="btn btn-primary" onClick={() => onLogin({ ...demoUser, email })}>Enter Dashboard</button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ activePage, setActivePage, user, cloudSettings }) {
  const nav = [
    [LayoutDashboard, "Dashboard"],
    [Upload, "Import CSV"],
    [Shield, "Rules"],
    [CreditCard, "Fixed Expenses"],
    [Wallet, "Daily Expenses"],
    [ArrowDownToLine, "Income & Deposits"],
    [LineChart, "Trading P&L"],
    [TrendingUp, "Analytics"],
    [Cloud, "Cloud Sync"],
    [Settings, "Settings"],
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-badge"><LineChart size={18} /></div>
        <div>
          <div style={{ fontWeight: 700 }}>Sentimo</div>
          <div className="muted small">Financial Control</div>
        </div>
      </div>

      <div className="sidebar-card">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <UserCircle2 size={28} />
          <div>
            <div>{user.name}</div>
            <div className="muted small">{user.email}</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }} className="small muted">
          {cloudSettings.connected ? "Cloud connected" : "Local mode"}
        </div>
      </div>

      <div className="sidebar-nav">
        {nav.map(([Icon, label]) => (
          <button key={label} className={activePage === label ? "active" : ""} onClick={() => setActivePage(label)}>
            <span style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
              <Icon size={16} /> {label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="card">
      <div className="small muted" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Icon size={14} /> {title}
      </div>
      <div className="metric-value">{value}</div>
      <div className="small muted">{subtitle}</div>
    </div>
  );
}

function DashboardPage({ transactions, setTransactions, budgetTargets, fixedObligations }) {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ date: "2026-04-29", name: "", entity: "", amount: "", type: "expense", category: "Food & Groceries" });
  const totals = useMemo(() => calcTotals(transactions), [transactions]);

  const categorySpend = useMemo(() => {
    const map = new Map();
    transactions
      .filter((t) => t.status === "counted" && t.type === "expense")
      .forEach((t) => map.set(t.category, (map.get(t.category) || 0) + Number(t.amount)));
    return Array.from(map.entries())
      .map(([category, spent]) => ({ category, spent, budget: budgetTargets.find((b) => b.category === category)?.budget || 500 }))
      .sort((a, b) => b.spent - a.spent);
  }, [transactions, budgetTargets]);

  const entities = useMemo(() => {
    const map = new Map();
    transactions.filter((t) => t.status === "counted").forEach((t) => {
      const key = t.entity || t.name;
      const current = map.get(key) || { entity: key, type: t.entityType, income: 0, expense: 0, count: 0 };
      if (t.type === "income") current.income += Number(t.amount);
      if (t.type === "expense") current.expense += Number(t.amount);
      current.count += 1;
      map.set(key, current);
    });
    return Array.from(map.values()).sort((a, b) => b.expense - a.expense).slice(0, 8);
  }, [transactions]);

  const visibleTransactions = transactions.filter((t) => `${t.name} ${t.entity} ${t.category}`.toLowerCase().includes(query.toLowerCase()));

  function addTransaction() {
    if (!form.name || !form.amount) return;
    const type = form.type;
    const status = type === "internal_in" || type === "internal_out" ? "excluded" : type === "investment_in" || type === "investment_out" ? "watch" : "counted";
    setTransactions([
      {
        id: `local-${Date.now()}`,
        date: form.date,
        name: form.name,
        entity: form.entity,
        entityType: "Company",
        amount: Number(form.amount),
        type,
        category: form.category,
        status,
        source: "manual",
        synced: false,
      },
      ...transactions,
    ]);
    setForm({ ...form, name: "", entity: "", amount: "" });
  }

  const fixedMonthly = fixedObligations.reduce((s, x) => s + x.monthly, 0);

  return (
    <>
      <div className="grid-5">
        <MetricCard title="Real Income" value={gbp.format(totals.income)} subtitle="Excludes savings transfers" icon={ArrowDownToLine} />
        <MetricCard title="Real Expenses" value={gbp.format(totals.expenses)} subtitle="Money paid to third parties" icon={ArrowUpFromLine} />
        <MetricCard title="Net Position" value={gbp.format(totals.net)} subtitle="Income minus expenses" icon={LineChart} />
        <MetricCard title="Internal Savings" value={gbp.format(totals.internalIn + totals.internalOut)} subtitle="Tracked but excluded" icon={PiggyBank} />
        <MetricCard title="Unsynced" value={String(totals.unsynced)} subtitle="Waiting for sync" icon={CloudOff} />
      </div>

      <div className="grid-3" style={{ marginTop: 16 }}>
        <div className="card" style={{ gridColumn: "span 2" }}>
          <h2 className="section-title">Where the money is going</h2>
          <div className="muted small" style={{ marginBottom: 14 }}>Category control</div>
          {categorySpend.map((row) => {
            const pct = row.budget ? Math.min(100, Math.round((row.spent / row.budget) * 100)) : 0;
            return (
              <div key={row.category} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                  <div>
                    <div>{row.category}</div>
                    <div className="small muted">Budget {gbp.format(row.budget)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div>{gbp.format(row.spent)}</div>
                    <div className="small muted">{pct}% used</div>
                  </div>
                </div>
                <div className="progress"><span style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <h2 className="section-title">Fixed obligations</h2>
          <div className="metric-value">{gbp.format(fixedMonthly)}</div>
          <div className="small muted" style={{ marginBottom: 12 }}>/ month</div>
          {fixedObligations.map((x) => (
            <div key={x.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #1f2937" }}>
              <div>{x.name}</div>
              <div className="small muted">Due: {x.due}</div>
              <div style={{ marginTop: 4 }}>{gbp.format(x.monthly)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 className="section-title">Add transaction</h2>
          <div className="form-grid">
            <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="Date" />
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Description" />
            <input value={form.entity} onChange={(e) => setForm({ ...form, entity: e.target.value })} placeholder="Company / person" />
            <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount" type="number" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="internal_in">From Savings</option>
              <option value="internal_out">To Savings</option>
              <option value="investment_in">Investment In</option>
              <option value="investment_out">Investment Out</option>
            </select>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {budgetTargets.map((b) => <option key={b.category}>{b.category}</option>)}
            </select>
            <button className="btn btn-primary" onClick={addTransaction}>Log Entry</button>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <div>
              <h2 className="section-title">Who receives your money</h2>
              <div className="small muted">Companies & persons</div>
            </div>
            <div style={{ width: 260 }}>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Income</th>
                  <th>Expense</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((x) => (
                  <tr key={x.entity}>
                    <td style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <BuildingIcon type={x.type} />
                      {x.entity}
                    </td>
                    <td>{x.type}</td>
                    <td>{x.income ? gbp.format(x.income) : "—"}</td>
                    <td>{x.expense ? gbp.format(x.expense) : "—"}</td>
                    <td>{x.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TransactionsPage transactions={visibleTransactions} setTransactions={setTransactions} title="Recent Transactions" compact />
    </>
  );
}

function ImportCsvPage({ transactions, setTransactions, rules }) {
  const inputRef = useRef(null);
  const [lastImport, setLastImport] = useState(null);

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result || "");
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) return;
      const headers = splitCsvLine(lines[0]).map((h) => h.replace(/^"|"$/g, ""));
      const imported = lines.slice(1).map((line) => {
        const values = splitCsvLine(line);
        const row = {};
        headers.forEach((h, index) => {
          row[h] = values[index] || "";
        });
        return autoCategorise(row, rules);
      }).filter((t) => t.amount > 0);
      setTransactions([...imported, ...transactions]);
      setLastImport({
        fileName: file.name,
        rows: imported.length,
        counted: imported.filter((t) => t.status === "counted").length,
        excluded: imported.filter((t) => t.status === "excluded").length,
        watch: imported.filter((t) => t.status === "watch").length,
      });
    };
    reader.readAsText(file);
  }

  return (
    <div className="grid-3">
      <div className="card" style={{ gridColumn: "span 2" }}>
        <h2 className="section-title">Upload bank statement</h2>
        <p className="muted">Import Revolut or bank CSV files. Savings transfers stay excluded from real totals.</p>
        <div className="card" style={{ marginTop: 16, borderStyle: "dashed", textAlign: "center" }} onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Upload size={32} />
          <div style={{ marginTop: 10, fontWeight: 700 }}>Drop or select your CSV statement</div>
          <div className="small muted" style={{ marginTop: 6 }}>Supported columns: Date, Description, Amount, Type, Merchant, Reference, Value.</div>
        </div>
        {lastImport && (
          <div className="grid-4" style={{ marginTop: 16 }}>
            <MetricCard title="Imported" value={String(lastImport.rows)} subtitle={lastImport.fileName} icon={Upload} />
            <MetricCard title="Counted" value={String(lastImport.counted)} subtitle="Real cashflow" icon={CheckCircle2} />
            <MetricCard title="Excluded" value={String(lastImport.excluded)} subtitle="Savings/internal" icon={PiggyBank} />
            <MetricCard title="Watch" value={String(lastImport.watch)} subtitle="Broker/investment" icon={LineChart} />
          </div>
        )}
      </div>
      <div className="card">
        <h2 className="section-title">Important rule</h2>
        <p className="muted">Money moved from/to Savings is displayed but excluded from real income and spending, preventing double counting.</p>
      </div>
    </div>
  );
}

function RulesPage({ rules, setRules }) {
  const [draft, setDraft] = useState({ contains: "", type: "expense", category: "Uncategorised", entityType: "Company", entity: "", status: "counted" });

  function addRule() {
    if (!draft.contains || !draft.category) return;
    setRules([{ id: Date.now(), ...draft, contains: draft.contains.split(",").map((x) => x.trim()).filter(Boolean) }, ...rules]);
    setDraft({ contains: "", type: "expense", category: "Uncategorised", entityType: "Company", entity: "", status: "counted" });
  }

  return (
    <div className="grid-3">
      <div className="card" style={{ gridColumn: "span 2" }}>
        <h2 className="section-title">Categorisation logic</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Keywords</th>
                <th>Category</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id}>
                  <td>{r.contains.join(", ")}</td>
                  <td>{r.category}</td>
                  <td>{r.type}</td>
                  <td>{r.status}</td>
                  <td><button className="btn" onClick={() => setRules(rules.filter((x) => x.id !== r.id))}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h2 className="section-title">Add rule</h2>
        <div className="form-grid">
          <input value={draft.contains} onChange={(e) => setDraft({ ...draft, contains: e.target.value })} placeholder="Keywords separated by commas" />
          <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Category" />
          <input value={draft.entity} onChange={(e) => setDraft({ ...draft, entity: e.target.value })} placeholder="Entity name" />
          <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="internal_in">From Savings</option>
            <option value="internal_out">To Savings</option>
            <option value="investment_in">Investment In</option>
            <option value="investment_out">Investment Out</option>
          </select>
          <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
            <option value="counted">Counted</option>
            <option value="excluded">Excluded</option>
            <option value="watch">Watch</option>
            <option value="reverted">Reverted</option>
          </select>
          <button className="btn btn-primary" onClick={addRule}>Add Rule</button>
        </div>
      </div>
    </div>
  );
}

function FixedExpensesPage({ fixedObligations, setFixedObligations }) {
  const [draft, setDraft] = useState({ name: "", monthly: "", due: "", status: "active" });
  const monthly = fixedObligations.reduce((s, x) => s + Number(x.monthly), 0);

  function add() {
    if (!draft.name || !draft.monthly) return;
    setFixedObligations([{ id: Date.now(), ...draft, monthly: Number(draft.monthly) }, ...fixedObligations]);
    setDraft({ name: "", monthly: "", due: "", status: "active" });
  }

  return (
    <div className="grid-3">
      <div className="card" style={{ gridColumn: "span 2" }}>
        <h2 className="section-title">Fixed obligations</h2>
        <div className="metric-value">{gbp.format(monthly)}</div>
        <div className="small muted" style={{ marginBottom: 16 }}>/ month</div>
        {fixedObligations.map((x) => (
          <div key={x.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #1f2937" }}>
            <div>{x.name}</div>
            <div className="small muted">Due: {x.due || "—"}</div>
            <div>{gbp.format(x.monthly)}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="section-title">New obligation</h2>
        <div className="form-grid">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name" />
          <input value={draft.monthly} onChange={(e) => setDraft({ ...draft, monthly: e.target.value })} placeholder="Monthly amount" type="number" />
          <input value={draft.due} onChange={(e) => setDraft({ ...draft, due: e.target.value })} placeholder="Due day" />
          <button className="btn btn-primary" onClick={add}>Save</button>
        </div>
      </div>
    </div>
  );
}

function TransactionsPage({ transactions, setTransactions, title = "Transactions", compact = false }) {
  const [query, setQuery] = useState("");
  const visible = compact
    ? transactions.slice(0, 12)
    : transactions.filter((t) => `${t.name} ${t.entity} ${t.category} ${t.type}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div>
          <h2 className="section-title">{title}</h2>
          <div className="small muted">Savings transfers stay excluded from real income/expense.</div>
        </div>
        {!compact && <div style={{ width: 260 }}><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" /></div>}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Status</th>
              <th>Sync</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>
                  <div>{t.name}</div>
                  <div className="small muted">{t.entity}</div>
                </td>
                <td>{t.category}</td>
                <td>
                  <span className={`status-pill ${t.status === "counted" ? "status-counted" : t.status === "excluded" ? "status-excluded" : "status-watch"}`}>
                    {t.status}
                  </span>
                </td>
                <td>{t.synced ? <Cloud size={16} color="#6ee7b7" /> : <CloudOff size={16} color="#94a3b8" />}</td>
                <td>{gbp.format(t.amount)}</td>
                <td><button className="btn" onClick={() => setTransactions((prev) => prev.filter((x) => x.id !== t.id))}><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsPage({ transactions }) {
  const totals = calcTotals(transactions);
  const healthScore = Math.max(0, Math.min(100, Math.round(50 + (totals.net / Math.max(totals.expenses, 1)) * 50)));
  return (
    <div className="grid-4">
      <MetricCard title="Cashflow Health" value={`${healthScore}%`} subtitle="Income vs expense" icon={TrendingUp} />
      <MetricCard title="Counted Items" value={String(transactions.filter((t) => t.status === "counted").length)} subtitle="Used in real totals" icon={CheckCircle2} />
      <MetricCard title="Excluded Items" value={String(transactions.filter((t) => t.status === "excluded").length)} subtitle="Savings/internal" icon={PiggyBank} />
      <MetricCard title="Watch Items" value={String(transactions.filter((t) => t.status === "watch").length)} subtitle="Broker/investment" icon={LineChart} />
    </div>
  );
}

function CloudSyncPage({ transactions, cloudSettings, setCloudSettings }) {
  const [draft, setDraft] = useState(cloudSettings);
  const [message, setMessage] = useState("");

  function saveSettings() {
    const next = { ...draft, connected: Boolean(draft.url && draft.anonKey), lastSync: cloudSettings.lastSync || null };
    setCloudSettings(next);
    localStorage.setItem(CLOUD_KEY, JSON.stringify(next));
    setMessage(next.connected ? "Cloud settings saved. Ready to sync." : "Settings saved in local mode.");
  }

  return (
    <div className="grid-3">
      <div className="card" style={{ gridColumn: "span 2" }}>
        <h2 className="section-title">Connect permanent storage</h2>
        <p className="muted">Add your Supabase URL and anon key. Then deploy and connect app.sentimo.cloud.</p>
        <div className="form-grid" style={{ marginTop: 16 }}>
          <input value={draft.url || ""} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://your-project.supabase.co" />
          <input value={draft.anonKey || ""} onChange={(e) => setDraft({ ...draft, anonKey: e.target.value })} placeholder="Supabase anon public key" />
          <button className="btn btn-primary" onClick={saveSettings}><Save size={16} /> Save Settings</button>
        </div>
        {message && <div style={{ marginTop: 14 }} className="small muted">{message}</div>}
      </div>
      <div className="card">
        <h2 className="section-title">Sync status</h2>
        <div className="small muted">Mode</div>
        <div className="metric-value">{cloudSettings.connected ? "Cloud" : "Local"}</div>
        <div className="small muted" style={{ marginTop: 10 }}>Transactions: {transactions.length}</div>
      </div>
    </div>
  );
}

function SettingsPage({ transactions, setTransactions, user, setUser }) {
  return (
    <div className="grid-3">
      <div className="card">
        <h2 className="section-title">Database-ready</h2>
        <p className="muted">Supabase schema is prepared.</p>
        <button className="btn btn-primary" onClick={() => downloadFile("sentimo-supabase-schema.sql", "-- add your schema here")}>Download SQL</button>
      </div>
      <div className="card">
        <h2 className="section-title">Login active</h2>
        <p className="muted">Current demo user: {user.email}</p>
        <button className="btn" onClick={() => { localStorage.removeItem(USER_KEY); setUser(null); }}>Sign Out</button>
      </div>
      <div className="card">
        <h2 className="section-title">Export data</h2>
        <button className="btn" onClick={() => downloadFile("sentimo-transactions.json", JSON.stringify(transactions, null, 2), "application/json")}>Export JSON</button>
        <div style={{ height: 10 }} />
        <button className="btn" onClick={() => setTransactions(startingTransactions)}>Reset Demo Data</button>
      </div>
    </div>
  );
}

function BuildingIcon({ type }) {
  if (type === "Company") return <CreditCard size={14} />;
  return <CheckCircle2 size={14} />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState(startingTransactions);
  const [rules, setRules] = useState(rulesSeed);
  const [budgetTargets] = useState(budgetTargetsSeed);
  const [fixedObligations, setFixedObligations] = useState(fixedObligationsSeed);
  const [cloudSettings, setCloudSettings] = useState({ url: "", anonKey: "", connected: false, lastSync: null });
  const [activePage, setActivePage] = useState("Dashboard");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      const savedTransactions = localStorage.getItem(STORAGE_KEY);
      const savedCloud = localStorage.getItem(CLOUD_KEY);
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedCloud) setCloudSettings(JSON.parse(savedCloud));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  function handleLogin(nextUser) {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="app-shell">
      <div className="layout">
        <Sidebar activePage={activePage} setActivePage={setActivePage} user={user} cloudSettings={cloudSettings} />
        <main className="main">
          <div className="header">
            <div>
              <div className="small muted">Sentimo · {activePage}</div>
              <h1 style={{ margin: "8px 0" }}>{activePage}</h1>
              <div className="muted">Financial behaviour control, bank statement analysis, savings exclusions, merchant analysis, and cloud sync.</div>
            </div>
            <div className="header-actions">
              <button className="btn" onClick={() => setActivePage("Import CSV")}><Upload size={16} /> Import CSV</button>
              <button className="btn btn-primary" onClick={() => setActivePage("Cloud Sync")}><Cloud size={16} /> Cloud</button>
            </div>
          </div>

          {activePage === "Dashboard" && <DashboardPage transactions={transactions} setTransactions={setTransactions} budgetTargets={budgetTargets} fixedObligations={fixedObligations} />}
          {activePage === "Import CSV" && <ImportCsvPage transactions={transactions} setTransactions={setTransactions} rules={rules} />}
          {activePage === "Rules" && <RulesPage rules={rules} setRules={setRules} />}
          {activePage === "Fixed Expenses" && <FixedExpensesPage fixedObligations={fixedObligations} setFixedObligations={setFixedObligations} />}
          {activePage === "Daily Expenses" && <TransactionsPage transactions={transactions.filter((t) => t.type === "expense")} setTransactions={setTransactions} title="Daily Expenses" />}
          {activePage === "Income & Deposits" && <TransactionsPage transactions={transactions.filter((t) => t.type === "income" || t.type === "investment_in")} setTransactions={setTransactions} title="Income & Deposits" />}
          {activePage === "Trading P&L" && <TransactionsPage transactions={transactions.filter((t) => t.type.includes("investment") || t.category === "Investments")} setTransactions={setTransactions} title="Trading P&L / Broker Watch" />}
          {activePage === "Analytics" && <AnalyticsPage transactions={transactions} />}
          {activePage === "Cloud Sync" && <CloudSyncPage transactions={transactions} cloudSettings={cloudSettings} setCloudSettings={setCloudSettings} />}
          {activePage === "Settings" && <SettingsPage transactions={transactions} setTransactions={setTransactions} user={user} setUser={setUser} />}
        </main>
      </div>
    </div>
  );
}
