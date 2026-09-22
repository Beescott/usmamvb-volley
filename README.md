# Volley Club des Coteaux — site vitrine

Site statique, sans build ni dépendance. Ouvrir `index.html` dans un navigateur suffit.

## Structure

```
index.html            page d'accueil
adhesion.html         comment rejoindre le club, tarifs, documents
gymnases.html         les trois salles : cartes, accès, créneaux
equipes.html          les 15 équipes, filtrables par format
assets/css/style.css  feuille de style unique
assets/js/main.js     menu mobile, chargement des cartes au clic
assets/img/           logo et photos (voir plus bas)
assets/fonts/         police Archivo auto-hebergee (voir RGPD)
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

## Charte : noir, blanc, or

La palette vient du logo. Les teintes sont un échantillonnage réel de
`assets/img/logo.png` — 418 283 pixels opaques, dont 53,8 % de noir pur
`#000000`, 22,6 % de blanc et 20,2 % d'or allant de `#ba903e` à `#fbf3ba`.

**L'or du logo ne peut pas servir de couleur de texte sur fond clair.** Il
plafonne à 1,60:1 sur blanc, là où il en faut 4,5. Il y a donc deux ors, et
confondre les deux casse la lisibilité :

| Token | Valeur | Usage |
| --- | --- | --- |
| `--gold` | `#ebc974` | texte et aplats **sur fond noir** (12,3:1) |
| `--gold-sweep` | dégradé | fonds de bouton, filets, texte sur noir |
| `--gold-ink` | `#87681d` | texte **sur fond clair** (4,58:1 au pire) |
| `--gold-sweep-ink` | dégradé | grand texte sur fond clair uniquement |

`--gold-ink` est la teinte la plus claire qui tienne 4,5:1 sur les trois fonds
clairs du site. L'éclaircir d'un cran fait échouer le bandeau crème.

Le header est en `--black-pure` (`#000000`) et non en `--black-deep` : le disque
du logo doit s'y fondre exactement, sinon il ressort en liseré.

Le texte en dégradé passe par la classe `.gold-text`, qui bascule
automatiquement sur le balayage vif quand elle est dans un `.card--dark` ou un
`.step`. Un `color` de repli est posé avant le `@supports`.

Toute modification de palette doit être revalidée : un audit de contraste
parcourt le DOM, compose les alphas et compare au seuil WCAG selon la taille de
police. Les trois pages en sortent sans échec.

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
| Pass'Sport et labaz | `AIDES À L'INSCRIPTION` |

## Aides à l'inscription — à revérifier chaque année

Les montants, les tranches d'âge et les dates de campagne changent d'une saison
à l'autre. Ceux affichés valent pour **2026-2027** et sont à confronter aux
sources officielles avant chaque rentrée :

| Dispositif | Affiché | Source |
| --- | --- | --- |
| Pass'Sport | 50 €, campagne 1er sept. → 31 déc. 2026, QF ≤ 699 € | <https://www.pass.sports.gouv.fr/> |
| labaz | 100 € pour une inscription sport ou culture, 15-17 ans | <https://www.iledefrance.fr/tous-les-services/labaz-lappli-pour-les-15-25-ans> |

### Visuels

Les deux cartes affichent les **affiches officielles** des kits de communication,
que le club est autorisé à utiliser :

| Fichier | Source | Poids |
| --- | --- | --- |
| `assets/img/aide-pass-sport.jpg` | kit partenaires pass Sport, visuel « club » 1920×1080 | 252 Ko |
| `assets/img/aide-labaz.jpg` | kit com labaz, visuel « Aide Sport et Culture » 1380×650 | 315 Ko |

Elles ne sont **pas recadrées** : leurs formats diffèrent (16:9 et 2,12:1), donc
les deux bandeaux n'ont pas exactement la même hauteur. Rogner une affiche
officielle serait pire que ce léger décalage.

Le montant n'est écrit qu'une fois : il figure déjà dans l'affiche, inutile de le
répéter en texte à côté — deux sources finiraient par diverger.

Les deux fichiers font 567 Ko à eux deux, chargés en `loading="lazy"`. Si le
poids devient gênant, les redimensionner à la largeur réelle d'affichage
(environ 640 px) suffirait à diviser le poids par trois.

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

## Tableaux des créneaux

Deux pièges se cachent dans ce tableau.

`.venue-block__body` est un élément de grille : son `min-width` vaut `auto` par
défaut, ce qui l’empêche de descendre sous la largeur min-content de son contenu.
Avec des cellules en `white-space: nowrap`, la piste de grille prend la largeur du
tableau et déborde de l’écran — l’`overflow-x: auto` de `.slots` n’y change rien
tant que le parent ne peut pas rétrécir. D’où le `min-width: 0` sur les deux
éléments de grille.

Sous 620 px, un tableau à quatre colonnes ne tient de toute façon pas sur un
téléphone : chaque ligne devient une fiche (jour, horaires, public, pastille).
Changer le `display` des éléments de tableau leur fait perdre leurs rôles
implicites, donc le HTML porte des `role="table"`, `role="row"` et `role="cell"`
explicites. Ne pas les retirer en ajoutant une salle.

Au-dessus de 620 px, le tableau tient pile dans sa colonne. La marge est faible :
une étiquette de niveau plus longue que « Débutant à intermédiaire » le fera
défiler horizontalement dans son cadre. Ce n’est pas cassé — `.slots` reste un
conteneur de défilement — mais c’est moins joli.

## Page équipes

Les 15 encarts sont **générés**, pas écrits à la main : le script
`gen-equipes.js` (hors dépôt, dans le scratchpad de la session) construit la
page à partir d'un tableau de catégories et recopie header et footer depuis
`gymnases.html`, ce qui garantit qu'ils restent identiques. Le fichier produit
est du HTML statique ordinaire : il se modifie directement, le script n'a pas à
être rejoué.

Répartition actuelle : 5 féminines 4×4, 5 mixtes 4×4, 3 mixtes 6×6, 2 équimixtes.

Le filtrage se fait en JavaScript sur l'attribut `data-categorie`. Sans JS, les
15 équipes restent toutes visibles — les boutons ne font simplement rien.
Attention à `.team-card[hidden] { display: none }` dans le CSS : sans cette
règle, le `display: flex` de la carte l'emporte sur le comportement par défaut
de `[hidden]` et le filtre ne masque rien.

**Données manquantes.** Chaque carte ne porte que ce qui est connu : le format,
le numéro et une description de catégorie. Il manque, par équipe, l'encadrement,
l'effectif, le championnat et le créneau — c'est ce que montrait la maquette.
Rien n'a été inventé, en particulier aucun nom d'entraîneur. Les photos sont des
emplacements : quatre dégradés en rotation, à remplacer par une photo par équipe
dans `assets/img/`.

## RGPD

Le site ne fait **aucune requête vers un tiers** au chargement d'une page. Vérifiable
dans l'onglet Réseau des outils de développement : tout vient du domaine du site.
Il n'y a donc ni bandeau cookies ni consentement préalable à gérer.

**Police.** Archivo est auto-hébergée dans `assets/fonts/`. La servir depuis Google
Fonts enverrait l'IP de chaque visiteur à Google sans consentement — c'est le motif
de la condamnation du tribunal de Munich en janvier 2022, et la position de la CNIL.
Un seul fichier variable couvre les graisses 400 à 800, en deux sous-ensembles
(latin, latin étendu) découpés par `unicode-range` : le navigateur ne télécharge que
ce dont il a besoin, soit 35 Ko pour du texte français. Licence SIL OFL 1.1,
recopiée dans `assets/fonts/OFL.txt` — sa présence est une obligation de la licence.

**Cartes.** Aucune `<iframe>` n'est écrite dans le HTML. Chaque emplacement porte
l'URL en `data-map-src` et affiche un bouton ; l'iframe n'est créée par
`assets/js/main.js` qu'au clic, après une phrase qui dit ce que le chargement
implique. Rien n'est mémorisé : pas de stockage de consentement, donc rien à
révoquer, et le choix est redemandé à chaque visite.

Pour ajouter une salle, reprendre ce gabarit — pas d'`<iframe>` en dur :

```html
<div class="venue-block__map"
     data-map-src="https://www.google.com/maps?q=LIEU&output=embed"
     data-map-title="Carte du ...">
  <button type="button" class="map-consent"> ... </button>
</div>
```

Le lien « Itinéraire sur Google Maps » ne pose pas de problème : c'est un lien
sortant, rien ne part tant que personne ne clique.

**Reste à traiter le jour où le site collectera des données** : mentions légales et
politique de confidentialité, obligatoires pour un site d'association. Aucun
formulaire pour l'instant, l'adhésion passe par HelloAsso qui gère son propre
consentement.

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
