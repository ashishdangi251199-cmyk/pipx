// ================================
// PipX Pro - Master Logic
// ================================

let editingTradeIndex = null;
let chartInstance = null;

// ---------- PAGE NAVIGATION ----------
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));

  const selectedPage = document.getElementById(pageId);
  if (selectedPage) selectedPage.classList.add("active");

  const buttons = document.querySelectorAll(".nav-btn");
  buttons.forEach(btn => {
    if (btn.getAttribute("onclick")?.includes(pageId)) {
      btn.classList.add("active");
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- CUSTOM LOT CALCULATOR ----------
function calculateCustomLotSize() {
  const risk = parseFloat(document.getElementById("calcRisk").value);
  const slPips = parseFloat(document.getElementById("calcSL").value);

  if (isNaN(risk) || isNaN(slPips) || slPips <= 0) {
    document.getElementById("lotSizeResult").innerText = "0.00";
    return;
  }

  const lotSize = (risk / slPips) / 10;
  document.getElementById("lotSizeResult").innerText = lotSize.toFixed(2);
}

// ---------- TRADING JOURNAL LOGIC ----------
let trades = JSON.parse(localStorage.getItem("pipxProTrades")) || [];

function saveTrade() {
  const trade = {
    date: document.getElementById("tradeDate").value || new Date().toISOString().slice(0, 10),
    pair: document.getElementById("tradePair").value,
    direction: document.getElementById("direction").value,
    setup: document.getElementById("setupStrategy").value,
    entry: Number(document.getElementById("entryPrice").value),
    risk: Number(document.getElementById("journalRisk").value) || 0,
    pips: Number(document.getElementById("journalPips").value) || 0,
    result: document.getElementById("result").value,
    screenshot: document.getElementById("screenshotUrl").value,
    notes: document.getElementById("notes").value
  };

  if (!trade.entry || isNaN(trade.entry)) {
    alert("Please enter a valid Entry Price.");
    return;
  }

  if (editingTradeIndex !== null) {
    trades[editingTradeIndex] = trade;
    editingTradeIndex = null;
    alert("Trade updated successfully ✅");
  } else {
    trades.push(trade);
    alert("Trade saved successfully ✅");
  }

  localStorage.setItem("pipxProTrades", JSON.stringify(trades));
  resetForm();
  renderTrades();
  updateDashboard();
}

function editTrade(index) {
  const trade = trades[index];
  editingTradeIndex = index;

  document.getElementById("tradeDate").value = trade.date;
  document.getElementById("tradePair").value = trade.pair;
  document.getElementById("direction").value = trade.direction;
  document.getElementById("setupStrategy").value = trade.setup || "";
  document.getElementById("entryPrice").value = trade.entry;
  document.getElementById("journalRisk").value = trade.risk || "";
  document.getElementById("journalPips").value = trade.pips;
  document.getElementById("result").value = trade.result;
  document.getElementById("screenshotUrl").value = trade.screenshot || "";
  document.getElementById("notes").value = trade.notes || "";

  document.getElementById("formTitle").innerText = "✏️ Edit Trade";
  document.getElementById("saveBtn").innerText = "Update Trade";
  document.getElementById("cancelEditBtn").style.display = "block";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  editingTradeIndex = null;
  resetForm();
}

function deleteTrade(index) {
  if (confirm("Are you sure you want to delete this trade?")) {
    trades.splice(index, 1);
    localStorage.setItem("pipxProTrades", JSON.stringify(trades));
    renderTrades();
    updateDashboard();
  }
}

function resetForm() {
  document.getElementById("tradeDate").value = "";
  document.getElementById("entryPrice").value = "";
  document.getElementById("setupStrategy").value = "";
  document.getElementById("journalRisk").value = "";
  document.getElementById("journalPips").value = "";
  document.getElementById("screenshotUrl").value = "";
  document.getElementById("notes").value = "";
  
  document.getElementById("tradePair").selectedIndex = 0;
  document.getElementById("direction").selectedIndex = 0;
  document.getElementById("result").selectedIndex = 0;

  document.getElementById("formTitle").innerText = "Add New Trade";
  document.getElementById("saveBtn").innerText = "Save Trade";
  document.getElementById("cancelEditBtn").style.display = "none";
}

// ---------- RENDER HISTORY ----------
function renderTrades() {
  const list = document.getElementById("tradeList");
  list.innerHTML = "";

  const searchText = document.getElementById("searchPair")?.value.toUpperCase() || "";
  const filterVal = document.getElementById("filterResult")?.value || "ALL";

  let filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.pair.toUpperCase().includes(searchText);
    const matchesFilter = filterVal === "ALL" || trade.result === filterVal;
    return matchesSearch && matchesFilter;
  });

  if (filteredTrades.length === 0) {
    list.innerHTML = `<div class="no-trades">No trades recorded yet.</div>`;
    return;
  }

  [...filteredTrades].reverse().forEach((trade) => {
    const originalIndex = trades.indexOf(trade);
    let resultClass = trade.result.toLowerCase();

    const card = document.createElement("div");
    card.className = `trade-item ${resultClass}`;
    card.innerHTML = `
      <div class="trade-card-header">
        <div>
          <span class="pair-name">${trade.pair}</span>
          <span class="direction-badge">${trade.direction}</span>
        </div>
        <div class="card-actions">
          <button onclick="editTrade(${originalIndex})" class="action-btn edit">✏️</button>
          <button onclick="deleteTrade(${originalIndex})" class="action-btn delete">🗑️</button>
        </div>
      </div>
      
      <div class="trade-card-body">
        <div class="meta-row">
          <span>📅 ${trade.date}</span>
          ${trade.setup ? `<span>🎯 ${trade.setup}</span>` : ""}
          <span class="result-status">[ ${trade.result} ]</span>
        </div>
        
        <div class="prices-box">
          <div>Entry: ${trade.entry}</div>
          <div>Risk: $${trade.risk}</div>
          <div>Pips: <strong class="pip-sum">${trade.pips}</strong></div>
        </div>
        
        ${trade.notes ? `<div class="notes-preview">"${trade.notes}"</div>` : ""}
        
        ${trade.screenshot 
          ? `<a href="${trade.screenshot}" target="_blank" class="ss-link">🖼️ View Screenshot / Chart</a>` 
          : ""}
      </div>
    `;
    list.appendChild(card);
  });
}

// ---------- DASHBOARD STATS & CHART ----------
function updateDashboard() {
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result === "WIN").length;
  const losses = trades.filter(t => t.result === "LOSS").length;
  const totalPips = trades.reduce((sum, t) => sum + Number(t.pips || 0), 0);
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;

  document.getElementById("totalTrades").innerText = totalTrades;
  document.getElementById("winRate").innerText = winRate + "%";
  document.getElementById("totalPips").innerText = totalPips;
  document.getElementById("netPL").innerText = "$" + totalPips;

  renderChart(wins, losses);
}

function renderChart(wins, losses) {
  const ctx = document.getElementById("performanceChart")?.getContext("2d");
  if (!ctx) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Wins", "Losses"],
      datasets: [{
        data: [wins, losses],
        backgroundColor: ["#00d084", "#ff4d4d"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#ffffff" } }
      }
    }
  });
}

// ---------- EXPORT CSV ----------
function exportCSV() {
  if (trades.length === 0) { alert("No data to export!"); return; }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Date,Pair,Direction,Setup,EntryPrice,Risk($),Pips,Result,Screenshot,Notes\n";

  trades.forEach((t) => {
    const sanitizedNotes = (t.notes || '').replace(/"/g, '""').replace(/\n/g, ' ');
    const row = [
      `"${t.date}"`, `"${t.pair}"`, `"${t.direction}"`, `"${t.setup || ''}"`,
      t.entry, t.risk, t.pips, `"${t.result}"`, `"${t.screenshot || ''}"`, `"${sanitizedNotes}"`
    ].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `PipX_Trade_Journal_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
  renderTrades();
  updateDashboard();
  calculateCustomLotSize();
});
