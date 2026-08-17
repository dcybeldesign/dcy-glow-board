# Avertissement

*[English version](DISCLAIMER.md)*

Ce projet est un dashboard personnel, réalisé sur mon temps libre, pour [Home Assistant](https://www.home-assistant.io/). Il n'est **ni affilié à, ni approuvé, ni soutenu par** Home Assistant, Nabu Casa, ou l'Open Home Foundation.

## Aucune garantie

Ce logiciel est fourni "tel quel", sans garantie d'aucune sorte, explicite ou implicite. Voir le texte légal complet dans la [licence MIT](LICENSE). Rien ne garantit en particulier qu'il fonctionnera correctement avec ta configuration Home Assistant, tes intégrations ou tes appareils spécifiques.

## Utilisation à tes propres risques

Ce dashboard peut contrôler de vrais appareils physiques (serrures, systèmes d'alarme, climatisation, volets, aspirateurs robots, et plus) via les appels de service de Home Assistant. En l'utilisant, tu acceptes l'entière responsabilité de :

- Toute action non désirée déclenchée sur un appareil connecté (une lumière laissée allumée, une serrure déverrouillée par erreur, une alarme désarmée par erreur, etc.).
- Toute conséquence liée à l'exposition de ton instance Home Assistant sur un réseau (local, VPN, ou autre) pour rendre ce dashboard accessible.
- Toute conséquence liée à la façon dont tu génères, stockes ou partages ton jeton d'accès longue durée Home Assistant. Le jeton n'est stocké que dans le `localStorage` de ton navigateur et n'est jamais envoyé ailleurs qu'à ta propre instance Home Assistant. Cela dit, un jeton en `localStorage` est aussi sensible qu'un mot de passe : quiconque a accès à ce profil de navigateur, ou à l'appareil sur lequel il tourne, peut s'en servir pour contrôler ta maison. Traite l'adresse utilisée pour accéder à ce dashboard, et l'appareil sur lequel elle est ouverte, en conséquence.

L'auteur n'est pas responsable des dommages, pertes, incidents de sécurité ou dysfonctionnements résultant de l'utilisation, du mauvais usage, ou de l'impossibilité d'utiliser ce logiciel.

## État des tests

Tous les styles de carte de ce projet n'ont pas été vérifiés sur du matériel réel : certains n'ont été testés que dans l'aperçu développeur intégré (entités simulées, aucun appareil réel impliqué). Voir la section "Ce qui est testé" du README pour l'état actuel par fonctionnalité. Considère tout ce qui est marqué "aperçu dev uniquement" comme non vérifié en conditions réelles.

## Contenu tiers

Ce dépôt inclut ou référence des éléments tiers (icônes, inspiration de design) qui ne sont pas le travail de l'auteur. Voir la section "Remerciements" du [README](README.fr.md) pour les crédits et détails de licence.
