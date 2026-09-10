# CinePaff

Ciné-club entre amis : propositions de films, tirage, disponibilités collectives, notes et commentaires.

## Lancer le site

Node.js suffit pour lancer le site, sans installation de dépendances de production.

```sh
npm run dev
```

Ouvrir http://127.0.0.1:4173. L’application utilise ses services Firebase et TMDB existants ; une connexion Internet est nécessaire pour les données, le catalogue et les polices.

```sh
npm run check
npm run build
```

Le dossier `dist/client` contient les fichiers publics. `dist/server/index.js` conserve le Worker existant. Le serveur local n’est pas un serveur de production.

## Refonte

- Palette conservée : bleu nuit `#090a18`, jaune acidulé `#dfff5f`, violet `#8b5cf6`.
- Polices conservées : Syne et Manrope ; logos existants.
- Interface minimaliste : textes courts, surfaces sans contours et navigation mobile.
- Carrousel toutes les 15 secondes, affiches en perspective, transitions fondues, pause, navigation tactile et accès à la fiche. Les animations réduites sont respectées ; le bouton lecture permet de démarrer le défilement.
- Recherche visuelle au-dessus des propositions, navigation clavier, doublons signalés, contenu sensible facultatif et confirmation protégée contre les doubles clics.
- Historique avec recherche, films à noter, coups de cœur et suppression de sa propre note (sur toutes les occurrences du film).
- Choix forcé disponible en mode normal et en mode test, parmi les films éligibles. Le mode normal conserve les règles de rotation et retire le film sélectionné ; le mode test reste une simulation locale sans aucune écriture : ni historique, ni film à l’affiche, ni rotation modifiés. Les anciens tests sont exclus de l’historique affiché.
- Tirage en 3D : rotation des affiches, ralentissement sur le film sélectionné et révélation en perspective.
- Profil repensé avec réglages du compte et onglet Administration : recherche de membres, filtres de rôles, avatars, propositions et protection du dernier admin.
- Page **Soirées** : chaque membre peut programmer un film à une date/heure et modifier ou annuler ses propres séances ; les admins peuvent gérer toutes les soirées. Les membres consultent les prochaines séances et les soirées passées. Stockage Firebase `screenings`, indépendant de `draw`, `movies` et `availability`. La date est saisie et affichée dans le fuseau local indiqué.
- Connexion immersive avec Initial D Legend et dégradé protégeant le logo.
- Focus clavier, accès direct au contenu, animations réduites et chargement différé des affiches.

`redesign.css` contient la nouvelle direction visuelle et les adaptations mobiles. `styles.css` conserve les fondations et les composants spécialisés (calendrier, recadrage, tirage).

## Vérifications navigateur

`tools/verify.mjs` teste les six pages à 1440, 768, 390 et 320 px, les filtres, la recherche, le carrousel, les dialogues, les disponibilités, le choix forcé dans les deux modes, le tirage aléatoire, la suppression des notes (doublons, dernière note, erreur de sauvegarde) et la connexion. Les services sont interceptés par des données de démonstration en mémoire : aucun compte ni contenu réel n’est modifié. Les captures de ces tests contiennent des données fictives et ne font pas partie du site livré.

Démarrer le serveur local, puis lancer `node tools/verify.mjs` , `node tools/verify-motion.mjs` et `node tools/verify-screenings.mjs`. Le test des soirées couvre la programmation, la modification, l’annulation, l’indépendance des données, les permissions et la gestion des rôles. Le test des animations vérifie les 15 secondes avec une horloge contrôlée, le parcours de proposition, les animations 3D et l’absence totale d’écritures lors des simulations. `tools/browser-fixture.mjs` fournit les services simulés communs. Ce script nécessite Playwright (il utilise aussi le runtime fourni par Codex lorsqu’il est disponible) et Chrome sous Windows. `CHROME_PATH` permet de choisir un autre exécutable Chromium. Captures dans `tools/screenshots`.

## Visuels

Les affiches et les fiches du catalogue continuent d’utiliser TMDB. Visuel de connexion : anime **Initial D Legend 1 : Awakening**, image promotionnelle de [Prime Video](https://www.primevideo.com/detail/0L30WKYI5J01UBMU9HTGBZQNUT), stockée dans `image/initial-d-legend.jpg`. © Shuichi Shigeno / Kodansha / 2014 Initial D Film Committee. Logos CinePaff fournis par le projet d’origine.


## Annonces Discord des soirées

Chaque création, modification ou annulation de soirée écrit un événement dans Firebase **screeningEvents**, atomiquement avec **screenings**. Le bot divbot publie ces événements dans le salon **1520922784698601644**, avec le film, l'horaire et l'auteur de l'action. Aucun changement n'est apporté aux tirages. Enregistrer une soirée inchangée reste silencieux.

Le relais Python, sa configuration et les instructions d'installation sont dans le projet divbot voisin, fichier **CINEPAFF_SETUP.md**. Il faut publier le site **et** mettre à jour/redémarrer le bot sur son hébergeur. Le jeton Discord ne figure jamais dans le site.

Le test **node tools/verify-discord.mjs** utilise des services simulés et vérifie aussi les échecs d'écriture. Les événements produits sont conservés comme fixture dans tools/fixtures/screening-events.json, hors des fichiers publiés.
