// File: js/ui_pricing.js
(function () {
  const { esc } = window.UIH;
  const sym = () => window.APP_CONFIG.currencySymbol;

  function fmt(n) {
    if (!Number.isFinite(n)) return "0.00";
    return (Math.round(n * 100) / 100).toLocaleString("en-US", {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  function render(model) {
    const s = sym();
    return `
      <div class="field">
        <label>AVG. Man-Hour Cost (${s}/hr)</label>
        <input id="avgManHourCost" type="number" min="0" step="0.5" value="${fmt(model.avgManHourCost)}">
        <div class="smallNote">Each person produces <b>${model.hoursPerPersonPerMonth}</b> billable hrs / month.</div>
      </div>

      <div class="divider"></div>

      <div class="kpis" style="grid-template-columns:1fr 1fr;">
        <div class="kpi">
          <div class="kpiLabel">Total Staff</div>
          <div class="kpiValue">${model.totalStaff}</div>
        </div>
        <div class="kpi">
          <div class="kpiLabel">Project Duration (mo.)</div>
          <div class="kpiValue">${fmt(model.durationMonths)}</div>
        </div>
        <div class="kpi">
          <div class="kpiLabel">Team Man-Hours / Month</div>
          <div class="kpiValue">${fmt(model.totalMHMonth)}</div>
        </div>
        <div class="kpi">
          <div class="kpiLabel">Monthly Cost (${s})</div>
          <div class="kpiValue">${fmt(model.totalCostMonth)}</div>
        </div>
      </div>

      <div class="kpis" style="grid-template-columns:1fr;margin-top:10px;">
        <div class="kpi" style="border:1px solid rgba(59,130,246,0.4);background:rgba(59,130,246,0.07);">
          <div class="kpiLabel">Total Project Cost (${s})</div>
          <div class="kpiValue" style="font-size:22px;">${fmt(model.totalCost)}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="tableWrap">
        <table class="tTable">
          <thead>
            <tr>
              <th>Role</th>
              <th class="tCenter" style="width:50px">Qty</th>
              <th class="tCenter" style="width:100px">MH / Month</th>
              <th class="tCenter" style="width:110px">${s} / Month</th>
              <th class="tCenter" style="width:110px">Total ${s}</th>
            </tr>
          </thead>
          <tbody>
            ${model.rows.length
              ? model.rows.map(r => `
                <tr>
                  <td>${esc(r.role)}</td>
                  <td class="tCenter">${r.qty}</td>
                  <td class="tCenter">${fmt(r.mhPerMonth)}</td>
                  <td class="tCenter">${fmt(r.costPerMonth)}</td>
                  <td class="tCenter"><b>${fmt(r.total)}</b></td>
                </tr>`).join("")
              : `<tr><td colspan="5" class="tCenter muted" style="padding:12px;">No staff in team.</td></tr>`
            }
          </tbody>
        </table>
      </div>

      <div class="smallNote" style="margin-top:10px;">
        Total = Staff × ${model.hoursPerPersonPerMonth} hrs/month × Rate × Duration
      </div>`;
  }

  window.UIPricing = { render };
})();
