# Review — TDD: Continuous Trainer Agent (Aether)

> **Reviewer:** Claude (Director / Architect). **Source:** `~/Downloads/Technical Design Document
> (TDD)_ Continuous Trainer Agent.md` (the infra/deployment TDD for IT evaluation).
> **Scope of review:** text only — the architecture diagram (`image1`, an embedded base64 ~260KB)
> was not machine-readable; **flag it for separate human review.**
> **Cross-referenced against:** `docs/Technical Design Document_ GFS Continuous Trainer Agent.md`
> (product-vision TDD), `docs/Workflow Design_ Real-Time AI Compliance.md` (Aether Compliance
> Coach), `docs/SPEC_A2UI_agentic_experience.md`, `docs/BRIEF_Forge_agent_harness_design.md`,
> and the live deploy-chain ledger (T1–T7).

---

## 0. One-line take

A clean, correctly-shaped **infrastructure & deployment** TDD — but it is the *infra MVP* doc, not
the *product* doc. It is silent on the agentic-UI, the HITM compliance gate, and the side-panel
harness, and it carries three cross-document inconsistencies (one now resolved). Solid bones;
needs a scope note, a thicker security section, and reconciliation with our deploy chain.

---

## 1. What the doc covers (accurate)

- **Topology:** `aether-companion` (Python/FastAPI/`google-adk` backend, Vertex/Gemini, LLM-as-judge
  eval loop) · `aether-ui` (user chat + hardcoded "Smart Starts") · `aether-governance-ui` (admin:
  monitor/prompts/eval metrics) · `aether-proxy` (dev-only nginx reverse proxy).
- **Infra:** Cloud Run (zero-scale, no GKE) · Serverless NEGs · App-Identity GitOps (App repo owns
  Cloud Run + NEG; Product repo owns the internal HTTP(S) LB; Vault SSL + `.cloud.gfs.com` DNS;
  Org-Net Shared-VPC grant).
- **Migration:** GCP 1.0 (`gcp-gfs-gsuiteadmin-sit`, isolated, **no VPC**) → GCP 2.0 (Collaboration
  suite `gcp-gfs-collaboration-tst/prd`, Shared VPC + central App-Identity LBs).
- **Security:** internal-LB-only ingress (future), LiteLLM CVE-2026-49468 pinned to v1.85.6 (CI-only,
  off the runtime path), optional IAP.

**Solid:** the Cloud Run + Serverless-NEG + App-Identity GitOps pattern is the right enterprise
shape; the separate governance UI + eval loop aligns with the compliance workflow's Refinement
Critic; keeping LiteLLM out of the runtime path is sound.

---

## 2. Findings (prioritized)

### F1 — Doc is scoped to the infra MVP; the product's risk surface is invisible · HIGH
No **ATUI / agent-generated UI** (the "Living Forge" thesis — `aether-ui` is described only as a
chat box with Smart Starts); no **HITM compliance gate / Yellow-Light / Approval Card**; no **MCP**,
**Antigravity A2A orchestration**, **Gemini Nano**, or **side-panel/extension**. For an *IT
evaluation* doc this matters: the highest-risk path (an agent proposing Write actions to legacy
EHR/IAM) is exactly what IT must evaluate, and it isn't here.
**Action:** add a short **scope & phasing note** — "this TDD covers the infra/governance MVP;
agentic-UI (ATUI), the HITM compliance workflow, and the Chrome side-panel harness are covered in
[their docs] and land in later phases." Cite the companion docs.

### F2 — Project-name mismatch with our deploy chain · HIGH (could mis-target provisioning)
This TDD targets **`gcp-gfs-gsuiteadmin-sit` → `gcp-gfs-collaboration-tst/prd`**. Our ledger
deploy-chain work (T2 metadata roles/APIs, T5 service accounts, T1/T3 VPC/ingress) targets
**`gcp-gfs-skill-forge-sit`**. If Aether is the SkillForge successor, **our T2/T5 provisioning may
be aimed at the wrong project** (and the App-Identity/Shared-VPC model here partly supersedes our
hand-rolled VPC-connector plan in T3).
**Action:** confirm the project lineage. Is `gcp-gfs-skill-forge-sit` retired in favor of the
Collaboration suite? If so, re-target T2/T5 and re-scope T3 against App-Identity GitOps.

### F3 — `aether-ui` listed as Lit + Vite; production target is React · RESOLVED → doc fix
Owner confirms **React is the production truth; the TDD's "Lit" is stale.** Good news: it means The
Forge component kit, the A2UI renderer, the conformance audits (V1–V11), and `/living-forge` are all
on the production path (design tokens *and* component layer transfer). `/living-forge` remains a
**design reference**, not the shipped UI, but it's the right framework.
**Action:** correct the TDD stack line to React; note ATUI generates React/Tailwind (consistent with
the product-vision TDD).

### F4 — Security §4 is thin for an enterprise agent · MEDIUM-HIGH
Covers ingress, one CVE pin, IAP — but omits, for IT eval: the **HITM gate** (the real Write-path
control); the **interim posture** (current state is an isolated project with **no VPC** and internal-
LB ingress is *future* — so what guards SIT *today*? IAP alone?); **prompt/response logging,
retention, and PII-in-prompt handling**; the **AI-tool-registry / DLP** story; **secrets management**
beyond the one pin; **data residency**; a one-line **threat model**; **NIST AI RMF** alignment (named
in the compliance workflow, absent here).
**Action:** expand §4, or explicitly defer each item to the compliance/security doc with a pointer.

### F5 — "Antigravity (ADK) SDK" conflation · LOW
The product-vision TDD keeps **Antigravity** (multi-agent/A2A + IDE) distinct from **ADK**
(`google-adk`, the dev kit). This doc fuses them ("Google Antigravity (ADK) SDK").
**Action:** one clarifying sentence distinguishing the two so IT isn't confused.

### F6 — "Harness in the browser" = the web phase, not the extension · CONFIRM
This doc is a **web app** (Cloud Run + internal LB + IAP), not the MV3 Chrome side-panel from the
side-panel spec. Reading: web portal = phase 1 of the harness; persistent side-panel extension =
later. The side-panel's hard constraints (no overlays-beyond-bounds, content scripts, OAuth-in-
panel) do **not** apply to this web phase — worth stating so they aren't conflated.

### F7 — Architecture diagram unreviewed · NOTE
`image1` (line 34) is an embedded base64 blob I couldn't render. Have a human confirm it matches the
described topology (4 apps + NEG/LB/VPC flow).

---

## 3. What IT will likely also ask for (not in the doc)
SLO/scalability targets · cost model · observability/logging (Vertex AI Inspector was in the product
TDD, absent here) · data-flow diagram with trust boundaries · failure modes / DR · rate limiting ·
explicit model versions (Gemini 3.1 Pro/Flash?) · token/latency budgets ("time-to-first-token" was a
named metric in the product TDD).

---

## 4. Follow-ups filed
See ledger **T9**. Highest priority: **F2 (project-name reconciliation)** — it gates whether T2/T5
provisioning is correctly targeted.
