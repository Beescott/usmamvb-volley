# Volley Club des Coteaux — site vitrine

Site statique, sans build ni dépendance. Ouvrir `index.html` dans un navigateur suffit.

## Structure

```
index.html            page d'accueil
adhesion.html         comment rejoindre le club, tarifs, documents
gymnases.html         les trois salles : cartes, accès, créneaux
assets/css/style.css  feuille de style unique
assets/js/main.js     menu mobile
assets/img/           logo et photos (voir plus bas)
```

Header et footer sont recopiés à l'identique dans chaque page. On en est à trois :
voir « Duplication du header » plus bas.

## Où modifier quoi

Le contenu vit dans `index.html`, découpé par des commentaires de section.
Le contenu reste dans le HTML plutôt que dans un JS centralisé : un site vitrine
doit être lisible par les moteurs de recherche sans exécuter de JavaScript.

| À changer | Section dans `index.html` |
| --- | --- |
| Nom du club, baseline | `HEADER` → `.brand` (et `FOOTER` → `.footer__name`) |
| Liens du menu | `HEADER` → `.nav__list` |
| Accroche, photo de couverture | `HERO` |
| Les 4 cartes de raccourci | `ACCÈS RAPIDES` |
| Historique, chiffres clés | `LE CLUB` → `.club__intro` |
| Prochain tournoi, dernière actu | `LE CLUB` → `.club__aside` |
| Équipes | `NOS ÉQUIPES` → `.teams__grid` |
| Gymnases, adresses, créneaux | `OÙ L'ON JOUE` → `.venues__grid` |
| Email, téléphone, réseaux sociaux | `FOOTER` |

Couleurs, polices et largeurs sont regroupées en haut de `style.css`, dans `:root`.

## Photos à fournir

Aucune photo n'est versionnée : un dégradé de repli s'affiche tant que le fichier
est absent, donc la page reste présentable. Déposer les fichiers dans `assets/img/` :

| Fichier | Usage | Format conseillé |
| --- | --- | --- |
| `hero.jpg` | bandeau d'accueil | paysage, ≥ 1920×1080 |
| `equipe-1.jpg` … `equipe-4.jpg` | cartes équipes | 4:3, ≥ 800×600 |
| `gymnase-1.jpg` | gymnase Bozon, Auvers | 3:2, ≥ 1200×800 |
| `gymnase-2.jpg` | gymnase Municipal, Méry | 3:2, ≥ 1200×800 |
| `gymnase-3.jpg` | gymnase de Mériel | 3:2, ≥ 1200×800 |

`logo.png` est déjà en place : écusson USMAMVB détouré et recadré au carré
(729×729, fond transparent), affiché à 44 px dans le header et servant de favicon.
Source d'origine : `C:\Users\beesc\Documents\Logo - USMAMVB - Header.png`.

## Où modifier quoi — `adhesion.html`

| À changer | Section |
| --- | --- |
| Titre et chapô | `TITRE DE PAGE` |
| Les 4 étapes | `LES 4 ÉTAPES` |
| Grille tarifaire, réductions | `TARIFS` → `.pricing__list` et `.pricing__note` |
| QR code et lien HelloAsso | `TARIFS` → `.qr` |
| Pièces du dossier | `DOCUMENTS À FOURNIR` |

## QR code HelloAsso

L'emplacement du QR est un bloc de réservation, pas un code scannable : il faut
l'URL de la billetterie HelloAsso pour générer le vrai code. Une fois le PNG
disponible, le déposer en `assets/img/qr-helloasso.png` et remplacer le bloc
`.qr__frame` par :

```html
<img class="qr__frame" src="assets/img/qr-helloasso.png" alt="QR code vers la billetterie HelloAsso">
```

Renseigner au passage le `href` du bouton « Adhérer sur HelloAsso ».

## Où modifier quoi — `gymnases.html`

| À changer | Section |
| --- | --- |
| Titre et chapô | `TITRE DE PAGE` |
| Une salle (nom, adresse, accès, créneaux) | un bloc `<section class="venue-block">` |

L'alternance média à gauche / média à droite est automatique : elle vient du
sélecteur `.venue-block:nth-child(even)` dans le CSS, il n'y a aucune classe à
poser en ajoutant une salle. Sous 900 px tout repasse en colonne unique, média
en tête.

Le lieu apparaît à trois endroits dans chaque bloc : le texte affiché, l'`src` de
l'iframe et le `href` du lien d'itinéraire. Les deux URL prennent soit une adresse
encodée (`%20` pour les espaces, `%2C` pour les virgules), soit des coordonnées
`lat%2Clng`.

Bozon est repéré par son adresse, qui est complète et sans ambiguïté. Méry et Mériel
le sont par coordonnées : « Gymnase Municipal » et « gymnase Mériel » sont trop
génériques pour être géocodés de façon fiable, et le point relevé sur Maps pour
Mériel porte le libellé « Association Tennis de Mériel ». Les coordonnées visent
l'emplacement exact quoi qu'il arrive.

## Cartes Google Maps et RGPD

Les cartes sont des iframes `google.com/maps?...&output=embed`. Deux réserves :

- **Vie privée.** L'iframe dépose des cookies Google dès le chargement de la page,
  sans consentement. Pour un site d'association en France, c'est le point à
  regarder avant mise en ligne. Deux sorties : un chargement au clic (une vignette
  qui n'insère l'iframe qu'après action de l'utilisateur), ou OpenStreetMap qui ne
  trace pas.
- **URL non documentée.** `output=embed` fonctionne mais ne fait pas partie de
  l'API publique. La voie officielle est la Maps Embed API, qui demande une clé.

Le lien « Itinéraire sur Google Maps », lui, utilise l'URL officielle et ne pose
aucun problème : rien n'est chargé tant que personne ne clique.

## Duplication du header

Le header et le footer sont copiés dans chaque fichier HTML. Toute modification
doit donc être répercutée à la main dans chaque page. Trois sorties possibles le
jour où ça pique : un include côté serveur, un petit script de build qui assemble
les pages depuis un gabarit, ou un générateur statique.

## À faire

Pages restantes : Équipes, Tournois, Règles, Bureau, Actualités.
Leurs liens de navigation pointent encore sur `#`.

Données encore fictives, héritées de la maquette :

- `index.html` → `LE CLUB` : l'historique (« créé en 1978 par une poignée de profs
  d'EPS »), les 180 adhérents et les 6 équipes.
- `index.html` → `LE CLUB` : la carte « Coteaux Open 4x4 » et la dernière actu.
- Footer des trois pages : `contact@vcc-volley.fr` et le 06 12 34 56 78.
- `adhesion.html` : toute la grille tarifaire et le lien HelloAsso.
