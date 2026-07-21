# Workflow Design: GFS Aether — Real-Time AI Compliance Coach

**Version:** 1.0  
**Skill:** AI Compliance Coach  
**Parent System:** GFS Aether Continuous Trainer  
**Author:** GFS AI Center for Excellence  
**Review Cycle:** Aligned with GFS AI Governance Standard (Feb/Aug)

---

## 1\. Design Philosophy

### The Problem This Solves

Compliance failures at the AI layer rarely happen because people are reckless. They happen because people are **moving fast in gray areas with no real-time guidance**. The gap between "I wasn't sure" and "I knew it was wrong" is where most AI compliance incidents live.

The traditional response is more training, more policy documents, or more restrictive guardrails. All three have the same failure mode: they happen *before* or *after* the moment of risk — never *during* it.

### The Design Principle: The Compliance "Shoulder Coach"

The AI Compliance Coach is designed to be present at the **exact moment of ambiguity** — when a user is about to take an action, already mid-action, or has just realized they have a question. It doesn't exist to catch mistakes. It exists to **prevent the uncertainty that leads to mistakes**.

**Three design commitments:**

1. **The Fastest Path to "Yes"** — The goal is always to find the compliant way to do what the user is trying to do, not to block them. Every response ends with a path forward.  
     
2. **Teach Once, Apply Always** — Every compliance interaction is a micro-learning moment. The agent explains the *why*, not just the *what*, so users build intuition over time.  
     
3. **Warm Handoffs, Not Hard Stops** — When escalation is required, the user is handed off to a human with full context and no interruption to their other work.

---

## 2\. The Yellow Light Model — Core UX Logic

The compliance coach uses a three-state guidance system. The framing is deliberately not about "allowed vs. prohibited" — it's about **what the user needs to know or do next**.

```
╔══════════════════════════════════════════════════════════════╗
║  🟢 GREEN — Go, with awareness                               ║
║  You're clear. Here's the best practice context.            ║
║  Tone: Affirming, brief, educational                         ║
╠══════════════════════════════════════════════════════════════╣
║  🟡 YELLOW — Pause and check one thing                       ║
║  One question or step to confirm before proceeding.          ║
║  Tone: Calm, specific, solution-first                        ║
╠══════════════════════════════════════════════════════════════╣
║  🔴 RED — Human review needed                                ║
║  The agent can't resolve this — but it will hand it off.    ║
║  Tone: Clear, non-alarming, "you're in good hands"          ║
╚══════════════════════════════════════════════════════════════╝
```

**Red is reserved for four scenarios only:**

- Health/medical data in any AI workflow  
- Potential data breach or unauthorized access  
- Safety-critical protocol modification via AI output  
- Novel legal/regulatory question requiring attorney judgment

Everything else is Yellow, with a path to Green.

---

## 3\. Interaction Entry Points

The Compliance Coach is accessible through every surface of the GFS Aether architecture.

### 3.1 Passive Entry — The Shoulder Tap

The agent detects a risk pattern and proactively surfaces a nudge in the Aether sidebar. The user didn't ask anything — the agent noticed something.

**Interaction flow:**

```
[User action creates risk signal]
        ↓
[Flash model detects pattern in <50ms]
        ↓
[Mint Green glow on Aether sidebar icon]
        ↓
[Non-blocking nudge appears: 2-3 lines + one action button]
        ↓
[User reads, acknowledges, or expands]
        ↓
[Full guidance card (if expanded) or dismiss]
        ↓
[Interaction logged to Compliance Trace]
```

**UI design rules for passive nudges:**

- Non-blocking: never interrupts the user's primary workflow  
- Maximum 3 lines visible without expansion  
- Single clear CTA: "Tell me more" / "Got it" / "Need help"  
- Disappears after 30 seconds if not interacted with (but logs the non-interaction)  
- Never uses warning iconography (⚠️ ❌) — uses conversational language only

---

### 3.2 Active Entry — The Direct Question

The user types a compliance question into the Aether chat interface (Chrome sidebar or GChat) or triggers it via a slash command.

**Interaction flow:**

```
[User types compliance question OR uses /compliance command]
        ↓
[Flash model classifies intent: Simple vs. Complex]
        ↓
[Simple → Flash responds in <5 sec]
[Complex → Routed to Pro, loading state shown]
        ↓
[Structured response card rendered]
        ↓
[User can: Accept guidance / Ask follow-up / Escalate / Dismiss]
        ↓
[Interaction logged + Refinement audit queued]
```

---

### 3.3 Cross-Device Continuity (Antigravity)

Compliance questions don't always get answered at the desk. If a user starts a compliance query and leaves their workstation, the Antigravity state engine preserves the full context for pickup on mobile.

**Handoff experience:**

```
[Desktop: User opens compliance question, partial response received]
        ↓
[User leaves desk — session persists via Antigravity]
        ↓
[Mobile GChat: "Picking up from your desktop — your compliance question 
 about [topic] is still open. Want to continue?"]
        ↓
[Full guidance card available on mobile with same quality as desktop]
```

---

## 4\. Domain Workflow: PII / Data Privacy

### Scenario: User is about to paste customer data into an AI prompt

**Passive Detection Trigger:** Email address pattern, customer name \+ account number detected in clipboard or form field input on an AI tool page.

```
STEP 1 — Nudge (Aether Sidebar, non-blocking)
┌─────────────────────────────────────────────────┐
│ 🟡 Aether Compliance                            │
│ That looks like it might include customer data. │
│ Quick check before it goes in?                  │
│ [Yes, help me] [Not customer data]              │
└─────────────────────────────────────────────────┘

STEP 2A — If "Yes, help me":
┌─────────────────────────────────────────────────────────────────┐
│ 🟡 Data Privacy Check                                           │
│                                                                 │
│ Customer data in AI prompts is fine when:                       │
│  ✓ The AI tool is in the GFS registry for this data tier        │
│  ✓ You're using the minimum data needed for the task            │
│  ✓ The data stays within GFS-approved boundaries                │
│                                                                 │
│ Is [Tool Name] approved for customer data?                      │
│ [Check the registry] [I've already confirmed] [Use test data]  │
└─────────────────────────────────────────────────────────────────┘

STEP 2B — If "Not customer data":
┌──────────────────────────────────────┐
│ 🟢 All good                          │
│ Proceeding — quick reminder: avoid   │
│ including employee IDs or internal   │
│ protocol numbers in AI prompts when  │
│ possible.                            │
│ [Got it]                             │
└──────────────────────────────────────┘

STEP 3 (from 2A — if registry check initiated):
→ Agent queries GFS AI Tool Registry via MCP
→ If approved for this data tier: 🟢 Green response + proceed
→ If not approved: 🟡 Yellow — redirect to approved alternative or 
  suggest using redacted/test version
→ If uncertain / no registry entry: 🟡 Yellow — recommend TPRM review 
  before proceeding
```

**Decision tree summary:**

```
Customer data detected?
├─ Yes → Tool approved for this data tier?
│  ├─ Yes → 🟢 Proceed + data minimization reminder
│  ├─ No  → 🟡 Redirect to approved alternative / suggest test data
│  └─ Unknown → 🟡 Check registry + TPRM review path
└─ No  → 🟢 Proceed + light best-practice note
```

---

### Scenario: User directly asks "Is this PII?"

```
User: "Is a customer's delivery address PII?"

Agent (Flash — simple factual):
┌──────────────────────────────────────────────────────────────┐
│ 🟡 Short answer: Yes.                                        │
│                                                              │
│ A delivery address on its own can be PII, especially when   │
│ it's linked to a customer account or name — which it         │
│ usually is in GFS systems.                                   │
│                                                              │
│ What this means for your AI work:                           │
│  → Only use in AI tools cleared for customer data            │
│  → Use the minimum fields needed — don't include the full   │
│    profile if just the address is required                   │
│  → GFS considers address + name together as directly         │
│    identifiable — treat with care                            │
│                                                              │
│ Is there a specific AI task you're trying to complete?      │
│ I can help you find the right path.                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 5\. Domain Workflow: AI Tool Approval

### Scenario: User navigates to an unapproved AI tool

**Passive Detection Trigger:** Browser navigation to a URL not in the GFS approved tool registry.

```
STEP 1 — Nudge (Aether Sidebar)
┌──────────────────────────────────────────────────────────┐
│ 🟡 Aether Compliance                                     │
│ [Tool Name] isn't in the GFS approved tool list yet.     │
│ [See options] [I'll use something else]                  │
└──────────────────────────────────────────────────────────┘

STEP 2 — If "See options":
┌───────────────────────────────────────────────────────────────┐
│ 🟡 Tool Approval Check — [Tool Name]                          │
│                                                               │
│ GFS requires AI tools to go through a review before use      │
│ (IT037 Acceptable Use Policy). Here's your path forward:     │
│                                                               │
│ Option A — Use an approved alternative:                       │
│  [Approved Tool 1] does similar things and is ready to go.   │
│                                                               │
│ Option B — Get [Tool Name] approved via Fast Lane:           │
│  If it's low-risk, the Fast Lane can approve it quickly.     │
│  Typical turnaround: 3-5 business days.                      │
│  [Start Fast Lane Request]                                    │
│                                                               │
│ Option C — Ask the AI COE:                                   │
│  Not sure if it qualifies? The AI Center for Excellence can  │
│  advise before you submit.                                   │
│  [Contact AI COE]                                            │
└───────────────────────────────────────────────────────────────┘
```

**Fast Lane Assist Sub-flow:**

```
[User selects "Start Fast Lane Request"]
        ↓
[Agent gathers: Tool name, intended use case, data types involved, 
 frequency of use, alternative tools considered]
        ↓
[Agent pre-fills Fast Lane submission form via MCP]
        ↓
[User reviews and submits with one tap / click]
        ↓
[Agent confirms submission, provides reference number]
        ↓
[Agent follows up when status changes (approved/needs info/deferred)]
```

---

### Scenario: User asks about a tool they're already using

```
User: "I've been using [External AI Tool] for drafting emails. Is that okay?"

Agent (Pro — context assessment needed):
┌─────────────────────────────────────────────────────────────────┐
│ 🟡 Let me check that for you.                                   │
│                                                                 │
│ [Queries GFS AI Registry via MCP...]                           │
│                                                                 │
│ [If tool found, conditionally approved]:                        │
│ Good news — [Tool] is in the registry. It's approved for       │
│ general text drafting, with one condition: don't include        │
│ GFS confidential data or customer information in your prompts. │
│                                                                 │
│ For email drafting: you're likely fine as long as you're       │
│ not pasting in internal reports or customer records. Using      │
│ it to polish language or structure? That's in scope.           │
│                                                                 │
│ [If tool NOT found]:                                           │
│ [Tool] isn't in the registry yet — but let's not panic.       │
│ The Fast Lane process is designed exactly for this. Want me    │
│ to help you submit a request? It usually moves fast for        │
│ general drafting tools.                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6\. Domain Workflow: AI Output Trust & Verification

### Scenario: User copies AI-generated content into a GFS system record

**Passive Detection Trigger:** Clipboard/DOM event — AI-generated text being pasted into a GFS system field.

```
STEP 1 — Nudge (non-blocking, context-aware)
┌──────────────────────────────────────────────────────────────┐
│ 🟡 Aether Compliance                                         │
│ That content came from [AI Tool]. Quick verification step?   │
│ [Yes, let's check] [I already verified it]                   │
└──────────────────────────────────────────────────────────────┘

STEP 2 — If "Yes, let's check":
┌───────────────────────────────────────────────────────────────┐
│ 🟡 AI Output Verification — Before You Commit                 │
│                                                               │
│ AI outputs are a great starting point — your judgment makes  │
│ them final. Before this goes into the record:                │
│                                                               │
│ For [detected content type]:                                  │
│  → Does the output match what you know to be true?           │
│  → Are any specific numbers, dates, or policy references     │
│    checkable against a source?                               │
│  → Will this output drive a decision that affects someone    │
│    (staffing, finance, safety)?                              │
│    If yes → HITL Override flag recommended                   │
│                                                               │
│ You don't have to be perfect — just intentional.             │
│ [Mark as verified] [Add HITL flag] [I have a concern]       │
└───────────────────────────────────────────────────────────────┘
```

**HITL Override Sub-flow:**

```
[User selects "Add HITL flag"]
        ↓
[Agent creates HITL review record via MCP → Compliance Portal]
        ↓
[Record flagged in GFS system: "AI-generated, pending human review"]
        ↓
[Assigned reviewer notified per GFS HITL SLA]
        ↓
[User can continue other work — record locked for final action 
 until review complete]
        ↓
[Agent notifies user when reviewer approves or has questions]
```

---

### Scenario: User expresses concern about AI output quality

```
User: "This AI output looks off — but my manager wants to use it in a report. 
       What should I do?"

Agent (Pro — interpersonal + compliance complexity):
┌─────────────────────────────────────────────────────────────────┐
│ 🟡 You're right to pause on this.                              │
│                                                                 │
│ GFS's AI governance framework puts human judgment in the       │
│ driver's seat precisely for situations like this. If the       │
│ output looks inaccurate, that instinct matters.                │
│                                                                 │
│ Here's what GFS policy supports you doing:                    │
│  1. Flag it: Note your concern in writing before it goes out. │
│     This protects you and puts the decision on record.        │
│  2. HITL Override: Formally flag the content for review       │
│     before it goes into the report. This creates an audit     │
│     trail showing due diligence.                               │
│  3. Suggest a verification step: Recommend that specific      │
│     claims be verified against source data before publishing. │
│                                                                 │
│ Your instinct is a compliance asset. GFS policy explicitly    │
│ says human judgment remains the final call on AI outputs that │
│ affect business decisions.                                     │
│                                                                 │
│ Want help wording a quick note to your manager?               │
│ [Draft a note] [Create HITL flag] [Talk to Compliance]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7\. Domain Workflow: Data Sharing / External Distribution

### Scenario: User attempts to forward AI-processed content externally

**Passive Detection Trigger:** Email compose with external recipient \+ content contains detected AI-generated markers or GFS confidential data signals.

```
STEP 1 — Nudge
┌──────────────────────────────────────────────────────────────┐
│ 🟡 Aether Compliance                                         │
│ That's going to an external address. Does it include         │
│ AI-generated content or GFS internal data?                   │
│ [Yes, check it] [No, it's clear]                             │
└──────────────────────────────────────────────────────────────┘

STEP 2 — If "Yes, check it":
┌────────────────────────────────────────────────────────────────┐
│ 🟡 External Distribution Check                                 │
│                                                                │
│ Before this leaves GFS, two quick questions:                  │
│                                                                │
│ 1. Does the content include GFS confidential data, customer   │
│    information, or internally-sourced insights?               │
│    If yes → that classification follows the content outside.  │
│                                                                │
│ 2. Will the recipient or their systems further process this   │
│    data with AI?                                               │
│    If yes → GFS Third Party Risk Management may apply.        │
│                                                                │
│ The safe path: A quick review by [Legal/Communications]       │
│ protects GFS and protects you. It's usually fast.             │
│                                                                │
│ [Request a quick review] [I've confirmed it's clear] [Hold]  │
└────────────────────────────────────────────────────────────────┘
```

---

### Scenario: Vendor uses AI — user asks if they need to do anything

```
User: "Our logistics vendor just told us they're now using AI to process 
       our delivery data. Do I need to do anything?"

Agent (Pro — TPRM cross-reference):
┌─────────────────────────────────────────────────────────────────┐
│ 🟡 Yes — and the good news is the process is already set up.   │
│                                                                 │
│ When a third-party vendor introduces AI into how they handle   │
│ GFS data, GFS's Third Party Risk Management (TPRM) process    │
│ kicks in. This isn't starting from scratch — it's an update   │
│ to the existing vendor relationship.                           │
│                                                                 │
│ What needs to happen:                                          │
│  → Notify your Procurement contact that the vendor has added  │
│    an AI processing component                                   │
│  → The existing TPRM review will be updated to assess the     │
│    AI-specific risk (data scope, model security, outputs)     │
│  → The vendor may need to complete the GFS AI vendor          │
│    questionnaire                                               │
│                                                                 │
│ This is a routine process — it's not about shutting the       │
│ vendor down, it's about making sure the new AI layer is       │
│ covered by the same rigor as everything else.                  │
│                                                                 │
│ Want me to draft the note to Procurement?                      │
│ [Draft Procurement note] [Start TPRM update] [Learn more]    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8\. Escalation Workflow (Red Path)

### Full HITL Compliance Escalation Flow

```
[Red trigger detected OR user requests escalation]
        ↓
[Agent: "This one needs a human compliance officer — 
 I'm on it. You don't need to stop what you're doing."]
        ↓
[Agent auto-generates escalation record:]
  - Session context summary (sanitized)
  - Trigger reason
  - Relevant policy sections
  - User intent (what they were trying to do)
  - Timestamp + session ID
        ↓
[HITM modal pushed to user for signature / acknowledgment]
┌──────────────────────────────────────────────────────────┐
│ 🔴 COMPLIANCE REVIEW REQUESTED                           │
│                                                          │
│ Topic: [Brief description]                               │
│ Routed to: GFS Legal / ERM / AI COE                     │
│ Reference: [HITM-ID]                                     │
│ Status: Pending review                                   │
│ Est. response: [SLA]                                     │
│                                                          │
│ Your work continues normally. We'll notify you when     │
│ there's an update.                                       │
│                                                          │
│ [Acknowledge] [Add a note for the reviewer]             │
└──────────────────────────────────────────────────────────┘
        ↓
[Compliance officer receives full context via portal]
        ↓
[Officer reviews, responds, or escalates further]
        ↓
[Agent notifies user with outcome + any required actions]
```

**Design principle for escalation:** The user should feel *relieved*, not anxious, when they hit a Red. The message is: "You did the right thing by flagging it. It's handled."

---

## 9\. Cross-Session Learning & Refinement

Every compliance interaction feeds the Autonomous Refinement Loop (per Technical Requirement: Autonomous Continuous Refinement Logic):

```
[Interaction logged to Compliance Trace]
        ↓
[Critic Model (Gemini Pro) audits interaction post-session:]
  - Was the guidance accurate?
  - Did the user resolve successfully or escalate?
  - Did the user dismiss the nudge? (potential false positive)
  - Was the policy citation correct?
        ↓
[If Semantic Accuracy Score < 0.95:]
  - Root cause identified (missing context / logic error / false positive)
  - Correction Delta generated (few-shot example or negative constraint)
  - Stored in Heuristic Feedback Repository
        ↓
[Delta reviewed against Golden Source (GFS Knowledge Graph)]
  - If <20% deviation → deployed as Candidate Version
  - If >20% deviation → held for HITM Supervisor Approval
        ↓
[A/B tested on 10% of similar queries]
        ↓
[If accuracy improves → promoted to Production Context Layer]
```

**What this means in practice:** A compliance question that comes in on Day 1 with imperfect guidance will, by Week 4, be handled with noticeably higher precision — because the agent has seen the edge cases and been refined against them.

---

## 10\. UI Design Specifications

### Aether Sidebar — Compliance State Indicators

| State | Visual Signal | Duration |
| :---- | :---- | :---- |
| Passive monitoring active | Subtle mint green pulse, 0.5s interval | Continuous |
| Risk pattern detected | Brighter mint green pulse, 1s interval | Until interaction |
| Nudge displayed | Sidebar expands 40px, nudge card visible | 30s or until dismissed |
| Active guidance open | Full sidebar expanded, mint green border | Until resolved |
| Escalation in progress | Mint green outline on modal | Until acknowledged |
| Red / escalated | Brief orange-tinted modal (not alarming) | Until signed |

**Color language:**

- Mint Green \= compliance intelligence active, guidance available  
- Never red/warning colors for nudges — those are reserved for true escalation only  
- Use conversational text, never iconographic warnings like ⚠️ in passive nudges

### GChat Compliance Card Structure

```
┌─────────────────────────────────────────────────┐
│ GFS Aether Compliance                [Minimize] │
├─────────────────────────────────────────────────┤
│ 🟡 [Card Header: Topic]                         │
│                                                 │
│ [Context: 1-2 sentences on why this matters]   │
│                                                 │
│ [Guidance: Specific, actionable]                │
│                                                 │
│ [Path forward: Clear next step]                │
│                                                 │
│ Policy ref: [GFS Standard | Section X]         │
├─────────────────────────────────────────────────┤
│ [Primary CTA]    [Secondary CTA]    [Dismiss]  │
└─────────────────────────────────────────────────┘
```

---

## 11\. Edge Cases & Failure Modes

| Scenario | Behavior |
| :---- | :---- |
| Tool registry unavailable (MCP timeout) | 🟡 Yellow — agent says "I can't confirm the registry right now — default to assuming this tool needs verification before use with sensitive data" |
| User dismisses every nudge (fatigue) | After 3+ dismissals in a session, agent reduces passive nudge frequency. After session, Refinement Critic evaluates if nudges were false positives. |
| User asks about emerging regulation not in knowledge base | Agent responds: "That's in regulatory territory I don't have current data on — this one goes to Legal." Escalates proactively. |
| User provides contradictory information | Agent asks one clarifying question before responding. Does not assume worst case. |
| HITL portal unavailable | Agent captures escalation request locally, notifies user, retries submission every 5 minutes with status updates |
| User is in a high-stress / time-sensitive situation | Flash model detects urgency signals in language. Shortens response to essential guidance only. Offers full detail via "Tell me more." |

---

## 12\. Measurement Framework

### User Experience Metrics

| Metric | What It Tells You | Target |
| :---- | :---- | :---- |
| Nudge acceptance rate | Are passive triggers relevant and well-timed? | \>70% interacted with |
| Nudge dismiss rate | How often are we getting false positives? | \<15% dismissed |
| Resolution-to-Green rate | Are we successfully helping users proceed? | \>80% |
| Follow-up question rate | Are users understanding guidance or needing more? | \<30% follow-up |
| Escalation rate | How often do we hit Red? | \<5% of total interactions |
| Return user rate | Are users trusting the agent to come back? | \>60% repeat users |

### Compliance Quality Metrics

| Metric | What It Tells You | Target |
| :---- | :---- | :---- |
| Semantic Accuracy Score | Is guidance policy-accurate? | ≥0.95 |
| False positive rate | Are we crying wolf? | \<15% |
| HITL resolution time | How fast do Red scenarios get resolved? | Per GFS HITL SLA |
| Policy citation accuracy | Are we citing the right standard? | 100% verifiable |
| Refinement improvement rate | Is the agent getting smarter? | Measurable increase over 48h cycles |

---

## 13\. Rollout Phases

### Phase 1 — Active Query Mode Only (Weeks 1-3)

Deploy the compliance coach in **response-only mode**. Users can ask compliance questions directly via the Aether chat interface. No passive detection yet. This phase validates response quality, calibrates policy accuracy, and builds user trust.

- **Success gate:** Semantic Accuracy Score ≥0.95 on 100 real user queries  
- **Key learning:** Which domains generate the most questions (calibrates passive trigger priority)

### Phase 2 — Passive Triggers, Low Sensitivity (Weeks 4-6)

Add passive detection, starting with **highest-confidence, lowest-false-positive patterns** only:

- External email with confidential content  
    
- Unapproved tool navigation  
    
- Direct PII paste into AI tool  
    
- **Success gate:** False positive rate \<15% on passive nudges  
    
- **Key learning:** Which trigger patterns need refinement

### Phase 3 — Full Passive \+ Refinement Loop Active (Weeks 7-8)

Enable full passive detection across all four domains. Activate the Autonomous Refinement loop. Begin A/B testing refined prompt deltas.

- **Success gate:** Measurable accuracy improvement across 48h test cycle  
- **Key learning:** Which compliance edge cases are most common and most ambiguous

### Phase 4 — Omnichannel (GChat \+ Mobile) (Week 9+)

Extend full compliance coaching to GChat agent cards and mobile via Antigravity sync.

---

*Workflow Design v1.0 | GFS Aether Continuous Trainer — AI Compliance Coach | Aligned with GFS AI Governance Standard NIST AI RMF 1.0*  
