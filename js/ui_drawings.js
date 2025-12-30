// File: js/ui_drawings.js
(function () {
  const { esc } = window.UIH;

  const fmtInt = (n)=> Number.isFinite(n) ? String(Math.round(n)) : "0";

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
              <th>Drawing Type</th>
              <th class="tCenter" style="width:220px;">Basis</th>
              <th class="tCenter" style="width:160px;">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Plans</b></td>
              <td class="tCenter">Plans per discipline × Active disciplines</td>
              <td class="tCenter"><b>${fmtInt(m.totalPlans)}</b></td>
            </tr>
            <tr>
              <td class="muted">— Plans per discipline</td>
              <td class="tCenter">${esc(m.scale)} (main) + 1:100 (facilities)</td>
              <td class="tCenter">${fmtInt(m.plansPerDiscipline)}</td>
            </tr>
            <tr>
              <td class="muted">— Active disciplines</td>
              <td class="tCenter">Wet / Dry / Roads / Landscape / Sec.Irr / Arch / Str / MEP</td>
              <td class="tCenter">${fmtInt(m.activeDisciplines)}</td>
            </tr>

            <tr>
              <td><b>Profiles</b></td>
              <td class="tCenter">1 sheet / 1000m × (Wet+Dry sub-items + Roads)</td>
              <td class="tCenter"><b>${fmtInt(m.totalProfiles)}</b></td>
            </tr>
            <tr>
              <td class="muted">— Base profile sheets</td>
              <td class="tCenter">ceil(Length/1000)</td>
              <td class="tCenter">${fmtInt(m.profileSheetsBase)}</td>
            </tr>

            <tr>
              <td><b>Details</b></td>
              <td class="tCenter">${fmtInt(m.detailsPerDiscipline)} drawings / active discipline</td>
              <td class="tCenter"><b>${fmtInt(m.totalDetails)}</b></td>
            </tr>

            <tr>
              <td><b>Total Drawings</b></td>
              <td class="tCenter">Plans + Profiles + Details</td>
              <td class="tCenter"><b>${fmtInt(m.totalDrawings)}</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="smallNote" style="margin-top:10px;">
        Suggested plan sheet grid (main plan set only): <b>${fmtInt(m.grid.rows)} rows × ${fmtInt(m.grid.cols)} columns</b>
      </div>
    `;
  }

  window.UIDrawings = { render };
})();
