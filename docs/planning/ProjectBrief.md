Project Brief – Inventory & Procurement Management System (IPMS)

---

1️⃣ **What is this app?**
**Working title:** Inventory & Procurement Management System (IPMS)

A modern web‑based single‑page application (SPA) backed by a RESTful API that lets multiple users collaboratively manage inventory, create purchase requisitions, approve orders, and monitor stock levels. The project is designed to showcase full‑stack development, real‑time collaboration, role‑based workflow, external API integration, and dev‑ops hygiene—skills that stand out on a résumé.

---

2️⃣ **Core Functionality (MVP – ≈ 4 weeks)**
- **Item Catalog:** CRUD for inventory items (SKU, name, description, quantity, location, unit price).
- **User Authentication:** Email + password login using JWT (HttpOnly cookie).
- **Roles & Permissions:** Admin, Inventory Clerk, Procurement Officer. Permissions enforced on API and UI.
- **Purchase Requisition:** Clerk creates a requisition (list of items & quantities).
- **Multi‑Level Approval Workflow:** Two‑step approval – Manager → Finance. Each step sends email & in‑app notifications; an audit log records who approved/rejected and when.
- **Receive Goods:** Finance officer marks a requisition as *Received*; stock quantities increase accordingly.
- **Low‑Stock Alerts:** When quantity falls below a configurable threshold, the system sends a mock email (SendGrid free tier or SMTP localhost) and shows an in‑app toast notification to relevant users.
- **Real‑Time Sync (Polling):** Front‑end polls the backend every **5 seconds** for stock, requisition and approval status changes, giving a live‑feel without WebSocket complexity.
- **Demand Forecasting (Simple Moving Average):** A lightweight forecasting engine computes a 4‑week moving average per SKU and suggests reorder quantities on the dashboard.
- **Interactive Charts:** Chart.js visualisations – stock turnover line chart, monthly spend bar chart, and low‑stock heat map.
- **Export to Google Sheets (Read‑Only):** One‑click export of the current inventory view to a Google Sheet using a service‑account key (read‑only, no write permissions).
- **Reporting Dashboard:** Aggregated view with totals, low‑stock count, recent requisitions, and the charts above.
- **CI/CD Pipeline:** GitHub Actions workflow that lints, runs unit tests, builds Docker images and pushes them to Docker Hub on every push.
- **OpenAPI (Swagger) Docs:** Auto‑generated API documentation served at `/api/docs`.
- **Data Import/Export (CSV):** *Out‑of‑scope* for the MVP (nice‑to‑have later).
- **Supplier Management / PO Generation:** *Out‑of‑scope* for the MVP.
- **Advanced Analytics / AI Forecasting:** *Out‑of‑scope* for the MVP.

---

3️⃣ **Scope & Boundaries**
- **In‑Scope (MVP):** All features listed above. This gives a complete end‑to‑end workflow and showcases real‑time updates, forecasting, visual analytics, multi‑level approval, and external API integration.
- **Out‑of‑Scope for initial sprint:** QR‑code support, supplier‑portal, advanced AI forecasting, CSV bulk import, writable Google Sheets, and any paid third‑party services.
- **Future Extensions (post‑MVP):** QR/Barcode scanning, AI‑driven demand prediction, full ERP integration, multi‑tenant SaaS, Docker‑Compose production deployment, performance/load testing.

---

4️⃣ **Technical Choices (portfolio‑impact focused)**
- **Frontend:** React with TypeScript + Vite. Fast HMR, widely adopted, and lets us use React Query for data fetching (polling).
- **UI Library:** Material‑UI (MUI) – professional look, built‑in components for tables, dialogs, and snackbars (in‑app notifications).
- **Charts:** Chart.js (via `react-chartjs-2`). Popular, easy to embed responsive graphs.
- **Backend:** Node.js with NestJS (structured, decorator‑based, built‑in validation, and easy Swagger generation).
- **Database:** PostgreSQL (hosted on free‑tier Render/Railway). Relational model fits inventory & requisition logic.
- **ORM:** Prisma – type‑safe schema, migrations, and easy integration with NestJS.
- **Authentication:** JWT in HttpOnly cookies, password hashing with bcrypt.
- **Polling:** Front‑end uses React Query with a `refetchInterval: 5000` (5 s) to keep data fresh.
- **Forecasting:** Simple Moving Average algorithm implemented in the backend service layer (no external ML libs required).
- **Google Sheets Export:** Google Sheets API with a service‑account JSON key (read‑only).
- **Email:** SendGrid free tier (or local SMTP) – mock email sending; actual mail not required for portfolio demo.
- **CI/CD:** GitHub Actions workflow (lint, test, docker build, docker push).
- **Containerisation:** Dockerfile for both frontend and backend; optional `docker-compose.yml` for local dev.
- **Deployment:** Free tier on Render (or Railway). Both provide static site hosting for the SPA and a Node backend with PostgreSQL.
- **Version Control:** Public GitHub repo with detailed README.

---

5️⃣ **Non‑Functional Requirements**
- **Performance:** API responses < 200 ms for CRUD ops on up to 5 k items; polling overhead ≤ 5 % of server CPU.
- **Security:** Hashed passwords, short‑lived JWT (15 min) + refresh token, role‑based endpoint guards, input sanitisation, CSP headers, and mock email only (no real credentials committed).
- **Scalability:** Stateless NestJS services; can be horizontally scaled behind a load balancer.
- **Reliability:** Database transactions for stock adjustments to avoid race conditions.
- **Usability:** Responsive MUI layout, accessible ARIA components, toast notifications for in‑app alerts.
- **Maintainability:** Clean folder architecture (`src/modules/*`), TypeScript strict mode, ESLint + Prettier, JSDoc comments, OpenAPI spec.
- **Cost:** All services (Render/Railway free tier, SendGrid free tier, Google Sheets service account) stay within free limits.

---

6️⃣ **User Roles & Permissions (summary)**
- **Admin:** Manage users & roles, full CRUD on items and requisitions, delete any record, view audit logs.
- **Inventory Clerk:** View items, adjust stock (stock‑in/out), create requisitions.
- **Manager:** Approve/reject requisitions at first level, view pending approvals, receive email & in‑app notifications.
- **Finance Officer:** Approve/reject at second level, mark requisitions as Received, trigger low‑stock alerts, export to Google Sheets.

---

7️⃣ **Success Criteria & Portfolio Presentation**
- **GitHub repo** with:
  - `README.md` (project overview, architecture diagram, setup & deployment instructions, screenshots/GIFs of live workflow).
  - `ARCHITECTURE.md` containing a Mermaid diagram of frontend ↔ backend ↔ DB ↔ external services (Google Sheets, SendGrid).
  - `docker-compose.yml` for local dev.
  - `ci.yml` GitHub Actions file.
- **Live demo URL** (Render/Railway) where a reviewer can:
  1. Log in as different roles (admin, clerk, manager, finance).
  2. Create a requisition, see the approval flow with email + toast notifications.
  3. Observe the 5‑second polling UI updating stock levels in real time.
  4. View the forecasting chart and export inventory to a Google Sheet.
- **Code quality:** ESLint passes, TypeScript `noImplicitAny`, unit‑test coverage ≥ 70 % (Jest for NestJS, React Testing Library for UI).
- **Documentation:** Swagger UI (`/api/docs`) and JSDoc comments.

---

8️⃣ **Timeline (4‑week sprint) – updated with new features**
- **Week 1:** Project scaffold – repo, Docker Compose, PostgreSQL via Prisma, NestJS skeleton, React + Vite, MUI theme, JWT authentication, role middleware, basic UI layout.
- **Week 2:** Implement Item Catalog CRUD, polling mechanism (React Query `refetchInterval: 5000`), unit tests, CI lint step.
- **Week 3:** Build Purchase Requisition flow, Multi‑Level Approval (Manager → Finance) with audit log, Mock Email (SendGrid) + in‑app toast notifications, Low‑Stock Alert logic.
- **Week 4:** Add Demand Forecasting (SMA), Interactive Charts (Chart.js), Google Sheets read‑only export, final UI polish, comprehensive README, deploy live demo, run final test suite.

---

9️⃣ **Risks & Mitigations (updated)**
- **Polling overload:** 5 s interval may cause extra DB load. *Mitigation:* efficient SQL count queries, caching in NestJS, keep dataset ≤ 10 k rows.
- **SendGrid / Google Sheet API limits:** free tier caps. *Mitigation:* use mock SendGrid (log to console) and a service‑account with read‑only scope; fallback to downloadable CSV if API call fails.
- **Multi‑level approval complexity:** extra UI states. *Mitigation:* reuse NestJS guards and a simple status enum (`Pending → ManagerApproved → FinanceApproved → Received`).
- **CI/CD configuration errors:** pipeline may break on Windows dev machines. *Mitigation:* keep CI configs platform‑agnostic, run tests in Ubuntu runner (standard GitHub Actions).
- **Time pressure:** trying to fit many features in 4 weeks. *Mitigation:* prioritize core workflow (catalog, requisition, 2‑step approval, polling, notifications). Extras (charts, forecasting, export) scoped to be simple implementations.

---

🔜 **Next Actions (immediate)**
1. Create the GitHub repository (public) using the name `inventory-procurement-system`. Add a `README.md` placeholder.
2. Add Docker Compose skeleton (`frontend`, `backend`, `postgres`).
3. Set up CI workflow (`.github/workflows/ci.yml`) with lint + test steps.
4. Begin authentication & role middleware in NestJS (this unlocks the rest of the features).
5. Follow the weekly plan above, committing at least once per day.

