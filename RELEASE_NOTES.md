# Release Notes

## Version 1.3.0 - AI Learning Path Generator & Saved Paths
*Release Date: December 2025*

### 🎯 Overview
This release introduces an AI-powered Learning Path Generator that creates personalized 3-step learning journeys, links use cases directly to learning paths, and enables users to save paths to their profiles with an auth-aware flow for unauthenticated users.

---

### ✨ New Features

#### AI Learning Path Generator
- **Gemini-Powered Path Creation**
  - Integrated on landing page with persona and goal inputs
  - Generates personalized 3-step pathways (Hook → Action → Deep Dive)
  - AI rationale explaining why each course was selected
  - Direct links to Google Cloud Skills Boost catalog

- **Google Cloud Course Integration**
  - 3,472 courses from Google Cloud Skills Boost catalog
  - Course recommendations with proper catalog search URLs
  - "Practice in SkillForge" CTA for internal skill application

#### Use Case → Learning Path Linking
- **Seamless Discovery-to-Learning Flow**
  - Added `suggestedPersona` and `suggestedGoal` fields to use cases
  - "Learn Skills for This Use Case" button in use case modals
  - Pre-fills Learning Path Generator with use case context
  - 16 use cases now linked to suggested learning paths

#### Save Learning Paths to Profile
- **Persistent Learning Paths**
  - New `saved_learning_paths` database table with RLS policies
  - Save button appears after path generation
  - Dashboard integration with "My Learning Paths" tab
  - View, expand details, and delete saved paths
  - Track which use case inspired each path

#### Auth-Aware Save Flow
- **Friction-Free Engagement**
  - Unauthenticated users see AuthPromptModal when saving
  - Pending path stored in sessionStorage during auth flow
  - Auto-save after successful authentication
  - Seamless "try before login" experience
  - Clear messaging: "Save Your Learning Path"

---

### 🔧 Technical Improvements

#### New Edge Function
- **`learning-path-ai`**
  - Accepts persona and goal inputs
  - Injects simplified Google Cloud catalog into system prompt
  - Structured JSON output with rationale and pathway array
  - `maxOutputTokens` set to 4096 for complete responses

#### Database Schema
- **New `saved_learning_paths` Table**
  - `id`, `user_id`, `title`, `persona`, `goal`, `rationale`
  - `pathway` (JSONB array of course recommendations)
  - `use_case_id` (optional link to originating use case)
  - `created_at`, `updated_at` timestamps
  - RLS policies for user-specific access

#### Architecture Pattern
- **External-Internal Learning Bridge**
  - Google Cloud Skills Boost for course discovery
  - SkillForge for hands-on practice and application
  - Dual-platform approach positions SkillForge as practice layer

---

### 📦 New Files

- `src/data/googleCloudCatalog.ts` - 3,472 course catalog
- `src/components/marketing/LearningPathGenerator.tsx` - AI path generator
- `src/components/marketing/AuthPromptModal.tsx` - Auth prompt for saves
- `src/components/SavedLearningPaths.tsx` - Dashboard saved paths display
- `supabase/functions/learning-path-ai/index.ts` - Gemini integration

---

### 🎨 UI/UX Improvements

#### Landing Page Enhancement
- **"Build Your Learning Path" Section**
  - Positioned before "Discover What's Possible" use cases
  - Clean form with persona dropdown and goal textarea
  - Animated path reveal with course cards
  - Save and Start Learning CTAs

#### Dashboard Integration
- **New "Learning Paths" Tab**
  - Card grid of saved paths with metadata
  - Expandable path details with course links
  - Delete functionality with confirmation
  - "Generate New Path" quick action

---

### 📊 Impact Summary

- **4 major features added** (Path Generator, Use Case Linking, Save Paths, Auth Flow)
- **1 new edge function** (`learning-path-ai`)
- **1 new database table** (`saved_learning_paths`)
- **16 use cases enhanced** with learning path suggestions
- **5 new components** created

---

### 🚀 What's Next

Upcoming enhancements:
- Learning path progress tracking
- Collaborative path sharing
- AI-generated practice exercises for each path step
- Path completion certificates
- Cross-path skill recognition

---

### 📝 Notes for Developers

#### New Services & Patterns
- `sessionStorage` pattern for pending auth actions
- `forwardRef` pattern for component scroll/prefill methods
- Event-driven auth completion handling

#### Database Migrations Required
- Run migration to create `saved_learning_paths` table
- Verify RLS policies are active

#### Breaking Changes
- None - all changes are additive

---

## Version 1.2.1 - Production Documentation Suite
*Release Date: November 2025*

### 🎯 Overview
This release introduces a comprehensive Production Documentation Suite for enterprise architects and DevOps teams. The new documentation system provides detailed architecture diagrams, deployment checklists, and operational runbooks with interactive Mermaid diagram rendering directly in the Admin Dashboard.

---

### ✨ New Features

#### Production Documentation Suite
- **New "Production Deploy" Tab in Admin Dashboard**
  - Integrated documentation viewer with tabbed interface
  - Access to 4 comprehensive enterprise-grade documents
  - Download individual documents or entire suite as bundle
  - Professional presentation for technical leadership and architects

- **Comprehensive Documentation Coverage**
  - `PRODUCTION_ARCHITECTURE.md`: Complete GCP infrastructure design with visual diagrams
    - Multi-tier architecture overview
    - Cloud Run, Cloud SQL, Redis caching layer
    - Network topology and security groups
    - Data flow and request lifecycle diagrams
  - `DEPLOYMENT_CHECKLIST.md`: Step-by-step deployment guide
    - Pre-deployment validation checklist
    - Phase-by-phase migration plan
    - Risk assessment and rollback procedures
  - `OPERATIONS_RUNBOOK.md`: Day-2 operational procedures
    - Monitoring and alerting setup
    - Incident response playbooks
    - Scaling and performance optimization
  - `INFRASTRUCTURE_SETUP.md`: IaC configuration guide
    - Terraform setup and configuration
    - GCP project and service account setup
    - CI/CD pipeline configuration

- **Interactive Documentation Viewer**
  - Live Mermaid diagram rendering in browser
  - Architecture diagrams (GCP infrastructure, network topology)
  - Flowcharts (CI/CD pipeline, deployment workflow)
  - Sequence diagrams (data flow, request lifecycle)
  - Markdown preview with syntax highlighting
  - Dark mode compatible
  - Responsive diagram scaling
  - One-click document downloads

- **Enterprise Architecture Overview**
  - Cost estimates: $300-500/month for small-medium deployment
  - Migration timeline: 2-3 weeks for full production deployment
  - Technical stack coverage: GCP, Terraform, Cloud Run, Cloud SQL, Redis
  - Security features: VPC, IAM, RLS, encryption at rest/in transit

---

### 🔧 Technical Improvements

#### Mermaid Diagram Support
- **Browser-Native Rendering**
  - Custom `MermaidCode` React component for async diagram rendering
  - Uses official `mermaid` npm package (v11.12.1)
  - Automatic detection of `language-mermaid` code blocks
  - Graceful fallback to code display on rendering errors
  
- **Enhanced Markdown Preview**
  - `react-markdown` with GitHub-flavored markdown support (`remark-gfm`)
  - Custom code component handlers for inline vs. block code
  - Proper syntax highlighting and formatting
  - Responsive overflow handling for large diagrams

- **Dark Mode & Accessibility**
  - Mermaid diagrams adapt to theme settings
  - Sufficient contrast for readability
  - Responsive container for mobile viewing
  - Overflow scrolling for large architecture diagrams

---

### 📦 New Dependencies

- `mermaid` (v11.12.1): Official Mermaid diagram rendering library
- `react-markdown` (v9.0.1): Markdown rendering in React
- `remark-gfm` (v4.0.0): GitHub-flavored markdown support

---

### 🐛 Bug Fixes

#### Mermaid Rendering Compatibility
- **Fixed `runSync` async error**
  - Replaced incompatible `rehype-mermaid` plugin
  - Implemented browser-compatible custom Mermaid component
  - Proper async/await handling in React component lifecycle
  - No server-side dependencies required

---

### 🎨 UI/UX Improvements

#### Admin Dashboard Enhancement
- **New Production Deploy Tab**
  - Professional card-based document grid
  - Clear document descriptions and metadata
  - Prominent "Download All" button for bulk downloads
  - Visual icons for each document type (FileText, CheckSquare, BookOpen, Settings)

#### Documentation Preview
- **Split-View Interface**
  - Document cards on left for selection
  - Live preview pane on right
  - Tabbed interface for quick document switching
  - "View Document" and "Download" actions per document

---

### 📊 Impact Summary

- **1 major feature added** (Production Documentation Suite with 4 documents)
- **1 new admin tab** (Production Deploy in Admin Dashboard)
- **3 new dependencies** (mermaid, react-markdown, remark-gfm)
- **1 technical improvement** (Browser-native Mermaid rendering)
- **1 bug fix** (Async rendering compatibility)
- **4 comprehensive documents** (Architecture, Deployment, Operations, Infrastructure)

---

### 🚀 What's Next

Future documentation enhancements:
- Security audit checklist and compliance documentation
- Performance optimization guide with benchmarks
- Disaster recovery and backup procedures
- Multi-region deployment architecture
- Cost optimization strategies and analysis tools

---

### 📝 Notes for Developers

#### New Components
- `ProductionDocumentation` component in `src/components/admin/`
- Custom `MermaidCode` component for diagram rendering
- Integrated into `AdminDashboard` via new tab

#### Documentation Files
- All markdown files located in `public/docs/` directory
- Publicly accessible at `/docs/*.md` routes
- Can be updated independently of code deployments
- Markdown format allows easy version control

#### Mermaid Rendering Implementation
```tsx
// Initialize Mermaid once on mount
useEffect(() => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
  });
}, []);

// Custom component for rendering
const MermaidCode = ({ children }: { children: string }) => {
  // Uses mermaid.render() with unique IDs
  // Handles async rendering in useEffect
  // Falls back to <pre> on error
};
```

#### Breaking Changes
- None - all changes are additive

#### Browser Compatibility
- Mermaid rendering requires modern browser with ES6+ support
- SVG rendering works in all major browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation to code blocks if rendering fails

---

## Version 1.2.0 - Multi-Subject Platform & Security Enhancements
*Release Date: October 2025*

### 🎯 Overview
This major release introduces multi-subject learning capabilities, comprehensive security hardening, and enhanced administrative controls. Users can now enroll in multiple learning subjects, while administrators gain powerful tools for subject management and content oversight.

---

### ✨ New Features

#### Multi-Subject Learning Platform
- **Subject Discovery & Enrollment**
  - New `SubjectSelector` component with dropdown interface for browsing available subjects
  - One-click enrollment system with automatic progress tracking initialization
  - Visual indicators for enrolled vs. available subjects
  - Seamless subject switching without losing progress in other subjects

- **Enhanced Subject Configuration System**
  - `SubjectConfigService` expanded with multi-subject support
  - User enrollment tracking with primary subject designation
  - Subject-specific syllabus, prompts, and skill areas
  - Automatic content cache management per subject

#### Admin Subject Management
- **Comprehensive Subject Administration** (`SubjectManagement` component)
  - Create, edit, duplicate, and archive subjects via intuitive interface
  - AI-powered Subject Wizard for automated subject generation
  - Configurable branding (colors, logos, landing page URLs)
  - Custom system prompts and phase context profiles
  - Bulk user enrollment tools (enroll all users, migrate enrollments)
  - Subject status management (active/archived)
  - Default subject designation

#### Enhanced Admin Access Control
- **Improved Role-Based Access Security**
  - Admin role verification now uses security definer function `has_role()`
  - Prevents privilege escalation attacks via direct profile manipulation
  - Proper RLS policies on `user_roles` table
  - Admin-only access to Subject Management, User Management, and Analytics dashboards

---

### 🔒 Security Enhancements

#### Input Validation on Feedback Form
- **Comprehensive Zod Schema Validation**
  - Title field: 5-200 characters (enforced)
  - Description field: 20-2,000 characters with real-time counter
  - Validation applied before database insertion
  - User-friendly error messages for validation failures
  - Protection against payload injection and database bloat

#### Database Security Hardening
- **Row-Level Security (RLS) Improvements**
  - All user-specific tables properly secured with RLS policies
  - `user_roles` table protected with security definer functions
  - Subject enrollments isolated per user
  - Admin profile queries use `has_role()` security definer function

- **Edge Function Authentication**
  - All Supabase Edge Functions require JWT authentication
  - Authorization header validation on all requests
  - No public endpoints exposing sensitive operations

---

### 🐛 Bug Fixes

#### Subject Enrollment Synchronization
- **Fixed subject dropdown refresh issue**
  - Subject selector now properly updates when enrollments change
  - `useUserSubjects` hook listens for enrollment events
  - Tab visibility changes trigger enrollment refresh
  - Prevents stale data in subject selection interface

#### Edge Function Security
- **Removed insecure admin bypass**
  - Admin profile queries now use proper `has_role()` function
  - Eliminates potential privilege escalation vulnerability
  - Consistent security model across all admin features

---

### 🎨 UI/UX Improvements

#### Subject Selector Enhancements
- **Visual Enrollment Indicators**
  - Clear distinction between enrolled and available subjects
  - Primary subject highlighted with checkmark
  - Organized sections: Enrolled Subjects / Browse Available
  - Refresh button for manual enrollment sync

#### Feedback Form Improvements
- **Character Counter Display**
  - Real-time character count for description field (0/2000)
  - Visual feedback for input length limits
  - Improved user guidance during feedback submission

---

### 🔧 Technical Improvements

#### SubjectConfigService Expansion
- **New Methods Added**
  - `getAllActiveSubjects()`: Fetch all active subjects for discovery
  - `getUserEnrollments(userId)`: Get all enrolled subjects for a user
  - `setPrimarySubject(userId, subjectId)`: Change primary subject
  - `enrollUser(userId, subjectId, isPrimary)`: Enroll user in subject
  - Enhanced caching strategy for multi-subject support

#### useUserSubjects Hook
- **Comprehensive Subject Management**
  - Manages both enrolled and available subjects state
  - `switchSubject()` function with automatic cache clearing
  - `refreshEnrollments()` for manual sync
  - `isEnrolled()` helper for enrollment checks
  - Event-driven updates via `EnrollmentEvents` service

#### Database Schema Enhancements
- **New Tables and Columns**
  - `user_subject_enrollments`: Track user enrollments across subjects
  - `subjects.is_default`: Designate default subject for new users
  - Enhanced `subject_config` jsonb structure for extensibility

---

### 📊 Impact Summary

- **5 major features added** (Multi-subject system, Subject Management, Admin controls, Subject discovery, Bulk enrollment)
- **4 critical security fixes** (Input validation, RLS hardening, Admin role security, Edge function auth)
- **2 bug fixes** (Subject sync, Admin bypass)
- **3 UX improvements** (Subject selector, Character counters, Visual indicators)
- **3 technical enhancements** (Service layer expansion, Hook refactor, Schema updates)

---

### 🚀 What's Next

Upcoming features in development:
- Cross-subject skill transfer and recognition
- Subject recommendation engine based on user progress
- Advanced subject templating for rapid content creation
- Enhanced analytics per subject
- Subject marketplace for community-created content

---

### 📝 Notes for Developers

#### Breaking Changes
- None - all changes are backward compatible

#### API Changes
- `useUserSubjects` hook now returns additional properties:
  - `allSubjects`: Array of all active subjects
  - `isEnrolled(subjectId)`: Helper function
  - `refreshEnrollments()`: Manual refresh function

#### New Services
- `SubjectConfigService` expanded with new methods (see Technical Improvements)
- `EnrollmentEvents` service for cross-component enrollment updates

#### Database Migrations Required
- If upgrading from v1.1.0, ensure `user_subject_enrollments` table exists
- Run migration to add `is_default` column to `subjects` table
- Verify RLS policies on `user_roles` and `user_subject_enrollments` tables

#### Dependencies
- No new npm dependencies added
- Uses existing `zod` library for input validation

#### Security Notes
- **FIXED**: Feedback form input validation vulnerability
- **FIXED**: Admin role bypass in profile queries
- **REMAINING**: Three Supabase dashboard configuration warnings (require manual settings adjustment):
  1. OTP expiry time reduction recommended
  2. Leaked password protection should be enabled
  3. PostgreSQL version upgrade available

---

## Version 1.1.0 - Post-Launch Refinements
*Release Date: January 2025*

### 🎯 Overview
This release focuses on enhancing user experience through bug fixes, improved navigation, and refined analytics displays following our initial launch.

---

### ✨ New Features

#### Learning Resources Hub
- **Added dedicated Learning Resources card** to the Dashboard
- Replaces the previous "AI Implementation" card with curated learning materials
- Direct access to comprehensive AI training resources and documentation

---

### 🐛 Bug Fixes

#### Skill Assessment Navigation Fix
- **Fixed critical navigation bug** where "Assess My Skills" button pointed to incorrect route
- Corrected route from `/skill-assessment` to `/assessment`
- Users can now seamlessly access the assessment tool from the Dashboard

#### Assessment Session Persistence Issue
- **Resolved session storage bug** that caused completed assessments to display the last question when revisiting
- Session data now properly clears upon assessment completion
- Returning to `/assessment` after completion now starts a fresh assessment
- Improved user experience for multiple assessment attempts

---

### 🎨 UI/UX Improvements

#### Dashboard Analytics Enhancements
- **Improved Gemini Training progress display**
  - Changed from "completed phases" to "explored phases" for better accuracy
  - More intuitive representation of learning journey progress

- **Enhanced time displays with relative formatting**
  - Recent scenario completions now show "2 hours ago", "3 days ago", etc.
  - More user-friendly than absolute timestamps
  - Utilizes `date-fns` for consistent time formatting

- **Refined average completion time display**
  - Shows 'N/A' when no data is available instead of showing zero
  - Clearer communication of data availability

#### Chart Rendering Optimization
- **Fixed React console warnings** in analytics charts
- Removed redundant `ResponsiveContainer` nesting within `ChartContainer`
- Cleaner console output for better debugging experience

---

### 🔧 Technical Improvements

#### Code Organization
- **Created centralized skill area constants** (`src/constants/skillAreas.ts`)
- Ensures consistency across the application for skill area references
- Reduces duplication and potential naming mismatches

#### Analytics Refactoring
- **Separated scenario-based and syllabus-based skill progress calculations**
- More accurate progress tracking across different learning paths
- Improved data integrity in user analytics

---

### 📊 Impact Summary

- **3 critical bugs fixed** (navigation, session persistence, chart warnings)
- **5 UX improvements** (relative times, progress labels, completion displays)
- **2 technical enhancements** (constants refactoring, analytics separation)
- **1 new feature** (Learning Resources hub)

---

### 🚀 What's Next

Stay tuned for upcoming features:
- Enhanced AI coaching capabilities
- Expanded scenario library
- Advanced progress tracking
- Personalized learning paths

---

### 📝 Notes for Developers

#### Breaking Changes
- None

#### Migration Required
- None - all changes are backward compatible

#### Dependencies
- No new dependencies added
- Existing `date-fns` library now utilized for time formatting

---

## Version 1.0.0 - Initial Launch
*Previous Release*

Initial public release of the AI Learning Platform with core features:
- Interactive skill assessments
- Gemini training curriculum
- Scenario-based learning
- AI coaching integration
- User progress tracking
- Analytics dashboard
