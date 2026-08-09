// ================================
// PipX - Main App Logic
// ================================

// ---------- PAGE NAVIGATION ----------
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.classList.add("active");
  }

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  const buttons = document.querySelectorAll(".nav-btn");
  buttons.forEach(btn => {
    if (btn.getAttribute("onclick")?.includes(pageId)) {
      btn.classList.add("active");
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- LOT SIZE CALCULATOR ----------
function calculateRisk() {
  const riskAmount = parseFloat(document.getElementById("riskAmountInput").value);
  const slPips = parseFloat(document.getElementById("slPipsInput").value);

  if (isNaN(riskAmount) || isNaN(slPips) || slPips <= 0) {
    document.getElementById("lotSizeResult").innerText = "0.00";
    document.getElementById("riskPerPipResult").innerText = "0.00";
    return;
  }

  // Direct calculation: Risk Amount / SL Pips
  const lotSize = riskAmount / slPips;

  document.getElementById("lotSizeResult").innerText = lotSize.toFixed(2);
  document.getElementById("riskPerPipResult").innerText = lotSize.toFixed(2);
}

// ---------- TRADING JOURNAL ----------
let trades = JSON.parse(localStorage.getItem("pipxTrades")) || [];

function saveTrade() {
  const trade = {
    date: document.getElementById("tradeDate").value,
    pair: document.getElementById("tradePair").value,
    direction: document.getElementById("direction").value,
    entry: Number(document.getElementById("journalEntry").value),
    sl: Number(document.getElementById("sl").value),
    tp: Number(document.getElementById("tpJournal").value),
    result: document.getElementById("result").value,
    pips: Number(document.getElementById("journalPips").value),
    notes: document.getElementById("notes").value
  };

  if (!trade.date || !trade.entry || !trade.sl || !trade.tp) {
    alert("Please fill Date, Entry, SL and TP.");
    return;
  }

  trades.push(trade);
  localStorage.setItem("pipxTrades", JSON.stringify(trades));

  document.getElementById("tradeDate").value = "";
  document.getElementById("journalEntry").value = "";
  document.getElementById("sl").value = "";
  document.getElementById("tpJournal").value = "";
  document.getElementById("journalPips").value = "";
  document.getElementById("notes").value = "";

  renderTrades();
  updateDashboard();
  updateAnalytics();

  alert("Trade saved successfully ✅");
}

// ---------- DISPLAY TRADES ----------
function renderTrades() {
  const list = document.getElementById("tradeList");
  if (!list) return;

  list.innerHTML = "";

  if (trades.length === 0) {
    list.innerHTML = `<div class="trade-item">No trades recorded yet.</div>`;
    return;
  }

  [...trades].reverse().forEach((trade) => {
    const item = document.createElement("div");
    item.className = "trade-item";
    item.innerHTML = `
      <div><strong>${trade.pair}</strong> — ${trade.direction}</div>
      <div>Date: ${trade.date}</div>
      <div>Entry: ${trade.entry} | SL: ${trade.sl} | TP: ${trade.tp}</div>
      <div>Result: <strong>${trade.result}</strong> (${trade.pips} Pips)</div>
      ${trade.notes ? `<div>Notes: ${trade.notes}</div>` : ""}
    `;
    list.appendChild(item);
  });
}

// ---------- DASHBOARD ----------
function updateDashboard() {
  const total = trades.length;
  const wins = trades.filter(trade => trade.result === "WIN").length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const totalPips = trades.reduce((sum, trade) => sum + Number(trade.pips || 0), 0);

  document.getElementById("totalTrades").textContent = total;
  document.getElementById("winRate").textContent = winRate + "%";
  document.getElementById("totalPips").textContent = totalPips;
  document.getElementById("netPL").textContent = "₹" + totalPips;
}

// ---------- ANALYTICS ----------
function updateAnalytics() {
  const total = trades.length;
  const wins = trades.filter(trade => trade.result === "WIN").length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  document.getElementById("winProgress").style.width = winRate + "%";

  const analyticsText = document.getElementById("analyticsText");
  if (total === 0) {
    analyticsText.textContent = "No trades recorded yet.";
    return;
  }

  analyticsText.innerHTML = `
    Total Trades: <strong>${total}</strong><br>
    Winning Trades: <strong>${wins}</strong><br>
    Win Rate: <strong>${winRate}%</strong>
  `;
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  renderTrades();
  updateDashboard();
  updateAnalytics();
});
