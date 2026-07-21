/**
 * The Forge — leaf primitives (v3, audit-revised).
 * Ported from the design bundle's `primitives.jsx` to typed React + lucide-react.
 *
 * Conformance fixes baked in (see docs/UX audits): Button = single child + action
 * (no icon/label prop, V4); Row/Column/Text/Markdown layout primitives (V5); ProgressRing
 * tone never decorative-ember + semantic scale enum (V3/V10); SkillMeter tone neutral|success
 * + optional `delta` (V11, owner-approved); Reveal bound `open` + onToggle (V7); CodeBlock
 * copy = copyToClipboard. Agent text uses --agent-hot for AA.
 */
import React, { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import {
  Flame, Orbit, GitFork, Play, Check, Copy, ChevronRight, Sparkles,
  X, PenLine, ArrowUp, RotateCcw, MessageCircle,
  type LucideIcon,
} from "lucide-react";

/* ---- Icon: name-string → lucide-react component (typed registry) -------- */
const ICONS: Record<string, LucideIcon> = {
  flame: Flame, orbit: Orbit, "git-fork": GitFork, play: Play, check: Check, copy: Copy,
  "chevron-right": ChevronRight, sparkles: Sparkles, x: X, "pen-line": PenLine,
  "arrow-up": ArrowUp, "rotate-ccw": RotateCcw, "message-circle": MessageCircle,
};

export function Icon({
  name, size = 18, color = "currentColor", className = "",
}: { name: string; size?: number; color?: string; className?: string }) {
  const Cmp = ICONS[name];
  if (!Cmp) {
    if (import.meta.env?.DEV) console.warn(`[Forge] Unknown icon "${name}"`);
    return null;
  }
  return (
    <span className={"icon " + className} style={{ width: size, height: size, color }}>
      <Cmp size={size} strokeWidth={1.75} />
    </span>
  );
}

/* ---- Row / Column — the only legal multi-child layout (props only) ------ */
export function Row({
  gap = 0, align = "stretch", justify = "flex-start", wrap = false, children, style,
}: {
  gap?: number; align?: React.CSSProperties["alignItems"]; justify?: React.CSSProperties["justifyContent"];
  wrap?: boolean; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap, alignItems: align,
      justifyContent: justify, flexWrap: wrap ? "wrap" : "nowrap", ...style }}>{children}</div>
  );
}

export function Column({
  gap = 0, align = "stretch", justify = "flex-start", children, style,
}: {
  gap?: number; align?: React.CSSProperties["alignItems"]; justify?: React.CSSProperties["justifyContent"];
  children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, alignItems: align,
      justifyContent: justify, ...style }}>{children}</div>
  );
}

/* ---- Text — semantic style enum (no raw CSS) ---------------------------- */
export function Text({ style: variant = "body", children }: { style?: string; children: React.ReactNode }) {
  return <span className={"t-" + variant}>{children}</span>;
}

/* ---- Markdown — inline **bold** / *italic* / `code` only.
   Output is DOMPurify-sanitized (only inline marks survive); agent/content text
   is never trusted raw. ---------------------------------------------------- */
export function Markdown({ text = "", children }: { text?: string; children?: React.ReactNode }) {
  const src = text || (typeof children === "string" ? children : "");
  const html = useMemo(() => {
    const rendered = src
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return DOMPurify.sanitize(rendered, { ALLOWED_TAGS: ["code", "strong", "em"], ALLOWED_ATTR: [] });
  }, [src]);
  return <p className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ---- Button — single child + action; emphasis enum (V4) ----------------- */
export type Emphasis = "primary" | "secondary" | "ghost";

export function Button({
  emphasis = "secondary", action, children, disabled,
}: { emphasis?: Emphasis; action?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button className={"btn btn-" + emphasis} onClick={action} disabled={disabled}>
      {children}
    </button>
  );
}

/* ---- Jarvis presence ---------------------------------------------------- */
export type PresenceState = "idle" | "thinking" | "forging";

export function Presence({ state = "idle", name = "Jarvis" }: { state?: PresenceState; name?: string }) {
  const label: Record<PresenceState, string> = {
    idle: name + " · ready", thinking: name + " is thinking…", forging: "Forging…",
  };
  return (
    <div className={"presence " + state} role="status" aria-live="polite">
      <span className="presence-dot" />
      <span className="presence-label">{label[state]}</span>
    </div>
  );
}

/* ---- ProgressRing — tone neutral|success|agent; semantic scale (V3/V10) -- */
export type RingTone = "neutral" | "success" | "agent";
const RING_TONE: Record<RingTone, string> = {
  neutral: "var(--ink-muted)", success: "var(--success)", agent: "var(--agent-hot)",
};

export function ProgressRing({
  value = 0, label, sub, tone = "neutral", scale = "lg",
}: { value?: number; label?: string; sub?: string; tone?: RingTone; scale?: "sm" | "md" | "lg" }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(value), 40); return () => clearTimeout(t); }, [value]);
  const size = { sm: 56, md: 72, lg: 96 }[scale];
  const stroke = 8, r = (size - stroke) / 2 - 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      role="img" aria-label={label != null ? `${label}${sub ? " " + sub : ""}` : `${Math.round(value * 100)}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--hairline)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={RING_TONE[tone]} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.34,1.56,0.64,1)" }} />
      {label != null && (
        <text x="50%" y="47%" textAnchor="middle" fontFamily="General Sans, sans-serif"
          fontWeight="600" fontSize={size * 0.26} fill="var(--ink)">{label}</text>
      )}
      {sub && (
        <text x="50%" y="64%" textAnchor="middle" fontFamily="Switzer, sans-serif"
          fontSize={size * 0.12} fill="var(--ink-subtle)">{sub}</text>
      )}
    </svg>
  );
}

/* ---- SkillMeter — tone neutral|success (V3); optional bound `delta` (V11) - */
export type MeterTone = "neutral" | "success";

export function SkillMeter({
  skill, value = 0, delta, tone = "neutral",
}: { skill: string; value?: number; delta?: number; tone?: MeterTone }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(value), 60); return () => clearTimeout(t); }, [value]);
  const color = tone === "success" ? "var(--success)" : "var(--ink-muted)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="metric-label">{skill}</span>
        {delta != null ? (
          <span className="skill-delta"><span aria-hidden="true">▲</span> +{delta}</span>
        ) : (
          <span className="metric-label" style={{ color: "var(--ink-subtle)" }}>{Math.round(value * 100)}%</span>
        )}
      </div>
      <div className="skill-track">
        <div className="skill-fill" style={{ width: v * 100 + "%", background: color }} />
      </div>
    </div>
  );
}

/* ---- CoachNote — Jarvis's voice, in-surface ----------------------------- */
export type CoachTone = "hint" | "nudge" | "praise" | "warn";

export function CoachNote({ tone = "hint", children }: { tone?: CoachTone; children: React.ReactNode }) {
  const title: Record<CoachTone, string> = { hint: "Hint", nudge: "Nudge", praise: "Praise", warn: "Heads up" };
  return (
    <div className={"coachnote cn-" + tone} role="note">
      <span className="rail" aria-hidden="true" />
      <div>
        <div className="cn-title">{title[tone]}</div>
        <div className="cn-body">{children}</div>
      </div>
    </div>
  );
}

/* ---- Reveal — summary + single child + BOUND open (V7) ------------------ */
export function Reveal({
  summary, open = false, onToggle, children,
}: { summary: React.ReactNode; open?: boolean; onToggle?: (next: boolean) => void; children: React.ReactNode }) {
  return (
    <div className="reveal" data-open={open}>
      <button className="reveal-summary" aria-expanded={open} onClick={() => onToggle?.(!open)}>
        <span>{summary}</span>
        <span className="reveal-chev" aria-hidden="true"><Icon name="chevron-right" size={18} /></span>
      </button>
      {open && <div className="reveal-body weld-in">{children}</div>}
    </div>
  );
}

/* ---- CodeBlock — copy = the registered copyToClipboard function ---------- */
export function CodeBlock({
  language = "text", code, copyable = true,
}: { language?: string; code: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="codeblock">
      <div className="cb-bar">
        <span className="cb-lang">{language}</span>
        {copyable && (
          <button className="cb-copy" onClick={copyToClipboard}>
            <Icon name={copied ? "check" : "copy"} size={13} />{copied ? "copied" : "copy"}
          </button>
        )}
      </div>
      <pre className="cb-code">{code}</pre>
    </div>
  );
}
