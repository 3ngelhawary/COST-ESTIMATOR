// File: js/team_model.js
//
// KEY DESIGN PRINCIPLE (fixes the cost-drops-when-adding-disciplines bug):
// =========================================================================
// Each activated sub-discipline (e.g. Potable Water, Sewage, Storm) gets its
// OWN dedicated Junior engineer(s).  The rates engine treats each sub-discipline
// as an INDEPENDENT work stream with its own duration.  Adding more sub-disciplines
// therefore:
//   • Adds more Junior engineers  →  team grows
//   • Each stream still takes the same time  →  project duration stays / grows (critical path)
//   • Cost = team × duration × rate  →  INCREASES correctly
//
(function () {
  const { f } = window.UIH;

  const MEP_GROUPS = {
    mech: ["hvac", "fire fighting", "firefighting", "chiller"],
    elec: ["lighting", "power", "cctv"],
    ict:  ["bms", "data cabling", "telephone"],
    plum: ["plumbing"]
  };

  function ensureOverrides(st) {
    if (!st.teamOverrides) st.teamOverrides = {};
    return st.teamOverrides;
  }

  function qty(st, role, def) {
    const ov = ensureOverrides(st);
    const v  = ov[role];
    if (v === undefined) return Math.max(0, def);
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? Math.max(0, n) : Math.max(0, def);
  }

  function setQty(st, role, val) {
    const ov   = ensureOverrides(st);
    const n    = parseInt(val || "0", 10);
    ov[role]   = Number.isFinite(n) ? Math.max(0, n) : 0;
  }

  function getActive(st) {
    window.UIFacilityInfo.normalize(st);
    const rl  = st.roadLandscape?.items || {};
    const fac = st.facilities || [];

    const usedMEP = new Set();
    fac.forEach(r => {
      if (!r.doMEP) return;
      Object.entries(r.mep || {}).forEach(([k, v]) => { if (v === true) usedMEP.add(k.toLowerCase()); });
    });

    const mepActive = {
      mech: MEP_GROUPS.mech.some(x => usedMEP.has(x)),
      elec: MEP_GROUPS.elec.some(x => usedMEP.has(x)),
      ict:  MEP_GROUPS.ict.some(x  => usedMEP.has(x)),
      plum: MEP_GROUPS.plum.some(x => usedMEP.has(x))
    };

    return {
      wetCount:       Object.values(st.disciplines?.wet || {}).filter(v => v === true).length,
      dryCount:       Object.values(st.disciplines?.dry || {}).filter(v => v === true).length,
      wetItems:       Object.entries(st.disciplines?.wet || {}).filter(([,v])=>v===true).map(([k])=>k),
      dryItems:       Object.entries(st.disciplines?.dry || {}).filter(([,v])=>v===true).map(([k])=>k),
      roads:          rl["Roads"] === true,
      landscapeCount: ["Master Planning","Sub-Soil Drainage"].filter(k => rl[k] === true).length,
      secIrr:         rl["Secondary Irrigation"] === true,
      arch:           fac.some(r => r.doArch),
      str:            fac.some(r => r.doStruct),
      mepAny:         Object.values(mepActive).some(v => v),
      mepActive
    };
  }

  // How many draftsmen for one main discipline group
  function draftsPerGroup(st) {
    const area = f(st.projectAreaSqm, 0);
    return area > 0 ? Math.max(1, Math.ceil(area / 100000)) : 0;
  }

  // Build the full team role list and seed teamOverrides with defaults
  function build(st) {
    const A   = getActive(st);
    const dft = draftsPerGroup(st);
    const ov  = ensureOverrides(st);
    const jLv = Math.max(1, parseInt(st.autoJuniorLevel || 1, 10) || 1);
    const roles = [];

    function add(role, def) {
      // Scale junior defaults by autoJuniorLevel
      const d = role.startsWith("Junior –") ? def * jLv : def;
      // Seed default only if not yet set by user
      if (ov[role] === undefined) ov[role] = d;
      roles.push({ role, qty: qty(st, role, d) });
    }

    // ── Always-present management roles ──────────────────────────────────────
    add("Project Manager",    1);
    add("Project Coordinator",1);
    if (st.bimRequired) add("BIM Manager", 1);

    // ── Wet Utilities ─────────────────────────────────────────────────────────
    // 1 Senior for the whole wet group
    // 1 dedicated Junior per sub-discipline (each sub-disc is its own work stream)
    if (A.wetCount > 0) {
      add("Senior – Wet Utilities", 1);
      A.wetItems.forEach(k => add(`Junior – Wet – ${k}`, 1));
      if (dft > 0) add("Draftsman – Wet Utilities", dft);
    }

    // ── Dry Utilities ─────────────────────────────────────────────────────────
    if (A.dryCount > 0) {
      add("Senior – Dry Utilities", 1);
      A.dryItems.forEach(k => add(`Junior – Dry – ${k}`, 1));
      if (dft > 0) add("Draftsman – Dry Utilities", dft);
    }

    // ── Roads / Landscape ─────────────────────────────────────────────────────
    if (A.roads || A.landscapeCount > 0 || A.secIrr) {
      add("Senior – Road/Landscape", 1);
      const rl = st.roadLandscape?.items || {};
      window.APP_CONFIG.roadLandscapeItems.forEach(item => {
        if (rl[item] === true) add(`Junior – Road/Landscape – ${item}`, 1);
      });
      if (dft > 0) add("Draftsman – Road/Landscape", dft);
    }

    // ── Facilities ────────────────────────────────────────────────────────────
    if (A.arch) { add("Senior – Architecture", 1); add("Junior – Architecture", 1); if (dft > 0) add("Draftsman – Architecture", dft); }
    if (A.str)  { add("Senior – Structure",    1); add("Junior – Structure",    1); if (dft > 0) add("Draftsman – Structure",    dft); }

    if (A.mepAny) {
      add("Senior – MEP", 1);
      if (A.mepActive.mech) add("Junior – MEP – Mechanical", 1);
      if (A.mepActive.elec) add("Junior – MEP – Electrical", 1);
      if (A.mepActive.ict)  add("Junior – MEP – ICA/ICT",    1);
      if (A.mepActive.plum) add("Junior – MEP – Plumbing",   1);
      if (dft > 0) add("Draftsman – MEP", dft);
    }

    return { roles, active: A, draftsPerGroup: dft, juniorLevel: jLv };
  }

  // ── Engineers available for each work stream ──────────────────────────────
  // CRITICAL: each wet sub-discipline is worked by its OWN dedicated junior
  // PLUS a share of the senior.  The rates engine will call this per sub-disc.

  function engineersForWetSubDisc(st, subDiscName) {
    const ov = ensureOverrides(st);
    const get = (r) => { const v = ov[r]; return (v !== undefined && Number.isFinite(parseInt(v,10))) ? Math.max(0, parseInt(v,10)) : 0; };
    // Senior is shared across wet group — credit 1/wetCount of senior to each sub-disc
    const wetItems = Object.entries(st.disciplines?.wet||{}).filter(([,v])=>v===true).map(([k])=>k);
    const n = wetItems.length || 1;
    const seniorShare = get("Senior – Wet Utilities") / n;
    const junior      = get(`Junior – Wet – ${subDiscName}`);
    return Math.max(0.1, seniorShare + junior); // avoid /0
  }

  function engineersForDrySubDisc(st, subDiscName) {
    const ov = ensureOverrides(st);
    const get = (r) => { const v = ov[r]; return (v !== undefined && Number.isFinite(parseInt(v,10))) ? Math.max(0, parseInt(v,10)) : 0; };
    const dryItems = Object.entries(st.disciplines?.dry||{}).filter(([,v])=>v===true).map(([k])=>k);
    const n = dryItems.length || 1;
    const seniorShare = get("Senior – Dry Utilities") / n;
    const junior      = get(`Junior – Dry – ${subDiscName}`);
    return Math.max(0.1, seniorShare + junior);
  }

  function engineersForRoadsGroup(st) {
    const ov = ensureOverrides(st);
    const get = (r) => { const v = ov[r]; return (v !== undefined && Number.isFinite(parseInt(v,10))) ? Math.max(0, parseInt(v,10)) : 0; };
    let t = get("Senior – Road/Landscape");
    window.APP_CONFIG.roadLandscapeItems.forEach(item => {
      if ((st.roadLandscape?.items||{})[item] === true) t += get(`Junior – Road/Landscape – ${item}`);
    });
    return t > 0 ? t : 1;
  }

  function engineersForKey(st, key, subName) {
    const ov = ensureOverrides(st);
    const get = (r) => { const v = ov[r]; return (v !== undefined && Number.isFinite(parseInt(v,10))) ? Math.max(0, parseInt(v,10)) : 0; };

    if (key === "wet") return engineersForWetSubDisc(st, subName);
    if (key === "dry") return engineersForDrySubDisc(st, subName);

    if (key === "roads" || key === "landscape" || key === "secIrr") return engineersForRoadsGroup(st);

    if (key === "arch") return (get("Senior – Architecture") + get("Junior – Architecture")) || 1;
    if (key === "str")  return (get("Senior – Structure")    + get("Junior – Structure"))    || 1;

    if (key === "mep") {
      return (get("Senior – MEP") + get("Junior – MEP – Mechanical") +
              get("Junior – MEP – Electrical") + get("Junior – MEP – ICA/ICT") +
              get("Junior – MEP – Plumbing")) || 1;
    }
    return 1;
  }

  window.TeamModel = { build, setQty, engineersForKey, getActive };
})();
