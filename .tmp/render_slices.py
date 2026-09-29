import pymupdf, sys, os
sys.stdout.reconfigure(encoding="utf-8")
OUT = r"c:\Users\kazeo\usmamvb-volley\.tmp"
d = pymupdf.open(r"c:\Users\kazeo\Downloads\SITE WEB - USMAMVB.pdf")
p = d[6]
W = p.rect.width

print("--- images with bbox ymin>2300 ---")
for info in p.get_image_info(xrefs=True):
    b = info["bbox"]
    if b[1] > 2300:
        print(round(b[0]), round(b[1]), round(b[2]), round(b[3]), "xref", info.get("xref"))

print("--- drawing count in gap 2620..3060 ---")
n = 0
for dr in p.get_drawings():
    r = dr["rect"]
    if r.y0 > 2620 and r.y1 < 3060:
        n += 1
print("drawings:", n)

top, bot, step, zoom = 2380, 3456, 280, 3.0
i = 0
y = top
while y < bot:
    i += 1
    clip = pymupdf.Rect(0, y, W, min(y + step, bot))
    pix = p.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip)
    path = os.path.join(OUT, f"va_{i:02d}.png")
    pix.save(path)
    print("saved", path, pix.width, pix.height)
    y += step
