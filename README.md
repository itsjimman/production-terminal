# ITSJIMMAN Production Hub

A shared production-tracking app for the studio: productions, tasks, and
per-shoot expense ledgers, backed by a real SQL database instead of a JSON
blob baked into a page. Rebuilt from the previous Claude Artifact version to
fix the two things that version couldn't do — durable storage you can query
and back up, and multiple people saving at once without clobbering each
other's work.

## What changed from the old version

- **Real database.** Every production, task, subtask, and expense is a row
  in a SQLite file (`instance/itsjimman.db`), not JSON text inside an HTML
  page. You can open that file with any SQLite browser (e.g. [DB Browser
  for SQLite](https://sqlitebrowser.org/), free) and see the raw data —
  which is exactly what you originally asked whether you could do.
- **No more "someone else just saved, reloading" conflicts.** Each save is
  a normal database write, not a whole-page republish.
- **Real per-person logins.** Everyone signs in with their own username and
  password instead of one shared passcode. There's a Super Admin role
  (Jimman, by default) who can add and remove people from the Admin page —
  see below.
- **Same layout, workflow, and visual design you already know** — Overview,
  Productions (click to expand into tasks + expense ledger), Tasks,
  Calendar — just faster and durable.

Models/Vendors/Locations were parked in the old version and stayed parked
here — easy to add later if you want them back.

## Running it

You need Python 3 (already on this Mac) — no Node.js or other install
required.

```bash
cd itsjimman-hub
python3 -m pip install --user -r requirements.txt   # one-time
cp .env.example .env                                 # then edit .env
python3 run.py
```

Open **http://127.0.0.1:5050** in a browser. Anyone on the same network
(office WiFi) can reach it at `http://<your-Mac's-IP>:5050` while `run.py`
is running.

### Signing in

The first time the app starts, it creates one account automatically:

- **Username:** `Jimman`
- **Password:** `production`
- **Role:** Super Admin

Sign in with that, then go to the **Admin** page (visible only to Super
Admins) to add accounts for everyone else — pick a username and password
for each person, and whether they're a regular Member or another Super
Admin. Only Super Admins can add or remove logins; everyone else just uses
the app normally.

Removing someone's access (from the Admin page) revokes their login but
keeps their name attached to any productions, tasks, or expenses they were
already part of — nothing historical gets deleted.

Set a real `SECRET_KEY` in `.env` (copied from `.env.example`) before
anyone relies on this — it signs the login cookies:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## Keeping it running for the team

Right now the app only runs while `python3 run.py` is running on this Mac
and only reaches people on the same network. For the team (Evelyn, Bayu,
etc.) to open it from anywhere — e.g. at `itsjimman.com/terminal`, since
itsjimman.com is on Netlify — you need two things:

1. **Deploy this app somewhere that stays on 24/7.** Netlify itself can't
   run a persistent Flask app, so it needs a real host — Railway, Render,
   or Fly.io all work and take about 15 minutes:
   - Push this project to a GitHub repo.
   - On the host, create a new app from that repo.
   - **Attach a persistent volume/disk mounted at `instance/`** — without
     this, the database resets every time the app restarts or redeploys.
     This is the single most important setting; double-check it before
     pointing real traffic at the deployment.
   - Set env vars: `SECRET_KEY` (generate one — see above) and optionally
     `DATABASE_URL` if you move to Postgres instead of the bundled SQLite
     file.
   - Start command is already defined in `Procfile` — most hosts detect it
     automatically (`gunicorn -w 1 --threads 4 -b 0.0.0.0:$PORT run:app`).
     Deliberately a single worker: SQLite doesn't handle multiple
     processes writing to the same file well, and a single threaded
     worker is more than enough for a small team.
   - Once live, you'll have a URL like `https://itsjimman-hub.up.railway.app`.
2. **Point `/terminal` at it from Netlify.** In the Netlify site that
   serves itsjimman.com, add a redirect/proxy rule (via `netlify.toml` in
   that site's repo, or Site configuration → Build & deploy → Redirects
   in the dashboard):
   ```toml
   [[redirects]]
     from = "/terminal/*"
     to = "https://itsjimman-hub.up.railway.app/:splat"
     status = 200
     force = true
   ```
   Replace the `to` URL with your actual deployed URL. Because the browser
   only ever sees `itsjimman.com`, login cookies work normally with no
   extra CORS setup.

**Before doing any of this, back up `instance/itsjimman.db`** (copy it
somewhere safe) in case anything goes wrong during the first deploy.

## Project layout

```
app/
  models.py       — the database schema (Production, Task, Subtask, Expense, TeamMember)
  api.py          — JSON API the frontend calls to read/write data
  views.py        — page routes (Overview, Productions, Tasks, Calendar, Admin)
  auth.py         — per-user login + the Super Admin check
  templates/      — page shell + login screen
  static/css      — visual design (same look as before)
  static/js       — the frontend app (vanilla JS, no build step)
instance/
  itsjimman.db    — the actual database file (created on first run)
```

## Backing up your data

The entire database is the single file `instance/itsjimman.db`. Copy that
file anywhere (Google Drive, Time Machine, etc.) to back it up. To restore,
stop the app, replace the file, and restart.
