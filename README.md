# Volley Club des Coteaux — site vitrine

Site statique, sans build ni dépendance. Ouvrir `index.html` dans un navigateur suffit.

## Structure

```
index.html            page d'accueil
adhesion.html         comment rejoindre le club, tarifs, documents
assets/css/style.css  feuille de style unique
assets/js/main.js     menu mobile
assets/img/           logo et photos (voir plus bas)
```

Header et footer sont recopiés à l'identique dans chaque page. À deux pages c'est
tenable ; au-delà de trois ou quatre, voir « Duplication du header » plus bas.

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

## Duplication du header

Le header et le footer sont copiés dans chaque fichier HTML. Toute modification
doit donc être répercutée à la main dans chaque page. Trois sorties possibles le
jour où ça pique : un include côté serveur, un petit script de build qui assemble
les pages depuis un gabarit, ou un générateur statique.

## À faire

Pages restantes : Gymnases, Équipes, Tournois, Règles, Bureau, Actualités.
Leurs liens de navigation pointent encore sur `#`.
