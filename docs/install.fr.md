# Guide d'installation détaillé

*[English version](install.md) · [Guide rapide](install-quick.fr.md)*

Tuto pas-à-pas pour construire l'app et la déployer sur une instance Home Assistant, pensé pour quelqu'un qui n'a jamais fait ça. Pour la liste de ce que l'app sait faire une fois installée, voir le [README](../README.fr.md#fonctionnalités).

## Résumé rapide (pour s'y retrouver ensuite)

1. `npm install` (une seule fois) puis `npm run build` → génère `dist/`
2. Copier le contenu de `dist/` dans `/config/www/dashboard/` sur Home Assistant
3. Récupérer un jeton d'accès longue durée depuis le profil HA
4. Ouvrir `http://<adresse-ha>:8123/local/dashboard/index.html`, coller l'adresse HA (sans le chemin `/local/...`) et le jeton dans l'écran de connexion

Le détail de chaque étape est plus bas.

## Prérequis

- **Node.js** installé sur le PC qui sert à construire l'app (nécessaire pour `npm`). Vérifier avec `node -v` dans un terminal ; si la commande n'existe pas, installer Node.js depuis [nodejs.org](https://nodejs.org).
- Le dépôt de ce projet, cloné ou téléchargé en local.
- Un accès à Home Assistant pour explorer ses fichiers (un des add-ons cités à l'étape 2, à installer une seule fois).

## Étape 1 : construire l'app (`dist/`)

Dans un terminal, à la racine du dépôt :

```bash
npm install
```

Cette commande télécharge les dépendances du projet, à ne faire qu'une fois (ou après un changement des dépendances dans `package.json`).

Puis, à chaque fois qu'on veut déployer une nouvelle version :

```bash
npm run build
```

Ça produit un dossier `dist/` contenant l'app "compilée" en fichiers statiques (HTML/CSS/JS) ; c'est ce dossier qu'il faut envoyer sur Home Assistant, jamais le code source.

> Le fichier `vite.config.ts` du projet contient `base: '/local/dashboard/'`, ce qui suppose que tu vas héberger l'app dans `config/www/dashboard/` sur HA (méthode recommandée ci-dessous, même origine que HA donc pas de souci CORS ni HTTPS/HTTP). Si tu choisis un autre nom de dossier ou un autre hébergement (voir "Autres façons d'héberger" plus bas), adapte cette valeur avant de lancer `npm run build`.

## Étape 2 : transférer `dist/` sur Home Assistant

Home Assistant sert automatiquement tout ce qui se trouve dans son dossier `config/www/` à l'adresse `http://<adresse-ha>:8123/local/`. L'app doit donc finir dans `config/www/dashboard/` (le nom `dashboard` est celui utilisé dans `vite.config.ts` ; si `www/dashboard/` n'existe pas encore, il faut le créer la première fois, avec n'importe laquelle des méthodes ci-dessous).

Trois méthodes possibles, à choisir selon ce que tu as déjà installé sur ton Home Assistant :

### Méthode A : Studio Code Server (la plus simple, recommandée)

1. Dans Home Assistant : **Paramètres → Modules complémentaires → Boutique des modules complémentaires**, chercher **Studio Code Server**, l'installer puis le démarrer (activer "Afficher dans le menu" pour y accéder facilement ensuite).
2. Ouvrir Studio Code Server depuis le menu latéral de HA : c'est un éditeur de fichiers dans le navigateur, avec un explorateur de fichiers à gauche (même structure que `/config`).
3. Si le dossier `www` n'existe pas à la racine, clic droit → **New Folder** → nommer `www`. Dedans, créer un sous-dossier `dashboard`.
4. Dans l'explorateur de fichiers de ton PC, ouvrir le dossier `dist/` généré à l'étape 1, sélectionner tout son contenu (pas le dossier `dist` lui-même, ce qu'il y a **dedans**) et le glisser-déposer dans `www/dashboard/` côté Studio Code Server.
5. Si des fichiers existaient déjà d'un déploiement précédent, les remplacer (garder les mêmes noms écrase proprement l'ancienne version).

### Méthode B : Partage réseau Samba

1. Installer l'add-on **Samba share** depuis la Boutique des modules complémentaires, le démarrer.
2. Depuis l'explorateur de fichiers de ton PC, ouvrir en tant que dossier réseau : `\\<adresse-ha>\config\www\` (ex. `\\100.101.102.103\config\www\` en Tailscale, ou `\\homeassistant.local\config\www\` en réseau local) ; ça monte le dossier `config` de HA comme un lecteur réseau normal.
3. Créer `dashboard/` s'il n'existe pas, puis copier-coller directement le contenu de `dist/` dedans, comme n'importe quel fichier.

### Méthode C : `scp` en ligne de commande

Pour quelqu'un à l'aise avec un terminal :

1. Installer l'add-on **SSH & Web Terminal** (ou **Advanced SSH & Web Terminal**) depuis la Boutique des modules complémentaires, le configurer (mot de passe ou clé SSH) et le démarrer.
2. Depuis un terminal sur le PC :

```bash
scp -r "dist/." root@<adresse-ha>:/config/www/dashboard/
```

Le port SSH est souvent `22222` sur Home Assistant OS (pas le 22 par défaut). Si la connexion échoue, ajouter `-P 22222` :

```bash
scp -P 22222 -r "dist/." root@<adresse-ha>:/config/www/dashboard/
```

C'est la méthode la plus facile à automatiser dans un script build+deploy en une commande, si besoin.

### Autres façons d'héberger

L'app est 100% statique (HTML/CSS/JS) et se connecte à Home Assistant depuis le navigateur, pas depuis un serveur : elle n'a donc pas *besoin* d'être hébergée dans `www/` de HA. Tu peux la servir depuis n'importe quel hébergeur de fichiers statiques (Nginx, Netlify, GitHub Pages, un simple `python -m http.server`…), à condition de :
- adapter `base` dans `vite.config.ts` au chemin réel (`/` si servi à la racine du domaine),
- t'assurer que Home Assistant autorise les requêtes venant de cette origine (CORS, voir **Paramètres → Système → Réseau** dans HA),
- éviter le "contenu mixte" HTTPS/HTTP : si l'app est servie en HTTPS, elle doit pouvoir joindre une instance HA elle aussi en HTTPS (ou en HTTP sur le même réseau local selon la politique du navigateur).

L'héberger dans `www/` de HA (méthode recommandée ci-dessus) reste la plus simple car elle évite ces deux points par construction (même origine que HA).

## Étape 3 : récupérer le jeton d'accès longue durée

L'app se connecte à Home Assistant en son nom propre (pas via une session de connexion classique), donc elle a besoin d'un jeton dédié :

1. Dans Home Assistant, cliquer sur ton nom d'utilisateur en bas du menu latéral pour ouvrir le **profil**.
2. Aller dans l'onglet **Sécurité**.
3. Tout en bas de la page : section **Jetons d'accès à longue durée** → bouton **Créer un jeton**.
4. Lui donner un nom (ex. "Dashboard perso") et valider.
5. Le jeton s'affiche **une seule fois** : le copier immédiatement (bouton copier) et le garder de côté (ex. dans un gestionnaire de mots de passe), impossible de le réafficher ensuite. Si perdu, il faut en recréer un nouveau.

Ce jeton donne un accès complet à ton instance Home Assistant en ton nom ; traite-le comme un mot de passe. Voir le [DISCLAIMER](../DISCLAIMER.fr.md) pour le détail des implications de sécurité.

## Étape 4 : se connecter depuis l'app

Deux adresses différentes entrent en jeu, à ne pas confondre :

- **Dans la barre d'adresse du navigateur** : l'URL de l'app elle-même, chemin complet jusqu'au fichier :
  `http://<adresse-ha>:8123/local/dashboard/index.html`
- **Dans le formulaire de connexion affiché par l'app** : uniquement l'adresse de base de Home Assistant, sans le `/local/dashboard/...` :
  `http://<adresse-ha>:8123`

Une fois l'URL de l'app ouverte dans le navigateur, l'écran "Connexion à Home Assistant" demande :
1. **Adresse Home Assistant** → l'adresse de base ci-dessus (sans chemin)
2. **Jeton d'accès de longue durée** → celui copié à l'étape 3

Valider avec "Se connecter" : l'app charge alors les pièces/zones automatiquement depuis HA.

## Dépannage courant

- **Page blanche ou ancienne version affichée après un nouveau déploiement** : le navigateur a mis en cache l'ancien `index.html`. Recharger en forçant le cache (`Ctrl+F5` sur PC), ou ajouter `?v=2` (ou tout autre texte) à la fin de l'URL pour forcer un rechargement complet.
- **Icônes météo ou autres ressources en 404** : signe que le fichier n'a pas été buildé avec le bon `base` dans `vite.config.ts`, ou que le dossier de destination sur HA ne s'appelle pas exactement `dashboard`.
- **Rien ne s'affiche après connexion / erreur de connexion** : vérifier que l'adresse saisie dans le formulaire de l'app est bien celle de HA *sans* `/local/dashboard/...`, et que le jeton n'a pas été tronqué au copier-coller.
- **La configuration (onglets, cartes, styles) ne suit pas d'un appareil ou d'une adresse à l'autre** : normal, chaque origine (protocole+host+port) a son propre stockage. Utiliser Export/Import depuis Réglages pour transférer une configuration déjà construite.
- **"Refused to connect" ou erreur CORS dans la console** : va dans **Paramètres → Système → Réseau** sur Home Assistant et vérifie la configuration CORS/proxy de confiance ; l'ancienne intégration YAML `http:` est dépréciée depuis HA 2025.x, tout se règle désormais depuis l'UI.

## Voir aussi

[README](../README.fr.md) pour la liste complète des fonctionnalités, [DISCLAIMER](../DISCLAIMER.fr.md) pour les conditions d'utilisation.
