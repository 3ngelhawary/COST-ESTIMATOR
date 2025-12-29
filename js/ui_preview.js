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

    // Team Structure
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

    // Duration
    const res = window.RatesEngine.compute(st);
    const calcDur = res.projectDuration || 0;

    $("durationBreakdownOut").innerHTML = renderBreakdown(res);
    $("calcDurationOut").textContent = fmt(calcDur);

    // Warning
    const req = parseFloat(st.durationMonths);
    if (req > 0 && Number.isFinite(calcDur) && calcDur > req) {
      $("durationWarn").textContent =
        "⚠ Calculated duration exceeds required duration. Increase project staff to meet the schedule.";
      $("durationWarn").style.display = "block";
    } else {
      $("durationWarn").style.display = "none";
    }

    // Pricing (robust + safe)
    const pricingHost = document.getElementById("pricingOut");
    if (!pricingHost) return;

    if (st.avgManHourCost == null || st.avgManHourCost === "") st.avgManHourCost = 5.00;

    try {
      if (!window.PricingEngine || !window.UIPricing) {
        pricingHost.innerHTML = `<div class="muted">Pricing modules not loaded.</div>`;
        return;
      }

      const pricing = window.PricingEngine.compute(team.roles, calcDur, st.avgManHourCost);
      pricingHost.innerHTML = window.UIPricing.render(pricing);

      const avg = document.getElementById("avgManHourCost");
      if (avg) {
        avg.oninput = (e) => {
          st.avgManHourCost = e.target.value;
          window.UIRender.preview();
        };
      }
    } catch (err) {
      pricingHost.innerHTML = `<div class="warnText">Pricing Error: ${esc(err && err.message ? err.message : String(err))}</div>`;
    }
  }

  window.UIPreview = { preview };
})();
