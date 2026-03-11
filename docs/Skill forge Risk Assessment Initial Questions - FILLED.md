### Purpose

The goal of this document is to obtain the information that the EIS-CRC team will need to complete a Risk Assessment. Please see [How to Submit a Risk Assessment Request](https://docs.google.com/document/d/1eik34vORpuPaG8gI5S6c-lSqPiqnq16uHrzPbeC0YaQ/edit) for more information on this process.

Please answer as many questions as possible. We understand that you likely won’t know the answers to all of the questions.

### Complete for all: General Questions

* Who is the main point of contact for this assessment?  
  * <FILL IN HERE>   
    * What is the best way to contact this person?  
    * <FILL IN HERE>   
* What is the desired due date for this effort?  
  * <FILL IN HERE>  
* What is the name of the technology/software?  
  * **SkillForge AI Coach**
* Please supply the use cases for this solution to further understand this request and how the application will be used (i.e. How many people will use it, what will it be used for, will it connect to any internal systems, etc.)  
  * **SkillForge AI Coach is an AI-native learning platform used for personalized coaching, discovering learning resources, and generating custom learning paths using AI (Gemini/Vertex AI). It is an internal tool for employees to enhance their skills. It uses Cloud APIs and Vertex AI as its primary internal integrations.**
* What group of users will be using this application? For example, business users, GTS users, NASLT users?  
  * **Internal employees / Business users seeking learning and development, and administrators managing learning content.**
* Please provide a Data Flow diagram or a Sequence diagram that contains:  
  * User interactions - Login, Exports/imports, etc  
    * **Users login via GCP Identity Platform (Firebase Auth). They interact with the React/Vite frontend hosted on Cloud Run via Cloud Load Balancer & Cloud CDN, which communicates with backend Cloud Run Functions representing different microservices.**
  * Integrations to other systems/applications - Services (See below), Other methods for file transfer, etc)  
    * **Integrates with GCP Vertex AI (Gemini 2.5 models) for all AI coaching services. Uses GCP Cloud SQL for database and Cloud Storage for file caching/uploads.**
  * Protocols being used - such use using a web browser (HTTP/HTTPS), SSL, SSH, etc  
    * **HTTPS (SSL/TLS) from user browser to Cloud Load Balancer. Internal GCP HTTP traffic between frontend, Cloud Run Functions, Cloud SQL, and Vertex AI.**
  * If you are not certain as to what you may need to do in this section, please contact the EIS Security Engineer assigned to help you answer this questions.  
* List services (if any) in use such as REST, SOAP, HTTP Invoker, etc - (see Service Options standards for reference)  
  * **REST APIs (communication between frontend and backend functions), and gRPC (internal Vertex AI calls).**
* What is the criticality of this application to the business operations?  
  * **Low/Medium (Internal Learning and Development tool, not in the critical path for core business operations).**
* How are users (consider both users of the solution and developers/admins)...  
  * Authenticated - **GCP Identity Platform / Firebase Auth.**
  * Authorized - **Role-based access control (RBAC) managed within the application database (Cloud SQL `user_roles` table) and verified by backend functions.**
  * Managed - **Identity Platform console and internal application admin dashboard.**
* How will this application be patched/maintained?  
  * **Automated CI/CD pipeline via Cloud Build tracking the Git repository. Base images are patched regularly by GCP (Cloud Run / Cloud Functions base images). Infrastructure managed via Terraform.**
* Which GTS team supports this application and/or vendor relationship?  
  * <FILL IN HERE>  
* Will a mobile application version of this application be utilized/supported?  
  * **The web application is mobile-responsive, but no native mobile app is currently planned.**

### Complete for all: Data Related

* Review the [Data Classification and Protection](https://docs.google.com/document/d/1G9-EYswfhSNWaonfZKpqFvz-eRVienTQBu9LstRu95g/edit?usp=sharing) Standard. Based on this definition, does your system interact with any…  
  * Restricted data -  **None expected.**
  * Confidential data - **User profile data, internal learning goals, skill assessments, performance feedback, AI coaching session transcripts.**
* Data specific questions  
  * What new data is being created with this system? Note: this can be a higher level answer (e.g. invoice data, item configuration, etc)  
    * **User learning profiles, AI session transcripts, generated learning paths, skill assessments, achievement records, educational content.**
  * Where will the data be stored? (e.g. on-prem in our data center in database X or in GCP cloud data bucket)  
    * **GCP Cloud SQL (PostgreSQL 15) for relational data, GCP Cloud Storage for user uploads/content cache.**
  * Will the data be encrypted at rest?  
    * **Yes, GCP automatically encrypts Cloud SQL and Cloud Storage at rest with Google-managed keys.**
  * Describe your methodology to Cleanse “Deleted Data”? How long does it take to have the data completely wiped.  
    * **Cloud SQL automated backups are retained according to policy (e.g. 7 days). User data deletion is handled via application logic and standard GCP lifecycle policies for Cloud Storage buckets.**
  * Will data be shared with any 3rd parties?  
    * **No 3rd parties. All AI processing is done within the GCP enterprise boundary using Vertex AI (data is not used to train Google's public models).**

* Identify responsibilities for the data created or maintained. For example: Identify the Data Owner, Steward, Custodian (See Data Governance Roles).


| Data Domain/Schema | Data Owner | Data Steward | Data Custodian |
| :---- | :---- | :---- | :---- |
| SkillForge User Data / Auth | <FILL COLs/ROWs HERE> |  |  |
| Learning Content & AI Prompts |  |  |  |
| App Architecture / Admin |  |  |  |

### Complete if: SaaS Solution
*(N/A - This is Custom Software Deployed on GCP, not a SaaS vendor solution)*

### Complete if: Off the Shelf Software (application) Deployment
*(N/A - This is Custom Software)*

### Complete if: Custom Software Development 

* Where will the custom solution be deployed? (e.g. GCP, Weblogic, etc)  
  * **GCP (Cloud Run, Cloud Run Functions, Cloud SQL, Cloud Storage).**
* Is a Static Application Security Testing (SAST) tool included in your SDLC process? <FILL HERE either Yes or No>  
  * Examples: SonarCloud, SonarCube  
  * If yes, is it setup in the build pipeline to **“Break the Build”** when important checks fail (e.g. OWASP top ten)? <FILL HERE either Yes or No>  
  * **<Unsure / To be defined in Cloud Build pipeline>**
* Is [Sonatype Lifecycle](https://confluence.gfs.com/confluence/display/Tools/Lifecycle) used to validate 3rd party libraries for vulnerabilities in your software dependencies? <FILL HERE either Yes or No>  
  * If yes, is Lifecycle setup in the build pipeline to **“Break the Build”** for Critical/High policy violations? <FILL HERE either Yes or No>  
  * **<Unsure / To be defined in Cloud Build pipeline>**
* How is the runtime being monitored for infrastructure, configuration issues or vulnerabilities?  
  * If GCP, is Wiz being monitored? <FILL HERE either Yes or No>   
  * If Weblogic, is Dynatrace Security being monitored? <FILL HERE either Yes or No>  
  * **Monitored via GCP Cloud Monitoring, Cloud Logging, and Cloud Trace. Container vulnerability scanning is enabled in Artifact Registry (Container Analysis API).**
* How will authentication occur for the application? <FILL HERE e.g. basic auth, something else>  
  * **GCP Identity Platform / Firebase Auth (JWT token exchange).**
* How will users be authorized access within the application? <FILL HERE>  
  * **JWT tokens are validated by backend Cloud Run Functions via Firebase Admin SDK. Application-level RBAC is checked against the database for administrative actions.**
* Is there anything preventing us from being able to PEN test the application? <FILL HERE either Yes or No>   
  * **No.**
* Will the application expose services or a user interface to the internet? <FILL HERE either Yes or No>   
  * **Yes, a web-based user interface will be accessible.**
* Is a WAF (Web Application Firewall) being deployed as a part of this application? <FILL HERE either Yes or No> 
  * **Yes, GCP Cloud Armor is deployed in front of the Cloud Load Balancer.**

### Complete if: Credit Card and/or Payment solution
*(N/A - No payment processing involved)*
