# Billed App Front-End

## Description

Billed est une application de gestion de notes de frais pour les employés et les administrateurs RH. Ce dépôt contient le code front-end de l'application.

## Prérequis

- Node.js
- npm

## Installation

1. Clonez ce dépôt :
   ```
   git clone https://github.com/0cl0ck/P9-bill-app-front.git
   ```
2. Naviguez dans le dossier du projet :
   ```
   cd P9-bill-app-front
   ```
3. Installez les dépendances :
   ```
   npm install
   ```

## Lancement de l'application

Pour lancer l'application en local :

```
$ live-server
```

L'application sera accessible à l'adresse : `http://127.0.0.1:8080/`

## Backend

Le backend de l'application est nécessaire pour son fonctionnement complet. Pour l'installer et le lancer :

1. Clonez le dépôt backend: https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-back
2. Installez les dépendances :
   ```
   npm install
   ```
3. Lancez le serveur :
   ```
   npm run start
   ```

## Tests

Pour lancer les tests :

```
npm run test
```

## Fonctionnalités

- Connexion des utilisateurs (employés et admin RH)
- Soumission de notes de frais par les employés
- Validation/refus des notes de frais par les admin RH
- Visualisation des notes de frais

## Technologies utilisées

- JavaScript
- Jest pour les tests
