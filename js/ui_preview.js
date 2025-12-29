// File: js/ui_preview.js
(function () {
  const { $, esc } = window.UIH;

  function fmt(n){
    if (!Number.isFinite(n)) return "—";
    return (Math.round(n*100)/100).toFixed(2);
  }

  function unitFor(k){
    if (["wet","dry","roads"].includes(k)) return "km";
    if (["landscape","secIrr"].includes(k)) return "ha";
    return "m²";
  }

  function renderBreakdown(res){
    const rows = res.rows.map(r=>`
      <tr>
        <td>${esc(r.label)}</td>
        <td class="tCenter">${fmt(r.qty)}</td>
        <td class="tCenter">${unitFor(r.key)}</td>
        <td class="tCenter"><b>${fmt(r.dur)}</b></td>
      </tr>`).join("");

    return `
      <div class="tableWrap">
        <table class="tTable">
          <thead>
            <tr>
              <th>Discipline</th>
              <th class="tCenter" style="width:110px">Qty</th>
              <th class="tCenter" style="width:70px">Unit</th>
              <th class="tCenter" style="width:160px">Duration (Months)</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="4" class="tCenter muted">Select phases + disciplines</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  function preview() {
    const st = window.AppState.get();

    $("projectOut").textContent = st.projectName || "—";

    const len = window.UIInputs.effectiveLength(st);
    $("lengthOut").textContent = len ? fmt(len) : "—";

    // Team Structure (editable)
    const team = window.TeamModel.build(st);
    $("teamOut").innerHTML = window.UITeam.render(team);

    $("teamOut").oninput = (e)=>{
      const el = e.target;
      if (!(el instanceof HTMLInputElement)) return;
      const role = el.getAttribute("data-role");
      if (!role) return;
      window.TeamModel.setQty(st, role, el.value);
      window.UIRender.preview();
    };

    // Duration calculation
    const res = window.RatesEngine.compute(st);
    const calcDur = res.projectDuration || 0;
    st.calculatedDurationMonths = fmt(calcDur);

    $("durationOut").textContent = st.calculatedDurationMonths;
    $("durationBreakdownOut").innerHTML = renderBreakdown(res);

    // ⚠ WARNING LOGIC
    const req = parseFloat(st.durationMonths);
    let warn = document.getElementById("durationWarn");
    if (!warn){
      warn = document.createElement("div");
      warn.id = "durationWarn";
      warn.className = "warnText";
      $("durationBreakdownOut").after(warn);
    }

    if (req > 0 && calcDur > req){
      warn.textContent =
        "⚠ Calculated duration exceeds required duration. Increase project staff to meet the schedule.";
      warn.style.display = "block";
    } else {
      warn.style.display = "none";
    }
  }

  window.UIPreview = { preview };
})();
