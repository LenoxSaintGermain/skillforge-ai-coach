# Critique & Refinement Prompt Pack — "The Living Forge" mockup

> **Purpose:** Three role-specific, copy-paste-ready prompts to submit to Claude Design (or any
> reviewer) once the UX mockup of `SPEC_A2UI_agentic_experience.md` is rendered. Each turns the
> reviewer from *maker* into *critic* and audits the mockup against the spec's own commitments.
> **Produced by:** a 3-agent critique team (UX Research · Visual/Interaction Design · Design-Systems Architecture), Claude (Director), 2026-06-04.
> **Companion:** `docs/SPEC_A2UI_agentic_experience.md` · ledger **T8**.

---

## How to use

1. Wait for Claude Design's mockup to finish rendering.
2. Submit the three prompts below (§A, §B, §C). **Recommended order: C → A → B** (see "Sequencing").
3. Bring the three critiques back here; Claude (Director) will reconcile them into a single
   prioritized refinement list and fold accepted changes into the spec before T8 handoff.

### Sequencing (why C first)
- **C (Architecture) first** — it produces the *component-mapping ledger* that forces every
  visual element to name a real catalog component. If the mockup is non-conformant by
  construction (likely — see convergent finding #3), there's no point debating aesthetics yet.
- **A (Research) second** — comprehension/learnability findings reshape *what* the design must
  communicate.
- **B (Visual/Interaction) last** — refine the look once structure and meaning are settled.

---

## Convergent findings to watch (flagged independently by ≥2 lenses)

1. **Ember overload (Research A8/A10 + Design C2/#11).** `--ember` is asked to mean recency
   (weld) + active step + primary CTA + "ready to level up" (SkillMap). "Never decorative" can't
   hold because UI is *agent-generated* — scarcity isn't a design-time guarantee. **Likely needs a
   spec fix:** give "ready to level up" its own non-ember signal.
2. **Missing learner-initiation affordance (Research A3).** The loop is driven by learner events,
   but §6.3 removed the chat box without specifying where a learner *starts* an unprompted question.
3. **Code/spec contradiction (Architecture).** Live `Catalog.tsx` ships `Accordion, Table, Badge,
   Alert`, raw HTML + a nested-tree renderer — all outlawed by the `learn` catalog. A mockup that
   feels "consistent with the current app" is non-conformant by construction.
4. **Happy-path only (all three).** No error / stalled-SSE / empty-first / half-streamed /
   invalid-emit states are designed.
5. **Reduced-motion may drop the message, not just polish (Research A9 + Design #?, Arch R20).**
   §5.3 says "the change is the feedback" — removing the animation can remove the feedback.

---

# §A — UX RESEARCH critique prompt

```
You are now acting as a Senior UX Researcher reviewing the visual mockup you just
produced for "The Living Forge" (the A2UI agentic experience for SkillForge, per
SPEC_A2UI_agentic_experience.md). Switch from MAKER to CRITIC. Do not defend the
design; interrogate it from a UX RESEARCH lens — learnability, cognitive load,
mental models, error/recovery, trust & legibility of agent behavior, and
accessibility-as-evidence.

Evaluate the mockup against these falsifiable questions. For EACH, give a verdict
(PASS / PARTIAL / FAIL / NOT-SHOWN), one sentence of evidence from the mockup
itself, and — if not PASS — a concrete refinement.

FIRST-RUN COMPREHENSION
1. With zero onboarding, does this read as "the coach BUILDS the UI" (spec §1), or
   as a normal themed app? What's the 5-second-test takeaway?
2. On first weld, is "the system just made this for me" understandable without a
   tooltip (the ember-cools-to-neutral gesture, §6.1)?
3. With NO chat bubble (§6.3), where does a learner go to INITIATE a question?
   Is that affordance present and discoverable?

THE 5 SIGNATURE MOMENTS (§6)
4. Weld: does the entrance read as "forged" (ember→neutral, top-down) vs. a generic
   fade — and would it still feel intentional, not slow, on the 4th repeat?
5. Living surface: in the 5-question diagnostic (§6.2), are all THREE simultaneous
   feedback channels (ring fills / score ticks / next question welds) noticeable
   without change-blindness, and does the user keep their place?
6. Ambient Jarvis: is the idle "breathing dot" presence noticeable, and do CoachNotes
   read as the coach's VOICE vs. generic alerts?
7. SkillMap (§6.4): cold and with no legend, can a user answer "what am I best at?"
   and "what's next?" Is node-size=mastery + ember=ready decodable? Is tap-to-forge
   discoverable?
8. PromptDiff (§6.5): is it obvious the before-pane is EDITABLE and that "Forge"
   re-runs the diff live?

COLOR LANGUAGE (§5.1)
9. Do cool (--agent, "working") and warm (--ember, "just made") form a clean,
   non-confusable binary a user could decode pre-linguistically?
10. Verify WCAG AA contrast for --ink-muted (#d0d6e0) and especially --ink-subtle
    (#8a8f98) over --surface-1 (#0f1011) and --surface-2 (#141516). State the ratios.
11. Count ember's meanings on a single busy screen — recency, active step, primary
    CTA, AND "ready-to-level-up" SkillMap node. If more than one co-occurs, the
    signal is diluted. Is it?
12. Is ANY state conveyed by color or motion ALONE (violates §9)? List redundant
    text/icon/shape cues for each chromatic signal — or flag the ones missing them.

ACTION LOOP & PERCEIVED LATENCY (§3.1–§3.2, SSE per D2)
13. Does the streaming shimmer adequately occupy the click→weld wait? At what point
    would it read as "stuck" rather than "thinking"?
14. For operations that FEEL local but are server round-trips (dismiss/filter, §3.2),
    is acknowledgment fast enough that the round-trip isn't felt as lag?
15. Is there a double-submit / pending guard while an event is in flight?

ERROR / EMPTY / LOADING (the spec under-specifies these — design them now)
16. What does a STALLED or FAILED SSE stream look like? Is there a retry/"forge
    stalled" state and a shimmer timeout?
17. What's the empty FIRST state before any surface exists (the "void," §5.1)? Is it
    legible and inviting, or just black?
18. If Jarvis emits something invalid, or deleteSurface fires mid-task, what does the
    LEARNER see? Is recovery graceful or does the surface just vanish?
19. Show a half-streamed surface using the spec's "progressive placeholders" (§3). Is
    the in-between state legible, not broken-looking?

REACTIVE + NUDGE FELT EXPERIENCE (§10–§11)
20. When an idle CoachNote nudge appears (≤1 per 45s, §11), is it additive,
    non-blocking, dismissible, and respectful of a focused task — or does it shift
    layout / interrupt?
21. If a queued agent-initiative change applies on blur (§11), is there a "updated
    while you were away" cue, or does it silently surprise the returning user?

DELIVERABLE
- A scored table of the 21 items.
- The 3 highest-severity research risks, ranked, each with the failure mode and the
  cheapest test that would confirm/refute it.
- A revised mockup (or annotated callouts) addressing every FAIL and PARTIAL —
  especially the under-specified error/empty/loading and learner-initiation states.
Be specific and falsifiable. Cite the spec sections. Do not add features the spec
forbids: only two action shapes (event/functionCall, §3.2), no client-side
close/filter, agent owns all state.
```

---

# §B — VISUAL & INTERACTION DESIGN critique prompt

```
You are a Principal Visual & Interaction Designer reviewing a mockup of "The Living
Forge" against its spec (docs/SPEC_A2UI_agentic_experience.md, §5 design system + §6
signature moments). Evaluate ONLY from the visual + interaction lens (typography,
color, motion, spatial composition, atmosphere, micro-interactions, brand
distinctiveness). Do not comment on architecture, A2UI protocol, or code.

This product has ONE defining gesture (the Weld) and ONE rule that makes or breaks the
brand (the ember accent is *never decorative*). Hold the mockup to those mercilessly.
Praise is useless to me; I want specific, located, fixable findings.

Verify each of these against the mockup. For every item, answer PASS or FAIL, cite the
exact element/region, and if FAIL give the precise fix (token value, timing, or position):

1. Ember reservation — Is --ember #ff6b35 used ONLY on the active weld, the active Step,
   and the single primary CTA? List every ember element and justify it, or call it a
   leak. More than ~3 ember elements in one frame is a fail.
2. Canvas — Is the background --canvas #050507 (near-black with depth), not flat #000 and
   not a dark-gray dashboard or blue-tinted gradient?
3. Agent accent — Is --agent #5e6ad2 used exclusively for "Jarvis is working/streaming"
   (shimmer, breathing dot), never as decorative chrome?
4. Two-accent legibility — From a single still frame, can you tell whether the agent is
   thinking (cool shimmer) vs. just made something (warm weld)?
5. The Weld — Do new components resolve FROM a hot ember hairline (--ember-hot #ff8a5c /
   --hairline-warm #2a2320) that visibly COOLS to --hairline #23252a over ~1.2s, with a
   0.98→1 scale + ~8px rise, staggered top-down? Or do they just fade/pop in?
6. One orchestrated entrance — ONE staggered entrance per message, or scattered
   independent micro-animations (fidget)?
7. Streaming shimmer — Is "thinking" a 1px --agent gradient sweep on the surface's TOP
   hairline that STOPS the instant the first component lands — not a spinner, skeleton,
   or full-surface pulse?
8. Live ticks — Do ProgressRing/SkillMeter value changes spring-animate (never hard-jump)?
9. Bloom — Exactly ONE radial ember bloom, anchored at the most-recently-forged surface,
   drifting/fading — not multiple glows or a decorative aura?
10. Depth via hairlines — Panels separated by 1px --hairline #23252a + surface lightness
    steps (--surface-1 #0f1011 / --surface-2 #141516), with ZERO drop shadows?
11. Grain — Near-invisible grain overlay (~opacity 0.025), not flat-black slop and not
    visibly noisy?
12. Typography — Display face a characterful grotesque (Söhne / General Sans), NOT
    Inter/Roboto/Space Grotesk, negative tracking (~-0.02em) at display sizes? Code in
    Berkeley Mono / JetBrains Mono, not Courier/fallback? A real display-xl 64 moment and
    a legible 64/28/22/20/16/13 ramp with three ink levels (#f7f8f8 / #d0d6e0 / #8a8f98)?
13. In-place mutation — Answering a QuizCard reads as ring-fill + next-question-welds-
    in-place, NOT a page-swap or spinner-replace?
14. Ambient Jarvis — Coach lives in-surface (CoachNote hint/nudge/praise/warn + idle
    breathing dot), NOT a corner chat bubble?
15. Anti-slop — Confirm NONE of: purple→blue gradient hero, gradient-on-white, default
    glassmorphic frosted cards, neon glow-borders, emoji icons, generic centered-SaaS
    layout. Name any you find.

Then deliver:
- A GATING VERDICT: do checks 1 (ember), 5 (Weld), and 15 (anti-slop) all pass? If any
  fails, the mockup is off-brand — say so first.
- The 3 highest-leverage fixes, each a concrete change (token, timing in ms, or spatial
  move), ranked by impact on brand distinctiveness.
- One "too safe" call-out: where did the mockup take the obvious choice when the spec
  invited a bolder one? Propose the sharper alternative.

Do not soften findings. If something is generic, say "this is generic and here is the
specific reason and fix."
```

---

# §C — DESIGN-SYSTEMS / ARCHITECTURE critique prompt

```
You produced a visual mockup of "The Living Forge" — the A2UI agentic experience for
SkillForge (spec: docs/SPEC_A2UI_agentic_experience.md). Now switch hats: critique and
refine your OWN mockup for A2UI v0.9 PROTOCOL CONFORMANCE and IMPLEMENTABILITY against
the locked `learn` catalog. Beauty is assumed; I am testing fidelity. Be adversarial
with yourself.

HARD CONSTRAINTS (from the spec — treat as non-negotiable):
- The ONLY legal components are the 15 inherited from basic
  (Text, Image, Icon, Row, Column, List, Card, Tabs, Modal, Divider, Button, CheckBox,
   TextField, ChoicePicker, Slider) PLUS the 11 learn components
  (Markdown, ProgressRing, SkillMeter, Step, Stepper, QuizCard, Reveal, CodeBlock,
   PromptDiff, CoachNote, SkillMap). NOTHING else. No Accordion, Table, Badge, Alert,
   Dropdown, Tooltip, Toast, Chart, Nav, Breadcrumb, Date picker.
- Button = child Text + action. Button has NO text/label prop.
- Card wraps EXACTLY ONE child (use Row/Column for multiples).
- Collapsibles are Reveal (summary + single child + bindable `open`). Accordion is illegal.
- Each component may use ONLY the properties listed in spec §4.2. No invented props.
- Only TWO action shapes exist: { event: {...} } (server round-trip to Jarvis) and
  { functionCall: { call, args } } where call is a REGISTERED function only
  (required, regex, email, formatString, formatCurrency, openUrl, and, or, not,
   copyToClipboard, highlightDiff). There is NO client-side close, filter, sort, or
   dismiss function — those are server round-trips ending in deleteSurface.
- Inputs are LOCAL until an action fires (no per-keystroke agent reactions).
- "Live" values (ring %, score, step index, skill values, reveal open-state, skillmap
  nodes/edges) must be DATA-BOUND to JSON-Pointer paths, not hardcoded literals.
- The agent emits NO CSS. Theme tokens are ONLY primaryColor / agentDisplayName / iconUrl.
  Grain, ember bloom, glass, shimmer, weld, and all motion are RENDERER-owned styling
  keyed off protocol STATE — not properties in the A2UI message.
- Color tokens only: --ember (weld/active-step/primary-CTA ONLY, never decorative),
  --agent (streaming/working ONLY), --ink/--ink-muted/--ink-subtle, --surface-1/2,
  --hairline. No raw hex on elements. Depth = hairlines + surface steps, NOT shadows.
- Jarvis presence = in-surface CoachNote + --agent shimmer + idle breathing dot.
  NOT a corner chat bubble or fixed sidebar.
- Authorization (D1 reactive+nudge): the agent may not restructure a FOCUSED surface on
  its own initiative; idle nudges are additive CoachNotes only, rate-limited, not stacked.

DELIVER, in this order:
1. A COMPONENT-MAPPING LEDGER: a table — every distinct visual element → the exact
   catalog component + the exact properties it uses + (for interactive elements) which
   action shape and which registered function. Force a mapping for EVERY element.
2. VIOLATIONS FOUND: list each place your mockup breaks a hard constraint above. For each,
   state the rule, what you drew, and the FIX — and label the fix as one of:
   (a) constrain the design to the catalog,
   (b) propose a documented catalog extension (a new component/property with a one-line
       schema sketch and why the existing 11+15 genuinely can't express it),
   (c) make it a server round-trip.
   Default strongly to (a) or (c); (b) requires real justification because v1 is locked
   at 11 components (owner decision D3).
3. THE WELD & STREAMING, in protocol terms: describe the exact message sequence
   (createSurface → updateDataModel → updateComponents → …) that produces each animated
   moment, so a renderer engineer can reproduce it. If a moment can't be expressed as a
   message sequence, flag it.
4. THE DIAGNOSTIC LOOP (§6.2) as messages: show the QuizCard answer → answerSelected event
   → Jarvis's updateDataModel (ring/score) + updateComponents (next question welds in
   place). Confirm NO full re-render and NO page transition.
5. A11Y/THEMING PASS: check --ink-subtle/--ink-muted contrast over --surface-1/2 for WCAG
   AA; confirm no meaning is color- or motion-only; give the reduced-motion fallback for
   the weld and shimmer; confirm theme stays within the 3 allowed tokens.
6. REVISED MOCKUP: regenerate only the parts that violated, keeping everything that passed.

Do not loosen any constraint to make the design easier. If the design is better than the
catalog allows, say so explicitly and route it through item 2(b) — do not smuggle it in.
```

---

## Appendix — full rubrics (reference, not for submission)

The three agents produced longer evaluation rubrics behind these prompts (21 research checks,
18 visual/motion checks, 21 architecture checks + a component-mapping-ledger method). They are
summarized in the prompts above; the full versions live in the critique-team transcript and can
be expanded into a scored review template on request.
