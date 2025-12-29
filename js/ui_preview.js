// File: js/ui_preview.js
(function () {
  const { $, f } = window.UIH;

  function preview() {
    const st = window.AppState.get();
    $("projectOut").textContent = st.projectName || "—";
    $("durationOut").textContent = st.durationMonths || "—";

    const len = window.UIInputs.effectiveLength(st);
    $("lengthOut").textContent = len ? String(Math.round(len*100)/100) : "—";

    const team = window.UITeam.build();
    $("teamOut").innerHTML = window.UITeam.render(team);

    const payload = {
      ...st,
      output: {
        projectLengthMeters: len,
        projectLengthAutoMeters: window.UIInputs.autoLengthMeters(st),
        teamStructure: team
      }
    };

    $("jsonOut").textContent = JSON.stringify(payload, null, 2);
  }

  window.UIPreview = { preview };
})();
