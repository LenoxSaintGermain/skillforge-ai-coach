# SPEC — T2: Gaps in `product-metadata.google.yml` for SIT provisioning

**Author:** Claude (Director) · **For:** Antigravity (Executor) to apply via GitLab MR
**Repo:** `gfs/cloud-services/product-organization/product_technology_skill-forge` (ID 82105204)
**Target env:** `gcp-gfs-skill-forge-sit`
**Method:** Cross-referenced the live `product-metadata.google.yml` against `GCP SIT Deployment Prerequisites Checklist.md`.

> Scope note: `product-metadata.google.yml` controls **(a) enabled APIs per env** and **(b) IAM roles for the team-group (humans)**. It does **not** create the 4 runtime/build service accounts — those are provisioned separately (see Open Question Q1 → ledger T4). So this spec covers APIs + the `lead` group's roles, i.e. making sure the lead has enough power to stand up everything in the checklist.

---

## Part A — Enabled APIs

The `env-enabled-apis` anchor currently lists 20 APIs. Compared to the checklist's API table:

### ✅ Add these (genuinely missing, real services)
```yaml
    - certificatemanager.googleapis.com   # SSL/TLS certs for the HTTPS Load Balancer (checklist §5.2)
    - storage-component.googleapis.com    # GCS component access (checklist lists alongside storage-api)
```

### ⚠️ Do NOT add — checklist is inaccurate here
- **`cloudarmor.googleapis.com`** — *this service does not exist.* Cloud Armor (WAF, checklist §5) is managed through the **Compute Engine API** (`compute.googleapis.com`, already enabled) via security policies. No separate API to enable. Flag back to the cloud team that the checklist line is misleading.

### 📝 Note (no action required now)
- The file uses the legacy pair `storage-api` + `storage-component`. Modern GCP uses the single `storage.googleapis.com`. Harmless to keep the legacy pair; mention to cloud team if they want to modernize.
- `pubsub.googleapis.com` is enabled in the file but not in the checklist — fine (used for background triggers). No change.

---

## Part B — `lead` team-group roles (under `product-folder.policies.team-group.lead`)

The lead currently has enough to create SQL, secrets, Artifact Registry, Cloud Run, Functions, service accounts, and grant roles. **But it cannot stand up the networking or security layer** the checklist requires (§3 VPC connector + private SQL, §5 LB/IAP/Cloud Armor). Add:

```yaml
          # --- Networking (checklist §3: VPC connector + private Cloud SQL) ---
          - roles/vpcaccess.admin                 # Create the Serverless VPC Access Connector (unblocks ledger T3)
          - roles/compute.networkAdmin            # Create the /28 subnet + VPC plumbing
          - roles/servicenetworking.networksAdmin # Private service access peering: VPC <-> Cloud SQL
          # --- Security / ingress (checklist §5: HTTPS LB, Cloud Armor, IAP) ---
          - roles/compute.loadBalancerAdmin       # External HTTPS Load Balancer
          - roles/compute.securityAdmin           # Cloud Armor (WAF) security policies
          - roles/certificatemanager.editor       # Manage SSL/TLS certs
          - roles/iap.admin                       # Enable + configure Identity-Aware Proxy (gfs.com only)
          # --- Auth (checklist §3.5: Identity Platform / Firebase Auth) ---
          - roles/firebase.admin                  # Enable Email/Password sign-in (or roles/identityplatform.admin)
```

### 🔑 Decision for the human/cloud team (security trade-off)
The three `compute.*` roles above can be collapsed into a single **`roles/compute.admin`** (simpler, broader). 
- **Recommended: keep the granular three** (`networkAdmin` + `loadBalancerAdmin` + `securityAdmin`) — least-privilege, matches GFS enterprise security posture.
- **Alternative: `roles/compute.admin`** — fewer lines, but grants far more than needed.
Pick one before opening the MR.

---

## Part C — Open questions to resolve before/with the MR

- **Q1 (→ ledger T4):** Where are the **4 service accounts** (`skillforge-backend@`, `skillforge-frontend@`, `skillforge-build@`, `skillforge-db-admin@`) and their role bindings provisioned? Candidates: `product-metadata.tfc.yml` (Terraform Cloud), app-repo Terraform, or manual by the lead. **Antigravity: please read `product-metadata.tfc.yml` + `README.md` from your clone and report the mechanism.** This determines who creates the SAs and how.
- **Q2:** Does the GFS provisioning pipeline apply folder-level IAM immediately on merge, or require a separate approval? (Affects sequencing of T3.)
- **Q3:** Is the `/28` subnet for the VPC connector self-serve, or does it need a networking-team ticket? (checklist §3.3 hints at the latter.)

---

## Proposed MR (once decisions above are made)
1. Branch: `agent/antigravity/T2-sit-metadata`
2. Edit `product-metadata.google.yml`: add the 2 APIs (Part A) + the lead roles (Part B, chosen variant).
3. MR title: `feat(sit): enable networking/security APIs + lead IAM for SkillForge SIT provisioning`
4. Reviewer: Claude (verify against this spec) → human approves → merge triggers GFS provisioning pipeline.
