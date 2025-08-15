# Frontend – HealthMap Senegal

Application web pour explorer les établissements de santé, se connecter, donner des avis et administrer le contenu.

## Stack
- React 18, TypeScript
- Vite, Tailwind CSS
- React Router, Axios, React-Leaflet

## Lancer en local

```bash
npm i
npm run dev
```
URL: http://localhost:5173 (ou 5174)

## Variables / URL API
Le frontend pointe par défaut sur `http://localhost:9000/api` (voir `src/contexts/AuthContext.tsx`).

## Scripts utiles
- npm run dev: mode dev
- npm run build: build de production
- npm run preview: prévisualisation locale du build

## Fonctionnalités
- Carte interactive + filtres (services, types, recherche)
- Authentification (login/register)
- Avis (note + commentaire)
- Dashboards Admin et Tuteur

## Structure
- src/components – UI, cartes, layout
- src/pages – vues (Home, Auth, Dashboards)
- src/services/api.ts – appels API centralisés
- src/contexts/AuthContext.tsx – auth et session
