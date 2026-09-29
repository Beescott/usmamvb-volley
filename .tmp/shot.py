import pymupdf, sys
sys.stdout.reconfigure(encoding="utf-8")
d = pymupdf.open(r"c:\Users\kazeo\Downloads\SITE WEB - USMAMVB.pdf")
p = d[6]
W = p.rect.width
def shot(name, clip, zoom):
    pix = p.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=pymupdf.Rect(*clip))
    path = r"c:\Users\kazeo\usmamvb-volley\.tmp\\" + name + ".png"
    pix.save(path)
    print(path, pix.width, pix.height)
shot("va_full", (0, 2400, W, 3456), 1.3)
