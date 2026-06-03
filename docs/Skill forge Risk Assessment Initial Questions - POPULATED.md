# SkillForge Risk Assessment - Initial Questions

### Purpose

The goal of this document is to obtain the information that the EIS-CRC team will need to complete a Risk Assessment for the SkillForge AI Coach application.

---

### General Questions

* **Who is the main point of contact for this assessment?**
  * `<FILL IN MAIN CONTACT NAME>`
    * **What is the best way to contact this person?**
    * `<FILL IN CONTACT METHOD / EMAIL>`
* **What is the desired due date for this effort?**
  * `<FILL IN DESIRED DUE DATE>`
* **What is the name of the technology/software?**
  * SkillForge AI Coach (AI SkillForge)
* **Please supply the use cases for this solution to further understand this request and how the application will be used (i.e. How many people will use it, what will it be used for, will it connect to any internal systems, etc.)**
  * **Use Case:** SkillForge is an AI-native learning platform designed to help developers and business users develop AI skills (e.g. prompt engineering, software engineering with AI, cloud integrations) through personalized pathways, practical exercises, and hands-on scenarios. The AI acts as a curator and coach generating interactive learning content and UI components on the fly.
  * **Connections:** It connects to Google Cloud Platform (GCP) resources: Cloud Run for serverless backend API execution, GCP Cloud SQL (PostgreSQL) for learning paths and prompt engineering experiment records, and GCP Vertex AI/Google GenAI APIs for reasoning.
* **What group of users will be using this application? For example, business users, GTS users, NASLT users?**
  * GTS users, internal developers, and business users upskilling in AI capabilities.
* **Please provide a Data Flow diagram or a Sequence diagram that contains:**
  * **User interactions - Login, Exports/imports, etc:**
    * Users authenticate securely via Firebase Authentication (fronted by the React client). 
    * Once authenticated, they request personalized curriculum generation, resource discovery, or prompt analysis.
  * **Integrations to other systems/applications - Services, Other methods for file transfer, etc:**
    * React Frontend -> Node.js Express APIs (GCP Cloud Run) -> GCP Cloud SQL (PostgreSQL database for data persistence).
    * Express APIs -> Google GenAI (Interactions API / Gemini models hosted on enterprise Vertex AI project tenant).
  * **Protocols being used - such as using a web browser (HTTP/HTTPS), SSL, SSH, etc:**
    * Web client interaction via HTTPS (SSL/TLS).
    * Backend databases accessed securely within GCP VPC network boundaries.
* **List services (if any) in use such as REST, SOAP, HTTP Invoker, etc:**
  * REST API endpoints hosted on GCP Cloud Run.
* **What is the criticality of this application to the business operations?**
  * Important for internal learning, developer upskilling, and enablement, but not a mission-critical transaction platform.
* **How are users (consider both users of the solution and developers/admins)...**
  * **Authenticated:** Firebase Authentication (validated via JWT token using Bearer scheme inside the backend endpoints).
  * **Authorized:** Row-level authorization enforced programmatically in the database queries using the authenticated user's UID (e.g., retrieving or updating paths/experiments belonging to the user).
  * **Managed:** Managed using the Firebase Console.
* **How will this application be patched/maintained?**
  * Package dependencies are managed via npm. Maintained and deployed via automated CI/CD pipelines (GCP Cloud Build and Cloud Deploy).
* **Which GTS team supports this application and/or vendor relationship?**
  * `<FILL IN SUPPORTING GTS TEAM>`
* **Will a mobile application version of this application be utilized/supported?**
  * No, only web access is supported (responsive design handles mobile browser view).

---

### Data Related

* **Review the Data Classification and Protection Standard. Based on this definition, does your system interact with any…**
  * **Restricted data:** None. No personal financial information, PCI, PHI, or highly sensitive enterprise credentials.
  * **Confidential data:** Firebase User UIDs, user learning goals, curated learning resources, and prompt engineering experiment text inputs/responses.
* **Data specific questions:**
  * **What new data is being created with this system? Note: this can be a higher level answer (e.g. invoice data, item configuration, etc)**
    * Personalized learning paths, curriculum rationales, subject wizard configurations, prompt engineering exercises, chat logs, user progress, and evaluation metrics.
  * **Where will the data be stored? (e.g. on-prem in our data center in database X or in GCP cloud data bucket)**
    * Google Cloud SQL (PostgreSQL database instance).
  * **Will the data be encrypted at rest?**
    * Yes. GCP Cloud SQL uses Google-managed encryption keys to encrypt all data at rest by default.
  * **Describe your methodology to Cleanse “Deleted Data”? How long does it take to have the data completely wiped.**
    * Unsure / TBD based on the enterprise GCP database backup retention policy.
  * **Will data be shared with any 3rd parties?**
    * No. All data remains within the enterprise Google Cloud Platform tenant project boundaries. Model interactions use enterprise GCP Vertex AI endpoints.

---

### SaaS Solution (Not Applicable)
*This is a custom-developed application deployed on GCP, not a SaaS or WordPress solution.*

---

### Off the Shelf Software Deployment (Not Applicable)
*This is a custom software development project.*

---

### Custom Software Development

* **Where will the custom solution be deployed? (e.g. GCP, Weblogic, etc)**
  * Google Cloud Platform (GCP) utilizing Cloud Run and Cloud SQL.
* **Is a Static Application Security Testing (SAST) tool included in your SDLC process?**
  * Yes (configured in CI/CD pipeline / git hooks).
    * **If yes, is it setup in the build pipeline to “Break the Build” when important checks fail (e.g. OWASP top ten)?**
    * `<FILL IN: Yes/No>`
* **Is Sonatype Lifecycle used to validate 3rd party libraries for vulnerabilities in your software dependencies?**
  * `<FILL IN: Yes/No>`
* **How is the runtime being monitored for infrastructure, configuration issues or vulnerabilities?**
  * **If GCP, is Wiz being monitored?**
    * Yes, GCP project resources are monitored using Wiz.
* **How will authentication occur for the application?**
  * Firebase Authentication (validated backend-side using JWT verification).
* **How will users be authorized access within the application?**
  * Eforced in the database access layer where queries check that records match the current user's authenticated UID.
* **Is there anything preventing us from being able to PEN test the application?**
  * No.
* **Will the application expose services or a user interface to the internet?**
  * Yes, the web client user interface is exposed to the internet.
* **Is a WAF (Web Application Firewall) being deployed as a part of this application?**
  * Yes (integrated via GCP Cloud Armor or equivalent fronting balancer).

---

### Credit Card and/or Payment solution (Not Applicable)
*The SkillForge application does not process, handle, or store credit cards or payment transactions.*
