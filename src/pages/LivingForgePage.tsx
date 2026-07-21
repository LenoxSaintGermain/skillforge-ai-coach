/**
 * The Living Forge — the A2UI agentic experience demo surface (v3, audit-revised).
 *
 * Ported from Claude Design's v3 `app.jsx`. Simulates Jarvis's SSE stream
 * (think → forge → mutate in place) with timers + a JSON-Pointer data model
 * standing in for `updateDataModel`. Audit refinements wired in as live behavior:
 *   · a persistent in-surface COMPOSER (learner initiation; no chat bubble)
 *   · a STALL / RETRY state with shimmer escalation
 *   · an additive, dismissible, rate-limited idle NUDGE
 * Swap the timers for a real A2UI message stream (spec §7) to make it live.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  Block, Weld, Welded, ThinkingBlock, QuizCard, PromptDiff, SkillMap,
  Presence, ProgressRing, SkillMeter, CoachNote, Reveal, Button, Row, Column, Text, Markdown, Icon,
  type PresenceState, type SkillNode, type DiffSegment, type ChoiceState,
} from "@/components/a2ui/forge";
import "@/components/a2ui/forge/forge.css";

/* ===== JSON-Pointer data-model helpers ================================== */
type Patch = { path: string; value: unknown };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setPtr(obj: any, path: string, value: unknown): any {
  const parts = path.split("/").slice(1);
  const clone = structuredClone(obj);
  let cur = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
  return clone;
}
const applyPatches = (obj: DataModel, patches: Patch[]): DataModel =>
  patches.reduce((o, p) => setPtr(o, p.path, p.value), obj);

/* ===== Data-model shape ================================================= */
interface DiagDM {
  index: number; total: number; score: number; progress: number; correctLabel: string;
  q: { prompt: string; choices: { key: string; label: string }[] };
  choiceState: ChoiceState; feedback: { tone: "praise" | "hint"; text: string } | null;
}
interface ResultsDM {
  scorePct: number; scoreLabel: string; scoreSub: string;
  meters: { skill: string; value: number; delta?: number; tone: "neutral" | "success" }[]; praise: string;
}
interface MapDM { nodes: SkillNode[]; edges: [string, string][]; }
interface LessonDM { node: SkillNode; whyOpen: boolean; }
interface PromptDM { before: string; after: DiffSegment[]; verdict: string; draft: string; }
interface AnswerDM { ask: string; body: string; why: string; whyOpen: boolean; }
interface DataModel {
  diag: DiagDM | null; results: ResultsDM | null; map: MapDM | null;
  lesson: LessonDM | null; prompt: PromptDM | null; answer: AnswerDM | null;
}

/* ===== "server" content (sim / agent side) ============================= */
interface QuizQ {
  prompt: string; choices: { key: string; label: string }[]; correctKey: string; right: string; wrong: string;
}
const QUIZ: QuizQ[] = [
  { prompt: "An A2UI surface updates in place when the learner answers. What carries the new state?",
    choices: [{ key: "a", label: "A full page re-render" }, { key: "b", label: "updateDataModel at a JSON-Pointer path" }, { key: "c", label: "A browser redirect" }],
    correctKey: "b", right: "Exactly — the data model ticks, bound components re-render. No reload.", wrong: "Not quite — state flows through updateDataModel, not a re-render." },
  { prompt: "How does a brand-new component tree reach the surface?",
    choices: [{ key: "a", label: "updateComponents — a flat array assembled by ID refs" }, { key: "b", label: "A nested JSON blob walked once" }, { key: "c", label: "Inline HTML strings" }],
    correctKey: "a", right: 'Right. A flat adjacency list, tree built from id:"root" down.', wrong: "That's the old one-shot way — A2UI streams a flat array instead." },
  { prompt: "A learner clicks an answer. Which action shape sends it to Jarvis?",
    choices: [{ key: "a", label: "functionCall — runs locally" }, { key: "b", label: "event — round-trips to the agent" }, { key: "c", label: "Both, always" }],
    correctKey: "b", right: "Yes — events round-trip; the agent decides what happens next.", wrong: "functionCall is local-only; learner intent rides an event." },
  { prompt: "What is the ONLY way a surface goes away?",
    choices: [{ key: "a", label: "A client-side close() function" }, { key: "b", label: "deleteSurface from the agent" }, { key: "c", label: "It times out" }],
    correctKey: "b", right: "Correct — dismissal is a server round-trip. The agent stays in the loop.", wrong: "There's no local close — only the agent can deleteSurface." },
  { prompt: "Why is `Reveal` used instead of `Accordion`?",
    choices: [{ key: "a", label: "Accordion is illegal in basic-catalog validators" }, { key: "b", label: "Accordion is slower" }, { key: "c", label: "No reason" }],
    correctKey: "a", right: "Right — and Reveal's bound `open` lets the agent open it as it teaches.", wrong: "It's a validation thing: Accordion breaks basic-catalog rules." },
];
const pubQ = (q: QuizQ) => ({ prompt: q.prompt, choices: q.choices });

const SKILL_NODES: SkillNode[] = [
  { id: "structure", label: "Structure", mastery: 0.82 }, { id: "fewshot", label: "Few-shot", mastery: 0.45 },
  { id: "constraints", label: "Constraints", mastery: 0.6 }, { id: "promptcraft", label: "Prompt-craft", mastery: 0.35, state: "ready" },
  { id: "evals", label: "Eval loops", mastery: 0.15, state: "ready" }, { id: "chaining", label: "Chaining", mastery: 0.5 },
];
const SKILL_EDGES: [string, string][] = [
  ["structure", "fewshot"], ["structure", "constraints"], ["fewshot", "promptcraft"],
  ["constraints", "promptcraft"], ["promptcraft", "evals"], ["constraints", "chaining"], ["promptcraft", "chaining"],
];
const DIFF_AFTER: DiffSegment[] = [
  { t: "eq", v: "Summarize this article" }, { t: "add", v: " in exactly 3 bullet points" }, { t: "eq", v: " for " },
  { t: "del", v: "people" }, { t: "add", v: "a busy executive" }, { t: "eq", v: ".\n" },
  { t: "add", v: "Lead each bullet with a verb. No preamble." },
];
const INITIAL_DM: DataModel = { diag: null, results: null, map: null, lesson: null, prompt: null, answer: null };
const IDLE_MS = 20000; // demo value; spec §11 is ≤1 nudge / 45s

function answerFor(ask: string): AnswerDM {
  return {
    ask,
    body: "Good question. The shortest path: pin the **shape** of one ideal example, show the **gold output**, then add the one **boundary** it should teach — not five mediocre samples.",
    why: "Few-shot quality beats quantity because the model copies the *form* of your examples; one sharp pair out-teaches a noisy handful.",
    whyOpen: false,
  };
}

interface Entry { id: string; kind: string; rows?: number; caption?: string; text?: string; topic?: string; }

/* ===== Page ============================================================= */
export default function LivingForgePage() {
  const [dm, setDm] = useState<DataModel>(INITIAL_DM);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [presence, setPresence] = useState<PresenceState>("idle");
  const [busy, setBusy] = useState(false);
  const [bloom, setBloom] = useState({ x: 62, y: 42 });
  const [composer, setComposer] = useState("");
  const idRef = useRef(0), askRef = useRef(0);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nid = () => "e" + ++idRef.current;
  const update = (patches: Patch[]) => setDm((prev) => applyPatches(prev, patches));

  useEffect(() => {
    setEntries([{ id: nid(), kind: "intro" }]);
    armIdle();
    return () => { if (idleRef.current) clearTimeout(idleRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const t = setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 120);
    return () => clearTimeout(t);
  }, [entries]);
  const moveBloom = () => setBloom({ x: 40 + Math.random() * 35, y: 55 + Math.random() * 20 });

  /* ---- idle nudge: additive, dismissible, replace-not-stack ------------- */
  function armIdle() { if (idleRef.current) clearTimeout(idleRef.current); idleRef.current = setTimeout(fireNudge, IDLE_MS); }
  function fireNudge() {
    if (busy) { armIdle(); return; }
    setEntries((e) => e.filter((x) => x.kind !== "nudge").concat({ id: nid(), kind: "nudge" }));
  }
  function dismissNudge() { setEntries((e) => e.filter((x) => x.kind !== "nudge")); armIdle(); }

  /* ---- scripted forge (think → weld), seeds the data model -------------- */
  function forgeSurface(kind: string, seed: Patch[] = [], { think = 1100 }: { think?: number } = {}) {
    if (busy) return;
    armIdle();
    setEntries((e) => e.filter((x) => x.kind !== "nudge"));
    setBusy(true);
    setPresence("thinking");
    const tid = nid();
    setEntries((e) => [...e, { id: tid, kind: "thinking" }]);
    setTimeout(() => {
      if (seed.length) update(seed);
      setPresence("forging");
      moveBloom();
      setEntries((e) => e.filter((x) => x.id !== tid).concat({ id: nid(), kind }));
      setTimeout(() => { setPresence("idle"); setBusy(false); armIdle(); }, 1200);
    }, think);
  }

  /* ---- composer ask: learner initiates; may stall, retry succeeds ------- */
  function submitAsk(text: string) {
    const t = (text || "").trim();
    if (!t || busy) return;
    setComposer("");
    armIdle();
    setEntries((e) => e.filter((x) => x.kind !== "nudge").concat({ id: nid(), kind: "echo", text: t }));
    const n = ++askRef.current;
    startAsk(t, n % 2 === 0); // deterministic demo: every 2nd ask stalls, retry succeeds
  }
  function startAsk(topic: string, willStall: boolean) {
    setBusy(true);
    setPresence("thinking");
    const tid = nid();
    setEntries((e) => [...e, { id: tid, kind: "thinking" }]);
    const esc = setTimeout(
      () => setEntries((e) => e.map((x) => (x.id === tid ? { ...x, caption: "Still forging…" } : x))), 1700);
    setTimeout(() => {
      clearTimeout(esc);
      if (willStall) {
        setPresence("idle"); setBusy(false); armIdle();
        setEntries((e) => e.filter((x) => x.id !== tid).concat({ id: nid(), kind: "stall", topic }));
      } else {
        setPresence("forging"); moveBloom();
        update([{ path: "/answer", value: answerFor(topic) }]);
        setEntries((e) => e.filter((x) => x.id !== tid).concat({ id: nid(), kind: "answer" }));
        setTimeout(() => { setPresence("idle"); setBusy(false); armIdle(); }, 1200);
      }
    }, 2600);
  }
  function retryAsk(stallId: string, topic: string) {
    if (busy) return;
    setEntries((e) => e.filter((x) => x.id !== stallId));
    startAsk(topic, false); // a retry always succeeds in the demo
  }

  /* ---- scenario actions ---- */
  const runDiagnostic = () => forgeSurface("diagnostic", [{ path: "/diag", value: { index: 0, total: QUIZ.length, score: 0, progress: 0, correctLabel: "0 correct so far", q: pubQ(QUIZ[0]), choiceState: null, feedback: null } }], { think: 1200 });

  function answerSelected(choice: string) {
    if (!dm.diag) return;
    const i = dm.diag.index;
    const correct = QUIZ[i].correctKey === choice;
    const newScore = dm.diag.score + (correct ? 1 : 0);
    armIdle();
    setPresence("thinking");
    update([
      { path: "/diag/choiceState", value: correct ? { [choice]: "correct" } : { [choice]: "wrong", [QUIZ[i].correctKey]: "correct" } },
      { path: "/diag/score", value: newScore },
      { path: "/diag/correctLabel", value: newScore + " correct so far" },
      { path: "/diag/feedback", value: { tone: correct ? "praise" : "hint", text: correct ? QUIZ[i].right : QUIZ[i].wrong } },
    ]);
    setTimeout(() => {
      const next = i + 1;
      if (next >= QUIZ.length) { setPresence("idle"); showResults(newScore); return; }
      setPresence("idle");
      update([
        { path: "/diag/index", value: next }, { path: "/diag/progress", value: next / QUIZ.length },
        { path: "/diag/q", value: pubQ(QUIZ[next]) }, { path: "/diag/choiceState", value: null }, { path: "/diag/feedback", value: null },
      ]);
    }, 1700);
  }
  const showResults = (score: number) => forgeSurface("results", [{ path: "/results", value: { scorePct: score / QUIZ.length, scoreLabel: String(score), scoreSub: "of " + QUIZ.length, meters: [{ skill: "A2UI protocol", value: 0.78, delta: 18, tone: "success" }, { skill: "Surface lifecycle", value: 0.64, delta: 11, tone: "neutral" }], praise: "You nailed the surface-lifecycle ones — let's turn that into prompt-craft next." } }], { think: 1300 });
  const showMap = () => forgeSurface("map", [{ path: "/map", value: { nodes: SKILL_NODES, edges: SKILL_EDGES } }], { think: 1400 });
  function openSkill(n: SkillNode) {
    if (n.id === "promptcraft") return practicePrompt();
    forgeSurface("lesson", [{ path: "/lesson", value: { node: { id: n.id, label: n.label, mastery: n.mastery, state: n.state ?? null }, whyOpen: true } }], { think: 1100 });
  }
  const practicePrompt = () => forgeSurface("prompt", [{ path: "/prompt", value: { before: "Summarize this article for people.", after: DIFF_AFTER, verdict: "Stronger: a concrete count, a named audience, and an output constraint. Specificity beats politeness.", draft: "Summarize this article for people." } }], { think: 1300 });
  function regeneratePrompt() {
    setPresence("thinking");
    setTimeout(() => { setPresence("idle"); update([{ path: "/prompt/verdict", value: "Re-forged against your edit — same three levers: a count, an audience, a constraint." }]); }, 900);
  }
  const toggleWhy = (v: boolean) => update([{ path: "/lesson/whyOpen", value: v }]);
  const toggleAnswerWhy = (v: boolean) => update([{ path: "/answer/whyOpen", value: v }]);
  const setDraft = (v: string) => update([{ path: "/prompt/draft", value: v }]);
  const focusComposer = () => document.getElementById("composer-input")?.focus();

  /* ---- render a surface from the live data model ---- */
  function renderEntry(e: Entry) {
    switch (e.kind) {
      case "intro": return <IntroBlock onRun={runDiagnostic} onMap={showMap} onAsk={focusComposer} />;
      case "thinking": return <ThinkingForge caption={e.caption} />;
      case "echo": return <div className="echo-line">{e.text}</div>;
      case "stall": return <StallSurface topic={e.topic ?? ""} onRetry={() => retryAsk(e.id, e.topic ?? "")} />;
      case "nudge": return <NudgeSurface onShow={practicePrompt} onDismiss={dismissNudge} />;
      case "answer": return dm.answer ? <AnswerSurface a={dm.answer} onToggleWhy={toggleAnswerWhy} onPractice={practicePrompt} /> : null;
      case "diagnostic": return dm.diag ? <DiagnosticSurface diag={dm.diag} onAnswer={answerSelected} /> : null;
      case "results": return dm.results ? <ResultsSurface r={dm.results} onPractice={practicePrompt} onMap={showMap} /> : null;
      case "map": return dm.map ? <MapSurface map={dm.map} onNode={openSkill} /> : null;
      case "lesson": return dm.lesson ? <LessonSurface l={dm.lesson} onToggleWhy={toggleWhy} onStart={runDiagnostic} /> : null;
      case "prompt": return dm.prompt ? <PromptSurface p={dm.prompt} onDraft={setDraft} onForge={regeneratePrompt} /> : null;
      default: return null;
    }
  }

  return (
    <div className="forge-root">
      <div className="app">
        <div className="forge-bg">
          <div className="forge-grain" />
          <div className="forge-bloom" style={{ left: bloom.x + "%", top: bloom.y + "%" }} />
        </div>
        <header className="appbar">
          <div className="brand">
            <span className="brand-spark"><span className="d" /></span>
            <span className="brand-name">Skill<b>Forge</b></span>
          </div>
          <Presence state={presence} name="Jarvis" />
        </header>
        <main className="surface-col">
          {entries.map((e) => <div key={e.id}>{renderEntry(e)}</div>)}
        </main>
        <Composer value={composer} onChange={setComposer} onSend={() => submitAsk(composer)} busy={busy} />
      </div>
    </div>
  );
}

/* ===== Composer — TextField + Button → event:ask ======================== */
function Composer({ value, onChange, onSend, busy }: { value: string; onChange: (v: string) => void; onSend: () => void; busy: boolean }) {
  return (
    <div className="composer-dock">
      <div className={"composer" + (value.trim() ? "" : " muted")}>
        <span className="c-icon" aria-hidden="true"><Icon name="pen-line" size={17} /></span>
        <input id="composer-input" value={value} disabled={busy}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSend(); }}
          placeholder="Ask Jarvis, or describe what you want to practice…" aria-label="Ask Jarvis" />
        <button className="send" onClick={onSend} disabled={busy || !value.trim()} aria-label="Ask">
          <Icon name="arrow-up" size={17} />
        </button>
      </div>
    </div>
  );
}

/* ===== Small surfaces =================================================== */
function ThinkingForge({ caption }: { caption?: string }) {
  return (
    <div>
      <ThinkingBlock />
      {caption && <div className="thinking-caption weld-in"><span className="breath-dot" />{caption}</div>}
    </div>
  );
}

function StallSurface({ topic, onRetry }: { topic: string; onRetry: () => void }) {
  return (
    <Block>
      <CoachNote tone="warn">That took longer than it should — the forge stalled before it finished. Your place is saved; nothing was lost.</CoachNote>
      <Row gap={10} style={{ marginTop: 16 }}>
        <Button emphasis="primary" action={onRetry}>
          <Row gap={8} align="center"><Icon name="rotate-ccw" size={16} /><Text>Try again</Text></Row>
        </Button>
        <span className="metric-label" style={{ color: "var(--ink-subtle)" }}>retrying "{topic.length > 40 ? topic.slice(0, 40) + "…" : topic}"</span>
      </Row>
    </Block>
  );
}

function NudgeSurface({ onShow, onDismiss }: { onShow: () => void; onDismiss: () => void }) {
  return (
    <div className="nudge-wrap weld-in">
      <CoachNote tone="nudge">You've been here a moment — want me to forge a side-by-side prompt example to practice on?</CoachNote>
      <Row gap={10} style={{ marginTop: 12 }}>
        <Button emphasis="secondary" action={onShow}><Row gap={8} align="center"><Icon name="git-fork" size={15} /><Text>Show me</Text></Row></Button>
        <Button emphasis="ghost" action={onDismiss}><Text>Not now</Text></Button>
      </Row>
    </div>
  );
}

function AnswerSurface({ a, onToggleWhy, onPractice }: { a: AnswerDM; onToggleWhy: (v: boolean) => void; onPractice: () => void }) {
  return (
    <Block>
      <Text style="eyebrow">Forged for you</Text>
      <h2>{a.ask}</h2>
      <Welded i={1}><Markdown text={a.body} /></Welded>
      <Welded i={2} style={{ marginTop: 14 }}>
        <Reveal summary="Why this works" open={a.whyOpen} onToggle={onToggleWhy}><Markdown text={a.why} /></Reveal>
      </Welded>
      <Welded i={3}>
        <Row gap={10} style={{ marginTop: 18 }}>
          <Button emphasis="primary" action={onPractice}><Row gap={8} align="center"><Icon name="git-fork" size={16} /><Text>Practice this</Text></Row></Button>
        </Row>
      </Welded>
    </Block>
  );
}

/* ===== Scenario surfaces =============================================== */
function IntroBlock({ onRun, onMap, onAsk }: { onRun: () => void; onMap: () => void; onAsk: () => void }) {
  return (
    <Block weld={false}>
      <Text style="eyebrow">Lesson 04 · The Living Forge</Text>
      <h2 className="hero">UI you can watch being built</h2>
      <Markdown text="SkillForge doesn't render a page that *happens* to have AI in it. Jarvis reads your next move, then **forges the exact surface that moment needs** — live, in front of you." />
      <Markdown text="Run the quick diagnostic, open your skill map, or just **ask in the bar below** — every answer mutates the surface in place. No reloads." />
      <div style={{ marginTop: 18 }}>
        <CoachNote tone="hint">Watch the hairline when a surface appears — it lights ember-hot, then cools. That's the weld. It means I just made something for you.</CoachNote>
      </div>
      <Row gap={10} wrap style={{ marginTop: 18 }}>
        <Button emphasis="primary" action={onRun}><Row gap={8} align="center"><Icon name="flame" size={16} /><Text>Run a quick diagnostic</Text></Row></Button>
        <Button emphasis="secondary" action={onMap}><Row gap={8} align="center"><Icon name="orbit" size={16} /><Text>How am I doing?</Text></Row></Button>
        <Button emphasis="ghost" action={onAsk}><Row gap={8} align="center"><Icon name="message-circle" size={16} /><Text>Ask something</Text></Row></Button>
      </Row>
    </Block>
  );
}

function DiagnosticSurface({ diag, onAnswer }: { diag: DiagDM; onAnswer: (k: string) => void }) {
  return (
    <Block>
      <Text style="eyebrow">Diagnostic · {diag.total} questions</Text>
      <div style={{ height: 10 }} />
      <Row gap={18} align="center">
        <ProgressRing value={diag.progress} label={String(diag.index)} sub={"of " + diag.total} scale="md" tone="neutral" />
        <Column gap={3}><h3>Diagnostic</h3><span className="metric-label">{diag.correctLabel}</span></Column>
      </Row>
      <hr className="divider" style={{ margin: "16px 0" }} />
      <Weld key={diag.index}>
        <QuizCard prompt={diag.q.prompt} choices={diag.q.choices} state={diag.choiceState} onAnswer={onAnswer} />
        {diag.feedback && <div className="weld-in" style={{ marginTop: 16 }}><CoachNote tone={diag.feedback.tone}>{diag.feedback.text}</CoachNote></div>}
      </Weld>
    </Block>
  );
}

function ResultsSurface({ r, onPractice, onMap }: { r: ResultsDM; onPractice: () => void; onMap: () => void }) {
  return (
    <Block>
      <Row gap={24} align="center" wrap>
        <Welded i={0}><ProgressRing value={r.scorePct} label={r.scoreLabel} sub={r.scoreSub} tone="success" /></Welded>
        <Column gap={14} style={{ flex: 1, minWidth: 240 }}>
          <Welded i={1} tag="h2">Diagnostic complete</Welded>
          {r.meters.map((m, i) => <Welded key={m.skill} i={2 + i}><SkillMeter skill={m.skill} value={m.value} delta={m.delta} tone={m.tone} /></Welded>)}
        </Column>
      </Row>
      <Welded i={4}><div style={{ marginTop: 18 }}><CoachNote tone="praise">{r.praise}</CoachNote></div></Welded>
      <Welded i={5}>
        <Row gap={10} wrap style={{ marginTop: 18 }}>
          <Button emphasis="primary" action={onPractice}><Row gap={8} align="center"><Icon name="git-fork" size={16} /><Text>Practice prompt-craft</Text></Row></Button>
          <Button emphasis="secondary" action={onMap}><Row gap={8} align="center"><Icon name="orbit" size={16} /><Text>Show my skill map</Text></Row></Button>
        </Row>
      </Welded>
    </Block>
  );
}

function MapSurface({ map, onNode }: { map: MapDM; onNode: (n: SkillNode) => void }) {
  return (
    <Block>
      <Text style="eyebrow">Your skills</Text>
      <Welded i={1} tag="h2">Where you are</Welded>
      <Welded i={2}><Markdown text="Node size is mastery. The pulsing-ringed skills are ready to level up — tap one and I'll forge the next lesson right here." /></Welded>
      <Welded i={3} style={{ marginTop: 8 }}><SkillMap nodes={map.nodes} edges={map.edges} onNode={onNode} /></Welded>
    </Block>
  );
}

function LessonSurface({ l, onToggleWhy, onStart }: { l: LessonDM; onToggleWhy: (v: boolean) => void; onStart: () => void }) {
  const n = l.node;
  return (
    <Block>
      <Text style="eyebrow">Lesson · {n.label}</Text>
      <Welded i={1} tag="h2">{n.label}</Welded>
      <Welded i={2}><Markdown text={"Forged on tap — mastery **" + Math.round(n.mastery * 100) + "%**. " + (n.state === "ready" ? "You're ready to level this up." : "A short refresher to push this higher.")} /></Welded>
      <Welded i={3} style={{ marginTop: 14 }}>
        <Reveal summary={"Why " + n.label.toLowerCase() + " matters"} open={l.whyOpen} onToggle={onToggleWhy}>
          <Markdown text="Each skill is a node in the same data model the surface reads. Leveling up here re-weights everything connected to it." />
        </Reveal>
      </Welded>
      <Welded i={4}><Row gap={10} style={{ marginTop: 18 }}><Button emphasis="primary" action={onStart}><Row gap={8} align="center"><Icon name="play" size={16} /><Text>Start lesson</Text></Row></Button></Row></Welded>
    </Block>
  );
}

function PromptSurface({ p, onDraft, onForge }: { p: PromptDM; onDraft: (v: string) => void; onForge: () => void }) {
  return (
    <Block>
      <Text style="eyebrow">Prompt-craft</Text>
      <h2 className="weld-in">Make it sharper</h2>
      <Markdown text="Edit your prompt and hit **Forge**. I'll re-run the diff against an improved version and tell you what changed." />
      <div className="weld-in" style={{ marginTop: 16 }}>
        <PromptDiff before={p.before} afterSegments={p.after} verdict={p.verdict} value={p.draft} onChange={onDraft} onForge={onForge} />
      </div>
    </Block>
  );
}
