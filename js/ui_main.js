// File: js/ui_main.js
(function () {
  const { $, i } = window.UIH;

  function bind() {
    const st = window.AppState.get();

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

    $("archFacilityCount").oninput = (e)=>{
      st.general.architecture.facilityCount = Math.max(0, i(e.target.value,0));
      window.UIFacilities.normalize(st.general.architecture);
      window.UIRender.preview();
    };

    $("strFacilityCount").oninput = (e)=>{
      st.general.structure.facilityCount = Math.max(0, i(e.target.value,0));
      window.UIFacilities.normalize(st.general.structure);
      window.UIRender.preview();
    };

    $("archEditBtn").onclick = ()=>window.UIFacilities.openTable("Architecture — Facilities Table","architecture");
    $("strEditBtn").onclick  = ()=>window.UIFacilities.openTable("Structure — Facilities Table","structure");

    $("inputs").onchange = (e)=>{
      const el = e.target;
      if (!(el instanceof HTMLInputElement) || el.type !== "checkbox") return;
      const k = el.dataset.k, id = el.dataset.id;
      if (!k || !id) return;

      if (k === "required") st.requiredDetails[id] = el.checked;
      else if (k === "wet") st.disciplines.wet[id] = el.checked;
      else if (k === "dry") st.disciplines.dry[id] = el.checked;
      else if (k === "landscape") st.general.landscape.items[id] = el.checked;
      else if (k === "mep") st.general.mep.systems[id] = el.checked;

      window.UIRender.preview();
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.UIRender.renderInputs();
    bind();
    window.UIRender.preview();
  });
})();
