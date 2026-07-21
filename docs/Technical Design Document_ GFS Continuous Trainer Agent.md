## **Technical Design Document: GFS Continuous Trainer Agent**

**1\. Agent Description**

The **GFS Continuous Trainer Agent** is a multimodal, context-aware AI coach designed to modernize corporate upskilling. Moving away from rigid, pull-based LMS courses, the agent delivers push-based, narrative-driven micro-learning directly in the employee's workflow. It leverages **Agentic UI** to dynamically generate custom HTML/React front-end widgets on the fly. Operating persistently across desktop browsers and mobile Google Chat, the agent observes the user's live Workspace tasks and tailors real-time interactive training (e.g., prompt engineering roleplays) directly to their active projects.

**2\. Sources Needed**

* **Vector Databases or GCS Bucket (Vertex AI Search):** For high-speed retrieval of internal GFS training documentation, standard operating procedures, and cybersecurity guidelines via semantic grounding.  
* **GraphDB / NotebookLM Datastores:** To conceptually map the relationships between training materials, store user learning histories, and rapidly retrieve complex conversational artifacts.  The default GraphdB available in Gemini Enterprise will likely be leveraged (for the MVP).  
* **Google Workspace Data:** Secure connections to the user's Google Docs, Drive, and Chat (Google chat connector available later in 2026\) to read contextual data from active projects and apply training directly to actual work.  
* **Multimedia Repositories:** Access to curated external video sources (e.g., Google YouTube channels) and integration with the Google Vids API.

**3\. Goals**

* **Eradicate Training Friction:** Replace boring, mandatory training videos with highly engaging, "bingeable" micro-learning interactions.  
* **Generate Dynamic UI (ATUI):** Empower the LLM to write and render bespoke interactive components (diagrams, input fields) customized to the specific lesson, rather than relying on a static GUI.  
* **Enable Contextual Application:** Provide proactive coaching by allowing the agent to view active Workspace tasks, bridging the gap between theoretical training and real-world application.  
* **Ensure Omnichannel Persistence:** Allow users to start a training module on a desktop browser and seamlessly continue the session via mobile Google Chat.  
* **Automate Content Distribution:** Convert 1-on-1 personalized training sessions into shareable team assets using the Google Docs and Google Vids APIs.

**4\. Metrics to Measure Success**

* **User Stickiness & Voluntary Engagement:** Track the frequency of spontaneous micro-learning interactions and average session lengths compared to legacy platforms.  
* **Cross-Channel Continuity:** The percentage of training sessions that users fluidly transition across multiple platforms (e.g., Web Portal \-\> Google Chat).  
* **In-Workflow Task Translation:** The frequency with which employees grant the agent access to their live Google Drive files to execute a training deliverable.  
* **System Latency / ATUI Render Speed:** The "Time-to-First-Token" and rendering speed of the dynamically generated React components to ensure zero UX friction.  
* **Artifact Generation Volume:** The total count of automated workflows, lesson notes, and Google Vids successfully synthesized and shared by employees.

**5\. Preliminary Architecture**

*(Leveraging Google Cloud Platform and the Agent Development Kit)*

* **Orchestration Framework (Agent Development Kit \- ADK):**  
  * ADK will be used to manage complex multi-turn conversational states, orchestrate tool calling, and manage the user's cross-platform memory/learning profile.  
* **Core Reasoning Engine:**  
  * **Gemini 3.1 Pro / Flash:** Will drive high-speed multimodal reasoning, search grounding, and the real-time writing of React/HTML code to power the Agentic UI.  
  * **Gemini Nano (Future State):** Explored via Chrome extensions to process on-screen context locally, drastically reducing server latency and API costs.  
* **Data Integration Layer (Model Context Protocol \- MCP):**  
  * MCP servers will be deployed to securely expose backend tools (Vector DBs, GraphDBs, Workspace APIs) to the agent. This standardizes the connection, improves code flexibility, and removes the need for heavy, custom authentication middleware.  
* **Client Interfaces (The "Open Claw"):**  
  * **React Web Portal:** A GCP-hosted frontend container designed to safely compile and render the LLM's dynamically generated UI mini-apps.  
  * **Google Chat API / Bot:** A lightweight integration for mobile-friendly, asynchronous learning. Note: Google Chat is Actions are in private preview.  
  * **Chrome Browser Extension:** A persistent interface acting as the "shoulder coach" within the user's daily workflow.

| Criterion | Use ADK When... (GFS Use Case) |
| :---- | :---- |
| **Core Logic** | You need **code-defined reasoning**. In your case, the agent isn't just following a playbook; it must programmatically decide when to generate a specific React component or diagram. |
| **Integrations** | You are moving beyond standard connectors. The GFS agent requires **custom APIs** (Google Vids, NotebookLM) and **Model Context Protocol (MCP)** to securely bridge your backend data stores (Vector/GraphDB). |
| **Collaboration** | You need to manage **cross-platform state**. ADK is necessary to ensure the "learning profile" and current session context remain consistent as the user moves from the Chrome extension to Google Chat. |
| **Control** | You require **granular control** over the "thought" process. Generating safe, functional UI components requires the developer to strictly define how the model's output is structured and validated before it hits the frontend. |

### **Dev Environment & Tooling**

To support the high-frequency iteration cycles required for Agentic UI and multi-platform deployment (Chrome Extension \+ GChat), the following stack is standardized:

* **Version Control & CI/CD: GitHub**  
  * Centralized repository for all agent logic, React components, and MCP schemas.  
  * **GitHub Actions** integrated with **Gemini CLI** for automated unit testing of LLM-generated UI components before staging.  
* **Orchestration & Prototyping: Gemini CLI \+ Conductor**  
  * **Gemini CLI:** Used for rapid model switching (3.1 Pro for reasoning vs. 3.1 Flash for latency-sensitive tasks) and prompt engineering versioning.  
  * **Conductor:** Acts as the primary workflow orchestrator to manage the sequence of calls between the GFS knowledge graph and the generative UI engine.  
* **Multi-Agent Framework: Antigravity**  
  * Facilitates the **A2A (Agent-to-Agent)** handoffs. Specifically, it manages the state transition when a user moves from the "Desktop Shoulder Coach" to the "Mobile GChat Agent," ensuring no loss of context or progress in the training flow.  
* **Core Development: ADK (Agent Development Kit)**  
  * The foundational framework for defining custom reasoning loops, tool-calling logic, and the secure execution environment for the agent's "thoughts."  
  * Includes the **ATUI (Agentic Template UI) library** for consistent React/Tailwind generation.  
* **Data & System Integration: Google MCP (Model Context Protocol)**  
  * Built on the **Interactions API** to provide a standardized bridge between the Gemini models and GFS internal data stores (NotebookLM GraphDB, legacy EHR, and documentation).  
  * Allows for real-time "Read/Write" capabilities within the GChat interface via secure connectors.  
* **Frontend Sandbox: React Component Previewer**  
  * A dedicated local environment for testing the agent's generated UI outputs in a sandboxed iframe, preventing malicious code execution while allowing for live "hot-reloading" of agentic designs.  
* **Observability: Google Cloud Vertex AI Inspector**  
  * Used for real-time monitoring of token usage, latency tracking for the "Shoulder Coach" features, and debugging the "thought traces" of the ADK logic.  
* **Deployment: Firebase App Hosting**  
  * Used to host the web-based GFS portal and the backend endpoints for the Chrome Extension and GChat actions, ensuring global low-latency access.

### **HITM (Human-in-the-Middle) Compliance Workflow**

To ensure GFS regulatory compliance and data integrity, all "Write" or "Modify" actions initiated by the agent are gated by a mandatory **HITM sequence**. This prevents unintended updates to legacy systems while maintaining the speed of an AI-driven workflow.

#### **Workflow Logic**

1. **Action Identification:** Gemini 3.1 Pro identifies a required update (e.g., updating a training record or modifying a user profile in the legacy EHR).  
2. **State Pause:** The **Antigravity** orchestrator pauses the execution thread and generates a **Proposed Action Object (PAO)**.  
3. **Interactive Notification:** The **Interactions API** pushes a high-priority "Approval Card" to the user’s current interface (Chrome Extension or GChat).  
4. **Verification:** The user reviews the proposed change. Options include:  
   * **Approve:** Signs the request with a session-based token.  
   * **Edit:** Adjusts the parameters before submission.  
   * **Reject:** Discards the action and provides feedback to the agent (updating the context window).  
5. **Execution:** Only upon receipt of the signed token does the **MCP** execute the `WRITE` command to the legacy backend.

| Resource Tier | Access Level | HITM Required? | Tech Implementation |
| :---- | :---- | :---- | :---- |
| **Knowledge Graph** | Read-Only | No | **MCP-Graph-Connector** (NotebookLM sync) |
| **Documentation** | Read-Only | No | **MCP-Drive-Bridge** (PDFs/Internal Wikis) |
| **User Profiles** | Read/Write | **Yes** | **MCP-Legacy-IAM** (Identity Access Management) |
| **EHR / Core Systems** | Read/Write | **Yes** | **MCP-Interactions-Gateway** (High-Security) |
| **Agentic UI States** | Read/Write | No | **Local Session Store** (Fast-track) |

