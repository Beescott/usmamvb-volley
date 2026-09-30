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
   DÉPÔT D'UNE ACTUALITÉ (page Actualite.html)

   ⚠ LE LOGIN N'EST PAS UNE SÉCURITÉ. « usmamvb95 » est écrit en clair dans ce
   fichier, que le navigateur envoie à tout le monde : n'importe qui peut le
   lire dans les sources ou la console, poster sans passer par le formulaire, ou
   vider le localStorage. Ce mécanisme protège d'un clic accidentel, pas d'un
   visiteur déterminé. Une vraie modération exige un serveur qui valide et
   stocke — le site est statique, il n'y en a pas.

   CONSÉQUENCE : une actualité postée ici reste dans le localStorage du
   navigateur qui l'a écrite. Elle n'est visible que sur cet appareil et
   disparaît si ses données de site sont effacées. C'est une maquette de
   publication pour voir à quoi ressemble une carte, pas une base de données.
   ========================================================================== */
(function () {
  'use strict';

  var CODE = 'usmamvb95';
  var CLE = 'usmamvb.actus';
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
              'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  var formLogin = document.getElementById('redac-login');
  var formActu = document.getElementById('redac-form');
  var code = document.getElementById('redac-code');
  var erreurLogin = document.getElementById('redac-erreur');
  var erreurForm = document.getElementById('redac-erreur-form');
  var deconnexion = document.getElementById('redac-deconnexion');
  var champDate = document.getElementById('redac-date');
  var grille = document.querySelector('.actus__grid');

  /* Le script est chargé sur toutes les pages : sans les éléments de cette
     page, on sort sans rien faire, comme les autres modules. */
  if (!formLogin || !formActu || !grille) {
    return;
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

  /* ---------- Stockage ---------- */
  /* Tout passe par un try/catch : en navigation privée, ou quand le quota est
     atteint, localStorage lève une exception. Le site doit rester utilisable
     dans ce cas — l'actu est alors affichée mais non conservée. */
  function lire() {
    try {
      var brut = window.localStorage.getItem(CLE);
      var donnees = brut ? JSON.parse(brut) : [];
      return Array.isArray(donnees) ? donnees : [];
    } catch (e) {
      return [];
    }
  }

  function ecrire(actus) {
    try {
      window.localStorage.setItem(CLE, JSON.stringify(actus));
    } catch (e) {
      /* quota atteint ou stockage bloqué : l'actu reste affichée en page */
    }
  }

  /* ---------- Rendu ----------
     Le texte saisi passe par textContent, jamais par innerHTML : un titre
     contenant « <script> » doit s'afficher comme du texte, pas s'exécuter.
     C'est aussi ce qui rend l'injection impossible sur ce formulaire. */
  function creerCarte(actu, postee) {
    var li = document.createElement('li');
    var article = document.createElement('article');

    article.className = 'actu' + (postee ? ' actu--postee' : '');

    var media = document.createElement('span');
    media.className = 'actu__media';
    media.setAttribute('role', 'img');
    media.setAttribute('aria-label', 'Photo à venir');
    article.appendChild(media);

    var corps = document.createElement('div');
    corps.className = 'actu__body';

    if (postee) {
      var mention = document.createElement('p');
      mention.className = 'actu__postee';
      mention.textContent = 'Postée depuis ce navigateur';
      corps.appendChild(mention);
    }

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

    if (postee) {
      var pied = document.createElement('p');
      pied.className = 'actu__pied';

      var supprimer = document.createElement('button');
      supprimer.type = 'button';
      supprimer.className = 'actu__supprimer';
      supprimer.textContent = 'Supprimer';

      supprimer.addEventListener('click', function () {
        ecrire(lire().filter(function (autre) {
          return autre.id !== actu.id;
        }));

        var liASupprimer = article.parentNode;
        if (liASupprimer) {
          liASupprimer.remove();
        }
      });

      pied.appendChild(supprimer);
      corps.appendChild(pied);
    }

    article.appendChild(corps);
    li.appendChild(article);

    return li;
  }

  /* Redessine la grille : actus écrites d'abord, les plus récentes en tête car
     elles sont enregistrées en tête du tableau, puis le HTML figé. Le contenu
     statique du site n'est jamais modifié. */
  function afficher() {
    var premier = grille.firstElementChild;

    lire().forEach(function (actu) {
      grille.insertBefore(creerCarte(actu, true), premier);
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

  function ouvrir() {
    formLogin.hidden = true;
    formActu.hidden = false;
    document.getElementById('redac-categorie').focus();
  }

  function fermer() {
    formActu.hidden = true;
    formLogin.hidden = false;
    masquerErreur(erreurForm);
    formActu.reset();
    code.value = '';
    code.focus();
  }

  formLogin.addEventListener('submit', function (event) {
    event.preventDefault();

    if (code.value.trim() === CODE) {
      masquerErreur(erreurLogin);
      ouvrir();
      return;
    }

    montrerErreur(erreurLogin, 'Login incorrect.');
    code.select();
  });

  deconnexion.addEventListener('click', fermer);

  /* ---------- Poster ----------
     `novalidate` neutralise la validation native : le message d'erreur est
     alors dans la langue du site et annoncé par le role="alert". */
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

    var actus = lire();
    var nouvelle = {
      id: String(Date.now()),
      categorie: categorie,
      date: date,
      titre: titre,
      texte: texte
    };

    actus.unshift(nouvelle);
    ecrire(actus);

    /* Première carte de la grille : l'actualité vient d'être postée. */
    grille.insertBefore(creerCarte(nouvelle, true), grille.firstElementChild);

    formActu.reset();
    champDate.value = aujourdhui();
    champDate.focus();
  });

  /* ---------- Démarrage ---------- */
  champDate.value = aujourdhui();
  afficher();
})();
