# Gravity Well: Executive Co-Pilot Design Specification

## Overview
Gravity Well is a stateful, multi-agent backend orchestrator designed as a governance-focused verification co-pilot for executive leadership. Its interface must project **trust, precision, and executive authority**. 

We have synthesized a custom design recipe pulling from the best of our `awesome-design` skills:
- **Linear's Command Center Darkness**: Deep charcoal and true black canvases (`#010102`) for a high-focus, distraction-free execution environment.
- **Stripe's Editorial Precision**: Thin, tightly-tracked display typography with tabular figures (`tnum`) for financial/metric data, creating an aura of financial-grade reliability. Pill-shaped components for transactional clarity.
- **Claude's Warmth & Product Chrome**: A humanist, approachable color accent (Executive Amber/Coral) against dark navy product surfaces to represent the AI agent nodes in the 8-node pipeline.

## 1. Color System

### Surface & Canvas (Linear + Stripe)
- **Canvas (`#010102`)**: Near-pure black with a faint blue tint. The execution floor.
- **Surface 1 (`#0f1011`)**: Charcoal lift for standard artifact cards and briefing panels.
- **Surface 2 (`#141516`)**: Hovered cards or elevated dashboard components.
- **Header Mesh**: A dark, atmospheric gradient mesh (Deep Navy `#003770` to Indigo `#2e2b8c`) occupying the top 15% of the viewport to establish depth.

### Accents & Typography (Stripe + Claude)
- **Executive Amber (`#e8a55a`)**: Used sparingly for "No-Proxy" human-routing alerts and critical tensions.
- **Electric Indigo (`#533afd`)**: Primary CTA buttons (e.g., "Append to Agenda", "Approve Briefing").
- **Ink (`#f7f8f8`)**: Off-white for primary readability.
- **Muted Ink (`#8a8f98`)**: Tertiary metadata and pipeline timestamps.
- **Semantic Success (`#27a644`)**: Passed quality gates.
- **Semantic Error (`#ea2261`)**: Failed quality gates / Proxy detected.

## 2. Typography

We merge Stripe's editorial thin-display with Linear's technical monospace.

- **Display (Hero & Dashboards)**: Inter or Sohne, Weight 300 (Thin), with aggressive negative tracking (`-1.4px`). Conveys high-end editorial density.
- **Body**: Inter, Weight 400.
- **Numerics & Data**: All pipeline metrics, timestamps, and confidence scores use `font-feature-settings: "tnum"` (Tabular Figures).
- **Code & Logs**: JetBrains Mono. Used exclusively inside the "8-node pipeline triage" terminal panels.

## 3. Component Architecture

### The "Briefing" Card
- **Background**: Surface 1 (`#0f1011`)
- **Border**: Hairline precision (`#23252a`) 
- **Radius**: Large (`12px`), matching Stripe's feature cards.
- **Content**: Tabular data for risk scores, thin display font for the project title, and a tight pill-button for executive action.

### Action Pills
- Borrowed directly from Stripe: Transactional, decisive pill-shaped buttons (`9999px` radius).
- **Padding**: `8px 16px` for a tight, controlled feel.
- **Primary**: Filled Electric Indigo. 

### Pipeline Node Terminal (The Triage View)
- Borrowed from Claude's dark-mode code mockups.
- Represents the 8-node orchestrator visually. 
- Contains an IDE-like side panel showing real-time agent triage (e.g. "Node 3: Identifying Tensions...").

## 4. Whitespace & Layout
- **Density**: The interface is dense, like a Bloomberg terminal or Linear, but organized.
- **Grid**: 3-up at desktop for standard project artifacts, shifting to a massive 1-up Command Center view for the selected briefing.
