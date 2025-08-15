# HealthMap Senegal (Monorepo)

Un projet complet pour explorer et administrer les établissements de santé au Sénégal.

- frontend/ Application web (React + Vite + TypeScript + Tailwind)
- backend/ API (Spring Boot + JPA + JWT + OpenAPI)

## Démarrage rapide

1) Backend

```bash
cd backend
mvn spring-boot:run
```
- API: http://localhost:9000/api
- Swagger UI: http://localhost:9000/api/swagger-ui/index.html

2) Frontend

```bash
cd frontend
npm i
npm run dev
```
- Web: http://localhost:5173 (ou 5174)

## Environnements
- Base de données: MySQL (voir backend/src/main/resources/application.properties)
- Authentification: JWT côté backend

## Fonctionnalités clés
- Carte interactive (Leaflet) avec filtres et recherche
- Authentification (login/register), rôles (ADMIN, TUTEUR, STANDARD)
- Tableau de bord Admin (validation/rejet, services, avis)
- Tableau de bord Tuteur (création/mise à jour d’établissement)
- Avis utilisateurs (note + commentaire)

## Déploiement
- Backend: JAR Spring Boot ou conteneur Docker
- Frontend: build statique `npm run build`, à servir via Nginx/Netlify/Vercel

Pour plus de détails, consultez les README dédiés dans `frontend/` et `backend/`.
