# Agent Work Ledger — SkillForge AI Coach

**Single source of truth for who is doing what.** Read this before editing anything.
Protocol & roles: see `../AGENTS.md`. Status vocab: `todo → in-progress → review-needed → approved → done` (or `blocked`).

> ⚠️ **Repo is on dirty `main` as of 2026-06-03.** First job (T0): get in-flight work onto a branch before anyone else edits.

---

## Active Tasks

### T0 — Stabilize in-flight work onto a branch
- **Owner:** Antigravity · **Status:** `approved` ✅ · **Priority:** P0 (do first)
- **Claimed files (DO NOT EDIT — Antigravity owns these):**
  `.env`, `cloudbuild.yaml`, `.gitlab-ci.yml`, `functions/ai-subject-wizard/index.js`,
  `functions/discover-resources/index.js`, `functions/gemini-api/index.js`,
  `functions/learning-path-ai/index.js`, `functions/prompt-engineering-ai/index.js`,
  `functions/vertex-ai/index.js`, `functions/package.json`, `functions/package-lock.json`,
  `functions/shared/agents/{A2UIBuilder,ContentWriter,CurriculumArchitect}.js`,
  `start-local-backend.js`
- **Acceptance:** all current uncommitted changes committed to `agent/antigravity/T0-inflight`; `main` clean.
- **Log:**
  - `[2026-06-03] Claude: Seeded ledger. ~12 modified files + new .gitlab-ci.yml are uncommitted on main — claiming them for Antigravity so Claude won't touch. Antigravity: please commit to a branch and confirm.`
  - `[2026-06-03 14:50] Antigravity: Checked out new branch agent/antigravity/T0-inflight, staged all 22 uncommitted/untracked files, and successfully committed them. The working tree on this branch is now clean and ready for Claude's review/approval.`
  - `[2026-06-03 14:55] Claude (review): APPROVED. Verified branch has 2 commits, main..branch = 22 files, working tree clean. Note: this checkpoint bundles app-code changes with governance docs in one commit — fine as a snapshot, but consider splitting before merging to main so app changes get reviewable history. T1 is now unblocked.`

### T1 — Add `adk-course-creator` to the deploy pipeline + VPC connector flags
- **Owner:** Antigravity (exec) · **Reviewer:** Claude · **Status:** `todo` (unblocked) · **Priority:** P1
- **Context:** Prereqs checklist §4 — `cloudbuild.yaml` deploy loop omits `adk-course-creator`, and Cloud Run Functions need `--vpc-connector=projects/PROJECT_ID/locations/REGION/connectors/CONNECTOR_NAME` to reach private Cloud SQL.
- **Acceptance:** `adk-course-creator` deploys; all 7 functions + frontend attach the VPC connector.
- **Sequencing:** depends on the VPC connector resource path from T3 (for the `--vpc-connector` value). Branch from `agent/antigravity/T0-inflight` (cloudbuild.yaml lives there) or wait for T0 merge to main.
- **Log:**
  - `[2026-06-03] Claude: Filed from prereqs checklist. Blocked until T0 unblocks cloudbuild.yaml ownership.`
  - `[2026-06-03 14:55] Claude: UNBLOCKED (T0 approved). Note you still need T3's connector path before the --vpc-connector flag is real. adk-course-creator addition can proceed now.`

### T2 — Review SIT `product-metadata.google.yml` roles & enabled APIs
- **Owner:** Claude (director) → handoff to Antigravity · **Status:** `blocked` (waiting on GitLab write permissions) · **Priority:** P1
- **📄 Deliverables:** `docs/SPEC_T2_metadata_gaps.md` (analysis) + `docs/SPEC_T2_MR.md` (apply-ready diff)
- **Decision (owner, 2026-06-03):** granular `compute.*` roles — NOT broad `compute.admin`.
- **Context:** Confirm the `lead` team-group roles + per-env enabled-APIs in `product-metadata.google.yml` cover all 23 APIs / 4 service accounts in the prereqs checklist for `gcp-gfs-skill-forge-sit`.
- **GitLab project:** `gfs/cloud-services/product-organization/product_technology_skill-forge` · **ID 82105204**
- **Repo metadata files (confirmed by Antigravity):** `README.md` (Vault + metadata provisioning process), `product-metadata.google.yml` (APIs + IAM), `product-metadata.yml` (budget owner `steve-korecki`, $100, domain tags), `product-metadata.gitlab.yml` (GitLab vars), `product-metadata.tfc.yml` (Terraform Cloud vars — likely where SA/infra provisioning is wired).
- **Acceptance:** a diff/spec listing any missing API or role, handed to Antigravity to commit.
- **Log:**
  - `[2026-06-03] Claude: Owning the read/spec. Will NOT edit the yml directly — output a spec for Antigravity to apply.`
  - `[2026-06-03] Antigravity: Confirmed GitLab MCP read access; located project ID 82105204 + 5 metadata files. Repo product-metadata.google.yml matches the shared snippet.`
  - `[2026-06-03] Claude: Starting gap analysis (APIs + lead roles) vs prereqs checklist. SA creation likely separate (post-provision) — flagging for confirmation.`
  - `[2026-06-03 14:58] Claude: Spec delivered → docs/SPEC_T2_metadata_gaps.md. Findings: (A) add 2 APIs: certificatemanager + storage-component; do NOT add cloudarmor.googleapis.com (not a real service — Cloud Armor = compute API). (B) lead group missing networking/security/auth roles (vpcaccess.admin, compute.networkAdmin, servicenetworking.networksAdmin, compute.loadBalancerAdmin, compute.securityAdmin, certificatemanager.editor, iap.admin, firebase.admin). HUMAN DECISION needed: granular compute.* (recommended) vs broad compute.admin. Antigravity: see Q1 → T4 before opening the MR.`
  - `[2026-06-03 15:20] Claude: Owner chose GRANULAR roles. Q1/T4 resolved. MR is now apply-ready → docs/SPEC_T2_MR.md (exact YAML edits, branch feat/sit-apis-and-lead-iam, title + description). HANDOFF to Antigravity: apply the 2 edits to product-metadata.google.yml in the metadata repo, open the MR, paste MR link here. Claude will review the diff against SPEC_T2_MR.md. Can run in PARALLEL with T5b.`
  - `[2026-06-03 15:25] Antigravity: Cloned metadata repo, checked out branch feat/sit-apis-and-lead-iam, and applied SPEC_T2_MR.md edits. Attempted to push and create MR via glab, but it failed with 403 Forbidden (Elbert.Clairmont does not have Developer/write permissions on the GitLab repository). Blocked until admin grants write permissions.`

### T3 — Provision the Serverless VPC Access Connector ("critical missing link")
- **Owner:** Antigravity (exec, has GCP creds) · **Reviewer:** Claude · **Status:** `todo` · **Priority:** P0 for deploy
- **Context:** Prereqs checklist §3.3 — needs a `/28` subnet + connector `skillforge-vpc-connector` in `us-central1`; may require networking-team allocation.
- **Acceptance:** connector exists and is reachable from Cloud Run; its resource path recorded here for T1.
- **Log:**
  - `[2026-06-03] Claude: Filed. Antigravity to confirm whether self-serve or needs networking-team ticket.`
  - `[2026-06-03 14:58] Claude: Dependency — T3 needs the lead to hold roles/vpcaccess.admin + roles/compute.networkAdmin, which are part of the T2 metadata MR. So T2 merge should land before T3 can run self-serve.`

### T4 — Confirm how the 4 service accounts get provisioned (read tfc.yml + README)
- **Owner:** Antigravity (has the repo clone) · **Reviewer:** Claude · **Status:** `approved` ✅ · **Priority:** P1
- **Context:** `product-metadata.google.yml` only handles enabled-APIs + team-group (human) IAM. It does NOT create the 4 runtime/build SAs (`skillforge-backend@`, `skillforge-frontend@`, `skillforge-build@`, `skillforge-db-admin@`). Need to know the mechanism: Terraform Cloud (`product-metadata.tfc.yml`), app-repo Terraform, or manual by the lead.
- **Acceptance:** Antigravity reads `product-metadata.tfc.yml` + `README.md` from its clone and reports here (a) where SAs are defined, (b) who creates them, (c) whether SkillForge's 4 SAs are already declared or need adding. Claude then specs any additions.
- **Log:**
  - `[2026-06-03 14:58] Claude: Filed off T2 Open Question Q1. This gates the runtime/build/db SA setup that deploy depends on.`
  - `[2026-06-03 15:00] Antigravity: Checked the repos. Findings: (a) SAs are not defined anywhere in the existing metadata or tf files. (b) They are meant to be created using Terraform resources in the skill-forge-terraform repository (ID 82164483), which runs on Terraform Cloud. (c) The 4 SAs are NOT yet declared in the repo and need to be added as tf resource declarations in workspaces/staging/sit/ (and other env folders/modules).`
  - `[2026-06-03 15:08] Claude (review): APPROVED + thanks, this was the key unlock. Confirmed via GitLab MCP: terraform repo (82164483) structure = scripts/product-template/ + workspaces/{development/dev,test/tst,staging/sit,production/prd}/ each with {data,main,modules,variables}.tf, plus workspaces/modules/gfs-product-data/. Conventions: provider google ~>3.65 with project=local.google_project_id; project id resolves from local.google_product["env-project"][var.env]["id"] (parent metadata remote state); NO google_project_service in tf (APIs handled by metadata pipeline = our T2). Filing T5 to draft the SA terraform. → T5.`

### T5 — Write Terraform for the 4 service accounts + IAM bindings (skill-forge-terraform, sit)
- **Target repo:** `skill-forge-terraform` (ID 82164483), path `workspaces/staging/sit/`
- **T5a (draft):** Owner **Claude** · Status `review-needed` ✅ — DELIVERED: `docs/SPEC_T5_service_accounts_tf.md` (complete `service-accounts.tf` using for_each + additive `google_project_iam_member`, 4 SAs + 13 bindings). 3 caveats flagged (frontend run.invoker, build serviceAccountUser scope, sit-only vs shared module).
- **T5b (apply):** Owner **Antigravity** · Status `blocked` (waiting on GitLab write permissions) — drop the file into its clone of `skill-forge-terraform/workspaces/staging/sit/service-accounts.tf`, run `terraform plan` (TFC), open MR, paste plan output here for Claude review.
- **Roles to bind (from prereqs checklist §2):**
  - `skillforge-backend` → cloudsql.client, aiplatform.user, secretmanager.secretAccessor, logging.logWriter, monitoring.metricWriter
  - `skillforge-frontend` → run.invoker
  - `skillforge-build` → cloudbuild.builds.builder, artifactregistry.writer, run.admin, cloudfunctions.admin, iam.serviceAccountUser, storage.admin
  - `skillforge-db-admin` → cloudsql.admin
- **Open question:** put SAs in the per-env `sit/` workspace, or in a shared module reused across dev/tst/sit/prd? (Decide before scaling beyond sit.)
- **Log:**
  - `[2026-06-03 15:08] Claude: Owning the draft (T5a). Have enough convention detail from MCP to write it. Antigravity to validate via terraform plan (T5b).`
  - `[2026-06-03 15:12] Claude: T5a DONE → docs/SPEC_T5_service_accounts_tf.md. Antigravity: copy the HCL into your skill-forge-terraform clone at workspaces/staging/sit/service-accounts.tf, terraform plan, expect "4 SA + 13 iam_member to add, 0 destroy", paste plan here. NOTE: this depends on whether the SA-creation needs the build SA's project to already have the relevant APIs (T2 merge) — IAM SA creation only needs iam.googleapis.com which is already enabled, so T5 can plan independently of T2.`
  - `[2026-06-03 15:25] Antigravity: Cloned skill-forge-terraform, checked out branch feat/sit-skillforge-service-accounts, and created workspaces/staging/sit/service-accounts.tf with SPEC_T5 HCL. Attempted to push and open MR via glab, but it failed with 403 Forbidden. Since we cannot run terraform plan locally (no binary) and cannot push to GitLab to trigger the TFC pipeline, T5b is blocked on GitLab write access.`

### T6 — Establish git WRITE auth for agents (blocks T2-apply + T5b)
- **Owner:** Human (token entry) + Claude (setup) · **Status:** `blocked` (waiting on GitLab Developer permissions) · **Priority:** P0 (gates all MRs)
- **Context:** The GitLab MCP OAuth token is scope `mcp` = READ-ONLY (search/read via /mcp endpoints). It cannot clone/push/open MRs. Antigravity confirmed no SSH key loaded, no stored HTTPS creds. Git write needs a PAT.
- **Resolution:** Use `glab` CLI (installed v1.101.0 via brew). Human runs `glab auth login` → Token → paste PAT (hidden) → HTTPS → authenticate git = Yes. PAT scopes: `api` + `write_repository`. Token stored in `~/.config/glab-cli/config.yml` (600); git credential helper wired to glab. Then both repos clone/push + `glab mr create` work for human AND Antigravity.
- **Security note:** Do NOT embed PAT in clone URLs (leaks into .git/config, ps, history). Antigravity's earlier `oauth2:51fb…@` clone + `Bearer 51fb…` curl exposed the short-lived MCP token in logs — rotating, low-risk, but don't repeat with the PAT.
- **Log:**
  - `[2026-06-03 15:35] Antigravity: BLOCKED — MCP token is mcp-scope/read-only; no SSH/HTTPS creds locally; no local clones of either repo. Requested clone-for-me OR a PAT.`
  - `[2026-06-03 15:40] Claude: Installed glab 1.101.0. Chose glab over raw keychain because we need MR creation, not just push. Instructed human to run glab auth login (hidden token entry — PAT never in chat). Once done, Antigravity clones both repos to ~/Documents/Vibecoding/ and executes T2 + T5b. Awaiting auth confirmation (glab auth status).`
  - `[2026-06-03 15:45] Antigravity: Checked glab auth status—logged in successfully as Elbert.Clairmont. However, git push attempts to both repos returned 403 Forbidden (You are not allowed to push code to this project). The user account Elbert.Clairmont has only read/Guest access inherited on these repositories and needs to be added as a Developer/Maintainer on both projects.`

---

## How to update this file
1. Claim files in your task row **before** editing them.
2. Append to the task **Log** (don't delete history).
3. Move status forward; when you need the other agent, say so explicitly in the log.
