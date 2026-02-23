#!/bin/bash
# ============================================================================
# SkillForge AI Coach — GCP Sandbox Bootstrap Script
# ============================================================================
# Run this script to set up a new GCP sandbox project from scratch.
# Prerequisites: gcloud CLI installed and authenticated
# Usage: ./scripts/bootstrap-gcp.sh <PROJECT_ID> <BILLING_ACCOUNT_ID>
# ============================================================================

set -euo pipefail

PROJECT_ID="${1:?Usage: $0 <PROJECT_ID> <BILLING_ACCOUNT_ID>}"
BILLING_ACCOUNT_ID="${2:?Usage: $0 <PROJECT_ID> <BILLING_ACCOUNT_ID>}"
REGION="${REGION:-us-central1}"

echo "============================================"
echo "SkillForge GCP Sandbox Bootstrap"
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo "============================================"

# --- Step 1: Create project and link billing ---
echo ""
echo "📦 Step 1: Creating GCP project..."
gcloud projects create "$PROJECT_ID" --name="SkillForge AI Coach Sandbox" 2>/dev/null || echo "Project already exists"
gcloud billing projects link "$PROJECT_ID" --billing-account="$BILLING_ACCOUNT_ID"
gcloud config set project "$PROJECT_ID"

# --- Step 2: Enable required APIs ---
echo ""
echo "🔌 Step 2: Enabling 23 required APIs..."
gcloud services enable \
  cloudresourcemanager.googleapis.com \
  serviceusage.googleapis.com \
  iam.googleapis.com \
  compute.googleapis.com \
  run.googleapis.com \
  cloudfunctions.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  identitytoolkit.googleapis.com \
  firebase.googleapis.com \
  storage-api.googleapis.com \
  storage-component.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  cloudtrace.googleapis.com \
  vpcaccess.googleapis.com \
  servicenetworking.googleapis.com \
  containeranalysis.googleapis.com

# --- Step 3: Create service accounts ---
echo ""
echo "🔑 Step 3: Creating service accounts..."

# Backend service account (for Cloud Run Functions)
gcloud iam service-accounts create skillforge-backend \
  --display-name="SkillForge Backend Functions" \
  --description="Service account for Cloud Run Functions (AI, DB access)" 2>/dev/null || true

# Frontend service account (for Cloud Run)
gcloud iam service-accounts create skillforge-frontend \
  --display-name="SkillForge Frontend Service" \
  --description="Service account for frontend Cloud Run container" 2>/dev/null || true

# Build service account (for CI/CD)
gcloud iam service-accounts create skillforge-build \
  --display-name="SkillForge CI/CD Build" \
  --description="Service account for Cloud Build pipeline" 2>/dev/null || true

BACKEND_SA="skillforge-backend@${PROJECT_ID}.iam.gserviceaccount.com"
BUILD_SA="skillforge-build@${PROJECT_ID}.iam.gserviceaccount.com"

# --- Step 4: Assign IAM roles ---
echo ""
echo "🛡️ Step 4: Assigning IAM roles..."

# Backend service account roles
BACKEND_ROLES=(
  "roles/cloudsql.client"
  "roles/aiplatform.user"
  "roles/secretmanager.secretAccessor"
  "roles/storage.objectViewer"
  "roles/storage.objectCreator"
  "roles/iam.serviceAccountTokenCreator"
  "roles/logging.logWriter"
  "roles/cloudtrace.agent"
  "roles/monitoring.metricWriter"
)

for role in "${BACKEND_ROLES[@]}"; do
  echo "  → $role → backend SA"
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$BACKEND_SA" \
    --role="$role" \
    --quiet 2>/dev/null
done

# Build service account roles
BUILD_ROLES=(
  "roles/cloudbuild.builds.builder"
  "roles/artifactregistry.writer"
  "roles/run.admin"
  "roles/cloudfunctions.admin"
  "roles/iam.serviceAccountUser"
)

for role in "${BUILD_ROLES[@]}"; do
  echo "  → $role → build SA"
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$BUILD_SA" \
    --role="$role" \
    --quiet 2>/dev/null
done

# --- Step 5: Create Artifact Registry ---
echo ""
echo "📦 Step 5: Creating Artifact Registry..."
gcloud artifacts repositories create skillforge \
  --repository-format=docker \
  --location="$REGION" \
  --description="SkillForge container images" 2>/dev/null || true

gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# --- Step 6: Create Terraform state bucket ---
echo ""
echo "🗄️ Step 6: Creating Terraform state bucket..."
gsutil mb -p "$PROJECT_ID" -c STANDARD -l "$REGION" \
  "gs://${PROJECT_ID}-terraform-state" 2>/dev/null || true
gsutil versioning set on "gs://${PROJECT_ID}-terraform-state"

# --- Step 7: Create Cloud SQL instance (sandbox tier) ---
echo ""
echo "🗃️ Step 7: Creating Cloud SQL instance (this takes ~5 minutes)..."
gcloud sql instances create skillforge-sandbox-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region="$REGION" \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup-start-time="03:00" \
  --availability-type=ZONAL \
  --no-assign-ip 2>/dev/null || echo "Cloud SQL instance already exists"

# Create database
gcloud sql databases create skillforge \
  --instance=skillforge-sandbox-db 2>/dev/null || true

# --- Step 8: Print summary ---
echo ""
echo "============================================"
echo "✅ GCP Sandbox Bootstrap Complete!"
echo "============================================"
echo ""
echo "Project ID:     $PROJECT_ID"
echo "Region:         $REGION"
echo "Backend SA:     $BACKEND_SA"
echo "Build SA:       $BUILD_SA"
echo "Artifact Reg:   ${REGION}-docker.pkg.dev/${PROJECT_ID}/skillforge"
echo "Cloud SQL:      skillforge-sandbox-db"
echo "TF State:       gs://${PROJECT_ID}-terraform-state"
echo ""
echo "Next steps:"
echo "  1. Run the consolidated schema migration:"
echo "     gcloud sql connect skillforge-sandbox-db --database=skillforge < migrations/consolidated_schema.sql"
echo "  2. Set up Firebase Auth in the Firebase Console"
echo "  3. Create secrets in Secret Manager:"
echo "     echo -n 'YOUR_KEY' | gcloud secrets create gemini-api-key --data-file=-"
echo "  4. Deploy functions: ./scripts/deploy-functions.sh"
echo ""
