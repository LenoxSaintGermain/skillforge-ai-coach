# AI SkillForge - Infrastructure Setup Guide

**Complete Infrastructure as Code (IaC) using Terraform and gcloud CLI**

---

## Prerequisites

- GCP account with billing enabled
- `gcloud` CLI installed and configured
- `terraform` v1.5+ installed
- Docker installed (for container builds)
- `kubectl` installed (if using GKE)
- Git repository set up

---

## Infrastructure Overview

```
ai-skillforge-prod/
├── terraform/
│   ├── main.tf              # Main configuration
│   ├── variables.tf         # Input variables
│   ├── outputs.tf           # Output values
│   ├── backend.tf           # State backend config
│   ├── modules/
│   │   ├── networking/      # VPC, subnets, firewall
│   │   ├── cloud-run/       # Cloud Run services
│   │   ├── cloud-sql/       # Database
│   │   ├── storage/         # Cloud Storage buckets
│   │   ├── iam/             # Service accounts & IAM
│   │   ├── monitoring/      # Monitoring & alerting
│   │   └── security/        # Cloud Armor, secrets
│   └── environments/
│       ├── dev/
│       ├── staging/
│       └── prod/
└── scripts/
    ├── deploy-frontend.sh   # Deploy script
    ├── deploy-functions.sh  # Functions deploy
    └── migrate-data.sh      # Data migration
```

---

## Step 1: Bootstrap GCP Project

### 1.1 Create Project and Enable APIs

```bash
#!/bin/bash
# File: scripts/bootstrap-gcp.sh

PROJECT_ID="ai-skillforge-prod"
BILLING_ACCOUNT_ID="YOUR_BILLING_ACCOUNT_ID"
REGION="us-central1"

# Create project
gcloud projects create $PROJECT_ID --name="AI SkillForge Production"

# Link billing
gcloud billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT_ID

# Set as active project
gcloud config set project $PROJECT_ID

# Enable APIs
gcloud services enable \
  cloudresourcemanager.googleapis.com \
  serviceusage.googleapis.com \
  cloudbilling.googleapis.com \
  iam.googleapis.com \
  compute.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  identitytoolkit.googleapis.com \
  firebaseauth.googleapis.com \
  storage-api.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  cloudtrace.googleapis.com

echo "✅ GCP project bootstrapped successfully"
```

Run:
```bash
chmod +x scripts/bootstrap-gcp.sh
./scripts/bootstrap-gcp.sh
```

---

## Step 2: Terraform Setup

### 2.1 Initialize Terraform Backend

```hcl
# File: terraform/backend.tf

terraform {
  backend "gcs" {
    bucket  = "ai-skillforge-terraform-state"
    prefix  = "terraform/state"
  }
  
  required_version = ">= 1.5"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}
```

Create state bucket:
```bash
gsutil mb -p ai-skillforge-prod -c STANDARD -l us-central1 gs://ai-skillforge-terraform-state

# Enable versioning
gsutil versioning set on gs://ai-skillforge-terraform-state
```

### 2.2 Main Configuration

```hcl
# File: terraform/main.tf

provider "google" {
  project = var.project_id
  region  = var.region
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "ai-skillforge-prod"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
  default     = "prod"
}

# Modules
module "networking" {
  source      = "./modules/networking"
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
}

module "iam" {
  source      = "./modules/iam"
  project_id  = var.project_id
  environment = var.environment
}

module "cloud_sql" {
  source      = "./modules/cloud-sql"
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  network_id  = module.networking.vpc_id
}

module "storage" {
  source      = "./modules/storage"
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
}

module "cloud_run" {
  source              = "./modules/cloud-run"
  project_id          = var.project_id
  region              = var.region
  environment         = var.environment
  vpc_connector_name  = module.networking.vpc_connector_name
  service_account     = module.iam.frontend_service_account
}

module "security" {
  source      = "./modules/security"
  project_id  = var.project_id
  environment = var.environment
}

module "monitoring" {
  source      = "./modules/monitoring"
  project_id  = var.project_id
  environment = var.environment
}
```

### 2.3 Networking Module

```hcl
# File: terraform/modules/networking/main.tf

resource "google_compute_network" "vpc" {
  name                    = "${var.environment}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "frontend" {
  name          = "${var.environment}-frontend-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
}

resource "google_compute_subnetwork" "backend" {
  name          = "${var.environment}-backend-subnet"
  ip_cidr_range = "10.0.2.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
}

resource "google_compute_subnetwork" "data" {
  name                     = "${var.environment}-data-subnet"
  ip_cidr_range            = "10.0.3.0/24"
  region                   = var.region
  network                  = google_compute_network.vpc.id
  private_ip_google_access = true
}

resource "google_vpc_access_connector" "connector" {
  name          = "${var.environment}-connector"
  region        = var.region
  network       = google_compute_network.vpc.id
  ip_cidr_range = "10.8.0.0/28"
}

resource "google_compute_firewall" "allow_https" {
  name    = "${var.environment}-allow-https"
  network = google_compute_network.vpc.id

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_firewall" "allow_internal" {
  name    = "${var.environment}-allow-internal"
  network = google_compute_network.vpc.id

  allow {
    protocol = "tcp"
  }

  allow {
    protocol = "udp"
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = ["10.0.0.0/16"]
}

resource "google_compute_global_address" "static_ip" {
  name = "${var.environment}-static-ip"
}

output "vpc_id" {
  value = google_compute_network.vpc.id
}

output "vpc_connector_name" {
  value = google_vpc_access_connector.connector.name
}

output "static_ip" {
  value = google_compute_global_address.static_ip.address
}
```

### 2.4 IAM Module

```hcl
# File: terraform/modules/iam/main.tf

resource "google_service_account" "frontend" {
  account_id   = "${var.environment}-frontend"
  display_name = "Frontend Service Account"
}

resource "google_service_account" "backend" {
  account_id   = "${var.environment}-backend"
  display_name = "Backend Functions Service Account"
}

resource "google_service_account" "db_admin" {
  account_id   = "${var.environment}-db-admin"
  display_name = "Database Admin Service Account"
}

resource "google_project_iam_member" "backend_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_project_iam_member" "backend_vertex_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_project_iam_member" "backend_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

output "frontend_service_account" {
  value = google_service_account.frontend.email
}

output "backend_service_account" {
  value = google_service_account.backend.email
}
```

### 2.5 Cloud SQL Module

```hcl
# File: terraform/modules/cloud-sql/main.tf

resource "google_sql_database_instance" "main" {
  name             = "${var.environment}-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = var.environment == "prod" ? "db-n1-standard-2" : "db-f1-micro"
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    disk_type         = "PD_SSD"
    disk_size         = var.environment == "prod" ? 100 : 10
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = var.environment == "prod"
      backup_retention_settings {
        retained_backups = var.environment == "prod" ? 30 : 7
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network_id
    }

    database_flags {
      name  = "max_connections"
      value = "100"
    }
  }

  deletion_protection = var.environment == "prod"
}

resource "google_sql_database" "database" {
  name     = "skillforge"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "user" {
  name     = "appuser"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

output "connection_name" {
  value = google_sql_database_instance.main.connection_name
}

output "private_ip" {
  value = google_sql_database_instance.main.private_ip_address
}
```

### 2.6 Cloud Run Module

```hcl
# File: terraform/modules/cloud-run/main.tf

resource "google_cloud_run_service" "frontend" {
  name     = "${var.environment}-frontend"
  location = var.region

  template {
    spec {
      service_account_name = var.service_account
      
      containers {
        image = "us-central1-docker.pkg.dev/${var.project_id}/ai-skillforge/frontend:latest"
        
        ports {
          container_port = 8080
        }
        
        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
        
        env {
          name  = "API_BASE_URL"
          value = var.api_base_url
        }
      }
      
      container_concurrency = 80
      timeout_seconds       = 300
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = var.environment == "prod" ? "1" : "0"
        "autoscaling.knative.dev/maxScale" = var.environment == "prod" ? "100" : "10"
        "run.googleapis.com/vpc-access-connector" = var.vpc_connector_name
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.frontend.name
  location = google_cloud_run_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "service_url" {
  value = google_cloud_run_service.frontend.status[0].url
}
```

### 2.7 Storage Module

```hcl
# File: terraform/modules/storage/main.tf

resource "google_storage_bucket" "uploads" {
  name          = "${var.project_id}-${var.environment}-uploads"
  location      = var.region
  force_destroy = var.environment != "prod"

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }

  versioning {
    enabled = true
  }
}

resource "google_storage_bucket" "cache" {
  name          = "${var.project_id}-${var.environment}-cache"
  location      = var.region
  force_destroy = true

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }
}

output "uploads_bucket" {
  value = google_storage_bucket.uploads.name
}

output "cache_bucket" {
  value = google_storage_bucket.cache.name
}
```

---

## Step 3: Deploy Infrastructure

### 3.1 Initialize Terraform

```bash
cd terraform
terraform init
```

### 3.2 Plan Infrastructure

```bash
terraform plan -out=tfplan
```

Review the plan carefully.

### 3.3 Apply Infrastructure

```bash
terraform apply tfplan
```

This will create:
- VPC network with subnets
- Service accounts
- Cloud SQL instance
- Storage buckets
- Cloud Run service (without image initially)
- Firewall rules

### 3.4 Capture Outputs

```bash
terraform output -json > ../outputs.json

# Extract specific values
export STATIC_IP=$(terraform output -raw static_ip)
export DB_CONNECTION=$(terraform output -raw cloud_sql_connection_name)
export FRONTEND_URL=$(terraform output -raw frontend_service_url)

echo "Static IP: $STATIC_IP"
echo "DB Connection: $DB_CONNECTION"
echo "Frontend URL: $FRONTEND_URL"
```

---

## Step 4: Manual Configurations

### 4.1 Set up Artifact Registry

```bash
gcloud artifacts repositories create ai-skillforge \
  --repository-format=docker \
  --location=us-central1 \
  --description="AI SkillForge container images"

# Configure Docker auth
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### 4.2 Set up Secret Manager

```bash
# Create secrets
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --replication-policy="automatic"

# Generate JWT key
openssl rand -base64 32 | gcloud secrets create jwt-signing-key \
  --data-file=- \
  --replication-policy="automatic"

# Grant access to backend service account
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:prod-backend@ai-skillforge-prod.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 4.3 Set up Firebase Authentication

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize Firebase in project
firebase init

# Select:
# - Authentication
# - Project: ai-skillforge-prod

# Enable providers in Firebase Console
echo "Enable Email/Password and Google OAuth in Firebase Console"
echo "https://console.firebase.google.com/project/ai-skillforge-prod/authentication/providers"
```

---

## Step 5: Deploy Application

### 5.1 Build and Push Frontend

```bash
#!/bin/bash
# File: scripts/deploy-frontend.sh

PROJECT_ID="ai-skillforge-prod"
REGION="us-central1"
IMAGE_NAME="us-central1-docker.pkg.dev/$PROJECT_ID/ai-skillforge/frontend"
VERSION=$(git rev-parse --short HEAD)

# Build
docker build -t $IMAGE_NAME:$VERSION \
  --build-arg VITE_GCP_PROJECT_ID=$PROJECT_ID \
  --build-arg VITE_API_BASE_URL=https://api.skillforge.com \
  .

# Tag as latest
docker tag $IMAGE_NAME:$VERSION $IMAGE_NAME:latest

# Push
docker push $IMAGE_NAME:$VERSION
docker push $IMAGE_NAME:latest

# Deploy to Cloud Run
gcloud run deploy ai-skillforge-frontend \
  --image=$IMAGE_NAME:$VERSION \
  --region=$REGION \
  --platform=managed

echo "✅ Frontend deployed: $VERSION"
```

Run:
```bash
chmod +x scripts/deploy-frontend.sh
./scripts/deploy-frontend.sh
```

### 5.2 Deploy Backend Functions

```bash
#!/bin/bash
# File: scripts/deploy-functions.sh

PROJECT_ID="ai-skillforge-prod"
REGION="us-central1"
BACKEND_SA="prod-backend@ai-skillforge-prod.iam.gserviceaccount.com"

FUNCTIONS=(
  "gemini-api"
  "vertex-ai"
  "prompt-engineering-ai"
  "discover-resources"
  "ai-subject-wizard"
)

for func in "${FUNCTIONS[@]}"; do
  echo "Deploying $func..."
  
  cd functions/$func
  
  gcloud functions deploy $func \
    --gen2 \
    --runtime=nodejs20 \
    --region=$REGION \
    --source=. \
    --entry-point=app \
    --trigger-http \
    --allow-unauthenticated \
    --service-account=$BACKEND_SA \
    --set-env-vars=GCP_PROJECT_ID=$PROJECT_ID \
    --set-secrets=GEMINI_API_KEY=gemini-api-key:latest \
    --memory=512MB \
    --timeout=60s
  
  cd ../..
  
  echo "✅ $func deployed"
done

echo "✅ All functions deployed"
```

Run:
```bash
chmod +x scripts/deploy-functions.sh
./scripts/deploy-functions.sh
```

---

## Step 6: Post-Deployment Configuration

### 6.1 Configure Load Balancer

See `DEPLOYMENT_CHECKLIST.md` sections 12-13 for detailed steps.

### 6.2 Set up Monitoring

```bash
# Create uptime check
gcloud monitoring uptime create ai-skillforge-uptime \
  --display-name="AI SkillForge Production" \
  --resource-type=uptime-url \
  --host=skillforge.yourdomain.com \
  --path=/

# Create notification channel
gcloud alpha monitoring channels create \
  --display-name="DevOps Email" \
  --type=email \
  --channel-labels=email_address=devops@yourcompany.com
```

### 6.3 Update DNS

Add A record:
```
skillforge.yourdomain.com A [STATIC_IP]
```

---

## Step 7: Teardown (if needed)

```bash
# Destroy all Terraform-managed resources
cd terraform
terraform destroy

# Delete remaining resources
gcloud projects delete ai-skillforge-prod
```

---

**Infrastructure Setup Guide Version:** 1.0  
**Last Updated:** 2025-01-27
