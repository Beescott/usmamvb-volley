# USMAMVB — club website

Showcase site for the USMAMVB volleyball club (Union Sportive Méry Auvers Mériel
de Volley-Ball), three gyms in the Val-d'Oise, FSGT leisure competition.

Static HTML, CSS and JavaScript. No build step, no dependency, no third-party
request on page load.

## Run it locally

```bash
python3 -m http.server 8765
```
Open <http://127.0.0.1:8765/>.

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
docs/agents/      maintainer and agent documentation, one sheet per topic
```

## Contributing

Start with [AGENTS.md](AGENTS.md): it says which sheet to read for what you
want to change (content, pages, images, style, news, deployment). Work on a
branch, open a pull request into `main`. Site copy is French; docs and commits
are English.

Hosting and domain: see [docs/agents/deployment.md](docs/agents/deployment.md).

## Credits

Font Archivo, SIL Open Font License 1.1 (`assets/fonts/OFL.txt`). Town emblems
belong to the communes of Auvers-sur-Oise, Méry-sur-Oise and Mériel. Grant
posters are the official Pass'Sport and labaz communication kits.
