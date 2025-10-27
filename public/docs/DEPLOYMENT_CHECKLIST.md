# AI SkillForge - GCP Deployment Checklist

## Pre-Deployment Phase

### 1. GCP Project Setup

- [ ] **Create GCP Project**
  ```bash
  gcloud projects create ai-skillforge-prod --name="AI SkillForge Production"
  gcloud config set project ai-skillforge-prod
  ```

- [ ] **Enable Required APIs**
  ```bash
  gcloud services enable \
    run.googleapis.com \
    sqladmin.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    compute.googleapis.com \
    cloudresourcemanager.googleapis.com \
    iam.googleapis.com \
    secretmanager.googleapis.com \
    aiplatform.googleapis.com \
    identitytoolkit.googleapis.com \
    firebaseauth.googleapis.com \
    storage-api.googleapis.com \
    logging.googleapis.com \
    monitoring.googleapis.com
  ```

- [ ] **Set up Billing Account**
  ```bash
  gcloud billing projects link ai-skillforge-prod \
    --billing-account=YOUR_BILLING_ACCOUNT_ID
  ```

- [ ] **Configure Budget Alerts**
  - Navigate to: Billing → Budgets & alerts
  - Create budget: $500/month
  - Alert thresholds: 50%, 90%, 100%
  - Email notifications to: devops@yourcompany.com

- [ ] **Request Quota Increases** (if needed)
  - Cloud Run: 100 instances per region
  - Cloud SQL: 10 instances
  - Vertex AI: 300 requests/minute

### 2. IAM & Service Accounts

- [ ] **Create Service Accounts**
  ```bash
  # Frontend service account
  gcloud iam service-accounts create ai-skillforge-frontend \
    --display-name="AI SkillForge Frontend"
  
  # Backend functions service account
  gcloud iam service-accounts create ai-skillforge-backend \
    --display-name="AI SkillForge Backend Functions"
  
  # Cloud SQL service account
  gcloud iam service-accounts create ai-skillforge-db \
    --display-name="AI SkillForge Database Admin"
  
  # CI/CD service account
  gcloud iam service-accounts create ai-skillforge-cicd \
    --display-name="AI SkillForge CI/CD"
  ```

- [ ] **Assign IAM Roles**
  ```bash
  # Frontend
  gcloud projects add-iam-policy-binding ai-skillforge-prod \
    --member="serviceAccount:ai-skillforge-frontend@ai-skillforge-prod.iam.gserviceaccount.com" \
    --role="roles/run.invoker"
  
  # Backend
  gcloud projects add-iam-policy-binding ai-skillforge-prod \
    --member="serviceAccount:ai-skillforge-backend@ai-skillforge-prod.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"
  
  gcloud projects add-iam-policy-binding ai-skillforge-prod \
    --member="serviceAccount:ai-skillforge-backend@ai-skillforge-prod.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"
  
  gcloud projects add-iam-policy-binding ai-skillforge-prod \
    --member="serviceAccount:ai-skillforge-backend@ai-skillforge-prod.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
  
  # CI/CD
  gcloud projects add-iam-policy-binding ai-skillforge-prod \
    --member="serviceAccount:ai-skillforge-cicd@ai-skillforge-prod.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.builder"
  
  gcloud projects add-iam-policy-binding ai-skillforge-prod \
    --member="serviceAccount:ai-skillforge-cicd@ai-skillforge-prod.iam.gserviceaccount.com" \
    --role="roles/run.admin"
  ```

- [ ] **Download Service Account Keys** (for local development)
  ```bash
  gcloud iam service-accounts keys create ~/ai-skillforge-backend-key.json \
    --iam-account=ai-skillforge-backend@ai-skillforge-prod.iam.gserviceaccount.com
  ```

### 3. Networking Setup

- [ ] **Create VPC Network**
  ```bash
  gcloud compute networks create ai-skillforge-vpc \
    --subnet-mode=custom \
    --bgp-routing-mode=regional
  ```

- [ ] **Create Subnets**
  ```bash
  # Frontend subnet
  gcloud compute networks subnets create frontend-subnet \
    --network=ai-skillforge-vpc \
    --region=us-central1 \
    --range=10.0.1.0/24
  
  # Backend subnet
  gcloud compute networks subnets create backend-subnet \
    --network=ai-skillforge-vpc \
    --region=us-central1 \
    --range=10.0.2.0/24
  
  # Data subnet (private)
  gcloud compute networks subnets create data-subnet \
    --network=ai-skillforge-vpc \
    --region=us-central1 \
    --range=10.0.3.0/24 \
    --enable-private-ip-google-access
  ```

- [ ] **Create VPC Connector** (for Cloud Run to VPC access)
  ```bash
  gcloud compute networks vpc-access connectors create ai-skillforge-connector \
    --network=ai-skillforge-vpc \
    --region=us-central1 \
    --range=10.8.0.0/28
  ```

- [ ] **Configure Firewall Rules**
  ```bash
  # Allow HTTPS from anywhere
  gcloud compute firewall-rules create allow-https \
    --network=ai-skillforge-vpc \
    --allow=tcp:443 \
    --source-ranges=0.0.0.0/0
  
  # Allow internal traffic
  gcloud compute firewall-rules create allow-internal \
    --network=ai-skillforge-vpc \
    --allow=tcp,udp,icmp \
    --source-ranges=10.0.0.0/16
  
  # Allow SSH for admin (optional)
  gcloud compute firewall-rules create allow-ssh-iap \
    --network=ai-skillforge-vpc \
    --allow=tcp:22 \
    --source-ranges=35.235.240.0/20
  ```

- [ ] **Reserve Static IP Address**
  ```bash
  gcloud compute addresses create ai-skillforge-ip \
    --global \
    --ip-version=IPV4
  
  # Get the IP
  gcloud compute addresses describe ai-skillforge-ip --global
  ```

### 4. Secret Manager Setup

- [ ] **Create Secrets**
  ```bash
  # Gemini API Key
  echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic"
  
  # Database connection string
  echo -n "postgresql://user:pass@host:5432/dbname" | gcloud secrets create db-connection-string \
    --data-file=- \
    --replication-policy="automatic"
  
  # JWT signing key
  openssl rand -base64 32 | gcloud secrets create jwt-signing-key \
    --data-file=- \
    --replication-policy="automatic"
  
  # OAuth client secrets (if needed)
  echo -n "YOUR_GOOGLE_OAUTH_SECRET" | gcloud secrets create google-oauth-secret \
    --data-file=- \
    --replication-policy="automatic"
  ```

- [ ] **Grant Secret Access**
  ```bash
  gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:ai-skillforge-backend@ai-skillforge-prod.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
  
  gcloud secrets add-iam-policy-binding db-connection-string \
    --member="serviceAccount:ai-skillforge-backend@ai-skillforge-prod.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
  ```

---

## Database Migration Phase

### 5. Cloud SQL Provisioning

- [ ] **Create Cloud SQL Instance**
  ```bash
  gcloud sql instances create ai-skillforge-db \
    --database-version=POSTGRES_15 \
    --tier=db-n1-standard-2 \
    --region=us-central1 \
    --network=projects/ai-skillforge-prod/global/networks/ai-skillforge-vpc \
    --no-assign-ip \
    --enable-bin-log \
    --backup-start-time=03:00 \
    --availability-type=REGIONAL \
    --storage-type=SSD \
    --storage-size=100GB \
    --storage-auto-increase
  ```

- [ ] **Create Database**
  ```bash
  gcloud sql databases create skillforge \
    --instance=ai-skillforge-db
  ```

- [ ] **Create Database User**
  ```bash
  gcloud sql users create appuser \
    --instance=ai-skillforge-db \
    --password=STRONG_PASSWORD_HERE
  ```

- [ ] **Get Connection Name**
  ```bash
  gcloud sql instances describe ai-skillforge-db \
    --format='value(connectionName)'
  # Output: ai-skillforge-prod:us-central1:ai-skillforge-db
  ```

### 6. Schema Migration

- [ ] **Export Supabase Schema**
  ```bash
  # From Supabase dashboard: Settings → Database → Connection string
  pg_dump -h db.xxx.supabase.co -U postgres -d postgres \
    --schema-only \
    --no-owner \
    --no-privileges \
    -f supabase_schema.sql
  ```

- [ ] **Clean Schema for Cloud SQL**
  - Remove Supabase-specific extensions
  - Remove `auth` schema references
  - Update `auth.users` references to `profiles.user_id`
  - Convert RLS policies to application-level checks (or manual policies)

- [ ] **Import Schema to Cloud SQL**
  ```bash
  # Connect via Cloud SQL Proxy
  ./cloud_sql_proxy -instances=ai-skillforge-prod:us-central1:ai-skillforge-db=tcp:5432 &
  
  # Import schema
  psql -h 127.0.0.1 -U appuser -d skillforge -f cleaned_schema.sql
  ```

- [ ] **Verify Schema**
  ```sql
  -- Connect to Cloud SQL
  psql -h 127.0.0.1 -U appuser -d skillforge
  
  -- Check tables
  \dt
  
  -- Check specific tables
  SELECT COUNT(*) FROM profiles;
  SELECT COUNT(*) FROM subjects;
  SELECT COUNT(*) FROM user_roles;
  ```

### 7. Data Migration

- [ ] **Export Data from Supabase**
  ```bash
  # Export all tables
  pg_dump -h db.xxx.supabase.co -U postgres -d postgres \
    --data-only \
    --no-owner \
    --no-privileges \
    --table=public.* \
    -f supabase_data.sql
  ```

- [ ] **Clean Data Export**
  - Remove `auth.users` data (migrate separately to Identity Platform)
  - Update any hardcoded URLs or references
  - Verify data integrity

- [ ] **Import Data to Cloud SQL**
  ```bash
  psql -h 127.0.0.1 -U appuser -d skillforge -f cleaned_data.sql
  ```

- [ ] **Verify Data Integrity**
  ```sql
  -- Row counts should match Supabase
  SELECT 'profiles' as table_name, COUNT(*) FROM profiles
  UNION ALL
  SELECT 'subjects', COUNT(*) FROM subjects
  UNION ALL
  SELECT 'user_roles', COUNT(*) FROM user_roles
  UNION ALL
  SELECT 'syllabus_sections', COUNT(*) FROM syllabus_sections
  UNION ALL
  SELECT 'user_progress', COUNT(*) FROM user_progress
  UNION ALL
  SELECT 'content_cache', COUNT(*) FROM content_cache;
  ```

- [ ] **Migrate User Authentication Data**
  - Export users from Supabase Auth
  - Import to Firebase Authentication
  - Maintain UUID consistency
  - Verify email addresses and OAuth connections

### 8. RLS Policy Conversion

- [ ] **Document Existing RLS Policies**
  ```sql
  -- From Supabase
  SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE schemaname = 'public';
  ```

- [ ] **Choose RLS Strategy**
  - [ ] Option 1: Application-level security (recommended)
  - [ ] Option 2: Manual PostgreSQL RLS policies
  - [ ] Option 3: Hybrid approach

- [ ] **Implement Application-Level Security**
  - Update all Cloud Run Functions to filter by `user_id`
  - Verify JWT token in all authenticated endpoints
  - Add middleware for authorization checks

- [ ] **Test Authorization**
  - [ ] Users can only see their own data
  - [ ] Admins can see all data
  - [ ] Public data is accessible without auth
  - [ ] Unauthorized access is blocked

---

## Application Containerization Phase

### 9. Frontend Containerization

- [ ] **Create Dockerfile**
  ```dockerfile
  # File: Dockerfile
  FROM node:20-alpine AS builder
  
  WORKDIR /app
  
  COPY package*.json ./
  RUN npm ci --only=production
  
  COPY . .
  
  # Build environment variables
  ARG VITE_GCP_PROJECT_ID
  ARG VITE_API_BASE_URL
  ARG VITE_FIREBASE_API_KEY
  ARG VITE_FIREBASE_AUTH_DOMAIN
  
  ENV VITE_GCP_PROJECT_ID=$VITE_GCP_PROJECT_ID
  ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
  ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
  ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
  
  RUN npm run build
  
  # Production stage
  FROM nginx:alpine
  
  COPY --from=builder /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/nginx.conf
  
  EXPOSE 8080
  
  CMD ["nginx", "-g", "daemon off;"]
  ```

- [ ] **Create nginx.conf**
  ```nginx
  events {
    worker_connections 1024;
  }
  
  http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
      listen 8080;
      server_name _;
      
      root /usr/share/nginx/html;
      index index.html;
      
      # Gzip compression
      gzip on;
      gzip_types text/css application/javascript application/json image/svg+xml;
      gzip_min_length 1000;
      
      # Security headers
      add_header X-Frame-Options "SAMEORIGIN" always;
      add_header X-Content-Type-Options "nosniff" always;
      add_header X-XSS-Protection "1; mode=block" always;
      add_header Referrer-Policy "no-referrer-when-downgrade" always;
      
      # Cache static assets
      location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
      }
      
      # SPA routing
      location / {
        try_files $uri $uri/ /index.html;
      }
    }
  }
  ```

- [ ] **Create .dockerignore**
  ```
  node_modules
  dist
  .git
  .env
  *.md
  ```

- [ ] **Build Docker Image Locally**
  ```bash
  docker build -t ai-skillforge-frontend:latest \
    --build-arg VITE_GCP_PROJECT_ID=ai-skillforge-prod \
    --build-arg VITE_API_BASE_URL=https://api.skillforge.com \
    .
  ```

- [ ] **Test Locally**
  ```bash
  docker run -p 8080:8080 ai-skillforge-frontend:latest
  # Visit http://localhost:8080
  ```

- [ ] **Create Artifact Registry Repository**
  ```bash
  gcloud artifacts repositories create ai-skillforge \
    --repository-format=docker \
    --location=us-central1 \
    --description="AI SkillForge container images"
  ```

- [ ] **Push to Artifact Registry**
  ```bash
  # Configure Docker auth
  gcloud auth configure-docker us-central1-docker.pkg.dev
  
  # Tag image
  docker tag ai-skillforge-frontend:latest \
    us-central1-docker.pkg.dev/ai-skillforge-prod/ai-skillforge/frontend:latest
  
  # Push
  docker push us-central1-docker.pkg.dev/ai-skillforge-prod/ai-skillforge/frontend:latest
  ```

### 10. Backend Migration (Edge Functions → Cloud Run Functions)

**For each function: gemini-api, vertex-ai, prompt-engineering-ai, discover-resources, ai-subject-wizard**

- [ ] **Convert Deno to Node.js**
  - [ ] Replace `Deno.serve` with Express.js
  - [ ] Convert `Deno.env.get()` to `process.env`
  - [ ] Update imports (remove `.ts` extensions)
  - [ ] Install npm packages for dependencies

- [ ] **Update Authentication**
  - [ ] Remove Supabase auth
  - [ ] Add Firebase Admin SDK
  - [ ] Implement JWT verification middleware

- [ ] **Update Database Connections**
  - [ ] Remove Supabase client
  - [ ] Add Cloud SQL connector (`@google-cloud/sql-connector`)
  - [ ] Update queries to use `pg` driver

- [ ] **Example: gemini-api function conversion**
  ```javascript
  // File: functions/gemini-api/index.js
  const express = require('express');
  const cors = require('cors');
  const admin = require('firebase-admin');
  const { VertexAI } = require('@google-cloud/vertexai');
  
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  admin.initializeApp();
  
  const vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID,
    location: 'us-central1'
  });
  
  // Auth middleware
  const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
  
  app.post('/gemini-api', authenticate, async (req, res) => {
    const { prompt, temperature, maxTokens } = req.body;
    
    const model = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens: maxTokens }
    });
    
    res.json({ text: result.response.text() });
  });
  
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  ```

- [ ] **Create package.json for each function**
  ```json
  {
    "name": "gemini-api",
    "version": "1.0.0",
    "main": "index.js",
    "dependencies": {
      "express": "^4.18.2",
      "cors": "^2.8.5",
      "firebase-admin": "^12.0.0",
      "@google-cloud/vertexai": "^1.0.0"
    }
  }
  ```

- [ ] **Deploy to Cloud Run Functions**
  ```bash
  gcloud functions deploy gemini-api \
    --gen2 \
    --runtime=nodejs20 \
    --region=us-central1 \
    --source=./functions/gemini-api \
    --entry-point=app \
    --trigger-http \
    --allow-unauthenticated \
    --service-account=ai-skillforge-backend@ai-skillforge-prod.iam.gserviceaccount.com \
    --set-env-vars=GCP_PROJECT_ID=ai-skillforge-prod \
    --set-secrets=GEMINI_API_KEY=gemini-api-key:latest \
    --memory=512MB \
    --timeout=60s
  ```

---

## Deployment Phase

### 11. Deploy Frontend to Cloud Run

- [ ] **Deploy Frontend**
  ```bash
  gcloud run deploy ai-skillforge-frontend \
    --image=us-central1-docker.pkg.dev/ai-skillforge-prod/ai-skillforge/frontend:latest \
    --region=us-central1 \
    --platform=managed \
    --allow-unauthenticated \
    --service-account=ai-skillforge-frontend@ai-skillforge-prod.iam.gserviceaccount.com \
    --port=8080 \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=1 \
    --max-instances=100 \
    --concurrency=80 \
    --timeout=300s \
    --vpc-connector=ai-skillforge-connector \
    --set-env-vars="API_BASE_URL=https://gemini-api-abc123.run.app"
  ```

- [ ] **Get Service URL**
  ```bash
  gcloud run services describe ai-skillforge-frontend \
    --region=us-central1 \
    --format='value(status.url)'
  ```

- [ ] **Test Deployment**
  ```bash
  curl https://ai-skillforge-frontend-abc123.run.app
  ```

### 12. Configure Load Balancer & CDN

- [ ] **Create Backend Service**
  ```bash
  gcloud compute backend-services create ai-skillforge-backend \
    --global \
    --load-balancing-scheme=EXTERNAL_MANAGED \
    --enable-cdn
  ```

- [ ] **Add Cloud Run as Backend**
  ```bash
  gcloud compute backend-services add-backend ai-skillforge-backend \
    --global \
    --serverless-backend-service=ai-skillforge-frontend \
    --serverless-backend-service-region=us-central1
  ```

- [ ] **Create URL Map**
  ```bash
  gcloud compute url-maps create ai-skillforge-lb \
    --default-service=ai-skillforge-backend
  ```

- [ ] **Create SSL Certificate**
  ```bash
  gcloud compute ssl-certificates create ai-skillforge-cert \
    --domains=skillforge.yourdomain.com \
    --global
  ```

- [ ] **Create HTTPS Proxy**
  ```bash
  gcloud compute target-https-proxies create ai-skillforge-https-proxy \
    --url-map=ai-skillforge-lb \
    --ssl-certificates=ai-skillforge-cert \
    --global
  ```

- [ ] **Create Forwarding Rule**
  ```bash
  gcloud compute forwarding-rules create ai-skillforge-https-rule \
    --global \
    --target-https-proxy=ai-skillforge-https-proxy \
    --address=ai-skillforge-ip \
    --ports=443
  ```

- [ ] **Update DNS**
  - Add A record: `skillforge.yourdomain.com` → `[STATIC_IP]`
  - Wait for DNS propagation (5-60 minutes)

### 13. Configure Cloud Armor (WAF)

- [ ] **Create Security Policy**
  ```bash
  gcloud compute security-policies create ai-skillforge-security \
    --description="AI SkillForge WAF policy"
  ```

- [ ] **Add Rate Limiting Rule**
  ```bash
  gcloud compute security-policies rules create 100 \
    --security-policy=ai-skillforge-security \
    --expression="true" \
    --action=rate-based-ban \
    --rate-limit-threshold-count=100 \
    --rate-limit-threshold-interval-sec=60 \
    --ban-duration-sec=600 \
    --conform-action=allow \
    --exceed-action=deny-429
  ```

- [ ] **Add OWASP Rules**
  ```bash
  gcloud compute security-policies rules create 200 \
    --security-policy=ai-skillforge-security \
    --expression="evaluatePreconfiguredExpr('xss-stable')" \
    --action=deny-403
  
  gcloud compute security-policies rules create 300 \
    --security-policy=ai-skillforge-security \
    --expression="evaluatePreconfiguredExpr('sqli-stable')" \
    --action=deny-403
  ```

- [ ] **Attach to Backend**
  ```bash
  gcloud compute backend-services update ai-skillforge-backend \
    --security-policy=ai-skillforge-security \
    --global
  ```

### 14. Storage Setup

- [ ] **Create Storage Buckets**
  ```bash
  # User uploads
  gsutil mb -c STANDARD -l us-central1 gs://ai-skillforge-prod-uploads
  
  # Content cache
  gsutil mb -c STANDARD -l us-central1 gs://ai-skillforge-prod-cache
  
  # Static assets (if needed)
  gsutil mb -c STANDARD -l us gs://ai-skillforge-prod-static
  ```

- [ ] **Configure Lifecycle Policies**
  ```bash
  # Delete uploads older than 1 year
  cat > uploads-lifecycle.json <<EOF
  {
    "lifecycle": {
      "rule": [{
        "action": {"type": "Delete"},
        "condition": {"age": 365}
      }]
    }
  }
  EOF
  
  gsutil lifecycle set uploads-lifecycle.json gs://ai-skillforge-prod-uploads
  
  # Delete cache older than 90 days
  cat > cache-lifecycle.json <<EOF
  {
    "lifecycle": {
      "rule": [{
        "action": {"type": "Delete"},
        "condition": {"age": 90}
      }]
    }
  }
  EOF
  
  gsutil lifecycle set cache-lifecycle.json gs://ai-skillforge-prod-cache
  ```

- [ ] **Set IAM Permissions**
  ```bash
  # Backend can read/write
  gsutil iam ch \
    serviceAccount:ai-skillforge-backend@ai-skillforge-prod.iam.gserviceaccount.com:objectAdmin \
    gs://ai-skillforge-prod-uploads
  
  gsutil iam ch \
    serviceAccount:ai-skillforge-backend@ai-skillforge-prod.iam.gserviceaccount.com:objectAdmin \
    gs://ai-skillforge-prod-cache
  ```

---

## Monitoring & Observability Setup

### 15. Cloud Monitoring

- [ ] **Create Uptime Check**
  ```bash
  gcloud monitoring uptime create ai-skillforge-uptime \
    --display-name="AI SkillForge Uptime" \
    --resource-type=uptime-url \
    --host=skillforge.yourdomain.com \
    --path=/
  ```

- [ ] **Create Alert Policies**
  ```bash
  # High error rate alert
  gcloud alpha monitoring policies create \
    --notification-channels=CHANNEL_ID \
    --display-name="High Error Rate" \
    --condition-display-name="Error rate > 5%" \
    --condition-threshold-value=5 \
    --condition-threshold-duration=300s
  ```

- [ ] **Create Dashboard**
  - Navigate to: Monitoring → Dashboards → Create Dashboard
  - Add charts:
    - Cloud Run request count
    - Cloud Run latency (P50, P95, P99)
    - Cloud Run error rate
    - Cloud SQL connections
    - Cloud SQL CPU/Memory
    - Vertex AI API calls
    - Vertex AI latency

### 16. Logging Setup

- [ ] **Create Log Sinks**
  ```bash
  # Sink errors to BigQuery for analysis
  gcloud logging sinks create error-sink \
    bigquery.googleapis.com/projects/ai-skillforge-prod/datasets/error_logs \
    --log-filter='severity >= ERROR'
  
  # Sink all logs to Cloud Storage for archive
  gcloud logging sinks create archive-sink \
    storage.googleapis.com/ai-skillforge-prod-logs \
    --log-filter='resource.type="cloud_run_revision"'
  ```

- [ ] **Set Log Retention**
  - Navigate to: Logging → Logs Storage
  - Set retention: 30 days

---

## Testing & Validation

### 17. Integration Testing

- [ ] **Test Frontend**
  - [ ] Home page loads
  - [ ] Login/signup works
  - [ ] Static assets load from CDN
  - [ ] Responsive design works on mobile

- [ ] **Test Authentication**
  - [ ] User can sign up
  - [ ] User can log in
  - [ ] JWT tokens are valid
  - [ ] User profile is created

- [ ] **Test API Endpoints**
  ```bash
  # Get auth token
  TOKEN=$(curl -X POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=API_KEY \
    -d '{"email":"test@example.com","password":"password","returnSecureToken":true}' \
    | jq -r '.idToken')
  
  # Test gemini-api
  curl -X POST https://gemini-api-abc123.run.app \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"prompt":"Hello AI","temperature":0.7,"maxTokens":100}'
  ```

- [ ] **Test Database Connectivity**
  ```bash
  psql -h 127.0.0.1 -U appuser -d skillforge -c "SELECT COUNT(*) FROM profiles;"
  ```

- [ ] **Load Testing**
  ```bash
  # Install Apache Bench
  sudo apt-get install apache2-utils
  
  # Test frontend
  ab -n 1000 -c 10 https://skillforge.yourdomain.com/
  
  # Test API
  ab -n 100 -c 5 -T application/json -H "Authorization: Bearer $TOKEN" \
    -p request.json https://gemini-api-abc123.run.app
  ```

### 18. Security Testing

- [ ] **Test Cloud Armor**
  - [ ] Rate limiting triggers after 100 requests/minute
  - [ ] SQL injection attempts are blocked
  - [ ] XSS attempts are blocked

- [ ] **Test IAM Permissions**
  - [ ] Unauthenticated users cannot access protected resources
  - [ ] Users can only access their own data
  - [ ] Admins can access all data

- [ ] **Test Secrets**
  - [ ] Secrets are not exposed in logs
  - [ ] Secrets are not returned in API responses
  - [ ] Service accounts have minimal permissions

---

## Go-Live

### 19. Final Checks

- [ ] All tests pass
- [ ] Monitoring is set up and alerts are configured
- [ ] Documentation is complete
- [ ] Rollback plan is documented
- [ ] Team is trained on new infrastructure
- [ ] Stakeholders are notified of go-live date

### 20. Cut Over

- [ ] **Parallel Run** (Week 1)
  - [ ] 10% of traffic to GCP, 90% to Supabase
  - [ ] Monitor metrics and errors
  - [ ] Compare performance

- [ ] **Gradual Migration** (Week 2)
  - [ ] 50% of traffic to GCP
  - [ ] Continue monitoring
  - [ ] Fix any issues

- [ ] **Full Cutover** (Week 3)
  - [ ] 100% of traffic to GCP
  - [ ] Decommission Supabase
  - [ ] Final data sync
  - [ ] Archive Supabase data

### 21. Post-Migration

- [ ] Monitor for 7 days continuously
- [ ] Address any issues immediately
- [ ] Collect feedback from users
- [ ] Document lessons learned
- [ ] Optimize costs based on actual usage
- [ ] Schedule post-mortem meeting

---

**Deployment Checklist Version:** 1.0  
**Last Updated:** 2025-01-27  
**Status:** Ready for Use
