# RTF Reporting Tool – Produktionsplan

> Vorgehensweise zur Produktionsreife des RTF Reporting Tools für den Einsatz im Bankenumfeld (Bundesbank-Compliance)

---

## Phase 0: Sofortmaßnahmen – Build stabilisieren (aktuell blockierend)

### 0.1 Node.js-Version fixieren
```bash
nvm install 20
nvm use 20
node --version  # v20.x.x
```

### 0.2 Dependency-Chaos bereinigen
```bash
# Lokale Änderungen durch audit fix --force rückgängig machen
git checkout package.json package-lock.json

# Clean install
rm -rf node_modules
npm install --legacy-peer-deps
```

### 0.3 Dockerfiles anpassen (beide: frontend + backend)
```dockerfile
# Dockerfile.dev – Zeile 20 ändern
RUN npm install --legacy-peer-deps
```

### 0.4 Node-Version im Docker-Image festnageln
```dockerfile
# Statt node:18-alpine → exakte Version verwenden
FROM node:20.19-alpine
```

**Ziel:** `docker-compose up` läuft fehlerfrei durch.

---

## Phase 1: Dependency-Hygiene & Security

### 1.1 Vulnerabilities kontrolliert schließen

| Paket | Severity | Aktion |
|-------|----------|--------|
| `libxmljs2` | **Critical** | Update auf `^0.37.0` in `backend/package.json` |
| `fastify` | High | Update auf `^5.7.4`, API-Kompatibilität prüfen |
| `@fastify/jwt` / `fast-jwt` | Moderate | Update auf `@fastify/jwt@^10.0.0` |
| `tar` / `@mapbox/node-pre-gyp` | High | Nur Build-Zeit, kein Production-Risiko – trotzdem updaten |
| `esbuild` / `vite` | Moderate | Nur Dev-Server, kein Production-Risiko |

**Vorgehen:** Jeden Update einzeln, nicht `audit fix --force` global. Nach jedem Update: Regressionstests.

### 1.2 `.npmrc` für reproduzierbare Builds
```ini
# .npmrc im Repo-Root
engine-strict=true
save-exact=true
legacy-peer-deps=true
```

### 1.3 `npm audit` in CI/CD integrieren
```yaml
# GitHub Actions – Beispiel
- name: Security Audit
  run: npm audit --audit-level=high
```

---

## Phase 2: Secrets & Konfiguration

### 2.1 Hartcodierte Credentials entfernen

Aktuell in `docker-compose.yml` und `.env.example` hartcodiert – das muss weg:

```yaml
# JETZT (unsicher):
POSTGRES_PASSWORD: rtf_password
JWT_SECRET: rtf-jwt-secret-development-key-32chars-min

# ZIEL (sicher):
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
JWT_SECRET: ${JWT_SECRET}
```

### 2.2 Secrets-Management einführen

- **Lokal/Dev:** `.env`-Datei (niemals in Git), `.env.example` als Template im Repo
- **Staging/Prod:** AWS Secrets Manager oder HashiCorp Vault
- **Docker:** Docker Secrets oder Umgebungsvariablen aus Secret-Store

### 2.3 `.gitignore` prüfen
```gitignore
.env
.env.local
.env.production
*.key
*.pem
```

### 2.4 JWT-Secret-Rotation vorbereiten
Mindestens 256-Bit-Secret, kryptographisch zufällig generiert:
```bash
openssl rand -base64 32
```

---

## Phase 3: Production-Dockerfiles erstellen

Aktuell existieren nur `Dockerfile.dev`-Dateien. Für Produktion braucht es Multi-Stage-Builds:

### 3.1 Backend – `backend/Dockerfile`
```dockerfile
# Stage 1: Build
FROM node:20.19-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20.19-alpine AS production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
USER appuser
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### 3.2 Frontend – `frontend/Dockerfile`
```dockerfile
# Stage 1: Build
FROM node:20.19-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### 3.3 `docker-compose.prod.yml` anlegen
Separates Compose-File für Produktion: kein Volume-Mounting des Source-Codes, `NODE_ENV=production`, kein Port-Forwarding für DB/Redis nach außen.

---

## Phase 4: Datenbank & Persistenz

### 4.1 Migrations-Strategie
- Flyway oder `node-pg-migrate` für versionierte DB-Migrationen
- Migrations niemals manuell in Produktion ausführen – immer per Pipeline
- Rollback-Skripte für jede Migration mitliefern

### 4.2 Backup-Strategie
```bash
# PostgreSQL-Backup (täglich, z.B. per AWS RDS Snapshot oder Cron)
pg_dump -Fc rtf_reporting > backup_$(date +%Y%m%d).dump
```

### 4.3 Connection Pooling
PgBouncer vorschalten oder Pool-Limits in `backend/.env` realistisch setzen:
```env
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10   # je nach Last anpassen
```

### 4.4 Redis-Persistenz aktivieren
In `docker-compose.prod.yml`:
```yaml
redis:
  command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
```

---

## Phase 5: Security Hardening

### 5.1 HTTPS erzwingen
- TLS-Terminierung via Nginx Reverse Proxy oder AWS ALB
- HTTP → HTTPS Redirect
- HSTS-Header setzen

### 5.2 Security-Header (bereits Helmet vorhanden – konfigurieren)
```typescript
// backend: Helmet-Konfiguration verschärfen
app.register(helmet, {
  contentSecurityPolicy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});
```

### 5.3 CORS für Production einschränken
```env
# .env.production
CORS_ORIGIN=https://rtf.ihre-domain.de
```

### 5.4 Rate Limiting anpassen
Aktuell 100 Requests / 15 Minuten – für Banken-Compliance eventuell zu großzügig. Auf Endpunkt-Ebene differenzieren (Login strenger als API).

### 5.5 Input-Validierung für XBRL-Uploads
`libxmljs2` XML-Parsing nur für Dateien aus vertrauenswürdigen Quellen, Dateigrößen-Limit einhalten, MIME-Type-Check serverseitig.

---

## Phase 6: Observability

### 6.1 Structured Logging (Winston ist vorhanden – erweitern)
- Log-Level per Umgebungsvariable steuerbar halten
- Correlation-IDs für Request-Tracing
- Logs in ELK Stack oder AWS CloudWatch schreiben

### 6.2 Health-Checks ausbauen
```typescript
// /api/v1/health – detailliertere Antwort
{
  status: "healthy",
  db: "connected",
  redis: "connected",
  version: "1.0.0",
  uptime: 3600
}
```

### 6.3 Metrics
Prometheus-Endpunkt für Fastify (Plugin: `fastify-metrics`) oder AWS CloudWatch Metrics.

### 6.4 Alerting
- DB-Verbindungsfehler → sofort alarmieren
- Login-Fehler-Rate > Schwellwert → Security-Alert
- Disk Space für DB-Volumes → Warnung bei 80%

---

## Phase 7: CI/CD Pipeline

### 7.1 Pipeline-Stufen (GitHub Actions)
```
Push → Lint → Type-Check → Unit Tests → Build → Security Audit → Docker Build → Deploy Staging → Integration Tests → Deploy Prod
```

### 7.2 Branch-Strategie
- `main` → Produktion (geschützt, nur via PR)
- `develop` → Staging
- `feature/*` → Development

### 7.3 Automatisierte Tests ausbauen
Aktuell Mock-Daten im Dashboard – echte Tests schreiben:
- Unit Tests: Geschäftslogik, XBRL-Generierung
- Integration Tests: API-Endpunkte gegen Test-DB
- E2E Tests (Playwright): kritische User-Flows

---

## Phase 8: Compliance & Betrieb (Bundesbank-spezifisch)

### 8.1 Audit-Log sichern
Das `auditLogger` ist vorhanden – sicherstellen dass:
- Logs tamper-proof (append-only, separater Storage)
- Aufbewahrungsfrist gemäß regulatorischen Anforderungen (typisch 5-10 Jahre)
- Logs enthalten keine personenbezogenen Daten über das Notwendige hinaus

### 8.2 Zugriffsrechte / RBAC
Rollen (Analyst, Reviewer, Admin) sind im Datenmodell vorhanden – sicherstellen dass:
- Prinzip der minimalen Rechte umgesetzt
- Rollenwechsel geloggt
- Admin-Aktionen erfordern 4-Augen-Prinzip

### 8.3 Datenschutz
- Passwörter: bcrypt mit mind. 12 Runden (bereits konfiguriert ✓)
- PII in Logs vermeiden
- Datenlöschkonzept für abgelaufene Meldungen

---

## Priorisierte Roadmap

| Priorität | Phase | Aufwand | Begründung |
|-----------|-------|---------|------------|
| 🔴 Sofort | Phase 0 | 1-2h | Build funktioniert nicht |
| 🔴 Sofort | Phase 2 | 2-4h | Credentials im Repo = Sicherheitsrisiko |
| 🟠 Kurzfristig | Phase 1 | 4-8h | Critical Vulnerability in libxmljs2 |
| 🟠 Kurzfristig | Phase 3 | 4-8h | Ohne Production-Dockerfiles kein Deployment |
| 🟡 Mittelfristig | Phase 4+5 | 1-2 Tage | Stabiler Betrieb, Sicherheit |
| 🟡 Mittelfristig | Phase 6+7 | 2-3 Tage | Wartbarkeit, Qualitätssicherung |
| 🟢 Längerfristig | Phase 8 | laufend | Compliance-Dokumentation |
