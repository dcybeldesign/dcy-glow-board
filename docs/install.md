# Detailed installation guide

*[Version française](install.fr.md) · [Quick start](install-quick.md)*

Step-by-step walkthrough for building the app and deploying it to a Home Assistant instance, written for someone who's never done this before. For what the app can do once installed, see the [README](../README.md#features).

## Quick summary (for later reference)

1. `npm install` (once) then `npm run build` → produces `dist/`
2. Copy the contents of `dist/` into `/config/www/dashboard/` on Home Assistant
3. Grab a long-lived access token from your HA profile
4. Open `http://<ha-address>:8123/local/dashboard/index.html`, paste the HA address (without the `/local/...` path) and the token into the login screen

Each step is detailed below.

## Prerequisites

- **Node.js** installed on the machine used to build the app (needed for `npm`). Check with `node -v` in a terminal; if the command doesn't exist, install Node.js from [nodejs.org](https://nodejs.org).
- This repository, cloned or downloaded locally.
- Access to Home Assistant's file system (one of the add-ons listed in step 2, installed once).

## Step 1: build the app (`dist/`)

In a terminal, at the repo root:

```bash
npm install
```

Downloads the project's dependencies, only needed once (or after a dependency change in `package.json`).

Then, every time you want to deploy a new version:

```bash
npm run build
```

This produces a `dist/` folder containing the "compiled" app as static files (HTML/CSS/JS); that's the folder you upload to Home Assistant, never the source code.

> The project's `vite.config.ts` sets `base: '/local/dashboard/'`, which assumes you'll host the app at `config/www/dashboard/` on HA (the recommended method below: same origin as HA, so no CORS or HTTPS/HTTP issues). If you use a different folder name or a different host (see "Other hosting options" below), update this value before running `npm run build`.

## Step 2: copy `dist/` to Home Assistant

Home Assistant automatically serves anything in its `config/www/` folder at `http://<ha-address>:8123/local/`. So the app needs to end up in `config/www/dashboard/` (the `dashboard` name matches what's set in `vite.config.ts`; create `www/dashboard/` the first time if it doesn't exist yet, using any of the methods below).

Three methods, pick whichever matches what you already have installed on your Home Assistant:

### Method A: Studio Code Server (simplest, recommended)

1. In Home Assistant: **Settings → Add-ons → Add-on Store**, search for **Studio Code Server**, install it, then start it (enable "Show in sidebar" for easy access later).
2. Open Studio Code Server from HA's sidebar: it's an in-browser file editor with a file explorer on the left (same structure as `/config`).
3. If `www` doesn't exist at the root, right-click → **New Folder** → name it `www`. Inside it, create a `dashboard` subfolder.
4. On your PC's file explorer, open the `dist/` folder generated in step 1, select everything inside it (not the `dist` folder itself, its **contents**), and drag-and-drop it into `www/dashboard/` in Studio Code Server.
5. If files already exist from a previous deployment, overwrite them (same filenames cleanly replace the old version).

### Method B: Samba network share

1. Install the **Samba share** add-on from the Add-on Store, start it.
2. From your PC's file explorer, open as a network location: `\\<ha-address>\config\www\` (e.g. `\\100.101.102.103\config\www\` over Tailscale, or `\\homeassistant.local\config\www\` on a local network); this mounts HA's `config` folder as a regular network drive.
3. Create `dashboard/` if it doesn't exist, then copy-paste the contents of `dist/` into it like any regular file.

### Method C: `scp` from the command line

For anyone comfortable with a terminal:

1. Install the **SSH & Web Terminal** (or **Advanced SSH & Web Terminal**) add-on from the Add-on Store, configure it (password or SSH key), and start it.
2. From a terminal on your PC:

```bash
scp -r "dist/." root@<ha-address>:/config/www/dashboard/
```

The SSH port is often `22222` on Home Assistant OS (not the default 22). If the connection fails, add `-P 22222`:

```bash
scp -P 22222 -r "dist/." root@<ha-address>:/config/www/dashboard/
```

This is the easiest method to later wrap into a one-command build+deploy script.

### Other hosting options

The app is 100% static (HTML/CSS/JS) and connects to Home Assistant from the browser, not from a server: it doesn't strictly *need* to live inside HA's `www/`. You can serve it from any static file host (Nginx, Netlify, GitHub Pages, a plain `python -m http.server`…), as long as you:
- update `base` in `vite.config.ts` to match the actual path (`/` if served at the domain root),
- make sure Home Assistant allows requests from that origin (CORS, see **Settings → System → Network** in HA),
- avoid HTTPS/HTTP "mixed content": if the app is served over HTTPS, it needs to reach an HA instance that's also on HTTPS (or on HTTP over the same local network, depending on browser policy).

Hosting inside HA's `www/` (the recommended method above) stays the simplest option since it avoids both of those concerns by construction (same origin as HA).

## Step 3: get a long-lived access token

The app connects to Home Assistant on its own behalf (not through a regular login session), so it needs a dedicated token:

1. In Home Assistant, click your username at the bottom of the sidebar to open your **profile**.
2. Go to the **Security** tab.
3. At the very bottom of the page: **Long-Lived Access Tokens** section → **Create Token** button.
4. Give it a name (e.g. "Personal dashboard") and confirm.
5. The token is shown **only once**: copy it immediately (copy button) and keep it somewhere safe (e.g. a password manager); it can't be displayed again afterward. If lost, create a new one.

This token grants full access to your Home Assistant instance on your behalf; treat it like a password. See the [DISCLAIMER](../DISCLAIMER.md) for the security implications.

## Step 4: connect from the app

Two different addresses are involved here, don't mix them up:

- **In the browser's address bar**: the app's own URL, full path to the file:
  `http://<ha-address>:8123/local/dashboard/index.html`
- **In the login form shown by the app**: just Home Assistant's base address, without `/local/dashboard/...`:
  `http://<ha-address>:8123`

Once the app's URL is open in the browser, the "Connect to Home Assistant" screen asks for:
1. **Home Assistant address** → the base address above (no path)
2. **Long-lived access token** → the one copied in step 3

Submit with "Connect": the app then loads your rooms/areas automatically from HA.

## Common troubleshooting

- **Blank page or an old version showing after a new deployment**: the browser cached the old `index.html`. Force-reload (`Ctrl+F5` on PC), or append `?v=2` (or any other text) to the URL to force a full reload.
- **Weather icons or other assets returning 404**: sign that the build used the wrong `base` in `vite.config.ts`, or that the destination folder on HA isn't named exactly `dashboard`.
- **Nothing shows after connecting / connection error**: check that the address entered in the app's form is HA's address *without* `/local/dashboard/...`, and that the token wasn't truncated when copy-pasting.
- **Config (tabs, cards, styles) doesn't carry over between a device or address and another**: expected, each origin (protocol+host+port) has its own storage. Use Export/Import in Settings to move an already-built config over.
- **"Refused to connect" or a CORS error in the console**: check **Settings → System → Network** on Home Assistant for the CORS/trusted proxy configuration; the old `http:` YAML integration has been deprecated since HA 2025.x, everything's configured from the UI now.

## See also

[README](../README.md) for the full feature list, [DISCLAIMER](../DISCLAIMER.md) for terms of use.
