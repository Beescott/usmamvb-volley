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

/* Filtrage des équipes par format. Sans JavaScript la grille reste entière et
   les boutons n'apparaissent pas : le contenu est accessible dans tous les cas. */
(function () {
  'use strict';

  var filters = document.querySelectorAll('[data-filtre]');
  var grid = document.getElementById('equipes');

  if (!filters.length || !grid) {
    return;
  }

  var cards = grid.querySelectorAll('.team-card');
  var counter = document.querySelector('.teams-list__compte');

  function apply(category) {
    var shown = 0;

    Array.prototype.forEach.call(cards, function (card) {
      var match = category === 'toutes' || card.getAttribute('data-categorie') === category;
      card.hidden = !match;
      if (match) {
        shown++;
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
