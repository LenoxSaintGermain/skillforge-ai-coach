# SPEC — T8: Package staged changes for the GCP admin to push

**Author:** Claude (Director) · **For:** Antigravity (Executor)
**Goal:** Bundle the two committed-but-unpushed branches into ONE `.tar.gz` the GCP admin (who has GitLab write access) can apply, push, and open MRs from — since our own write access is still pending (T6).
**Method:** `git format-patch` (NOT a raw tar of the repos) — preserves commit message + authorship; admin replays with `git am`.

State verified by Claude (read-only):
- `~/Documents/Vibecoding/product_technology_skill-forge` @ `feat/sit-apis-and-lead-iam` = 1 commit `b9713c9`, edits `product-metadata.google.yml` (+16/−2).
- `~/Documents/Vibecoding/skill-forge-terraform` @ `feat/sit-skillforge-service-accounts` = 1 commit `032657e`, adds `workspaces/staging/sit/service-accounts.tf` (+63).

---

## Antigravity: run these commands

```bash
set -e
PKG=~/Documents/Vibecoding/skillforge-sit-handoff
SPECS=~/Documents/Vibecoding/skillforge-ai-coach/docs
rm -rf "$PKG" && mkdir -p "$PKG/metadata-repo" "$PKG/terraform-repo"

# 1) Export each branch's commit(s) as a patch (origin/main..HEAD = exactly the new work)
git -C ~/Documents/Vibecoding/product_technology_skill-forge \
    format-patch origin/main..HEAD -o "$PKG/metadata-repo"
git -C ~/Documents/Vibecoding/skill-forge-terraform \
    format-patch origin/main..HEAD -o "$PKG/terraform-repo"

# 2) Include the specs (the "why" + MR title/description + expected results)
cp "$SPECS/SPEC_T2_MR.md"                  "$PKG/metadata-repo/"
cp "$SPECS/SPEC_T5_service_accounts_tf.md" "$PKG/terraform-repo/"

# 3) Write the admin-facing instructions (content in the next section)
#    -> save as "$PKG/README_APPLY_INSTRUCTIONS.md"

# 4) Tar it up
tar -czf ~/Documents/Vibecoding/skillforge-sit-handoff.tar.gz \
    -C ~/Documents/Vibecoding skillforge-sit-handoff

echo "✅ Package: ~/Documents/Vibecoding/skillforge-sit-handoff.tar.gz"
tar -tzf ~/Documents/Vibecoding/skillforge-sit-handoff.tar.gz
```

Final structure:
```
skillforge-sit-handoff/
├── README_APPLY_INSTRUCTIONS.md
├── metadata-repo/
│   ├── 0001-feat-sit-enable-...patch
│   └── SPEC_T2_MR.md
└── terraform-repo/
    ├── 0001-feat-sit-add-service-accounts.patch
    └── SPEC_T5_service_accounts_tf.md
```

---

## Content for `README_APPLY_INSTRUCTIONS.md` (goes inside the package, addressed to the admin)

> # SkillForge SIT — changes to push (2 MRs)
>
> Two small, independent changes are attached as git patches. Apply each in a fresh clone you have write access to, push the branch, and open an MR. They don't depend on each other.
>
> ## 1. Metadata repo — `product_technology_skill-forge`
> ```bash
> git clone https://gitlab.com/gfs/cloud-services/product-organization/product_technology_skill-forge.git
> cd product_technology_skill-forge
> git checkout -b feat/sit-apis-and-lead-iam
> git am /path/to/metadata-repo/0001-*.patch        # add --3way if it complains
> git push -u origin feat/sit-apis-and-lead-iam
> ```
> Then open an MR → `main`. Title/description are in `metadata-repo/SPEC_T2_MR.md`.
> **What it does:** enables `certificatemanager` + `storage-component` APIs and adds the granular networking/security/auth roles to the team-group `lead`. (Cloud Armor needs no API — managed via Compute.) After merge, the GFS provisioning pipeline applies it to `gcp-gfs-skill-forge-sit`.
>
> ## 2. Terraform repo — `skill-forge-terraform`
> ```bash
> git clone https://gitlab.com/gfs/products/technology/skill-forge/skill-forge-terraform.git
> cd skill-forge-terraform
> git checkout -b feat/sit-skillforge-service-accounts
> git am /path/to/terraform-repo/0001-*.patch       # add --3way if it complains
> git push -u origin feat/sit-skillforge-service-accounts
> ```
> Then open an MR → `main`. The push triggers the **Terraform Cloud `plan`** for the SIT workspace.
> **Expected plan:** `4 google_service_account + 13 google_project_iam_member to add, 0 to change/destroy.` Details + caveats in `terraform-repo/SPEC_T5_service_accounts_tf.md`. Please paste the plan summary back so it can be reviewed before apply.
>
> ## Alternative (no git am)
> Each SPEC file contains the exact manual edit, so you can also just make the change by hand in your clone and commit it yourself. Same result.
>
> ## Verify after applying (both)
> `git diff origin/main` should match the SPEC. Metadata: 2 APIs + 8 roles added. Terraform: one new file `workspaces/staging/sit/service-accounts.tf`.

---

## After the admin pushes
- Get the two MR URLs + the `terraform plan` output back from the admin → paste into ledger T2 / T5b.
- Claude reviews the MR diffs against the specs.
- This is a temporary bypass of T6 (our own write access). If T6 is later granted, we can push directly; the admin path remains a fallback.
