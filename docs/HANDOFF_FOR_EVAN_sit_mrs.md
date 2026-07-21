# SkillForge SIT — Handoff for Evan

**From:** Lenox (Elbert Clairmont) · **Date:** 2026-06-22
**Ask:** push 2 small GitLab MRs I can't push myself — my account is read-only on both repos.

---

## TL;DR

The SIT foundation is fully staged and verified in a handoff package. I just need someone with write access to push two branches and open two MRs. They're independent, and low-risk: **config only — no application code, no secrets, no passwords.**

**Package:** `skillforge-sit-handoff.tar.gz` — contains the git patches, the exact specs, and an apply README.

---

## The two changes

**1. Metadata repo — `product_technology_skill-forge`** (project ID `82105204`)
- Branch `feat/sit-apis-and-lead-iam`, file `product-metadata.google.yml`
- Enables the full SIT API set and grants the `lead` team-group the deploy / networking / security / auth roles needed to provision SkillForge.
- After merge, the GFS provisioning pipeline applies it to `gcp-gfs-skill-forge-sit`.
- **Expected diff:** ~20 API lines added (22 total) + ~17 role lines added (20 total), granular `compute.*` roles. (The README inside the package has an older "2 APIs / 8 roles" line — ignore it; the patch is the full set.)

**2. Terraform repo — `skill-forge-terraform`** (project ID `82164483`)
- Branch `feat/sit-skillforge-service-accounts`, new file `workspaces/staging/sit/service-accounts.tf`
- Declares the 4 runtime/build/db service accounts + their IAM bindings.
- The push triggers the Terraform Cloud `plan`. **Expected plan: 4 service accounts + 13 IAM members to add, 0 to change/destroy.**
- 🔁 **Please paste the plan summary back to me before apply** so I can confirm it matches.

Exact commands are in `README_APPLY_INSTRUCTIONS.md` inside the package: clone → `git am` the patch → push → open MR. (There's also a copy-by-hand option if `git am` complains.) Authorship is preserved.

---

## ⚠️ Please don't hand-create in the GCP console

This project is GitOps-managed. Please **don't** manually grant the team roles or create the service accounts via `gcloud`/console — anything done by hand drifts and gets wiped by the next pipeline / Terraform apply. The two MRs are the supported path.

---

## What this unblocks (the "why")

This is the **foundation layer, not the app deploy.** Once both MRs merge:
- SIT has the required APIs enabled, and my team holds the IAM roles.
- The 4 service accounts (`skillforge-backend / -frontend / -build / -db-admin`) exist.

That then clears the dependent steps — VPC connector, CI/CD deploy auth (Workload Identity), the DB secret, and finally deploying the SkillForge app to Cloud Run. None of those happen from this package; they come after.

---

## Durable alternative (your call)

If it's easier than pushing on my behalf each round, you could instead grant **`Elbert.Clairmont` the Developer role on both repos** (`82105204` + `82164483`) and I'll push the MRs myself — that also fixes future changes.

For context, two access requests are already pending with **Adam Niemur**: #7127745 (GitLab access) and #7127584 (Terraform Cloud account). If those land as Developer on both repos, this whole handoff becomes unnecessary going forward.

---

**Questions?** Ping me. The fastest unblock is just the two MRs above; everything needed to apply them is in the package.
