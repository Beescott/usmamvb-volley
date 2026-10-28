# News page and back-end

## Page `Actualite.html`

One featured item `article.actu-une` (two columns), then `ul.actus__grid` of
`article.actu` cards, three per row. `h1` page, `h2` featured, `h3` per card.
Each card: `.actu__media` (square; either a modifier class with a fallback
gradient or a real `<img class="actu__photo">`), `.actu__meta` with
`.actu__categorie` and `<time datetime="YYYY-MM-DD">`, title, text.

The page header shows the three town emblems (see `images.md`).

Current dates ("Septembre 2026", "Été 2026"…) are plausible fallbacks, not
club-confirmed; `.actus__note` says so to the visitor. Replace them with real
dates when the club provides them. No score, ranking or result has been
invented.

## "Poster" module: current state (prototype, no back-end)

Bottom of the page, a `<details class="redac">` whose summary reads "Poster".
Login form `#redac-login` (code checked in `main.js`), then form `#redac-form`:
category (`#redac-categorie` with datalist), date, title, text, up to 3 photos.

What it does today, last block of `main.js`:
- resizes photos in the browser (1200 px wide, JPEG 0.72) to data URLs;
- stores the item in `localStorage` under key `usmamvb.actus`;
- prepends the card to `.actus__grid` with `.actu--postee` and a "Postée depuis
  ce navigateur" note.

Limits, say them before promising anything to the club:
- the login code is readable in the source: a speed bump, not authentication;
- items exist only in the browser that posted them; visitors never see them.

Rendering safety to keep: all user text goes through `textContent`, never
`innerHTML`; images only into a `src` attribute; `localStorage` wrapped in
`try/catch`; `.then(ok, err)` rather than `.catch` (legacy syntax checker).

## Target back-end (planned, not built yet)

Everything on Cloudflare's free tier, deployed from this repo:

| Piece | Role |
| --- | --- |
| Pages | hosts the static site |
| Worker | API: `GET /api/actus` (public JSON), `POST /api/actus` and `DELETE /api/actus/:id` (authenticated) |
| D1 | table `actus`: id, date, categorie, titre, texte, photos (JSON array of R2 keys), created_at |
| R2 | photo files, served through the Worker or a public bucket URL |
| Access | login by email one-time code for board members; protects `/admin` and the write routes |

Migration plan for `main.js`: keep `creerCarte()` and the form; replace
`lire()`/`ecrire()` with `fetch` calls; upload photos as `FormData` instead of
data URLs; drop the in-page login once Access is in place. Keep the HTML cards
static for the items already in the page, or move them into D1 as the seed.
