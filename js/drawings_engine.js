// File: js/drawings_engine.js
(function () {
  // Usable area per A1 sheet at each scale (m²), with 70% usable factor
  // A1 physical = 0.841 × 0.594 = 0.4995 m²
  // At scale S: 1mm on paper = S mm real → usable = 0.4995 × S² × 0.70
  const USABLE = {
    "1:1000": 349650,
    "1:500":  87413,
    "1:250":  21853,
    "1:100":  3496
  };

  const { f } = window.UIH;
  const ceil  = (x) => Math.ceil(Math.max(0, x));

  function sheetGrid(n) {
    if (n <= 0) return { rows: 0, cols: 0 };
    const aspect = 841 / 594;
    const cols   = Math.max(1, Math.ceil(Math.sqrt(n * aspect)));
    const rows   = Math.ceil(n / cols);
    return { rows, cols };
  }

  function compute(st) {
    const scale     = st.drawingScale || "1:1000";
    const mainArea  = f(st.projectAreaSqm, 0);
    const facArea   = window.UIFacilityInfo.totalFacilityAreaM2(st);
    const usableMain = USABLE[scale] || USABLE["1:1000"];
    const usableFac  = USABLE["1:100"];
    const A = window.TeamModel.getActive(st);

    // Plans: one set per discipline group (not per sub-discipline)
    const plansPerGroup = ceil(mainArea / usableMain) + ceil(facArea / usableFac);
    const activeDisciplineGroups =
      (A.wetCount > 0 ? 1 : 0) +
      (A.dryCount > 0 ? 1 : 0) +
      (A.roads    ? 1 : 0) +
      (A.landscapeCount > 0 ? 1 : 0) +
      (A.secIrr   ? 1 : 0) +
      (A.arch     ? 1 : 0) +
      (A.str      ? 1 : 0) +
      (A.mepAny   ? 1 : 0);

    const totalPlans = plansPerGroup * activeDisciplineGroups;

    // Profiles: 1 sheet per 1000 m, per sub-discipline stream
    // (each wet sub-disc has its own profile sheets, same for dry, roads = 1 stream)
    const lenM           = window.UIInputs.effectiveLength(st);
    const profileBase    = ceil(lenM / 1000);
    const profileStreams  = A.wetCount + A.dryCount + (A.roads ? 1 : 0);
    const totalProfiles  = profileBase * profileStreams;

    // Details: 10 drawings per active discipline group
    const totalDetails   = activeDisciplineGroups * 10;
    const totalDrawings  = totalPlans + totalProfiles + totalDetails;

    const grid = sheetGrid(ceil(mainArea / usableMain));

    return {
      scale, mainArea, facArea, usableMain, usableFac,
      plansPerGroup, activeDisciplineGroups,
      totalPlans, profileBase, profileStreams, totalProfiles,
      totalDetails, totalDrawings, grid
    };
  }

  window.DrawingsEngine = { compute };
})();
