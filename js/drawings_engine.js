// File: js/drawings_engine.js
(function () {
  const USABLE = {
    "1:1000": 349000,
    "1:500": 87000,
    "1:250": 21800,
    "1:100": 3500
  };

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
    const aspect = 841/594; // A1 landscape ratio
    const cols = Math.max(1, Math.ceil(Math.sqrt(n * aspect)));
    const rows = Math.ceil(n / cols);
    return { rows, cols };
  }

  function countSubDisciplines(st){
    const wet = Object.values(st.disciplines?.wet || {}).filter(v=>v===true).length;
    const dry = Object.values(st.disciplines?.dry || {}).filter(v=>v===true).length;
    const rl  = Object.values(st.roadLandscape?.items || {}).filter(v=>v===true).length;

    const fac = st.facilities || [];
    const hasArch = fac.some(r=>r.doArch===true);
    const hasStr  = fac.some(r=>r.doStruct===true);

    const mepSet = new Set();
    fac.forEach(r=>{
      if(!r.doMEP) return;
      Object.entries(r.mep||{}).forEach(([k,v])=>{ if(v===true) mepSet.add(String(k)); });
    });

    return wet + dry + rl + (hasArch?1:0) + (hasStr?1:0) + mepSet.size;
  }

  function compute(st){
    const scale = st.drawingScale || "1:1000";

    const mainArea = num(st.projectAreaSqm, 0);
    const facArea  = facilitiesAreaM2(st);

    const usableMain = USABLE[scale] || USABLE["1:1000"];
    const usableFac  = USABLE["1:100"]; // facilities always at 1:100

    const plansMain = ceil(mainArea / usableMain);
    const plansFac  = ceil(facArea / usableFac);
    const plansTotal = plansMain + plansFac;

    const grid = sheetGrid(plansTotal);

    const lenM = window.UIInputs ? num(window.UIInputs.effectiveLength(st), 0) : num(st.projectLengthManual, 0);
    const profiles = ceil(lenM / 1000);

    const subCount = countSubDisciplines(st);
    const details = subCount * 10;

    return {
      scale,
      mainArea,
      facArea,
      totalAreaForReport: mainArea + facArea,
      usableMain,
      usableFac,
      plansMain,
      plansFac,
      plansTotal,
      grid,
      profiles,
      details,
      subCount
    };
  }

  window.DrawingsEngine = { compute };
})();
