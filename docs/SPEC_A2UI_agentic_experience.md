# SPEC — The Living Forge: A Modern A2UI Agentic Experience for SkillForge

> **Author:** Claude (Director / Architect)
> **Status:** `review-needed` → handoff to Antigravity for execution (see ledger **T8**)
> **Companion ledger task:** `docs/AGENT_LEDGER.md` → **T8**
> **Skills applied:** A2UI v0.9 basic-catalog authoring · frontend-design · awesome-design-md (Linear anchor)

---

## 0. TL;DR for the impatient

SkillForge already renders agent-generated UI — but it does it the *old* way: the
agent emits one nested JSON blob, we walk it once, and we're done. It's a **painting**,
not a **conversation**.

This spec turns it into a **living surface**:

1. **Adopt the real A2UI v0.9 envelope** — `createSurface` / `updateDataModel` /
   `updateComponents` / `deleteSurface` — so the coach can *open, mutate, and close*
   UI over time instead of re-rendering from scratch.
2. **Add a data model + action loop** so the surface is **two-way**: the learner clicks,
   types, answers — and that flows *back* to the agent, which responds with more messages.
3. **Define one SkillForge custom catalog** (`skillforge/catalogs/learn/catalog.json`) — a
   single source of truth that ends the silent drift between `A2UIBuilder.js`,
   `AICoachService.ts`, and `Catalog.tsx`.
4. **Wrap it in a distinctive design system — "The Forge"** — Linear-grade restraint with
   a warm ember accent reserved for the *one* moment that defines the product: the agent
   welding new UI into existence in front of you.

Five signature moments (§6) make it unforgettable. Everything else serves them.

---

## 1. North Star

> **SkillForge is not an app the learner navigates. It is a surface the coach *builds*,
> live, around the learner's next move.**

The learner never sees a static page that "happens to have AI in it." They see Jarvis
*think*, then *forge* the exact interface that moment needs — a diagnostic quiz when
they're stuck, a side-by-side prompt comparison when they're curious, a progress
constellation when they ask "how am I doing?" The UI is an output of reasoning, rendered
with the calm precision of a tool that respects the learner's attention.

Three experience principles, in priority order:

1. **Legible agency.** The learner always knows *what the agent is doing and why*. UI never
   appears by magic; it appears with intention the learner can read (the weld, §6.1).
2. **Live, not lazy.** Surfaces update in place. Answering question 2 of 5 doesn't reload —
   the progress ring fills, question 3 slides in, the data model ticks. State is a stream.
3. **Quiet chrome, loud content.** The frame is near-silent (Linear discipline) so the
   generated content — which changes every session — is the only thing that ever shouts.

---

## 2. Where we are today (honest audit)

| Layer | File | What it does | The gap |
|---|---|---|---|
| Backend agent | `functions/shared/agents/A2UIBuilder.js` | Gemini → one nested A2UI JSON tree from course content | One-shot. Vocabulary = ad-hoc prose list (`Card`, `Accordion`, `Markdown`…). Brittle `JSON.parse` with manual backtick stripping. No schema validation. |
| Coach service | `src/services/AICoachService.ts` | "Jarvis": chat + canvas. Has A2UI instructions baked into the system prompt | **Different** component list than the builder. Emits UI by *string-grepping its own reply* (`generateCanvasActions` matches the words "database"/"api"/"user"). Lots of hardcoded mock responses. |
| Renderer | `src/components/a2ui/A2UIRenderer.tsx` | Recursively maps `{type, props, children}` → React | **Stateless.** No data model, no actions, no surface lifecycle, no streaming. Unknown type → red error box. |
| Catalog | `src/components/a2ui/Catalog.tsx` | ~40 shadcn/Radix components in a `Record<string, ElementType>` | A **third** vocabulary. Drift between these three lists is the #1 cause of "Unsupported UI Component" fallbacks. |

**Diagnosis.** What's labelled "A2UI" today is a *proprietary render format*, not the A2UI
protocol. It has the easy 20% (a JSON→React walker) and is missing the 80% that makes A2UI
*agentic*: the message envelope, the shared data model, the action protocol, and a single
validated catalog. Good news: the renderer's recursive shape and the shadcn catalog are
excellent raw material. We're not throwing anything away — we're promoting it to a real protocol.

---

## 3. The leap: from picture to protocol

A2UI v0.9 is a **declarative-data** protocol. The agent emits JSON describing UI *intent*;
the client renders it with native widgets. Four message types carry everything:

```
createSurface    → open a surface (surfaceId + catalogId, optional theme)
updateDataModel  → set value(s) at a JSON-Pointer path (upsert; the live state)
updateComponents → a FLAT array of components; tree comes from ID refs, one id:"root"
deleteSurface    → the ONLY way a surface goes away
```

Canonical stream order: `createSurface → updateDataModel → updateComponents`. Components may
reference children/data that don't exist yet — the client renders progressive placeholders.
**This is how a surface streams in instead of popping in.**

### 3.1 The agentic loop (the whole point)

```
                        ┌─────────────────────────────────────────┐
                        │             LEARNER'S SURFACE             │
   createSurface ──────▶│  data model  ◀── updateDataModel          │
   updateComponents ───▶│  components  (flat adjacency list)        │
                        │                                           │
                        │   learner types / clicks / answers        │
                        └──────────────────┬────────────────────────┘
                                           │  action: { event: {...} }
                                           ▼
                ┌──────────────────────────────────────────┐
                │  JARVIS (orchestrator) interprets the      │
                │  event + data model, decides next move,    │
                │  and emits the next A2UI message(s)        │
                └──────────────────────────────────────────┘
                                           │
                          updateComponents / updateDataModel / deleteSurface
                                           ▼
                                   (surface mutates in place)
```

Today the bottom half of that loop **does not exist**. Adding it is the headline feature.

### 3.2 Actions — exactly two legal shapes (no inventing)

```jsonc
// Server event — sends to Jarvis; Jarvis replies with more A2UI messages
"action": { "event": { "name": "answerSelected", "context": { "questionId": "q2", "choice": "b" } } }

// Local function — client-side only, MUST be a catalog-registered function
"action": { "functionCall": { "call": "openUrl", "args": { "url": "https://ai.google.dev" } } }
```

Registered functions are validators/formatters/logic only (`required, regex, email,
formatString, formatCurrency, openUrl, and, or, not`, …). **There is no client-side
"close surface" or "filter list" function** — dismissal and filtering are *server round-trips*
(the agent decides). This constraint is a feature: it keeps the agent in the loop for every
meaningful state change, which is exactly the "legible agency" principle.

### 3.3 Data binding makes surfaces live

Bindable props take a literal, a `{ "path": "/json/pointer" }`, or a `FunctionCall`:

```jsonc
{ "id": "scoreLabel", "component": { "componentProperties": {
    "Text": { "text": { "path": "/quiz/scoreText" } } } } }      // re-renders when path changes

// interpolation via formatString
"text": { "functionCall": { "call": "formatString",
          "args": { "template": "${/quiz/correct} of ${/quiz/total} correct" } } }
```

Input components are **two-way bound and local**: typing updates the *local* model only;
the value reaches Jarvis only when an `action` fires. So a 5-question diagnostic holds its
state client-side and submits as one event — no chatty per-keystroke round-trips.

---

## 4. The SkillForge catalog (`learn`)

The A2UI **basic** catalog deliberately omits `Accordion`, `Progress`, `Markdown`, and any
learning-specific widget — and `unevaluatedProperties: false` means we *cannot* bolt extras
onto it. The spec-correct move is a **custom catalog** that reuses `common_types.json`
(`ComponentId`, `ChildList`, `Dynamic*`) so validators still work, then registers our own
components. This becomes the **one true vocabulary** — `A2UIBuilder.js`, `AICoachService.ts`,
and the renderer all import from it.

**`catalogId: "skillforge/catalogs/learn/catalog.json"`**

### 4.1 Inherited from basic (re-used verbatim)
`Text, Image, Icon, Row, Column, List, Card, Tabs, Modal, Divider, Button, CheckBox,
TextField, ChoicePicker, Slider`. Same shapes, same rules:
- `Button` = `child` + `action`, **no `text` prop** (label is a child `Text`).
- `Card` = a single `child` (wrap multiples in a `Column`/`Row`).
- `Tabs` = `tabs: [{ title, child }]`. `Column`/`Row` use `children` (array of IDs or a
  `{path, componentId}` template). `weight` only on a direct child of `Row`/`Column`.

### 4.2 New SkillForge components (the learning layer)

| Component | Purpose | Key properties (all schema-validated, `unevaluatedProperties:false`) |
|---|---|---|
| `Markdown` | Rich lesson prose | `content` (bindable string; sanitized via existing `dompurify`) |
| `ProgressRing` | The signature progress primitive | `value` (0–1 bindable), `label`, `tone` ∈ `ember \| agent \| success` |
| `SkillMeter` | Per-skill mastery bar | `skill`, `value` (bindable), `delta` (optional, animates the change) |
| `Step` | One node in a guided sequence | `title`, `state` ∈ `done \| active \| pending`, `child` (ID) |
| `Stepper` | Vertical guided-lesson rail | `children` (array of `Step` IDs), `current` (bindable index) |
| `QuizCard` | One assessment question | `prompt`, `choices` (bindable), `selected` (bindable path), `action` (server event) |
| `Reveal` | Collapsible (replaces illegal `Accordion`) | `summary`, `child`, `open` (bindable) — see note below |
| `CodeBlock` | Syntax-highlighted snippet | `language`, `code` (bindable), `copyable` (bool) |
| `PromptDiff` | Side-by-side prompt comparison | `before`, `after`, `verdict` (bindable) — for prompt-engineering lessons |
| `CoachNote` | Inline Jarvis aside (the agent's "voice" in-surface) | `tone` ∈ `hint \| nudge \| praise \| warn`, `child` |
| `SkillMap` | Generative constellation of skills | `nodes` (bindable), `edges` (bindable), `action` (node-tap event) |

> **Reveal vs. Accordion.** Accordion is illegal even in custom catalogs if you want to keep
> basic-catalog validators happy, so we ship `Reveal` with an explicit `open` data-binding —
> which is *better* anyway, because the agent can open/close it programmatically as it teaches.

### 4.3 Registered local functions (extends basic)
Inherit basic's validators/formatters. Add **`copyToClipboard`** (for `CodeBlock`) and
**`highlightDiff`** (pure formatter for `PromptDiff`). No state-mutating client functions —
the agent owns state.

### 4.4 Theme tokens on `createSurface`
`theme` carries `primaryColor`, `agentDisplayName`, `iconUrl` only — glassmorphism, motion,
and texture are **renderer concerns** (the client styles them per §5). The agent never emits CSS.

---

## 5. The Forge — design system

> Anchored on the **Linear** spec (near-black, single-accent, software-craft restraint) and
> bent toward a SkillForge identity with one warm accent that means something.

### 5.1 Color (CSS variables; dark-first)

```css
:root {
  /* Canvas & surfaces — Linear discipline */
  --canvas:        #050507;   /* deepest — the void the forge lights up */
  --surface-1:     #0f1011;   /* lesson panels */
  --surface-2:     #141516;   /* raised / hover */
  --hairline:      #23252a;   /* 1px borders, never shadows-as-borders */
  --hairline-warm: #2a2320;   /* hairline on freshly-forged surfaces (cools over ~1.2s) */

  /* Ink */
  --ink:           #f7f8f8;
  --ink-muted:     #d0d6e0;
  --ink-subtle:    #8a8f98;

  /* THE accent — forge ember. Reserved for: the weld, active step, primary CTA. Never decorative. */
  --ember:         #ff6b35;
  --ember-hot:     #ff8a5c;   /* the instant a surface is forged */
  --ember-glow:    #ff6b3533; /* focus ring / weld bloom */

  /* Agent presence — cool signal for "Jarvis is thinking/streaming" */
  --agent:         #5e6ad2;   /* Linear lavender — live state, streaming shimmer */
  --agent-glow:    #5e6ad233;

  --success:       #27a644;
}
```

**The two-accent rule that defines the brand:** **cool = the agent is working**
(`--agent` shimmer while streaming), **warm = the agent just made something for you**
(`--ember` weld flash that cools to neutral). The learner reads the system's state
*chromatically* before reading a single word.

### 5.2 Typography
- **Display:** a characterful grotesque — **Söhne** or **General Sans** (NOT Inter/Roboto/
  Space Grotesk). Weights 500–600, negative tracking (`-0.02em` at display sizes), matching
  Linear's measured, technical feel.
- **Body:** a refined neutral text face (Söhne / **Inter Tight** as a *last* resort) at 16–18px,
  line-height 1.5.
- **Mono:** **Berkeley Mono** or **JetBrains Mono** for `CodeBlock`/`PromptDiff` — the
  "engineering" texture.
- Scale: `display-xl 64 / headline 28 / card-title 22 / subhead 20 / body 16 / caption 13`.

### 5.3 Motion (the emotional core)
Motion is where "agentic" stops being a buzzword. Use **Framer Motion** (already a dep).

- **The forge-weld reveal** (§6.1): new components don't fade in — they *resolve from a hot
  ember hairline*. `--hairline-warm`/`--ember-hot` at 100% opacity → cools to `--hairline`
  over 1.2s with a single staggered scale (0.98→1) + 8px rise. One orchestrated entrance per
  message beats scattered micro-animations.
- **Streaming shimmer:** while Jarvis is mid-thought, a 1px `--agent` gradient sweeps the
  surface's top hairline (CSS keyframe, GPU-only). Stops the instant the first component lands.
- **Live data ticks:** `ProgressRing`/`SkillMeter` animate `value` changes with a spring,
  never a hard jump — because the *change* is the feedback.
- **Reduced motion:** `prefers-reduced-motion` → weld becomes a 150ms opacity fade, shimmer
  becomes a static `--agent` top-border. No information is motion-only.

### 5.4 Atmosphere
- A near-invisible **grain overlay** (`opacity: 0.025`) over `--canvas` to kill the flat-black
  "AI slop" look and give the void depth.
- A single **radial ember bloom** anchored where the most recent surface was forged — drifts
  and fades, the only "warm light source" in the room. This is the visual signature.
- Panels are charcoal with **hairline borders, not shadows**. Depth comes from surface-level
  steps (`--surface-1/2`), Linear-style.

---

## 6. Five signature moments (the unforgettable 20%)

Everything above exists to make these land.

### 6.1 The Weld — *how UI is born*
When Jarvis emits `updateComponents`, the new tree doesn't appear; it is **forged**. The target
region lights with `--ember-hot` along its hairline, components resolve top-down on the
streaming order, and the ember **cools to neutral over 1.2s** as the surface "sets." The learner
literally watches the coach make the thing. This is the product's defining gesture.

### 6.2 Living surfaces — *answer without reloading*
A 5-question diagnostic is **one surface**. Selecting an answer fires `answerSelected`; Jarvis
returns an `updateDataModel` (ring fills, score ticks) + `updateComponents` (next question welds
in where the last one was). No page transition, no spinner-and-replace. The lesson *breathes*.

### 6.3 Jarvis as ambient presence — *not a chat bubble in the corner*
The coach isn't boxed into a sidebar. Its "voice" appears **in-surface** as `CoachNote`
components (`hint`/`nudge`/`praise`/`warn`) woven between content, and its *state* is the
`--agent` shimmer on the active surface. When idle, presence recedes to a single breathing dot.
Jarvis feels like it's *in the room*, not behind a textarea.

### 6.4 The generative Skill Map — *"how am I doing?"*
Asking about progress doesn't dump a list. Jarvis forges a `SkillMap` — a constellation where
node size = mastery and edges = prerequisite paths. **"Ready to level up" nodes are signalled by a
pulsing ring + dashed edge + size — NOT ember** (ember = recency/the weld only; using it for
"opportunity" was the audit-confirmed overload, now retired). Tapping a node fires an event;
Jarvis welds the next lesson for that skill right there. Progress becomes a place you can *touch*,
not a percentage you read.

### 6.5 Prompt-craft, side by side — *the prompt-engineering payoff*
In prompt-engineering lessons, `PromptDiff` shows the learner's prompt vs. an improved one with
`highlightDiff` marking the deltas and a `verdict` line. The learner edits in a bound `TextField`,
hits "Forge", and Jarvis re-runs the diff live. The abstract skill becomes a tight visible loop.

### 6.6 The front door — *learner initiation* (added from the UX-research audit)
The chat bubble is gone (§6.3) — but the learner must still be able to **ask**, or the core promise
("the coach builds UI around your next move") can't actually be learner-driven. The front door is a
**persistent in-surface composer** (`TextField` + send → `event:ask`), docked at the foot of the
surface column — *in the flow, not a floating bubble*. Input is local until send (§3.3); send echoes
the intent as a quiet line, flips presence to `thinking`, and Jarvis welds the answer. This is also
the **cold-open**: before any surface exists, the void + grain + breathing dot + one inviting line +
the composer ("What do you want to get better at today?").

### 6.7 The bad day — *error / empty / loading* (added from the UX-research audit)
A *legible-agency* product is judged hardest when the agent struggles, so failure is designed, not
left to an infinite shimmer:
- **Stalled stream:** at ~3s, a "Still forging…" beat; at ~10s, a `warn` `CoachNote` ("the forge
  stalled — your place is saved") + a "Try again" button (`event:retry`); the shimmer stops, the
  surface stays put.
- **Graceful dismissal:** a `deleteSurface` **reverse-welds** (cools → collapses) with a presence
  note — a surface leaving never reads as a crash.
- **Invalid emit:** a "couldn't render that" placeholder card, never a blank.
- **Progressive placeholders:** each flat-array component welds as it lands while later siblings
  stay skeleton, so the half-streamed state reads intentional.

---

## 7. Architecture & agent topology

```
 CurriculumArchitect ─┐
 ContentWriter ───────┼──▶ structured course/lesson content (existing agents)
 (adk-course-creator) ┘
                               │
                               ▼
                   ┌────────────────────────┐      validates against
                   │   A2UIBuilder (v2)      │◀────  learn/catalog.json (shared)
                   │   content → A2UI msgs   │
                   └───────────┬────────────┘
                               │ createSurface / updateComponents / updateDataModel
                               ▼
              ┌─────────────────────────────────────┐
              │  JARVIS ORCHESTRATOR (AICoachService)│  ← owns the surface session,
              │  routes learner events → next msgs   │    holds data model + history
              └──────────────┬──────────────────────┘
                             │  A2UI message stream (SSE/WebSocket)
                             ▼
       ┌───────────────────────────────────────────────────────┐
       │  CLIENT RUNTIME (new)                                   │
       │  • A2UISurface (lifecycle: create/update/delete)        │
       │  • DataModel store (JSON-Pointer get/set, reactive)     │
       │  • ActionDispatcher (event → transport; functionCall →  │
       │    local registry)                                      │
       │  • A2UIRenderer v2 (flat adjacency list + bindings)     │
       │  • CatalogRegistry (learn catalog → shadcn components)   │
       └───────────────────────────────────────────────────────┘
```

### 7.1 Backend changes
- **`A2UIBuilder.js` (v2)** — emit **envelope messages** (not a raw tree); validate every
  message against `learn/catalog.json` *before* returning (kills the `JSON.parse`-and-pray
  pattern). Prefer Gemini **structured output** (`responseSchema`) over backtick-stripping —
  the codebase already does this for assessments in `AICoachService.callGeminiAPI`.
- **`AICoachService.ts` → orchestrator** — delete the string-grepping `generateCanvasActions`.
  Replace with an **event router**: given `(event, dataModel, history)`, decide the next
  message(s). Keep the existing scenario-context system prompt; extend it with the catalog
  contract instead of the divergent inline component list.
- **Transport** — stream messages over SSE (or WS) so the Weld (§6.1) and streaming shimmer are
  real, not faked with a timer.

### 7.2 Frontend changes (new runtime)
- `src/components/a2ui/runtime/` — `A2UISurface.tsx`, `DataModel.ts`, `ActionDispatcher.ts`,
  `CatalogRegistry.ts`.
- `A2UIRenderer.tsx` → **v2**: consume a flat component array keyed by ID, resolve `child`/
  `children`/`tabs[].child` refs, subscribe to data-model paths for bindable props, and apply
  the Weld entrance per incoming message.
- `Catalog.tsx` → generated from / validated against `learn/catalog.json` so the three
  vocabularies can never drift again.

### 7.3 Source-of-truth file
`functions/shared/a2ui/learn-catalog.json` (importable by both `functions/**` and `src/**`).
This single file ends the drift described in §2.

---

## 8. Migration plan (incremental, shippable, reversible)

| Phase | Deliverable | Risk | Ledger |
|---|---|---|---|
| **P0 — Catalog of record** | Author `learn-catalog.json`; regenerate `Catalog.tsx` from it; add a validator both agents call. *No UX change yet.* | Low — pure consolidation | T8a |
| **P1 — Renderer v2 + data model** | New runtime: flat adjacency list, JSON-Pointer data model, bindings. Render existing one-shot payloads through it (back-compat shim). | Med — renderer rewrite, behind a flag | T8b |
| **P2 — Action loop + transport** | SSE/WS stream; `ActionDispatcher`; orchestrator event router; **kill `generateCanvasActions`**. Surfaces become two-way. | High — the real feature | T8c |
| **P3 — The Forge design system** | Tokens, type, Weld + shimmer motion, grain/bloom atmosphere. Apply to runtime. | Low-med — visual layer | T8d |
| **P4 — Signature components** | `ProgressRing`, `SkillMeter`, `Stepper`, `QuizCard`, `Reveal`, `PromptDiff`, `SkillMap`, `CoachNote`. | Med — net-new widgets | T8e |
| **P5 — Moment polish** | Wire the 5 signature moments end-to-end; reduced-motion pass; a11y audit. | Low | T8f |

Each phase is independently mergeable and gated behind a feature flag
(`VITE_A2UI_RUNTIME_V2`) so `main` stays green and we can A/B the old vs. new render path.

---

## 9. Acceptance criteria

- [ ] One catalog file is the sole vocabulary; `A2UIBuilder.js`, the orchestrator, and the
      renderer all reference it; an unknown component is a *validation error at emit time*,
      not a red box at render time.
- [ ] Every emitted message validates against the catalog schema (`unevaluatedProperties:false`)
      before it leaves the agent.
- [ ] A surface can be **mutated in place**: a learner action produces `updateDataModel` /
      `updateComponents` without a full re-render (demonstrated by the diagnostic in §6.2).
- [ ] Actions use only the two legal shapes (`event`, `functionCall`); dismissal is a server
      round-trip ending in `deleteSurface`.
- [ ] The Weld, streaming shimmer, and live data ticks are implemented and **degrade correctly**
      under `prefers-reduced-motion`.
- [ ] All five signature moments are demonstrable on a real lesson.
- [ ] WCAG AA: contrast on `--ink`/`--ink-muted` over surfaces; no information conveyed by color
      or motion alone; full keyboard path through `QuizCard`/`Stepper`/`SkillMap`.

---

## 10. Owner decisions — RESOLVED (owner, 2026-06-04)

- **D1 — Agent autonomy ceiling → `reactive + nudge`.** Jarvis mutates freely in response to
  learner actions, and may inject rate-limited `CoachNote` nudges on idle/struggle signals
  (the existing `provideProactiveGuidance` hooks). It may **not** restructure an active, focused
  surface on its own initiative — those proposals are queued, not applied (see §11). The
  `ambient` tier is deliberately deferred.
- **D2 — Transport → SSE.** Server-sent events for the agent→client stream + POST-back for
  learner events. Fits the existing HTTP Cloud Run functions and the T1/T3 VPC work; no WS infra.
- **D3 — Catalog scope v1 → all 11 components.** Ship the full learning layer (§4.2) in P4 —
  `Markdown, ProgressRing, SkillMeter, Step, Stepper, QuizCard, Reveal, CodeBlock, PromptDiff,
  CoachNote, SkillMap`. Larger P4 surface, but no second catalog-expansion pass later.

---

## 11. The action-authorization policy (D1 = `reactive + nudge`)

This is the one piece of logic that decides how "alive" vs. "respectful" the coach feels.
Per the owner's D1 choice, the reference implementation lives at
`functions/shared/a2ui/authorizeMutation.js`:

```js
/**
 * Gatekeeper: may a proposed A2UI mutation from Jarvis reach the learner's surface?
 * Policy tier: 'reactive + nudge' (owner decision D1, 2026-06-04).
 *
 * @param {object} proposal - { type: 'updateComponents'|'updateDataModel'|'deleteSurface', target }
 * @param {object} trigger  - { kind: 'learnerAction'|'idleSignal'|'agentInitiative', meta }
 * @param {object} surface  - { focused: boolean, lastNudgeAt: number|null }  // live surface state
 * @returns {{ allow: boolean, defer: boolean, reason: string }}
 */
const NUDGE_COOLDOWN_MS = 45_000; // idle nudges may not fire more than once per ~45s

export function authorizeMutation(proposal, trigger, surface, now = Date.now()) {
  // 1. The learner asked — always honor it. This is the whole reactive loop.
  if (trigger.kind === 'learnerAction') {
    return { allow: true, defer: false, reason: 'reactive: learner-initiated' };
  }

  // 2. Idle/struggle nudges: additive CoachNotes only, rate-limited, never destructive.
  if (trigger.kind === 'idleSignal') {
    const isAdditiveNote = proposal.type === 'updateComponents' && proposal.target?.kind === 'CoachNote';
    const cooledDown = !surface.lastNudgeAt || (now - surface.lastNudgeAt) >= NUDGE_COOLDOWN_MS;
    if (isAdditiveNote && cooledDown) {
      return { allow: true, defer: false, reason: 'nudge: rate-limited CoachNote' };
    }
    return { allow: false, defer: false, reason: 'nudge suppressed: not additive note, or within cooldown' };
  }

  // 3. Self-initiated restructuring of a FOCUSED surface — the deferred 'ambient' tier.
  //    Don't yank focus mid-task: queue it to apply when the surface is no longer focused.
  if (trigger.kind === 'agentInitiative') {
    return surface.focused
      ? { allow: false, defer: true,  reason: 'ambient deferred: surface focused, queued for blur' }
      : { allow: true,  defer: false, reason: 'ambient applied: surface idle/unfocused' };
  }

  return { allow: false, defer: false, reason: 'unknown trigger kind — fail closed' };
}
```

Design notes baked into the policy: **fail closed** on unknown triggers; **nudges are
additive-only** (an idle signal can never delete or restructure, only add a `CoachNote`);
and agent-initiative changes to a focused surface are **queued, not dropped** — so the coach
still feels alive, it just waits for a polite moment. Tune `NUDGE_COOLDOWN_MS` and the
`defer`-on-blur behavior to taste; the shape is what Antigravity implements under T8c.

---

## 12. ATUI conformance contract — V1–V11 (from the 3-audit pass, 2026-06-04)

The adversarial A2UI conformance audit produced the **wiring contract** the production renderer
(T8a–T8c) must honor. The cosmetic kit simulates the loop; the real ATUI runtime must satisfy these:

| # | Rule the runtime must honor |
|---|---|
| V1 | The quiz is **graded server-side** — the client never holds `correctKey` or auto-advances; `event:answerSelected` → Jarvis patches the data model. |
| V2 | "Live" values are **data-bound** to JSON-Pointer paths, never hardcoded literals. |
| V3 | **Ember is not decorative** — an in-progress value is neutral (`--ink-muted` on a `--hairline` track); `--success` only when it truly means good/passed. |
| V4 | `Button` = a single child (`Row[Icon,Text]`) + an action; **no `icon`/`text` props**. |
| V5 | Multi-child layout is `Row`/`Column` + listed props — **the agent emits no CSS**. |
| V6 | `SkillMap` emits **topology only** (`{id,label,mastery,state}` + edge id-pairs); the renderer computes layout — no agent-supplied x/y. |
| V7 | `Reveal` uses a **bound `open`**, not `defaultOpen`, so the agent can open it as it teaches. |
| V8 | `PromptDiff` re-run is a **round-trip** (`event:regeneratePrompt`); the client never generates the improved prompt. |
| V9 | Tints derive via `color-mix` from the **3 theme tokens** — no raw hex on elements. |
| V10 | The agent emits **no dimensions** (`size`); the renderer sizes by context (or a `scale:"sm|md|lg"` enum). |
| V11 | **`SkillMeter.delta` — APPROVED (owner, 2026-06-04):** one optional bound `delta` prop on the existing `SkillMeter` (not a 12th component) carries the signed change vs. baseline, keeping the bar↔delta spring coupling with zero CSS. |

**A11y (from the audit):** agent text uses `--agent-hot` (AA at small sizes), raw `--agent` only on
the rail + shimmer (non-text); every weld pairs with a text-labeled presence change; reduced-motion
keeps a static warm hairline so the "just-made" chroma survives without motion.

## 13. What I did NOT do (role boundaries)

Per `AGENTS.md`, I'm the Director/Architect — this is a **spec**, not an implementation.
I did not edit `A2UIBuilder.js` (claimed by Antigravity under T0) or any `functions/**` file.
Execution is handed to Antigravity via ledger **T8**, phased per §8, behind the
`VITE_A2UI_RUNTIME_V2` flag so it never destabilizes the in-flight deployment work (T1–T7).
