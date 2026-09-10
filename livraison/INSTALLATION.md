# Mise à jour CinePaff + divbot

1. Sur ton hébergeur, arrêter le bot puis extraire **divbot-update.zip** à sa racine et remplacer les fichiers correspondants. Conserver le .env, firebase et les bases de données déjà présents.
2. Lancer `python -m pip install -r requirements.txt`, puis `python -m divbot.cinepaff_check` pour vérifier les accès sans envoyer de message.
3. Redémarrer le bot avec la commande habituelle de ton hébergeur (`python bot.py`). Une seule instance doit tourner. Conserver le nouveau fichier cinepaff.sqlite3 sur un stockage persistant.
4. Publier aussi les fichiers du nouveau site contenus dans **cinepaff-site.zip** (client : fichiers publics ; server : Worker existant), avec ta méthode habituelle.

Les paramètres sont déjà réglés pour le salon **1520922784698601644**. Une création, une modification ou une annulation de soirée y publiera un nouveau message, généralement sous 10 secondes lorsque le relais est connecté. Enregistrer une soirée inchangée reste silencieux.

Le fichier **CINEPAFF_SETUP.md** inclus dans l'archive du bot détaille l'installation, les permissions et la reprise après interruption. Division War n'est plus chargé ; l'ancien division_war.py peut être retiré du serveur, sa base historique peut être conservée.

Vérifications : 34 tests Python réussis ; parcours navigateur des soirées et annonces réussi ; événements du navigateur traités par le bot avec Discord simulé ; build du site valide ; accès Firebase et permissions du salon Discord vérifiés en lecture seule. Aucun message de test n'a été publié.
