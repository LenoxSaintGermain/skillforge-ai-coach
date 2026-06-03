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
- **Owner:** Claude (director) · **Status:** `review-needed` (spec delivered → human decision + Antigravity to apply) · **Priority:** P1
- **📄 Deliverable:** `docs/SPEC_T2_metadata_gaps.md`
- **Context:** Confirm the `lead` team-group roles + per-env enabled-APIs in `product-metadata.google.yml` cover all 23 APIs / 4 service accounts in the prereqs checklist for `gcp-gfs-skill-forge-sit`.
- **GitLab project:** `gfs/cloud-services/product-organization/product_technology_skill-forge` · **ID 82105204**
- **Repo metadata files (confirmed by Antigravity):** `README.md` (Vault + metadata provisioning process), `product-metadata.google.yml` (APIs + IAM), `product-metadata.yml` (budget owner `steve-korecki`, $100, domain tags), `product-metadata.gitlab.yml` (GitLab vars), `product-metadata.tfc.yml` (Terraform Cloud vars — likely where SA/infra provisioning is wired).
- **Acceptance:** a diff/spec listing any missing API or role, handed to Antigravity to commit.
- **Log:**
  - `[2026-06-03] Claude: Owning the read/spec. Will NOT edit the yml directly — output a spec for Antigravity to apply.`
  - `[2026-06-03] Antigravity: Confirmed GitLab MCP read access; located project ID 82105204 + 5 metadata files. Repo product-metadata.google.yml matches the shared snippet.`
  - `[2026-06-03] Claude: Starting gap analysis (APIs + lead roles) vs prereqs checklist. SA creation likely separate (post-provision) — flagging for confirmation.`
  - `[2026-06-03 14:58] Claude: Spec delivered → docs/SPEC_T2_metadata_gaps.md. Findings: (A) add 2 APIs: certificatemanager + storage-component; do NOT add cloudarmor.googleapis.com (not a real service — Cloud Armor = compute API). (B) lead group missing networking/security/auth roles (vpcaccess.admin, compute.networkAdmin, servicenetworking.networksAdmin, compute.loadBalancerAdmin, compute.securityAdmin, certificatemanager.editor, iap.admin, firebase.admin). HUMAN DECISION needed: granular compute.* (recommended) vs broad compute.admin. Antigravity: see Q1 → T4 before opening the MR.`

### T3 — Provision the Serverless VPC Access Connector ("critical missing link")
- **Owner:** Antigravity (exec, has GCP creds) · **Reviewer:** Claude · **Status:** `todo` · **Priority:** P0 for deploy
- **Context:** Prereqs checklist §3.3 — needs a `/28` subnet + connector `skillforge-vpc-connector` in `us-central1`; may require networking-team allocation.
- **Acceptance:** connector exists and is reachable from Cloud Run; its resource path recorded here for T1.
- **Log:**
  - `[2026-06-03] Claude: Filed. Antigravity to confirm whether self-serve or needs networking-team ticket.`
  - `[2026-06-03 14:58] Claude: Dependency — T3 needs the lead to hold roles/vpcaccess.admin + roles/compute.networkAdmin, which are part of the T2 metadata MR. So T2 merge should land before T3 can run self-serve.`

### T4 — Confirm how the 4 service accounts get provisioned (read tfc.yml + README)
- **Owner:** Antigravity (has the repo clone) · **Reviewer:** Claude · **Status:** `review-needed` · **Priority:** P1
- **Context:** `product-metadata.google.yml` only handles enabled-APIs + team-group (human) IAM. It does NOT create the 4 runtime/build SAs (`skillforge-backend@`, `skillforge-frontend@`, `skillforge-build@`, `skillforge-db-admin@`). Need to know the mechanism: Terraform Cloud (`product-metadata.tfc.yml`), app-repo Terraform, or manual by the lead.
- **Acceptance:** Antigravity reads `product-metadata.tfc.yml` + `README.md` from its clone and reports here (a) where SAs are defined, (b) who creates them, (c) whether SkillForge's 4 SAs are already declared or need adding. Claude then specs any additions.
- **Log:**
  - `[2026-06-03 14:58] Claude: Filed off T2 Open Question Q1. This gates the runtime/build/db SA setup that deploy depends on.`
  - `[2026-06-03 15:00] Antigravity: Checked the repos. Findings: (a) SAs are not defined anywhere in the existing metadata or tf files. (b) They are meant to be created using Terraform resources in the skill-forge-terraform repository (ID 82164483), which runs on Terraform Cloud. (c) The 4 SAs are NOT yet declared in the repo and need to be added as tf resource declarations in workspaces/staging/sit/ (and other env folders/modules).`

---

## How to update this file
1. Claim files in your task row **before** editing them.
2. Append to the task **Log** (don't delete history).
3. Move status forward; when you need the other agent, say so explicitly in the log.
