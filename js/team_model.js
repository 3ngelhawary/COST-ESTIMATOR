// File: js/team_model.js
(function () {
  const { f } = window.UIH;
  const canon = (s) => String(s || "").trim().toLowerCase();

  const MEP_GROUPS = {
    mech: ["hvac", "fire fighting", "firefighting", "chiller"],
    elec: ["lighting", "power", "cctv"],
    ict: ["bms", "data cabling", "telephone"],
    plum: ["plumbing"]
  };

  function ensureOverrides(st) {
    if (!st.teamOverrides) st.teamOverrides = {};
    return st.teamOverrides;
  }

  function qty(st, role, def) {
    const ov = ensureOverrides(st);
    const v = ov[role];
    const n = parseInt(v ?? def, 10);
    return Number.isFinite(n) ? Math.max(0, n) : Math.max(0, def);
  }

  function setQty(st, role, val) {
    const ov = ensureOverrides(st);
    ov[role] = Math.max(0, parseInt(val || "0", 10) || 0);
  }

  const onAny = (m) => m && Object.values(m).some(v => v === true);

  function getActive(st) {
    window.UIFacilityInfo.normalize(st);
    const rl = st.roadLandscape?.items || {};
    const fac = st.facilities || [];

    const usedMEP = new Set();
    fac.forEach(r => {
      if (!r.doMEP) return;
      Object.entries(r.mep || {}).forEach(([k, v]) => {
        if (v === true) usedMEP.add(canon(k));
      });
    });

    const mepActive = {
      mech: MEP_GROUPS.mech.some(x => usedMEP.has(x)),
      elec: MEP_GROUPS.elec.some(x => usedMEP.has(x)),
      ict: MEP_GROUPS.ict.some(x => usedMEP.has(x)),
      plum: MEP_GROUPS.plum.some(x => usedMEP.has(x)),
    };

    return {
      wetCount: Object.values(st.disciplines?.wet || {}).filter(v => v === true).length,
      dryCount: Object.values(st.disciplines?.dry || {}).filter(v => v === true).length,
      roads: rl["Roads"] === true,
      landscapeCount: ["Master Planning", "Sub-Soil Drainage"].filter(k => rl[k] === true).length,
      secIrr: rl["Secondary Irrigation"] === true,
      arch: fac.some(r => r.doArch),
      str: fac.some(r => r.doStruct),
      mepAny: Object.values(mepActive).some(v => v),
      mepActive
    };
  }

  function draftsPerDiscipline(st) {
    const area = f(st.projectAreaSqm, 0);
    return area > 0 ? Math.ceil(area / 100000) : 0;
  }

  function build(st) {
    const A = getActive(st);
    const dft = draftsPerDiscipline(st);
    const ov = ensureOverrides(st);

    // auto junior level (1,2,3...) used only as DEFAULT proposal (user overrides stay)
    const juniorLevel = Math.max(1, parseInt(st.autoJuniorLevel || 1, 10) || 1);

    const roles = [];
    const add = (role, def) => {
      // apply auto-level to ALL junior roles as default proposal
      let d = def;
      if (role.startsWith("Junior –")) d = def * juniorLevel;

      // ✅ seed defaults into overrides ONLY if not set (so duration uses initial proposal)
      if (ov[role] === undefined) ov[role] = d;

      roles.push({ role, qty: qty(st, role, d) });
    };

    add("Project Manager", 1);
    add("Project Coordinator", 1);
    if (st.bimRequired) add("BIM Manager", 1);

    // Wet Utilities: 1 Senior + 1 Junior per sub-discipline
    if (A.wetCount > 0) {
      add("Senior – Wet Utilities", 1);
      Object.entries(st.disciplines?.wet || {}).forEach(([k, v]) => {
        if (v === true) add(`Junior – Wet Utilities – ${k}`, 1);
      });
      add("Draftsman – Wet Utilities", dft);
    }

    // Dry Utilities: 1 Senior + 1 Junior per sub-discipline
    if (A.dryCount > 0) {
      add("Senior – Dry Utilities", 1);
      Object.entries(st.disciplines?.dry || {}).forEach(([k, v]) => {
        if (v === true) add(`Junior – Dry Utilities – ${k}`, 1);
      });
      add("Draftsman – Dry Utilities", dft);
    }

    // Road/Landscape: 1 Senior + 1 Junior per active item
    if (A.roads || A.landscapeCount > 0 || A.secIrr) {
      add("Senior – Road/Landscape", 1);
      const rl = st.roadLandscape?.items || {};
      ["Roads", "Master Planning", "Sub-Soil Drainage", "Secondary Irrigation"].forEach(item => {
        if (rl[item] === true) add(`Junior – Road/Landscape – ${item}`, 1);
      });
      add("Draftsman – Road/Landscape", dft);
    }

    // Facilities-based
    if (A.arch) { add("Senior – Architecture", 1); add("Junior – Architecture", 1); add("Draftsman – Architecture", dft); }
    if (A.str)  { add("Senior – Structure", 1); add("Junior – Structure", 1); add("Draftsman – Structure", dft); }

    if (A.mepAny) {
      add("Senior – MEP", 1);
      if (A.mepActive.mech) add("Junior – MEP - Mechanical", 1);
      if (A.mepActive.elec) add("Junior – MEP - Electrical", 1);
      if (A.mepActive.ict)  add("Junior – MEP - ICA/ICT", 1);
      if (A.mepActive.plum) add("Junior – MEP - Plumbing", 1);
      add("Draftsman – MEP", dft);
    }

    return { roles, active: A, draftsPerDiscipline: dft, juniorLevel };
  }

  // Duration uses totals from overrides (seeded by build), and updates when user edits team table
  function engineersFor(st, key) {
    const pick = (r) => qty(st, r, 0);

    if (key === "wet") {
      let t = pick("Senior – Wet Utilities");
      Object.entries(st.disciplines?.wet || {}).forEach(([k, v]) => { if (v === true) t += pick(`Junior – Wet Utilities – ${k}`); });
      return t > 0 ? t : 1;
    }

    if (key === "dry") {
      let t = pick("Senior – Dry Utilities");
      Object.entries(st.disciplines?.dry || {}).forEach(([k, v]) => { if (v === true) t += pick(`Junior – Dry Utilities – ${k}`); });
      return t > 0 ? t : 1;
    }

    if (key === "roads" || key === "landscape" || key === "secIrr") {
      let t = pick("Senior – Road/Landscape");
      const rl = st.roadLandscape?.items || {};
      ["Roads", "Master Planning", "Sub-Soil Drainage", "Secondary Irrigation"].forEach(item => {
        if (rl[item] === true) t += pick(`Junior – Road/Landscape – ${item}`);
      });
      return t > 0 ? t : 1;
    }

    if (key === "arch") return (pick("Senior – Architecture") + pick("Junior – Architecture")) || 1;
    if (key === "str")  return (pick("Senior – Structure") + pick("Junior – Structure")) || 1;

    if (key === "mep") {
      const t =
        pick("Senior – MEP") +
        pick("Junior – MEP - Mechanical") +
        pick("Junior – MEP - Electrical") +
        pick("Junior – MEP - ICA/ICT") +
        pick("Junior – MEP - Plumbing");
      return t > 0 ? t : 1;
    }

    return 1;
  }

  window.TeamModel = { build, setQty, engineersFor, getActive };
})();
