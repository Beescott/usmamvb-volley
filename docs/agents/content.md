# Content: where to change what

Content is in the HTML, located by `<!-- ===== NAME ===== -->` section comments.
Edit the text in place; never invent.

## Club facts (source: the club's PDF "SITE WEB - USMAMVB" and the board)

| Topic | Value |
| --- | --- |
| Name | USMAMVB — Union Sportive Méry Auvers Mériel de Volley-Ball |
| Federation | FSGT, leisure competition (not FFVB) |
| Teams | 20: 6 women 4×4, 6 mixed 4×4, 4 mixed 6×6, 2 teens 6×6, 2 youth 4×4 |
| Gymnase Bozon | rue des Ponceaux, Auvers-sur-Oise — Mon 20:30, Wed 20:00, Fri 20:30 |
| Gymnase Municipal | rue Courtil Bajou, Méry-sur-Oise — Tue, Thu, Sat 12:45-14:30 (ages 10-14) |
| Espace Rives Gauche | rue des Petits Près, Mériel — Wed (teens) |
| Contact | contact@usmvb.asso.fr · 06 67 21 61 48 (Béatrice Goulain, president). The new box `contact@usmamvb.fr` exists at OVH (see `deployment.md`); switch the footer `mailto:` in all 8 pages when the club says so |
| Membership | HelloAsso: `helloasso.com/associations/usmamvb/adhesions/adhesions-2025-2026` |
| Tournaments | Tournoi des Amazones (women 4×4, since March 2023), Summer Mery'Mixte |

Unknown, do not invent: founding year, member count, headcount per team,
coach names per team, real dates of the news items.

## Per page

### `index.html`
| To change | Section |
| --- | --- |
| Tagline, cover photo | `HERO` |
| 4 shortcut cards | `ACCÈS RAPIDES` |
| Club intro, key figures (`dl.stats`) | `LE CLUB` → `.club__intro` |
| Next highlight, latest news | `LE CLUB` → `.club__aside` |
| Teams preview | `NOS ÉQUIPES` → `.teams__grid` |
| Gyms preview | `OÙ L'ON JOUE` → `.venues__grid` |
| Email, phone, socials, season in © | `FOOTER` (all 8 pages, see `pages.md`) |

Facebook and Instagram links in the footer still point to `#`.

### `adhesion.html`
| To change | Section |
| --- | --- |
| The 4 steps | `LES 4 ÉTAPES` |
| Price list, discounts | `TARIFS` → `.pricing__list`, `.pricing__note` |
| HelloAsso link (button and URL) | `TARIFS` → `.qr` |
| Required documents | `DOCUMENTS À FOURNIR` |
| Pass'Sport and labaz | `AIDES À L'INSCRIPTION` |

QR code: `assets/img/qr-helloasso.png`, shown by `<img class="qr__frame">`. To
replace it (new HelloAsso campaign), overwrite the PNG: square, 200×200 or
larger, white quiet zone included. Update the two HelloAsso URLs next to it.

Grants: amounts and dates are for 2026-2027. Amounts appear only inside the
official posters, never as text next to them. Recheck every season:
<https://www.pass.sports.gouv.fr/> and
<https://www.iledefrance.fr/tous-les-services/labaz-lappli-pour-les-15-25-ans>.

### `gymnases.html`
One `<section class="venue-block">` per gym. Left/right alternation is automatic
(`:nth-child(even)`), no class to add.

The location appears 3 times per block: the text, `data-map-src`, and the
"Itinéraire" link `href`. Bozon is located by address, Méry and Mériel by
`lat%2Clng` coordinates (names too generic to geocode).

Map: never a hard-coded `<iframe>`. Template:
```html
<div class="venue-block__map" data-map-src="https://www.google.com/maps?q=PLACE&output=embed" data-map-title="Carte du …">
  <button type="button" class="map-consent">…</button>
</div>
```
Schedule table: keep `role="table" / "row" / "cell"` (below 620 px each row
becomes a card). A level label longer than "Débutant à intermédiaire" makes the
table scroll horizontally.

### `equipes.html`
One `<section class="teams-group" data-categorie="…">` per format:
`feminines-4x4`, `mixte-4x4`, `mixte-6x6`, `ados`, `jeunes`. The `[data-filtre]`
buttons hide whole sections. The counter is `#compte-equipes`.

Each `article.team-card` holds a `div.team-card__detail hidden`: that is the
content shown in `<dialog id="fiche-equipe">` on click. Adding a team = copy a
whole card, detail included. Schedules in the details come from the
`gymnases.html` planning per category, not per team.

### `tournois.html`, `regles.html`
One `article.tournoi` / `article.reglement` per entry. The two FSGT rulebooks
are external links the federation updates each season. The club's internal
rules have no link yet: `.reglement__attente` points to the secretary. When the
PDF exists, put it in `assets/` and replace that paragraph with a link.

### `bureau.html`
One `<section class="bureau__groupe">` per group (board, mixed adult coaches,
youth coaches, women adult coaches). Each member: `article` with
`span.membre__photo.membre__photo--<name>` (photo set in CSS, see `images.md`),
`h3.membre__nom`, `p.membre__role`.

### `Actualite.html`
See `news.md`.

## Every new season

- Season in the footer (`© 2026 USMAMVB · Saison 2026 – 2027`), all 8 pages.
- HelloAsso URL for the season (adhesion.html, 2 places).
- Pass'Sport and labaz amounts and posters.
- FSGT rulebook links.
- Schedules and registered teams.
