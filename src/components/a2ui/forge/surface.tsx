/**
 * The Forge — composite A2UI components + the surface shell (v3, audit-revised).
 * Ported from the design bundle's `surface.jsx` to typed React.
 *
 * Conformance fixes: QuizCard no longer grades locally — it fires onAnswer and renders
 * a bound `state` (V1) with non-color check/✗ cues; SkillMap receives TOPOLOGY only and
 * the renderer lays out the constellation (V6); PromptDiff "Forge" is a round-trip and is
 * fully controlled (value/onChange/onForge, V8) with a non-color "+" marker on additions.
 */
import React, { useEffect, useMemo, useState } from "react";
import { Icon, Button, Row, Text } from "./primitives";

/* ---- Surface block: applies the Weld entrance --------------------------- */
export function Block({
  weld = true, flush = false, children,
}: { weld?: boolean; flush?: boolean; children: React.ReactNode }) {
  const [welding, setWelding] = useState(weld);
  useEffect(() => {
    if (!weld) return;
    const t = setTimeout(() => setWelding(false), 90);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={"block" + (flush ? " flush" : "") + (weld ? " weld" : "")}
      data-welding={welding ? "true" : "false"}>{children}</div>
  );
}

/* Re-weldable wrapper for content swapped in place (a single updateComponents id) */
export function Weld({
  children, hold = 90, className = "", style,
}: { children: React.ReactNode; hold?: number; className?: string; style?: React.CSSProperties }) {
  const [welding, setWelding] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setWelding(false), hold);
    return () => clearTimeout(t);
  }, [hold]);
  return (
    <div className={className} data-welding={welding ? "true" : "false"} style={style}>{children}</div>
  );
}

export function Welded({
  i = 0, children, tag: Tag = "div", style,
}: { i?: number; children: React.ReactNode; tag?: keyof JSX.IntrinsicElements; style?: React.CSSProperties }) {
  return <Tag className="weld-in" style={{ ...style, transitionDelay: i * 80 + "ms" }}>{children}</Tag>;
}

/* ---- ThinkingBlock: a 1px --agent sweep on the top hairline (NOT a skeleton) */
export function ThinkingBlock() {
  return (
    <div className="thinking-block" role="status" aria-label="Jarvis is forging a surface">
      <span className="forming-label">Forging…</span>
    </div>
  );
}

/* ---- QuizCard — server-graded; `state` is bound, not computed here (V1) -- */
export interface QuizChoice { key: string; label: string; }
export type ChoiceState = Record<string, "correct" | "wrong"> | null;

export function QuizCard({
  prompt, choices, state, onAnswer,
}: { prompt: string; choices: QuizChoice[]; state?: ChoiceState; onAnswer?: (key: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const graded = !!state && Object.keys(state).length > 0;
  const locked = selected != null || graded;
  const pick = (k: string) => {
    if (locked) return;
    setSelected(k);        // local UI only — no grading
    onAnswer?.(k);         // fires the answerSelected event
  };
  const cls = (k: string) => {
    if (graded && state) {
      if (state[k] === "correct") return "choice correct";
      if (state[k] === "wrong") return "choice wrong";
      return "choice dim";
    }
    return "choice" + (k === selected ? " selected" : "");
  };
  const mark = (k: string) => {
    if (!graded || !state) return null;
    if (state[k] === "correct") return <Icon name="check" size={16} color="var(--success)" className="ch-mark" />;
    if (state[k] === "wrong") return <Icon name="x" size={16} color="var(--danger)" className="ch-mark" />;
    return null;
  };
  return (
    <div className="choices">
      <p className="quiz-prompt weld-in">{prompt}</p>
      {choices.map((c, i) => (
        <button key={c.key} className={cls(c.key) + " weld-in"} disabled={locked}
          style={{ transitionDelay: i * 70 + 80 + "ms" }} onClick={() => pick(c.key)}>
          <span className="key">{c.key.toUpperCase()}</span>
          <span className="choice-label">{c.label}</span>
          {mark(c.key)}
        </button>
      ))}
    </div>
  );
}

/* ---- Step / Stepper ----------------------------------------------------- */
export interface StepItem { title: string; body?: React.ReactNode; }

export function Stepper({ steps, current = 0 }: { steps: StepItem[]; current?: number }) {
  return (
    <div className="stepper">
      {steps.map((s, i) => {
        const st = i < current ? "done" : i === current ? "active" : "pending";
        const last = i === steps.length - 1;
        return (
          <div key={i} className={"step " + st}>
            <div className="step-rail">
              <div className="step-dot">
                {st === "done" && <Icon name="check" size={13} color="var(--ember-ink)" />}
                {st === "active" && <span className="core" />}
              </div>
              {!last && <div className="step-line" />}
            </div>
            <div style={{ flex: 1 }}>
              <div className="step-title">{s.title}</div>
              {st === "active" && s.body && <div className="step-body weld-in">{s.body}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- PromptDiff — Forge round-trips (V8); additions carry a non-color cue - */
export interface DiffSegment { t: "eq" | "add" | "del"; v: string; }

export function PromptDiff({
  before, afterSegments, verdict, value, onChange, onForge,
}: {
  before: string; afterSegments: DiffSegment[]; verdict?: string;
  value: string; onChange?: (v: string) => void; onForge?: () => void;
}) {
  return (
    <div>
      <div className="diff">
        <div className="diff-col diff-before">
          <div className="diff-head">Your prompt</div>
          <div className="diff-text">{before}</div>
        </div>
        <div className="diff-col diff-after">
          <div className="diff-head">Forged</div>
          <div className="diff-text">
            {afterSegments.map((seg, i) =>
              seg.t === "add" ? (
                <span key={i} className="add"><span className="diff-mark" aria-hidden="true">+</span>{seg.v}</span>
              ) : seg.t === "del" ? (
                <span key={i} className="del">{seg.v}</span>
              ) : (
                <span key={i}>{seg.v}</span>
              )
            )}
          </div>
        </div>
      </div>
      {verdict && (
        <div className="verdict">
          <Icon name="sparkles" size={16} color="var(--ink-subtle)" />
          <span>{verdict}</span>
        </div>
      )}
      <textarea className="diff-edit" value={value} onChange={(e) => onChange?.(e.target.value)}
        spellCheck={false} aria-label="Edit your prompt" />
      <div className="btn-row" style={{ marginTop: 12 }}>
        <Button emphasis="primary" action={onForge}>
          <Row gap={8} align="center"><Icon name="flame" size={16} /><Text>Forge</Text></Row>
        </Button>
        <span className="metric-label" style={{ color: "var(--ink-subtle)" }}>Forge asks Jarvis to re-run the diff</span>
      </div>
    </div>
  );
}

/* ---- SkillMap — TOPOLOGY in, renderer computes layout (V6) --------------- */
export interface SkillNode { id: string; label: string; mastery: number; state?: "ready" | null; }

export function SkillMap({
  nodes, edges, onNode,
}: { nodes: SkillNode[]; edges: [string, string][]; onNode?: (node: SkillNode) => void }) {
  const W = 760, H = 340;
  const pos = useMemo(() => {
    // deterministic radial layout (renderer-owned); the agent never sends coordinates
    const cx = W * 0.32, cy = H * 0.52;
    const m: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n, i) => {
      if (i === 0) { m[n.id] = { x: cx, y: cy }; return; }
      const ang = i * 2.39996; // golden-angle spread
      const rad = 70 + i * 30;
      m[n.id] = { x: cx + Math.cos(ang) * rad * 1.35, y: cy + Math.sin(ang) * rad * 0.72 };
    });
    Object.values(m).forEach((p) => {
      p.x = Math.max(60, Math.min(W - 60, p.x));
      p.y = Math.max(50, Math.min(H - 50, p.y));
    });
    return m;
  }, [nodes]);

  return (
    <svg className="skillmap" viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="group" aria-label="Your skill map">
      {edges.map((e, i) => {
        const a = pos[e[0]], b = pos[e[1]];
        const na = nodes.find((n) => n.id === e[0]), nb = nodes.find((n) => n.id === e[1]);
        if (!a || !b) return null;
        const ready = na?.state === "ready" || nb?.state === "ready";
        return <line key={i} className={"smap-edge" + (ready ? " ready" : "")} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
      })}
      {nodes.map((n) => {
        const p = pos[n.id];
        const radius = 14 + n.mastery * 22;
        const fill = n.mastery > 0.66 ? "var(--success)" : "var(--ink-muted)";
        const pct = Math.round(n.mastery * 100);
        return (
          <g key={n.id} className={"smap-node" + (n.state === "ready" ? " ready" : "")}
            role="button" tabIndex={0}
            aria-label={`${n.label}, ${pct}% mastery${n.state === "ready" ? ", ready to level up" : ""}`}
            onClick={() => onNode?.(n)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNode?.(n); } }}>
            <circle className="fill" cx={p.x} cy={p.y} r={radius} fill={fill} fillOpacity={0.2} stroke={fill} strokeWidth={1.5} />
            <circle cx={p.x} cy={p.y} r={4} fill={fill} />
            <text x={p.x} y={p.y + radius + 16}>{n.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
