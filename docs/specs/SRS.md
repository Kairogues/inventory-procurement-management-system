# Software Requirements Specification (SRS)

**Project:** Inventory & Procurement Management System (IPMS)  
**Document Version:** 1.3 – Official Baseline  
**Date:** 2026-11-15  
**Status:** Approved for Implementation  

---

### Revision History
| Version | Date | Status | Description |
|---------|------|--------|-------------|
| 0.1 | 2026-11-12 | Draft | Preliminary draft specification. |
| 0.9 | 2026-11-13 | Draft | Comprehensive draft with core requirements and workflows. |
| 0.9.1 | 2026-11-14 | Revised Draft | Addressed findings from Independent Audits Round 1 & 2: added FR‑023–FR‑030, RBAC matrix, typed SSE specification, refreshed NFRs, and synchronized Data Model. |
| 0.9.2 | 2026-11-14 | Revised Draft | Addressed Round 3 audit findings: changed Google Sheets export to POST (REST semantics), added concurrency controls for requisition transitions (`SELECT FOR UPDATE`), Admin self-deactivation guard, price snapshot rule, and concrete NFR verification methods. |
| 1.0 | 2026-11-14 | Approved | Official baseline approved for system design, sprint planning, and implementation. |
| 1.1 | 2026-11-14 | Approved | Enhanced export authorization: granted `GET /export/csv` to all authenticated roles for physical counts/planning and `POST /export/google-sheet` to Admin, Manager, and Finance Officer for management reporting. |
| 1.2 | 2026-11-15 | Approved | API & workflow alignment from UI/UX requirements review: added `PATCH /requisitions/:id/resubmit` (G01), embedded `timeline[]` in `GET /requisitions/:id` (G02), rejection history tracking (G03), bulk notification read `PATCH /notifications/read` (G04), and `status` filter on `GET /items` (G05). |
| 1.3 | 2026-11-15 | Approved | Consolidated approved UI/UX architecture decisions U-01 through U-13: clarified immediate requisition submission with no draft state (U-01); defined item details drawer presentation (U-02); established system-wide requisition visibility with 'My Requisitions' filter (U-03); formalized 'Approve with Changes' quantity modification dialog (U-04); updated Goods Receipt interaction for actual received quantity entry by Inventory Clerk with partial delivery support and dual-authorization for excess quantities (U-05, U-05.1, U-05.2); mandated full name as primary user identifier (U-06); enforced automatic system SKU generation (U-07); standardized soft deletion with confirmation dialog (U-08); added role-specific predefined requisition views (U-09); specified notification deep-linking and highlight behavior with destination context (U-10); defined role-tailored dashboard activity feed (U-11); added dual Quick/Custom Google Sheets export (U-12); and incorporated self-service password recovery alongside Admin assistance (U-13). |

---

## 1. Introduction
### 1.1 Purpose
The purpose of this document is to specify the functional and non‑functional requirements for the **Inventory & Procurement Management System (IPMS)**. This specification serves as the authoritative contract and baseline for developers, architects, testers, and project stakeholders throughout implementation and verification.

### 1.2 Scope
The system enables multiple user roles to manage inventory items, create purchase requisitions, execute a two‑step approval workflow (Manager → Finance), receive goods, generate low‑stock alerts, view a real‑time dashboard, and export inventory data to Google Sheets.

The MVP focuses on the **internal requisition, approval, and stock management workflow**. External supplier interactions (supplier portals, formal purchase order EDI, delivery tracking) are deferred to post-MVP releases (see §2.6).

### 1.3 Definitions, Acronyms, Abbreviations
| Term | Definition |
|------|------------|
| **MVP** | Minimum Viable Product – mandatory features scheduled for the initial 4-week release box. |
| **SSE** | Server‑Sent Events – unidirectional HTTP push mechanism for real‑time state updates from back-end to front-end. |
| **JWT** | JSON Web Token – signed stateless token used for authentication (short-lived access token + rotating refresh token). |
| **CRUD** | Create, Read, Update, Delete operations. |
| **SMA** | Simple Moving Average – demand-forecasting heuristic (optional / post-MVP). |
| **NFR** | Non‑functional Requirement. |
| **FR** | Functional Requirement. |
| **RBAC** | Role‑Based Access Control. |
| **Clerk** | Shorthand for "Inventory Clerk" throughout this document. |
| **Finance** | Shorthand for "Finance Officer" throughout this document. |

### 1.4 References
In accordance with IEEE 29148 §9.5.4, the following documents form part of this specification to the extent cited herein. For internal project artifacts, paths are relative to the project repository.

| Ref ID | Document Title | Document Identifier / Source | Version / Date | Location |
|:------:|:---------------|:-----------------------------|:--------------:|:---------|
| [REF-01] | Project Brief | IPMS-DOC-BRIEF | v1.0 (2026-11) | [`docs/planning/ProjectBrief.md`](../planning/ProjectBrief.md) |
| [REF-02] | Data Model & Business Rules | IPMS-DOC-DATAMODEL | v1.2 (2026-11) | [`docs/specs/DataModel.md`](./DataModel.md) |
| [REF-03] | Functional Requirements Register | IPMS-DOC-REQREG | v1.0 (2026-11) | [`docs/specs/RequirementsRegister.md`](./RequirementsRegister.md) |
| [REF-04] | Architectural Decision Log | IPMS-DOC-DECISIONS | v1.0 (2026-11) | [`docs/decisions/DecisionLog.md`](../decisions/DecisionLog.md) |
| [REF-05] | Requirements Audit & Review Log | IPMS-DOC-AUDIT | v1.2 (2026-11) | [`docs/archive/SRS_Draft_Review.md`](../archive/SRS_Draft_Review.md) |
| [REF-06] | ISO/IEC/IEEE 29148:2018 | ISO/IEC/IEEE Standard | 2018-11 | Systems and software engineering — Life cycle processes — Requirements engineering |
| [REF-07] | RFC 7807 | IETF Standards Track | 2016-03 | Problem Details for HTTP APIs |
| [REF-08] | W3C Server-Sent Events | W3C / WHATWG Recommendation | Living Standard | HTML EventSource / text/event-stream specification |

### 1.5 Document Conventions
This document utilizes concise natural language. All functional requirements listed as **Mandatory** possess the contractual force of IEEE 29148 "shall" statements — mandatory for MVP completion and verified in test plans. Requirements marked **(Optional)** or **(Good‑to‑have)** denote discretionary post-MVP enhancements (IEEE "may").

Acceptance criteria are specified in imperative format to facilitate direct derivation of test suites and validation scripts.

---

## 2. Overall Description
### 2.1 Product Perspective
IPMS is a standalone multi-tier web application consisting of:
- **Client Tier**: React with TypeScript single-page application (SPA), built using Vite and styled with Material-UI (MUI).
- **Application Tier**: Modular NestJS REST API with guards, interceptors, pipes, and Server-Sent Events (SSE) streaming.
- **Data Tier**: PostgreSQL relational database accessed through Prisma ORM for type-safe schema definitions and automated migrations.

**Integrated External Services (MVP):**
- **SendGrid (Mock)**: Structured email notifications simulated via `ConsoleEmailService` implementing `EmailService`, enabling zero-cost mock logging without API quota consumption.
- **Google Sheets API v4**: Read/write service-account integration for one-way inventory export.
- **GitHub Actions**: Continuous integration pipeline running linting, type checks, unit tests, and container builds.

### 2.2 Product Functions (Summary)
1. **User Authentication & RBAC**: Self-registration (capturing full name) with default clerk permissions, secure JWT session management, role guards, user deactivation, self-service email-based password recovery, and admin password reset (Decisions U-06, U-13).
2. **Item Catalog**: Complete item CRUD with automatic unique SKU generation, soft deletion safeguards, individual SKU reorder thresholds, inventory tracking, and controlled manual stock adjustments (Decisions U-07, U-08).
3. **Purchase Requisition Workflow**: Multi-item requisition creation with immediate submission (no draft state), system-wide requisition visibility with "My Requisitions" filter, two-stage approval gate (Manager → Finance) with dedicated "Approve with Changes" dialog, structured rejection with creator resubmission, creator cancellation of own pending requisitions, and transactional goods receipt by Inventory Clerk with actual quantity recording, partial delivery support, and Manager/Finance excess quantity authorization (Decisions U-01, U-03, U-04, U-05, U-05.1, U-05.2).
4. **Automated Alerting**: Threshold-crossing low-stock notifications delivered via in-app toast, persisted notification inbox with deep linking and highlighting, and logged emails (Decision U-10).
5. **Real-Time Operational Dashboard**: Aggregated stock metrics, low-stock counts, live requisition feeds, and role-specific activity feed driven by SSE push events (Decision U-11).
6. **Data Export**: Direct Quick Export and configurable Custom Export to Google Sheets with instant CSV fallback on network or credential failures (Decision U-12).

### 2.3 User Classes & Characteristics
| Role | Responsibilities & Capabilities |
|------|---------------------------------|
| **Admin** | System administration, user lifecycle management (role reassignment, account deactivation/reactivation, password resets), item catalog authoring/soft deletion, system audit log inspection, inventory data export (Google Sheets & CSV) for system audits and backups. Admin does not participate in workflow approvals. User's full name is displayed as the primary identifier across the system (Decision U-06). |
| **Inventory Clerk** | Physical inventory oversight, item catalog browsing, purchase requisition creation (immediate submission; no draft state) and cancellation of own pending requisitions, viewing all requisitions across the organization with a "My Requisitions" filter for own submissions, entering actual received quantities and confirming physical goods receipts, manual inventory adjustments (stock counts/corrections), on-demand CSV inventory export for warehouse stocktaking and cycle counts (Decisions U-01, U-03, U-05, U-05.1). |
| **Manager** | Operational department review; first-level requisition review (standard approval, "Approve with Changes" dialog for partial quantity modifications, rejection with mandatory reason), excess delivery operational authorization (first stage), low-stock alert recipient, inventory data export (Google Sheets & CSV) for replenishment planning and operational reviews (Decisions U-04, U-05.2). |
| **Finance Officer** | Fiscal gatekeeper; second-level requisition review (standard approval, "Approve with Changes" dialog for partial quantity modifications, rejection with mandatory reason), excess delivery financial authorization (second stage), goods receipt oversight, inventory data export (Google Sheets & CSV) for asset valuation and accounting, low-stock alert recipient (Decisions U-04, U-05.2). |

### 2.4 Operating Environment
- **Client Platforms**: Modern evergreen browsers (Chromium-based, Firefox, Safari) across desktop and tablet/mobile viewports.
- **Runtime Environment**: Node.js 20+ LTS, NestJS 10, PostgreSQL 15+, Prisma ORM 5+.
- **Deployment Platform**: Dockerized container deployment with multi-stage builds (`Dockerfile` and `docker-compose.yml` for reproducible local and staging environments).

### 2.5 Design Constraints & Assumptions
- **Sprint Duration**: 4 calendar weeks for MVP baseline delivery.
- **Mock Notifications**: Production mail service accounts are avoided; SendGrid calls log formatted output to stdout.
- **Per-SKU Thresholds**: Reorder trigger thresholds are configured independently on each catalog item (Decision D-004).
- **Push Transport Mechanism**: Real-time updates utilize unidirectional SSE rather than WebSockets, reducing proxy and socket management overhead (Decision D-005, superseding legacy 5-second polling).
- **Two-Step Approval**: Two-tier hierarchical approval (Manager followed by Finance) is mandatory for procurement integrity (Decision D-002).
- **Physical Goods Receipt & Separation of Duties**: Physical goods receipt entry and confirmation is performed by the Inventory Clerk upon delivery arrival at the dock, recording actual delivered quantities (Decision U-05). Manager and Finance Officer provide managerial and fiscal approval during procurement and two-stage authorization for any excess quantities delivered prior to final inventory increment (Decisions U-05.1, U-05.2).

### 2.6 Out of Scope
The following capabilities are explicitly excluded from the MVP baseline:

| Excluded Capability | Rationale |
|---------------------|-----------|
| Supplier catalog & formal Purchase Order (PO) dispatch | MVP manages internal requisitions and stock; vendor billing/ordering belongs to Phase 2 ERP integration. |
| Staggered multi-shipment backorder tracking | Single-event delivery recording is supported (accepting full delivery, partial delivery $\le$ approved quantity, or authorized excess delivery). Tracking multiple partial shipments over time (split backorders) across separate receipt events is deferred to Phase 2. |
| Bulk CSV catalog importing | Deferred to post-MVP utility enhancements. |
| Barcode / QR hardware scanning | High client complexity; deferred to mobile companion phase. |
| Multi-tenant organization isolation | Single-organization architecture for MVP. |
| Complex predictive / AI demand modeling | Post-MVP optional item (simple SMA forecasting scoped under FR-015). |

---

## 3. Functional Requirements

| ID | Requirement Summary | Detailed Acceptance Criteria |
|----|---------------------|------------------------------|
| **FR‑001** | User Registration, Identification & Authentication | 1. Registration endpoint accepts full name (`fullName`), valid unique email, and password (minimum 8 characters).<br>2. Newly registered users are assigned the `Inventory Clerk` role by default. User's full name is the primary display identifier across all UI views and system records (Decision U-06).<br>3. Passwords must be hashed using `bcrypt` (work factor ≥ 10).<br>4. Authentication issues a short-lived signed JWT access token (15-minute expiry) and an HttpOnly, SameSite refresh token cookie (7-day lifespan).<br>5. Self-service password recovery: Users can request a password-reset link via registered email (`POST /auth/forgot-password`); system dispatches a secure, time-bound reset token link (mocked via `ConsoleEmailService`); user resets credentials via `POST /auth/reset-password` (Decision U-13). |
| **FR‑002** | Role-Based Access Control (RBAC) | 1. Every API route enforces JWT validation and caller role verification via NestJS Guards.<br>2. Endpoint permissions strictly conform to the RBAC Permission Matrix (§9, Appendix A).<br>3. Unauthorized role access returns HTTP 403 Forbidden. |
| **FR‑003** | Item Catalog CRUD, SKU Generation & Deletion Safeguards | 1. Admin can create, read, update, and soft delete catalog items. Initial creation accepts `initialQuantity` ($\ge 0$). Item updates (`PATCH /items/:id`) allow modifying metadata (`name`, `description`, `location`, `unitPrice`, `reorderThreshold`, `isActive`) but strictly prohibit direct modification of `quantity`.<br>2. System automatically generates a unique SKU (`Item.sku`) upon item creation; users cannot manually choose or enter the SKU (Decision U-07).<br>3. Direct manual stock quantity changes must exclusively use `PATCH /items/:id/adjust` (FR-025). Physical stock `quantity` is constrained to non-negative values (`quantity ≥ 0`).<br>4. Catalog deletion (`DELETE /items/:id`) executes soft deletion by setting `Item.isActive = false` and requires a confirmation dialog in the UI (Decision U-08). Soft-deleted items disappear from normal catalog listings (default `status=active`) while remaining accessible to Admin (`status=all` or `status=inactive`).<br>5. Historical requisitions (`RequisitionItem`) and audit logs preserve references to soft-deleted items without data loss (Decision U-08). Hard physical deletion is prohibited for referenced items (HTTP 409 `ItemInUse`). |
| **FR‑004** | Purchase Requisition Creation | 1. Clerk can create and submit a requisition with one or more catalog line items.<br>2. Creating a requisition immediately submits it with `Pending` status upon user confirmation (Decision U-01).<br>3. There is no `Draft` state or Save Draft functionality in the requisition lifecycle (Decision U-01).<br>4. Line-item `approvedQty` initializes to `requestedQty`.<br>5. Requisition `totalAmount` is calculated as $\sum(\text{requestedQty} \times \text{snapshotUnitPrice})$ at creation time.<br>6. `unitPrice` is snapshotted into `RequisitionItem.snapshotUnitPrice` at creation; future catalog price changes do not modify historical requisition values. |
| **FR‑005** | First-Level Manager Approval | 1. Manager can approve (`ManagerApproved`) or reject (`Rejected`) pending requisitions.<br>2. Manager may modify line-item `approvedQty` via a dedicated "Approve with Changes" dialog that allows reviewing requested vs. modified quantities and recalculated total before confirming (Decision U-04). Requisition `totalAmount` automatically recalculates as $\sum(\text{approvedQty} \times \text{snapshotUnitPrice})$. *(Note: Whether quantity modification is restricted strictly to reductions or allows upward adjustment is an unresolved business rule).*<br>3. On rejection, a non-empty `rejectionReason` string is mandatory and logged in the immutable audit record.<br>4. Creator receives an in-app rejection notification and retains permission to edit and resubmit (re-entering `Pending` state). |
| **FR‑006** | Second-Level Finance Approval | 1. Finance Officer can review `ManagerApproved` requisitions to approve (`FinanceApproved`) or reject (`Rejected`).<br>2. Finance may modify `approvedQty` via the dedicated "Approve with Changes" dialog (Decision U-04), updating `totalAmount`. *(Note: Scope of permitted quantity adjustments is subject to product-owner clarification).*<br>3. On rejection, `rejectionReason` is recorded in audit details, the creator is notified, and creator resubmission resets status to `Pending` (restarting full approval cycle). |
| **FR‑007** | Goods Receipt, Quantity Verification & Atomic Stock Update | 1. Inventory Clerk records physical goods receipt against `FinanceApproved` requisitions via `PATCH /requisitions/:id/receive` (Decision U-05).<br>2. Goods receipt interface displays approved quantities; Clerk enters the actual quantities received (`receivedQty`) and must confirm the receipt before it is recorded (Decision U-05).<br>3. Partial delivery is permitted: Clerk can record fewer units than approved (`receivedQty < approvedQty`), and inventory increments by actual received quantities (Decision U-05.1). Full delivery (`receivedQty == approvedQty`) is recorded and increments stock accordingly.<br>4. Excess delivery (`receivedQty > approvedQty`) executes via a distinct four-step workflow (Decisions U-05.1, U-05.2):<br>&nbsp;&nbsp;&nbsp;&nbsp;a. Step 1: Inventory Clerk records delivered counts and submits an excess-delivery authorization request via `POST /requisitions/:id/excess-request` (status transitions to `ExcessPendingManager`).<br>&nbsp;&nbsp;&nbsp;&nbsp;b. Step 2: Manager authorizes the operational need for the excess quantity (status transitions to `ExcessPendingFinance`).<br>&nbsp;&nbsp;&nbsp;&nbsp;c. Step 3: Finance Officer authorizes the additional financial commitment (status transitions to `ExcessApproved`).<br>&nbsp;&nbsp;&nbsp;&nbsp;d. Step 4: Inventory Clerk completes goods receipt after both approvals are granted via `PATCH /requisitions/:id/receive` (status transitions to `Received`), executing atomic inventory increment for confirmed quantities.<br>&nbsp;&nbsp;&nbsp;&nbsp;e. Excess quantities must not be accepted into inventory before both approvals are complete.<br>&nbsp;&nbsp;&nbsp;&nbsp;f. *(Unresolved Decision: System handling if either Manager or Finance Officer rejects the excess delivery is an open product-owner decision).*<br>5. Upon final receipt confirmation, status updates to `Received` and each line item increases `Item.quantity` by confirmed `receivedQty` within a single atomic database transaction utilizing row-level locks (`SELECT ... FOR UPDATE`).<br>6. Low-stock alert evaluations are re-triggered for all modified SKUs. |
| **FR‑008** | Threshold-Crossing Low-Stock Alerts | 1. Alert triggers exclusively when `Item.quantity` transitions from $\ge \text{reorderThreshold}$ to $< \text{reorderThreshold}$.<br>2. Alert fires once per downward threshold boundary crossing; subsequent modifications while remaining below threshold suppress duplicate alerts.<br>3. Evaluated across all stock-altering operations (receipts, manual adjustments, item catalog threshold updates).<br>4. Dispatches an in-app `LowStockAlert` notification to Managers and Finance Officers and emits a formatted log event. |
| **FR‑009** | Server-Sent Events (SSE) Real-Time Stream | 1. Authenticated clients connect via `GET /events` using HttpOnly cookie authentication.<br>2. Emits structured, typed JSON payloads (§4.4) within ≤ 1 second of database commit.<br>3. Transmits periodic heartbeat comments (`: heartbeat\n\n`) every 30 seconds to maintain persistent connections across proxies.<br>4. Client reconnect directive is established at 5000 ms (`retry: 5000`). |
| **FR‑010** | Aggregated Dashboard Service | 1. `GET /dashboard` delivers real-time aggregated metrics: `{ totalItems, lowStockCount, recentRequisitions[] }` (latest 5 records) and role-specific activity feed items (`recentActivities[]`) tailored to the caller's role (Clerk: inventory changes, requisitions, goods receipts; Manager: submissions, Manager approvals; Finance: Finance approvals, requisition updates; Admin: all activities) (Decision U-11).<br>2. Metrics compute on demand without stale cache artifacts.<br>3. State changes broadcast a `dashboard.updated` SSE event to connected clients for instant UI refresh. |
| **FR‑011** | Google Sheets Inventory Export | 1. Authorized management and oversight roles (**Admin, Manager, Finance Officer**) can execute `POST /export/google-sheet` to create or update an external spreadsheet containing current inventory data.<br>2. Supports two export modes (Decision U-12):<br>&nbsp;&nbsp;&nbsp;&nbsp;a. **Quick Export**: Exports inventory data directly using system default settings without prompting for configuration. *(Note: The exact default column set and default item scope are implementation defaults subject to Product Owner confirmation).*<br>&nbsp;&nbsp;&nbsp;&nbsp;b. **Custom Export**: Triggered via a configuration dialog allowing users to select specific columns and choose export scope (all catalog items vs. currently filtered results).<br>3. Uses Google service account with `https://www.googleapis.com/auth/spreadsheets` scope (one-way write from IPMS to Sheet).<br>4. Success returns HTTP 200 with `{ sheetUrl: string }`.<br>5. Third-party failures (credential error, quota cap, network timeout) respond with HTTP 502 Bad Gateway and direct client to the CSV fallback. |
| **FR‑012** | OpenAPI Documentation | 1. Swagger UI is served at `/api/docs`, providing automated schemas, parameters, and authentication definitions derived from NestJS DTOs and decorators. |
| **FR‑014** | Immutable System Audit Logging | 1. System records immutable entries for all entity mutations (`CREATE`, `UPDATE`, `DELETE`, `APPROVE`, `REJECT`, `RECEIVE`, `CANCEL`, `ADJUST`).<br>2. Records capture `entity`, `entityId`, `action`, `performedBy` (storing user ID with full name as primary display identifier, Decision U-06), `timestamp`, and JSON `details` (before/after delta and `rejectionReason`).<br>3. Soft-deleted items retain full audit history and referential traceability (Decision U-08). |
| **FR‑015** | Simple Moving Average (SMA) Forecasting *(Optional)* | 1. Background service calculates 4-week historical consumption moving average per SKU.<br>2. Displays recommended replenishment orders on dashboard analytics view. |
| **FR‑016** | Interactive Data Visualizations *(Good-to-have)* | 1. Chart.js visual components illustrating monthly procurement expenditure, stock turnover lines, and low-stock SKU distributions. |
| **FR‑017** | Notification History, Navigation & Read Status | 1. User notifications persist in `Notification` store (`LowStockAlert`, `RequisitionUpdate`, `ApprovalResult`).<br>2. Notifications store destination context (`entityType` and `entityId`) to identify the target record and destination screen route (Decision U-10). The relevant section or entity to highlight upon navigation is derived deterministically from existing notification attributes without introducing redundant schema fields: `entityType` determines the route (`/requisitions/:id` or `/items`), `entityId` identifies the record instance, and `type` (`ApprovalResult`, `LowStockAlert`, `RequisitionUpdate`) together with record state indicates the specific section or drawer to focus and highlight.<br>3. Clicking a notification navigates the user directly to the target record/screen and highlights the relevant section/information (Decision U-10).<br>4. Provides paginated inbox filtering by read/unread status with bulk (`PATCH /notifications/read`) or single (`PATCH /notifications/:id/read`) mark-as-read capabilities restricted to notification owners. |
| **FR‑018** | Authentication Brute-Force Rate Limiting | 1. Login endpoint (`POST /auth/login`) permits a maximum of 5 attempts per originating IP within a rolling 60-second window.<br>2. Subsequent requests within the window receive HTTP 429 Too Many Requests. |
| **FR‑019** | CSRF Double-Submit Protection | 1. Successful authentication sets a client-accessible, non-HttpOnly cookie (`csrfToken`) and echoes the token in login response data.<br>2. State-changing requests (`POST`, `PATCH`, `DELETE`) require the token value echoed in the `X-CSRF-Token` header.<br>3. Mismatched or absent header returns HTTP 403 Forbidden. |
| **FR‑020** | Rigorous Payload Validation & Sanitization | 1. Inbound request bodies validate against strict class-validator DTOs with unexpected properties stripped (`whitelist: true`, `forbidNonWhitelisted: true`).<br>2. Invalid payloads return HTTP 400 Bad Request with field-level diagnostic messages; input strings are sanitized against injection attacks. |
| **FR‑021** | List Pagination, Filtering & Predefined Views | 1. List endpoints (`GET /items`, `GET /requisitions`, `GET /notifications`, `GET /users`, `GET /audit-logs`) support standardized 1-indexed pagination query parameters: `page` (integer $\ge 1$, default 1) and `limit` (integer $\ge 1$, default 50, max 100).<br>2. List endpoints support domain filters: `GET /items` supports `search` (case-insensitive SKU/name match), `location`, `stockStatus` (`low` [$\text{quantity} < \text{reorderThreshold}$] \| `normal` [$\text{quantity} \ge \text{reorderThreshold}$]), and `status` (`active` \| `inactive` \| `all`, Admin-only); `GET /requisitions` supports query filtering by `status` (enum) and `creatorId` (UUID), and role-specific presets.<br>3. Requisition List provides role-specific predefined views within a shared screen (Decision U-09):<br>&nbsp;&nbsp;&nbsp;&nbsp;a. **Inventory Clerk**: `All Requisitions`, `My Requisitions` (`creatorId = currentUserId`) (Decisions U-03, U-09).<br>&nbsp;&nbsp;&nbsp;&nbsp;b. **Manager**: `Pending Manager Approval` (`status = Pending`), `Reviewed Requisitions`, `All Requisitions`.<br>&nbsp;&nbsp;&nbsp;&nbsp;c. **Finance Officer**: `Pending Finance Approval` (`status = ManagerApproved`), `Reviewed Requisitions`, `All Requisitions`.<br>&nbsp;&nbsp;&nbsp;&nbsp;d. **Admin**: `All Requisitions`.<br>4. Output payload wraps items in standard pagination envelope: `{ data: [...], pagination: { page: number, limit: number, totalCount: number, totalPages: number } }`. |
| **FR‑022** | SSE Connection Quotas | 1. Concurrent active `/events` connections are capped at 3 per authenticated user.<br>2. Connection attempts exceeding threshold respond with HTTP 429 Too Many Requests. |
| **FR‑023** | User Lifecycle & Governance API | 1. Admin can list users (`GET /users`), update assigned roles (`PATCH /users/:id/role`), and toggle activation (`PATCH /users/:id/deactivate`, `PATCH /users/:id/reactivate`).<br>2. User deactivation immediately revokes active refresh tokens; subsequent requests from deactivated accounts return HTTP 403 `AccountDeactivated`.<br>3. Self-deactivation by an Admin is blocked.<br>4. Deactivation of the final remaining active Admin returns HTTP 409 `LastAdminAccount`. |
| **FR‑024** | Requisition Cancellation | 1. Requisition creator can cancel own `Pending` requisition via `PATCH /requisitions/:id/cancel` (Decision U-01).<br>2. Cancellation applies strictly to creator's own `Pending` requisitions (no draft state exists, Decision U-01).<br>3. Status updates to `Cancelled` (terminal state), generating an audit log and notifying relevant Managers and Finance personnel. |
| **FR‑025** | Controlled Inventory Stock Adjustments | 1. Admin and Clerk can execute manual physical stock corrections via `PATCH /items/:id/adjust` supplying signed integer `adjustment` and non-empty `adjustmentReason`.<br>2. Requests resulting in negative inventory (`quantity + adjustment < 0`) are rejected with HTTP 422 `InsufficientStock`.<br>3. Operation executes under transactional lock, records audit trail, and evaluates threshold alert rules. |
| **FR‑026** | Standalone CSV Export & Fallback | 1. **All authenticated roles** (Admin, Inventory Clerk, Manager, Finance Officer) can trigger on-demand CSV stream export via `GET /export/csv` for warehouse cycle counts, inventory planning, and audits.<br>2. Automatically offered as a direct download alternative if Google Sheets synchronization fails. |
| **FR‑027** | Refresh Token Rotation & Session Maintenance | 1. `POST /auth/refresh` verifies existing refresh token cookie, invalidates the used token, and issues a fresh access token and rotated refresh token.<br>2. Stored refresh token hashes support strict one-time use detection. |
| **FR‑028** | Secure Session Logout | 1. `POST /auth/logout` invalidates the active refresh token record in database and clears authentication cookies with expired headers. |
| **FR‑029** | Password Recovery (Self-Service & Admin-Assisted) | 1. System provides two complementary password recovery mechanisms (Decision U-13):<br>&nbsp;&nbsp;&nbsp;&nbsp;a. **Self-Service**: Users request a reset link via `POST /auth/forgot-password` using registered email, receive a secure token link, and set new password via `POST /auth/reset-password`.<br>&nbsp;&nbsp;&nbsp;&nbsp;b. **Admin Assistance**: Admin can invoke `PATCH /users/:id/reset-password` to initiate administrative password reset for a user. In accordance with NFR-009, passwords and temporary credentials must never be written to application logs or console output. The exact secure credential handoff mechanism (e.g., generating a secure one-time reset link or requiring immediate password change on next login) is an unresolved implementation detail requiring Product Owner confirmation. |
| **FR‑030** | Dedicated Dashboard Aggregation Endpoint | 1. Serves atomic counts (`totalItems`, `lowStockCount`), five latest requisition summaries, and role-specific activity feed items via `GET /dashboard` to prevent heavy client-side join queries (Decision U-11). |

*Note: FR‑013 (CI/CD Pipeline) is managed as an engineering process artifact rather than a runtime software capability.*

---

## 4. External Interface Requirements
### 4.1 User Interfaces
- **Responsive Framework**: Modern Responsive Web SPA built with React 18, TypeScript, and Material-UI v5 adapting across Desktop (≥ 1200px), Tablet (768px – 1199px), and Mobile (< 768px) breakpoints.
- **User Identification**: Users are displayed primarily by their full name across all tables, requisition records, approval histories, and audit logs; email addresses serve as secondary information in profile details (Decision U-06).
- **Item Detail Presentation**: Selecting an item in the Item Catalog opens a right-side detail drawer displaying complete SKU attributes and role-dependent action buttons while keeping the catalog visible behind the drawer (Decision U-02).
- **Shared Requisition List Architecture**: Single shared Requisition List screen featuring role-dependent tabs / filter presets rather than separate screens: Inventory Clerk (`All Requisitions`, `My Requisitions`); Manager (`Pending Manager Approval`, `Reviewed Requisitions`, `All Requisitions`); Finance Officer (`Pending Finance Approval`, `Reviewed Requisitions`, `All Requisitions`); Admin (`All Requisitions`) (Decisions U-03, U-09).
- **Notification Inbox & Deep Linking**: Persistent slide-out notification drawer and non-blocking snackbars. Clicking any notification deep-links directly to the relevant screen/record and visually highlights the target section or entity (Decision U-10).
- **Role-Tailored Dashboard**: Unified dashboard layout embedding a role-specific activity feed (Clerk: stock changes, requisitions, goods receipts; Manager: submissions, Manager approvals; Finance: Finance approvals, requisition updates; Admin: all activities) (Decision U-11).
- **Dedicated Workflow Dialogs**:
  - *Item Soft Deletion*: Requires explicit confirmation dialog prior to setting `isActive = false` (Decision U-08).
  - *Approval Quantity Modification*: Dedicated "Approve with Changes" dialog allowing reviewers to review and adjust line quantities before confirming (Decision U-04).
  - *Goods Receipt Confirmation*: Dedicated entry screen displaying approved quantities where Clerks input actual delivered counts and confirm receipt (Decision U-05).
  - *Google Sheets Custom Export*: Configuration modal allowing column selection and scope toggling (all items vs. active filter) (Decision U-12).

### 4.2 Software Interfaces
- **Database Engine**: PostgreSQL 15+ connected via Prisma client connection pooling.
- **Push Notification Stream**: HTTP/1.1 or HTTP/2 newline-delimited Server-Sent Events (`text/event-stream`).
- **Google Sheets API**: Google APIs Client Library using OAuth2 Service Account JSON credentials for scoped spreadsheet updates.
- **Mailer Adapter**: `ConsoleEmailService` mock abstraction conforming to standard mail dispatch interface contracts.

### 4.3 REST API Interface Directory
All API routes are prefixed with `/api/v1` (with exception of documentation and root health probes).

| HTTP Method | Route | Description | Authorization |
|:-----------:|:------|:------------|:--------------|
| `POST` | `/auth/register` | Register new user account (accepts `fullName`, `email`, `password`; defaults to Clerk role) | Public |
| `POST` | `/auth/login` | Authenticate credentials; sets JWT cookies | Public |
| `POST` | `/auth/forgot-password` | Initiate self-service password reset; dispatches email token (mocked) | Public (Decision U-13) |
| `POST` | `/auth/reset-password` | Complete password reset using token and new password | Public (Decision U-13) |
| `POST` | `/auth/refresh` | Rotate refresh token and obtain fresh access token | Authenticated |
| `POST` | `/auth/logout` | Revoke session and purge auth cookies | Authenticated |
| `GET` | `/items` | Paginated catalog listing (`page`, `limit`, `search`, `location`, `stockStatus`, `status=active\|inactive\|all`) | All Authenticated (Inactive/All: Admin only) |
| `POST` | `/items` | Create new catalog item (system auto-generates unique SKU) | Admin (Decision U-07) |
| `PATCH` | `/items/:id` | Update SKU specifications or reorder thresholds (stock quantity cannot be altered via this endpoint) | Admin |
| `PATCH` | `/items/:id/adjust` | Record manual physical count adjustment | Admin, Inventory Clerk |
| `DELETE` | `/items/:id` | Soft-delete catalog item (`isActive = false`; confirmation required) | Admin (Decision U-08) |
| `GET` | `/dashboard` | Fetch aggregated dashboard metrics and role-specific activity feed | All Authenticated (Decision U-11) |
| `POST` | `/requisitions` | Submit purchase requisition (immediately enters `Pending` status; no draft state) | Inventory Clerk (Decision U-01) |
| `GET` | `/requisitions` | Query requisitions (`page`, `limit`, `status`, `creatorId`, role-specific presets) | All Authenticated (Decisions U-03, U-09) |
| `GET` | `/requisitions/:id` | Inspect requisition details, snapshotted lines, rejection history, and `timeline[]` | All Authenticated |
| `PATCH` | `/requisitions/:id/approve` | Submit managerial or financial approval (standard or via "Approve with Changes") | Manager, Finance Officer (Decision U-04) |
| `PATCH` | `/requisitions/:id/reject` | Reject requisition with required explanation | Manager, Finance Officer |
| `PATCH` | `/requisitions/:id/cancel` | Cancel own Pending requisition | Inventory Clerk (Creator only) (Decision U-01) |
| `PATCH` | `/requisitions/:id/resubmit`| Edit and resubmit rejected requisition; resets to Pending with fresh price snapshot | Inventory Clerk (Creator only) |
| `POST` | `/requisitions/:id/excess-request` | Submit excess-delivery authorization request (Step 1 of excess workflow) | Inventory Clerk (Decisions U-05.1, U-05.2) |
| `PATCH` | `/requisitions/:id/excess-authorize` | Authorize excess delivery: Manager operational need (Step 2) or Finance financial commitment (Step 3) | Manager, Finance Officer (Decisions U-05.1, U-05.2) |
| `PATCH` | `/requisitions/:id/receive` | Record actual received quantities and complete goods receipt (valid for standard receipt or Step 4 after dual excess approval) | Inventory Clerk (Decisions U-05, U-05.1, U-05.2) |
| `GET` | `/notifications` | List user notification history (`page`, `limit`, `read`; returns `entityType`, `entityId`) | All Authenticated (Own items) (Decision U-10) |
| `PATCH` | `/notifications/:id/read` | Mark individual notification as read | All Authenticated (Owner only) |
| `PATCH` | `/notifications/read` | Bulk mark notifications as read (`{ ids?: string[], all?: boolean }`) | All Authenticated (Owner only) |
| `GET` | `/audit-logs` | Retrieve chronological audit trail entries (`page`, `limit`, `action`, `entityType`, `startDate`, `endDate`) | Admin |
| `GET` | `/users` | Paginated user registry list (`page`, `limit`, `role`, `status`) | Admin |
| `PATCH` | `/users/:id/role` | Modify assigned user security role | Admin |
| `PATCH` | `/users/:id/deactivate` | Deactivate account (with last-admin guard) | Admin |
| `PATCH` | `/users/:id/reactivate` | Reactivate dormant user account | Admin |
| `PATCH` | `/users/:id/reset-password` | Initiate administrative password reset for user (secure handoff mechanism unresolved; credentials never logged) | Admin (Decision U-13) |
| `POST` | `/export/google-sheet` | Generate/update Google Sheet inventory snapshot (Quick Export or Custom Export with `{ columns, scope, filter }`) | Admin, Manager, Finance Officer (Decision U-12) |
| `GET` | `/export/csv` | Download direct CSV inventory report | All Authenticated |
| `GET` | `/events` | Subscribe to real-time SSE event pipeline | All Authenticated |
| `GET` | `/api/docs` | Interactive OpenAPI Swagger UI | Public (Dev) / Restricted (Prod) |
| `GET` | `/health` | Terminus system and database health probe | Public |

### 4.3.1 Requisition Detail Response Contract
The `GET /requisitions/:id` endpoint returns complete requisition details, snapshotted line items, current and historical rejection reasons, and a chronological milestone timeline:

```json
{
  "id": "uuid-string",
  "creatorId": "uuid-string",
  "creator": {
    "id": "uuid-string",
    "email": "clerk@ipms.internal",
    "name": "Jane Clerk",
    "role": "InventoryClerk"
  },
  "status": "Pending",
  "totalAmount": 1250.00,
  "currentRejectionReason": null,
  "items": [
    {
      "id": "line-id",
      "itemId": "item-id",
      "sku": "SKU-1001",
      "name": "Industrial Widget",
      "requestedQty": 50,
      "approvedQty": 50,
      "receivedQty": 50,
      "snapshotUnitPrice": 25.00,
      "lineTotal": 1250.00
    }
  ],
  "timeline": [
    {
      "id": "event-id",
      "eventType": "SUBMITTED",
      "previousStatus": null,
      "newStatus": "Pending",
      "actor": {
        "id": "uuid-string",
        "email": "clerk@ipms.internal",
        "name": "Jane Clerk",
        "role": "InventoryClerk"
      },
      "timestamp": "2026-11-15T08:00:00Z",
      "rejectionReason": null,
      "quantityModifications": null
    }
  ],
  "rejectionHistory": [
    {
      "stage": "Manager",
      "rejectedBy": {
        "id": "uuid-string",
        "email": "manager@ipms.internal",
        "name": "Bob Manager",
        "role": "Manager"
      },
      "rejectedAt": "2026-11-15T09:30:00Z",
      "rejectionReason": "Exceeds monthly department allocation",
      "cycleNumber": 1
    }
  ],
  "createdAt": "2026-11-15T08:00:00Z",
  "updatedAt": "2026-11-15T09:30:00Z"
}
```

*Field Specifications:*
- `creator.name`, `actor.name`, `rejectedBy.name`: Full name displayed as the primary human identifier across all workflow audit checkpoints (Decision U-06).
- `items.receivedQty`: Integer indicating actual received count confirmed at goods receipt (`null` prior to receipt; supports partial delivery count or authorized excess delivery count) (Decision U-05).
- `currentRejectionReason`: Non-null string strictly when `status === 'Rejected'`; `null` otherwise.
- `timeline.eventType`: Enum with values `SUBMITTED`, `MANAGER_APPROVED`, `MANAGER_REJECTED`, `FINANCE_APPROVED`, `FINANCE_REJECTED`, `EXCESS_REQUESTED`, `EXCESS_MANAGER_APPROVED`, `EXCESS_FINANCE_APPROVED`, `RESUBMITTED`, `RECEIVED`, `CANCELLED`.
- `timeline.quantityModifications`: Optional array of `{ itemId, sku, requestedQty, previousApprovedQty, newApprovedQty }` populated when approving authorities modify item quantities via "Approve with Changes" dialog (Decision U-04).
- `rejectionHistory`: Array of historical rejection entries across review iterations, tracking `stage`, `rejectedBy`, `rejectedAt`, `rejectionReason`, and `cycleNumber` (1-based iteration counter).

### 4.4 SSE Event Specification
The `/events` endpoint streams continuous JSON events formatted in compliance with standard W3C EventSource specifications:

**Event Registry:**
| Event Name | Trigger Condition | Payload Schema |
|------------|-------------------|----------------|
| `item.created` | New catalog SKU inserted | `{ entityId: string, item: object, timestamp: string }` |
| `item.updated` | Item details or quantity changed | `{ entityId: string, changes: object, timestamp: string }` |
| `item.deleted` | SKU removed or soft-deleted | `{ entityId: string, timestamp: string }` |
| `requisition.created` | New purchase requisition submitted | `{ entityId: string, creatorId: string, status: string, timestamp: string }` |
| `requisition.updated` | State change (Approved, Rejected, Cancelled, Received) | `{ entityId: string, status: string, previousStatus: string, timestamp: string }` |
| `notification.created` | Direct user alert created | `{ notificationId: string, type: string, message: string, entityType: string, entityId: string, timestamp: string }` |
| `dashboard.updated` | Inventory or requisition aggregates modified | `{ totalItems: number, lowStockCount: number, timestamp: string }` |

**Distribution Rules:**
- Catalog, requisition, and dashboard events broadcast globally to all authenticated active streams.
- `notification.created` events filter selectively, dispatching strictly to the targeted `userId`.

---

## 5. Non‑Functional Requirements (NFR)

| ID | Category | Requirement Specification | Verification Method |
|----|----------|---------------------------|---------------------|
| **NFR‑001** | **Performance** | API p95 response time < 200 ms for catalog and workflow CRUD on datasets up to 5,000 items. SSE push latency ≤ 1.0 second. | Automated `k6` benchmark suite executed against Docker container; SSE delivery latency verified via end-to-end timestamp diff tests. |
| **NFR‑002** | **Security** | Passwords hashed using bcrypt (cost factor ≥ 10). Access tokens expire in 15 minutes; refresh tokens stored in HttpOnly, SameSite=Strict cookies. Role guards enforce authorization on every private route. | Automated security regression tests; static code analysis (SonarQube/Semgrep); runtime cookie inspection. |
| **NFR‑003** | **Scalability** | Application tier remains stateless for REST requests. Real-time SSE streams are bound to single application instances; multi-instance horizontal scaling is identified as post-MVP (requiring Redis Pub/Sub). | Architecture review verifying absence of local in-memory session stores; stateless service restart validation. |
| **NFR‑004** | **Data Integrity** | All stock quantity increments, decrements, and requisition status transitions must execute within PostgreSQL transactions guarded by row-level locking (`SELECT ... FOR UPDATE`). | Concurrency tests firing simultaneous conflicting approval, cancellation, and decrement operations; validation of zero race-condition anomalies. |
| **NFR‑005** | **Usability** | User interface complies with WCAG 2.1 Level A accessibility standards. Standard visual themes utilize Material-UI components with explicit ARIA tags. | Automated audits with `axe-core`; keyboard navigation testing covering complete requisition lifecycle. |
| **NFR‑006** | **Maintainability** | NestJS modular architecture with explicit domain separation (`/modules/*`). Strict TypeScript compilation (`strict: true`, `noImplicitAny: true`). Complete ESLint and Prettier conformance. | CI build validation pipeline enforcing zero linter warnings and clean compilation. |
| **NFR‑007** | **Cost & Quota** | Production architecture operates within free hosting tiers (Render/Railway free database and compute allowances, free Google Service Account quotas). | Monthly operational cost audit; runtime verification that zero billable external services are invoked. |
| **NFR‑008** | **Portability** | Multi-stage Dockerfiles for client and server. Complete local environment spin-up via single `docker-compose up` command. | Clean-host deployment test validating automated container boot and healthy container status. |
| **NFR‑009** | **Logging & Privacy** | Structured JSON logging to stdout with correlation IDs. Sensitive fields (passwords, auth cookies, JWT tokens, PII) are strictly masked. | Automated log scanner test asserting absence of raw credential strings across test execution runs. |
| **NFR‑010** | **Error Handling** | Global exception filters capture uncaught errors and format unified RFC 7807 problem details: `{ statusCode, message, error, timestamp, path }`. Stack traces suppressed in non-dev environments. | Unit and integration tests triggering 400, 401, 403, 404, 409, 422, and 500 error scenarios. |
| **NFR‑011** | **Health Monitoring** | Automated health check endpoint (`/health`) reports database connectivity, disk storage, and process uptime via NestJS Terminus. | Integration test verifying HTTP 200 during normal runtime and HTTP 503 during simulated DB connection drops. |
| **NFR‑012** | **Audit Immutability** | Audit log records are append-only. Application database credentials restrict SQL `UPDATE` and `DELETE` operations on `AuditLog` tables. | Database constraint tests asserting failure on attempted modifications or deletions of audit records. |
| **NFR‑013** | **Reliability** | Production containers run under explicit restart policies (`restart: unless-stopped`) with automated crash recovery. | Container process termination simulation verifying auto-recovery within 10 seconds. |
| **NFR‑014** | **Configuration** | Operational settings (JWT secrets, CORS origins, service URLs, database connection strings) managed exclusively via environment variables validated at boot. | Startup failure validation test when required environment parameters are omitted. |
| **NFR‑016** | **Network Security** | Strict Cross-Origin Resource Sharing (CORS) whitelist restricting requests to the designated SPA origin. HTTP responses supply strict Content-Security-Policy (CSP) headers. | Automated security header inspection (`helmet` test suite) verifying CSP and CORS response headers. |
| **NFR‑018** | **Database Indexing** | Optimized indexes established on `items.sku`, `items.reorderThreshold`, `items.isActive`, `requisitions.status`, `requisitions.creatorId`, and `users.email`. | Database `EXPLAIN ANALYZE` query plans demonstrating index scans on primary query filters. |
| **NFR‑019** | **Aggregation Efficiency** | Dashboard metric queries execute using optimized aggregation without unbounded table scans. | Query execution benchmarks ensuring aggregate retrieval executes in < 50 ms on 5,000 item datasets. |
| **NFR‑020** | **Resource Governance** | Container configurations enforce explicit resource limits (`mem_limit: 512m`, `cpus: 0.5`) to prevent runaway memory leaks. | Load test monitoring asserting memory utilization remains stable under sustained load. |

---

## 6. Data Requirements & Business Rules
Detailed schemas, foreign key mappings, and table indexes are formally specified in the Data Model & Business Rules document ([REF-02, `docs/specs/DataModel.md`](./DataModel.md)).

### 6.1 Core Business Rules Summary
1. **Inventory Non-Negativity**: Inventory quantity must never drop below 0. Any adjustment or operation yielding negative stock is rejected at the database level.
2. **Reorder Threshold Boundary Evaluation**: Low-stock alerts evaluate on state transition crossings ($\ge \text{threshold}$ to $< \text{threshold}$) to eliminate spam notifications.
3. **Price Snapshot Rule**: Line items record `snapshotUnitPrice` at the moment of requisition submission. Subsequent price updates in the item catalog never alter existing requisition totals.
4. **Approval Line Item Discretion & "Approve with Changes" Dialog**: Approving authorities (Manager, Finance) possess permission to adjust line-item `approvedQty` during review using the dedicated "Approve with Changes" dialog (Decision U-04). Requisition `totalAmount` recalculates to reflect authorized quantities. *(Ambiguity Note: Whether quantity modification is strictly limited to reductions [$\le \text{requestedQty}$] or permits upward adjustment [$\gt \text{requestedQty}$] is an unresolved business rule subject to Product Owner clarification).*
5. **Rejection Resubmission**: Rejection terminates the immediate review sequence but permits the creator to modify quantities or line items and resubmit via `PATCH /requisitions/:id/resubmit`. Resubmission captures current catalog snapshot prices (`snapshotUnitPrice`), appends a resubmission event to the audit/timeline trail, and resets state to `Pending`, enforcing full re-approval starting at Level 1 (Manager).
6. **Administrative Governance Safety**: An Admin cannot deactivate their own user account. The system prohibits deactivation of the last remaining active Admin account.
7. **Soft Deletion & Referential Preservation**: Deleting items performs soft deletion (`isActive = false`) and requires a UI confirmation dialog (Decision U-08). Historical requisitions and audit logs preserve references to soft-deleted items without data loss. Hard physical deletion is prohibited for referenced items (HTTP 409 `ItemInUse`).
8. **Immediate Requisition Submission**: Requisition creation immediately submits into `Pending` status upon user confirmation (Decision U-01). No `Draft` state or Save Draft functionality exists. Cancellation applies strictly to the creator's own `Pending` requisitions.
9. **Automatic SKU Generation**: System automatically generates a unique SKU (`Item.sku`) upon catalog item creation (Decision U-07). Users cannot manually choose or enter the SKU.
10. **Goods Receipt Actual Quantities, Partial Delivery & Excess Authorization**: Physical goods receipt is performed by Inventory Clerk entering actual received quantities (`receivedQty`) against approved quantities and confirming receipt (Decision U-05). Partial delivery (`receivedQty < approvedQty`) is permitted directly (Decision U-05.1). Excess delivery (`receivedQty > approvedQty`) executes via a discrete four-step workflow (Decisions U-05.1, U-05.2): 1. Clerk submits an excess-delivery authorization request (`ExcessPendingManager`); 2. Manager authorizes the operational need (`ExcessPendingFinance`); 3. Finance Officer authorizes the additional financial commitment (`ExcessApproved`); 4. Clerk completes goods receipt after both approvals (`Received`), incrementing inventory. Excess quantities must not be accepted into inventory before required approvals are complete. *(Unresolved Decision: The fallback/handling state if either reviewer rejects the excess is an open decision requiring Product Owner approval).*
11. **Primary User Identification**: Full names serve as the primary human identifier in tables, requisitions, approval histories, and audit logs; email addresses serve as secondary information (Decision U-06).
12. **Dual Password Recovery Paths**: System supports self-service password recovery via email reset tokens (mocked via `ConsoleEmailService` in MVP) and Admin assistance fallback (Decision U-13). In accordance with NFR-009, temporary credentials and passwords must never be written to application logs or console output; the exact secure credential handoff mechanism for Admin assistance is an unresolved implementation detail.

---

## 7. Operational Workflows & State Machines

### 7.1 Requisition Lifecycle State Machine
```mermaid
stateDiagram-v2
    [*] --> Pending : Clerk creates & immediately submits
    Pending --> ManagerApproved : Manager approves (standard / with changes)
    Pending --> Rejected : Manager rejects (with reason)
    Pending --> Cancelled : Creator cancels own requisition
    ManagerApproved --> FinanceApproved : Finance approves (standard / with changes)
    ManagerApproved --> Rejected : Finance rejects (with reason)
    FinanceApproved --> Received : Clerk confirms receipt (receivedQty <= approvedQty)
    FinanceApproved --> ExcessPendingManager : 1. Clerk submits excess request (receivedQty > approvedQty)
    ExcessPendingManager --> ExcessPendingFinance : 2. Manager authorizes operational excess
    ExcessPendingFinance --> ExcessApproved : 3. Finance authorizes financial commitment
    ExcessApproved --> Received : 4. Clerk completes goods receipt (stock incremented)
    Rejected --> Pending : Creator edits & resubmits
    Received --> [*]
    Cancelled --> [*]
```

### 7.2 State Transition Matrix
| Source State | Destination State | Permitted Role | Preconditions & Actions |
|:-------------|:------------------|:---------------|:------------------------|
| *(None)* | `Pending` | Inventory Clerk | Immediate submission upon creation (no draft state); at least 1 item line; `snapshotUnitPrice` captured; `totalAmount` computed (Decision U-01). |
| `Pending` | `ManagerApproved` | Manager | Validates quantities; standard approval or via "Approve with Changes" dialog (Decision U-04); logs audit. *(Quantity modification bounds subject to PO clarification).* |
| `Pending` | `Rejected` | Manager | Non-empty `rejectionReason` supplied; creator notified; logs audit. |
| `Pending` | `Cancelled` | Inventory Clerk | Requisition creator only; cancels own `Pending` requisition (Decision U-01); terminal state; logs audit. |
| `ManagerApproved` | `FinanceApproved`| Finance Officer | Budget validation; standard approval or via "Approve with Changes" dialog (Decision U-04); logs audit. |
| `ManagerApproved` | `Rejected` | Finance Officer | Non-empty `rejectionReason` supplied; creator notified; logs audit. |
| `FinanceApproved` | `Received` | Inventory Clerk | Goods receipt confirmation: Clerk inputs actual quantities received (`receivedQty <= approvedQty`); executed in atomic transaction: increments item inventory by actual received quantity; evaluates stock alerts (Decisions U-05, U-05.1). |
| `FinanceApproved` | `ExcessPendingManager` | Inventory Clerk | Step 1: Clerk records delivered count exceeding approved quantity (`receivedQty > approvedQty`) and submits excess authorization request via `POST /requisitions/:id/excess-request`; inventory is NOT incremented (Decisions U-05.1, U-05.2). |
| `ExcessPendingManager` | `ExcessPendingFinance` | Manager | Step 2: Manager authorizes operational necessity for additional quantity via `PATCH /requisitions/:id/excess-authorize` (Decision U-05.2). |
| `ExcessPendingFinance` | `ExcessApproved` | Finance Officer | Step 3: Finance Officer authorizes additional financial commitment via `PATCH /requisitions/:id/excess-authorize` (Decision U-05.2). |
| `ExcessApproved` | `Received` | Inventory Clerk | Step 4: Inventory Clerk completes physical goods receipt via `PATCH /requisitions/:id/receive` after both approvals; executes atomic database transaction incrementing inventory stock by confirmed quantities (Decision U-05.2). |
| `Rejected` | `Pending` | Inventory Clerk | Creator edits quantities/items via `PATCH /requisitions/:id/resubmit`; fresh `snapshotUnitPrice` captured; restarts full approval cycle from Manager; logs audit. |

*Note on Unresolved Excess Rejection Behavior:* The workflow state and business handling if either Manager or Finance Officer rejects an excess-delivery request (e.g., whether the shipment is accepted partially for the approved quantity while returning excess to the supplier, or whether the requisition enters a specialized rejection state) is an unresolved business decision requiring Product Owner approval.

---

## 8. Verification & Acceptance Criteria
The release of IPMS Version 1.0 requires verification against the following acceptance gates:

1. **Functional Completeness**: All 27 mandatory functional requirements (FR‑001 through FR‑012, FR‑014, and FR‑017 through FR‑030) implemented, documented, and passing automated unit and integration tests.
2. **Performance Benchmark**: System passes `k6` benchmark suite (`perf-test.k6`) achieving median response latency ≤ 200 ms on a catalog dataset of 5,000 items under standard local containerized execution.
3. **Security Standards**: Clean vulnerability audit with zero high/critical vulnerabilities reported by `npm audit` or static code scanning; verification that credentials are cryptographically hashed and session cookies enforce `HttpOnly` and `SameSite`.
4. **Data Integrity & Concurrency**: Stress tests demonstrate that concurrent conflicting status updates and stock modifications maintain ACID guarantees without dirty reads or deadlocks.
5. **OpenAPI Documentation Quality**: Fully interactive Swagger documentation exposed at `/api/docs` with typed schemas matching all controller routes.

---

## 9. Appendices

### Appendix A – RBAC Permission Matrix

| API Endpoint | Admin | Inventory Clerk | Manager | Finance Officer | Governance Notes |
|:-------------|:-----:|:---------------:|:-------:|:---------------:|:-----------------|
| `POST /auth/register` | — | — | — | — | **Public access** (initial role: Clerk; captures full name) |
| `POST /auth/login` | — | — | — | — | **Public access** |
| `POST /auth/forgot-password` | — | — | — | — | **Public access**; requests self-service password reset link |
| `POST /auth/reset-password` | — | — | — | — | **Public access**; completes reset with token |
| `POST /auth/refresh` | ✔ | ✔ | ✔ | ✔ | Requires valid refresh token cookie |
| `POST /auth/logout` | ✔ | ✔ | ✔ | ✔ | Revokes active session |
| `GET /items` | ✔ | ✔ | ✔ | ✔ | Catalog browsing. `status=inactive\|all` query restricted to Admin; soft-deleted items hidden by default |
| `POST /items` | ✔ | — | — | — | Catalog authoring (system auto-generates unique SKU) |
| `PATCH /items/:id` | ✔ | — | — | — | Catalog modification |
| `PATCH /items/:id/adjust` | ✔ | ✔ | — | — | Stock count adjustment (requires reason) |
| `DELETE /items/:id` | ✔ | — | — | — | Soft-deletes item (`isActive=false`; confirmation dialog required) |
| `GET /dashboard` | ✔ | ✔ | ✔ | ✔ | Aggregated view metrics and role-specific activity feed |
| `GET /requisitions` | ✔ | ✔ | ✔ | ✔ | Shared screen with role presets; Clerk can view all requisitions & My Requisitions |
| `GET /requisitions/:id` | ✔ | ✔ | ✔ | ✔ | Detail view with embedded `timeline[]` and rejection history |
| `POST /requisitions` | — | ✔ | — | — | Immediate submission into `Pending` (no draft state) |
| `PATCH .../approve` | — | — | ✔ | ✔ | Manager: `Pending` only; Finance: `ManagerApproved` (standard or "Approve with Changes") |
| `PATCH .../reject` | — | — | ✔ | ✔ | Requires mandatory rejection reason |
| `PATCH .../cancel` | — | ✔ | — | — | Creator only; cancels own `Pending` requisition |
| `PATCH .../resubmit`| — | ✔ | — | — | Creator only; `Rejected` requisitions only |
| `POST .../excess-request` | — | ✔ | — | — | Clerk submits excess-delivery authorization request (Step 1) |
| `PATCH .../excess-authorize` | — | — | ✔ | ✔ | Manager authorizes operational need (Step 2); Finance authorizes financial commitment (Step 3) |
| `PATCH .../receive` | — | ✔ | — | — | Clerk completes receipt (standard <= approved, or Step 4 after dual excess approval) |
| `GET /notifications` | ✔ | ✔ | ✔ | ✔ | Scoped strictly to authenticated caller; returns deep-link context |
| `PATCH /notifications/:id/read` | ✔ | ✔ | ✔ | ✔ | Scoped strictly to notification owner |
| `PATCH /notifications/read` | ✔ | ✔ | ✔ | ✔ | Bulk mark-as-read (`{ ids, all }`) for own notifications |
| `GET /audit-logs` | ✔ | — | — | — | System compliance inspection |
| `GET /users` | ✔ | — | — | — | User directory management (displays full name) |
| `PATCH /users/:id/role` | ✔ | — | — | — | Privilege assignment |
| `PATCH /users/:id/deactivate` | ✔ | — | — | — | Self-deactivation blocked; last Admin protected |
| `PATCH /users/:id/reactivate` | ✔ | — | — | — | Reactivates dormant account |
| `PATCH /users/:id/reset-password` | ✔ | — | — | — | Initiates password reset (credentials never logged; handoff mechanism unresolved) |
| `POST /export/google-sheet` | ✔ | — | ✔ | ✔ | Management & fiscal oversight; Quick Export or Custom Export |
| `GET /export/csv` | ✔ | ✔ | ✔ | ✔ | Tabular catalog export for stock counts, planning, and audits |
| `GET /events` | ✔ | ✔ | ✔ | ✔ | Real-time push stream (max 3 connections) |
| `GET /api/docs` | — | — | — | — | **Public** in development environments |
| `GET /health` | — | — | — | — | **Public** system uptime probe |
| `POST /export/google-sheet` | ✔ | — | ✔ | ✔ | Management & fiscal oversight; Quick Export or Custom Export |
| `GET /export/csv` | ✔ | ✔ | ✔ | ✔ | Tabular catalog export for stock counts, planning, and audits |
| `GET /events` | ✔ | ✔ | ✔ | ✔ | Real-time push stream (max 3 connections) |
| `GET /api/docs` | — | — | — | — | **Public** in development environments |
| `GET /health` | — | — | — | — | **Public** system uptime probe |

### Appendix B – Requirements Traceability Reference
The bidirectional relationship connecting Business Objectives, System Requirements, Database Entities, and Verification Suites is documented in the Functional Requirements Register ([REF-03, `docs/specs/RequirementsRegister.md`](./RequirementsRegister.md)).

---

**Document Approval:**  
*Prepared by:* Senior Requirements Analyst & System Architect  
*Approved by:* Product Owner & Technical Lead  
*Status:* Official Baseline — Ready for Implementation Planning
