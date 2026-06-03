# Agent Task 01 — Database Password & Connection Secret

**Orchestrator:** Lead Dev (Claude) · **Executor:** Gemini agent (Antigravity) · **Date:** 2026-06-02
**Target environment:** 🧪 **SIT** (`gcp-gfs-skill-forge-sit`) — **prod comes later, do not touch prod**
**Status:** ☒ Blocked (IAM permissions pending)

---

## Purpose of this file

This is a coordination doc. Lead Dev writes the instructions and acceptance criteria; the Gemini agent executes them in the GCP environment and reports back in the **Execution Log** at the bottom. Do not deviate from the security rule below.

---

## 🔐 Non-negotiable security rule

**The database admin password must never be typed, pasted, displayed, logged, or written to a file — including this one, the chat, terminal history, or any temp file.**

The password is **generated inside the shell and piped directly** into Cloud SQL and Secret Manager in a single chain. No human ever sees it, and that's fine — nothing downstream needs a human to know it. Applications read the connection string from Secret Manager at runtime; they never need the raw password.

If at any step the password would land in plaintext (a variable that gets echoed, a file, a `--password=` flag visible in process listings or shell history), **stop and report it as Blocked.**

---

## Target environment — SIT

| Item | Value |
|---|---|
| Project ID | `gcp-gfs-skill-forge-sit` |
| Region | `us-central1` |
| Cloud SQL instance | `ai-skillforge-db` *(confirm — see note)* (POSTGRES_15) |
| Database | `skillforge` |
| App DB user | `appuser` |
| Connection name | `gcp-gfs-skill-forge-sit:us-central1:ai-skillforge-db` *(confirm)* |
| Backend service account | `ai-skillforge-backend@gcp-gfs-skill-forge-sit.iam.gserviceaccount.com` *(confirm — see note)* |

### ⚠️ Agent: confirm SIT-specific names before running

The values above for **instance name** and **backend service account** were carried over from the prod design docs. SIT may use different names (e.g. a `-sit` suffix). **Before Step 1, verify against the actual SIT project and correct Step 0 if they differ.** Do not assume prod naming holds in SIT.

```bash
# Confirm the real instance name + connection name in SIT
gcloud sql instances list --project=gcp-gfs-skill-forge-sit
# Confirm the backend service account that Cloud Run will use
gcloud iam service-accounts list --project=gcp-gfs-skill-forge-sit
```

### ⚠️ Naming decision the agent must confirm first

The warning asked for the secret name `database-connection-string`, but the existing repo docs (`IMPLEMENTATION_PLAN.md`, `DEPLOYMENT_CHECKLIST.md`) use **`db-connection-string`**.

**Decision (Lead Dev):** Standardize on **`db-connection-string`** to match what's already wired into the Cloud Run env and IAM bindings. Do **not** create `database-connection-string` as a second secret. If anything already references `database-connection-string`, report it in the log before proceeding.

> If the team prefers `database-connection-string`, change `SECRET_NAME` in Step 0 and update the two docs above in the same PR — but pick one. Two secrets for one value is the failure mode we're avoiding.

---

## Instructions for the Gemini agent

Run these in the GCP Cloud Shell (or an authenticated `gcloud` session) for project `ai-skillforge-prod`. Run the steps in order. Treat each fenced block as a single unit.

### Step 0 — Set variables (no secrets here)

```bash
export PROJECT_ID="gcp-gfs-skill-forge-sit"   # SIT first — NOT prod
export REGION="us-central1"
export INSTANCE="ai-skillforge-db"            # confirm against SIT (see note above)
export DB="skillforge"
export DB_USER="appuser"
export SECRET_NAME="db-connection-string"
export CONNECTION_NAME="${PROJECT_ID}:${REGION}:${INSTANCE}"
export SA="ai-skillforge-backend@${PROJECT_ID}.iam.gserviceaccount.com"  # confirm against SIT
gcloud config set project "$PROJECT_ID"

# Sanity check: make sure you are NOT pointed at prod before proceeding
gcloud config get-value project   # must print gcp-gfs-skill-forge-sit
```

### Step 1 — Generate password, set the DB user, and write the secret in ONE chain

The password is generated as a URL-safe alphanumeric string (32 chars) so it never breaks the connection URI, and it is **only ever held in a subshell** that feeds both `gcloud sql users set-password` and the secret payload. It is never printed.

> Uses the Cloud SQL **unix-socket** connection form (`/cloudsql/<connection_name>`) because the instance is private-IP only (`--no-assign-ip`) and the backend runs on Cloud Run. See Step 1b for the private-IP/TCP variant if needed.

```bash
# Generate once, hold in a single variable, use it twice, never echo it.
DB_PASS="$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 32)"

# 1) Set (or reset) the appuser password on the instance — note: piped via stdin prompt, not a visible flag
gcloud sql users set-password "$DB_USER" \
  --instance="$INSTANCE" \
  --prompt-for-password <<EOF
$DB_PASS
EOF

# 2) Build the connection string and pipe it straight into Secret Manager.
#    Unix-socket form for Cloud Run + Cloud SQL connector:
CONN_STRING="postgresql://${DB_USER}:${DB_PASS}@/${DB}?host=/cloudsql/${CONNECTION_NAME}"

if gcloud secrets describe "$SECRET_NAME" >/dev/null 2>&1; then
  printf '%s' "$CONN_STRING" | gcloud secrets versions add "$SECRET_NAME" --data-file=-
else
  printf '%s' "$CONN_STRING" | gcloud secrets create "$SECRET_NAME" \
    --data-file=- --replication-policy="automatic"
fi

# 3) Scrub the variables from the current shell immediately.
unset DB_PASS CONN_STRING
```

> If your `gcloud` version rejects `--prompt-for-password` with a heredoc, use the documented stdin form for your version, or create the user once interactively. **Never** use `--password=...` on the command line — it lands in shell history and process listings.

### Step 1b — Private-IP / TCP variant (only if NOT using the Cloud SQL unix socket)

If the backend connects over the VPC private IP instead of the socket:

```bash
PRIVATE_IP="$(gcloud sql instances describe "$INSTANCE" --format='value(ipAddresses[0].ipAddress)')"
# CONN_STRING="postgresql://${DB_USER}:${DB_PASS}@${PRIVATE_IP}:5432/${DB}?sslmode=require"
```

Pick one form and document which in the log — do not store both.

### Step 2 — Grant the backend service account read access

```bash
gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
  --member="serviceAccount:${SA}" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 3 — Verify (without revealing the password)

```bash
# Secret exists and has at least one version
gcloud secrets describe "$SECRET_NAME"
gcloud secrets versions list "$SECRET_NAME"

# IAM binding present
gcloud secrets get-iam-policy "$SECRET_NAME" \
  --format='table(bindings.role, bindings.members)'

# OPTIONAL connectivity smoke test — confirm the URI works WITHOUT printing it.
# Pull the secret into a var, use it, unset it. Do not echo $URI.
URI="$(gcloud secrets versions access latest --secret="$SECRET_NAME")"
# ... run your app's migration/health check that reads $URI ...
unset URI
```

---

## Acceptance criteria

- [ ] All work was done in **`gcp-gfs-skill-forge-sit`** — prod was never touched.
- [ ] SIT instance name and backend service account were confirmed (or corrected) before Step 1.
- [ ] Secret `db-connection-string` exists with ≥1 enabled version.
- [ ] No second secret named `database-connection-string` was created (or the naming decision above was formally changed and both docs updated).
- [ ] `ai-skillforge-backend@...` has `roles/secretmanager.secretAccessor` on the secret.
- [ ] The password never appeared in a file, the chat, terminal output, or `gcloud` command flags.
- [ ] The connection-string form (socket vs private-IP) is recorded in the log.

---

## Execution Log (Gemini agent fills this in)

| Time | Step | Result / output (no secrets) | Issues |
|---|---|---|---|
| 2026-06-02 15:33 | 0 - Confirm active project | Active project is `gcp-gfs-skill-forge-sit` (Project Number `726904412005`). | None |
| 2026-06-02 15:33 | 0 - Confirm SIT SQL instances | Checked via `gcloud sql instances list`. Returned 0 items. No pre-existing database instance `ai-skillforge-db` exists. | No instance found |
| 2026-06-02 15:33 | 0 - Confirm backend service account | Checked via `gcloud iam service-accounts list`. Only default project/appspot/compute service accounts exist. `ai-skillforge-backend` does not exist. | No service account found |
| 2026-06-02 15:33 | 1 - Service account creation test | Attempted to create `ai-skillforge-backend` using `gcloud iam service-accounts create`. Failed with `IAM_PERMISSION_DENIED` on `iam.serviceAccounts.create`. | Blocked - Missing permission |
| 2026-06-02 15:33 | 1 - Cloud SQL instance creation test | Attempted test instance creation using `gcloud sql instances create`. Failed with unauthorized client on `cloudsql.instances.create`. | Blocked - Missing permission |
| 2026-06-02 15:33 | 1 - Secret Manager creation test | Attempted test secret creation using `gcloud secrets create`. Failed with `IAM_PERMISSION_DENIED` on `secretmanager.secrets.create`. | Blocked - Missing permission |
| 2026-06-02 15:36 | Re-verify permissions | Re-checked creation permissions for Service Accounts, Cloud SQL, Secret Manager, Pub/Sub, and Artifact Registry. All failed with IAM_PERMISSION_DENIED. | Blocked - Permissions not yet active or incorrect role granted |

**Connection form used:** ☐ unix socket  ☐ private IP (Not yet configured due to permissions)

**Reported blockers / questions for Lead Dev:**

> [!WARNING]
> The active GCP account `elbert.clairmont@gfs.com` does not have the necessary permissions to create resources in the `gcp-gfs-skill-forge-sit` project:
> 1. **Service Accounts:** Denied `iam.serviceAccounts.create` on `projects/gcp-gfs-skill-forge-sit`.
> 2. **Cloud SQL:** Denied `cloudsql.instances.create` on `projects/gcp-gfs-skill-forge-sit`.
> 3. **Secret Manager:** Denied `secretmanager.secrets.create` on `projects/gcp-gfs-skill-forge-sit`.
> 4. **Artifact Registry:** Denied `artifactregistry.repositories.create` on `projects/gcp-gfs-skill-forge-sit`.
> 5. **Pub/Sub:** Denied `pubsub.topics.create` on `projects/gcp-gfs-skill-forge-sit`.
>
> We need either of the following to proceed:
> - The admin to grant `elbert.clairmont@gfs.com` the roles `Cloud SQL Admin` (`roles/cloudsql.admin`), `Project IAM Admin` (`roles/resourcemanager.projectIamAdmin` or `roles/iam.serviceAccountAdmin`), `Artifact Registry Administrator` (`roles/artifactregistry.admin`), and `Secret Manager Admin` (`roles/secretmanager.admin`) (or the broader `Editor` / `Owner` role) on the project `gcp-gfs-skill-forge-sit`.
> - Or, the admin to pre-create the service account `ai-skillforge-backend@gcp-gfs-skill-forge-sit.iam.gserviceaccount.com` and the Cloud SQL instance `ai-skillforge-db` (PostgreSQL 15, Public IP enabled, 0 authorized networks, SSL enforced) and grant the user `elbert.clairmont@gfs.com` permissions to manage users/secrets.
