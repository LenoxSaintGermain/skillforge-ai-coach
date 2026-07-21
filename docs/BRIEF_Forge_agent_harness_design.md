# Design Brief v2 — The Forge across the GFS Aether Agent Harness

> **For:** Claude Design (claude.ai/design) — extend the **"The Forge — SkillForge Design System"** project.
> **From:** Claude (Director / Architect) + the owner.
> **Goal:** Make The Forge **form-factor-adaptive** and prove it by fully mocking every client
> surface of **GFS Aether** (the Continuous Trainer / AI Compliance Coach) — **buildable within
> Chrome's Manifest V3 Side Panel security model**, with the **HITM compliance gate** and the
> **Yellow-Light compliance model** as first-class surfaces.
> **Grounding docs (all in `docs/`):**
> - `Technical Design Document_ GFS Continuous Trainer Agent.md` — partner architecture (ADK/Gemini/MCP/ATUI).
> - `Workflow Design_ Real-Time AI Compliance.md` — the Aether AI Compliance Coach UX + Yellow-Light model.
> - `SPEC_A2UI_agentic_experience.md` — the A2UI/ATUI experience + The Forge invariants.
> - The existing Forge bundle (tokens, type, motion, learner-surface UI kit).
> - This brief embeds the Chrome Side Panel + MV3 reference spec the owner supplied (§5).

> **v2 changes:** added the MV3/Side-Panel hard constraints (§5), the Aether side-panel anatomy
> (§6), the **Forge × Yellow-Light color reconciliation** (§4 — needs owner sign-off), the full
> compliance/HITM/training component family (§7–§9), and a tightened, buildability-aware
> copy-paste prompt (§16).

---

## 1. What this product is now

SkillForge's web app was an **MVP**. It is now **GFS Aether** — a multimodal, context-aware
**Continuous Trainer + AI Compliance Coach** that delivers push-based micro-learning and
real-time compliance guidance *inside the user's workflow*. The page was never the product; the
**agent** is.

- **Stack:** ADK orchestration · **Gemini 3.1 Pro/Flash** (Flash detects risk in <50ms; Pro for
  complex reasoning + writes the UI live via **ATUI**) · **Gemini Nano** (future, on-device,
  on-screen context) · **MCP** to GFS data (Vector/GraphDB, SOPs, Workspace, legacy EHR/IAM).
- **Surfaces ("The Open Claw"):** React Web Portal · **Chrome Side-Panel "shoulder coach" (the
  final resting place)** · Google Chat cards · on-screen content-script overlay (Nano, future).
- **Cross-device continuity** via **Antigravity** (desktop → mobile GChat, no context loss).
- **Two coaching modes in one agent:** (a) **Training** (micro-lessons, roleplays, prompt-craft)
  and (b) **Compliance Coach** (the Yellow-Light model, HITM gate). The UI must make clear *which
  mode is live* (see §4 contextual presence).

---

## 2. The mission

> **Make The Forge form-factor-adaptive, then prove it across every Aether surface — and make
> every mock buildable within MV3.** Two layers: the **adaptive system** (§14, the durable value)
> and the **mocked surfaces + components** (§5–§13, the proof).

---

## 3. Brand invariants (must survive every port)

**Visual carriers** (custom-rendered surfaces only — web, side-panel, overlay):
two-accent language, the **Weld**, hairlines-not-shadows, **ember never decorative**, one ember bloom.

**Structural / voice carriers** (survive *everywhere*, incl. GChat):
sentence case; UPPERCASE only for eyebrows; **no emoji**; verb buttons; Jarvis voice (2nd person,
one idea per note, earned praise); legible agency; concrete numbers; the Approve/Edit/Reject shape.

> **EMOJI → ICON/RAIL RULE (critical).** The reference docs use emoji (🟡🟢🔴⚠️📝❌✏️✅🎓🌐🗂️📄)
> as *placeholders for semantic state*. The Forge ships **no emoji** — render these as **Lucide
> line-icons** and/or the **Yellow-Light tone rail/dot + a text label**. The compliance docs agree:
> *"never uses warning iconography like ⚠️ — conversational language only."* A status is a colored
> dot + word ("Pause and check"), never a glyph.

---

## 4. Color reconciliation — The Forge × the Yellow-Light model  ✅ DECIDED (owner, 2026-06-04)

Aether introduces a second color language (the Yellow-Light compliance model + "Mint Green =
monitoring active"). Left unreconciled, green means three things and ember fights a green
"Approve." **This is the decided system — implement it exactly. The only open sub-item is the exact
mint-green value (§15).**

| Concept | Meaning | Token / treatment |
|---|---|---|
| **Green — Go, with awareness** | compliant, proceed | `--success #27a644` |
| **Yellow — Pause, check one thing** | the dominant compliance card tone | `--warn #e5a13a` (amber) |
| **Red — Human review needed** | escalation only (4 scenarios) | `--danger`, **de-alarmed** ("orange-tinted, not alarming" per workflow §10) — used rarely |
| **Mint-green presence pulse** | *compliance monitoring active* | a distinct mint tone on the presence system **when in Compliance mode** |
| **Lavender `--agent`** | *Jarvis thinking / streaming* | unchanged — used **when in Training mode** |
| **Ember `--ember`** | the **Weld** (recency) + a *neutral, non-consequential* primary CTA | reserved; **NOT used for consequential compliance Approve** |

**Two consequences worth stating loudly:**
1. **Contextual presence.** The ambient dot/pulse color tells the user *which coach is live* —
   **lavender = training, mint-green = compliance monitoring**. This is a deliberate, legible
   evolution of the "two accents" rule, not a violation.
2. **Ember retreats from consequence.** On **HITM / compliance action cards, the Approve primary
   is semantic green** (convention: green = go), Reject is a low-contrast/subtle danger (anti-
   misclick, per §7.2), and ember is *not* the approve color. This honors the compliance doc's
   accessibility requirement **and resolves the long-standing ember-overload problem** (ember no
   longer competes on active-step / consequential-CTA duty).

> Deliver a short **"Compliance color map" spec** showing the Yellow-Light states, the contextual
> presence, and the ember-retreat rule, with WCAG AA contrast checked on every state over
> `--surface-1/2`.

---

## 5. Chrome Side Panel / Manifest V3 — HARD buildability constraints

*The whole reason for v2: designers routinely draw beautiful layouts MV3 cannot build. Every
side-panel and overlay mock MUST obey these. State them on the mocks.*

**Window & form factor**
- **Width 300–450px, user-resizable. Fluid layouts only (Flexbox/Grid). NO fixed-width containers.**
- **Height = 100% of viewport, always.** Content **scrolls vertically *inside* the panel** — it
  never pushes the panel taller. Plan a sticky header + sticky docked input + scrolling middle.
- **NO overlays beyond the sidebar bounds.** No tooltips, modals, dropdowns, or popovers that
  float over the host page. **Everything renders inside the panel.** → the HITM "modal", citation
  "popovers", and the "Watching N tabs" list are all **in-panel** elements (a locking card, an
  in-panel sheet/accordion), never true overlays.
- **Independent theming.** The panel is its own document with custom HTML/CSS; it does **not**
  inherit the host page's theme. The Forge dark surface is self-contained here — good.

**Security (MV3)**
- **No external WebIFrames.** Cannot iframe a Google Doc / external dashboard into the panel (CSP).
  All UI is natively rendered by the extension. (Show a *native* doc-context card, not an embed.)
- **No arbitrary script injection.** No "run custom JS" buttons. Every page action maps to a
  **pre-defined secure extension function** — this is the A2UI/ATUI rule again (events +
  registered functions only; the agent never ships executable strings to the client).
- **No drag-and-drop out of the sidebar.** Use an explicit **`[Sync to Page]`** button instead of
  dragging data onto the host page.

**Host-page injections (the on-screen overlay factor)**
- "Glowing underline" / highlight / floating guiding badge on the host page is a **separate
  Content Script**. Design these as **modular CSS injectables that will not break the host site's
  layout** — scoped, namespaced, removable. This is the Gemini multi-tab-underline pattern.

**Workspace OAuth**
- Connecting Google Drive/Docs needs auth → design a clean **"Connect Google Workspace"
  authorization state** *within the panel bounds*.

**Vertical scroll economy**
- Density is high (the panel runs beside real work). Use **accordion folders (`Reveal`)** for long
  SOP references and **compact data rows**. Maximize vertical real estate.

---

## 6. The Aether side-panel anatomy (FLAGSHIP — design in full)

A three-zone layout: **sticky header · scrolling conversation/surface · sticky docked input.**

**6.1 Header (persistent, prime real estate)**
- **Brand** (collapsed spark) + **Agent Status Indicator** with these states:
  `Idle` · `Reading page…` · `Thinking…` · `Forging…` · `Offline`. Use the contextual presence
  color (§4): lavender (training) / mint-green (compliance monitoring) / neutral (idle/offline).
- **Source Bar / "Active Context (N sources)"** — compact, scannable row of source chips with
  line-icons: **EHR/active-tab (anchor)** · **GFS Knowledge Base / SOP (database/book)** ·
  **Google Workspace (doc/drive)** · **Vector/GraphDB**. 
- **"Watching N tabs"** badge → click opens an **in-panel** list of tracked URLs with disconnect
  toggles (NOT a floating popover).
- **History / Reset** control (clear session context / view past training + compliance logs).

**6.2 Conversation + surface (scrolling)**
- Vertical stack: user messages, **context tokens/chips**, agent responses, and **welded learning
  surfaces** (diagnostic / SkillMap / PromptDiff in *compact* density per §14).
- **Context Cards** (when the agent references a page/tab): **favicon + a shortened clickable link
  that scrolls the host page to that section.**
- **Source citations:** every piece of guidance carries clickable **footnote chips** (e.g.
  `[SOP-Cybersecurity v2]`); tapping opens the exact snippet **in-panel** (a `Reveal`/sheet).
- **Actionable Guidance (ReAct UI):** "Suggested Next Steps" as **button chips** — e.g.
  `[Autofill Form]`, `[Verify against Tab 2]`, `[Deep Dive]`, `[Sync to Page]`.

**6.3 Docked input (sticky bottom)**
- Multi-line text input · **attachment icon** (screenshots/docs) · submit. Borrow the
  Gemini-in-Chrome ergonomics (the "**@ a tab**" context attach + a "**Sharing '…'**" context
  chip) — but keep The Forge look (near-black, ember accent, not Google blue; see §10).

**6.4 Context-awareness states (design these transitions)**
- **Tab switch:** the panel does **not** wipe — show a **skeleton/transition** while the agent
  reads the new DOM (the streaming shimmer, ported).
- **Selection trigger:** when the user highlights text on the host page, show a **"Context
  Focused" badge** and pull that text into the prompt.
- **Analyzing state:** subtle **pulse on the connected-tab elements** in the Source Bar while the
  agent reads multiple tabs.

**6.5 The critical side-panel states (deliver high-fidelity frames):**
1. **Empty / cold-open** — open, no valid page / awaiting navigation. The void + grain + breathing
   dot + one inviting line + the composer (front door). Greeting + suggestion chips.
2. **Analyzing state** — agent actively reading multiple tabs (pulse on connected tab elements).
3. **Active guidance chat** — user messages / context tokens / AI responses stacked vertically.
4. **Inline action triggers** — how "Tools"/automation suggestions look when the AI proposes a
   physical action on the page (mapping to a secure `[Sync to Page]`-style function).
5. **Stalled** *(from the audit "no bad day" finding)* — a >~10s SSE stall: shimmer stops, a `warn`
   note ("the forge stalled — your place is saved") + a `[Try again]` (`event:retry`). Never an
   infinite shimmer.
6. **Couldn't-render** *(invalid emit)* — a graceful "couldn't build that" placeholder card with a
   recover path, never a blank panel. (A surface leaving = reverse-weld + presence note, not a vanish.)

---

## 7. The compliance + HITM component family (first-class)

### 7.1 Compliance Guidance Card (the Yellow-Light card — the dominant content pattern)
A weightier sibling of `CoachNote`, carrying a **G/Y/R state rail + label** (no emoji):
- **Header:** state dot + topic ("Pause and check" / "Data privacy check").
- **Body:** 1–2 sentence *why this matters*, then specific guidance (checklists with line-icon
  ticks, not ✓ emoji), then the **path forward**.
- **CTAs:** solution-first chips (e.g. `[Check the registry]`, `[Use test data]`, `[Got it]`).
- **Policy ref chip** (`[IT037 Acceptable Use]`) → in-panel snippet.
- Tone follows §4: Green=success, Yellow=warn, Red=de-alarmed danger.

### 7.2 HITM Guardrail card (the compliance gate — HERO, max visual weight)
For any Write/Modify to legacy EHR / core systems. **This is an in-panel locking card, not a
floating modal** (MV3).
- **The "Guardrail" lock:** when a Write is proposed, **the chat input locks** until the card is
  resolved — the user cannot scroll past or keep chatting. Make the lock legible (dimmed input +
  "Resolve the pending action to continue").
- **Anatomy:** "Compliance review required" header (line-icon, not ⚠️) → **Proposed Action Object**
  (what / which system: "Modify: Legacy EHR · Patient Notes") → **before→after of the change**
  (reuse `PromptDiff` add/del language for the value diff) → **resource/risk tier** ("User
  Profiles · Read/Write · HITM required") → **inline collapsible parameter editing** (user clicks
  into the proposed values to correct typos *before* approving) → three actions.
- **Actions (per §4 + the compliance doc's anti-misclick rule):**
  - **Approve & run** = high-contrast **semantic GREEN** primary (a legitimate, scarce consequential CTA; NOT ember).
  - **Edit / Modify** = secondary hollow-border (opens the inline parameter fields).
  - **Reject** = **low-contrast / subtle danger** outline — clearly delineated but hard to misclick.
- Convey "you are authorizing this" (signed-token weight) without alarm-fatigue.

### 7.3 Passive nudge — the "Shoulder Tap"
Proactive risk nudge (reactive+nudge policy):
- **Non-blocking**, max **3 lines** visible without expansion, **single CTA**
  ("Tell me more" / "Got it" / "Need help").
- **Auto-dismiss after 30s** if untouched (logs the non-interaction).
- **Never warning colors/iconography** — conversational language only; the only signal is the
  mint-green presence pulse + the calm text. After 3 dismissals in a session, frequency reduces.

### 7.4 Red escalation card (warm handoff, in-panel)
- Tone: *"you're in good hands,"* user should feel **relieved, not anxious**. "This one needs a
  human compliance officer — I'm on it. You don't need to stop what you're doing." Shows topic,
  routed-to, reference ID, SLA, and `[Acknowledge]` / `[Add a note for the reviewer]`.

### 7.5 Compliance state-indicator table (build to this)
| State | Signal | Duration |
|---|---|---|
| Passive monitoring active | subtle mint-green pulse, 0.5s | continuous |
| Risk pattern detected | brighter mint-green pulse, 1s | until interaction |
| Nudge displayed | panel expands ~40px, nudge card | 30s / until dismissed |
| Active guidance open | full expand, mint-green border | until resolved |
| Red / escalated | brief de-alarmed (orange-tinted) treatment | until acknowledged |

---

## 8. Interactive Training Sandbox (bespoke training widgets)

- **Custom lesson container** hosting **native form fields** (radio, short-text, checkbox)
  rendered *inside* the panel.
- **Roleplay state:** an **alternating "You vs. System-AI-Simulator"** layout, visually distinct
  from normal chat (a background tint / border indicator = *"you're in a sandbox training
  environment"*). Live "Prompt Engineering" roleplay (e.g. *"Refine the prompt below to protect
  PII"*) with an input + Submit + a **progress pip row** (○○● as line-shapes/dots, not emoji).
- **Gamified feedback micro-animations:** subtle, corporate-appropriate success badge / progress
  tick on completion — validate proficiency without distraction.

---

## 9. Context Attribution view (the Data Matrix)

Show the agent reasoning from **multiple sources at once** — e.g. a Google Doc tab **+** a Vector
DB **+** an SOP. The Source Bar (§6.1) expands into a scannable attribution panel; each guidance
claim links to its source via citation chips → **in-panel** snippet. (One of the 3 priority views.)

---

## 10. The other form factors

### 10.1 React Web Portal (comfortable density)
The existing 860px learner surface, re-framed as **one form factor** of Aether (not "the app").
Adapt the current UI kit; show the same agentic loop at full size.

### 10.2 Google Chat card tier (most constrained — be honest)
**Card v2 JSON widgets only** (text, `decoratedText`, buttons, `selectionInput`, images,
dividers). **No custom CSS/animation.** Map the **Compliance Guidance Card**, a **QuizCard**, a
**CoachNote**, and the **HITM Approval Card** to *legal* widgets per the workflow doc's GChat card
structure (header · context · guidance · path-forward · policy-ref · primary/secondary/dismiss).
**Flag every Forge visual (Weld, ember, grain) that cannot survive** and what stands in for it.
Open question for the owner: is the GChat HITM card *interactive* or a **deep-link back to the
extension** for high-security writes? (§15)

### 10.3 On-screen overlay (content script, future/Nano)
Per §5: a **modular, namespaced, removable CSS injectable** on the host page — a glowing
underline / floating guiding badge / compact non-modal nudge anchored near the relevant content.
Unobtrusive, dismissible, must **not break host-page layout** and must coexist over light host pages.

---

## 11. The Gemini-in-Chrome reference — borrow the pattern, keep the soul

Match the *interaction* (narrow column, docked input, suggestion chips, "@ a tab", context chip,
model picker, greeting empty state) so it feels native and respects muscle memory. **Do not clone
Gemini's look:** near-black `--canvas` (not Gemini light), the Weld on every generated surface,
ember/mint/lavender accents (not Google blue), hairlines-not-shadows, the breathing presence dot.
Glance test: unmistakably **Aether**, not Gemini.

---

## 12. Adaptive system (the durable deliverable)

Add a **"Form Factors & Density"** section to the design-system README:
- **Density tiers** over the 4px scale: `comfortable` (web) / `compact` (side-panel, 300–450px) /
  `condensed` (GChat + overlay). Specify spacing, **type-scale ceilings** (no `display-xl 64` in a
  panel — ~`headline 28` ceiling; lower for GChat), radii, padding per tier.
- **Container-query degradation** (driven by *container* width, not viewport). Fill the per-
  component reflow table: `ProgressRing`+`SkillMeter` (side-by-side → stacked → text), `PromptDiff`
  (2-col → **stacked** → summary), `SkillMap` (full constellation → fit-to-width, fewer labels →
  **list of "ready" skills**), `QuizCard`, `Stepper`, `CoachNote`, `Compliance Guidance Card`,
  `Block`+Weld.
- **Atmosphere + Weld scaling:** grain stays; bloom shrinks/anchors to the docked input or
  disables in the panel; overlay keeps both minimal. Weld: full (web) → tighter/faster (panel) →
  150ms fade (overlay) → **none** (GChat native entrance). Reduced-motion fallbacks throughout.

---

## 13. Deliverables

1. **Extended "Form Factors & Density" foundations** (tiers + container rules + filled degradation
   table + atmosphere/Weld scaling).
2. **The "Compliance color map" spec** (§4) with WCAG AA contrast on every state.
3. **Side-panel: the 4 critical states** (§6.5) + the header/source-bar/docked-input anatomy.
4. **The 3 priority views, first:** (a) **Pending HITM Compliance Action** (in-panel side-by-side
   change-vs-edit/approve), (b) **Active Training Sandbox** (roleplay card in the chat flow),
   (c) **Context Attribution** (Google Doc tab + Vector DB simultaneously).
5. **The compliance/HITM family** (§7): Guidance Card (G/Y/R), Guardrail lock card, passive nudge,
   Red escalation card.
6. **Web portal** (adapted) + **GChat card tier** (legal widgets + carrier table) + **on-screen
   overlay** (content-script injectable).
7. **"Same moment, four factors" comparison** — the same interaction across all surfaces.
8. **Per-surface carrier table** — which invariants survive vs. are shed and what replaces them.

---

## 14. Hard "do NOT" list

- **Do not** draw anything that floats **outside the sidebar bounds** (no real modals/tooltips/
  dropdowns over the host page) — in-panel only.
- **Do not** use **fixed-width** containers (300–450px fluid) or designs that **push the panel
  taller** (scroll inside).
- **Do not** **iframe** external sites into the panel; **do not** imply arbitrary JS execution or
  **drag-and-drop** onto the host page (use `[Sync to Page]`).
- **Do not** use **emoji** or warning glyphs — line-icons + tone rail + words.
- **Do not** make the Approve action ember or low-contrast — it's **semantic green, high-contrast**;
  Reject is the subtle/anti-misclick one.
- **Do not** use red/warning colors for **passive nudges** — mint-green presence + calm text only.
- **Do not** clone Gemini's visual identity. **Do not** let ember leak onto consequential CTAs.
- **Do not** present a GChat mock relying on illegal custom CSS/animation.

---

## 15. Flag back to the owner

- **Color reconciliation (§4)** — ✅ DECIDED, implement as written. (Only the exact mint value is open, below.)
- **GChat HITM** — interactive card vs. deep-link to the extension for high-security writes?
- **Side-panel resize** — behavior/breakpoint between 300 and 450px.
- **Overlay host-page awareness** — how much to highlight the relevant host region.
- **Mint-green exact value** — pick a mint that's distinct from `--success #27a644` and from
  `--agent #5e6ad2`, and passes AA on `--surface-1/2`.

---

## 16. Copy-paste prompt for Claude Design

```
Extend the existing "The Forge — SkillForge Design System" project. SkillForge is now GFS AETHER:
an ADK-orchestrated, Gemini-3.1-powered Continuous Trainer + AI Compliance Coach that paints UI
live (ATUI) into multiple client surfaces. Make The Forge FORM-FACTOR-ADAPTIVE and prove it by
mocking every surface — and every side-panel/overlay mock MUST be buildable within Chrome's
Manifest V3 Side Panel security model.

=== HARD MV3 / SIDE-PANEL CONSTRAINTS (obey on every side-panel + overlay mock; state them on the frames) ===
- Width 300–450px, user-resizable. FLUID layouts only (Flexbox/Grid). NO fixed-width containers.
- Height = 100% viewport. Content scrolls INSIDE the panel; it never pushes the panel taller.
  (Sticky header + scrolling middle + sticky docked input.)
- NO overlays beyond the sidebar bounds — no modals/tooltips/dropdowns/popovers floating over the
  host page. EVERYTHING renders in-panel. The HITM "modal" is an IN-PANEL LOCKING CARD; citation
  "popovers" and the "Watching N tabs" list are IN-PANEL sheets/accordions.
- Independent theming (panel is its own document; Forge dark is self-contained).
- NO external WebIFrames (can't embed a Google Doc). NO arbitrary script injection (actions map to
  pre-defined secure functions only). NO drag-and-drop onto the host page — use a [Sync to Page] button.
- Host-page "glowing underline"/badge = a SEPARATE content script: modular, namespaced, removable
  CSS injectables that won't break the host layout.
- Workspace OAuth = a "Connect Google Workspace" auth state WITHIN the panel.
- High density: use accordions (Reveal) for long SOPs + compact rows.

=== COLOR RECONCILIATION (DECIDED by owner — implement exactly; only the exact mint value is open) ===
Two color languages must reconcile: The Forge (ember=weld/recency + neutral primary CTA, NEVER
decorative; agent-lavender=thinking; success/warn/danger semantics) and Aether's Yellow-Light
compliance model. Resolution:
- Green "Go" = --success; Yellow "Pause/check" = --warn (the dominant compliance tone); Red "Human
  review" = --danger but DE-ALARMED ("orange-tinted, not alarming"), used rarely.
- CONTEXTUAL PRESENCE: the ambient dot/pulse is LAVENDER when training, MINT-GREEN when compliance-
  monitoring — it tells the user which coach is live. Pick a mint distinct from --success and --agent.
- EMBER RETREATS FROM CONSEQUENCE: on HITM/compliance ACTION cards the Approve primary is SEMANTIC
  GREEN, high-contrast (NOT ember); Reject is low-contrast/subtle danger (anti-misclick); Edit is a
  hollow secondary. Ember stays for the Weld + neutral non-consequential CTAs only. Deliver a
  "Compliance color map" with WCAG AA contrast on every state over --surface-1/2.

=== NO EMOJI ===
The reference docs use emoji (🟡🟢🔴⚠️✓ etc.) as placeholders for state. The Forge ships NO emoji:
render them as Lucide line-icons and/or a colored tone rail/dot + a text label. A status is a dot +
words ("Pause and check"), never a glyph. Passive nudges use NO warning iconography at all.

=== FLAGSHIP: the Aether Chrome side-panel ===
Three zones: sticky header / scrolling conversation+surface / sticky docked input.
- Header: collapsed brand spark + Agent Status Indicator (Idle / Reading page… / Thinking… /
  Forging… / Offline, using contextual presence color) + a Source Bar "Active Context (N sources)"
  with line-icon chips (EHR/active-tab, GFS Knowledge Base/SOP, Google Workspace, Vector/GraphDB) +
  a "Watching N tabs" badge (opens an IN-PANEL list with disconnect toggles) + History/Reset.
- Conversation: user msgs, context chips, agent responses, welded learning surfaces (compact
  density). Context Cards = favicon + a shortened link that scrolls the host page to that section.
  Source citations = footnote chips ([SOP-Cybersecurity v2]) opening the snippet IN-PANEL.
  Actionable guidance = ReAct "Suggested Next Steps" button chips ([Autofill Form],
  [Verify against Tab 2], [Sync to Page]).
- Docked input: multi-line + attachment icon + submit; borrow Gemini-in-Chrome's "@ a tab" attach
  + "Sharing '…'" context chip — but keep The Forge look (near-black, ember, NOT Google blue).
- Context-awareness: tab-switch shows a skeleton (don't wipe); host-page text selection shows a
  "Context Focused" badge pulling that text into the prompt; analyzing state pulses connected tabs.
- DELIVER the 4 critical states: Empty, Analyzing, Active Guidance Chat, Inline Action Triggers.

=== HERO: HITM Guardrail card (in-panel locking card, NOT a modal) ===
When a Write/Modify to legacy EHR/core systems is proposed, the chat input LOCKS until resolved
(dimmed input + "Resolve the pending action to continue"). Anatomy: "Compliance review required"
(line-icon, not ⚠️) → Proposed Action Object (what/which system) → before→after of the change
(reuse PromptDiff add/del) → resource/risk tier ("User Profiles · Read/Write · HITM required") →
inline collapsible parameter editing → actions: Approve & run (high-contrast SEMANTIC GREEN),
Edit/Modify (hollow secondary), Reject (subtle low-contrast danger, anti-misclick). Convey signed-
token weight without alarm. Render it in BOTH side-panel and (legal-widget) GChat form.

=== Compliance Guidance Card + passive nudge + Red escalation ===
- Compliance Guidance Card (the Yellow-Light card, dominant pattern): a weightier CoachNote with a
  G/Y/R state rail+label, a "why this matters" line, guidance (line-icon ticks, not ✓), a path
  forward, solution-first CTA chips, and a policy-ref chip → in-panel snippet.
- Passive "Shoulder Tap" nudge: non-blocking, ≤3 lines, single CTA, auto-dismiss 30s (logs non-
  interaction), NO warning colors/icons, mint-green presence pulse only. Reduce frequency after 3
  dismissals.
- Red escalation card (in-panel, warm handoff): "you're in good hands," topic/routed-to/ref-ID/SLA,
  [Acknowledge] / [Add a note for the reviewer]. User should feel relieved, not anxious.

=== Interactive Training Sandbox ===
A custom lesson container hosting native form fields (radio/short-text/checkbox). Roleplay state =
an alternating "You vs. System-AI-Simulator" layout, visually distinct from normal chat (background
tint/border = "sandbox"). Progress pip row (○○● as shapes, not emoji). Subtle gamified success
ticks on completion.

=== Other factors ===
- Web portal (comfortable density): adapt the existing 860px learner surface as one factor.
- GChat: Card v2 JSON widgets ONLY (text, decoratedText, buttons, selectionInput, images,
  dividers); NO custom CSS/animation. Map the Guidance Card, QuizCard, CoachNote, and HITM card to
  legal widgets; FLAG every Forge visual that can't survive and what replaces it.
- On-screen overlay (Nano, future): a modular/namespaced/removable content-script injectable
  (glowing underline / non-modal badge) that won't break the host page and coexists over light pages.

=== Adaptive system (durable deliverable — add a "Form Factors & Density" README section) ===
Density tiers (comfortable/compact/condensed) with type-scale ceilings (no display-xl 64 in a
panel; ~headline 28 ceiling). CONTAINER-QUERY degradation (by container width) with a per-component
reflow table: ProgressRing+SkillMeter, PromptDiff (2-col→stacked→summary), SkillMap (constellation→
fit-to-width→list of ready skills), QuizCard, Stepper, CoachNote, Compliance Guidance Card,
Block+Weld. Atmosphere/Weld scaling: grain stays; bloom shrinks/anchors or disables; Weld full→
tighter→150ms fade→none (GChat); reduced-motion fallbacks.

=== DELIVER ===
1. Form Factors & Density foundations. 2. Compliance color map (AA-checked). 3. Side-panel 4
critical states + anatomy. 4. The 3 priority views first (Pending HITM / Training Sandbox / Context
Attribution). 5. The compliance/HITM family. 6. Web portal + GChat tier (+ carrier table) + overlay.
7. "Same moment, four factors" comparison. 8. Per-surface carrier table.

=== DO NOT ===
Float anything outside the sidebar; use fixed widths or panel-pushing layouts; iframe external
sites; imply arbitrary JS or drag-to-page; use emoji/warning glyphs; make Approve ember or low-
contrast; use warning colors for passive nudges; clone Gemini's look; let ember leak onto
consequential CTAs; use illegal custom CSS in GChat. FLAG BACK: GChat HITM (interactive vs deep-
link), side-panel resize behavior, overlay host-page awareness, and the exact mint-green value
(distinct from --success and --agent, AA on --surface-1/2). The §4 color system is DECIDED — do
not re-litigate it.
```
