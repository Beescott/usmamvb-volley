# Pages: shared skeleton, header, footer, new page

## Page skeleton

```
<head>  charset, viewport, <title>Xxx — USMAMVB</title>, meta description, og:title,
        og:description, favicon assets/img/logo.png, assets/css/style.css
<body>
  a.skip-link → #contenu
  header.site-header#header      (identical copy in every page)
  div.nav-backdrop#navBackdrop
  main#contenu
    section.page-head            (p.eyebrow, h1.page-head__title, p.page-head__lead)
    … page sections …
  footer.site-footer             (identical copy in every page)
  script assets/js/main.js       (loaded by every page)
```

Every section is preceded by a `<!-- ===== NAME ===== -->` comment; `content.md`
refers to those names. One `h1` per page, `h2` per section or group, `h3` per card.

## Header and footer are duplicated

`<header class="site-header">` and `<footer class="site-footer">` are copied
into the 8 HTML files. To change them:

1. Edit `index.html`.
2. Paste the same block into the 7 other pages.
3. Check they are identical:

```bash
for f in *.html; do echo "== $f"; diff <(sed -n '/<header/,/<\/header>/p' index.html) <(sed -n '/<header/,/<\/header>/p' "$f"); done
```

Only tolerated difference: the current page's menu link carries
`class="nav__link is-active"` and `aria-current="page"`.

Internal links are extensionless: `href="gymnases"`, never `gymnases.html`,
and `href="./"` for the home page. The Workers asset server maps `/gymnases`
to `gymnases.html` and redirects `/gymnases.html` to `/gymnases` (307), so a
`.html` link costs a redirect on every click.

Menu lists: `ul.nav__list` in the header, `ul.footer__links` in the footer.
Adding a page means adding an entry to both lists, in all 8 files.

## Mobile menu

First block of `main.js`. `#burger` button (`aria-expanded`), `#nav` drawer,
`#navBackdrop`, scroll lock via `body.is-locked`. Desktop breakpoint: 961 px.
Closes on Escape, backdrop click, link click.

## Adding a page

1. Copy `regles.html` (the simplest one).
2. Change `<title>`, `meta description`, `og:*`, the `h1` and the lead.
3. Move `is-active` + `aria-current` to its menu entry.
4. Add the entry to `nav__list` and `footer__links` in all 8 pages.
5. Styles: new section in `style.css`, see `style.md`.

## Traps

- `[hidden]`: when the CSS sets a `display` on an element, add a
  `.class[hidden] { display: none; }` rule, otherwise `hidden` hides nothing.
- Google Maps are never `<iframe>` in the HTML: see the `data-map-src` template
  in `content.md` (Gyms).
- `main.js` is shared by every page: one syntax error breaks the whole site.
  Check with `node --check assets/js/main.js`.
