/* ============================================================
   ELEMENTA — index and display metadata for the minimal table
   ============================================================ */
(function () {
  "use strict";

  var El = window.El = window.El || {};
  var core = window.ELEMENTA && window.ELEMENTA.core;
  if (!core) return;

  var CATEGORIES = {
    alkali:            { label: "碱金属",     color: "#9A6A3C", tint: "#EFE2CF" },
    alkaline:          { label: "碱土金属",   color: "#B08A4F", tint: "#F0E7D5" },
    transition:        { label: "过渡金属",   color: "#5B7191", tint: "#E1E5EA" },
    "post-transition": { label: "后过渡金属", color: "#7C8A6E", tint: "#E5E9DF" },
    metalloid:         { label: "类金属",     color: "#8A7A5C", tint: "#ECE7DA" },
    nonmetal:          { label: "非金属",     color: "#4F7D6A", tint: "#DFE9E2" },
    halogen:           { label: "卤素",       color: "#A96F4F", tint: "#F0E2D8" },
    noble:             { label: "稀有气体",   color: "#666A8C", tint: "#E4E4EC" },
    lanthanide:        { label: "镧系",       color: "#8C4640", tint: "#EFDFDC" },
    actinide:          { label: "锕系",       color: "#6F4A44", tint: "#E9DEDA" },
    unknown:           { label: "性质未定",   color: "#8B8578", tint: "#EAE7E0" }
  };

  var STATES = {
    solid:   { label: "固态", color: "#6F7D68" },
    liquid:  { label: "液态", color: "#4F6F8A" },
    gas:     { label: "气态", color: "#B08A4F" },
    unknown: { label: "未知", color: "#A8A093" }
  };

  var elements = core.elements.map(function (e) {
    var cat = CATEGORIES[e.category] || CATEGORIES.unknown;
    e.categoryLabel = cat.label;
    e.categoryColor = cat.color;
    e.stateLabel = (STATES[e.stateSTP] || STATES.unknown).label;
    return e;
  });

  var byZ = {};
  var bySymbol = {};
  elements.forEach(function (e) {
    byZ[e.z] = e;
    bySymbol[e.symbol] = e;
  });

  El.data = {
    elements: elements,
    byZ: byZ,
    bySymbol: bySymbol,
    categories: CATEGORIES,
    states: STATES
  };
})();
