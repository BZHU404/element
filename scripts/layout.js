/* ============================================================
   ELEMENTA — shell: header, footer, detail drawer
   ============================================================ */
(function () {
  "use strict";
  var El = window.El;
  if (!El) return;

  var headerHost = document.getElementById("site-header");
  if (headerHost) {
    headerHost.innerHTML =
      '<header class="site-header"><div class="header-inner">' +
        '<a class="brand" href="index.html" aria-label="元素谱 ELEMENTA · 首页">' +
          '<img class="brand-mark" src="assets/logo-mark.svg" width="40" height="40" alt="">' +
          '<span class="brand-type"><span class="brand-cn">元素谱</span><span class="brand-en">ELEMENTA</span></span>' +
        '</a>' +
        '<p class="header-note">118 ELEMENTS · ONE TABLE</p>' +
      '</div></header>';
  }

  var footerHost = document.getElementById("site-footer");
  if (footerHost) {
    footerHost.innerHTML =
      '<footer class="site-footer"><div class="footer-inner">' +
        '<div class="footer-brand"><img src="assets/logo-mark.svg" width="36" height="36" alt=""><span>元素谱 / ELEMENTA</span></div>' +
        '<p class="footer-note">数据依据 IUPAC/CIAAW、NIST、RSC 等公开资料整理；缺失值显示「—」。本档案仅用于资料与教育展示，不构成医疗、安全操作或收藏建议。</p>' +
        '<p class="footer-meta">SIMON WORKSHOP™ · 118 ELEMENTS · ONE TABLE</p>' +
      '</div></footer>';
  }

  var shell = document.createElement("div");
  shell.innerHTML =
    '<div class="drawer-layer" id="detail-layer" hidden>' +
      '<div class="drawer-scrim" data-action="close-detail"></div>' +
      '<aside class="detail-drawer" id="detail-drawer" role="dialog" aria-modal="true" aria-labelledby="detail-heading" tabindex="-1">' +
        '<div class="drawer-top"><span class="drawer-kicker">ELEMENT FILE / 元素信息</span>' +
          '<button class="drawer-close" type="button" data-action="close-detail" aria-label="关闭详情（Esc）">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>' +
          '</button></div>' +
        '<div class="detail-scroll" id="detail-content"></div>' +
      '</aside>' +
    '</div>';
  document.body.appendChild(shell.firstChild);
})();
