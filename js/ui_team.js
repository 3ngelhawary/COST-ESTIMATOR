// File: js/ui_team.js
(function () {
  const { esc } = window.UIH;

  // Canonicalize MEP system names to avoid mismatch (e.g., "Fire Fighting" vs "Firefighting")
  function canon(name) {
    const s = String(name || "").trim().toLowerCase();
    if (s === "fire fighting" || s === "firefighting") return "fire fighting";
    if (s === "data cabling" || s === "data cabling") return "data cabling";
    if (s === "hvac") return "hvac";
    if (s === "chiller") return "chiller";
    if (s === "lighting") return "lighting";
    if (s === "power") return "power";
    if (s === "cctv") return "cctv";
    if (s === "bms") return "bms";
    if (s === "telephone") return "telephone";
    if (s === "plumbing") return "plumbing";
    return s;
  }

  // ✅ EXACTLY 4 TYPES OF MEP JUNIORS (grouped)
  const MEP_GROUPS = [
    { role: "Junior – MEP - Mechanical", systems: ["HVAC", "Fire Fighting", "Chiller"] },
    { role: "Junior – MEP - Electrical", systems: ["Lighting", "Power", "CCTV"] },
    { role: "Junior – MEP - ICA/ICT", systems: ["BMS", "Data Cabling", "Telephone"] },
    { role: "Junior – MEP - Plumbing", systems: ["Plumbing"] }
  ].map(g => ({
    role: g.role,
    systemsCanon: g.systems.map(canon)
  }));

  function build() {
    const st = window.AppState.get();
    window.UIFacilityInfo.normalize(st);

    const seniors = [
      { role: "Project Manager", qty: 1 },
      { role: "Project Coordinator", qty: 1 }
    ];

    if (st.bimRequired) seniors.push({ role: "BIM Manager", qty: 1 });

    if (Object.values(st.disciplines.wet || {}).some(v => v)) seniors.push({ role: "Senior – Wet Utilities", qty: 1 });
    if (Object.values(st.disciplines.dry || {}).some(v => v)) seniors.push({ role: "Senior – Dry Utilities", qty: 1 });
    if (Object.values((st.roadLandscape && st.roadLandscape.items) || {}).some(v => v)) seniors.push({ role: "Senior – Road/Landscape", qty: 1 });

    const hasArch = (st.facilities || []).some(f => f.doArch);
    const hasStr  = (st.facilities || []).some(f => f.doStruct);

    if (hasArch) seniors.push({ role: "Senior – Architecture", qty: 1 });
    if (hasStr)  seniors.push({ role: "Senior – Structure", qty: 1 });

    // -------- Juniors (NEW RULES) --------
    // Arch/Structure: 1 junior if ANY row is checked (no matter how many facilities/rows)
    const juniors = [];
    if (hasArch) juniors.push({ role: "Junior – Architecture", qty: 1 });
    if (hasStr)  juniors.push({ role: "Junior – Structure", qty: 1 });

    // Collect used MEP systems across all facilities (canonicalized)
    const usedMEP = new Set();
    (st.facilities || []).forEach(f => {
      if (!f.doMEP) return;
      Object.entries(f.mep || {}).forEach(([k, v]) => {
        if (v === true) usedMEP.add(canon(k));
      });
    });

    // MEP: ONLY 4 grouped juniors (not per subitem)
    MEP_GROUPS.forEach(g => {
      if (g.systemsCanon.some(s => usedMEP.has(s))) {
        juniors.push({ role: g.role, qty: 1 });
      }
    });

    return { seniors, juniors };
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
          <thead><tr><th colspan="2">Seniors (Editable)</th></tr></thead>
          <tbody>${team.seniors.map((r,i)=>row(r,i,"senior")).join("")}</tbody>
        </table>
      </div>

      <div class="tableWrap" style="margin-top:12px;">
        <table class="tTable">
          <thead><tr><th colspan="2">Juniors (Editable)</th></tr></thead>
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
