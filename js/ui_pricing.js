// File: js/ui_pricing.js v40
(function () {
  const { esc } = window.UIH;

  function fmt(n, dec = 2) {
    if (!Number.isFinite(n)) return '0.00';
    return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function fmtInt(n) {
    if (!Number.isFinite(n)) return '0';
    return Math.round(n).toLocaleString('en-US');
  }

  function render(model, st) {
    const sym  = st.currencySym || '$';
    const area = parseFloat(st.projectAreaSqm) || 0;
    const costPerM2 = area > 0 ? model.grandTotal / area : 0;

    const rows = model.rows.map(r => `
      <tr>
        <td>${esc(r.role)}</td>
        <td class="tc mono">${r.qty}</td>
        <td class="tc mono">${fmtInt(r.mhPerMonth)}</td>
        <td class="tc mono">${sym} ${fmt(r.costPerMonth)}</td>
        <td class="tc mono"><b>${sym} ${fmt(r.total)}</b></td>
      </tr>`).join('');

    return `
      <!-- ── Rate Inputs ── -->
      <div class="row2" style="margin-bottom:10px;">
        <div class="field">
          <div class="field-label">Man-Hour Rate <span class="field-hint">${sym}/hr</span></div>
          <input id="avgManHourCost" type="number" min="0" step="0.5" value="${fmt(model.rate)}">
          <div class="field-note">${model.hoursPerPersonPerMonth} hrs / person / month</div>
        </div>
        <div class="field">
          <div class="field-label">Overhead <span class="field-hint">%</span></div>
          <input id="overheadPct" type="number" min="0" max="100" step="1" value="${fmt(st.overheadPct, 0)}">
          <div class="field-note">Applied to direct labor cost.</div>
        </div>
      </div>
      <div class="field" style="margin-bottom:14px;">
        <div class="field-label">Contingency <span class="field-hint">%</span></div>
        <input id="contingencyPct" type="number" min="0" max="50" step="1" value="${fmt(st.contingencyPct, 0)}">
        <div class="field-note">Applied to subtotal (labor + overhead).</div>
      </div>

      <!-- ── Cost Hero ── -->
      <div class="cost-hero">
        <div class="cost-hero-label">Total Project Cost</div>
        <div class="cost-hero-amount">${sym} ${fmtInt(model.grandTotal)}</div>
        <div class="cost-hero-sub">
          <span class="chip">${model.totalStaff} staff</span>
          <span class="chip">${fmt(model.durationMonths, 1)} months</span>
          <span class="chip">${fmtInt(model.totalMHMonth)} MH/mo</span>
        </div>
      </div>

      ${costPerM2 > 0 ? `
      <div style="display:flex;justify-content:center;margin-bottom:14px;">
        <div class="cost-per-sqm">
          ◈ ${sym} ${fmt(costPerM2)} per m²
        </div>
      </div>` : ''}

      <!-- ── Cost Breakdown ── -->
      <div class="cost-lines">
        <div class="cost-line">
          <span>Direct Labor</span>
          <span class="val">${sym} ${fmtInt(model.directCost)}</span>
        </div>
        <div class="cost-line">
          <span>Overhead (${fmt(st.overheadPct, 0)}%)</span>
          <span class="val">${sym} ${fmtInt(model.overhead)}</span>
        </div>
        <div class="cost-line">
          <span>Subtotal</span>
          <span class="val">${sym} ${fmtInt(model.subtotal)}</span>
        </div>
        <div class="cost-line">
          <span>Contingency (${fmt(st.contingencyPct, 0)}%)</span>
          <span class="val">${sym} ${fmtInt(model.contingency)}</span>
        </div>
        <div class="cost-line total-line">
          <span><b>Grand Total</b></span>
          <span class="val"><b>${sym} ${fmtInt(model.grandTotal)}</b></span>
        </div>
      </div>

      <!-- ── Team Cost Table ── -->
      <div class="table-wrap">
        <table class="t-table">
          <thead>
            <tr>
              <th>Role</th>
              <th class="tc" style="width:44px">Qty</th>
              <th class="tc" style="width:90px">MH / Month</th>
              <th class="tc" style="width:110px">${sym} / Month</th>
              <th class="tc" style="width:110px">Total ${sym}</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="5"><div class="empty-state">
              <div class="es-icon">💼</div>No staff assigned yet.
            </div></td></tr>`}
          </tbody>
        </table>
      </div>
      <div class="field-note" style="margin-top:10px;">
        Total = Qty × ${model.hoursPerPersonPerMonth} hrs/mo × Rate × Duration
      </div>`;
  }

  window.UIPricing = { render };
})();
