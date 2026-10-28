# Deployment, domain, e-mail, accounts, Git

## The whole picture

| Piece | Where | Who owns it |
| --- | --- | --- |
| Source | GitHub `Beescott/usmamvb-volley`, branch `main` is production | Alex (Beescott), to move to a club organization |
| Hosting | Cloudflare Worker `usmamvb-volley` with static assets, account `usmamvb@gmail.com` (id `cae7041c…`) | the club |
| News data | D1 `usmamvb-actus`, KV `PHOTOS`, secret `SESSION_SECRET`, same account | the club |
| Domain | `usmamvb.fr` registered at OVH, name servers delegated to Cloudflare | the club (OVH account) |
| DNS zone | Cloudflare zone `usmamvb.fr` (id `5ed892ff…`) | the club |
| E-mail | `contact@usmamvb.fr`, OVH mailbox included with the domain | the club |

A second Cloudflare account exists under `contact@usmvb.asso.fr`. It is empty
and unused; do not create anything there.

Everything is on free tiers: Workers (100k requests/day), D1 (5 GB), KV
(1 GB, 1000 writes/day), OVH mailbox. No card on the Cloudflare account, which
is why photos are in KV rather than R2 (see `news.md`).

## Local preview

```bash
npx wrangler dev
```
Then open `http://localhost:8787/`. This runs the same static-asset server as
production (`wrangler.jsonc`): extensionless URLs such as `/gymnases` resolve
to `gymnases.html`, `.assetsignore` applies, and `/api/*` hits the Worker with
a local D1 and KV under `.wrangler/`. A plain file server does not resolve
extensionless links, so internal navigation 404s there.

For the news API locally, once: apply the schema, enrol a test member, and
put any string in `.dev.vars` as `SESSION_SECRET=…` (file is git-ignored).
See `news.md`.

On Windows PowerShell, `npx` may be blocked by the script execution policy:
use `npx.cmd …` or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

Checks before a pull request:
```bash
node --check assets/js/main.js
npx wrangler deploy --dry-run
```
Then open the changed pages at phone width (375 px) and desktop width.

## Hosting: Cloudflare Worker, built from Git

The Worker is connected to the GitHub repo through Workers Builds (set up in
the dashboard, Worker → Settings → Build). On every push:

| Branch | Command run by the build | Result |
| --- | --- | --- |
| `main` | `npx wrangler deploy` | production: `usmamvb.fr`, `www.usmamvb.fr`, `usmamvb-volley.usmamvb.workers.dev` |
| any other | `npx wrangler preview` | a preview URL, shown on the pull request check |

Build status appears as the "Workers Builds: usmamvb-volley" check on the PR;
the log is in the dashboard link of that check (wrangler's OAuth token cannot
read build logs, so a failing build is read there by a person).

Everything the Worker needs is in the repo:

| File | Role |
| --- | --- |
| `wrangler.jsonc` | Worker name, `main`, assets directory, D1 and KV bindings, `previews: {}` (required by `wrangler preview`) |
| `.assetsignore` | what the checkout contains but the site must not serve: `.git`, docs, `src/`, `migrations/`, `scripts/`, tools |
| `src/index.js` | the Worker: `/api/*` routes, everything else from assets |
| `migrations/` | D1 schema, applied by hand (see below) |

Not in the repo, set once on the Worker: the secret `SESSION_SECRET`
(`npx wrangler secret put SESSION_SECRET`, any long random string).

### Things the build does not do

- **D1 migrations.** After adding a file in `migrations/`, run
  `npx wrangler d1 migrations apply usmamvb-actus --remote` before merging.
- **Secrets.** `npx wrangler secret put NAME`; list with `npx wrangler secret list`.
- **Rollback.** Dashboard → Worker → Deployments → roll back to a previous
  version, or `npx wrangler rollback`. Data in D1/KV is not rolled back.

### Manual deploy (if the Git build is down)

```bash
npx wrangler deploy
```
from `main`, logged in on the club account. Same result as the build.

## Domain and DNS

`usmamvb.fr` is registered at OVH. Its name servers point to Cloudflare
(`dion.ns.cloudflare.com`, `serena.ns.cloudflare.com`), so the zone is managed
in the Cloudflare dashboard, not in the OVH manager. The OVH zone still exists
but is ignored by the world; leave it alone.

What the Cloudflare zone contains and why:

| Record | Value | Proxy | Why |
| --- | --- | --- | --- |
| `usmamvb.fr`, `www` | Worker custom domain (placeholder `100::`) | proxied | added through the Worker's custom domains, not by hand |
| MX ×3 | `mx1/mx2/mx3.mail.ovh.net` (1/5/100) | DNS only | OVH mailbox |
| TXT | `v=spf1 include:mx.ovh.com ~all` | DNS only | mail authentication |
| CNAME `autoconfig`, `autodiscover` | `mailconfig.ovh.net` | **DNS only** | mail client auto-setup |
| CNAME `imap`, `mail`, `pop3`, `smtp` | `ssl0.ovh.net` | **DNS only** | mail hostnames; proxying them breaks IMAP/SMTP |
| SRV `_autodiscover`, `_imaps`, `_submission` | OVH values | DNS only | mail client auto-setup |
| TXT `1|www.usmamvb.fr`, `3|welcome` | OVH markers | DNS only | harmless leftovers |

The former OVH A/AAAA records (`51.91.236.255`, `2001:41d0:301::29`, OVH's
web hosting) were deleted: the Worker custom domain refuses to attach while an
A record exists on the name.

Zone settings done in the dashboard: SSL/TLS → Edge Certificates → **Always
Use HTTPS** on. Certificates for `usmamvb.fr` and `www` are issued and renewed
by Cloudflare automatically.

Adding a custom domain to the Worker (done, kept for reference):
`PUT /accounts/{account}/workers/domains` with `hostname`, `zone_id`,
`service: usmamvb-volley`, `environment: production`, or dashboard → Worker →
Settings → Domains & Routes.

### After a DNS change

Resolvers cache the old answers: up to the record TTL (1 h for the old OVH
records) and up to 48 h for resolvers that still hold the OVH delegation. A
machine that still reaches OVH shows an Apache "404 Not Found" page or, in a
browser that remembered HTTP/3, `ERR_QUIC_PROTOCOL_ERROR`. Nothing to fix:
check from another network, or test on the `workers.dev` URL, or temporarily
use `1.1.1.1` as the machine's DNS.

To verify the live site from the Cloudflare edge regardless of local DNS:
```bash
curl -s --resolve usmamvb.fr:443:188.114.97.2 -o /dev/null -w "%{http_code}\n" https://usmamvb.fr/
```

### Old domain

`usmvb.asso.fr` (previous site and previous club address): redirect it to the
new site once the club confirms it still controls it. The site footer still
shows `contact@usmvb.asso.fr`; switching it to `contact@usmamvb.fr` is a
content change (`content.md`), to do when the club is ready to read the new box.

## E-mail: `contact@usmamvb.fr`

An OVH mailbox included with the domain (MX Plan). Created in the OVH manager
(Web Cloud → Emails → `usmamvb.fr`). Webmail: <https://mail.ovh.net/>. Mail
clients: IMAP `ssl0.ovh.net:993`, SMTP `ssl0.ovh.net:465`, login = the full
address. The DNS records that make this work are listed above; the MX, SPF,
CNAME and SRV lines must stay "DNS only".

## Accounts: invite people, never share passwords

- GitHub: add collaborators on `Beescott/usmamvb-volley`. Long term, move the
  repo into a `usmamvb` GitHub organization owned by the club.
- Cloudflare: dashboard → Manage Account → Members → invite by e-mail with a
  role. Developers run `wrangler login` with their own invited account; no
  token is ever shared.
- OVH: each person has their own OVH account; the club's account names them
  technical contact on the domain.
- Owner accounts (OVH, Cloudflare `usmamvb@gmail.com`, HelloAsso) belong to
  the club, with 2FA, stored in a shared password manager (Bitwarden). Never
  in the repo, in chat, in e-mail or in a shared document.
- People allowed to **post news** are not accounts at all: see "Members" in
  `news.md`.

An agent never needs a password: it works through the developer's own
logged-in CLI (`gh`, `wrangler`) on the developer's machine.

### What `wrangler login` can and cannot do

The OAuth token from `wrangler login` covers Workers, D1, KV, secrets,
Worker custom domains and `zone:read`. It cannot create a zone, read or edit
DNS records or zone settings, read Workers Builds logs, or enable R2. Those are
dashboard steps for a person with access to the club account.

## Git workflow

- `main` is what is published. Never push to it directly.
- One branch per topic (`chore/…`, `content/…`, `feat/…`, `fix/…`), pull
  request, merge once the Workers Builds check is green.
- Commit messages in English, imperative, one topic per commit.
- Personal GitHub account `Beescott` for this repo (`gh auth switch --user Beescott`).
- `.tmp/`, `.vs/`, `.wrangler/`, `.dev.vars` are ignored; `.cmp/` holds
  comparison scripts from a Windows setup and is not used by the site.
- Previous hosting (GitHub Pages at `beescott.github.io/usmamvb-volley`) is
  unpublished; do not re-enable it.
