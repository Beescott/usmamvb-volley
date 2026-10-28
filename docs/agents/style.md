# Style: tokens, the two golds, CSS layout

Single stylesheet `assets/css/style.css`, ~2200 lines. Order: font, tokens,
reset, primitives, header, hero, home sections, footer, then one block per page
(Adhésion, Gymnases, Équipes, Règles/Tournois, Bureau, Actualités), responsive
last. Each block starts with a `/* ===== NAME ===== */` banner.

## Tokens (`:root`, top of the file)

Palette sampled from the logo: black, white, gold.

| Token | Value | Use |
| --- | --- | --- |
| `--gold` | `#ebc974` | text and fills **on black** only (12.3:1) |
| `--gold-sweep` | gradient | button backgrounds, rules, text on black |
| `--gold-ink` | `#87681d` | text **on light backgrounds** (4.58:1 worst case) |
| `--gold-sweep-ink` | gradient | large text on light backgrounds only |
| `--cream` / `--cream-soft` | `#f2f0ec` / `#fbfaf8` | light section backgrounds |
| `--black` / `--black-deep` | `#121212` / `#0b0b0b` | dark sections |
| `--black-pure` | `#000000` | header only: the logo disc must blend in |
| `--wrap` | 1180px | content width |

Rule: the logo gold is unreadable on white (1.6:1). Never use `--gold` for text
on a light background; use `--gold-ink`. Lightening `--gold-ink` by one step
fails contrast on the cream band. Any palette change needs a contrast recheck
(WCAG 4.5:1 for body text, 3:1 for large text) on every page.

`.gold-text` paints gradient text and switches to the bright sweep inside
`.card--dark` and `.step`; it keeps a solid `color` fallback.

## Font

Archivo, variable 400-800, self-hosted in `assets/fonts/` (two `unicode-range`
subsets, ~35 KB for French text). Never load it from Google Fonts: that sends
visitor IPs to Google without consent. License file `assets/fonts/OFL.txt` must
stay.

## Hero

The photo is blurred and darkened on `.hero::before` (not on `.hero`, which
would blur the text), with a 48 px overflow to avoid a light rim, plus a
gradient veil on `.hero::after`. Measured contrast under the text: 7.6:1. Raising
blur, brightness or veil opacity lowers it; keep it above 4.5:1.

## Breakpoints

| Width | Effect |
| --- | --- |
| ≥ 961 px | desktop nav; below, burger drawer |
| < 900 px | gym blocks stack, media first |
| < 620 px | schedule table rows become cards |

Responsive rules sit at the end of the file; add new ones there.

## Recurring patterns

- Photo slots: modifier class + `--xxx-photo` custom property, see `images.md`.
- `[hidden]` must be re-asserted when the element has an author `display`
  (`.teams-group[hidden]`, `.team-card[hidden]`, the news form).
- Grid items that contain a wide table need `min-width: 0`, otherwise the
  track grows to the table and overflows the screen.
- Page header: `.page-head` on `--cream`, with `.eyebrow`, `.page-head__title`,
  `.page-head__lead`.
