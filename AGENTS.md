# USMAMVB website — agent guide

Showcase site for the USMAMVB volleyball club (Union Sportive Méry Auvers
Mériel de Volley-Ball, Val-d'Oise, France). Plain HTML, CSS and JS, no build
step, no dependency, served by a Cloudflare Worker that also hosts the news API
(`src/index.js`, D1, KV). Live at `https://usmamvb.fr`. Site copy is in French. These docs, commit messages and
pull requests are in English; code comments match the surrounding file.

## Reading rule

Read only the sheet for the topic you touch. Do not load the README or the
other sheets: they hold nothing more for your topic.

| You change… | Read |
| --- | --- |
| a text, a date, a price, a team, a board member, a gym, a tournament | `docs/agents/content.md` |
| the header, the footer, the menu, or you add a page | `docs/agents/pages.md` |
| an image, a photo, the logo, a town emblem | `docs/agents/images.md` |
| colors, font, CSS, responsive layout | `docs/agents/style.md` |
| the news page, the "Poster" form, the API, D1, KV | `docs/agents/news.md` |
| add or remove someone allowed to post news | `docs/agents/news.md` → Members |
| local preview, Cloudflare Worker, deploy, rollback, secrets | `docs/agents/deployment.md` |
| domain `usmamvb.fr`, DNS, OVH, the `contact@` mailbox, accounts, Git | `docs/agents/deployment.md` |

## Layout

```
index.html  adhesion.html  gymnases.html  equipes.html
tournois.html  regles.html  bureau.html  Actualite.html
assets/css/style.css   single stylesheet
assets/js/main.js      mobile menu, maps on click, team filters, team dialog, news module
assets/img/            logo, photos, emblems
assets/fonts/          self-hosted Archivo (OFL)
src/index.js           Worker: news API (/api/*), serves assets otherwise
migrations/            D1 schema (wrangler d1 migrations)
scripts/               ajouter-membre.mjs: add a board member allowed to post
docs/agents/           topic sheets (this guide)
.cmp/ .tmp/ .vs/       local tools and archives, not part of the site
```

## Rules that apply everywhere

- Header and footer are copied into all 8 pages: a change must be repeated in every file.
- Content lives in the HTML, not in JS: readable without script, indexable.
- No third-party request on page load: no CDN, no Google Fonts, no hard-coded iframe.
- Never invent: no date, score, name or headcount the club did not provide. Leave the fallback placeholder or "à confirmer".
- File names are lowercase, no space, no accent. Historical exception: `Actualite.html`.
- No secret in the repository or in these sheets.
- Before delivering: open the changed page in a browser, at phone and desktop widths.
- One branch per topic, pull request into `main`; merging `main` deploys to
  `usmamvb.fr` within a minute.
- The build does not run D1 migrations or set secrets: see `deployment.md`.
