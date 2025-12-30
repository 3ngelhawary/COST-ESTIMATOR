// File: js/drawings_engine.js
(function () {
  const USABLE = { "1:1000": 349000, "1:500": 87000, "1:250": 21800, "1:100": 3500 };
  const num = (x, d=0) => {
    const n = parseFloat(String(x ?? "").replace(/,/g,"").trim());
    return Number.isFinite(n) ? n : d;
  };
  const ceil = (x) => Math.ceil(Math.max(0, x));

  function facilitiesAreaM2(st){
    let a = 0;
    (st.facilities || []).forEach(r=>{
      a += num(r.count,0) * num(r.floors,1) * num(r.area,0);
    });
    return a;
  }

  function sheetGrid(n){
    if (n<=0) return { rows:0, cols:0 };
    const aspect = 841/594;
    const cols = Math.max(1, Math.ceil(Math.sqrt(n * aspect)));
    const rows = Math.ceil(n / cols);
    return { rows, cols };
  }

  function counts(st){
    const wetCount = Object.values(st.disciplines?.wet || {}).filter(v=>v===true).length;
    const dryCount = Object.values(st.disciplines?.dry || {}).filter(v=>v===true).length;
    const rl = st.roadLandscape?.items || {};
    const roadsCount = rl["Roads"]===true ? 1 : 0;
    const landscapeCount = ["Master Planning","Sub-Soil Drainage"].filter(k=>rl[k]===true).length;
    const secIrr = rl["Secondary Irrigation"]===true ? 1 : 0;
    const fac = st.facilities || [];
    const arch = fac.some(r=>r.doArch) ? 1 : 0;
    const str  = fac.some(r=>r.doStruct) ? 1 : 0;
    const mep  = window.TeamModel.getActive(st).mepAny ? 1 : 0;
    return { wetCount, dryCount, roadsCount, landscapeCount, secIrr, arch, str, mep };
  }

  function compute(st){
    const scale = st.drawingScale || "1:1000";

    const mainArea = num(st.projectAreaSqm, 0);
    const facArea  = facilitiesAreaM2(st);

    const usableMain = USABLE[scale] || USABLE["1:1000"];
    const usableFac  = USABLE["1:100"]; // facilities always 1:100

    // plans per discipline = (main plans at master scale) + (facilities plans @ 1:100)
    const plansPerDiscipline = ceil(mainArea / usableMain) + ceil(facArea / usableFac);
    const grid = sheetGrid(ceil(mainArea / usableMain)); // grid suggestion for the main plan set only

    const C = counts(st);
    const activeDisciplines =
      (C.wetCount>0?1:0) + (C.dryCount>0?1:0) + (C.roadsCount>0?1:0) +
      (C.landscapeCount>0?1:0) + (C.secIrr?1:0) + C.arch + C.str + C.mep;

    const totalPlans = plansPerDiscipline * activeDisciplines;

    const lenM = window.UIInputs ? num(window.UIInputs.effectiveLength(st), 0) : 0;
    // profiles: 1 profile sheet / 1000m PER sub-discipline (wet+dry) and PER roads item
    const profileSheetsBase = ceil(lenM / 1000);
    const totalProfiles = profileSheetsBase * (C.wetCount + C.dryCount + C.roadsCount);

    // details: 10 drawings PER active discipline (same approach)
    const detailsPerDiscipline = 10;
    const totalDetails = activeDisciplines * detailsPerDiscipline;

    const totalDrawings = totalPlans + totalProfiles + totalDetails;

    return {
      scale,
      mainArea,
      facArea,
      totalAreaForReport: mainArea + facArea,
      usableMain,
      usableFac,
      plansPerDiscipline,
      activeDisciplines,
      totalPlans,
      profileSheetsBase,
      totalProfiles,
      detailsPerDiscipline,
      totalDetails,
      totalDrawings,
      grid
    };
  }

  window.DrawingsEngine = { compute };
})();
