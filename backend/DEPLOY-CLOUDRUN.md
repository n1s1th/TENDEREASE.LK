# Deploying TenderEase to Google Cloud Run

This continues from **Step 5 (Artifact Registry)** of your guide and takes you to a
fully wired set of services. Your `tenderease-500911` project, gcloud CLI, and enabled
APIs are assumed to be in place.

> **What changed vs. the naive guide:** Cloud Run has no Eureka and no internal
> service network, so a plain "push + deploy" leaves services unable to find each
> other. This setup replaces Eureka with the services' real `*.run.app` URLs, points
> the gateway routes at them, and adds an external RabbitMQ (CloudAMQP). Postgres
> (Neon) and Keycloak (Cloud-IAM) are already external, so they need no changes.

---

## 0. One-time prerequisites (outside GCP)

### a) Neon — create one database per service
Each service connects to its own database (`tenderease_<svc>_db`). On your Neon
project, create these 13 databases (owner `neondb_owner`):

```
tenderease_user_db          tenderease_tender_db        tenderease_notification_db
tenderease_reporting_db     tenderease_workflow_db      tenderease_appeal_db
tenderease_bid_db           tenderease_clarification_db tenderease_contract_db
tenderease_document_db      tenderease_evaluation_db    tenderease_payment_db
tenderease_qa_db
```

Quickest way — from any machine with `psql`:

```bash
for db in user tender notification reporting workflow appeal bid \
          clarification contract document evaluation payment qa; do
  psql "postgresql://neondb_owner:PASSWORD@DB_HOST/neondb?sslmode=require" \
       -c "CREATE DATABASE tenderease_${db}_db;"
done
```

### b) CloudAMQP — free RabbitMQ
Create a free **Little Lemur** instance at cloudamqp.com. From its details page copy:
`Host`, `User & Vhost` (same value on the free tier), and `Password`. Port is **5671** (TLS).

---

## 1. Configuration

```bash
cd backend
cp deploy.env.example deploy.env
# edit deploy.env: project, region, Neon password, CloudAMQP host/user/password, CORS origins
gcloud auth login
```

**Region:** `deploy.env` defaults to `asia-southeast1` (Singapore) because it sits next
to your Neon database (ap-southeast-1) — every DB call is faster there than from Mumbai.
Change it if you prefer, but keep it consistent.

---

## 2. The easy path — one script

```bash
./deploy.sh          # setup → build & push → deploy → wire URLs → print URLs
```

Sub-commands if you want to run a stage on its own:

```bash
./deploy.sh setup    # enable APIs, create Artifact Registry, configure docker auth
./deploy.sh build    # build & push all 14 images
./deploy.sh deploy   # deploy backends, discover URLs, wire gateway + peers
./deploy.sh urls     # list deployed service URLs
```

When it finishes, the **api-gateway** URL is your single public entry point. Put that
URL into your frontend, and add the frontend's origin to `ALLOWED_ORIGINS` in
`deploy.env` (then re-run `./deploy.sh deploy`).

---

## 3. The manual path — equivalent commands

If you'd rather run things by hand, here is exactly what the script does.

### Step 5 — Artifact Registry
```bash
gcloud config set project tenderease-500911
gcloud artifacts repositories create tender-images \
  --repository-format=docker --location=asia-southeast1
```

### Step 6 — Docker auth
```bash
gcloud auth configure-docker asia-southeast1-docker.pkg.dev
```

### Step 7 — Build & push (run from `backend/`, repeat per service)
The Dockerfiles use the **backend/ root** as the build context, so pass `-f`:
```bash
REG=asia-southeast1-docker.pkg.dev/tenderease-500911/tender-images
docker build -f tender-service/Dockerfile -t $REG/tender-service:latest .
docker push $REG/tender-service:latest
```
Services to build: `api-gateway`, `user-service`, `tender-service`,
`notification-service`, `reporting-service`, `workflow-service`, `appeal-service`,
`bid-service`, `clarification-service`, `contract-service`, `document-service`,
`evaluation-service`, `payment-service`, `qa-service`.
*(eureka-server is not deployed — it's replaced by direct URLs.)*

### Step 8 — Deploy a backend service (with env)
```bash
gcloud run deploy tender-service \
  --image $REG/tender-service:latest \
  --region asia-southeast1 --allow-unauthenticated \
  --memory 1Gi --cpu 1 \
  --set-env-vars "^##^DB_HOST=...##DB_USERNAME=neondb_owner##DB_PASSWORD=...##\
KEYCLOAK_ISSUER_URI=...##KEYCLOAK_JWK_SET_URI=...##\
RABBITMQ_HOST=...##RABBITMQ_PORT=5671##RABBITMQ_USERNAME=...##RABBITMQ_PASSWORD=...##\
SPRING_RABBITMQ_VIRTUAL_HOST=...##SPRING_RABBITMQ_SSL_ENABLED=true##\
EUREKA_CLIENT_ENABLED=false"
```
> The `^##^` prefix tells gcloud to split env pairs on `##` instead of commas — needed
> because JDBC URLs and CORS lists contain commas.

### Step 9 — Get the assigned URL
```bash
gcloud run services describe tender-service --region asia-southeast1 \
  --format='value(status.url)'
```

### Step 10 — Wire peers (after all backends are up)
```bash
# tender-service needs its peers + its own public URL (for download links)
gcloud run services update tender-service --region asia-southeast1 --update-env-vars \
  "^##^USER_SERVICE_URL=<user-url>##WORKFLOW_SERVICE_URL=<workflow-url>##\
DOCUMENT_SERVICE_URL=<document-url>##APP_PUBLIC_BASE_URL=<tender-url>"

# reporting + document call tender-service directly
gcloud run services update reporting-service --region asia-southeast1 \
  --update-env-vars SERVICES_TENDER_URL=<tender-url>
gcloud run services update document-service --region asia-southeast1 \
  --update-env-vars SERVICES_TENDER_URL=<tender-url>
```

### Step 11 — Deploy the gateway (prod profile + downstream URLs)
```bash
gcloud run deploy api-gateway \
  --image $REG/api-gateway:latest \
  --region asia-southeast1 --allow-unauthenticated --memory 1Gi --cpu 1 \
  --set-env-vars "^##^SPRING_PROFILES_ACTIVE=prod##KEYCLOAK_ISSUER_URI=...##\
USER_SERVICE_URI=<user-url>##TENDER_SERVICE_URI=<tender-url>##\
REPORTING_SERVICE_URI=<reporting-url>##NOTIFICATION_SERVICE_URI=<notif-url>##\
WORKFLOW_SERVICE_URI=<workflow-url>##ALLOWED_ORIGINS=https://your-frontend##\
EUREKA_CLIENT_ENABLED=false"
```

---

## Code changes made for Cloud Run

These were edited so the app works without Eureka. All keep a `localhost` fallback, so
**local `docker compose` still behaves exactly as before.**

| File | Change |
|------|--------|
| `api-gateway/.../application-prod.yml` | **New** prod profile: routes target `*_SERVICE_URI` env vars instead of `lb://`, binds `${PORT}`, disables Eureka, env-driven CORS. |
| `reporting-service/.../KPIService.java` | Hardcoded `http://localhost:8082` → `${services.tender.url}` (env `SERVICES_TENDER_URL`). |
| `document-service/.../TenderClient.java` | Feign client given an explicit `url=${services.tender.url}` so it doesn't need discovery. |
| `tender-service/.../TenderServiceImpl.java` | Document download links use `${app.public-base-url}` (env `APP_PUBLIC_BASE_URL`) instead of `localhost`. |

---

## Notes & gotchas

- **Cold starts.** Spring Boot on scale-to-zero takes ~20–40s to wake. For a snappier
  gateway set `MIN_INSTANCES=1` in `deploy.env` (costs a bit more).
- **`--allow-unauthenticated` blocked?** If your org policy forbids public services,
  the deploy will warn. You'll then need authenticated invocation / a load balancer.
- **Service-to-service auth.** Services are public here for simplicity. To lock them
  down, deploy backends **without** `--allow-unauthenticated` and give the gateway's
  service account the `roles/run.invoker` role on each backend.
- **RabbitMQ TLS.** CloudAMQP requires TLS (port 5671). The env vars set
  `SPRING_RABBITMQ_SSL_ENABLED=true` and the vhost for you.
- **Re-deploys.** Re-running `./deploy.sh` is safe and idempotent. To ship a code
  change: `./deploy.sh build && ./deploy.sh deploy`.
