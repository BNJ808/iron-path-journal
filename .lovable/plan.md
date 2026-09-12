# Simplifier l’entraînement et enrichir le suivi

## Résultat attendu
- Retirer entièrement l’option « Valider une sortie running » de la page Entraînement, tout en conservant le démarrage d’une séance libre.
- Ajouter dans la page Calendrier un bouton « Masquer les plans » / « Afficher les plans » pour libérer de l’espace et mieux visualiser le mois.
- Ajouter à la carte « Suivi du poids » un espace Objectifs permettant d’enregistrer plusieurs poids cibles associés à des dates, de les supprimer et de les afficher comme points distincts sur le graphique.

## Mise en œuvre
- Simplifier la carte de démarrage et son interface afin qu’elle ne dépende plus de la validation running.
- Conserver l’état d’affichage des plans pendant la visite et placer le bouton près des commandes du calendrier.
- Enregistrer les objectifs de poids dans les préférences synchronisées du profil, sans créer de nouvelle table.
- Fusionner mesures et objectifs par date pour le graphique, avec une courbe/points objectifs visuellement distincts et une infobulle claire.
- Respecter la période d’analyse sélectionnée pour les mesures comme pour les objectifs.

## Vérification
- Vérifier le rendu mobile et ordinateur du calendrier ouvert/fermé.
- Vérifier l’ajout, l’affichage, la suppression et la persistance de plusieurs objectifs.
- Vérifier que la page compile sans erreur et que les autres fonctions restent inchangées.
