/* common oxidation states and full electron configuration */
(function () {
  "use strict";
  var El = window.El = window.El || {};
  var core = window.ELEMENTA && window.ELEMENTA.core;
  if (!core) return;

  var CHEMISTRY = window.ELEMENTA.chemistry || {};
  var NOBLE = {
    He: "1s2",
    Ne: "1s2 2s2 2p6",
    Ar: "1s2 2s2 2p6 3s2 3p6",
    Kr: "1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6",
    Xe: "1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6",
    Rn: "1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 4f14 5s2 5p6 5d10 6s2 6p6"
  };

  function expandConfig(config) {
    if (!config) return "";
    var m = /^\[([A-Z][a-z]?)\](.*)$/.exec(config.trim());
    if (m && NOBLE[m[1]]) return (NOBLE[m[1]] + " " + m[2]).replace(/\s+/g, " ").trim();
    return config.replace(/\s+/g, " ").trim();
  }

  function parseSubshells(config) {
    var out = [];
    var re = /(\d)([spdf])(\d+)/g;
    var m;
    while ((m = re.exec(config))) {
      out.push({ n: Number(m[1]), l: m[2], label: m[1] + m[2], count: Number(m[3]) });
    }
    var order = "spdf";
    out.sort(function (a, b) {
      return a.n - b.n || order.indexOf(a.l) - order.indexOf(b.l);
    });
    return out;
  }

  core.elements.forEach(function (e) {
    e.subshells = parseSubshells(expandConfig(e.electronConfig));
    e.fullElectronConfig = e.subshells.map(function (s) { return s.label + s.count; }).join(" ");
    e.oxidation = CHEMISTRY[e.symbol] || null;
  });

  El.expandConfig = expandConfig;
  El.parseSubshells = parseSubshells;
})();
