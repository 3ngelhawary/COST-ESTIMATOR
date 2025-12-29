// File: js/ui_team.js
(function () {
  const { esc } = window.UIH;

  const MEP_GROUPS = {
    "MEP – Mechanical": ["HVAC", "Firefighting", "Chiller"],
    "MEP – Electrical": ["Lighting", "Power", "CCTV"],
    "MEP – ICA / ICT": ["BMS", "Data cabling", "Telephone"],
    "MEP – Plumbing": ["Plumbing"]
  };

  function build() {
    const st = window.AppState.get();
    window.UIFacilityInfo.normalize(st);

    const seniors = [
      { role: "Project Manager", qty: 1 },
      { role: "Project Coordinator", qty: 1 }
    ];

    if (st.bimRequired)
      seniors.push({ role: "BIM Manager", qty: 1 });

    if (Object.values(st.disciplines.wet).some(v => v))
      seniors.push({ role: "Senior – Wet Utilities", qty: 1 });

    if (Object.values(st.disciplines.dry).some(v => v))
      seniors.push({ role: "Senior – Dry Utilities", qty: 1 });

    if (Object.values(st.roadLandscape.items).some(v => v))
      seniors.push({ role: "Senior – Road/Landscape", qty: 1 });

    const hasArch = st.facilities.some(f => f.doArch);
    const hasStr  = st.facilities.some(f => f.doStruct);

    if (hasArch) seniors.push({ role: "Senior – Architecture", qty: 1 });
    if (hasStr)  seniors.push({ role: "Senior – Structure", qty: 1 });

    // -------- Juniors (NEW RULES) --------
    const juniors = [];

    if (hasArch)
      juniors.push({ role: "Junior – Architecture", qty: 1 });

    if (hasStr)
      juniors.push({ role: "Junior – Structure", qty: 1 });

    // Collect used MEP systems across all facilities
    const usedMEP = new Set();
    st.facilities.forEach(f => {
      if (!f.doMEP) return;
      Object.entries(f.mep || {}).forEach(([k, v]) => {
        if (v === true) usedMEP.add(k);
      });
    });

    // Apply grouped MEP juniors
    Object.entries(MEP_GROUPS).forEach(([group, systems]) => {
      if (systems.some(s => usedMEP.has(s))) {
        juniors.push({ role: `Junior – ${group}`, qty: 1 });
      }
    });

    return {
      seniors,
      juniors
    };
  }

  function render(team) {
    const row = (r, idx, type) => `
      <tr>
        <td>${esc(r.role)}</td>
        <td class="tCenter">
          <input type="number" min="0" step="1"
                 data-team="${type}" data-idx="${idx}"
                 value="${r.qty}" style="width:70px;text-align:center;">
        </td>
      </tr>
    `;

    return `
      <div class="tableWrap">
        <table class="tTable">
          <thead>
            <tr><th colspan="2">Seniors (Editable)</th></tr>
          </thead>
          <tbody>
            ${team.seniors.map((r,i)=>row(r,i,"senior")).join("")}
          </tbody>
        </table>
      </div>

      <div class="tableWrap" style="margin-top:12px;">
        <table class="tTable">
          <thead>
            <tr><th colspan="2">Juniors (Editable)</th></tr>
          </thead>
          <tbody>
            ${team.juniors.length
              ? team.juniors.map((r,i)=>row(r,i,"junior")).join("")
              : `<tr><td colspan="2" class="tCenter muted">No active scope</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  window.UITeam = { build, render };
})();
