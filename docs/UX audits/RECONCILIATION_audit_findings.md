# Audit reconciliation — The Living Forge (3 audits + v3 update)

> **Reviewer:** Claude (Director). **Inputs:** the 3 standalone audit reports + the updated
> design-system zip (`ui_kits/skillforge-learn-v3/`) in `docs/UX audits/`.
> **Purpose:** one prioritized read of what the audits found, what v3 actually fixed (verified,
> not self-reported), what remains, and how it maps to the spec, the `/living-forge` code, and the
> Aether harness brief.

---

## 1. Verdict scorecard

| Audit (lens) | Result | Headline |
|---|---|---|
| **Visual & Interaction** (B) | **GATE FAILS** on ember; 11 pass / 4 fail | *"The weld is real. The ember is leaking."* De-ember chrome → ships. |
| **A2UI Conformance** (C) | **11 violations** (9 fix-in-place · 3 round-trip · 1 extension) | *"The five moments survive the catalog. The plumbing under them did not."* Shapes legal; wiring broke. |
| **UX Research** (A) | 4 pass · 9 partial · **2 fail** · 6 not-shown | *"The happy path is legible. The product has no front door, and no bad day."* |

---

## 2. The convergent finding (all three, independently) — EMBER OVERLOAD

Visual **#1 (gate-fail)**, Conformance **V3**, Research **Q11** independently flagged the same
thing: **ember is used for ~4 meanings** (the weld/recency · the active step · the one CTA · and
illegitimately the SkillMap "ready/opportunity" ring + decorative chrome). Three methodologies,
one verdict — the strongest signal it was real.

**This is the flaw we parked, then pre-resolved in the Aether §4 color decision** (ember retreats
from consequence/opportunity; "ready" becomes a non-ember pulse+dashed+size). The audits validate
that decision blind. ✅ **v3 implements it:** SkillMap ready node = `--ink` ring + dashed
`--ink-subtle` edge + pulse; brand chrome de-embered to `--ink`.

---

## 3. v3 update — verified against the findings

Checked the zip's `forge.css` / `*.jsx` directly (not the self-report):

| Finding | Source | v3 status |
|---|---|---|
| De-ember persistent chrome (logo, wordmark, "Forged" label, verdict icon) | Visual #1 | ✅ `--ink`/`--ink-subtle` |
| SkillMap "ready" off ember → pulse + dashed + size | Visual, Conf V3, Res Q11 | ✅ `--ink` ring + dashed `--ink-subtle` + pulse |
| Agent text fails AA at small size → `--agent-hot` | Conf a11y | ✅ `.presence.thinking` + cn-title repainted |
| Deploy display tier (44/64 moment) | Visual #12 | ⚠️ partial — 42px `h2.hero` added; 64px **results** moment not confirmed |
| Front door — persistent composer (TextField+send→`event`) | Res Q3 (FAIL) | ✅ `COMPOSER` section in `app.jsx` |
| Bad day — cold-open, stall/retry, graceful dismissal | Res Q16–18 (NOT-SHOWN) | ✅ `STALL`/`RETRY`/cold-open wired |
| Idle nudge (append, dismissible, 1/45s, replace-not-stack) | Res Q20 | ✅ `NUDGE` section |
| Quiz correct/wrong non-color cue (check/✗) | Conf a11y | ✅ icons added |
| Kill skeleton; thinking = top-hairline sweep only | Visual #7 | ⚠️ `.skel` still present — confirm it's repurposed for *progressive placeholders* (post-first-component), not the opening "thinking" signal |
| Bloom drifts/fades 0.7→~0.35 between forges | Visual #9 | ❌ still holds 0.7 (minor) |
| Reduced-motion keeps a static warm hairline (chroma survives) | Conf a11y | ⚠️ confirm |

**Bottom line:** v3 resolves the gate-fail and both structural FAILs. Open items are minor/polish
(64px results moment, skeleton role, bloom drift) — none are blockers.

---

## 4. Conformance violations that matter for the REAL build (not the cosmetic kit)

These are about the **production ATUI/A2UI message layer** (T8a–T8c), which the cosmetic kit only
simulates. Capture them now so the runtime is built right:

| # | Violation | Fix | Class |
|---|---|---|---|
| V1 | Client grades the quiz + auto-advance timer | grade server-side; `event:answerSelected` → Jarvis patches data model | round-trip |
| V2 | "Live" values hardcoded | data-bind to JSON-Pointer paths | fix-in-place |
| V3 | Ember as decorative ring/meter | neutral `--ink-muted` on `--hairline`; `--success` only when truly good | fix-in-place |
| V4 | `Button icon=` prop + text-as-prop | child = `Row[Icon, Text]`; no invented props | fix-in-place |
| V5 | Layout via styled `<div>`s | `Row`/`Column` + listed props | fix-in-place |
| V6 | SkillMap nodes carry x/y | emit **topology only**; renderer computes layout | fix-in-place |
| V7 | `Reveal defaultOpen` | bound `open` (agent can open as it teaches) | fix-in-place |
| V8 | PromptDiff re-runs locally | `event:regeneratePrompt` → agent returns new diff | round-trip |
| V9 | Raw hex tints on elements | derive via `color-mix` from the 3 theme tokens | fix-in-place |
| V10 | `ProgressRing.size` px | renderer-sized, or a `scale:"sm|md|lg"` enum | fix-in-place |
| **V11** | **SkillMeter "+18" delta badge** | **the ONE genuine catalog extension** — add an optional bound `delta` prop to the existing `SkillMeter` (not a new component) | **extension → owner D-call** |

> **Owner decision needed (V11):** approve adding an optional bound `delta` to `SkillMeter`?
> It keeps the bar↔delta spatial + spring coupling in one component with zero CSS. Fallback if no:
> demote "+18" to plain text in the label slot (loses the animation coupling). *Recommend: approve.*

---

## 5. The two structural gaps (UX Research — the actual study)

1. **No front door (Q3, FAIL).** With the chat bubble correctly gone, the learner's only
   initiative was two scripted buttons — so *"the coach builds UI around your next move"* couldn't
   be learner-driven. **Fix (in v3):** a persistent in-surface **composer** (`TextField` + send →
   `event:ask`), docked at the column foot — not a floating bubble. **→ This resolves the parked
   §6.3 learner-initiation flaw.** The spec should adopt it.
2. **No bad day (Q16–19, NOT-SHOWN).** Stalled streams, invalid emits, mid-task `deleteSurface`,
   the cold-open void, progressive placeholders — all undesigned; a *legible-agency* product is
   judged hardest when the agent struggles. **Fix (in v3):** cold-open void + composer; "Forge
   stalled / Try again" warn note; reverse-weld dismissal; "couldn't render that" placeholder;
   per-component progressive welding. **→ The spec needs a new error/empty/loading section.**

Plus felt-experience refinements (all spec-legal): weld the intro; full weld for novel surfaces /
400ms accent for in-place mutations; bring the progress tick to the fovea; signify tappability on
ready nodes; unify PromptDiff editing into the before-pane.

---

## 6. Impact on the `/living-forge` implementation (mine)

My `/living-forge` build is a faithful port of the **pre-audit** kit, so it carries the exact
issues the audits caught: ember chrome leak, `--agent` small-text AA fail, raw-hex tints,
color-only quiz states, SkillMap ember "ready", no composer, no error states, no display tier.
**Options:** (a) **re-sync the Forge module to v3** (mostly token-level CSS + a few JSX edits —
cheap, high-value, makes the live route audit-clean); or (b) **park `/living-forge`** and let it be
superseded by the Aether harness work. *Recommend (a)* if we want a clean live reference now.

---

## 7. Impact on the Aether harness brief (v2)

The audit fixes **transfer directly** to the side-panel and should be folded in:
- The **composer** (front door) is already a brief requirement (docked input) — now validated.
- The **bad-day states** (cold-open, stall/retry, "couldn't render", reverse-weld dismissal) should
  be **explicit deliverables** in the side-panel's "4 critical states" (the brief's Empty/Analyzing
  states overlap; add **Stalled** + **Couldn't-render**).
- **Ember discipline** is even more critical in a 360px panel — the §4 decision + the de-ember
  fixes carry over verbatim.
- **V1–V10** are the protocol contract the ATUI side-panel renderer must honor.

---

## 8. Recommended next actions

1. **Owner D-call:** approve the **`SkillMeter.delta`** extension (V11)? *(recommend yes)*
2. **Spec update** (`SPEC_A2UI_agentic_experience.md`): add the **composer/front-door** (§6.3) and a
   new **error/empty/loading** section; record V1–V11 as the ATUI conformance contract for T8.
3. **`/living-forge`:** re-sync to v3 (de-ember + a11y + composer + stall) — or park. *(owner pick)*
4. **Aether brief v2:** add **Stalled** + **Couldn't-render** to the side-panel critical states;
   note the audits validate the composer + ember discipline. *(low effort, do alongside)*
5. Close the loop on the 3 minor v3 opens (64px results moment, skeleton role, bloom drift) when
   the design agent next iterates — not blockers.
