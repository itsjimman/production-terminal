# Deploying ITSJIMMAN Production Terminal to Cloudflare

The data migration to D1 is done and verified (see below). What's left has
to run on your own Mac, because it needs Docker and direct network access
to Cloudflare's API — neither of which this cloud session has.

## What's already done

- A D1 database (`itsjimman-production-terminal`) has been created with the
  full schema and **all your live Railway data migrated and verified**:
  4 team members, 7 productions, 17 crew links, 14 tasks, 13 task
  assignments, 18 subtasks, 5 expenses, 4 post-pro items, 94 audit log
  entries — all row counts double-checked against the export.
- Foreign keys and cascade deletes were smoke-tested and work correctly.
- Everyone's password has been reset to a fresh temporary one (sent to you
  separately in chat, not in this file) — they should change it from
  the app's "My Password" page after logging in once.
- **Avatar photos were not migrated** (the export feature excludes them by
  design). Anyone who had one will need to re-upload it after cutover.

## What you need to do

### 1. Install prerequisites (if you don't have them)

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — must
  be running before you deploy.
- Node.js (18+) and npm.

### 2. Create a Cloudflare API token for the app

The app talks to D1 over Cloudflare's REST API, so it needs its own token
(separate from your login):

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token** → **Create Custom Token**
3. Permissions: **Account** → **D1** → **Edit**
4. Account Resources: your account only
5. Create it and copy the token — you won't see it again.

### 3. Unzip this project and install dependencies

```
cd itsjimman-production-terminal
npm install
```

### 4. Set the two secrets Wrangler will inject into the container

```
npx wrangler secret put DATABASE_URL
```
When prompted, paste (all one line, no spaces):
```
cloudflare_d1://05a616f0cf6357a064b75d5a6b36fd3d:YOUR_API_TOKEN_HERE@c6d59d6f-c58e-4e20-90ac-964f796fe4ae
```
(replace `YOUR_API_TOKEN_HERE` with the token from step 2)

```
npx wrangler secret put SECRET_KEY
```
When prompted, paste any long random string, e.g. generate one with:
```
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 5. Deploy

Make sure Docker Desktop is running, then:

```
npx wrangler deploy
```

This builds the container image from the included `Dockerfile` and deploys
the Worker + Container. Wrangler will print the `*.workers.dev` URL when
it's done — open that to confirm the app loads and you can log in.

### 6. Point terminal.itsjimman.com at it (once you've verified it works)

Once you've confirmed login + data look right on the `*.workers.dev` URL,
let me know and we'll switch the `terminal.itsjimman.com` DNS record from
Railway to the new Worker, keeping Railway running as a fallback until
you're fully confident in the new setup.

## If something goes wrong

- **`wrangler deploy` fails needing Docker**: make sure Docker Desktop is
  open and fully started (not just launching) before retrying.
- **App loads but login fails / data looks empty**: double check the
  `DATABASE_URL` secret — a typo in the account ID, database ID, or API
  token is the most likely cause. You can re-run `wrangler secret put
  DATABASE_URL` to fix it and redeploy.
- **Anything else**: come back to this chat with the error message and
  I'll help debug it from here (I can still read D1 data and troubleshoot,
  I just can't run `wrangler deploy` myself).
