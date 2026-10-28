# Deployment, domain, accounts, Git

## Local preview

```bash
npx wrangler dev
```
Then open `http://localhost:8787/`. This runs the same static-asset server as
production (`wrangler.jsonc`): extensionless URLs such as `/gymnases` resolve
to `gymnases.html`, and `.assetsignore` applies. A plain file server
(`python3 -m http.server`) does not resolve extensionless links, so internal
navigation 404s there.

Checks before a pull request:
```bash
node --check assets/js/main.js
```
Then open the changed pages at phone width (375 px) and desktop width.

## Hosting

| | Where | Status |
| --- | --- | --- |
| Current | Cloudflare Worker `usmamvb-volley` (static assets), built from `main` by Workers Builds, `https://usmamvb-volley.usmamvb.workers.dev/` | live |
| Previous | GitHub Pages from `main`, `https://beescott.github.io/usmamvb-volley/` | to disable once the domain is live |
| Domain | `usmamvb.fr` registered at OVH, DNS delegated to Cloudflare | bought, delegation to do |
| Email | `contact@usmamvb.fr` on OVH's free mailbox included with the domain | to set up |
| Back-end | same Worker + D1 `usmamvb-actus` + KV `PHOTOS` + secret `SESSION_SECRET`, see `news.md` | live |

The Cloudflare account is `usmamvb@gmail.com`. Worker config lives in
`wrangler.jsonc`; `.assetsignore` lists what the checkout contains but the
site must not serve (`.git`, docs, tools).

Workers Builds deploys `main` with `wrangler deploy` and other branches with
`wrangler preview`. D1 migrations are not run by the build: after adding a
file in `migrations/`, run `npx wrangler d1 migrations apply usmamvb-actus --remote`
before merging. Secrets: `npx wrangler secret put SESSION_SECRET`.

Old domain `usmvb.asso.fr` (previous site): redirect it to the new site once
the club confirms it still controls it.

### DNS steps (once)
1. In the OVH customer area, replace the domain's name servers with the two
   Cloudflare gives when the zone is added.
2. On the Worker, Settings → Domains & Routes, add `usmamvb.fr` and `www.usmamvb.fr`.
3. Keep the OVH MX records in the Cloudflare zone so the mailbox keeps working.
4. Propagation: 1 to 24 hours.

## Accounts: invite people, never share passwords

- GitHub: add collaborators on `Beescott/usmamvb-volley`. Long term, move the
  repo into a `usmamvb` GitHub organization owned by the club.
- Cloudflare: Members → invite by email with a role. Developers run
  `wrangler login` with their own invited account; no token is ever shared.
- OVH: each person has their own OVH account; the club's account names them
  technical contact on the domain.
- Owner accounts (OVH, Cloudflare, HelloAsso) are created with the club
  address, with 2FA, and stored in a shared password manager (Bitwarden). Never
  in the repo, in chat, in email or in a shared document.

An agent never needs a password: it works through the developer's own logged-in
CLI (`gh`, `wrangler`) on the developer's machine.

## Git workflow

- `main` is what is published. Never push to it directly.
- One branch per topic (`chore/…`, `content/…`, `feat/…`), pull request, merge.
- Commit messages in English, imperative, one topic per commit.
- `.tmp/`, `.vs/`, `.wrangler/`, `.dev.vars` are ignored; `.cmp/` holds comparison scripts
  from a Windows setup and is not used by the site.
