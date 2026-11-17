#!/usr/bin/env python3
"""ELEMENTA data integrity validator.

Reads data/elements-core.js (static JSON block) and checks the hard rules
from the project brief. Exit code 0 = all checks pass.
"""
import json, pathlib, re, sys
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parent.parent
CORE = ROOT / "data" / "elements-core.js"

EXPECTED_GROUP = {}
def put(z, group, period):
    EXPECTED_GROUP[z] = (group, period)

put(1,1,1); put(2,18,1)
for z,g in zip(range(3,11),[1,2,13,14,15,16,17,18]): put(z,g,2)
for z,g in zip(range(11,19),[1,2,13,14,15,16,17,18]): put(z,g,3)
put(19,1,4); put(20,2,4)
for z,g in zip(range(21,31),range(3,13)): put(z,g,4)
for z,g in zip(range(31,37),range(13,19)): put(z,g,4)
put(37,1,5); put(38,2,5)
for z,g in zip(range(39,49),range(3,13)): put(z,g,5)
for z,g in zip(range(49,55),range(13,19)): put(z,g,5)
put(55,1,6); put(56,2,6)
for z in range(57,72): put(z,None,6)
for z,g in zip(range(72,81),range(4,13)): put(z,g,6)
for z,g in zip(range(81,87),range(13,19)): put(z,g,6)
put(87,1,7); put(88,2,7)
for z in range(89,104): put(z,None,7)
for z,g in zip(range(104,113),range(4,13)): put(z,g,7)
for z,g in zip(range(113,119),range(13,19)): put(z,g,7)

RADIO_REQUIRED = set(range(43,44)) | set(range(61,62)) | set(range(83,119))
SYNTH_REQUIRED = {43,61,85,93,94} | set(range(95,119))
CATEGORIES = {"alkali","alkaline","transition","post-transition","metalloid","nonmetal",
              "halogen","noble","lanthanide","actinide","unknown"}
STATES = {"solid","liquid","gas","unknown"}
BLOCKS = {"s","p","d","f"}
VERS = {"A","B","C","U"}
ERAS = {"古代","18世纪及以前","19世纪","20世纪","21世纪"}

def load():
    text = CORE.read_text(encoding="utf-8")
    m = re.search(r"/\* DATA:START \*/(.*?)/\* DATA:END \*/", text, re.S)
    sm = re.search(r"/\* SOURCES:START \*/(.*?)/\* SOURCES:END \*/", text, re.S)
    if not m or not sm:
        sys.exit("FATAL: data markers not found in elements-core.js")
    return json.loads(m.group(1)), json.loads(sm.group(1))

def main():
    elements, sources = load()
    errors, warnings = [], []
    checks = []

    def need(cond, msg):
        if not cond: errors.append(msg)

    need(len(elements) == 118, f"element count is {len(elements)}, expected 118")
    zs = [e["z"] for e in elements]
    need(sorted(zs) == list(range(1,119)), "z values are not exactly 1..118 without duplicates")
    checks.append(("118 elements, z 1–118 unique", len(elements) == 118 and sorted(zs) == list(range(1,119))))

    syms = Counter(e["symbol"] for e in elements)
    cns = Counter(e["cnName"] for e in elements)
    dup_sym = [k for k,v in syms.items() if v > 1]
    dup_cn = [k for k,v in cns.items() if v > 1]
    need(not dup_sym, f"duplicate symbols: {dup_sym}")
    need(not dup_cn, f"duplicate cnName: {dup_cn}")
    checks.append(("symbol unique", not dup_sym))
    checks.append(("cnName unique", not dup_cn))

    shell_fail = []
    for e in elements:
        if sum(e["shells"]) != e["z"]:
            shell_fail.append((e["symbol"], sum(e["shells"]), e["z"]))
    need(not shell_fail, f"shell sum mismatch: {shell_fail}")
    checks.append(("sum(shells) === z for all elements", not shell_fail))

    pos_fail = []
    for e in elements:
        if e["z"] in EXPECTED_GROUP:
            if (e["group"], e["period"]) != EXPECTED_GROUP[e["z"]]:
                pos_fail.append((e["symbol"], e["group"], e["period"], EXPECTED_GROUP[e["z"]]))
    need(not pos_fail, f"group/period mismatch: {pos_fail}")
    checks.append(("group / period match standard table", not pos_fail))

    fblock = [e for e in elements if 57 <= e["z"] <= 71 or 89 <= e["z"] <= 103]
    f_fail = [e["symbol"] for e in fblock
              if e["group"] is not None or e["block"] != "f"
              or e["period"] != (6 if e["z"] <= 71 else 7)]
    need(len(fblock) == 30 and not f_fail, f"lanthanide/actinide placement failed: {f_fail}")
    checks.append(("lanthanides 57–71 / actinides 89–103 group=null, f-block", len(fblock)==30 and not f_fail))

    cat_fail = [e["symbol"] for e in elements if e["category"] not in CATEGORIES]
    state_fail = [e["symbol"] for e in elements if e["stateSTP"] not in STATES]
    block_fail = [e["symbol"] for e in elements if e["block"] not in BLOCKS]
    need(not cat_fail, f"bad category: {cat_fail}")
    need(not state_fail, f"bad stateSTP: {state_fail}")
    need(not block_fail, f"bad block: {block_fail}")
    checks.append(("category / stateSTP / block vocabularies", not cat_fail and not state_fail and not block_fail))

    zeros = []
    for e in elements:
        for f in ("atomicMass","electronegativity","atomicRadiusPm","meltingK","boilingK","density","abundance"):
            if e[f] == 0:
                zeros.append((e["symbol"], f))
    need(not zeros, f"missing numeric values encoded as 0: {zeros}")
    checks.append(("no missing numeric encoded as 0", not zeros))

    radio_fail = [e["symbol"] for e in elements if e["z"] in RADIO_REQUIRED and not e["radioactive"]]
    need(not radio_fail, f"radioactive flag missing: {radio_fail}")
    synth_fail = [e["symbol"] for e in elements if e["z"] in SYNTH_REQUIRED and not e["synthetic"]]
    need(not synth_fail, f"synthetic flag missing: {synth_fail}")
    checks.append(("radioactive / synthetic flags", not radio_fail and not synth_fail))

    src_fail, ver_fail = [], []
    for e in elements:
        if not e["sources"]: src_fail.append(e["symbol"])
        for s in e["sources"]:
            if s not in sources: src_fail.append(f"{e['symbol']}:{s}")
        if e["verification"] not in VERS: ver_fail.append(e["symbol"])
    need(not src_fail, f"source issues: {src_fail}")
    need(not ver_fail, f"verification issues: {ver_fail}")
    checks.append(("at least one known source per element; verification A/B/C/U", not src_fail and not ver_fail))

    era_fail = []
    for e in elements:
        y = e["discoveryYear"]
        if y is None:
            if e["discoveryEra"] != "古代": era_fail.append(e["symbol"])
        else:
            expected = "18世纪及以前" if y < 1800 else "19世纪" if y < 1900 else "20世纪" if y < 2000 else "21世纪"
            if e["discoveryEra"] != expected or not (1200 <= y <= 2026):
                era_fail.append(e["symbol"])
    need(not era_fail, f"discovery era/year issues: {era_fail}")
    checks.append(("discoveryYear null ⇔ 古代; era consistent", not era_fail))

    neg = []
    for e in elements:
        for f in ("meltingK","boilingK","density"):
            if e[f] is not None and e[f] <= 0: neg.append((e["symbol"], f, e[f]))
        if e["density"] is not None and e["densityUnit"] not in {"g/cm3","g/L"}:
            neg.append((e["symbol"], "densityUnit", e["densityUnit"]))
        if e["density"] is None and e["densityUnit"] is not None:
            neg.append((e["symbol"], "densityUnit-with-null", None))
    need(not neg, f"invalid physical values: {neg}")
    checks.append(("physical values positive; density units valid", not neg))

    mass_fail = [e["symbol"] for e in elements
                 if e["atomicMass"] is None and not isinstance(e["massNumber"], int)]
    need(not mass_fail, f"null mass without massNumber: {mass_fail}")
    checks.append(("radioactive masses use bracketed massNumber", not mass_fail))

    desc_fail = [e["symbol"] for e in elements if not e["description"] or len(e["description"]) < 6]
    need(not desc_fail, f"empty description: {desc_fail}")
    checks.append(("every element has a description", not desc_fail))

    noble = {
        "He": "1s2",
        "Ne": "1s2 2s2 2p6",
        "Ar": "1s2 2s2 2p6 3s2 3p6",
        "Kr": "1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6",
        "Xe": "1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6",
        "Rn": "1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 4f14 5s2 5p6 5d10 6s2 6p6",
    }

    def expand_config(cfg):
        m = re.match(r"^\[([A-Z][a-z]?)\](.*)$", (cfg or "").strip())
        if m and m.group(1) in noble:
            cfg = noble[m.group(1)] + " " + m.group(2)
        return " ".join((cfg or "").split())

    def config_electrons(cfg):
        return sum(int(n) for _, _, n in re.findall(r"(\d)([spdf])(\d+)", cfg))

    full_fail = []
    for e in elements:
        full = expand_config(e["electronConfig"])
        if config_electrons(full) != e["z"]:
            full_fail.append((e["symbol"], config_electrons(full), e["z"], full))
    need(not full_fail, f"full electron configuration mismatches: {full_fail}")
    checks.append(("full electron configuration sums to Z", not full_fail))

    chem_path = ROOT / "data" / "elements-chemistry.js"
    if chem_path.exists():
        chem_text = chem_path.read_text(encoding="utf-8")
        chem_keys = set(re.findall(r'^    "([A-Z][a-z]?)":\s*\{', chem_text, re.M))
        need_chem = {e["symbol"] for e in elements if e["z"] <= 103}
        chem_missing = sorted(need_chem - chem_keys)
        need(not chem_missing, f"oxidation states missing for: {chem_missing}")
        checks.append(("common oxidation states present for Z 1–103", not chem_missing))
        excluded = sorted({e["symbol"] for e in elements if e["z"] >= 104} - chem_keys)
        if excluded:
            warnings.append("superheavy oxidation states intentionally omitted: " + ", ".join(excluded))
    else:
        warnings.append("elements-chemistry.js not found; oxidation-state coverage not checked")

    print("ELEMENTA VALIDATION")
    print(f"file: data/elements-core.js  ·  elements: {len(elements)}  ·  sources: {len(sources)}")
    for name, ok in checks:
        print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
    if warnings:
        for w in warnings: print(f"  [WARN] {w}")
    if errors:
        print(f"\n{len(errors)} ERROR(S):")
        for e in errors: print("  -", e)
        sys.exit(1)
    print("\nRESULT: all hard data-integrity checks passed.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
