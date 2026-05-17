// File: js/auto_staff.js
// Automatically increases junior count (autoJuniorLevel) until
// calculated duration ≤ maxMonths, BUT only when the user has NOT
// manually edited any junior quantities.
(function () {

  function hasManualJuniors(st) {
    return !!st._juniorManual;
  }

  function applyAutoJunior(st, maxMonths = 10, maxLevel = 10) {
    if (hasManualJuniors(st)) return; // user is in control

    for (let lvl = 1; lvl <= maxLevel; lvl++) {
      st.autoJuniorLevel = lvl;

      // Clear junior overrides so build() re-seeds them at the new level
      const ov = st.teamOverrides || {};
      Object.keys(ov).forEach(k => { if (k.startsWith("Junior –")) delete ov[k]; });

      // Seed defaults at this level
      window.TeamModel.build(st);

      // Evaluate duration (single pass — no further recursion)
      const res = window.RatesEngine.compute(st);
      const dur = res.projectDuration || 0;

      if (dur === 0 || dur <= maxMonths) break; // target met
    }
  }

  window.AutoStaff = { applyAutoJunior };
})();
