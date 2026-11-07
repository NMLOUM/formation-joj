# PRD — Guide touristique de Dakar (Dakar Escale)

**Statut** : Validé

## Problème

Des milliers de visiteurs viennent à Dakar pour les Jeux, souvent pour la première fois, avec quelques heures libres entre deux épreuves. Ils ne savent pas quoi faire ni où : rien ne leur dit ce qui est proche et ce qu'ils ont le temps de faire avant la prochaine épreuve. Ils perdent leur temps libre, ou partent trop loin et ratent leur épreuve.

## Utilisateurs

- Supporter ou visiteur qui découvre Dakar, entre deux épreuves sur un site (Dakar, Diamniadio, Saly) : savoir ce qu'il peut faire près de ce site avec le temps dont il dispose.

## Proposition

Le visiteur choisit son site d'épreuve et son temps libre ; l'application lui montre les lieux à visiter autour, du plus proche au plus loin, et met en bas ceux qu'il n'a pas le temps de faire. C'est simple et explicable, et contrairement à une application de cartes, elle tient compte du temps libre.

## Mesure du succès

En démo : depuis Diamniadio avec 1 h de libre, le lieu le plus proche apparaît en tête de liste, et un lieu trop loin pour un aller-retour dans l'heure passe en bas.

## Tranches

### TR1 — Que faire avec mon temps libre

Le visiteur choisit son site d'épreuve et son temps libre (1 h, 2 h ou 3 h) ; il voit les lieux triés du plus proche au plus loin. Un lieu qui ne tient pas dans ce délai, trajet aller et retour compris, passe en bas de liste.

### TR2 — Filtrer les lieux par catégorie : culture, plages, restaurants, marchés

### TR3 — La fiche d'un lieu montre sa description, ses horaires et son prix, avec un bouton « Y aller »

## Hors périmètre

- Réservation et paiement, billetterie des épreuves, réseau social, guide hors de Dakar.
- Reporté après le MVP : géolocalisation et carte, animations des Jeux et filtre « maintenant », éditeur et annulations, anglais, favoris, hors ligne, « à ne pas manquer ».

## Hypothèses et risques

- Supposé : les lieux et les sites d'épreuve viennent d'une liste préparée et vérifiée par l'équipe (une dizaine de lieux suffit pour la démo).
- Supposé : le temps de trajet est estimé à partir de la distance à vol d'oiseau et d'une vitesse moyenne fixe ; s'il est trop optimiste, un lieu affiché comme faisable ne l'est pas.
- Risque : des horaires périmés envoient un visiteur vers un lieu fermé.
