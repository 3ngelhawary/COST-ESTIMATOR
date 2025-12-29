// File: js/ui_helpers.js
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  const i = (v, fb=0) => { const n=parseInt(String(v??""),10); return Number.isFinite(n)?n:fb; };
  const listTrue = (m) => m ? Object.entries(m).filter(([,v])=>v===true).map(([k])=>k) : [];
  window.UIH = { $, esc, i, listTrue };
})();
