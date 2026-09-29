import pymupdf, sys
sys.stdout.reconfigure(encoding="utf-8")
d = pymupdf.open(r"c:\Users\kazeo\Downloads\SITE WEB - USMAMVB.pdf")
p = d[6]
print("xobjects:", p.get_xobjects())
raw = p.get_text("rawdict")
print("block count:", len(raw["blocks"]))
for b in raw["blocks"]:
    if b["type"] != 0:
        print("IMAGEBLOCK", round(b["bbox"][0]), round(b["bbox"][1]), round(b["bbox"][2]), round(b["bbox"][3]))
        continue
    y0 = b["bbox"][1]
    if y0 < 2350:
        continue
    for l in b["lines"]:
        for s in l["spans"]:
            txt = "".join(ch["c"] for ch in s["chars"])
            print(round(s["bbox"][0]), round(s["bbox"][1]), "|", s["font"], "| size", round(s["size"], 1),
                  "| color", hex(s["color"]), "| dir", l["dir"], "| flags", s["flags"], "| nchars", len(s["chars"]), "|", repr(txt[:70]))
