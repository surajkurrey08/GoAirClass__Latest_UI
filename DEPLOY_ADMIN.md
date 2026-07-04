# Deployment — goairclass.com, goairclass.in, admin.goairclass.com

The full stack (backend + `frontend/` + `admin-frontend/`) deploys automatically
on every push to `main`. VPS access is **not required** for normal operation —
the workflow regenerates the VPS `.env` from GitHub Secrets and auto-issues the
SSL certificate for `admin.goairclass.com` if it's missing.

| App | Domain(s) | Login roles |
|---|---|---|
| `frontend/` | goairclass.com, goairclass.in | user, bus_operator |
| `admin-frontend/` | admin.goairclass.com | admin, superadmin |

`goairclass.in` and `www.*` redirect to the canonical `goairclass.com`.

---

## ⚠️ One-time setup (do this once, before the next push)

### 1. DNS record for the admin subdomain

At your DNS provider, add an A record pointing to the **same VPS IP** already
used for `goairclass.com`:

```
Type: A
Name: admin
Value: <VPS IP>
TTL: 300
```

Verify: `nslookup admin.goairclass.com` should resolve to the VPS IP before
you push — the deploy workflow issues the SSL cert automatically, but only if
DNS already points there.

### 2. Add these GitHub Secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**.
These are used both to reach the VPS and to (re)generate its `.env` file on
every deploy — add a secret here once, and it's live on the next push with no
VPS login required.

**Already required (deployment likely has these already):**
| Secret | Purpose |
|---|---|
| `VPS_HOST` | VPS IP/hostname |
| `VPS_USER` | SSH username |
| `VPS_SSH_KEY` | SSH private key |
| `VPS_PORT` | SSH port (optional, defaults to 22) |

**New — app config, written into the VPS `.env` on every deploy:**
| Secret | Value (copy from your current `backend/.env`) |
|---|---|
| `MONGO_ROOT_USER` | Mongo root user |
| `MONGO_ROOT_PASS` | Mongo root password |
| `MONGO_URI` | Full Mongo connection string |
| `JWT_SECRET` | JWT signing secret |
| `RAZORPAY_KEY_ID` | Razorpay key id |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `SMTP_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | e.g. `587` |
| `SMTP_USER` | SMTP account email |
| `SMTP_PASS` | SMTP app password |
| `FRONTEND_URL` | `https://goairclass.com` |
| `CRM_API_URL` | `https://billpay.business/api/leads/capture` |
| `CRM_API_KEY` | CRM API key |
| `CERTBOT_EMAIL` | Email used for the Let's Encrypt cert (expiry notices) |

Once these are set, **just `git push` to `main`** — the workflow:
1. builds & pushes the backend, frontend, and admin-frontend images to GHCR
2. SSHes into the VPS and rewrites `/opt/goairclass/.env` from the secrets above
3. `git pull`s the latest compose/nginx config
4. if `admin.goairclass.com`'s SSL cert doesn't exist yet, temporarily brings
   up the HTTP-only bootstrap nginx config, issues the cert via certbot, then
   restores the real (SSL) config — automatically, only runs once
5. pulls the new images and does a rolling restart

Adding a **new** env var in the future (another API key, etc.) is now just:
add it as a GitHub Secret + list it in the `envs:`/`env:` blocks of the
"Write .env from GitHub Secrets" step in `.github/workflows/deploy.yml`, and
in the heredoc that writes the file — then push. No VPS login needed.

---

## Recovery: nginx crash-looping because a cert is missing

Should rarely happen now (the workflow auto-issues the admin cert), but if a
cert is ever missing and nginx won't start:

```bash
cd /opt/goairclass

# 1. Swap in the bootstrap (HTTP-only) config temporarily
cp nginx/nginx.conf nginx/nginx.conf.bak
cp nginx/nginx-bootstrap.conf nginx/nginx.conf
docker compose up -d nginx

# 2. Issue the missing cert
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d admin.goairclass.com \
  --email <your-email> --agree-tos --no-eff-email

# 3. Restore the real config
mv nginx/nginx.conf.bak nginx/nginx.conf
docker compose up -d nginx
```

---

## Local development

```bash
# Backend
cd backend && npm run dev            # port 5000

# Main site
cd frontend && npm run dev           # http://localhost:5173

# Admin portal
cd admin-frontend && npm run dev     # http://localhost:5174 (proxies /api → :5000)
```

## Notes

- Login/token storage is **per-domain** — logging in at goairclass.com does not log
  you into admin.goairclass.com (and vice versa). Admins log in directly on the
  admin portal with email + password + OTP.
- Old links to `goairclass.com/admin` or `/super-admin` redirect to
  `https://admin.goairclass.com`.
- The admin login screen rejects non-admin roles; the main site login redirects
  admin/superadmin to the admin portal.
- The admin image is built with an empty `VITE_API_URL` → API calls are relative
  (`/api/...`) and stay on the admin domain (no CORS involved).
- The VPS's `.env` is now fully owned by GitHub Secrets — manual edits to it on
  the VPS will be overwritten on the next deploy.
