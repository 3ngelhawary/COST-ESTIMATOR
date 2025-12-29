// File: js/ui_inputs.js
(function () {
  const { $, esc, f } = window.UIH;

  function autoLengthMeters(st){
    const area = f(st.projectAreaSqm, 0);
    return area > 0 ? area * 0.20 : 0;
  }
  function effectiveLength(st){
    if (st.lengthOverride) {
      const v = f(st.projectLengthManual, 0);
      return v > 0 ? v : 0;
    }
    return autoLengthMeters(st);
  }

  function renderInputs() {
    const st = window.AppState.get();

    $("inputs").innerHTML = `
      <div class="field">
        <label>Project Name</label>
        <input id="projectName" type="text" value="${esc(st.projectName)}">
      </div>

      <div class="row">
        <div class="field">
          <label>Project Area (m²)</label>
          <input id="projectAreaSqm" type="number" min="0" value="${esc(st.projectAreaSqm)}">
        </div>
        <div class="field">
          <label>Required Duration (Months)</label>
          <input id="durationMonths" type="number" min="1" value="${esc(st.durationMonths)}">
        </div>
      </div>
      <!-- rest unchanged -->
    `;
  }

  window.UIInputs = { renderInputs, autoLengthMeters, effectiveLength };
})();
