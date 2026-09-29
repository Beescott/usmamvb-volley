import pymupdf, sys
sys.stdout.reconfigure(encoding="utf-8")
d = pymupdf.open(r"c:\Users\kazeo\Downloads\SITE WEB - USMAMVB.pdf")
for i in (6,7):
    p = d[i]
    print(f"--- page {i+1} rect={p.rect} rotation={p.rotation}")
    for b in p.get_text("blocks"):
        if b[6] == 0:
            print(round(b[0]),round(b[1]),round(b[2]),round(b[3]), repr(b[4][:160]))
