import pymupdf, sys
sys.stdout.reconfigure(encoding="utf-8")
d = pymupdf.open(r"c:\Users\kazeo\Downloads\SITE WEB - USMAMVB.pdf")
print("PAGES:", d.page_count)
out = []
for i, p in enumerate(d):
    t = p.get_text()
    out.append(f"\n===== PAGE {i+1} ===== chars={len(t)}\n{t}")
open(r"c:\Users\kazeo\usmamvb-volley\.tmp\pdf_text.txt","w",encoding="utf-8").write("".join(out))
for i, p in enumerate(d):
    print(i+1, len(p.get_text()), len(p.get_images()))
