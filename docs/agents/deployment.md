# Deployment, domain, accounts, Git

## Local preview

```bash
python3 -m http.server 8765
```
Then open `http://127.0.0.1:8765/index.html`. Opening the files directly also
works (no build), but maps and fonts behave more faithfully over HTTP.

Checks before a pull request:
```bash
node --check assets/js/main.js
```
Then open the changed pages at phone width (375 px) and desktop width.

## Hosting

| | Where | Status |
| --- | --- | --- |
| Current | GitHub Pages from `main`, `https://beescott.github.io/usmamvb-volley/` | live |
| Target | Cloudflare Pages connected to the GitHub repo, auto-deploy on push to `main` | to set up |
| Domain | `usmamvb.fr` registered at OVH, DNS delegated to Cloudflare | to buy |
| Email | `contact@usmamvb.fr` on OVH's free mailbox included with the domain | to set up |
| Back-end | Cloudflare Workers + D1 + R2 + Access, see `news.md` | planned |

Old domain `usmvb.asso.fr` (previous site): redirect it to the new site once
the club confirms it still controls it.

### DNS steps (once)
1. In the OVH customer area, replace the domain's name servers with the two
   Cloudflare gives when the zone is added.
2. In Cloudflare Pages, add the custom domain `usmamvb.fr` and `www.usmamvb.fr`.
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
- `.tmp/`, `.vs/` are ignored; `.cmp/` holds comparison scripts from a Windows
  setup and is not used by the site.
