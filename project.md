# Jurisight: Official Project Plan & Technical Blueprint
**Version:** 2.0
**Last Updated:** September 17, 2025
**Project Lead:** Managing Editor
**Technical Lead:** Lead Developer

---

### **1. Executive Summary**

Jurisight is a digital-first legal knowledge platform for the Indian market, blending timely court/policy coverage with essential career and educational resources. This document outlines the comprehensive plan to launch Jurisight within an ambitious **8-week timeline**, leveraging a modern, scalable technical stack.

Our mission is to democratize legal knowledge. Our strategy is to build a trusted brand through a **freemium model**, supported by a robust contributor workflow, a commitment to legal compliance (DPDP Act, IT Rules), and a strong focus on SEO.



---

### **2. Core Identity & Mission**

* **Mission Statement:** To demystify Indian law and democratize legal knowledge, making it accessible, understandable, and actionable for students, professionals, and the public.
* **Vision Statement:** To become India's most trusted and indispensable digital resource for the legal community, fostering a more informed, connected, and empowered ecosystem.
* **Core Values:** Accuracy, Accessibility, Integrity, Community, Innovation.
* **Target Audience:** Law students, early-career legal professionals (0-7 years PQE), senior practitioners, academics, and policy enthusiasts.

---

### **3. Technical Architecture & Stack**

We have selected a modern, decoupled architecture to ensure performance, scalability, and an excellent developer experience.

* **Frontend (Next.js 14):**
    * **Why:** For its best-in-class Server-Side Rendering (SSR) and Static Site Generation (SSG) capabilities, which are critical for SEO and fast page loads. The App Router provides a robust foundation for building both the public-facing site and the authenticated contributor portals.
    * **Implementation:** Will handle all user-facing pages, dynamic article routes (`/articles/[slug]`), and protected dashboards.

* **Backend (Headless CMS - Strapi):**
    * **Why:** For its powerful out-of-the-box features, including a customizable API, Draft & Publish workflows, and fine-grained Role-Based Access Control (RBAC). Its headless nature allows us to use the best frontend technology and distribute content to any channel in the future.
    * **Implementation:** Will manage all content, users, media, and editorial workflows.

* **UI Components (shadcn/ui):**
    * **Why:** It provides a set of beautifully designed, accessible, and composable components built on Tailwind CSS and Radix UI. This allows for rapid UI development while maintaining full control over styling to match Jurisight's brand identity.
    * **Implementation:** Will be used for the entire UI, including data tables, forms, modals, and navigation.

* **Deployment:**
    * **Next.js Frontend:** Vercel (for seamless integration, preview deployments, and edge network performance).
    * **Strapi Backend:** Render (for managed Postgres database, auto-scaling, and simple configuration).

---

### **4. Key Features & Workflows**

The platform's core is a sophisticated editorial workflow connecting contributors and editors.

#### **4.1. Contributor Workflow**
1.  **Authentication:** Contributor signs up/logs in via NextAuth.js (Email/Password + Google OAuth), which syncs with Strapi.
2.  **Dashboard:** Sees a `shadcn/ui DataTable` listing their articles and current statuses (e.g., `Draft`, `In Review`, `Published`).
3.  **Submission:** Clicks "New Article" to open a multi-step form.
    * Enters metadata (Title, Tags, Section).
    * Writes content using a Tiptap rich text editor.
    * Adds citations and sources via custom components.
    * Uploads a featured image.
4.  **Action:** Saves as `Draft` or clicks "Submit for Review," which changes the article's status in Strapi and notifies editors.

#### **4.2. Editor Workflow**
1.  **Authentication:** Editor logs in with elevated privileges.
2.  **Queue:** Accesses a protected `/editor/queue` page showing all articles with the `In Review` status.
3.  **Review:** Clicks on an article to open a review screen.
    * Reads the content.
    * Leaves comments (internal or for the contributor).
    * Views revision history.
4.  **Action:**
    * **Approve:** Changes status to `Approved`.
    * **Request Changes:** Changes status to `Needs Revisions` and sends a notification to the contributor with comments.
    * **Publish:** Sets the `publishedAt` date and makes the article live on the public site.

---

### **5. Data Models (Strapi CMS)**

#### **5.1. Content-Types**
* **Article:**
    * `title` (Text)
    * `slug` (UID, from title)
    * `dek` (Textarea, short summary)
    * `body` (Rich Text)
    * `status` (Enum: `DRAFT`, `IN_REVIEW`, `NEEDS_REVISIONS`, `APPROVED`, `PUBLISHED`)
    * `featuredImage` (Media)
    * `author` (Relation to Users)
    * `section` (Relation to Section C-T)
    * `tags` (Relation to Tag C-T)
    * `caseCitations` (Component)
    * `sources` (Component)
    * `publishedAt` (DateTime)

#### **5.2. Components**
* **Case Citation:** `name` (Text), `court` (Text), `citation` (Text), `year` (Number), `url` (Text)
* **Source Link:** `title` (Text), `url` (Text)

#### **5.3. Roles & Permissions (RBAC)**
* **Public:** Read-only access to `Published` articles.
* **Contributor:** Create/Read/Update their own `Articles`. Cannot publish.
* **Editor:** Full CRUD access to all `Articles`, Sections, and Tags. Can publish.
* **Admin:** Full system access.

---

### **6. Actionable 8-Week Launch Plan**

| Phase / Timeline | Key Objectives            | Technical & Strategic Milestones                                                                                                                                                           |
| :--------------- | :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WEEKS 1-2** | **Foundation & Setup** | • **Tech:** Init Next.js & Strapi repos. Install shadcn/ui. Configure Vercel/Render projects. <br> • **Data:** Build `Article` content-type in Strapi. <br> • **Auth:** Implement NextAuth.js with Strapi provider. <br> • **Legal:** Draft all compliance & governance pages. |
| **WEEKS 3-4** | **Build Core Workflows** | • **Contributor Portal:** Build dashboard and multi-step submission form. <br> • **Editor Portal:** Build review queue and actions (Approve/Reject). <br> • **Content:** Begin seeding the CMS with 15-20 launch articles.                             |
| **WEEKS 5-6** | **Build Public Site & Polish** | • **Frontend:** Develop the public-facing homepage, section pages, and dynamic article pages (`[slug]`). <br> • **SEO:** Implement Metadata API, `sitemap.xml`, and JSON-LD structured data. <br> • **Testing:** E2E tests for core workflows with Playwright.      |
| **WEEKS 7-8** | **Deploy, Launch & Iterate** | • **Deployment:** Finalize CI/CD pipelines. Migrate DB to production Postgres. <br> • **GO-LIVE:** Launch the public website. Announce on social media. <br> • **Post-Launch:** Monitor Analytics/Sentry. Apply for AdSense. Plan Q1 roadmap.     |

---

### **7. Critical Success Pillars**

* **Legal Compliance:** Strict adherence to the **DPDP Act 2023** (consent, privacy notices) and **IT Rules 2021** (grievance officer, ethics code) from day one.
* **SEO & Discoverability:** A primary focus on technical SEO (SSR, structured data, sitemaps) and content SEO to ensure high visibility on Google and Google News.
* **Monetization Readiness:** The platform will be built with future monetization in mind, starting with AdSense and laying the groundwork for a subscription model (e.g., protecting premium content routes).