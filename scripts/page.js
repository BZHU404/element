/* ============================================================
   ELEMENTA — periodic table page
   ============================================================ */
(function () {
  "use strict";
  var El = window.El;
  if (!El || !El.data) return;
  if (document.body.getAttribute("data-page") !== "index") return;
  var D = El.data;

  function cellHtml(e, pos) {
    var cat = El.category(e);
    var mass = El.fmtMass(e);
    var aria = e.cnName + " " + e.name + "，原子序数 " + e.z + "，" + e.categoryLabel + "，原子量 " + mass + "，" + e.stateLabel + "，点击查看基本信息";
    return '<button type="button" class="element-cell" data-element-z="' + e.z + '" data-group="' + (e.group == null ? "" : e.group) + '" data-period="' + e.period + '" data-series="' + (e.group == null ? e.category : "main") + '" data-cat="' + e.category + '" ' +
      'style="grid-column:' + pos.col + ';grid-row:' + pos.row + ';--cat:' + cat.color + ';--cat-tint:' + cat.tint + ';--cell-delay:' + (e.period * 45 + (e.z % 18) * 8) + 'ms" ' +
      'aria-label="' + El.esc(aria) + '">' +
      '<span class="cell-strip" aria-hidden="true"></span>' +
      '<span class="cell-z">' + e.z + '</span>' +
      '<span class="cell-symbol">' + El.esc(e.symbol) + '</span>' +
      '<span class="cell-cn">' + El.esc(e.cnName) + '</span>' +
      '<span class="cell-mass">' + El.esc(mass) + '</span>' +
      '</button>';
  }

  function tableHtml() {
    var html = '<div class="table-frame"><div class="table-wrap"><div class="periodic-table" id="periodic-table" role="group" aria-label="元素周期表：18 族、7 周期，另附镧系与锕系">';
    for (var g = 1; g <= 18; g++) {
      html += '<div class="axis-label group-label" style="grid-column:' + (g + 1) + ';grid-row:1" aria-hidden="true">' + g + '</div>';
    }
    for (var p = 1; p <= 7; p++) {
      html += '<div class="axis-label period-label" style="grid-column:1;grid-row:' + (p + 1) + '" aria-hidden="true">' + p + '</div>';
    }
    D.elements.forEach(function (e) {
      if (e.group == null) return;
      html += cellHtml(e, { col: e.group + 1, row: e.period + 1 });
    });
    html += '<button type="button" class="fblock-placeholder" style="grid-column:4;grid-row:7" data-fblock="lanthanide" aria-label="查看镧系元素 57 至 71"><span class="ph-range">57–71</span><span class="ph-name">镧系</span></button>';
    html += '<button type="button" class="fblock-placeholder" style="grid-column:4;grid-row:8" data-fblock="actinide" aria-label="查看锕系元素 89 至 103"><span class="ph-range">89–103</span><span class="ph-name">锕系</span></button>';
    html += '<div class="f-spacer" style="grid-column:1 / -1;grid-row:9" aria-hidden="true"><span>F-BLOCK · 单独两行</span></div>';
    html += '<div class="f-label" id="f-label-lanthanide" style="grid-column:1 / span 2;grid-row:10"><span>57–71</span><strong>镧系</strong><em>LANTHANIDES</em></div>';
    html += '<div class="f-label" id="f-label-actinide" style="grid-column:1 / span 2;grid-row:11"><span>89–103</span><strong>锕系</strong><em>ACTINIDES</em></div>';
    D.elements.filter(function (e) { return e.category === "lanthanide"; }).forEach(function (e, i) {
      html += cellHtml(e, { col: 3 + i, row: 10 });
    });
    D.elements.filter(function (e) { return e.category === "actinide"; }).forEach(function (e, i) {
      html += cellHtml(e, { col: 3 + i, row: 11 });
    });
    html += '</div></div><p class="table-scroll-hint" aria-hidden="true">← 左右滑动查看 18 族 →</p></div>';
    return html;
  }

  function mobileListHtml() {
    var groups = [];
    for (var p = 1; p <= 7; p++) {
      groups.push({ key: "period-" + p, label: "第 " + p + " 周期", en: "PERIOD " + p, items: D.elements.filter(function (e) { return e.period === p && e.group != null; }) });
      if (p === 6) groups.push({ key: "lanthanide", label: "镧系", en: "57–71 · LANTHANIDES", items: D.elements.filter(function (e) { return e.category === "lanthanide"; }) });
      if (p === 7) groups.push({ key: "actinide", label: "锕系", en: "89–103 · ACTINIDES", items: D.elements.filter(function (e) { return e.category === "actinide"; }) });
    }
    return '<div class="mobile-list" id="mobile-list">' + groups.map(function (g, gi) {
      return '<section class="mobile-group" aria-labelledby="mg-' + g.key + '"><header class="mobile-group-head"><span class="mg-index">' + String(gi + 1).padStart(2, "0") + '</span>' +
        '<h3 id="mg-' + g.key + '">' + g.label + ' <em>' + g.en + '</em></h3><span class="mg-count">' + g.items.length + '</span></header>' +
        '<div class="mobile-rows">' + g.items.map(function (e) {
          var cat = El.category(e);
          return '<button type="button" class="mobile-row" data-element-z="' + e.z + '" data-group="' + (e.group == null ? "" : e.group) + '" data-period="' + e.period + '" data-series="' + (e.group == null ? e.category : "main") + '" style="--cat:' + cat.color + '">' +
            '<span class="row-heat" aria-hidden="true"></span>' +
            '<span class="row-z">' + e.z + '</span>' +
            '<span class="row-symbol">' + El.esc(e.symbol) + '</span>' +
            '<span class="row-main"><strong>' + El.esc(e.cnName) + ' <em>' + El.esc(e.name) + '</em></strong><span>' + El.esc(e.categoryLabel) + '</span></span>' +
            '<span class="row-mass">' + El.esc(El.fmtMass(e)) + '</span>' +
            '<span class="row-state">' + El.esc(e.stateLabel) + '</span>' +
            '</button>';
        }).join("") + '</div></section>';
    }).join("") + '</div>';
  }

  function boardHeadHtml() {
    return '<div class="board-head">' +
      '<div class="board-title"><span class="board-kicker">THE TABLE / 周期表</span><h2>118 种元素 <em>18 groups · 7 periods</em></h2></div>' +
      '<div class="board-meta"><span class="board-count"><strong>118</strong> 元素</span>' +
        '<span class="board-hint">悬停高亮同族 / 同周期 · 点击查看基本信息</span>' +
        '<div class="view-toggle" role="group" aria-label="移动端视图切换">' +
          '<button type="button" class="view-btn is-active" id="view-list" aria-pressed="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg> 列表</button>' +
          '<button type="button" class="view-btn" id="view-table" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></svg> 表格</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function buildLegend() {
    var host = document.getElementById("table-legend");
    if (!host) return;
    host.innerHTML = '<div class="legend-title"><span class="legend-kicker">KEY / 图例</span><strong>元素类别</strong></div>' +
      '<div class="legend-swatches">' + Object.keys(D.categories).map(function (k) {
        return '<span class="legend-item"><i class="legend-swatch" style="background:' + D.categories[k].color + '"></i>' + D.categories[k].label + '</span>';
      }).join("") + '</div>';
  }

  function clearRelated() {
    El.$$(".element-cell.is-related, .element-cell.is-hovered, .mobile-row.is-related").forEach(function (n) {
      n.classList.remove("is-related", "is-hovered");
    });
  }

  function relate(node) {
    var group = node.getAttribute("data-group");
    var period = node.getAttribute("data-period");
    var series = node.getAttribute("data-series");
    El.$$(".element-cell, .mobile-row").forEach(function (n) {
      var sameGroup = group && n.getAttribute("data-group") === group;
      var sameSeries = !group && n.getAttribute("data-series") === series;
      var samePeriod = n.getAttribute("data-period") === period;
      if (sameGroup || sameSeries || samePeriod) n.classList.add("is-related");
      if (n === node) n.classList.add("is-hovered");
    });
  }

  function init() {
    var board = document.getElementById("board-head");
    var mount = document.getElementById("periodic-mount");
    var mobileMount = document.getElementById("mobile-list-mount");
    if (board) board.innerHTML = boardHeadHtml();
    if (mount) mount.innerHTML = tableHtml();
    if (mobileMount) mobileMount.innerHTML = mobileListHtml();
    buildLegend();

    var viewList = document.getElementById("view-list");
    var viewTable = document.getElementById("view-table");
    function setView(view) {
      document.body.setAttribute("data-view", view);
      El.storage.set("view", view);
      if (viewList) { viewList.classList.toggle("is-active", view === "list"); viewList.setAttribute("aria-pressed", view === "list" ? "true" : "false"); }
      if (viewTable) { viewTable.classList.toggle("is-active", view === "table"); viewTable.setAttribute("aria-pressed", view === "table" ? "true" : "false"); }
    }
    if (viewList) viewList.addEventListener("click", function () { setView("list"); });
    if (viewTable) viewTable.addEventListener("click", function () { setView("table"); });
    setView(El.storage.get("view", "list"));

    document.addEventListener("click", function (e) {
      var node = e.target.closest(".element-cell, .mobile-row");
      if (node) {
        var z = Number(node.getAttribute("data-element-z"));
        if (z) El.detail.open(z, { updateHash: true, trigger: node });
        return;
      }
      var ph = e.target.closest(".fblock-placeholder");
      if (ph) {
        var isLan = ph.getAttribute("data-fblock") === "lanthanide";
        var target = document.getElementById(isLan ? "f-label-lanthanide" : "f-label-actinide");
        if (target) {
          target.scrollIntoView({ behavior: El.prefersReducedMotion() ? "auto" : "smooth", block: "center" });
          target.classList.remove("is-flash");
          void target.offsetWidth;
          target.classList.add("is-flash");
        }
      }
    });

    var table = document.getElementById("periodic-table");
    if (table) {
      table.addEventListener("pointerover", function (e) {
        var cell = e.target.closest(".element-cell");
        if (!cell || (e.relatedTarget && cell.contains(e.relatedTarget))) return;
        if (window.matchMedia("(max-width: 900px)").matches) return;
        clearRelated();
        relate(cell);
      });
      table.addEventListener("pointerout", function (e) {
        var cell = e.target.closest(".element-cell");
        if (!cell || (e.relatedTarget && cell.contains(e.relatedTarget))) return;
        clearRelated();
      });
      table.addEventListener("focusin", function (e) {
        var cell = e.target.closest(".element-cell");
        if (!cell) return;
        clearRelated();
        relate(cell);
      });
      table.addEventListener("focusout", function () { clearRelated(); });
    }

    El.detail.syncHash();
  }

  init();
})();
