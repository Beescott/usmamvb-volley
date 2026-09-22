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
