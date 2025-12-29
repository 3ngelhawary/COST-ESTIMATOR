// File: js/ui_pricing.js
(function () {
  const { esc } = window.UIH;

  function fmt(n) {
    if (!Number.isFinite(n)) return "0.00";
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  function render(model) {
    const rateVal = fmt(model.avgManHourCost);

    return `
      <div class="field">
        <label>AVG. Man-Hours Cost ($/hr)</label>
        <input id="avgManHourCost" name="avgManHourCost" type="number" min="0" step="0.01" value="${esc(rateVal)}">
        <div class="smallNote">1 labor can achieve <b>${model.hoursPerPersonPerMonth}</b> hrs/month</div>
      </div>

      <div class="divider"></div>

      <div class="kpis" style="grid-template-columns: 1fr 1fr;">
        <div class="kpi">
          <div class="kpiLabel">Total Staff</div>
          <div class="kpiValue">${model.totalStaff}</div>
        </div>
        <div class="kpi">
          <div class="kpiLabel">Total Man-Hours / Month</div>
          <div class="kpiValue">${fmt(model.totalMHMonth)}</div>
        </div>
        <div class="kpi">
          <div class="kpiLabel">Monthly Cost ($)</div>
          <div class="kpiValue">${fmt(model.totalCostMonth)}</div>
        </div>
        <div class="kpi">
          <div class="kpiLabel">Total Cost ($)</div>
          <div class="kpiValue">${fmt(model.totalCost)}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="tableWrap">
        <table class="tTable">
          <thead>
            <tr>
              <th>Role</th>
              <th class="tCenter" style="width:70px;">Qty</th>
              <th class="tCenter" style="width:120px;">MH/Month</th>
              <th class="tCenter" style="width:120px;">$/Month</th>
              <th class="tCenter" style="width:120px;">Total $</th>
            </tr>
          </thead>
          <tbody>
            ${
              model.rows.length
                ? model.rows.map(r => `
                  <tr>
                    <td>${esc(r.role)}</td>
                    <td class="tCenter">${r.qty}</td>
                    <td class="tCenter">${fmt(r.mhPerMonth)}</td>
                    <td class="tCenter">${fmt(r.costPerMonth)}</td>
                    <td class="tCenter"><b>${fmt(r.total)}</b></td>
                  </tr>
                `).join("")
                : `<tr><td colspan="5" class="tCenter muted">No staff in Project Team Structure</td></tr>`
            }
          </tbody>
        </table>
      </div>

      <div class="smallNote" style="margin-top:10px;">
        Total Cost = Total Staff × ${model.hoursPerPersonPerMonth} (hrs/month) × AVG Cost × Project Duration (months)
      </div>
    `;
  }

  window.UIPricing = { render };
})();
