// File: js/ui_main.js
(function () {
  const { $ } = window.UIH;

  function bind() {
    const st = window.AppState.get();

    $("projectName").oninput = (e)=>{ st.projectName = e.target.value; window.UIRender.preview(); };
    $("projectAreaSqm").oninput = (e)=>{ st.projectAreaSqm = e.target.value; window.UIRender.preview(); };

    // ✅ Required duration input (user-controlled)
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

    // ✅ Delegated checkbox changes (phases + disciplines)
    $("inputs").onchange = (e)=>{
      const el = e.target;
      if (!(el instanceof HTMLInputElement) || el.type !== "checkbox") return;

      const k = el.dataset.k, id = el.dataset.id;
      if (!k || !id) return;

      if (k === "required") st.requiredDetails[id] = el.checked;
      else if (k === "wet") st.disciplines.wet[id] = el.checked;
      else if (k === "dry") st.disciplines.dry[id] = el.checked;
      else if (k === "roadLandscape") st.roadLandscape.items[id] = el.checked;

      window.UIRender.preview();
    };
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    window.UIRender.renderInputs();
    bind();
    window.UIRender.preview();
  });
})();
