# MR-READY — T2: SIT metadata (APIs + lead IAM)  ⚠️ CORRECTED v2

**Author:** Claude (Director) · **For:** Antigravity to apply in the **metadata** repo
**Repo:** `product_technology_skill-forge` (ID 82105204) · **File:** `product-metadata.google.yml`
**Decision locked:** granular `compute.*` roles (least-privilege), NOT `compute.admin`.

> **⚠️ v2 correction (2026-06-05):** The v1 spec was written against the *docs-folder draft*, which already
> contained ~20 APIs + the deploy roles. The **live `origin/main` is the bare template** (only `artifactregistry`
> + `compute` active; `lead` has just 3 roles). So the change is NOT a 2-line delta — it must bring the file
> to the FULL intended state below. The first committed patch (6 APIs / 12 roles) was incomplete; **amend it
> to match the two blocks below exactly, then regenerate the patch + repackage.**

---

## Make `env-enabled-apis` (the `&env-enabled-apis` anchor) read EXACTLY this (22 APIs):

```yaml
  env-enabled-apis: &env-enabled-apis
    - artifactregistry.googleapis.com
    - compute.googleapis.com
    - run.googleapis.com
    - pubsub.googleapis.com
    - iam.googleapis.com
    - cloudresourcemanager.googleapis.com
    - cloudbuild.googleapis.com
    - cloudfunctions.googleapis.com
    - sqladmin.googleapis.com
    - secretmanager.googleapis.com
    - aiplatform.googleapis.com
    - identitytoolkit.googleapis.com
    - firebase.googleapis.com
    - logging.googleapis.com
    - monitoring.googleapis.com
    - cloudtrace.googleapis.com
    - vpcaccess.googleapis.com
    - servicenetworking.googleapis.com
    - containeranalysis.googleapis.com
    - storage-api.googleapis.com
    - certificatemanager.googleapis.com   # T2: SSL/TLS certs for HTTPS LB (checklist §5.2)
    - storage-component.googleapis.com    # T2: GCS component access (checklist §1)
```
> Do NOT add `cloudarmor.googleapis.com` — not a real service; Cloud Armor is managed via `compute.googleapis.com`.

## Make the `lead:` block (under `product-folder.policies.team-group`) read EXACTLY this (20 roles):

```yaml
        lead:
          - roles/viewer
          - roles/resourcemanager.folderViewer
          - roles/monitoring.editor
          # --- Environment setup & deployment (prereqs checklist §2) ---
          - roles/cloudsql.admin                  # configure SQL instances, DBs, appuser
          - roles/secretmanager.admin             # create/manage db-connection-string secret
          - roles/artifactregistry.admin          # create Docker repository for images
          - roles/cloudbuild.builds.editor        # submit build pipeline
          - roles/run.admin                       # manage Cloud Run services
          - roles/cloudfunctions.admin            # deploy Cloud Run Functions (v2)
          - roles/iam.serviceAccountAdmin         # create runtime/pipeline service accounts
          - roles/iam.securityAdmin               # grant roles to service accounts
          - roles/storage.admin                   # manage Terraform / deploy GCS buckets
          # --- Networking (checklist §3: VPC connector + private Cloud SQL) ---
          - roles/vpcaccess.admin                 # Serverless VPC Access Connector (unblocks T3)
          - roles/compute.networkAdmin            # /28 subnet + VPC plumbing
          - roles/servicenetworking.networksAdmin # private service access peering: VPC <-> Cloud SQL
          # --- Security / ingress (checklist §5: HTTPS LB, Cloud Armor, IAP) ---
          - roles/compute.loadBalancerAdmin       # external HTTPS Load Balancer
          - roles/compute.securityAdmin           # Cloud Armor (WAF) security policies
          - roles/certificatemanager.editor       # manage SSL/TLS certs
          - roles/iap.admin                       # enable + configure IAP (gfs.com only)
          # --- Auth (checklist §3.5: Identity Platform / Firebase Auth) ---
          - roles/firebase.admin                  # enable Email/Password sign-in
```

> Leave `member`, `dev`, `support`, `btg` groups and the `devops-project` block unchanged.

---

## MR metadata (unchanged)
- **Branch:** `feat/sit-apis-and-lead-iam`
- **Title:** `feat(sit): enable full SIT API set + lead IAM for SkillForge provisioning`
- **Description:** Brings `env-enabled-apis` to the full 22-API set and grants the team-group `lead` the
  environment-setup + networking/security/auth roles required by the GCP SIT Deployment Prerequisites
  Checklist. Cloud Armor needs no separate API (Compute). Roles kept granular (not `compute.admin`).
  /cc cloud team to confirm folder-level grantability.

## Antigravity steps to re-do the package
1. In the metadata clone on branch `feat/sit-apis-and-lead-iam`: edit `product-metadata.google.yml` so the two blocks match the above exactly.
2. `git commit --amend --no-edit` (keep one clean commit) — or a new commit; either is fine.
3. `git -C <metadata clone> format-patch origin/main..HEAD -o <pkg>/metadata-repo` (overwrite old patch).
4. Re-tar the handoff package; re-verify with Claude before sending.

## Sanity check after edit
`git diff origin/main` should show **+20 API lines** (22 total − 2 already present) and **+17 role lines** (20 total − 3 already present), all additions, no deletions beyond the run/pubsub uncomment.
