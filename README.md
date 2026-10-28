# USMAMVB — club website

Showcase site for the USMAMVB volleyball club (Union Sportive Méry Auvers Mériel
de Volley-Ball), three gyms in the Val-d'Oise, FSGT leisure competition.

Static HTML, CSS and JavaScript, no build step, no dependency, no third-party
request on page load. Served by a Cloudflare Worker that also runs the news
API (D1 + KV). Live at <https://usmamvb.fr>.

## Run it locally

```bash
npx wrangler dev
```
Open <http://localhost:8787/>. The news API needs a one-time local setup, see
[docs/agents/news.md](docs/agents/news.md).

## Layout

```
index.html        home
adhesion.html     how to join, prices, documents, grants
gymnases.html     the three gyms: maps, access, schedules
equipes.html      the 20 teams, filterable by format
tournois.html     the club's two tournaments
regles.html       club rules and FSGT rulebooks
bureau.html       board, coaches, contacts
Actualite.html    news
assets/           css, js, img, fonts
src/index.js      Cloudflare Worker: news API, serves the static files
migrations/       D1 schema
scripts/          ajouter-membre.mjs: allow a board member to post news
docs/agents/      maintainer and agent documentation, one sheet per topic
```

## Contributing

Start with [AGENTS.md](AGENTS.md): it says which sheet to read for what you
want to change (content, pages, images, style, news, deployment). Work on a
branch, open a pull request into `main`. Site copy is French; docs and commits
are English.

Hosting, domain, DNS, e-mail, accounts: [docs/agents/deployment.md](docs/agents/deployment.md).
Letting a board member post news: [docs/agents/news.md](docs/agents/news.md), "Members".

## Credits

Font Archivo, SIL Open Font License 1.1 (`assets/fonts/OFL.txt`). Town emblems
belong to the communes of Auvers-sur-Oise, Méry-sur-Oise and Mériel. Grant
posters are the official Pass'Sport and labaz communication kits.
