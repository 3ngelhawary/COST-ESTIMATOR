/* File: css/style.css */

:root{
  --bg:#0b1020;
  --card:#121a33;
  --muted:#9fb0d0;
  --text:#e8eefc;
  --line:#243056;
  --focus:#4f6bff;
}

*{ box-sizing:border-box; }

body{
  margin:0;
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;
  background:linear-gradient(180deg,#070a14,var(--bg));
  color:var(--text);
}

.container{ max-width:1200px; margin:0 auto; padding:0 16px; }

.header{
  padding:18px 0;
  border-bottom:1px solid var(--line);
  background:rgba(18,26,51,.55);
  backdrop-filter: blur(6px);
}

.title{ margin:0; font-size:22px; text-align:center; }

.layout{
  display:grid;
  grid-template-columns:1fr 1fr 1fr;
  gap:16px;
  margin:18px 0 26px;
}
@media (max-width: 1100px){ .layout{ grid-template-columns:1fr; } }

.card{
  background:rgba(18,26,51,.92);
  border:1px solid var(--line);
  border-radius:14px;
  padding:16px;
  box-shadow:0 10px 30px rgba(0,0,0,.35);
}

.cardTitle{ margin:0 0 12px; font-size:16px; color:var(--text); }

.row{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
  margin-bottom:12px;
}
@media (max-width: 620px){ .row{ grid-template-columns:1fr; } }

.field label{
  display:block;
  font-size:12px;
  color:var(--muted);
  margin:0 0 6px;
}

input[type="text"], input[type="number"], select{
  width:100%;
  padding:10px 10px;
  border-radius:10px;
  border:1px solid #2b3a68;
  background:#0b1330;
  color:var(--text);
  outline:none;
}
input:focus, select:focus{ border-color:var(--focus); }

.smallNote{
  font-size:12px;
  color:var(--muted);
  margin-top:6px;
  line-height:1.35;
}

.divider{ height:1px; background:var(--line); margin:12px 0; }

.groupTitle{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin:10px 0 8px;
}
.groupTitle h3{ margin:0; font-size:13px; color:var(--text); }

.checkGrid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px;
}
@media (max-width: 620px){ .checkGrid{ grid-template-columns:1fr; } }

.checkItem{
  display:flex;
  gap:10px;
  align-items:flex-start;
  padding:10px;
  border:1px solid var(--line);
  border-radius:12px;
  background:#0b1330;
}
.checkItem input{ margin-top:3px; }

/* keep labels on one line */
.checkItem .txt{
  font-size:13px;
  white-space: nowrap;
}

.checkItem .sub{
  font-size:12px;
  color:var(--muted);
  margin-top:2px;
}

.toggleRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  border:1px solid var(--line);
  border-radius:12px;
  background:#0b1330;
  padding:10px;
  margin:10px 0;
}
.toggleRow .left{ display:flex; flex-direction:column; gap:2px; }
.toggleRow .left .t{ font-size:13px; }
.toggleRow .left .s{ font-size:12px; color:var(--muted); }

.switch{ position:relative; display:inline-block; width:52px; height:28px; }
.switch input{ opacity:0; width:0; height:0; }
.slider{
  position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0;
  background:#1a234a; border:1px solid #2b3a68; border-radius:999px;
  transition:.2s;
}
.slider:before{
  position:absolute; content:""; height:22px; width:22px; left:3px; top:2px;
  background:white; border-radius:50%; transition:.2s;
}
.switch input:checked + .slider{ border-color:var(--focus); }
.switch input:checked + .slider:before{ transform:translateX(24px); }

button{
  padding:10px 12px;
  border-radius:12px;
  border:1px solid #2b3a68;
  background:#17214a;
  color:var(--text);
  cursor:pointer;
}
button:hover{ border-color:var(--focus); }
button.secondary{ background:transparent; }

.fullWidth{ width:100%; }

.kpis{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
}
.kpi{
  border:1px solid var(--line);
  border-radius:12px;
  padding:12px;
  background:#0b1330;
}
.kpiLabel{ font-size:12px; color:var(--muted); }
.kpiValue{ font-size:16px; font-weight:700; margin-top:4px; }

.smallLabel{ font-size:12px; color:var(--muted); margin-bottom:6px; }
.codebox{
  margin:0;
  padding:12px;
  border-radius:12px;
  border:1px solid var(--line);
  background:#0b1330;
  overflow:auto;
  min-height:240px;
  font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size:12px;
  color:var(--text);
}

.footer{
  padding:18px 0;
  border-top:1px solid var(--line);
  color:var(--muted);
  font-size:12px;
  text-align:center;
}

/* ---------- Modal + Table ---------- */
.modalOverlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.55);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:16px;
  z-index:9999;
}
.modalOverlay.hidden{ display:none; }

.modalCard{
  width:min(780px, 100%);
  background:rgba(18,26,51,.98);
  border:1px solid var(--line);
  border-radius:14px;
  box-shadow:0 20px 60px rgba(0,0,0,.45);
  overflow:hidden;
}

.modalHeader{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:12px 14px;
  border-bottom:1px solid var(--line);
  background:#0b1330;
}
.modalTitle{ font-weight:700; font-size:14px; }
.modalCloseBtn{
  padding:8px 10px;
  border-radius:10px;
  border:1px solid #2b3a68;
  background:transparent;
}

.modalBody{ padding:14px; }
.modalFooter{
  padding:12px 14px;
  border-top:1px solid var(--line);
  display:flex;
  justify-content:flex-end;
  gap:10px;
  background:#0b1330;
}

.tableWrap{ overflow:auto; border:1px solid var(--line); border-radius:12px; }
.tTable{
  width:100%;
  border-collapse:collapse;
  min-width:560px;
  background:#0b1330;
}
.tTable thead th{
  text-align:left;
  font-size:12px;
  color:var(--muted);
  padding:10px;
  border-bottom:1px solid var(--line);
  background:#0b1330;
}
.tTable tbody td{
  padding:10px;
  border-bottom:1px solid rgba(36,48,86,.65);
  vertical-align:middle;
}
.tCenter{ text-align:center; }
.muted{ color:var(--muted); }

.tInput{
  width:100%;
  padding:9px 10px;
  border-radius:10px;
  border:1px solid #2b3a68;
  background:#121a33;
  color:var(--text);
  outline:none;
}
.tInput:focus{ border-color:var(--focus); }
