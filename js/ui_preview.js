// File: js/ui_preview.js
(function () {
  const { $ } = window.UIH;

  function preview() {
    const st = window.AppState.get();

    $("projectOut").textContent = st.projectName || "—";
    $("durationOut").textContent = st.durationMonths || "—";
    $("lengthOut").textContent =
      window.UIInputs.effectiveLength(st)?.toFixed(2) || "—";

    const team = window.UITeam.build();
    $("teamOut").innerHTML = window.UITeam.render(team);

    // Capture edited quantities
    $("teamOut").oninput = (e) => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement)) return;

      const idx = parseInt(el.dataset.idx, 10);
      const type = el.dataset.team;
      if (!Number.isFinite(idx) || !type) return;

      const qty = Math.max(0, parseInt(el.value || "0", 10));

      if (type === "senior") team.seniors[idx].qty = qty;
      if (type === "junior") team.juniors[idx].qty = qty;
    };

    // Store for future duration & pricing engine
    st.output = {
      teamStructure: team
    };
  }

  window.UIPreview = { preview };
})();
