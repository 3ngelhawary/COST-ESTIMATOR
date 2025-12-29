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
      wet: onAny(st.disciplines?.wet),
      dry: onAny(st.disciplines?.dry),
      roads: rl["Roads"] === true,
      landscape: ["Master Planning", "Sub-Soil Drainage"].some(k => rl[k] === true),
      secIrr: rl["Secondary Irrigation"] === true,
      arch: fac.some(r => r.doArch),
      str: fac.some(r => r.doStruct),
      mepAny: Object.values(mepActive).some(v => v),
      mepActive
    };
  }

  function draftsPerDiscipline(st) {
    const area = f(st.projectAreaSqm, 0);
    const n = area > 0 ? Math.ceil(area / 100000) : 0;
    return n;
  }

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

  function build(st) {
    const A = getActive(st);
    const dft = draftsPerDiscipline(st);

    const roles = [];
    const add = (role, def) => roles.push({ role, qty: qty(st, role, def) });

    add("Project Manager", 1);
    add("Project Coordinator", 1);
    if (st.bimRequired) add("BIM Manager", 1);

    if (A.wet) {
      add("Senior – Wet Utilities", 1);
      add("Junior – Wet Utilities", 1);
      add("Draftsman – Wet Utilities", dft);
    }

    if (A.dry) {
      add("Senior – Dry Utilities", 1);
      add("Junior – Dry Utilities", 1);
      add("Draftsman – Dry Utilities", dft);
    }

    if (A.roads) {
      add("Senior – Roads", 1);
      add("Junior – Roads", 1);
      add("Draftsman – Roads", dft);
    }

    if (A.landscape) {
      add("Senior – Landscape", 1);
      add("Junior – Landscape", 1);
      add("Draftsman – Landscape", dft);
    }

    if (A.secIrr) {
      add("Senior – Secondary Irrigation", 1);
      add("Junior – Secondary Irrigation", 1);
      add("Draftsman – Secondary Irrigation", dft);
    }

    if (A.arch) {
      add("Senior – Architecture", 1);
      add("Junior – Architecture", 1);
      add("Draftsman – Architecture", dft);
    }

    if (A.str) {
      add("Senior – Structure", 1);
      add("Junior – Structure", 1);
      add("Draftsman – Structure", dft);
    }

    if (A.mepAny) {
      add("Senior – MEP", 1);
      if (A.mepActive.mech) add("Junior – MEP - Mechanical", 1);
      if (A.mepActive.elec) add("Junior – MEP - Electrical", 1);
      if (A.mepActive.ict) add("Junior – MEP - ICA/ICT", 1);
      if (A.mepActive.plum) add("Junior – MEP - Plumbing", 1);
      add("Draftsman – MEP", dft);
    }

    return { roles, active: A, draftsPerDiscipline: dft };
  }

  // ✅ Duration uses only totals from Project Team Structure.
  // ✅ Critical fix: if a discipline is active but totals are 0 (not yet initialized), assume 1 engineer.
  function engineersFor(st, key) {
    const pick = (r) => qty(st, r, 0);
    let total = 0;

    if (key === "wet") total = pick("Senior – Wet Utilities") + pick("Junior – Wet Utilities");
    else if (key === "dry") total = pick("Senior – Dry Utilities") + pick("Junior – Dry Utilities");
    else if (key === "roads") total = pick("Senior – Roads") + pick("Junior – Roads");
    else if (key === "landscape") total = pick("Senior – Landscape") + pick("Junior – Landscape");
    else if (key === "secIrr") total = pick("Senior – Secondary Irrigation") + pick("Junior – Secondary Irrigation");
    else if (key === "arch") total = pick("Senior – Architecture") + pick("Junior – Architecture");
    else if (key === "str") total = pick("Senior – Structure") + pick("Junior – Structure");
    else if (key === "mep") {
      total =
        pick("Senior – MEP") +
        pick("Junior – MEP - Mechanical") +
        pick("Junior – MEP - Electrical") +
        pick("Junior – MEP - ICA/ICT") +
        pick("Junior – MEP - Plumbing");
    }

    return total > 0 ? total : 1;
  }

  window.TeamModel = { build, setQty, engineersFor, getActive };
})();
