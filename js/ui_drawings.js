// File: js/ui_drawings.js
(function () {
  const { esc } = window.UIH;

  const fmtInt = (n)=> Number.isFinite(n) ? String(Math.round(n)) : "0";
  const fmt = (n)=> Number.isFinite(n) ? (Math.round(n*100)/100).toFixed(2) : "0.00";

  function render(m){
    return `
      <div class="kpis" style="grid-template-columns: 1fr 1fr 1fr;">
        <div class="kpi">
          <div class="kpiLabel">Selected Scale</div>
          <div class="kpiValue">${esc(m.scale)}</div>
        </div>
        <div class="kpi">
          <div class="kpiLabel">Usable Area / A1 Sheet (m²)</div>
          <div class="kpiValue">${fmtInt(m.usableMain)}</div>
        </div>
        <div class="kpi">
          <div class="kpiLabel">Facilities Usable Area @ 1:100 (m²)</div>
          <div class="kpiValue">${fmtInt(m.usableFac)}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="tableWrap">
        <table class="tTable">
          <thead>
            <tr>
              <th>Type</th>
              <th class="tCenter" style="width:160px;">Basis</th>
              <th class="tCenter" style="width:160px;">Qty</th>
              <th class="tCenter" style="width:160px;">Estimated Drawings</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Plans (Main Area)</b></td>
              <td class="tCenter">${esc(m.scale)}</td>
              <td class="tCenter">${fmtInt(m.mainArea)} m²</td>
              <td class="tCenter"><b>${fmtInt(m.plansMain)}</b></td>
            </tr>
            <tr>
              <td><b>Plans (Facilities)</b></td>
              <td class="tCenter">1:100</td>
              <td class="tCenter">${fmtInt(m.facArea)} m²</td>
              <td class="tCenter"><b>${fmtInt(m.plansFac)}</b></td>
            </tr>
            <tr>
              <td><b>Total Plans</b></td>
              <td class="tCenter">—</td>
              <td class="tCenter">${fmtInt(m.totalAreaForReport)} m²</td>
              <td class="tCenter"><b>${fmtInt(m.plansTotal)}</b></td>
            </tr>
            <tr>
              <td><b>Profiles</b></td>
              <td class="tCenter">1 profile / 1000 m</td>
              <td class="tCenter">${fmtInt(m.profiles)} sheets</td>
              <td class="tCenter"><b>${fmtInt(m.profiles)}</b></td>
            </tr>
            <tr>
              <td><b>Details</b></td>
              <td class="tCenter">10 / sub-discipline</td>
              <td class="tCenter">${fmtInt(m.subCount)} sub-disciplines</td>
              <td class="tCenter"><b>${fmtInt(m.details)}</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="smallNote" style="margin-top:10px;">
        Suggested plan sheet grid: <b>${fmtInt(m.grid.rows)} rows × ${fmtInt(m.grid.cols)} columns</b>
      </div>
    `;
  }

  window.UIDrawings = { render };
})();
