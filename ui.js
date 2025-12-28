document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("inputs").innerHTML = `
    <label>Base Fee</label>
    <input id="baseFee" type="number" value="${DEFAULTS.baseFee}">
    <button id="calcBtn">Calculate</button>
  `;

  document.getElementById("outputs").innerHTML = `
    <h3>Total Cost</h3>
    <div id="result">—</div>
  `;

  document.getElementById("calcBtn").addEventListener("click", () => {
    const baseFee = Number(document.getElementById("baseFee").value);

    const designFee = calculateDesignFee({
      baseFee,
      projectType: "pipeline",
      stage: "concept",
      complexity: "normal"
    });

    const total = calculateTotal(designFee, 15, 10, 5000);

    document.getElementById("result").innerText =
      total.toLocaleString() + " SAR";
  });
});
