// ================================
// PipX - Main App Logic
// ================================


// ---------- PAGE NAVIGATION ----------

function showPage(pageId) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(pageId).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  const buttons = document.querySelectorAll(".nav-btn");

  buttons.forEach(btn => {
    if (btn.getAttribute("onclick")?.includes(pageId)) {
      btn.classList.add("active");
    }
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ---------- TRADING JOURNAL ----------

let trades = JSON.parse(localStorage.getItem("pipxTrades")) || [];

function saveTrade() {

  const trade = {

    date: document.getElementById("tradeDate").value,

    pair: document.getElementById("tradePair").value,

    direction: document.getElementById("direction").value,

    entry: Number(document.getElementById("entry").value),

    sl: Number(document.getElementById("sl").value),

    tp: Number(document.getElementById("tp").value),

    result: document.getElementById("result").value,

    pips: Number(document.getElementById("pips").value),

    notes: document.getElementById("notes").value

  };


  if (!trade.date || !trade.entry || !trade.sl || !trade.tp) {

    alert("Please fill Date, Entry, SL and TP.");

    return;
  }


  trades.push(trade);

  localStorage.setItem(
    "pipxTrades",
    JSON.stringify(trades)
  );


  document.getElementById("tradeDate").value = "";
  document.getElementById("entry").value = "";
  document.getElementById("sl").value = "";
  document.getElementById("tp").value = "";
  document.getElementById("pips").value = "";
  document.getElementById("notes").value = "";


  renderTrades();

  updateDashboard();

  updateAnalytics();


  alert("Trade saved successfully ✅");
}


// ---------- DISPLAY TRADES ----------

function renderTrades() {

  const list = document.getElementById("tradeList");

  list.innerHTML = "";


  if (trades.length === 0) {

    list.innerHTML = `
      <div class="trade-item">
        No trades recorded yet.
      </div>
    `;

    return;
  }


  [...trades].reverse().forEach((trade, index) => {

    const item = document.createElement("div");

    item.className = "trade-item";

    item.innerHTML = `

      <div>
        <strong>${trade.pair}</strong>
        — ${trade.direction}
      </div>

      <div>
        Date: ${trade.date}
      </div>

      <div>
        Entry: ${trade.entry}
      </div>

      <div>
        SL: ${trade.sl}
      </div>

      <div>
        TP: ${trade.tp}
      </div>

      <div>
        Result: ${trade.result}
      </div>

      <div>
        Pips: ${trade.pips}
      </div>

      ${
        trade.notes
          ? `<div>Notes: ${trade.notes}</div>`
          : ""
      }

    `;

    list.appendChild(item);

  });
}


// ---------- DASHBOARD ----------

function updateDashboard() {

  const total = trades.length;

  const wins = trades.filter(
    trade => trade.result === "WIN"
  ).length;


  const winRate =
    total > 0
      ? Math.round((wins / total) * 100)
      : 0;


  const totalPips = trades.reduce(
    (sum, trade) => sum + Number(trade.pips || 0),
    0
  );


  document.getElementById("totalTrades").textContent =
    total;


  document.getElementById("winRate").textContent =
    winRate + "%";


  document.getElementById("totalPips").textContent =
    totalPips;


  document.getElementById("netPL").textContent =
    "₹" + totalPips;
}


// ---------- ANALYTICS ----------

function updateAnalytics() {

  const total = trades.length;

  const wins = trades.filter(
    trade => trade.result === "WIN"
  ).length;


  const winRate =
    total > 0
      ? Math.round((wins / total) * 100)
      : 0;


  document.getElementById("winProgress").style.width =
    winRate + "%";


  if (total === 0) {

    document.getElementById("analyticsText").textContent =
      "No trades recorded yet.";

    return;
  }


  document.getElementById("analyticsText").innerHTML =

    `Total Trades: <strong>${total}</strong><br>
     Winning Trades: <strong>${wins}</strong><br>
     Win Rate: <strong>${winRate}%</strong>`;
}


// ---------- RISK CALCULATOR ----------

function calculateRisk() {

  const balance =
    Number(document.getElementById("balance").value);


  const riskPercent =
    Number(document.getElementById("riskPercent").value);


  const stopLoss =
    Number(document.getElementById("stopLoss").value);


  if (!balance || !riskPercent || !stopLoss) {

    alert("Please enter all calculator values.");

    return;
  }


  const riskAmount =
    balance * (riskPercent / 100);


  const riskPerPip =
    riskAmount / stopLoss;


  document.getElementById("riskAmount").textContent =
    "₹" + riskAmount.toFixed(2);


  document.getElementById("riskPerPip").textContent =
    "₹" + riskPerPip.toFixed(2);
}


// ---------- START APP ----------

document.addEventListener("DOMContentLoaded", () => {

  renderTrades();

  updateDashboard();

  updateAnalytics();

});
