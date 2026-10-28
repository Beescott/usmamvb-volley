/* Menu mobile : tiroir latéral, verrou de scroll, fermeture clavier/clic extérieur. */
(function () {
  'use strict';

  var DESKTOP_QUERY = window.matchMedia('(min-width: 961px)');

  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var backdrop = document.getElementById('navBackdrop');

  if (!burger || !nav || !backdrop) {
    return;
  }

  function isOpen() {
    return burger.getAttribute('aria-expanded') === 'true';
  }

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    nav.classList.toggle('is-open', open);
    backdrop.hidden = !open;
    document.body.classList.toggle('is-locked', open);
  }

  function closeMenu() {
    if (isOpen()) {
      setMenu(false);
      burger.focus();
    }
  }

  burger.addEventListener('click', function () {
    setMenu(!isOpen());
  });

  backdrop.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) {
      setMenu(false);
    }
  });

  DESKTOP_QUERY.addEventListener('change', function (event) {
    if (event.matches) {
      setMenu(false);
    }
  });
})();

/* Cartes Google Maps chargées à la demande. L'iframe n'existe pas dans le HTML :
   aucune requête ne part vers Google tant que le visiteur n'a pas cliqué. */
(function () {
  'use strict';

  function loadMap(container) {
    var frame = document.createElement('iframe');

    frame.src = container.getAttribute('data-map-src');
    frame.title = container.getAttribute('data-map-title');
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';

    container.replaceChildren(frame);
    frame.focus();
  }

  var containers = document.querySelectorAll('[data-map-src]');

  Array.prototype.forEach.call(containers, function (container) {
    var trigger = container.querySelector('.map-consent');

    if (!trigger) {
      return;
    }

    trigger.addEventListener('click', function () {
      loadMap(container);
    });
  });
})();

/* Filtrage des équipes par format. Les sections sont masquées en bloc, pas les
   cartes une a une : « Toutes » laisse donc apparaître les intertitres de
   catégorie. Sans JavaScript tout reste visible, les boutons ne font rien. */
(function () {
  'use strict';

  var filters = document.querySelectorAll('[data-filtre]');
  var groups = document.querySelectorAll('.teams-group');

  if (!filters.length || !groups.length) {
    return;
  }

  var counter = document.getElementById('compte-equipes');

  function teamsIn(group) {
    return group.querySelectorAll('.team-card').length;
  }

  function apply(category) {
    var shown = 0;

    Array.prototype.forEach.call(groups, function (group) {
      var match = category === 'toutes' || group.getAttribute('data-categorie') === category;
      group.hidden = !match;
      if (match) {
        shown += teamsIn(group);
      }
    });

    if (counter) {
      counter.textContent = shown + (shown > 1 ? ' équipes' : ' équipe');
    }
  }

  Array.prototype.forEach.call(filters, function (filter) {
    filter.addEventListener('click', function () {
      Array.prototype.forEach.call(filters, function (other) {
        var active = other === filter;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-pressed', String(active));
      });

      apply(filter.getAttribute('data-filtre'));
    });
  });
})();

/* Fiche équipe. Le contenu vit dans le HTML de chaque carte : le clic ne fait
   que le recopier dans la boîte. <dialog>.showModal() apporte le piège du focus,
   la fermeture par Échap et le retour du focus sur le déclencheur. */
(function () {
  'use strict';

  var dialog = document.getElementById('fiche-equipe');

  if (!dialog || typeof dialog.showModal !== 'function') {
    return;
  }

  var photo = document.getElementById('fiche-photo');
  var category = document.getElementById('fiche-categorie');
  var title = document.getElementById('fiche-titre');
  var body = document.getElementById('fiche-contenu');
  var closeButton = document.getElementById('fiche-fermer');
  var lastTrigger = null;

  function open(card) {
    var detail = card.querySelector('.team-card__detail');

    if (!detail) {
      return;
    }

    photo.className = 'fiche__photo ' + detail.getAttribute('data-photo');
    photo.setAttribute('aria-label', "Photo à venir de l'équipe " + detail.getAttribute('data-categorie-label') + ' ' + detail.getAttribute('data-titre'));
    category.textContent = detail.getAttribute('data-categorie-label');
    title.textContent = detail.getAttribute('data-titre');
    body.innerHTML = detail.innerHTML;

    lastTrigger = card.querySelector('.team-card__trigger');
    dialog.showModal();
  }

  /* Échap et retour du focus sont gérés ici plutôt que laissés au navigateur :
     tous les moteurs n'emettent pas l'evenement cancel de <dialog>. */
  function close() {
    dialog.close();

    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('.team-card__trigger');

    if (trigger) {
      open(trigger.closest('.team-card'));
    }
  });

  closeButton.addEventListener('click', close);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && dialog.open) {
      event.preventDefault();
      close();
    }
  });

  /* Clic sur le fond : la boîte occupe toute la zone cliquable, on compare donc
     la position du pointeur à ses bords plutôt que la cible de l'événement. */
  dialog.addEventListener('click', function (event) {
    var box = dialog.getBoundingClientRect();
    var dehors = event.clientX < box.left || event.clientX > box.right ||
                 event.clientY < box.top || event.clientY > box.bottom;

    if (dehors) {
      close();
    }
  });
})();

/* ============================================================================
   ACTUALITÉS (page Actualite.html)

   Les actus postées par le bureau vivent sur le serveur : src/index.js expose
   une API (/api/actus, /api/photos, /api/login…) adossée à D1 et KV. Ce
   module lit la liste au chargement, l'affiche devant les cartes écrites en
   dur, et fait parler le panneau « Poster » avec l'API. La session est un
   cookie HttpOnly posé par le serveur : aucun secret ne vit dans ce fichier.
   ========================================================================== */
(function () {
  'use strict';

  var API = '/api';
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
              'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  var formLogin = document.getElementById('redac-login');
  var formActu = document.getElementById('redac-form');
  var champEmail = document.getElementById('redac-email');
  var champCode = document.getElementById('redac-code');
  var erreurLogin = document.getElementById('redac-erreur');
  var erreurForm = document.getElementById('redac-erreur-form');
  var deconnexion = document.getElementById('redac-deconnexion');
  var champDate = document.getElementById('redac-date');
  var champPhotos = document.getElementById('redac-photos');
  var listeVignettes = document.getElementById('redac-vignettes');
  var grille = document.querySelector('.actus__grid');

  /* Le script est chargé sur toutes les pages : sans les éléments de cette
     page, on sort sans rien faire, comme les autres modules. */
  if (!formLogin || !formActu || !grille) {
    return;
  }

  var connecte = false;

  /* ---------- Photos ----------
     Elles sont réduites dans le navigateur avant l'envoi : un JPEG de 4 Mo
     d'appareil photo tombe autour de 150 Ko à 1200 px de large, ce qui tient
     dans la limite de 2 Mo de l'API et charge vite chez les visiteurs. */
  var PHOTOS_MAX = 3;
  var PHOTO_POIDS_MAX = 25 * 1024 * 1024;
  var PHOTO_LARGEUR_MAX = 1200;
  var QUALITE = 0.72;

  /* Photos retenues, dans l'ordre de sélection : { blob, url }. `url` est un
     object-URL pour la vignette, révoqué quand la photo est retirée. */
  var photosChoisies = [];

  function reduire(fichier) {
    return new Promise(function (resolve, reject) {
      var lecteur = new FileReader();

      lecteur.onload = function () {
        var image = new Image();

        image.onload = function () {
          var ratio = Math.min(1, PHOTO_LARGEUR_MAX / image.width);
          var toile = document.createElement('canvas');

          toile.width = Math.round(image.width * ratio);
          toile.height = Math.round(image.height * ratio);
          toile.getContext('2d').drawImage(image, 0, 0, toile.width, toile.height);

          toile.toBlob(function (blob) {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('conversion impossible'));
            }
          }, 'image/jpeg', QUALITE);
        };

        image.onerror = function () {
          reject(new Error('image illisible'));
        };

        image.src = lecteur.result;
      };

      lecteur.onerror = function () {
        reject(new Error('lecture impossible'));
      };

      lecteur.readAsDataURL(fichier);
    });
  }

  function retirerPhoto(index) {
    URL.revokeObjectURL(photosChoisies[index].url);
    photosChoisies.splice(index, 1);
    afficherVignettes();
  }

  function viderPhotos() {
    while (photosChoisies.length) {
      retirerPhoto(photosChoisies.length - 1);
    }
  }

  function afficherVignettes() {
    if (!listeVignettes) {
      return;
    }

    listeVignettes.replaceChildren();
    listeVignettes.hidden = photosChoisies.length === 0;

    photosChoisies.forEach(function (photo, index) {
      var li = document.createElement('li');
      li.className = 'redac__vignette';

      var img = document.createElement('img');
      img.src = photo.url;
      img.alt = 'Photo jointe ' + (index + 1);
      li.appendChild(img);

      var retirer = document.createElement('button');
      retirer.type = 'button';
      retirer.className = 'redac__retirer';
      retirer.textContent = '×';
      retirer.setAttribute('aria-label', 'Retirer la photo ' + (index + 1));

      retirer.addEventListener('click', function () {
        retirerPhoto(index);
      });

      li.appendChild(retirer);
      listeVignettes.appendChild(li);
    });
  }

  if (champPhotos) {
    champPhotos.addEventListener('change', function () {
      var fichiers = Array.prototype.slice.call(champPhotos.files || []);

      if (!fichiers.length) {
        return;
      }

      masquerErreur(erreurForm);

      fichiers.forEach(function (fichier) {
        if (photosChoisies.length >= PHOTOS_MAX) {
          montrerErreur(erreurForm, PHOTOS_MAX + ' photos au maximum.');
          return;
        }

        if (fichier.size > PHOTO_POIDS_MAX) {
          montrerErreur(erreurForm, '« ' + fichier.name + ' » dépasse 25 Mo.');
          return;
        }

        /* Forme à deux arguments de `then` plutôt que `.then(…).catch(…)` :
           `catch` est un mot réservé que certains analyseurs anciens refusent
           après un point ; cette forme passe partout. */
        reduire(fichier).then(function (blob) {
          photosChoisies.push({ blob: blob, url: URL.createObjectURL(blob) });
          afficherVignettes();
        }, function () {
          montrerErreur(erreurForm, 'Impossible de lire « ' + fichier.name + ' ».');
        });
      });

      /* Le champ est vidé pour permettre de re-sélectionner le même fichier
         juste après : sans cela, `change` ne se déclencherait plus. */
      champPhotos.value = '';
    });
  }

  /* ---------- Date ---------- */
  /* Le champ donne « 2026-09-01 ». On affiche « Septembre 2026 », comme les
     dates écrites en dur dans le HTML. */
  function libellerDate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      return '';
    }
    var annee = iso.slice(0, 4);
    var libelle = MOIS[parseInt(iso.slice(5, 7), 10) - 1];

    return libelle ? libelle.charAt(0).toUpperCase() + libelle.slice(1) + ' ' + annee : annee;
  }

  function aujourdhui() {
    var d = new Date();
    return d.getFullYear() + '-' +
      ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
      ('0' + d.getDate()).slice(-2);
  }

  /* ---------- API ----------
     Une seule fonction d'appel : la promesse est résolue avec le JSON de la
     réponse, ou rejetée avec une Error dont le message vient du serveur et
     peut être affiché tel quel. */
  function appeler(methode, chemin, corps) {
    var options = { method: methode, credentials: 'same-origin', headers: {} };

    if (corps instanceof FormData) {
      options.body = corps;
    } else if (corps) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(corps);
    }

    return fetch(API + chemin, options).then(function (reponse) {
      if (reponse.status === 204) {
        return null;
      }

      return reponse.json().then(function (donnees) {
        if (!reponse.ok) {
          throw new Error((donnees && donnees.erreur) || ('Erreur ' + reponse.status));
        }
        return donnees;
      }, function () {
        throw new Error('Réponse illisible du serveur (' + reponse.status + ').');
      });
    }, function () {
      throw new Error('Serveur injoignable. Vérifiez la connexion et réessayez.');
    });
  }

  /* ---------- Rendu ----------
     Le texte reçu passe par textContent, jamais par innerHTML : un titre
     contenant « <script> » doit s'afficher comme du texte, pas s'exécuter.
     Les photos sont des URL de l'API, écrites dans un attribut `src`. */
  function creerCarte(actu) {
    var li = document.createElement('li');
    li.setAttribute('data-actu-id', actu.id);

    var article = document.createElement('article');
    article.className = 'actu';

    var media = document.createElement('span');
    media.className = 'actu__media';

    if (actu.photos && actu.photos.length) {
      var image = document.createElement('img');
      image.className = 'actu__photo';
      image.src = actu.photos[0];
      image.alt = 'Photo de l\'actualité : ' + actu.titre;
      image.loading = 'lazy';
      media.appendChild(image);
    } else {
      media.setAttribute('role', 'img');
      media.setAttribute('aria-label', 'Photo à venir');
    }

    article.appendChild(media);

    var corps = document.createElement('div');
    corps.className = 'actu__body';

    var meta = document.createElement('p');
    meta.className = 'actu__meta';

    var categorie = document.createElement('span');
    categorie.className = 'actu__categorie';
    categorie.textContent = actu.categorie;
    meta.appendChild(categorie);

    var date = document.createElement('time');
    date.setAttribute('datetime', actu.date);
    date.textContent = libellerDate(actu.date);
    meta.appendChild(date);

    corps.appendChild(meta);

    var titre = document.createElement('h3');
    titre.className = 'actu__titre';
    titre.textContent = actu.titre;
    corps.appendChild(titre);

    var texte = document.createElement('p');
    texte.className = 'actu__texte';
    texte.textContent = actu.texte;
    corps.appendChild(texte);

    /* Les photos 2 et 3, celles qui n'ont pas tenu lieu de visuel de carte,
       sont rappelées en bandeau sous le paragraphe. */
    if (actu.photos && actu.photos.length > 1) {
      corps.appendChild(creerGalerie(actu));
    }

    if (connecte) {
      corps.appendChild(creerPiedSuppression(actu, li));
    }

    article.appendChild(corps);
    li.appendChild(article);

    return li;
  }

  function creerGalerie(actu) {
    var autres = document.createElement('ul');
    autres.className = 'actu__galerie';

    actu.photos.slice(1).forEach(function (photo, index) {
      var liPhoto = document.createElement('li');

      var vignette = document.createElement('img');
      vignette.src = photo;
      vignette.alt = 'Photo ' + (index + 2) + ' de l\'actualité : ' + actu.titre;
      vignette.loading = 'lazy';
      liPhoto.appendChild(vignette);

      autres.appendChild(liPhoto);
    });

    return autres;
  }

  function creerPiedSuppression(actu, li) {
    var pied = document.createElement('p');
    pied.className = 'actu__pied';

    var supprimer = document.createElement('button');
    supprimer.type = 'button';
    supprimer.className = 'actu__supprimer';
    supprimer.textContent = 'Supprimer';

    supprimer.addEventListener('click', function () {
      if (!window.confirm('Supprimer « ' + actu.titre + ' » ?')) {
        return;
      }

      supprimer.disabled = true;

      appeler('DELETE', '/actus/' + actu.id).then(function () {
        li.remove();
      }, function (erreur) {
        supprimer.disabled = false;
        montrerErreur(erreurForm, erreur.message);
      });
    });

    pied.appendChild(supprimer);

    return pied;
  }

  /* Redessine les actus du serveur devant les cartes écrites en dur, les plus
     récentes en tête. Les cartes du HTML ne sont jamais touchées. */
  function afficher() {
    appeler('GET', '/actus').then(function (actus) {
      grille.querySelectorAll('[data-actu-id]').forEach(function (ancienne) {
        ancienne.remove();
      });

      var premier = grille.firstElementChild;

      actus.forEach(function (actu) {
        grille.insertBefore(creerCarte(actu), premier);
      });
    }, function () {
      /* Liste indisponible : la page reste lisible avec ses cartes statiques. */
    });
  }

  /* ---------- Messages ---------- */
  function montrerErreur(noeud, message) {
    if (noeud) {
      noeud.textContent = message;
      noeud.hidden = false;
    }
  }

  function masquerErreur(noeud) {
    if (noeud) {
      noeud.hidden = true;
    }
  }

  /* ---------- Session ---------- */
  function ouvrir() {
    connecte = true;
    formLogin.hidden = true;
    formActu.hidden = false;
    champCode.value = '';
    afficher();
  }

  function fermer() {
    connecte = false;
    formActu.hidden = true;
    formLogin.hidden = false;
    masquerErreur(erreurForm);
    formActu.reset();
    champDate.value = aujourdhui();
    viderPhotos();
    afficher();
  }

  formLogin.addEventListener('submit', function (event) {
    event.preventDefault();
    masquerErreur(erreurLogin);

    var email = champEmail.value.trim();
    var code = champCode.value;

    if (!email || !code) {
      montrerErreur(erreurLogin, 'E-mail et code requis.');
      return;
    }

    appeler('POST', '/login', { email: email, code: code }).then(function () {
      ouvrir();
      document.getElementById('redac-categorie').focus();
    }, function (erreur) {
      montrerErreur(erreurLogin, erreur.message);
      champCode.select();
    });
  });

  deconnexion.addEventListener('click', function () {
    appeler('POST', '/logout').then(fermer, fermer);
  });

  /* ---------- Poster ----------
     `novalidate` neutralise la validation native : le message d'erreur est
     alors dans la langue du site et annoncé par le role="alert". Le serveur
     refait les mêmes contrôles, ceux-ci n'évitent qu'un aller-retour. */
  formActu.addEventListener('submit', function (event) {
    event.preventDefault();
    masquerErreur(erreurForm);

    var categorie = document.getElementById('redac-categorie').value.trim();
    var date = champDate.value;
    var titre = document.getElementById('redac-titre-actus').value.trim();
    var texte = document.getElementById('redac-texte').value.trim();

    if (!categorie || !date || !titre || !texte) {
      montrerErreur(erreurForm, 'Merci de remplir les quatre champs.');
      return;
    }

    if (texte.length > 1200) {
      montrerErreur(erreurForm, 'Le paragraphe est trop long (1200 caractères maximum).');
      return;
    }

    var donnees = new FormData();
    donnees.append('categorie', categorie);
    donnees.append('date', date);
    donnees.append('titre', titre);
    donnees.append('texte', texte);
    photosChoisies.forEach(function (photo, index) {
      donnees.append('photos', photo.blob, 'photo-' + (index + 1) + '.jpg');
    });

    var bouton = formActu.querySelector('button[type="submit"]');
    bouton.disabled = true;

    appeler('POST', '/actus', donnees).then(function (actu) {
      bouton.disabled = false;
      grille.insertBefore(creerCarte(actu), grille.firstElementChild);

      formActu.reset();
      champDate.value = aujourdhui();
      viderPhotos();
      champDate.focus();
    }, function (erreur) {
      bouton.disabled = false;
      montrerErreur(erreurForm, erreur.message);
    });
  });

  /* ---------- Démarrage ----------
     /api/me dit si le cookie de session est encore valide : le panneau
     s'ouvre alors directement, sans redemander le code. */
  champDate.value = aujourdhui();

  appeler('GET', '/me').then(ouvrir, afficher);
})();
