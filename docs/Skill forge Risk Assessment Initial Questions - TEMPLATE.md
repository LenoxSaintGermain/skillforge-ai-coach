

### Purpose

The goal of this document is to obtain the information that the EIS-CRC team will need to complete a Risk Assessment. Please see [How to Submit a Risk Assessment Request](https://docs.google.com/document/d/1eik34vORpuPaG8gI5S6c-lSqPiqnq16uHrzPbeC0YaQ/edit) for more information on this process.

Please answer as many questions as possible. We understand that you likely won’t know the answers to all of the questions.

### Complete for all: General Questions

* Who is the main point of contact for this assessment?  
  * \<FILL IN HERE\>   
    * What is the best way to contact this person?  
    * \<FILL IN HERE\>   
* What is the desired due date for this effort?  
  * \<FILL IN HERE\>  
* What is the name of the technology/software?  
  * \<FILL IN HERE\>  
* Please supply the use cases for this solution to further understand this request and how the application will be used (i.e. How many people will use it, what will it be used for, will it connect to any internal systems, etc.)  
  * \<FILL IN HERE\>   
* What group of users will be using this application? For example, business users, GTS users, NASLT users?  
  * \<FILL IN HERE\>   
* Please provide a Data Flow diagram or a Sequence diagram that contains:  
  * User interactions \- Login, Exports/imports, etc  
    * \<FILL IN HERE\>   
  * Integrations to other systems/applications \- Services (See below), Other methods for file transfer, etc)  
    * \<FILL IN HERE\>   
  * Protocols being used \- such use using a web browser (HTTP/HTTPS), SSL, SSH, etc  
    * \<FILL IN HERE\>   
  * If you are not certain as to what you may need to do in this section, please contact the EIS Security Engineer assigned to help you answer this questions.  
* List services (if any) in use such as REST, SOAP, HTTP Invoker, etc \- (see Service Options standards for reference)  
  * \<FILL IN HERE\>   
* What is the criticality of this application to the business operations?  
  * \<FILL IN HERE\>   
* How are users (consider both users of the solution and developers/admins)...  
  * Authenticated \- \<FILL IN HERE\>   
  * Authorized \- \<FILL IN HERE\>   
  * Managed \- \<FILL IN HERE\>   
* How will this application be patched/maintained?  
  * \<FILL IN HERE\>   
* Which GTS team supports this application and/or vendor relationship?  
  * \<FILL IN HERE\>   
* Will a mobile application version of this application be utilized/supported?  
  * \<FILL IN HERE\>

### 

### Complete for all: Data Related

* Review the [Data Classification and Protection](https://docs.google.com/document/d/1G9-EYswfhSNWaonfZKpqFvz-eRVienTQBu9LstRu95g/edit?usp=sharing) Standard. Based on this definition, does your system interact with any…  
  * Restricted data \-  \<FILL IN WHICH FIELDS HERE\>  
  * Confidential data \- \<FILL IN WHICH FIELDS HERE\>  
* Data specific questions  
  * What new data is being created with this system? Note: this can be a higher level answer (e.g. invoice data, item configuration, etc)  
    * \<FILL HERE\>  
  * Where will the data be stored? (e.g. on-prem in our data center in database X or in GCP cloud data bucket)  
    * \<FILL HERE\>  
  * Will the data be encrypted at rest?  
    * \<FILL HERE, put “Unsure” if you don’t know\>  
  * Describe your methodology to Cleanse “Deleted Data”? How long does it take to have the data completely wiped.  
    * \<FILL HERE, put “Unsure” if you don’t know\>  
  * Will data be shared with any 3rd parties?  
    * \<FILL HERE list of third-parties, put “Unsure” if you don’t know\>

* Identify responsibilities for the data created or maintained. For example: Identify the Data Owner, Steward, Custodian (See Data Governance Roles).


| Data Domain/Schema | Data Owner | Data Steward | Data Custodian |
| :---- | :---- | :---- | :---- |
| \<FILL COLs/ROWs HERE\> |  |  |  |
|  |  |  |  |
|  |  |  |  |

### 

### Complete if: SaaS Solution

* Does the site offer SAML federation (aka Single Sign-on) or Google App (GMail) login services? **(this is a requirement)**  
  * \<FILL HERE \- “Yes” or “No”\>  
  * If “Yes”, does the project have SAML federation included in the project for implementation  
    * \<FILL HERE \- “Yes” or “No”\>  
* Does the site offer SAML Federation support for:  
  * See [NetIQ Access Manager \- Request Federation Setup](https://confluence.gfs.com/confluence/display/Tools/NetIQ+Access+Manager+-+Request+Federation+Setup) for more information  
  * Admin login \- \<FILL HERE either Yes or No\>  
  * User logins in general \- \<FILL HERE either Yes or No\>  
  * If the site offers SAML federation, confirm whether 2FA will be included in the setup of the SaaS solution \- \<FILL HERE either: Yes, No, Not supported\>  
* Are there non-SAML user accounts? \<FILL HERE \- “Yes” or “No”\>  
* How is privileged access granted/managed for the SaaS solution? \<describe\>  
  * Is there an attestation process established if managing privileged manually? \<FILL HERE \- “Yes” or “No”\>  
* Complete this section **if this is a WordPress Plugin:**  
  * User Capabilities  
    * User Roles  
    * Hierarchy \- How each role may inherit rights/capabilities  
  * Data Validation \- Does the plugin validate the data before performing any actions.  
  * Securing Input \- Also known as Sanitizing the input \- Validate any data prior accepting it  
  * Securing Output \- Whenever you’re rendering data, make sure to properly escape it. Escaping output prevents XSS (Cross-site scripting) attacks.  
  * Nonces \- Nonces can be used to check that the current user actually intends to perform the action.  
  * Access \- what does the plugin have access to do/see?  
  * Does the plugin have a privacy policy? If so, this might be where a number of answers to the above questions are located  
  * Look at the CVEs listed for the plugin at [Patch Stack.](https://patchstack.com/database)

### Complete if: Off the Shelf Software (application) Deployment

* Please provide a link to the vendor's site, specific software name and version information. \<FILL HERE\>  
* Does it have an embedded database? \<FILL HERE either Yes or No\>  
* What protocols does it require? \<FILL HERE\>  
* What OS does the software/application support? \<FILL HERE\>  
* Does the software/application require special desktop support? (for users) \<FILL HERE either Yes or No\>  
* Is mobile support part of the deployment? \<FILL HERE either Yes or No\>  
* Would there be any integration(s) to other applications/systems?   
  * \<FILL HERE: methods, protocols, etc\>  
* Does the software/application support LDAP or A/D based authentication? Authorization? \<FILL HERE\>

### Complete if: Custom Software Development 

* Where will the custom solution be deployed? (e.g. GCP, Weblogic, etc)  
  * \<FILL HERE\>  
* Is a Static Application Security Testing (SAST) tool included in your SDLC process? \<FILL HERE either Yes or No\>  
  * Examples: SonarCloud, SonarCube  
  * If yes, is it setup in the build pipeline to **“Break the Build”** when important checks fail (e.g. OWASP top ten)? \<FILL HERE either Yes or No\>  
* Is [Sonatype Lifecycle](https://confluence.gfs.com/confluence/display/Tools/Lifecycle) used to validate 3rd party libraries for vulnerabilities in your software dependencies? \<FILL HERE either Yes or No\>  
  * If yes, is Lifecycle setup in the build pipeline to **“Break the Build”** for Critical/High policy violations? \<FILL HERE either Yes or No\>  
* How is the runtime being monitored for infrastructure, configuration issues or vulnerabilities?  
  * If GCP, is Wiz being monitored? \<FILL HERE either Yes or No\>   
  * If Weblogic, is Dynatrace Security being monitored? \<FILL HERE either Yes or No\>  
* How will authentication occur for the application? \<FILL HERE e.g. basic auth, something else\>  
* How will users be authorized access within the application? \<FILL HERE\>  
* Is there anything preventing us from being able to PEN test the application? \<FILL HERE either Yes or No\>   
* Will the application expose services or a user interface to the internet? \<FILL HERE either Yes or No\>   
* Is a WAF (Web Application Firewall) being deployed as a part of this application? \<FILL HERE either Yes or No\> 

### Complete if: Credit Card and/or Payment solution

* Who is the specific provider (i.e. Square, Shopify, etc) that is used to process credit card payments (ex: Square, Stripe, etc.)?   
  * \<FILL HERE name of payment solution\>  
  * Please note, the provider must supply an AoC (Attestation of Compliance)  
    * Provide this to the compliance team member (Brandon Empie) for our records.   
      * \<FILL HERE link to AoC\>   
* Who is or is planned to be the merchant of record for the credit card payments? GFS or the provider? (ex. Square, Shopify, Worldpay etc.)  
  * \<FILL HERE\>   
* What type of payment process is being used? (i.e. eCommerce, Virtual payment terminal, physical payment terminal device)  
  * \<FILL HERE\>  
* eCommerce provider must list 3rd party services (e.g. payment processor, hosting provider)  
  * Must provide AoC  
    * Provide this to the compliance team member (Brandon) for our records  
* List the other hosting service of the website (e.g. LiquidWeb) must provide a SOC 2  
  * This is only applicable to GFS (or one of our affiliates) if the solution is a custom solution we developed, deploy and manage.  
  * Send a copy to compliance team member to add information for QSA audit as well as sec engineer reviewing as to identify potential controls that are expected from GFS  
* Ensure that the SAQ (Self Assessment Questionnaire) that is being used is the correct questionnaire based on the payments and processes they are using  
  * Only if the division is doing an SAQ   
  * This could also change from SAQ to full ROC  
    * Link to PCI SAQ documentation  
  * Follow up should be done with the CRC team on which SAQ should be selected.  
* Create a diagram, or ask for one, for hosting service  
  * Document flow of CC data and tokens  
  * Identify technologies used for handling of CC data  
* Integrations  
  * How are product offerings loaded into the solution? Is this a manual load?  
  * How are transactions / orders being processed and sent to GFS (or affiliates) systems for processing?  
  * How are payment transactions being processed and sent to GFS (or affiliates) systems for processing?  
* Understand how the flow is working (iFrame, JavaScript, etc.)  
  * Where is the credit card information being stored?   
  * Are they doing tokenization?   
    * Low value or high value tokenization?   
* Does the person need to be logged in to access the credit card payment page

