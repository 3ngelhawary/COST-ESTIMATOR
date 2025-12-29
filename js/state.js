// File: js/state.js
(function () {
  const clone = (o) => JSON.parse(JSON.stringify(o));
  window.AppState = {
    data: clone(window.DEFAULT_STATE),
    get() { return this.data; },
    set(patch) { this.data = { ...this.data, ...patch }; return this.data; },
    reset() { this.data = clone(window.DEFAULT_STATE); return this.data; }
  };
})();
