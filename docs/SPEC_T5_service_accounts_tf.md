# SPEC — T5a: Service-account Terraform for SIT

**Author:** Claude (Director) · **For:** Antigravity (Executor) to validate + MR
**Target repo:** `skill-forge-terraform` (ID 82164483) · **Path:** `workspaces/staging/sit/service-accounts.tf` (NEW file)
**Conventions matched (verified via GitLab MCP):** project from `local.google_project_id` (defined in `data.tf`); `google` provider `~> 3.65` (in `main.tf`); APIs are NOT managed in Terraform here (handled by the metadata pipeline = T2).

---

## The file to add — `workspaces/staging/sit/service-accounts.tf`

```hcl
# SkillForge AI Coach — runtime/build/db service accounts + IAM role bindings.
# Project + provider come from the existing workspace (data.tf / main.tf).
# IAM uses ADDITIVE google_project_iam_member (never authoritative *_binding) so we
# do not clobber other principals already bound to these roles on a shared project.

locals {
  skillforge_service_accounts = {
    backend = {
      account_id   = "skillforge-backend"
      display_name = "SkillForge AI Coach — Backend Runtime (Cloud Run Functions)"
      roles = [
        "roles/cloudsql.client",
        "roles/aiplatform.user",
        "roles/secretmanager.secretAccessor",
        "roles/logging.logWriter",
        "roles/monitoring.metricWriter",
      ]
    }
    frontend = {
      account_id   = "skillforge-frontend"
      display_name = "SkillForge AI Coach — Frontend Runtime (Cloud Run)"
      roles        = ["roles/run.invoker"] # see Caveat 1
    }
    build = {
      account_id   = "skillforge-build"
      display_name = "SkillForge AI Coach — Build / Deploy Pipeline"
      roles = [
        "roles/cloudbuild.builds.builder",
        "roles/artifactregistry.writer",
        "roles/run.admin",
        "roles/cloudfunctions.admin",
        "roles/iam.serviceAccountUser", # see Caveat 2
        "roles/storage.admin",
      ]
    }
    db_admin = {
      account_id   = "skillforge-db-admin"
      display_name = "SkillForge AI Coach — Database Admin (migrations)"
      roles        = ["roles/cloudsql.admin"]
    }
  }

  # Flatten {sa -> roles[]} into a unique-keyed map for for_each on the bindings.
  skillforge_sa_role_bindings = merge([
    for sa_key, sa in local.skillforge_service_accounts : {
      for role in sa.roles : "${sa_key}:${role}" => { sa_key = sa_key, role = role }
    }
  ]...)
}

resource "google_service_account" "skillforge" {
  for_each     = local.skillforge_service_accounts
  project      = local.google_project_id
  account_id   = each.value.account_id
  display_name = each.value.display_name
}

resource "google_project_iam_member" "skillforge" {
  for_each = local.skillforge_sa_role_bindings
  project  = local.google_project_id
  role     = each.value.role
  member   = "serviceAccount:${google_service_account.skillforge[each.value.sa_key].email}"
}
```

---

## Director caveats (review these before plan)

1. **`frontend` SA + `roles/run.invoker`** — taken verbatim from checklist §2.B, but `run.invoker`
   is normally granted *to the caller* (the IAP/LB service agent) *on the Cloud Run service*, not
   held by the frontend SA itself. Likely harmless, possibly unnecessary. **Verify with cloud team /
   at deploy.** If it's the IAP path, the real binding is `google_cloud_run_service_iam_member` at
   deploy time, not here.
2. **`build` SA + project-level `roles/iam.serviceAccountUser`** — works, but broad. Tighter option:
   grant the build SA `serviceAccountUser` only **on** the `backend`/`frontend` SAs via
   `google_service_account_iam_member` (4 lines). Recommend tightening if GFS security flags it.
3. **Scope = `sit` only.** Same pattern will be needed for dev/tst/prd. If we'll do all four, consider
   promoting this into a small reusable module under `workspaces/modules/skillforge-service-accounts/`
   and calling it from each env's `modules.tf` — DRY, single source. (Ledger T5 open question.)

## Validation steps for Antigravity (T5b)
1. Branch in `skill-forge-terraform`: `feat/sit-skillforge-service-accounts`.
2. Add the file above at `workspaces/staging/sit/service-accounts.tf`.
3. `terraform init && terraform validate` then `terraform plan` (via the TFC sit workspace).
4. Expected plan: **4 `google_service_account` + 13 `google_project_iam_member` to add, 0 to change/destroy.**
5. Paste the plan summary into ledger T5b. Claude reviews → human approves → merge → TFC applies.
6. After apply: record the 4 SA emails in the ledger (needed for deploy + the `--vpc-connector`/runtime bindings in T1/T3).
```
Expected SA emails:
  skillforge-backend@<PROJECT_ID>.iam.gserviceaccount.com
  skillforge-frontend@<PROJECT_ID>.iam.gserviceaccount.com
  skillforge-build@<PROJECT_ID>.iam.gserviceaccount.com
  skillforge-db-admin@<PROJECT_ID>.iam.gserviceaccount.com
```
