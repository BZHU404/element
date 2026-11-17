# 元素谱 / ELEMENTA

**118 种元素，一张表。**

一个单页元素周期表档案馆：保留周期表本体与每个元素的基本信息，去掉了时间线、趋势图、阅读指南、搜索、筛选、热力图、对比、打印、随机元素与深度档案。

---

## 快速开始

### 直接打开

双击 **index.html**。项目使用原生 HTML / CSS / JavaScript，无构建步骤、无 ES modules、无外部 CDN，可直接以 `file://` 运行。

### 本地服务器

```bash
cd 元素周期表
python3 -m http.server 8000
# http://localhost:8000/
```

### GitHub Pages

1. 新建仓库，上传项目根目录全部文件（含 `.nojekyll`）。
2. Settings → Pages → Deploy from a branch → `main` / `(root)`。
3. 访问 `https://<用户名>.github.io/<仓库名>/`。

所有资源均使用相对路径，可部署在仓库子路径下。

---

## 保留的内容

### 周期表本体

- 18 族 × 7 周期，镧系 / 锕系单独两行。
- 每格：原子序数、符号、中文名、原子量、顶部类别细色条。
- 悬停 / 聚焦：高亮同族、同周期。
- 点击：打开元素详情。
- 类别图例。
- 移动端（≤900px）：默认按周期分组的列表视图，可切换为横向滚动的表格视图；页面本身不横向溢出。
- 元素深链接：`index.html#element-Fe`。

### 每个元素的基本信息

- 原子序数、原子量（无稳定同位素用方括号质量数）。
- 电子排布简写与完整排布（`1s² 2s² 2p⁶ …`）。
- 电子层（`shells[]`）与 Bohr 电子层示意。
- 轨道方框图：每个方框一个轨道，↑ / ↓ 表示自旋方向。
- 常见氧化态（`+2`、`−2`、`0` 等）。
- 电负性、原子半径、熔点、沸点、密度、标准状态。
- 类别、族 / 周期 / 区、发现信息、地壳丰度。
- 一段简要说明。

没有深度档案、来源卡片、对比、评分或推荐。

---

## 文件结构

```text
.
├── index.html
├── styles/
│   ├── main.css
│   ├── components.css
│   ├── animations.css
│   └── responsive.css
├── scripts/
│   ├── core.js
│   ├── layout.js
│   ├── electron-config.js
│   ├── detail.js
│   └── page.js
├── data/
│   ├── elements-core.js
│   ├── elements-chemistry.js
│   └── elements.js
├── assets/
│   ├── logo.svg
│   ├── logo-mark.svg
│   └── logo-full.svg
├── tools/
│   └── validate.py
├── .nojekyll
└── README.md
```

---

## 数据说明

- 118 个元素，Z = 1–118，不重不漏。
- 原子量：83 个 IUPAC/CIAAW 常规值；35 个没有稳定同位素，显示方括号质量数。
- 熔点 102 个有值、沸点 99 个、密度 97 个、电负性 99 个、原子半径 103 个；缺失值显示「—」，不以 0 替代。
- 常见氧化态覆盖 Z 1–103；104–118 号超重元素多为理论预测，明确留空，不把预测值写成常用值。
- 完整电子排布由简写展开，并按电子层 / 亚层排序；Cr、Cu、Pd 等例外按原简写保留。
- 轨道图按洪特规则由亚层电子数派生；只表示自旋方向，不代表真实轨道形状或精确能级。
- 数据依据 IUPAC/CIAAW、NIST、RSC、WebElements 等公开资料整理；缺失值保持空白。

---

## 校验

```bash
python3 tools/validate.py
```

实际输出：

```text
ELEMENTA VALIDATION
file: data/elements-core.js  ·  elements: 118  ·  sources: 10
  [PASS] 118 elements, z 1–118 unique
  [PASS] symbol unique
  [PASS] cnName unique
  [PASS] sum(shells) === z for all elements
  [PASS] group / period match standard table
  [PASS] lanthanides 57–71 / actinides 89–103 group=null, f-block
  [PASS] category / stateSTP / block vocabularies
  [PASS] no missing numeric encoded as 0
  [PASS] radioactive / synthetic flags
  [PASS] at least one known source per element; verification A/B/C/U
  [PASS] discoveryYear null ⇔ 古代; era consistent
  [PASS] physical values positive; density units valid
  [PASS] radioactive masses use bracketed massNumber
  [PASS] every element has a description
  [PASS] full electron configuration sums to Z
  [PASS] common oxidation states present for Z 1–103
  [WARN] superheavy oxidation states intentionally omitted: Bh, Cn, Db, Ds, Fl, Hs, Lv, Mc, Mt, Nh, Og, Rf, Rg, Sg, Ts

RESULT: all hard data-integrity checks passed.
```

---

## 实测

- 1440×1200：118 格完整；无页面横向滚动。
- 390×844：默认列表视图 118 行；页面宽度 390、scrollWidth 390；表格视图在容器内横向滚动。
- 控制台：无 JS 异常，无资源 404。
- Fe 详情：简写 / 完整排布、`+2 / +3` 氧化态、4 层 Bohr 示意、15 个轨道方框。
- 生僻字 104–118：字符码位正确，Chromium 下无 tofu。
- 仅测试 Chromium（Microsoft Edge）；Safari、Firefox 与实体打印未测试。

---

## 边界

本项目仅用于资料与教育展示，不构成医疗、安全操作、收藏鉴定或投资建议；不提供任何危险物质的提纯、合成、制造或武器化流程。
