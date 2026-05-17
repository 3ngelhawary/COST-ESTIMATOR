// File: js/ui_preview.js
(function () {
  const { $, esc } = window.UIH;

  function fmt(n) {
    if (!Number.isFinite(n) || n === 0) return "—";
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  function preview() {
    const st = window.AppState.get();

    // ── Project name KPI ────────────────────────────────────────────────────
    $("projectOut").textContent = st.projectName || "—";

    // ── Effective length ────────────────────────────────────────────────────
    const len = window.UIInputs.effectiveLength(st);
    $("lengthOut").textContent = len > 0 ? fmt(len) : "—";

    // ── Auto junior (single pass, no recursion) ─────────────────────────────
    window.AutoStaff.applyAutoJunior(st, 10, 10);

    // ── Team (seeds overrides) ──────────────────────────────────────────────
    const team = window.TeamModel.build(st);
    $("teamOut").innerHTML = window.UITeam.render(team);

    // Wire team quantity edits
    $("teamOut").oninput = (e) => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement)) return;
      const role = el.getAttribute("data-role");
      if (!role) return;
      window.TeamModel.setQty(st, role, el.value);
      if (role.startsWith("Junior –")) st._juniorManual = true;
      preview();
    };

    // ── Duration ────────────────────────────────────────────────────────────
    const res     = window.RatesEngine.compute(st);
    const calcDur = res.projectDuration || 0;
    $("calcDurationOut").textContent = fmt(calcDur);

    // Duration breakdown table
    $("durationBreakdownOut").innerHTML = renderBreakdown(res);

    // Warning / OK banner
    const reqDur = parseFloat(st.durationMonths);
    const warnEl = $("durationWarn");
    if (reqDur > 0 && calcDur > 0) {
      if (calcDur > reqDur) {
        warnEl.textContent =
          `⚠ Calculated duration (${fmt(calcDur)} mo.) exceeds required duration (${reqDur} mo.). ` +
          `Increase staff to meet the schedule.`;
        warnEl.style.display = "block";
      } else {
        warnEl.textContent =
          `✓ Schedule is achievable — calculated ${fmt(calcDur)} mo. ≤ required ${reqDur} mo.`;
        warnEl.style.display = "block";
        warnEl.style.color   = "#4ade80";
      }
    } else {
      warnEl.style.display = "none";
    }

    // ── Drawings ────────────────────────────────────────────────────────────
    const dm   = window.DrawingsEngine.compute(st);
    const dHost = $("drawingsOut");
    if (dHost) dHost.innerHTML = window.UIDrawings.render(dm);

    // ── Pricing ─────────────────────────────────────────────────────────────
    const pHost = $("pricingOut");
    if (!pHost) return;

    const rate = parseFloat(st.avgManHourCost);
    if (!Number.isFinite(rate) || rate < 0) st.avgManHourCost = 5.00;

    try {
      const pricing = window.PricingEngine.compute(team.roles, calcDur, st.avgManHourCost);
      pHost.innerHTML = window.UIPricing.render(pricing);

      const avgEl = $("avgManHourCost");
      if (avgEl) {
        avgEl.oninput = (e) => {
          st.avgManHourCost = e.target.value;
          preview();
        };
      }
    } catch (err) {
      pHost.innerHTML = `<div class="warnText">Pricing error: ${esc(String(err?.message ?? err))}</div>`;
    }
  }

  function renderBreakdown(res) {
    const rows = res.rows.map(r => `
      <tr>
        <td>${esc(r.label)}</td>
        <td class="tCenter">${Number.isFinite(r.qty) ? r.qty.toFixed(2) : "—"}</td>
        <td class="tCenter">${esc(r.unit)}</td>
        <td class="tCenter">${Number.isFinite(r.eng) ? r.eng.toFixed(2) : "—"}</td>
        <td class="tCenter"><b>${Number.isFinite(r.dur) ? r.dur.toFixed(2) : "—"}</b></td>
      </tr>`).join("");

    return `
      <div class="tableWrap">
        <table class="tTable">
          <thead>
            <tr>
              <th>Work Stream</th>
              <th class="tCenter" style="width:80px">Qty</th>
              <th class="tCenter" style="width:50px">Unit</th>
              <th class="tCenter" style="width:80px">Engineers</th>
              <th class="tCenter" style="width:120px">Duration (mo.)</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="5" class="tCenter muted" style="padding:12px;">Select phases + disciplines to calculate.</td></tr>`}
          </tbody>
        </table>
      </div>`;
  }

  window.UIPreview = { preview };
})();
