# Agent Collaboration Constitution — SkillForge AI Coach

This repo is worked on by **two AI agents** plus the human owner. Read this file and
`docs/AGENT_LEDGER.md` at the start of every session before editing anything.

## Who's who

| Agent | Role | Does | Does NOT |
|-------|------|------|----------|
| **Antigravity** (Gemini) | **Executor** | Runs `gcloud`/`firebase`/deploy commands (it is authed into the GCP account), edits app code & `functions/**`, applies infra changes, runs the pipeline. | Skip the ledger; start large infra work without a Claude spec when one is requested. |
| **Claude** | **Director / Architect / Reviewer** | Reads GitLab (via MCP), writes specs & deployment plans, reviews diffs/MRs, maintains the ledger, drafts metadata/CI config. | Run GCP commands; edit files another agent has **claimed** in the ledger; commit on the other agent's behalf. |
| **Human (owner)** | **Referee** | Approves merges, resolves ownership disputes, runs the browser auth flows. | — |

## The one rule that prevents conflict

> **Claim a file in `docs/AGENT_LEDGER.md` before you edit it.**

If a file appears in another agent's **in-progress** task row, do not edit it. Add a
note to that task row instead, or open a new task and wait for handoff.

## Branch strategy (we are currently on dirty `main` — fix this first)

- No direct work on `main`. Each task gets a branch: `agent/<name>/<task-id>-<slug>`
  (e.g. `agent/antigravity/T1-cloudbuild-adk`).
- Antigravity should commit its current in-flight changes to a branch before we both proceed.
- Merges to `main` happen via GitLab MR, reviewed by Claude, approved by the human.

## Task lifecycle (status vocabulary used in the ledger)

`todo` → `in-progress` → `review-needed` → `approved` → `done` (or `blocked`)

- **Director (Claude)** writes the task + acceptance criteria, sets owner, status `todo`.
- **Executor (Antigravity)** moves it to `in-progress`, claims files, does the work,
  then sets `review-needed` and writes what changed + how to verify.
- **Claude** reviews, sets `approved` or back to `in-progress` with notes.
- **Human** merges; whoever merges sets `done`.

## Handoff format (append to the task's "Log" — never delete history)

```
[YYYY-MM-DD HH:MM] <agent>: <what I did / what I need next>
```

## Source-of-truth docs (don't duplicate — link)

- Deployment requirements: `~/Documents/Vibecoding/Skillforge gitlab docs/GCP SIT Deployment Prerequisites Checklist.md`
- GitLab provisioning metadata: `product-metadata.google.yml`
- This protocol: `AGENTS.md` (imported by `CLAUDE.md` and `GEMINI.md`)
- Live work state: `docs/AGENT_LEDGER.md`
