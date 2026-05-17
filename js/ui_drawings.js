// File: js/ui_drawings.js
(function () {
  const { esc } = window.UIH;
  const fmt = (n) => (Number.isFinite(n) ? Math.round(n).toLocaleString() : "0");

  function render(m) {
    return `
      <div class="kpis" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:12px;">
        <div class="kpi">
          <div class="kpiLabel">Scale</div>
          <div class="kpiValue" style="font-size:14px;">${esc(m.scale)}</div>
        </div>
        <div class="kpi">
          <div class="kpiLabel">Usable / A1 (m²)</div>
          <div class="kpiValue" style="font-size:14px;">${fmt(m.usableMain)}</div>
        </div>
        <div class="kpi">
          <div class="kpiLabel">Active Discipline Groups</div>
          <div class="kpiValue" style="font-size:14px;">${m.activeDisciplineGroups}</div>
        </div>
      </div>

      <div class="tableWrap">
        <table class="tTable">
          <thead>
            <tr>
              <th>Drawing Type</th>
              <th class="tCenter" style="width:200px">Basis</th>
              <th class="tCenter" style="width:100px">Count</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Plan Sheets</b></td>
              <td class="tCenter">${m.plansPerGroup} sheets/group × ${m.activeDisciplineGroups} groups</td>
              <td class="tCenter"><b>${fmt(m.totalPlans)}</b></td>
            </tr>
            <tr>
              <td class="muted" style="padding-left:18px;">— Sheets per group</td>
              <td class="tCenter">Main @ ${esc(m.scale)} + Facilities @ 1:100</td>
              <td class="tCenter">${m.plansPerGroup}</td>
            </tr>

            <tr>
              <td><b>Profile Sheets</b></td>
              <td class="tCenter">ceil(Length/1000) × ${m.profileStreams} stream(s)</td>
              <td class="tCenter"><b>${fmt(m.totalProfiles)}</b></td>
            </tr>
            <tr>
              <td class="muted" style="padding-left:18px;">— Base (per 1000 m)</td>
              <td class="tCenter">${m.profileBase} base sheets</td>
              <td class="tCenter"></td>
            </tr>

            <tr>
              <td><b>Detail Drawings</b></td>
              <td class="tCenter">10 per active discipline group</td>
              <td class="tCenter"><b>${fmt(m.totalDetails)}</b></td>
            </tr>

            <tr style="background:rgba(255,255,255,0.03);">
              <td><b>Total Drawings</b></td>
              <td class="tCenter">Plans + Profiles + Details</td>
              <td class="tCenter"><b>${fmt(m.totalDrawings)}</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      ${m.grid.rows > 0
        ? `<div class="smallNote" style="margin-top:10px;">
             Suggested sheet grid (main plan set only):
             <b>${m.grid.rows} rows × ${m.grid.cols} columns</b>
           </div>`
        : ""}`;
  }

  window.UIDrawings = { render };
})();
