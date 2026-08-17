# Guide rapide

*[English version](install-quick.md) · [Guide détaillé](install.fr.md)*

Pour quelqu'un déjà à l'aise avec `npm`, les add-ons Home Assistant et un terminal. Pour le pas-à-pas complet avec captures et dépannage, voir le [guide détaillé](install.fr.md).

## Build

```bash
npm install
npm run build
```

→ `dist/` contient l'app statique à déployer.

`vite.config.ts` a `base: '/local/dashboard/'` par défaut, prévu pour un hébergement dans `config/www/dashboard/` sur HA. Adapter si tu héberges ailleurs ou sous un autre nom de dossier.

## Déploiement (au choix)

- **Studio Code Server** (add-on HA) : glisser le contenu de `dist/` dans `www/dashboard/`.
- **Samba share** (add-on HA) : `\\<adresse-ha>\config\www\dashboard\`, copier `dist/*`.
- **scp** :
  ```bash
  scp -r "dist/." root@<adresse-ha>:/config/www/dashboard/
  # port 22222 sur HA OS si le port 22 échoue
  ```
- N'importe quel hébergeur statique fonctionne aussi (l'app tourne 100% côté client), mais attention alors à `base` dans `vite.config.ts`, au CORS côté HA (**Paramètres → Système → Réseau**), et au contenu mixte HTTPS/HTTP.

## Jeton d'accès

Profil HA → **Sécurité** → **Jetons d'accès à longue durée** → **Créer un jeton**. Affiché une seule fois, à copier immédiatement.

## Connexion

- URL de l'app dans le navigateur : `http://<adresse-ha>:8123/local/dashboard/index.html`
- Dans le formulaire de l'app : adresse HA **sans** `/local/dashboard/...` (`http://<adresse-ha>:8123`) + le jeton

## Pièges connus

- Cache navigateur après redéploiement → `Ctrl+F5` ou `?v=2` en fin d'URL.
- `localStorage` (donc la config) est propre à chaque origine : utiliser l'export/import JSON depuis Réglages pour la transférer.
- 404 sur les icônes météo → `base` mal réglé ou dossier de destination pas nommé `dashboard`.

Voir le [README](../README.fr.md) pour la liste des fonctionnalités et le [DISCLAIMER](../DISCLAIMER.fr.md) avant de connecter à des appareils réels.
