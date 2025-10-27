# AI SkillForge - Operations Runbook

**Quick Reference Guide for Production Operations**

---

## 📋 Quick Links

| Resource | URL |
|----------|-----|
| Production App | https://skillforge.yourdomain.com |
| GCP Console | https://console.cloud.google.com/home/dashboard?project=ai-skillforge-prod |
| Cloud Run Services | https://console.cloud.google.com/run?project=ai-skillforge-prod |
| Cloud SQL | https://console.cloud.google.com/sql/instances?project=ai-skillforge-prod |
| Cloud Monitoring | https://console.cloud.google.com/monitoring?project=ai-skillforge-prod |
| Cloud Logging | https://console.cloud.google.com/logs?project=ai-skillforge-prod |
| Artifact Registry | https://console.cloud.google.com/artifacts?project=ai-skillforge-prod |
| Secret Manager | https://console.cloud.google.com/security/secret-manager?project=ai-skillforge-prod |

---

## 🚀 Quick Start Commands

### Set GCP Project
```bash
gcloud config set project ai-skillforge-prod
export PROJECT_ID=ai-skillforge-prod
```

### View Service Status
```bash
# Frontend
gcloud run services describe ai-skillforge-frontend --region=us-central1

# All Cloud Run services
gcloud run services list --region=us-central1
```

### View Recent Logs
```bash
# Frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=ai-skillforge-frontend" \
  --limit=50 --format=json

# Function logs
gcloud logging read "resource.type=cloud_function AND resource.labels.function_name=gemini-api" \
  --limit=50 --format=json

# Error logs only
gcloud logging read "severity>=ERROR" --limit=50 --format=json
```

### Database Connection
```bash
# Via Cloud SQL Proxy
./cloud_sql_proxy -instances=ai-skillforge-prod:us-central1:ai-skillforge-db=tcp:5432 &

# Connect with psql
psql -h 127.0.0.1 -U appuser -d skillforge
```

---

## 🔄 Common Operations

### Deploy New Frontend Version

```bash
# 1. Build new image
docker build -t ai-skillforge-frontend:v1.2.0 .

# 2. Tag for Artifact Registry
docker tag ai-skillforge-frontend:v1.2.0 \
  us-central1-docker.pkg.dev/ai-skillforge-prod/ai-skillforge/frontend:v1.2.0

docker tag ai-skillforge-frontend:v1.2.0 \
  us-central1-docker.pkg.dev/ai-skillforge-prod/ai-skillforge/frontend:latest

# 3. Push
docker push us-central1-docker.pkg.dev/ai-skillforge-prod/ai-skillforge/frontend:v1.2.0
docker push us-central1-docker.pkg.dev/ai-skillforge-prod/ai-skillforge/frontend:latest

# 4. Deploy to Cloud Run (gradual rollout)
gcloud run deploy ai-skillforge-frontend \
  --image=us-central1-docker.pkg.dev/ai-skillforge-prod/ai-skillforge/frontend:v1.2.0 \
  --region=us-central1 \
  --no-traffic  # Deploy without sending traffic

# 5. Send 10% traffic to new version
gcloud run services update-traffic ai-skillforge-frontend \
  --to-revisions=LATEST=10 \
  --region=us-central1

# 6. Monitor for 30 minutes, then send 100%
gcloud run services update-traffic ai-skillforge-frontend \
  --to-latest \
  --region=us-central1
```

### Deploy New Backend Function

```bash
cd functions/gemini-api

gcloud functions deploy gemini-api \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=. \
  --entry-point=app \
  --trigger-http \
  --allow-unauthenticated \
  --service-account=ai-skillforge-backend@ai-skillforge-prod.iam.gserviceaccount.com \
  --set-env-vars=GCP_PROJECT_ID=ai-skillforge-prod \
  --set-secrets=GEMINI_API_KEY=gemini-api-key:latest \
  --memory=512MB \
  --timeout=60s
```

### Rollback Deployment

```bash
# List revisions
gcloud run revisions list --service=ai-skillforge-frontend --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic ai-skillforge-frontend \
  --to-revisions=ai-skillforge-frontend-00042-abc=100 \
  --region=us-central1
```

### Scale Service

```bash
# Update min/max instances
gcloud run services update ai-skillforge-frontend \
  --min-instances=2 \
  --max-instances=200 \
  --region=us-central1

# Update memory/CPU
gcloud run services update ai-skillforge-frontend \
  --memory=1Gi \
  --cpu=2 \
  --region=us-central1
```

---

## 📊 Monitoring & Alerting

### Check Current Metrics

```bash
# Frontend request count (last hour)
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_count" AND resource.labels.service_name="ai-skillforge-frontend"' \
  --interval-end-time="$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" \
  --interval-start-time="$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S.%3NZ)"

# Database connections
gcloud sql instances describe ai-skillforge-db \
  --format='value(currentDiskSize, settings.dataDiskSizeGb)'
```

### View Active Alerts

```bash
gcloud alpha monitoring policies list
```

### Create Custom Alert

```bash
# High latency alert
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Latency (P95 > 2s)" \
  --condition-display-name="P95 latency > 2 seconds" \
  --condition-threshold-value=2000 \
  --condition-threshold-duration=300s
```

---

## 🗄️ Database Operations

### Backup Database

```bash
# Create on-demand backup
gcloud sql backups create \
  --instance=ai-skillforge-db \
  --description="Manual backup $(date +%Y%m%d)"

# List backups
gcloud sql backups list --instance=ai-skillforge-db
```

### Restore from Backup

```bash
# List backups to find ID
gcloud sql backups list --instance=ai-skillforge-db

# Restore
gcloud sql backups restore BACKUP_ID \
  --backup-instance=ai-skillforge-db \
  --backup-id=BACKUP_ID
```

### Database Maintenance

```bash
# Check database size
psql -h 127.0.0.1 -U appuser -d skillforge -c "\l+"

# Check table sizes
psql -h 127.0.0.1 -U appuser -d skillforge -c "
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Vacuum and analyze
psql -h 127.0.0.1 -U appuser -d skillforge -c "VACUUM ANALYZE;"

# Check slow queries
psql -h 127.0.0.1 -U appuser -d skillforge -c "
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;"
```

### Scale Database

```bash
# Scale up (requires brief downtime)
gcloud sql instances patch ai-skillforge-db \
  --tier=db-n1-standard-4 \
  --backup-start-time=03:00

# Add read replica
gcloud sql instances create ai-skillforge-db-replica \
  --master-instance-name=ai-skillforge-db \
  --region=us-east1 \
  --tier=db-n1-standard-2
```

---

## 🔐 Security Operations

### Rotate Secrets

```bash
# Generate new secret value
NEW_SECRET=$(openssl rand -base64 32)

# Add new version
echo -n "$NEW_SECRET" | gcloud secrets versions add gemini-api-key --data-file=-

# Update function to use new version
gcloud functions deploy gemini-api \
  --set-secrets=GEMINI_API_KEY=gemini-api-key:latest \
  --region=us-central1

# Disable old version
gcloud secrets versions disable VERSION_NUMBER --secret=gemini-api-key
```

### Review IAM Permissions

```bash
# List service accounts
gcloud iam service-accounts list

# View service account permissions
gcloud projects get-iam-policy ai-skillforge-prod \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:ai-skillforge-backend@ai-skillforge-prod.iam.gserviceaccount.com"
```

### Check Security Logs

```bash
# Failed auth attempts
gcloud logging read "protoPayload.authenticationInfo.principalEmail!=\"\" AND protoPayload.status.code!=0" \
  --limit=50 --format=json

# Admin actions
gcloud logging read "protoPayload.authorizationInfo.permission=~\"iam.*\" AND protoPayload.methodName=~\".*setIamPolicy\"" \
  --limit=50 --format=json
```

---

## 🧪 Testing & Debugging

### Test Endpoints

```bash
# Health check
curl https://skillforge.yourdomain.com/

# API with auth
TOKEN=$(curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password","returnSecureToken":true}' \
  | jq -r '.idToken')

curl -X POST https://gemini-api-abc123.run.app \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test","temperature":0.7}'
```

### Debug with Cloud Shell

```bash
# SSH into Cloud Shell
gcloud cloud-shell ssh

# Run diagnostic commands
gcloud logging read "resource.type=cloud_run_revision" --limit=20 --format=json
```

### Performance Testing

```bash
# Install tools
sudo apt-get update
sudo apt-get install apache2-utils

# Load test
ab -n 1000 -c 50 https://skillforge.yourdomain.com/

# Stress test API
ab -n 100 -c 10 -T application/json \
  -H "Authorization: Bearer $TOKEN" \
  -p request.json \
  https://gemini-api-abc123.run.app
```

---

## 💰 Cost Management

### Current Month Costs

```bash
# View billing
gcloud billing accounts list

# Export billing data to BigQuery (one-time setup)
gcloud billing accounts update BILLING_ACCOUNT \
  --billing-enabled \
  --billing-export-to-bigquery-project=ai-skillforge-prod \
  --billing-export-bigquery-dataset=billing_export
```

### View Cost Breakdown (via Console)
1. Navigate to: Billing → Reports
2. Filter by:
   - Project: ai-skillforge-prod
   - Time range: Last 30 days
   - Group by: Service

### Set Budget Alert

```bash
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Monthly Budget" \
  --budget-amount=500USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

### Cost Optimization Tips

- Use committed use discounts for predictable workloads
- Set Cloud Run min instances to 0 in dev/staging
- Delete old Cloud SQL backups
- Enable storage lifecycle policies
- Review and remove unused resources weekly

---

## 🚨 Incident Response

### Service Down

1. **Check Status**
   ```bash
   gcloud run services describe ai-skillforge-frontend --region=us-central1
   ```

2. **View Recent Errors**
   ```bash
   gcloud logging read "severity>=ERROR" --limit=20 --format=json
   ```

3. **Check Recent Deployments**
   ```bash
   gcloud run revisions list --service=ai-skillforge-frontend --region=us-central1
   ```

4. **Rollback if Needed**
   ```bash
   gcloud run services update-traffic ai-skillforge-frontend \
     --to-revisions=PREVIOUS_REVISION=100 \
     --region=us-central1
   ```

### High Error Rate

1. **Identify Error Pattern**
   ```bash
   gcloud logging read "severity=ERROR AND resource.type=cloud_run_revision" \
     --limit=50 --format=json | jq '.[] | .jsonPayload.message' | sort | uniq -c
   ```

2. **Check Dependent Services**
   - Cloud SQL: Is it healthy?
   - Vertex AI: Are we rate limited?
   - Secrets: Are they accessible?

3. **Scale Resources if Needed**
   ```bash
   gcloud run services update ai-skillforge-frontend \
     --max-instances=200 \
     --region=us-central1
   ```

### Database Performance Issues

1. **Check Active Connections**
   ```bash
   psql -h 127.0.0.1 -U appuser -d skillforge -c "
   SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"
   ```

2. **Check Long-Running Queries**
   ```bash
   psql -h 127.0.0.1 -U appuser -d skillforge -c "
   SELECT pid, age(clock_timestamp(), query_start), usename, query 
   FROM pg_stat_activity 
   WHERE state != 'idle' AND query NOT ILIKE '%pg_stat_activity%' 
   ORDER BY query_start DESC;"
   ```

3. **Kill Long-Running Query** (if needed)
   ```bash
   psql -h 127.0.0.1 -U appuser -d skillforge -c "SELECT pg_terminate_backend(PID);"
   ```

4. **Scale Database**
   ```bash
   gcloud sql instances patch ai-skillforge-db --tier=db-n1-standard-4
   ```

### Exceeded Quotas

1. **Check Quota Usage**
   - Navigate to: IAM & Admin → Quotas
   - Filter by service (e.g., Cloud Run, Vertex AI)

2. **Request Increase**
   - Click "Edit Quotas"
   - Select quota to increase
   - Submit request with justification

3. **Temporary Mitigation**
   - Implement retry logic with exponential backoff
   - Cache responses aggressively
   - Rate limit client requests

---

## 📞 Contacts

| Role | Name | Email | Phone |
|------|------|-------|-------|
| On-Call Engineer | TBD | oncall@yourcompany.com | +1-XXX-XXX-XXXX |
| DevOps Lead | TBD | devops@yourcompany.com | +1-XXX-XXX-XXXX |
| Engineering Manager | TBD | engmgr@yourcompany.com | +1-XXX-XXX-XXXX |
| GCP Support | N/A | Via Console | N/A |

---

## 📚 Additional Resources

- [GCP Documentation](https://cloud.google.com/docs)
- [Cloud Run Best Practices](https://cloud.google.com/run/docs/best-practices)
- [Cloud SQL Best Practices](https://cloud.google.com/sql/docs/postgres/best-practices)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Internal Wiki](https://wiki.yourcompany.com/ai-skillforge)

---

**Runbook Version:** 1.0  
**Last Updated:** 2025-01-27  
**Maintained By:** DevOps Team
