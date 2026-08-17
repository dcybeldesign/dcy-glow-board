# Quick start

*[Version française](install-quick.fr.md) · [Detailed guide](install.md)*

For anyone already comfortable with `npm`, Home Assistant add-ons, and a terminal. For the full walkthrough with troubleshooting, see the [detailed guide](install.md).

## Build

```bash
npm install
npm run build
```

→ `dist/` holds the static app, ready to deploy.

`vite.config.ts` defaults to `base: '/local/dashboard/'`, expecting `config/www/dashboard/` on HA. Adjust if hosting elsewhere or under a different folder name.

## Deploy (pick one)

- **Studio Code Server** (HA add-on): drag the contents of `dist/` into `www/dashboard/`.
- **Samba share** (HA add-on): `\\<ha-address>\config\www\dashboard\`, copy `dist/*` in.
- **scp**:
  ```bash
  scp -r "dist/." root@<ha-address>:/config/www/dashboard/
  # port 22222 on HA OS if 22 fails
  ```
- Any static host works too (the app is 100% client-side), just mind `base` in `vite.config.ts`, CORS on the HA side (**Settings → System → Network**), and HTTPS/HTTP mixed content.

## Access token

HA profile → **Security** → **Long-Lived Access Tokens** → **Create Token**. Shown once, copy it immediately.

## Connect

- App URL in the browser: `http://<ha-address>:8123/local/dashboard/index.html`
- In the app's login form: HA's address **without** `/local/dashboard/...` (`http://<ha-address>:8123`) + the token

## Known gotchas

- Browser cache after redeploy → `Ctrl+F5` or append `?v=2` to the URL.
- `localStorage` (and so the config) is per-origin: use Settings' export/import JSON to carry it over.
- Weather icons 404 → wrong `base`, or destination folder isn't named `dashboard`.

See the [README](../README.md) for the feature list and [DISCLAIMER](../DISCLAIMER.md) before connecting to real devices.
