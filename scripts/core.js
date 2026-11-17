/* ============================================================
   ELEMENTA — minimal shared utilities
   ============================================================ */
(function () {
  "use strict";

  var El = window.El = window.El || {};

  El.$ = function (sel, root) { return (root || document).querySelector(sel); };
  El.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  El.esc = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  El.clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };

  El.prefersReducedMotion = function () {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  El.fmt = function (v, digits) {
    if (v == null || Number.isNaN(v)) return "—";
    return Number(v).toLocaleString("en-US", { maximumFractionDigits: digits == null ? 2 : digits });
  };

  El.fmtInt = function (v) {
    if (v == null) return "—";
    return Math.round(v).toLocaleString("en-US");
  };

  El.fmtK = function (v) {
    if (v == null) return "—";
    if (v < 100) return String(Number(v.toFixed(2)));
    return El.fmtInt(v);
  };

  El.fmtMass = function (el) {
    if (!el) return "—";
    if (el.atomicMass != null) {
      return Number(el.atomicMass).toLocaleString("en-US", { maximumFractionDigits: 5 });
    }
    if (el.massNumber != null) return "[" + el.massNumber + "]";
    return "—";
  };

  El.fmtDensity = function (el) {
    if (!el || el.density == null) return "—";
    var n = Number(el.density).toLocaleString("en-US", { maximumSignificantDigits: 4 });
    return n + " " + (el.densityUnit || "g/cm³");
  };

  El.fmtAbundance = function (v) {
    if (v == null) return "—";
    if (v === 0) return "0";
    if (v < 0.001) return v.toExponential(1) + " ppm";
    return Number(v).toLocaleString("en-US", { maximumSignificantDigits: 3 }) + " ppm";
  };

  El.fmtDiscovery = function (el) {
    if (!el) return "—";
    if (el.discoveryYear == null) return "古代已知";
    return el.discoveryYear + " 年";
  };

  El.configHtml = function (cfg) {
    if (!cfg) return "—";
    return El.esc(cfg).replace(/(\d)([spdf])(\d+)/g, "$1$2<sup>$3</sup>");
  };

  El.category = function (el) {
    var d = El.data;
    return (d && d.categories[el.category]) || { label: "未知", color: "#8B8578", tint: "#EAE7E0" };
  };

  El.state = function (el) {
    var d = El.data;
    return (d && d.states[el.stateSTP]) || { label: "未知", color: "#A8A093" };
  };

  El.hashSymbol = function (hash) {
    var m = /^#element-([A-Za-z]{1,2})$/.exec(hash || "");
    return m ? m[1][0].toUpperCase() + m[1].slice(1).toLowerCase() : null;
  };

  El.storage = {
    get: function (key, fallback) {
      try {
        var v = window.localStorage.getItem("elementa:" + key);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem("elementa:" + key, JSON.stringify(value)); } catch (e) {}
    }
  };

  var scrollLocks = 0;
  El.lockScroll = function () {
    scrollLocks += 1;
    if (scrollLocks === 1) {
      document.body.dataset.prevOverflow = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";
    }
  };
  El.unlockScroll = function () {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (scrollLocks === 0) {
      document.body.style.overflow = document.body.dataset.prevOverflow || "";
      delete document.body.dataset.prevOverflow;
    }
  };

  El.trapFocus = function (container) {
    function focusables() {
      return El.$$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', container)
        .filter(function (n) { return n.offsetParent !== null || n === document.activeElement; });
    }
    function onKey(e) {
      if (e.key !== "Tab") return;
      var f = focusables();
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    container.addEventListener("keydown", onKey);
    return function () { container.removeEventListener("keydown", onKey); };
  };
})();
