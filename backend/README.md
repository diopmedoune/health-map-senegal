# Backend – HealthMap Senegal (Spring Boot)

API REST pour gérer les établissements de santé, services, utilisateurs et avis.

## Prérequis
- Java 17
- Maven 3.9+
- MySQL 8 (base par défaut: `hospital_find`)

## Configuration
Fichier: `src/main/resources/application.properties`
- Port API: `server.port=9000`
- Contexte: `server.servlet.context-path=/api`
- URL JDBC, utilisateur, mot de passe MySQL
- Clé et durée JWT

Exemple à adapter:
```
spring.datasource.url=jdbc:mysql://localhost:3306/hospital_find?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=changeme
```

## Lancer le backend
```bash
mvn spring-boot:run
```
- API: http://localhost:9000/api
- Swagger UI: http://localhost:9000/api/swagger-ui/index.html

## Principales ressources
- Authentification: `/auth/login`, `/auth/register`
- Établissements: `/etablissements`, `/etablissements/admin`, `/tuteur/etablissement`
- Services: `/services`, `/services/create`
- Avis: `/avis`, `/etablissements/{id}/avis`, `/admin/avis/{id}`

Certaines routes nécessitent un rôle (ADMIN, TUTEUR, STANDARD) et un JWT Bearer.

## Packaging
```bash
mvn clean package
```
Exécuter le JAR:
```bash
java -jar target/hospitalFind-0.0.1-SNAPSHOT.jar
```

## Notes
- `spring.jpa.hibernate.ddl-auto=update` pour un dev rapide. Pour la prod, privilégiez des migrations.
- Les logs de sécurité sont activés pour faciliter le debug.
