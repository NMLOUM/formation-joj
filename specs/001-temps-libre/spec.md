# 001 — Que faire avec mon temps libre

**Statut** : Implémentée
**PRD** : specs/prd-guide-dakar.md, TR1

## Contexte

Un visiteur qui découvre Dakar a quelques heures libres entre deux épreuves, près de son site d'épreuve. Il ne sait pas ce qui est proche ni ce qu'il a le temps de faire avant de revenir. Cette tranche lui montre les lieux autour de son site, et met en bas ceux qu'il n'a pas le temps de visiter.

## User stories

- En tant que visiteur entre deux épreuves, je veux choisir mon site d'épreuve et mon temps libre, afin de voir les lieux les plus proches avec leur temps de trajet.
- En tant que visiteur, je veux que les lieux que je n'ai pas le temps de visiter, trajet compris, passent en bas de liste, afin de ne pas rater ma prochaine épreuve.
- En tant que visiteur sur mon téléphone, je veux faire ces deux choix sur un seul écran simple, afin de trouver quoi faire en moins d'une minute.

## L'écran

Le visiteur choisit son site d'épreuve dans une liste (Dakar, Diamniadio, Saly) et son temps libre parmi trois boutons (1 h, 2 h, 3 h). La liste des lieux s'affiche alors : pour chaque lieu, son nom, sa distance, son temps de trajet et sa durée de visite. Un lieu qui ne tient pas porte la mention « Pas le temps ». Tant que le site n'est pas choisi, l'écran invite à le choisir.

## Scénarios d'acceptation

Dans les exemples, le temps de trajet est estimé à 20 km/h à vol d'oiseau : 1 km prend 3 minutes. Autour de Diamniadio se trouvent trois lieux : A à 2 km (visite de 30 min), B à 4 km (visite de 90 min), C à 6 km (visite de 20 min).

### AS1 — Les lieux sont triés du plus proche au plus loin

- **Étant donné** le site Diamniadio et les lieux A, B et C
- **Quand** le visiteur choisit Diamniadio et 3 h de temps libre
- **Alors** il voit A (2 km, 6 min de trajet), puis B (4 km, 12 min), puis C (6 km, 18 min), tous marqués comme tenant dans son temps libre

### AS2 — Un lieu qui ne tient pas dans le temps libre passe en bas

- **Étant donné** le site Diamniadio et les lieux A, B et C
- **Quand** le visiteur choisit Diamniadio et 1 h de temps libre
- **Alors** il voit A (6 + 30 + 6 = 42 min), puis C (18 + 20 + 18 = 56 min), puis B en bas de liste, marqué comme ne tenant pas (12 + 90 + 12 = 114 min, plus que 60)

### AS3 — Un site d'épreuve inconnu est refusé

- **Étant donné** aucun site d'épreuve nommé « Thiès »
- **Quand** le visiteur demande les lieux autour de « Thiès »
- **Alors** la demande est refusée : 404, code `SITE_NOT_FOUND`

### AS4 — Un temps libre autre que 1, 2 ou 3 h est refusé

- **Étant donné** le site Diamniadio
- **Quand** le visiteur demande les lieux pour 4 h de temps libre
- **Alors** la demande est refusée : 400, avec le temps libre désigné comme champ en cause

## Hors périmètre

- Filtre par catégorie, fiche d'un lieu, bouton « Y aller » (TR2 et TR3).
- Géolocalisation du visiteur, carte, animations des Jeux.
- Temps de trajet réel (circulation, transports) : seule l'estimation à 20 km/h compte.
- Saisie ou modification des lieux : ils viennent d'une liste préparée par l'équipe.

## Questions ouvertes

- Un lieu dont aller, visite et retour font exactement le temps libre tient-il ? Hypothèse : oui.
- Comment arrondir le temps de trajet ? Hypothèse : à la minute supérieure.
- Les lieux qui ne tiennent pas sont-ils triés entre eux ? Hypothèse : oui, du plus proche au plus loin.
- La durée de visite conseillée de chaque lieu vient de la liste préparée par l'équipe.
