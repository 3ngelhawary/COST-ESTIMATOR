// File: js/ui_preview.js v40
(function () {
  const { $, esc } = window.UIH;

  function fmt(n, dec) {
    dec = (dec == null) ? 2 : dec;
    if (!Number.isFinite(n) || n === 0) return '—';
    return n.toFixed(dec);
  }
  function fmtInt(n) {
    if (!Number.isFinite(n)) return '—';
    return Math.round(n).toLocaleString('en-US');
  }

  function preview() {
    const st = window.AppState.get();

    // ── Header badge ──────────────────────────────────────────────────────
    const badge = document.getElementById('headerProjectBadge');
    if (badge) badge.textContent = st.projectName || 'No Project';

    const footer = document.getElementById('footerMeta');
    if (footer) {
      const now = new Date();
      footer.textContent = `Updated ${now.toLocaleTimeString()}`;
    }

    // ── KPIs ──────────────────────────────────────────────────────────────
    const projectEl = $('projectOut');
    if (projectEl) {
      projectEl.textContent = st.projectName || '—';
      projectEl.style.fontSize = st.projectName && st.projectName.length > 16 ? '13px' : '';
    }

    const len = window.UIInputs.effectiveLength(st);
    const lenEl = $('lengthOut');
    if (lenEl) lenEl.textContent = len > 0 ? fmtInt(len) : '—';

    // ── Auto staff ────────────────────────────────────────────────────────
    window.AutoStaff.applyAutoJunior(st, 10, 10);

    // ── Build team ────────────────────────────────────────────────────────
    const team = window.TeamModel.build(st);

    // Team section
    const teamOut = $('teamOut');
    if (teamOut) {
      teamOut.innerHTML = window.UITeam.render(team);
      teamOut.oninput = function(e) {
        const el = e.target;
        if (!(el instanceof HTMLInputElement)) return;
        const role = el.getAttribute('data-role');
        if (!role) return;
        window.TeamModel.setQty(st, role, el.value);
        if (role.startsWith('Junior –')) st._juniorManual = true;
        preview();
      };
    }

    // Team badge
    const teamBadge = $('teamBadge');
    if (teamBadge) {
      const total = team.roles.reduce(function(s, r){ return s + Math.max(0, parseInt(r.qty)||0); }, 0);
      teamBadge.textContent = total + ' staff';
    }

    // ── Duration ──────────────────────────────────────────────────────────
    const res     = window.RatesEngine.compute(st);
    const calcDur = res.projectDuration || 0;

    const durEl = $('calcDurationOut');
    if (durEl) {
      durEl.textContent = calcDur > 0 ? fmt(calcDur, 2) : '—';
      durEl.style.color = calcDur > 0 && parseFloat(st.durationMonths) > 0
        ? (calcDur > parseFloat(st.durationMonths) ? 'var(--accent-red)' : 'var(--accent-green)')
        : '';
    }

    // Duration badge
    const durBadge = $('durationBadge');
    if (durBadge) {
      durBadge.textContent = calcDur > 0 ? fmt(calcDur, 1) + ' mo.' : '—';
    }

    // Duration breakdown table
    const durBreakdown = $('durationBreakdownOut');
    if (durBreakdown) durBreakdown.innerHTML = renderBreakdown(res);

    // Schedule health bar
    renderScheduleHealth(calcDur, parseFloat(st.durationMonths) || 0);

    // Duration banner
    const banner = $('durationBanner');
    if (banner) {
      const reqDur = parseFloat(st.durationMonths) || 0;
      if (calcDur > 0 && reqDur > 0) {
        const over = calcDur > reqDur;
        banner.style.display = 'flex';
        banner.className = 'status-banner ' + (over ? 'banner--warn' : 'banner--ok');
        banner.innerHTML = over
          ? `⚠ Calculated <b>${fmt(calcDur, 2)} mo.</b> exceeds required <b>${reqDur} mo.</b> — increase team quantities to meet schedule.`
          : `✓ Schedule achievable — <b>${fmt(calcDur, 2)} mo.</b> ≤ required <b>${reqDur} mo.</b>`;
      } else {
        banner.style.display = 'none';
      }
    }

    // ── Drawings ──────────────────────────────────────────────────────────
    const dm = window.DrawingsEngine.compute(st);
    const drawOut = $('drawingsOut');
    if (drawOut) drawOut.innerHTML = window.UIDrawings.render(dm);
    const drawBadge = $('drawingsBadge');
    if (drawBadge) drawBadge.textContent = dm.totalDrawings > 0 ? fmtInt(dm.totalDrawings) + ' sheets' : '—';

    // ── Pricing ───────────────────────────────────────────────────────────
    const pHost = $('pricingOut');
    if (!pHost) return;

    if (!Number.isFinite(parseFloat(st.avgManHourCost)) || parseFloat(st.avgManHourCost) < 0)
      st.avgManHourCost = 5.00;

    try {
      const pricing = window.PricingEngine.compute(
        team.roles, calcDur,
        st.avgManHourCost,
        st.overheadPct,
        st.contingencyPct
      );
      pHost.innerHTML = window.UIPricing.render(pricing, st);

      // Wire pricing inputs
      wirePricingInput('avgManHourCost', function(v){ st.avgManHourCost = v; });
      wirePricingInput('overheadPct',    function(v){ st.overheadPct    = v; });
      wirePricingInput('contingencyPct', function(v){ st.contingencyPct = v; });

    } catch (err) {
      pHost.innerHTML = '<div class="status-banner banner--warn">Pricing error: ' + esc(String(err && err.message ? err.message : err)) + '</div>';
    }
  }

  function wirePricingInput(id, setter) {
    const el = document.getElementById(id);
    if (el) el.oninput = function(e) { setter(e.target.value); preview(); };
  }

  function renderScheduleHealth(calcDur, reqDur) {
    const el = $('scheduleHealth');
    const fill = $('shFill');
    const text = $('shText');
    const pct  = $('shPct');
    if (!el || !fill) return;

    if (!calcDur || !reqDur) { el.style.display = 'none'; return; }
    el.style.display = 'block';

    const ratio      = Math.min(calcDur / reqDur, 1.5);
    const barPct     = Math.min(ratio * 100, 100);
    const pctDisplay = Math.round(ratio * 100);
    const ok         = ratio <= 1;

    fill.style.width      = barPct + '%';
    fill.style.background = ratio > 1.2
      ? 'var(--accent-red)'
      : ratio > 1.0
        ? 'var(--accent-amber)'
        : 'var(--accent-green)';

    if (text) text.textContent = ok ? 'Schedule On Track' : 'Schedule At Risk';
    if (text) text.style.color = ok ? 'var(--accent-green)' : 'var(--accent-amber)';
    if (pct)  pct.textContent  = pctDisplay + '% of target';
    if (pct)  pct.style.color  = ok ? 'var(--accent-green)' : 'var(--accent-amber)';
  }

  function renderBreakdown(res) {
    if (!res.rows || !res.rows.length) {
      return '<div class="empty-state"><div class="es-icon">📅</div>Select phases + disciplines to calculate.</div>';
    }
    const maxDur = Math.max(...res.rows.map(function(r){ return r.dur || 0; }));
    const rows = res.rows.map(function(r) {
      const isCritical = r.dur === maxDur && maxDur > 0;
      const barW = maxDur > 0 ? Math.round((r.dur / maxDur) * 100) : 0;
      return '<tr class="' + (isCritical ? 't-critical' : '') + '">' +
        '<td>' + (isCritical ? '<b>' : '') + esc(r.label) + (isCritical ? '</b>' : '') +
          (isCritical ? ' <span style="font-size:10px;color:var(--accent-amber);font-family:var(--font-mono);">▲ CRIT</span>' : '') +
        '</td>' +
        '<td class="tc mono">' + (Number.isFinite(r.qty) ? r.qty.toFixed(2) : '—') + '</td>' +
        '<td class="tc" style="font-size:10px;color:var(--text3);">' + esc(r.unit) + '</td>' +
        '<td class="tc mono">' + (Number.isFinite(r.eng) ? r.eng.toFixed(2) : '—') + '</td>' +
        '<td class="tc" style="width:130px;">' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<div style="flex:1;height:4px;background:var(--border);border-radius:2px;min-width:40px;">' +
              '<div style="width:' + barW + '%;height:100%;background:' + (isCritical ? 'var(--accent-amber)' : 'var(--accent-blue)') + ';border-radius:2px;"></div>' +
            '</div>' +
            '<span class="mono" style="font-size:11px;white-space:nowrap;"><b>' + (Number.isFinite(r.dur) ? r.dur.toFixed(2) : '—') + '</b></span>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');

    return '<div class="table-wrap"><table class="t-table">' +
      '<thead><tr>' +
        '<th>Work Stream</th>' +
        '<th class="tc" style="width:70px">Qty</th>' +
        '<th class="tc" style="width:44px">Unit</th>' +
        '<th class="tc" style="width:80px">Engineers</th>' +
        '<th class="tc" style="width:130px">Duration (mo.)</th>' +
      '</tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table></div>';
  }

  window.UIPreview = { preview: preview };
})();
