# News: page, back-end, members who can post

## Page `Actualite.html`

One featured item `article.actu-une` (two columns), then `ul.actus__grid` of
`article.actu` cards, three per row. `h1` page, `h2` featured, `h3` per card.
Each card: `.actu__media` (square; either a modifier class with a fallback
gradient or a real `<img class="actu__photo">`), `.actu__meta` with
`.actu__categorie` and `<time datetime="YYYY-MM-DD">`, title, text.

The page header shows the three town emblems (see `images.md`).

The six cards written in the HTML are the seed content. Current dates
("Septembre 2026", "Été 2026"…) are plausible fallbacks, not club-confirmed;
`.actus__note` says so to the visitor. Replace them with real dates when the
club provides them. No score, ranking or result has been invented.

Items posted by the board through the "Poster" panel are rendered by
`main.js` **before** these static cards, newest first. They live on the
server, not in the HTML.

## How a board member posts (what to tell them)

1. Open <https://usmamvb.fr/Actualite>, scroll to the bottom, open **Poster**.
2. Enter their e-mail and their personal code (given once by whoever enrolled
   them, see below). The session lasts 30 days on that browser.
3. Fill category, date, title, paragraph (1200 characters max); add up to 3
   photos (25 MB each before resizing, resized to 1200 px in the browser).
4. **Poster**. The item appears at the top of the grid for every visitor at
   once. **Supprimer** under an item removes it (confirmation asked).

Lost code: enrol the same e-mail again, it replaces the old code.

## Members: adding and removing people who can post

A member is a row in the D1 table `membres`: e-mail + PBKDF2-SHA256 hash of a
personal code. No Cloudflare, GitHub or OVH account is involved.

Prerequisites, once per machine: Node ≥ 20, a checkout of the repo, and
`npx wrangler login` with a Cloudflare account that is a member of the club
account `usmamvb@gmail.com` (`npx wrangler whoami` to check).

Add or replace a member (prints the code **once**, stores only the hash):

```bash
node scripts/ajouter-membre.mjs prenom.nom@exemple.fr
```

Give the code to the person directly (in person, SMS, or a message that will
be deleted); never commit it, never put it in a shared document.

List members:

```bash
npx wrangler d1 execute usmamvb-actus --remote --command "SELECT email, created_at FROM membres"
```

Remove one (access is revoked immediately, even with a valid cookie):

```bash
npx wrangler d1 execute usmamvb-actus --remote --command "DELETE FROM membres WHERE email = 'x@y.fr'"
```

Same commands with `--local` target the `wrangler dev` database. The script
passes SQL with `--command`, not `--file`: the file import endpoint is not
allowed to the `wrangler login` token.

## Back-end: Worker + D1 + KV

Everything runs in the same Worker as the static site, from `src/index.js`
(`main` in `wrangler.jsonc`; `/api/*` is routed to the Worker first, everything
else is served from assets). Free tier, no card on the account.

| Piece | Binding | Role |
| --- | --- | --- |
| D1 `usmamvb-actus` (id `5e6fd4b2…`) | `DB` | tables `actus` and `membres`, schema in `migrations/` |
| KV `PHOTOS` (id `e065bce9…`) | `PHOTOS` | one key per photo, `photo:<uuid>`, metadata `{ type }` |
| Secret `SESSION_SECRET` | `env.SESSION_SECRET` | HMAC key of the session cookie |

Routes:

| Route | Auth | Does |
| --- | --- | --- |
| `GET /api/actus` | public | latest 100 items, JSON, photos as `/api/photos/<id>` URLs |
| `GET /api/photos/:id` | public | the photo, `Cache-Control: immutable` |
| `POST /api/login` | — | `{ email, code }` → session cookie |
| `POST /api/logout` | — | clears the cookie |
| `GET /api/me` | cookie | `{ email }` or 401 |
| `POST /api/actus` | cookie | multipart: categorie, date, titre, texte, up to 3 `photos` |
| `DELETE /api/actus/:id` | cookie | removes the row and its KV photos |

Server-side limits: categorie 40, titre 90, texte 1200 characters; 3 photos,
2 MB each after resizing, JPEG/PNG/WebP. Items are capped at the latest 100 in
the public list; older ones stay in D1.

### Sessions and safety

The session is a signed cookie (`usmamvb_session`, HttpOnly, Secure,
SameSite=Strict, `Path=/api`, 30 days) holding `email.expiry.signature`,
HMAC-SHA256 with `SESSION_SECRET`. Nothing is stored server-side; every
authenticated call re-checks that the e-mail is still in `membres`. Mutating
routes also refuse a foreign `Origin` header. An unknown e-mail still goes
through a PBKDF2 round, so response time does not reveal who is a member.

Rotating `SESSION_SECRET` (`npx wrangler secret put SESSION_SECRET`) logs
everyone out; nothing else changes.

### Data: where it is, how to back it up

- Items: D1. Export: `npx wrangler d1 export usmamvb-actus --remote --output actus.sql`.
- Photos: KV. List keys: `npx wrangler kv key list --binding PHOTOS --remote`.
  There is no bulk export; photos are only as safe as KV (durable, replicated).
- Deleting an item deletes its photos. Nothing else ever deletes data.

### Schema changes

Add a numbered file in `migrations/`, apply locally
(`npx wrangler d1 migrations apply usmamvb-actus --local`), then remotely
(`--remote`) **before** merging the code that needs it. The Git build does
not run migrations.

### Front-end module (`main.js`, last block)

- On load: `GET /api/me` opens the "Poster" form directly when the cookie is
  valid, then `GET /api/actus` renders the server items before the static
  cards (`li[data-actu-id]`). A failing API leaves the static page intact.
- Posting sends `FormData`; photos are `Blob`s from `canvas.toBlob`, with
  object URLs for the thumbnails (revoked on removal).
- "Supprimer" buttons are rendered only while logged in and ask for
  confirmation.
- Rendering safety to keep: all server text goes through `textContent`, never
  `innerHTML`; images only into a `src` attribute; `.then(ok, err)` rather than
  `.catch` (legacy syntax checker).

## Local development

```bash
npx wrangler d1 migrations apply usmamvb-actus --local
node scripts/ajouter-membre.mjs test@usmamvb.fr --local
npx wrangler dev
```

`wrangler dev` uses a local D1 and KV under `.wrangler/` and reads
`SESSION_SECRET` from `.dev.vars` (git-ignored; any string works locally).

Preview deployments (non-`main` branches) share the production D1 and KV:
`previews` in `wrangler.jsonc` overrides nothing. Do not post test items from a
preview URL.

## Possible upgrades

- Photos to R2 instead of KV: enable R2 (needs a card on the account), add the
  bucket binding, swap `env.PHOTOS.put/get/delete` in `src/index.js`.
- Login by e-mailed one-time code through Cloudflare Access: protect `/api/*`
  write routes, drop `membres` and the login form.
- Move the six static seed cards into D1 so the board can edit them too.
