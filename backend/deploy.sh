#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# TenderEase — build & deploy all microservices to Google Cloud Run
#
#   1. cp deploy.env.example deploy.env   # then fill in real values
#   2. gcloud auth login                  # once
#   3. ./deploy.sh                        # full pipeline
#
# Sub-commands (optional):
#   ./deploy.sh setup     # APIs + Artifact Registry + docker auth
#   ./deploy.sh build     # build & push images only
#   ./deploy.sh deploy    # deploy + wire service URLs only
#   ./deploy.sh urls      # print the deployed service URLs
#
# Run from the backend/ directory (the Docker build context).
# ──────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(dirname "$0")"

# ── Load config ───────────────────────────────────────────────
if [[ ! -f deploy.env ]]; then
  echo "ERROR: deploy.env not found. Run: cp deploy.env.example deploy.env  (then edit it)"
  exit 1
fi
# shellcheck disable=SC1091
set -a; source ./deploy.env; set +a

: "${PROJECT_ID:?set in deploy.env}"
: "${REGION:?set in deploy.env}"
: "${REPO:?set in deploy.env}"
MEMORY="${MEMORY:-1Gi}"; CPU="${CPU:-1}"
MIN_INSTANCES="${MIN_INSTANCES:-0}"; MAX_INSTANCES="${MAX_INSTANCES:-2}"

REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}"

# Eureka is replaced by direct URLs on Cloud Run → disable the clients everywhere.
EUREKA_OFF="EUREKA_CLIENT_ENABLED=false##EUREKA_CLIENT_REGISTER_WITH_EUREKA=false##EUREKA_CLIENT_FETCH_REGISTRY=false"

# DB + Keycloak + RabbitMQ shared by every business service.
COMMON_ENV="DB_HOST=${DB_HOST}##DB_PORT=${DB_PORT:-5432}##DB_USERNAME=${DB_USERNAME}##DB_PASSWORD=${DB_PASSWORD}"
COMMON_ENV+="##KEYCLOAK_ISSUER_URI=${KEYCLOAK_ISSUER_URI}##KEYCLOAK_JWK_SET_URI=${KEYCLOAK_JWK_SET_URI}"
COMMON_ENV+="##RABBITMQ_HOST=${RABBITMQ_HOST}##RABBITMQ_PORT=${RABBITMQ_PORT:-5671}##RABBITMQ_USERNAME=${RABBITMQ_USERNAME}##RABBITMQ_PASSWORD=${RABBITMQ_PASSWORD}"
COMMON_ENV+="##SPRING_RABBITMQ_VIRTUAL_HOST=${RABBITMQ_VHOST:-${RABBITMQ_USERNAME}}##SPRING_RABBITMQ_SSL_ENABLED=${RABBITMQ_SSL:-true}"
COMMON_ENV+="##${EUREKA_OFF}"

# Services that own a database / are deployed as backends (NOT eureka, NOT the gateway).
BACKEND_SERVICES=(
  user-service tender-service notification-service reporting-service workflow-service
  appeal-service bid-service clarification-service contract-service document-service
  evaluation-service payment-service qa-service
)
# Full build list also includes the gateway. (eureka-server is intentionally excluded.)
ALL_SERVICES=(api-gateway "${BACKEND_SERVICES[@]}")

log() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }

svc_url() { gcloud run services describe "$1" --region "$REGION" --format='value(status.url)' 2>/dev/null; }

# ── setup: APIs, Artifact Registry, docker auth ──────────────
do_setup() {
  log "Setting project → $PROJECT_ID"
  gcloud config set project "$PROJECT_ID" >/dev/null

  log "Enabling required APIs"
  gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

  log "Creating Artifact Registry repo '$REPO' in $REGION (skip if exists)"
  if ! gcloud artifacts repositories describe "$REPO" --location "$REGION" >/dev/null 2>&1; then
    gcloud artifacts repositories create "$REPO" \
      --repository-format=docker --location "$REGION" \
      --description="TenderEase service images"
  else
    echo "  already exists ✓"
  fi

  log "Configuring Docker auth for ${REGION}-docker.pkg.dev"
  gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
}

# ── build: build + tag + push every image ────────────────────
do_build() {
  for svc in "${ALL_SERVICES[@]}"; do
    log "Building $svc"
    # Build context is the backend/ root; each service has its own Dockerfile.
    docker build -f "${svc}/Dockerfile" -t "${REGISTRY}/${svc}:latest" .
    log "Pushing $svc"
    docker push "${REGISTRY}/${svc}:latest"
  done
}

# ── deploy: deploy backends, discover URLs, wire them up ─────
do_deploy() {
  # Phase A — deploy every backend with the shared env.
  for svc in "${BACKEND_SERVICES[@]}"; do
    log "Deploying $svc"
    gcloud run deploy "$svc" \
      --image "${REGISTRY}/${svc}:latest" \
      --region "$REGION" --platform managed --allow-unauthenticated \
      --memory "$MEMORY" --cpu "$CPU" \
      --min-instances "$MIN_INSTANCES" --max-instances "$MAX_INSTANCES" \
      --set-env-vars "^##^${COMMON_ENV}"
  done

  # Phase B — discover the URLs Cloud Run assigned.
  log "Discovering service URLs"
  declare -A URL
  for svc in "${BACKEND_SERVICES[@]}"; do
    URL[$svc]="$(svc_url "$svc")"
    echo "  $svc → ${URL[$svc]}"
  done

  # Phase C — patch inter-service URLs now that they're known.
  log "Wiring inter-service URLs"
  gcloud run services update tender-service --region "$REGION" --update-env-vars \
    "^##^USER_SERVICE_URL=${URL[user-service]}##WORKFLOW_SERVICE_URL=${URL[workflow-service]}##DOCUMENT_SERVICE_URL=${URL[document-service]}##APP_PUBLIC_BASE_URL=${URL[tender-service]}"

  gcloud run services update reporting-service --region "$REGION" --update-env-vars \
    "SERVICES_TENDER_URL=${URL[tender-service]}"

  gcloud run services update document-service --region "$REGION" --update-env-vars \
    "SERVICES_TENDER_URL=${URL[tender-service]}"

  # Phase D — deploy the gateway with the prod profile + downstream URLs.
  log "Deploying api-gateway (prod profile)"
  gcloud run deploy api-gateway \
    --image "${REGISTRY}/api-gateway:latest" \
    --region "$REGION" --platform managed --allow-unauthenticated \
    --memory "$MEMORY" --cpu "$CPU" \
    --min-instances "${MIN_INSTANCES}" --max-instances "$MAX_INSTANCES" \
    --set-env-vars "^##^SPRING_PROFILES_ACTIVE=prod##KEYCLOAK_ISSUER_URI=${KEYCLOAK_ISSUER_URI}##USER_SERVICE_URI=${URL[user-service]}##TENDER_SERVICE_URI=${URL[tender-service]}##REPORTING_SERVICE_URI=${URL[reporting-service]}##NOTIFICATION_SERVICE_URI=${URL[notification-service]}##WORKFLOW_SERVICE_URI=${URL[workflow-service]}##ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-http://localhost:3000}##${EUREKA_OFF}"
}

do_urls() {
  log "Deployed services"
  for svc in "${ALL_SERVICES[@]}"; do
    printf '  %-22s %s\n' "$svc" "$(svc_url "$svc")"
  done
}

case "${1:-all}" in
  setup)  do_setup ;;
  build)  do_build ;;
  deploy) do_deploy ;;
  urls)   do_urls ;;
  all)    do_setup; do_build; do_deploy; do_urls
          log "Done. Your API entry point is the api-gateway URL above." ;;
  *) echo "Usage: ./deploy.sh [setup|build|deploy|urls|all]"; exit 1 ;;
esac
