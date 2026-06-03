# Agent Work Ledger — SkillForge AI Coach

**Single source of truth for who is doing what.** Read this before editing anything.
Protocol & roles: see `../AGENTS.md`. Status vocab: `todo → in-progress → review-needed → approved → done` (or `blocked`).

> ⚠️ **Repo is on dirty `main` as of 2026-06-03.** First job (T0): get in-flight work onto a branch before anyone else edits.

---

## Active Tasks

### T0 — Stabilize in-flight work onto a branch
- **Owner:** Antigravity · **Status:** `review-needed` · **Priority:** P0 (do first)
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

### T1 — Add `adk-course-creator` to the deploy pipeline + VPC connector flags
- **Owner:** Antigravity (exec) · **Reviewer:** Claude · **Status:** `blocked` (waiting on T0) · **Priority:** P1
- **Context:** Prereqs checklist §4 — `cloudbuild.yaml` deploy loop omits `adk-course-creator`, and Cloud Run Functions need `--vpc-connector=projects/PROJECT_ID/locations/REGION/connectors/CONNECTOR_NAME` to reach private Cloud SQL.
- **Acceptance:** `adk-course-creator` deploys; all 7 functions + frontend attach the VPC connector.
- **Log:**
  - `[2026-06-03] Claude: Filed from prereqs checklist. Blocked until T0 unblocks cloudbuild.yaml ownership.`

### T2 — Review SIT `product-metadata.google.yml` roles & enabled APIs
- **Owner:** Claude (director) · **Status:** `in-progress` · **Priority:** P1
- **Context:** Confirm the `lead` team-group roles + per-env enabled-APIs in `product-metadata.google.yml` cover all 23 APIs / 4 service accounts in the prereqs checklist for `gcp-gfs-skill-forge-sit`.
- **GitLab project:** `gfs/cloud-services/product-organization/product_technology_skill-forge` · **ID 82105204**
- **Repo metadata files (confirmed by Antigravity):** `README.md` (Vault + metadata provisioning process), `product-metadata.google.yml` (APIs + IAM), `product-metadata.yml` (budget owner `steve-korecki`, $100, domain tags), `product-metadata.gitlab.yml` (GitLab vars), `product-metadata.tfc.yml` (Terraform Cloud vars — likely where SA/infra provisioning is wired).
- **Acceptance:** a diff/spec listing any missing API or role, handed to Antigravity to commit.
- **Log:**
  - `[2026-06-03] Claude: Owning the read/spec. Will NOT edit the yml directly — output a spec for Antigravity to apply.`
  - `[2026-06-03] Antigravity: Confirmed GitLab MCP read access; located project ID 82105204 + 5 metadata files. Repo product-metadata.google.yml matches the shared snippet.`
  - `[2026-06-03] Claude: Starting gap analysis (APIs + lead roles) vs prereqs checklist. SA creation likely separate (post-provision) — flagging for confirmation.`

### T3 — Provision the Serverless VPC Access Connector ("critical missing link")
- **Owner:** Antigravity (exec, has GCP creds) · **Reviewer:** Claude · **Status:** `todo` · **Priority:** P0 for deploy
- **Context:** Prereqs checklist §3.3 — needs a `/28` subnet + connector `skillforge-vpc-connector` in `us-central1`; may require networking-team allocation.
- **Acceptance:** connector exists and is reachable from Cloud Run; its resource path recorded here for T1.
- **Log:**
  - `[2026-06-03] Claude: Filed. Antigravity to confirm whether self-serve or needs networking-team ticket.`

---

## How to update this file
1. Claim files in your task row **before** editing them.
2. Append to the task **Log** (don't delete history).
3. Move status forward; when you need the other agent, say so explicitly in the log.
