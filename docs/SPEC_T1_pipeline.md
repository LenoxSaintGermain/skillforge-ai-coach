# SPEC — T1: Deploy pipeline (cloudbuild.yaml + .gitlab-ci.yml)

**Author:** Claude (Director) · **For:** Antigravity (Executor)
**Repo:** `skillforge-ai-coach` (this repo) · **Branch:** work from `agent/antigravity/T0-inflight`
**TL;DR:** Most of T1 is ALREADY DONE in the T0 checkpoint. This spec verifies that, makes one optional change, and surfaces the *real* remaining prerequisites for a successful SIT deploy.

---

## ✅ Already done (verified by Claude, do NOT redo)
- **`adk-course-creator` is in the deploy loop** — `cloudbuild.yaml:73` lists all 7 functions: `adk-course-creator gemini-api vertex-ai prompt-engineering-ai discover-resources ai-subject-wizard learning-path-ai`. Matches `functions/` on disk exactly. ✅
- **`--vpc-connector` is wired for functions** — `cloudbuild.yaml:9,68-72,85`: `_VPC_CONNECTOR` substitution → conditional `VPC_FLAG` → applied in the deploy loop. With a connector set, egress defaults to `private-ranges-only` (correct for private Cloud SQL). ✅
- **CI threads the connector value** — `.gitlab-ci.yml:54-56` passes `GCP_VPC_CONNECTOR` (GitLab CI/CD variable) into the `_VPC_CONNECTOR` substitution. ✅

## 🟡 Optional change — frontend VPC egress
The **frontend** Cloud Run deploy (`cloudbuild.yaml:43-60`) has NO `--vpc-connector`. Checklist §3.3 says "frontend AND functions" route through the connector, but the frontend only needs VPC egress **if it directly reaches private resources** (private Cloud SQL / private IPs). Given it calls public function URLs (`VITE_API_BASE_URL=…run.app`), it almost certainly does **not** need it.
- **Recommendation:** leave as-is unless you confirm the frontend hits a private IP.
- If it IS needed, convert the frontend deploy (Step 3) to a `bash` step mirroring the functions step so the flag can be conditional (a static args list can't be), e.g.:
  ```yaml
  # add inside a bash -c step:
  VPC_FLAG=""; [ -n "${_VPC_CONNECTOR}" ] && VPC_FLAG="--vpc-connector=${_VPC_CONNECTOR} --vpc-egress=all-traffic"
  gcloud run deploy ${_FRONTEND_SERVICE} ... $VPC_FLAG
  ```

## 🔴 Real blockers to a green deploy (the actual remaining work → new tasks)

1. **CI/CD cannot authenticate to GCP yet (→ T7).** `.gitlab-ci.yml:20-43` requires EITHER `GCP_SERVICE_KEY` (SA JSON) OR Workload Identity Federation (`GCP_WIF_PROVIDER` + `GCP_WIF_SA`). Neither is set → the job exits 1 at `before_script`.
   - **Recommended: Workload Identity Federation (OIDC)** — no static keys (GFS enterprise-preferred). `GCP_WIF_SA = skillforge-build@gcp-gfs-skill-forge-sit.iam.gserviceaccount.com` — **created by T5**. So sequence: T5 applies → `skillforge-build` exists → bind WIF + set the two CI/CD variables → pipeline authenticates.
   - Dependency chain: **T5 (build SA) → T7 (WIF binding + CI vars) → pipeline runs.**

2. **Connector value must be set as a CI/CD variable (depends on T3).** Once T3 creates the connector, set GitLab CI/CD variable `GCP_VPC_CONNECTOR=projects/gcp-gfs-skill-forge-sit/locations/us-central1/connectors/skillforge-vpc-connector`. No code change — just the variable.

3. **DB connection secret not mounted in functions (→ verify against AGENT_TASK_01).** The functions deploy loop (`cloudbuild.yaml:86`) sets only `GCP_PROJECT_ID` + `GCP_REGION`. Backend functions that hit Postgres need the `database-connection-string` secret (checklist §3.4). Likely add `--set-secrets=DATABASE_URL=database-connection-string:latest` to the loop. **Cross-check with `docs/AGENT_TASK_01_DB_Password_and_Secret.md` before changing** — that task may already own this.

## ⏭️ Later-phase hardening (NOT T1 — needs LB/IAP first)
- Checklist §5.1: frontend currently `--allow-unauthenticated` (`cloudbuild.yaml:52`). After the HTTPS LB + IAP exist, change to `--ingress=internal-and-cloud-load-balancing` and remove `--allow-unauthenticated`. File as a security task once T2's roles + the LB are in place.

## Antigravity action for T1
- Confirm the ✅ items above (no change needed).
- Decide the frontend-VPC question (likely no-op).
- Acknowledge items 1–3 are tracked as T7 / variable-setting / AGENT_TASK_01 cross-check — they gate the *deploy*, not the *pipeline code*. T1 pipeline code is effectively complete.
