# Images: naming, sizes, placeholders

All images live in `assets/img/`. Names are lowercase, no space, no accent.
Photos are JPEG; PNG only for the logo and the three town emblems.
`Emblememery.png` keeps its capital E: it is referenced as such, do not rename it alone.

## Expected files

| File | Use | Target |
| --- | --- | --- |
| `logo.png` | header (44 px) and favicon | 729×729, transparent |
| `hero.jpg` | home banner | landscape ≥ 1200 wide (currently 1080×720) |
| `bureau-<name>.jpg` | board/coach portraits | square 840×840, top-anchored crop |
| `equipe-1.jpg` … `equipe-4.jpg` | team cards | 4:3, ≥ 800×600 (missing) |
| `gymnase-1.jpg` … `gymnase-3.jpg` | Bozon, Méry, Mériel | 3:2, ≥ 1200×800 (missing) |
| `actu-*.jpg` | news cards | square or 4:3 (see `news.md`) |
| `aide-pass-sport.jpg`, `aide-labaz.jpg` | official grant posters, never cropped | 1200 wide |
| `meryplouz2022.jpg`, `remise-trophee.jpg` | contact sheets on the news page | as received |
| `emblemeauvers.png`, `Emblememery.png`, `emblememeriel.png` | town emblems, news page header | 425×470, 217×233, 192×192 |
| `qr-helloasso.png` | HelloAsso QR, membership page | square 200×200, see `content.md` |

Present portraits: goulain, cledassou, cabarrou, boullay, pissoort, baron,
barthelemy, torossian. Missing: champenois, maillard (fallback gradient shown).

## Placeholders

A missing photo never breaks a page: the element shows a gold gradient fallback.
Mechanism: the slot is a `span` with a modifier class, and `style.css` sets
`--xxx-photo: url('../img/file.jpg')` on that modifier (CSS paths are relative
to the stylesheet, not the page). Adding a photo = drop the file with the
expected name; for a new slot, add the modifier rule in `style.css`.

Photos that carry meaning (news contact sheets, grant posters) are real `<img>`
tags with a French `alt`, `width`/`height` matching the file, `loading="lazy"`.
After resizing a file, update its `width`/`height` attributes or the layout
jumps on load.

## Preparing a photo (macOS, no install)

```bash
# resize to 1200 px on the long edge, JPEG quality 80, same name
sips -Z 1200 -s format jpeg -s formatOptions 80 photo.jpg --out assets/img/photo.jpg
```
Budget: a card photo under 150 KB, a banner under 300 KB. Re-encoding from a
fresh bitmap also drops EXIF and GPS data, which must not ship.

Portraits: crop to a square anchored at the top (centering a vertical portrait
cuts the head), 840×840.

## Town emblems

Their background is baked to `#f2f0ec`, the exact value of `--cream` the news
page header is painted with. If `--cream` changes, the three PNGs must be
redone. Originals are archived locally in `.tmp/emblemes-origine/`.

## Archives, not in the repo

`.tmp/` is git-ignored. It holds the raw photos received from the club
(`.tmp/originaux-photos/`, up to 3.3 MB each) and the emblem originals. Never
add an unresized original to `assets/img/`.
