/* ============================================================
   ELEMENTA — element detail: basic data + Bohr + orbital boxes
   ============================================================ */
(function () {
  "use strict";
  var El = window.El;
  if (!El || !El.data) return;

  var D = El.data;
  var layer = document.getElementById("detail-layer");
  var drawer = document.getElementById("detail-drawer");
  var content = document.getElementById("detail-content");
  var state = { current: null, trigger: null, trap: null, originalTitle: document.title };
  var closeTimer = null;

  function stateLabel(v) {
    if (v === 0) return "0";
    return v > 0 ? "+" + v : "−" + Math.abs(v);
  }

  function oxidationHtml(e) {
    if (!e.oxidation || !e.oxidation.states.length) return '<span class="missing">—</span>';
    return '<span class="oxidation-states">' + e.oxidation.states.map(function (v) {
      var cls = v === 0 ? "is-zero" : (v > 0 ? "is-positive" : "is-negative");
      return '<span class="ox-state ' + cls + '">' + stateLabel(v) + '</span>';
    }).join("") + '</span>';
  }

  function oxidationNote(e) {
    if (!e.oxidation) return "超重元素氧化态多为理论预测，未收录为确定值。";
    return (e.oxidation.note ? e.oxidation.note + " " : "") + "常见氧化态，来源 RSC / WebElements；0 表示单质。";
  }

  function dataRow(label, en, value, note) {
    return '<div class="data-row"><dt><span>' + label + '</span><em>' + en + '</em></dt>' +
      '<dd>' + value + (note ? '<small>' + El.esc(note) + '</small>' : '') + '</dd></div>';
  }

  var SPIN_UP = '<svg class="spin-arrow is-up" viewBox="0 0 10 18" aria-hidden="true"><path d="M5 16V3M2 6l3-3 3 3"/></svg>';
  var SPIN_DOWN = '<svg class="spin-arrow is-down" viewBox="0 0 10 18" aria-hidden="true"><path d="M5 2v13M2 12l3 3 3-3"/></svg>';
  var CAPACITY = { s: 1, p: 3, d: 5, f: 7 };

  function orbitalFigure(e) {
    if (!e.subshells || !e.subshells.length) return "";
    var blocks = e.subshells.map(function (sub) {
      var cap = CAPACITY[sub.l] || 1;
      var up = Math.min(sub.count, cap);
      var pairs = Math.max(0, sub.count - cap);
      var boxes = [];
      for (var i = 0; i < cap; i++) {
        var arrows = "";
        if (i < up) arrows += SPIN_UP;
        if (i < pairs) arrows += SPIN_DOWN;
        boxes.push('<span class="orbital-box" aria-hidden="true">' + arrows + '</span>');
      }
      return '<div class="orbital-block"><span class="orbital-label">' + sub.label +
        (sub.count ? "<sup>" + sub.count + "</sup>" : "") + '</span>' +
        '<div class="orbital-boxes">' + boxes.join("") + '</div></div>';
    }).join("");
    return '<figure class="orbital-figure" aria-label="' + El.esc(e.cnName + "的轨道方框图") + '">' +
      '<div class="bohr-head"><span class="figure-kicker">FIG. B</span><figcaption>轨道方框图</figcaption>' +
        '<span class="figure-note">按电子层 / 亚层顺序 · 非能级比例</span></div>' +
      '<div class="orbital-legend"><span>' + SPIN_UP + '自旋向上</span><span>' + SPIN_DOWN + '自旋向下</span><span>每格最多容纳 2 个电子</span></div>' +
      '<div class="orbital-grid">' + blocks + '</div>' +
      '<p class="orbital-caption">每个方框表示一个原子轨道；成对电子以相反方向箭头表示自旋相反。图中箭头只表示自旋方向，不表示空间取向或能级高低的精确比例。</p>' +
    '</figure>';
  }

  function bohrSvg(e) {
    var cat = El.category(e);
    var shells = e.shells || [];
    var n = shells.length;
    var size = 268, cx = size / 2, cy = size / 2;
    var inner = n > 1 ? 44 : 0;
    var outer = 112;
    var step = n > 1 ? (outer - inner) / (n - 1) : 0;
    var ringHtml = "";
    var dotHtml = "";
    var labels = [];
    var shellNames = ["K","L","M","N","O","P","Q"];
    shells.forEach(function (count, idx) {
      var r = n === 1 ? 84 : inner + step * idx;
      ringHtml += '<circle class="bohr-ring" cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" ' +
        'stroke="' + cat.color + '" stroke-width="0.9" opacity="' + (0.24 + idx * 0.035) + '" pathLength="100" ' +
        'style="animation-delay:' + (idx * 0.12) + 's"></circle>';
      labels.push('<span><b>' + (shellNames[idx] || idx + 1) + '</b> ' + count + '</span>');
      for (var k = 0; k < count; k++) {
        var angle = (-Math.PI / 2) + (k / count) * Math.PI * 2;
        var dx = cx + Math.cos(angle) * r;
        var dy = cy + Math.sin(angle) * r;
        dotHtml += '<circle class="bohr-dot" cx="' + dx.toFixed(2) + '" cy="' + dy.toFixed(2) + '" r="1.9" ' +
          'fill="' + cat.color + '" style="animation-delay:' + (0.45 + idx * 0.1 + (k / count) * 0.25) + 's"></circle>';
      }
    });
    return '<figure class="bohr-figure">' +
      '<div class="bohr-head"><span class="figure-kicker">FIG. A</span><figcaption>Bohr 电子层示意</figcaption>' +
        '<span class="figure-note">示意，非真实轨道比例</span></div>' +
      '<div class="bohr-stage"><svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + El.esc(e.cnName + "的电子层示意：" + shells.join("、")) + '">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="18" fill="' + cat.tint + '" stroke="' + cat.color + '" stroke-width="1"/>' +
        '<text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" class="bohr-z">' + e.z + '</text>' +
        ringHtml + dotHtml +
      '</svg></div>' +
      '<div class="bohr-shells">' + labels.join("") + '</div>' +
      '<p class="bohr-caption">圆环按 shells[] 电子数绘制；点代表电子计数，不代表真实空间位置或轨道形状。</p>' +
    '</figure>';
  }

  function render(e) {
    var cat = El.category(e);
    var tags = [];
    if (e.radioactive) tags.push('<span class="tag tag-radio">放射性</span>');
    if (e.synthetic) tags.push('<span class="tag">合成元素</span>');
    if (e.sublimates) tags.push('<span class="tag">升华</span>');
    if (e.discoveryYear == null) tags.push('<span class="tag">古代已知</span>');

    var mass = El.fmtMass(e);
    var groupText = e.group == null ? "镧系 / 锕系" : "第 " + e.group + " 族";

    content.innerHTML =
      '<div class="detail-hero" style="--cat:' + cat.color + ';--cat-tint:' + cat.tint + '">' +
        '<div class="hero-strip"></div>' +
        '<div class="hero-top"><span class="hero-z">Z ' + e.z + '</span><span class="hero-cat">' + El.esc(e.categoryLabel) + '</span></div>' +
        '<div class="hero-symbol">' + El.esc(e.symbol) + '</div>' +
        '<div class="hero-names"><h2 id="detail-heading">' + El.esc(e.cnName) + '</h2><p>' + El.esc(e.name) + '</p></div>' +
        '<div class="hero-mass"><span>ATOMIC MASS</span><strong>' + mass + '</strong></div>' +
        '<div class="hero-tags">' + tags.join("") + '</div>' +
      '</div>' +
      '<p class="detail-lede">' + El.esc(e.description) + '</p>' +
      '<div class="detail-identity"><span class="identity-line"></span><span>' + El.esc(e.discoveryEra) + ' · ' + El.esc(e.block) + ' 区 · 第 ' + e.period + ' 周期</span></div>' +
      bohrSvg(e) +
      '<section class="data-section" aria-labelledby="data-heading">' +
        '<div class="section-top"><span class="section-no">01</span><h3 id="data-heading">基本信息 <em>DATA</em></h3></div>' +
        '<dl class="data-table">' +
          dataRow("原子序数", "Z", String(e.z)) +
          dataRow("原子量", "ATOMIC MASS", mass, e.atomicMass == null ? "方括号为最稳定同位素质量数" : null) +
          dataRow("电子排布（简写）", "CONFIG", '<code>' + El.esc(e.electronConfig) + '</code>') +
          '<div class="data-row data-row-full"><dt><span>电子排布（完整）</span><em>FULL CONFIG</em></dt>' +
            '<dd><span class="full-config">' + El.configHtml(e.fullElectronConfig) + '</span></dd></div>' +
          dataRow("电子层", "SHELLS", '<code>' + e.shells.join(" · ") + '</code>', "sum = " + e.z) +
          dataRow("常见氧化态", "OXIDATION", oxidationHtml(e), oxidationNote(e)) +
          dataRow("电负性", "PAULING", e.electronegativity == null ? '<span class="missing">—</span>' : Number(e.electronegativity).toFixed(2)) +
          dataRow("原子半径", "RADIUS", e.atomicRadiusPm == null ? '<span class="missing">—</span>' : El.fmtInt(e.atomicRadiusPm) + " pm", e.radiusType) +
          dataRow("熔点", "MELTING", e.meltingK == null ? '<span class="missing">—</span>' : El.fmtK(e.meltingK) + " K") +
          dataRow(e.sublimates ? "沸点 / 升华" : "沸点", "BOILING", e.boilingK == null ? '<span class="missing">—</span>' : El.fmtK(e.boilingK) + " K", e.sublimates ? "常压升华温度" : null) +
          dataRow("密度", "DENSITY", e.density == null ? '<span class="missing">—</span>' : El.fmtDensity(e), e.densityNote) +
          dataRow("标准状态", "STP", El.esc(e.stateLabel), "298 K · 1 atm") +
          dataRow("类别", "CATEGORY", El.esc(e.categoryLabel)) +
          dataRow("位置", "POSITION", "第 " + e.period + " 周期 · " + groupText + " · " + e.block + " 区") +
          dataRow("发现", "DISCOVERY", El.esc(El.fmtDiscovery(e)) + (e.discoveredBy ? '<small>' + El.esc(e.discoveredBy) + '</small>' : ""), e.discoveryNote) +
          dataRow("地壳丰度", "ABUNDANCE", El.esc(El.fmtAbundance(e.abundance)), e.abundanceNote) +
        '</dl>' +
      '</section>' +
      orbitalFigure(e) +
      '<div class="detail-footnote"><strong>数据说明</strong> 依据 IUPAC/CIAAW、NIST、RSC 等公开资料整理；缺失值以「—」表示，不按 0 处理。完整排布与轨道图由电子排布数据派生，仅作结构示意。</div>';
  }

  function open(zOrSymbol, opts) {
    if (!layer || !content) return;
    opts = opts || {};
    var e = typeof zOrSymbol === "number" ? D.byZ[zOrSymbol] : (D.bySymbol[zOrSymbol] || D.byZ[Number(zOrSymbol)]);
    if (!e) return;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    if (state.current && state.current.z === e.z && !layer.hidden && !opts.force) return;
    state.current = e;
    if (layer.hidden) {
      state.trigger = opts.trigger || document.activeElement;
      state.originalTitle = document.title;
    }
    render(e);
    content.scrollTop = 0;
    layer.hidden = false;
    requestAnimationFrame(function () { layer.classList.add("is-open"); });
    El.lockScroll();
    if (!state.trap) state.trap = El.trapFocus(drawer);
    setTimeout(function () {
      if (drawer) {
        try { drawer.focus({ preventScroll: true }); } catch (err) { drawer.focus(); }
      }
    }, 80);
    if (opts.updateHash !== false) {
      try { history.replaceState(null, "", "#element-" + e.symbol); } catch (err) {}
    }
    document.title = e.symbol + " · " + e.cnName + " — 元素谱 / ELEMENTA";
  }

  function close() {
    if (!layer || layer.hidden) return;
    layer.classList.remove("is-open");
    if (state.trap) { state.trap(); state.trap = null; }
    El.unlockScroll();
    if (/^#element-/.test(window.location.hash)) {
      try { history.replaceState(null, "", window.location.pathname + window.location.search); } catch (e) {}
    }
    closeTimer = setTimeout(function () { layer.hidden = true; closeTimer = null; }, 220);
    if (state.trigger && typeof state.trigger.focus === "function") {
      try { state.trigger.focus({ preventScroll: true }); } catch (e) {}
    }
    document.title = state.originalTitle;
    state.current = null;
  }

  function syncHash() {
    var sym = El.hashSymbol(window.location.hash);
    if (!sym) return;
    var e = D.bySymbol[sym];
    if (e) open(e.z, { updateHash: false, trigger: null });
  }

  if (layer) {
    layer.addEventListener("click", function (e) {
      if (e.target.closest('[data-action="close-detail"]')) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !layer.hidden) close();
    });
  }
  window.addEventListener("hashchange", function () {
    var sym = El.hashSymbol(window.location.hash);
    if (sym) syncHash();
    else if (!layer.hidden) close();
  });
  window.addEventListener("load", function () { setTimeout(syncHash, 30); });

  El.detail = { open: open, close: close, syncHash: syncHash };
})();
