# Dcy Glow Board

*[English version](README.md)*

Un dashboard personnel pour [Home Assistant](https://www.home-assistant.io/), construit de zéro, indépendant du moteur Lovelace, qui parle directement à l'API WebSocket temps réel de HA. Pas de YAML, pas de backend : tout tourne côté client, et chaque appareil a une carte pensée pour ce qu'il fait réellement.

| ![Cuisine](docs/screenshots/kitchen.jpg) | ![Chambre](docs/screenshots/bedroom.jpg) | ![Entrée](docs/screenshots/entryway.jpg) |
|---|---|---|
| ![Jardin](docs/screenshots/garden.jpg) | ![Bureau](docs/screenshots/office.jpg) | ![Réglages](docs/screenshots/settings.jpg) |

> Les captures utilisent une maison de démo inventée (fausses pièces, faux appareils, aucune donnée réelle), juste pour montrer chaque style de carte. La disposition des pièces, le choix des cartes et le style de chacune sont entièrement libres depuis la page Réglages : rien ici n'est figé.

## Pourquoi ce projet

Lovelace est flexible, mais construire une interface qui donne une vraie impression de cohérence visuelle (identité propre par domaine, couleur porteuse de sens physique avec le halo d'une lumière qui suit sa luminosité et un thermostat qui ressemble à un vrai thermostat, disposition entièrement contrôlée à la souris) voulait dire partir d'une page blanche plutôt que d'un framework de cartes. Ce projet, c'est cette page blanche.

## Fonctionnalités

- **Interface anglais/français**, à basculer à tout moment depuis Réglages (anglais par défaut) ; les noms d'appareils et de pièces viennent toujours de Home Assistant lui-même, indépendamment de ce réglage.
- **Regroupement automatique par pièce** : lit directement les zones/secteurs de Home Assistant ; une nouvelle zone créée dans HA apparaît ici sans toucher à la moindre config.
- **Une carte dédiée par domaine**, chacune avec ses propres contrôles et 2 à 5 styles d'affichage au choix, réglables par carte dans la page Réglages :

<details>
<summary>Liste complète des domaines pris en charge</summary>

| Domaine | Contrôles | Styles disponibles |
|---|---|---|
| `light` / `switch` | interrupteur, luminosité, température de couleur, palette 8 couleurs | Actuel, Tuile, Roue de couleur |
| `climate` | cadran circulaire façon thermostat, +/-, sélection de mode | Cadran, Compact |
| `sensor` | valeur + sparkline 24h | Chiffre, Arc, Aiguille, Thermomètre, Anneau |
| `cover` | ouvrir/stop/fermer, curseur de position | Actuel, Tuile (glisser pour positionner) |
| `fan` | interrupteur, curseur de vitesse, icône animée | - |
| `lock` | verrouiller/déverrouiller | Actuel, Glisser pour déverrouiller |
| `binary_sensor` | lecture seule, icône/libellé contextuels | Actuel, Frise historique 12h |
| `button` / `scene` / `script` | bouton d'action unique | - |
| `weather` | conditions, icônes animées (14 états) | Jour / Heures / Semaine |
| `media_player` | lecture/pause/suivant, volume, titre en cours | Actuel, Tuile (télécommande), Pochette "Now Playing" |
| `camera` | aperçu instantané | Actuel, Aperçu (rafraîchi + agrandissement) |
| `alarm_control_panel` | armer/désarmer avec code | Actuel, Clavier toujours visible |
| `vacuum` | démarrer/pause/retour base, batterie | Actuel, Tuile (batterie en anneau) |
| tout autre domaine | carte générique de secours | - |

</details>

- **Page Réglages entièrement personnalisable** (tout côté navigateur, rien n'est écrit dans Home Assistant) : afficher/masquer les onglets, réordonner onglets et cartes par glisser-déposer, créer des onglets personnalisés piochant des appareils dans n'importe quelle pièce, sous-menus dans un onglet, renommer l'affichage d'une carte, choisir une icône dans un catalogue cherchable, choisir la couleur d'un onglet, largeur de carte 1 à 3 colonnes, positionnement libre des cartes.
- **Onglet "Page externe"** : affiche n'importe quelle page web locale (interface ESPHome, Node-RED, Pi-hole, l'interface propre d'une caméra IP…) en plein écran dans l'app, via une simple iframe.
- **Export/import de la config** en JSON : comme le `localStorage` du navigateur est propre à chaque origine, c'est ce qui permet de transférer sa config d'un appareil ou d'une adresse à l'autre.

## Pour commencer

Deux guides d'installation, selon le niveau d'accompagnement voulu :

- **[Guide rapide](docs/install-quick.fr.md)** : si `npm`, les modules complémentaires Home Assistant et compagnie te sont déjà familiers.
- **[Guide détaillé](docs/install.fr.md)** : pas à pas, plusieurs méthodes de déploiement, section dépannage, pensé pour quelqu'un qui n'a jamais fait ça.

*(Guides also available in English: [quick](docs/install-quick.md), [detailed](docs/install.md).)*

## Stack technique

React 19 + TypeScript + Vite, Tailwind CSS v4, `home-assistant-js-websocket` pour la connexion temps réel. Pas de backend, pas de secret à la compilation : l'adresse HA et le jeton d'accès longue durée sont saisis une fois dans l'app et stockés dans le `localStorage` du navigateur.

## État du projet

C'est un projet personnel, activement utilisé et évolutif, pas une version 1.0 finalisée. Lire le [DISCLAIMER.fr.md](DISCLAIMER.fr.md) avant de le connecter à des appareils qui comptent pour toi.

**Ce qui est réellement testé** : utilisé au quotidien sur l'instance Home Assistant réelle de l'auteur, lumières/prises, climatisation, capteurs, capteurs binaires, boutons/scènes/scripts, météo, lecteurs média (confirmé en direct sur un lecteur MPD via Music Assistant), onglets personnalisés, glisser-déposer, réglages, export/import de config, et l'onglet page externe en iframe.

**Aperçu dev uniquement, pas encore vérifié sur du matériel réel** : volets, ventilateurs, serrures, caméra, alarme et aspirateur. Ces cartes ont été construites et vérifiées via l'aperçu développeur intégré à l'app (entités simulées, voir `USE_DEV_PREVIEW` dans `src/main.tsx`), mais l'auteur ne possède pas les appareils correspondants pour les confirmer en conditions réelles. Si tu les testes sur du vrai matériel, un retour (via une issue) sur ce qui a fonctionné ou non serait vraiment utile.

## Remerciements

- **Icônes météo animées** : [caule-themes-pack-1](https://github.com/ricardoquecria/caule-themes-pack-1) par Ricardo Correia (licence MIT), icônes créées à l'origine par amCharts.
- **Inspiration du menu de navigation** : l'idée visuelle du menu par pièce (pastille glissante, style "gelatine neon") vient d'une [vidéo TikTok de @code_candy](https://www.tiktok.com/@code_candy/video/7671047586928954646). L'implémentation (React/TypeScript) a été recodée entièrement pour ce projet, rien n'a été copié depuis la vidéo.
- **Polices** : Fraunces, Space Grotesk et Spline Sans Mono, via [Fontsource](https://fontsource.org/) (licence SIL OFL).
- **Connexion Home Assistant** : [home-assistant-js-websocket](https://github.com/home-assistant/home-assistant-js-websocket), la bibliothèque officielle.

## Licence

[MIT](LICENSE). Voir aussi [DISCLAIMER.fr.md](DISCLAIMER.fr.md) pour les conditions d'utilisation à tes propres risques, spécifiques à un dashboard qui contrôle de vrais appareils.
