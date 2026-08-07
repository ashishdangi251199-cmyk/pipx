function calculate() {

    let risk = parseFloat(document.getElementById("risk").value);
    let sl = parseFloat(document.getElementById("sl").value);

    if (isNaN(risk) || isNaN(sl) || risk <= 0 || sl <= 0) {
        alert("Please enter valid Risk and Stop Loss.");
        return;
    }

    // Assumption:
    // 1.00 lot = $10 per pip

    let lotSize = risk / (sl * 10);
    let tp = sl * 3;
    let expectedProfit = risk * 3;

    document.getElementById("lotSize").innerText = lotSize.toFixed(2);
    document.getElementById("tp").innerText = tp;
    document.getElementById("profit").innerText = expectedProfit.toFixed(2);
}
