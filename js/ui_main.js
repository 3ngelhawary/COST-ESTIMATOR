// File: js/ui_main.js
(function () {
  const { $, i } = window.UIH;

  function bind() {
    const st = window.AppState.get();
    if (!st.roadLandscape) st.roadLandscape = { items:{} };
    if (!st.roadLandscape.items) st.roadLandscape.items = {};
    if (!Array.isArray(st.facilities)) st.facilities = [];

    $("projectName").oninput = (e)=>{ st.projectName = e.target.value; window.UIRender.preview(); };
    $("projectAreaSqm").oninput = (e)=>{ st.projectAreaSqm = e.target.value; window.UIRender.renderInputs(); bind(); window.UIRender.preview(); };
    $("durationMonths").oninput = (e)=>{ st.durationMonths = e.target.value; window.UIRender.preview(); };

    $("lengthOverride").onchange = (e)=>{
      st.lengthOverride = !!e.target.checked;
      requestAnimationFrame(()=>{ window.UIRender.renderInputs(); bind(); window.UIRender.preview(); });
    };

    const pl = document.getElementById("projectLength");
    if (pl) pl.oninput = (e)=>{ st.projectLengthManual = e.target.value; window.UIRender.preview(); };

    $("drawingScale").onchange = (e)=>{ st.drawingScale = e.target.value; window.UIRender.preview(); };

    $("bimRequired").onchange = (e)=>{
      st.bimRequired = !!e.target.checked;
      requestAnimationFrame(()=>{ window.UIRender.renderInputs(); bind(); window.UIRender.preview(); });
    };

    $("facilityInfoBtn").onclick = ()=>window.UIFacilityInfo.openFacilityTable();

    $("inputs").onchange = (e)=>{
      const el = e.target;
      if (!(el instanceof HTMLInputElement) || el.type !== "checkbox") return;

      // delegated groups only
      const k = el.dataset.k, id = el.dataset.id;
      if (!k || !id) return;

      if (k === "required") st.requiredDetails[id] = el.checked;
      else if (k === "wet") st.disciplines.wet[id] = el.checked;
      else if (k === "dry") st.disciplines.dry[id] = el.checked;
      else if (k === "roadLandscape") st.roadLandscape.items[id] = el.checked;

      window.UIRender.preview();
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.UIRender.renderInputs();
    bind();
    window.UIRender.preview();
  });
})();
