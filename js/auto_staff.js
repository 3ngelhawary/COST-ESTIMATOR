// File: js/auto_staff.js
(function () {
  function hasJuniorOverrides(st) {
    const ov = st.teamOverrides || {};
    return Object.keys(ov).some(k => k.startsWith("Junior –"));
  }

  function clearJuniorOverrides(st) {
    const ov = st.teamOverrides || {};
    Object.keys(ov).forEach(k => {
      if (k.startsWith("Junior –")) delete ov[k];
    });
    st.teamOverrides = ov;
  }

  // Rule:
  // If calculated duration > 10 months → make ALL juniors = 2, recalc,
  // if still >10 → make ALL juniors = 3, etc.
  function applyAutoJunior(st, maxMonths = 10, maxLevel = 10) {
    if (hasJuniorOverrides(st)) return; // user already edited juniors → do not auto-change

    const baseLevel = Math.max(1, parseInt(st.autoJuniorLevel || 1, 10) || 1);
    let chosen = baseLevel;

    for (let lvl = 1; lvl <= maxLevel; lvl++) {
      st.autoJuniorLevel = lvl;

      // rebuild default juniors for this level (overwrite only when user never edited juniors)
      clearJuniorOverrides(st);
      window.TeamModel.build(st); // seeds defaults into overrides

      const res = window.RatesEngine.compute(st);
      const dur = res.projectDuration || 0;

      chosen = lvl;

      // if no scope selected yet, keep level 1
      if (dur === 0) { chosen = 1; st.autoJuniorLevel = 1; break; }

      if (dur <= maxMonths) break;
    }

    st.autoJuniorLevel = chosen;
  }

  window.AutoStaff = { applyAutoJunior };
})();
