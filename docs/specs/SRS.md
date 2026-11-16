# Software Requirements Specification (SRS)

**Project:** Inventory & Procurement Management System (IPMS)  
**Document Version:** 1.5 – Official Baseline  
**Date:** 2026-11-16  
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
| 1.1 | 2026-11-14 | Approved | Enhanced export authorization: granted `GET /exports/csv` to all authenticated roles for physical counts/planning and `POST /exports/google-sheets` to Admin, Manager, and Finance Officer for management reporting. |
| 1.2 | 2026-11-15 | Approved | API & workflow alignment from UI/UX requirements review: embedded `timeline[]` in `GET /requisitions/:id` (G02), rejection history tracking (G03), bulk notification read `PATCH /notifications` (G04), and `status` filter on `GET /items` (G05). |
| 1.3 | 2026-11-15 | Approved | Consolidated approved UI/UX architecture decisions U-01 through U-13. |
| 1.4 | 2026-11-15 | Approved | Incorporated newly approved business decisions UD-01 through UD-04 and resolved remaining documentation inconsistencies: defined excess-delivery rejection handling allowing receipt of originally approved quantity (UD-01); specified Admin-assisted password recovery with single-use temporary password and mandatory change on next login (UD-02); prohibited reviewer quantity modification, establishing rejection with mandatory reason and creator submission of a new requisition, superseding U-04 and removing obsolete "Approve with Changes" dialog (UD-03); defined Google Sheets Quick Export across all filtered records and pagination (UD-04); formalized MVP single-event partial receipt limitation; expanded NFR-009 to protect reset tokens and secrets against log leakage with safe dev mailer; resolved excess-delivery audit event representation; cleaned duplicate rows in Appendix A; and synchronized cross-document references. |
| 1.5 | 2026-11-16 | Approved | Standardized all API endpoints to strict REST API conventions: replaced RPC verb paths with RESTful resource nouns, sub-resources, and property patches (stock adjustments via `POST /items/:id/adjustments`; requisition approvals via `POST /requisitions/:id/approvals`, rejections via `POST /requisitions/:id/rejections`, cancellations via `POST /requisitions/:id/cancellations`, excess requests via `POST /requisitions/:id/excess-requests`, excess authorizations via `POST /requisitions/:id/excess-authorizations`, goods receipt via `POST /requisitions/:id/receipts`; notification read status via `PATCH /notifications/:id` and bulk `PATCH /notifications`; user activation via `PATCH /users/:id` with `{ isActive }` and Admin password reset via `POST /users/:id/temporary-passwords`; exports via plural resources `POST /exports/google-sheets` and `GET /exports/csv`; auth session management via `POST /auth/sessions` and `DELETE /auth/sessions`, token refresh via `POST /auth/tokens/refresh`, and password resets via `POST /auth/password-reset-requests` and `POST /auth/password-resets`). |

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
| [REF-02] | Data Model & Business Rules | IPMS-DOC-DATAMODEL | v1.4 (2026-11) | [`docs/specs/DataModel.md`](./DataModel.md) |
| [REF-03] | Functional Requirements Register | IPMS-DOC-REQREG | v1.4 (2026-11) | [`docs/specs/RequirementsRegister.md`](./RequirementsRegister.md) |
| [REF-04] | Architectural Decision Log | IPMS-DOC-DECISIONS | v1.4 (2026-11) | [`docs/decisions/DecisionLog.md`](../decisions/DecisionLog.md) |
| [REF-05] | Requirements Audit & Review Log | IPMS-DOC-AUDIT | v1.3 (2026-11) | [`docs/archive/SRS_Draft_Review.md`](../archive/SRS_Draft_Review.md) |
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
- **SendGrid (Mock)**: Structured email notifications simulated via `MockMailService` implementing `EmailService`, providing a controlled in-memory dev mailbox without logging raw reset tokens or credentials to stdout (NFR-009).
- **Google Sheets API v4**: Read/write service-account integration for one-way inventory export.
- **GitHub Actions**: Continuous integration pipeline running linting, type checks, unit tests, and container builds.

### 2.2 Product Functions (Summary)
1. **User Authentication & RBAC**: Self-registration (capturing full name) with default clerk permissions, secure JWT session management, role guards, user deactivation, self-service email-based password recovery, and admin password reset (Decisions U-06, U-13, UD-02).
2. **Item Catalog**: Complete item CRUD with automatic unique SKU generation, soft deletion safeguards, individual SKU reorder thresholds, inventory tracking, and controlled manual stock adjustments (Decisions U-07, U-08).
3. **Purchase Requisition Workflow**: Multi-item requisition creation with immediate submission (no draft state), system-wide requisition visibility with "My Requisitions" filter, two-stage approval gate (Manager → Finance) with strict prohibition on reviewer quantity edits (reviewers must reject with mandatory reason if adjustments are required; creator submits a new requisition; Decision UD-03, superseding U-04), creator cancellation of own pending requisitions, and transactional goods receipt by Inventory Clerk with actual quantity recording (single-event partial receipt MVP limitation), and Manager/Finance excess quantity authorization with explicit excess rejection handling (Decisions U-01, U-03, U-05, U-05.1, U-05.2, UD-01, UD-03).
4. **Automated Alerting**: Threshold-crossing low-stock notifications delivered via in-app toast, persisted notification inbox with deep linking and highlighting, and logged emails (Decision U-10).
5. **Real-Time Operational Dashboard**: Aggregated stock metrics, low-stock counts, live requisition feeds, and role-specific activity feed driven by SSE push events (Decision U-11).
6. **Data Export**: Direct Quick Export across all filtered records and pagination (Decision UD-04) and configurable Custom Export to Google Sheets with instant CSV fallback on network or credential failures (Decision U-12).

### 2.3 User Classes & Characteristics
| Role | Responsibilities & Capabilities |
|------|---------------------------------|
| **Admin** | System administration, user lifecycle management (role reassignment, account deactivation/reactivation, password resets with single-use temporary credentials and mandatory change on next login), item catalog authoring/soft deletion, system audit log inspection, inventory data export (Google Sheets & CSV) for system audits and backups. Admin does not participate in workflow approvals. User's full name is displayed as the primary identifier across the system (Decisions U-06, UD-02). |
| **Inventory Clerk** | Physical inventory oversight, item catalog browsing, purchase requisition creation (immediate submission; no draft state) and cancellation of own pending requisitions, viewing all requisitions across the organization with a "My Requisitions" filter for own submissions, entering actual received quantities and confirming physical goods receipts (single-event receipt in MVP), manual inventory adjustments (stock counts/corrections), on-demand CSV inventory export for warehouse stocktaking and cycle counts (Decisions U-01, U-03, U-05, U-05.1). |
| **Manager** | Operational department review; first-level requisition review (approval or rejection with mandatory reason; reviewers cannot modify quantities [Decision UD-03, superseding U-04]), excess delivery operational authorization (first stage: approve or reject excess [Decision UD-01]), low-stock alert recipient, inventory data export (Google Sheets & CSV) for replenishment planning and operational reviews (Decisions U-05.2, UD-01, UD-03). |
| **Finance Officer** | Fiscal gatekeeper; second-level requisition review (fiscal approval or rejection with mandatory reason; reviewers cannot modify quantities [Decision UD-03, superseding U-04]), excess delivery financial authorization (second stage: approve or reject excess [Decision UD-01]), goods receipt oversight, inventory data export (Google Sheets & CSV) for asset valuation and accounting, low-stock alert recipient (Decisions U-05.2, UD-01, UD-03). |

### 2.4 Operating Environment
- **Client Platforms**: Modern evergreen browsers (Chromium-based, Firefox, Safari) across desktop and tablet/mobile viewports.
- **Runtime Environment**: Node.js 20+ LTS, NestJS 10, PostgreSQL 15+, Prisma ORM 5+.
- **Deployment Platform**: Dockerized container deployment with multi-stage builds (`Dockerfile` and `docker-compose.yml` for reproducible local and staging environments).

### 2.5 Design Constraints & Assumptions
- **Sprint Duration**: 4 calendar weeks for MVP baseline delivery.
- **Mock Notifications**: Production mail service accounts are avoided; mock mail service routes notifications to an in-memory development mailbox or restricted inspector API, strictly preventing authentication secrets and reset tokens from appearing in application logs or stdout (NFR-009).
- **Per-SKU Thresholds**: Reorder trigger thresholds are configured independently on each catalog item (Decision D-004).
- **Push Transport Mechanism**: Real-time updates utilize unidirectional SSE rather than WebSockets, reducing proxy and socket management overhead (Decision D-005, superseding legacy 5-second polling).
- **Two-Step Approval**: Two-tier hierarchical approval (Manager followed by Finance) is mandatory for procurement integrity (Decision D-002).
- **Physical Goods Receipt & Separation of Duties**: Physical goods receipt entry and confirmation is performed by the Inventory Clerk upon delivery arrival at the dock, recording actual delivered quantities (Decision U-05). Each requisition supports exactly one receipt event; partial deliveries increment inventory by actual units and transition the requisition to Received without tracking outstanding balances in the MVP (Decision U-05.1). Manager and Finance Officer provide managerial and fiscal approval during procurement and two-stage authorization for any excess quantities delivered prior to final inventory increment, with explicit rejection handling if excess is rejected (Decisions U-05.1, U-05.2, UD-01).

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
| **FR‑001** | User Registration, Identification & Authentication | 1. Registration endpoint accepts full name (`fullName`), valid unique email, and password (minimum 8 characters) via `POST /auth/register`.<br>2. Newly registered users are assigned the `Inventory Clerk` role by default. User's full name is the primary display identifier across all UI views and system records (Decision U-06).<br>3. Passwords must be hashed using `bcrypt` (work factor ≥ 10).<br>4. Authentication issues a short-lived signed JWT access token (15-minute expiry) and an HttpOnly, SameSite refresh token cookie (7-day lifespan) via `POST /auth/sessions` (alias `POST /auth/login`).<br>5. Self-service password recovery: Users can request a password-reset link via registered email (`POST /auth/password-reset-requests`, alias `POST /auth/forgot-password`); system dispatches a secure, time-bound reset token link (routed in development to a secure in-memory mock mailbox without emitting tokens or credentials to stdout per NFR-009); user resets credentials via `POST /auth/password-resets` (alias `POST /auth/reset-password`) (Decision U-13). |
| **FR‑002** | Role-Based Access Control (RBAC) | 1. Every API route enforces JWT validation and caller role verification via NestJS Guards.<br>2. Endpoint permissions strictly conform to the RBAC Permission Matrix (§9, Appendix A).<br>3. Unauthorized role access returns HTTP 403 Forbidden. |
| **FR‑003** | Item Catalog CRUD, SKU Generation & Deletion Safeguards | 1. Admin can create, read, update, and soft delete catalog items. Initial creation accepts `initialQuantity` ($\ge 0$). Item updates (`PATCH /items/:id`) allow modifying metadata (`name`, `description`, `location`, `unitPrice`, `reorderThreshold`, `isActive`) but strictly prohibit direct modification of `quantity`.<br>2. System automatically generates a unique SKU (`Item.sku`) upon item creation; users cannot manually choose or enter the SKU (Decision U-07).<br>3. Direct manual stock quantity changes must exclusively use `POST /items/:id/adjustments` (FR-025). Physical stock `quantity` is constrained to non-negative values (`quantity ≥ 0`).<br>4. Catalog deletion (`DELETE /items/:id`) executes soft deletion by setting `Item.isActive = false` and requires a confirmation dialog in the UI (Decision U-08). Soft-deleted items disappear from normal catalog listings (default `status=active`) while remaining accessible to Admin (`status=all` or `status=inactive`).<br>5. Historical requisitions (`RequisitionItem`) and audit logs preserve references to soft-deleted items without data loss (Decision U-08). Hard physical deletion is prohibited for referenced items (HTTP 409 `ItemInUse`). |
| **FR‑004** | Purchase Requisition Creation | 1. Clerk can create and submit a requisition with one or more catalog line items via `POST /requisitions`.<br>2. Creating a requisition immediately submits it with `Pending` status upon user confirmation (Decision U-01).<br>3. There is no `Draft` state or Save Draft functionality in the requisition lifecycle (Decision U-01).<br>4. Line-item `approvedQty` initializes to `requestedQty`.<br>5. Requisition `totalAmount` is calculated as $\sum(\text{requestedQty} \times \text{snapshotUnitPrice})$ at creation time.<br>6. `unitPrice` is snapshotted into `RequisitionItem.snapshotUnitPrice` at creation; future catalog price changes do not modify historical requisition values. |
| **FR‑005** | First-Level Manager Approval | 1. Manager can approve (`ManagerApproved`) via `POST /requisitions/:id/approvals` or reject (`Rejected`) via `POST /requisitions/:id/rejections` pending requisitions.<br>2. Managers cannot modify requisition quantities (Decision UD-03, superseding U-04). If a Manager believes quantities require modification, the Manager must reject the requisition and supply a non-empty `rejectionReason`.<br>3. On rejection, the requisition transitions to `Rejected` (terminal state), preserving original requested quantities, reviewer identity, timestamp, and rejection reason for audit history (Decision UD-03).<br>4. The creator receives an in-app rejection notification with the reason and must submit a new requisition with corrected quantities via `POST /requisitions` (Decision UD-03). |
| **FR‑006** | Second-Level Finance Approval | 1. Finance Officer can review `ManagerApproved` requisitions to approve (`FinanceApproved`) via `POST /requisitions/:id/approvals` or reject (`Rejected`) via `POST /requisitions/:id/rejections`.<br>2. Finance Officers cannot modify requisition quantities (Decision UD-03, superseding U-04). If a Finance Officer believes quantities require modification, the reviewer must reject the requisition with a mandatory non-empty `rejectionReason`.<br>3. On rejection, the requisition transitions to `Rejected` (terminal state), preserving original line items, requested quantities, reviewer identity, timestamp, and rejection explanation for audit history. The creator is notified and must submit a new requisition with corrected quantities (Decision UD-03). |
| **FR‑007** | Goods Receipt, Quantity Verification & Atomic Stock Update | 1. Inventory Clerk records physical goods receipt against `FinanceApproved` requisitions via `POST /requisitions/:id/receipts` (Decision U-05).<br>2. Goods receipt interface displays approved quantities; Clerk enters the actual quantities received (`receivedQty`) and must confirm the receipt before it is recorded (Decision U-05).<br>3. Partial delivery is permitted: Clerk can record fewer units than approved (`receivedQty < approvedQty`), and inventory increments by actual received quantities (Decision U-05.1). Full delivery (`receivedQty == approvedQty`) is recorded and increments stock accordingly. **MVP Limitation**: Each requisition supports exactly one receipt event. If fewer units than approved are delivered, only the actual received quantity is added to inventory, and the requisition transitions to `Received`. The remaining undelivered quantity is not tracked as outstanding, and additional deliveries against the same requisition are not supported in the MVP.<br>4. Excess delivery (`receivedQty > approvedQty`) executes via a distinct four-step workflow (Decisions U-05.1, U-05.2, UD-01):<br>&nbsp;&nbsp;&nbsp;&nbsp;a. Step 1: Inventory Clerk records delivered counts and submits an excess-delivery authorization request via `POST /requisitions/:id/excess-requests` (status transitions to `ExcessPendingManager`). Stock is NOT incremented.<br>&nbsp;&nbsp;&nbsp;&nbsp;b. Step 2: Manager authorizes the operational need for the excess quantity via `POST /requisitions/:id/excess-authorizations` with `action: 'approve'` (status transitions to `ExcessPendingFinance`). If Manager rejects the excess (`action: 'reject'`), status transitions to `ExcessRejected` (Decision UD-01).<br>&nbsp;&nbsp;&nbsp;&nbsp;c. Step 3: Finance Officer authorizes the additional financial commitment via `POST /requisitions/:id/excess-authorizations` with `action: 'approve'` (status transitions to `ExcessApproved`). If Finance rejects the excess (`action: 'reject'`), status transitions to `ExcessRejected` (Decision UD-01).<br>&nbsp;&nbsp;&nbsp;&nbsp;d. Step 4: Goods receipt completion: After dual approval (`ExcessApproved`), Clerk completes goods receipt via `POST /requisitions/:id/receipts` (status transitions to `Received`), executing atomic inventory increment for confirmed quantities including excess. If the excess request was rejected by either reviewer (`ExcessRejected`), only the excess quantity is rejected; the originally approved quantity remains eligible for receipt, and Clerk completes goods receipt for up to the originally approved quantity via `POST /requisitions/:id/receipts` (status transitions to `Received`), with excess units refused at dock. Rejection details (reviewer, timestamp, reason) are recorded in audit history (`EXCESS_REJECTED`) (Decision UD-01).<br>&nbsp;&nbsp;&nbsp;&nbsp;e. Excess quantities must not be accepted into inventory before both approvals are complete.<br>5. Upon final receipt confirmation, status updates to `Received` and each line item increases `Item.quantity` by confirmed `receivedQty` within a single atomic database transaction utilizing row-level locks (`SELECT ... FOR UPDATE`).<br>6. Low-stock alert evaluations are re-triggered for all modified SKUs. |
| **FR‑008** | Threshold-Crossing Low-Stock Alerts | 1. Alert triggers exclusively when `Item.quantity` transitions from $\ge \text{reorderThreshold}$ to $< \text{reorderThreshold}$.<br>2. Alert fires once per downward threshold boundary crossing; subsequent modifications while remaining below threshold suppress duplicate alerts.<br>3. Evaluated across all stock-altering operations (receipts, manual adjustments, item catalog threshold updates).<br>4. Dispatches an in-app `LowStockAlert` notification to Managers and Finance Officers and emits a formatted log event. |
| **FR‑009** | Server-Sent Events (SSE) Real-Time Stream | 1. Authenticated clients connect via `GET /events` using HttpOnly cookie authentication.<br>2. Emits structured, typed JSON payloads (§4.4) within ≤ 1 second of database commit.<br>3. Transmits periodic heartbeat comments (`: heartbeat\n\n`) every 30 seconds to maintain persistent connections across proxies.<br>4. Client reconnect directive is established at 5000 ms (`retry: 5000`). |
| **FR‑010** | Aggregated Dashboard Service | 1. `GET /dashboard` delivers real-time aggregated metrics: `{ totalItems, lowStockCount, recentRequisitions[] }` (latest 5 records) and role-specific activity feed items (`recentActivities[]`) tailored to the caller's role (Clerk: inventory changes, requisitions, goods receipts; Manager: submissions, Manager approvals; Finance: Finance approvals, requisition updates; Admin: all activities) (Decision U-11).<br>2. Metrics compute on demand without stale cache artifacts.<br>3. State changes broadcast a `dashboard.updated` SSE event to connected clients for instant UI refresh. |
| **FR‑011** | Google Sheets Inventory Export | 1. Authorized management and oversight roles (**Admin, Manager, Finance Officer**) can execute `POST /exports/google-sheets` to create or update an external spreadsheet containing current inventory data.<br>2. Supports two export modes (Decisions U-12, UD-04):<br>&nbsp;&nbsp;&nbsp;&nbsp;a. **Quick Export**: Exports all records matching currently applied filters (or all records the user is authorized to access if no filters are applied) across all pagination, preserving current sorting order, and using predefined standard columns (to be defined in the SAD) without prompting for configuration (Decisions U-12, UD-04).<br>&nbsp;&nbsp;&nbsp;&nbsp;b. **Custom Export**: Retained as a separate capability triggered via a configuration dialog allowing users to select specific columns and choose export scope (active filters vs. all records) (Decision U-12).<br>3. Uses Google service account with `https://www.googleapis.com/auth/spreadsheets` scope (one-way write from IPMS to Sheet).<br>4. Success returns HTTP 200 with `{ sheetUrl: string }`.<br>5. Third-party failures (credential error, quota cap, network timeout) respond with HTTP 502 Bad Gateway and direct client to the CSV fallback. |
| **FR‑012** | OpenAPI Documentation | 1. Swagger UI is served at `/api/docs`, providing automated schemas, parameters, and authentication definitions derived from NestJS DTOs and decorators. |
| **FR‑014** | Immutable System Audit Logging | 1. System records immutable entries for all entity mutations (`CREATE`, `UPDATE`, `DELETE`, `APPROVE`, `REJECT`, `RECEIVE`, `CANCEL`, `ADJUST`).<br>2. Records capture `entity`, `entityId`, `action`, `performedBy` (storing user ID with full name as primary display identifier, Decision U-06), `timestamp`, and JSON `details` (before/after delta and `rejectionReason`).<br>3. Soft-deleted items retain full audit history and referential traceability (Decision U-08). |
| **FR‑015** | Simple Moving Average (SMA) Forecasting *(Optional)* | 1. Background service calculates 4-week historical consumption moving average per SKU.<br>2. Displays recommended replenishment orders on dashboard analytics view. |
| **FR‑016** | Interactive Data Visualizations *(Good-to-have)* | 1. Chart.js visual components illustrating monthly procurement expenditure, stock turnover lines, and low-stock SKU distributions. |
| **FR‑017** | Notification History, Navigation & Read Status | 1. User notifications persist in `Notification` store (`LowStockAlert`, `RequisitionUpdate`, `ApprovalResult`).<br>2. Notifications store destination context (`entityType` and `entityId`) to identify the target record and destination screen route (Decision U-10). The relevant section or entity to highlight upon navigation is derived deterministically from existing notification attributes without introducing redundant schema fields: `entityType` determines the route (`/requisitions/:id` or `/items`), `entityId` identifies the record instance, and `type` (`ApprovalResult`, `LowStockAlert`, `RequisitionUpdate`) together with record state indicates the specific section or drawer to focus and highlight.<br>3. Clicking a notification navigates the user directly to the target record/screen and highlights the relevant section/information (Decision U-10).<br>4. Provides paginated inbox filtering by read/unread status with bulk (`PATCH /notifications` with `{ read: true, ids, all }`) or single (`PATCH /notifications/:id` with `{ read: true }`) mark-as-read capabilities restricted to notification owners. |
| **FR‑018** | Authentication Brute-Force Rate Limiting | 1. Login endpoint (`POST /auth/sessions` or `POST /auth/login`) permits a maximum of 5 attempts per originating IP within a rolling 60-second window.<br>2. Subsequent requests within the window receive HTTP 429 Too Many Requests. |
| **FR‑019** | CSRF Double-Submit Protection | 1. Successful authentication sets a client-accessible, non-HttpOnly cookie (`csrfToken`) and echoes the token in login response data.<br>2. State-changing requests (`POST`, `PATCH`, `DELETE`) require the token value echoed in the `X-CSRF-Token` header.<br>3. Mismatched or absent header returns HTTP 403 Forbidden. |
| **FR‑020** | Rigorous Payload Validation & Sanitization | 1. Inbound request bodies validate against strict class-validator DTOs with unexpected properties stripped (`whitelist: true`, `forbidNonWhitelisted: true`).<br>2. Invalid payloads return HTTP 400 Bad Request with field-level diagnostic messages; input strings are sanitized against injection attacks. |
| **FR‑021** | List Pagination, Filtering & Predefined Views | 1. List endpoints (`GET /items`, `GET /requisitions`, `GET /notifications`, `GET /users`, `GET /audit-logs`) support standardized 1-indexed pagination query parameters: `page` (integer $\ge 1$, default 1) and `limit` (integer $\ge 1$, default 50, max 100).<br>2. List endpoints support domain filters: `GET /items` supports `search` (case-insensitive SKU/name match), `location`, `stockStatus` (`low` [$\text{quantity} < \text{reorderThreshold}$] \| `normal` [$\text{quantity} \ge \text{reorderThreshold}$]), and `status` (`active` \| `inactive` \| `all`, Admin-only); `GET /requisitions` supports query filtering by `status` (enum) and `creatorId` (UUID), and role-specific presets.<br>3. Requisition List provides role-specific predefined views within a shared screen (Decision U-09):<br>&nbsp;&nbsp;&nbsp;&nbsp;a. **Inventory Clerk**: `All Requisitions`, `My Requisitions` (`creatorId = currentUserId`) (Decisions U-03, U-09).<br>&nbsp;&nbsp;&nbsp;&nbsp;b. **Manager**: `Pending Manager Approval` (`status = Pending`), `Reviewed Requisitions`, `All Requisitions`.<br>&nbsp;&nbsp;&nbsp;&nbsp;c. **Finance Officer**: `Pending Finance Approval` (`status = ManagerApproved`), `Reviewed Requisitions`, `All Requisitions`.<br>&nbsp;&nbsp;&nbsp;&nbsp;d. **Admin**: `All Requisitions`.<br>4. Output payload wraps items in standard pagination envelope: `{ data: [...], pagination: { page: number, limit: number, totalCount: number, totalPages: number } }`. |
| **FR‑022** | SSE Connection Quotas | 1. Concurrent active `/events` connections are capped at 3 per authenticated user.<br>2. Connection attempts exceeding threshold respond with HTTP 429 Too Many Requests. |
| **FR‑023** | User Lifecycle & Governance API | 1. Admin can list users (`GET /users`), update assigned roles (`PATCH /users/:id` with `{ role }` or `PATCH /users/:id/role`), and toggle activation (`PATCH /users/:id` with `{ isActive: false }` or `{ isActive: true }`).<br>2. User deactivation immediately revokes active refresh tokens; subsequent requests from deactivated accounts return HTTP 403 `AccountDeactivated`.<br>3. Self-deactivation by an Admin is blocked.<br>4. Deactivation of the final remaining active Admin returns HTTP 409 `LastAdminAccount`. |
| **FR‑024** | Requisition Cancellation | 1. Requisition creator can cancel own `Pending` requisition via `POST /requisitions/:id/cancellations` (or `PATCH /requisitions/:id` with `{ status: 'Cancelled' }`) (Decision U-01).<br>2. Cancellation applies strictly to creator's own `Pending` requisitions (no draft state exists, Decision U-01).<br>3. Status updates to `Cancelled` (terminal state), generating an audit log and notifying relevant Managers and Finance personnel. |
| **FR‑025** | Controlled Inventory Stock Adjustments | 1. Admin and Clerk can execute manual physical stock corrections via `POST /items/:id/adjustments` supplying signed integer `adjustment` and non-empty `adjustmentReason`.<br>2. Requests resulting in negative inventory (`quantity + adjustment < 0`) are rejected with HTTP 422 `InsufficientStock`.<br>3. Operation executes under transactional lock, records audit trail, and evaluates threshold alert rules. |
| **FR‑026** | Standalone CSV Export & Fallback | 1. **All authenticated roles** (Admin, Inventory Clerk, Manager, Finance Officer) can trigger on-demand CSV stream export via `GET /exports/csv` for warehouse cycle counts, inventory planning, and audits.<br>2. Automatically offered as a direct download alternative if Google Sheets synchronization fails. |
| **FR‑027** | Refresh Token Rotation & Session Maintenance | 1. `POST /auth/tokens/refresh` (alias `POST /auth/refresh`) verifies existing refresh token cookie, invalidates the used token, and issues a fresh access token and rotated refresh token.<br>2. Stored refresh token hashes support strict one-time use detection. |
| **FR‑028** | Secure Session Logout | 1. `DELETE /auth/sessions` (alias `POST /auth/logout`) invalidates the active refresh token record in database and clears authentication cookies with expired headers. |
| **FR‑029** | Password Recovery (Self-Service & Admin-Assisted) | 1. System provides two complementary password recovery mechanisms (Decisions U-13, UD-02):<br>&nbsp;&nbsp;&nbsp;&nbsp;a. **Self-Service**: Users request a reset link via `POST /auth/password-reset-requests` (alias `POST /auth/forgot-password`) using registered email, receive a secure token link (routed in development to a secure in-memory dev mailbox without emitting tokens to console/logs per NFR-009), and set new password via `POST /auth/password-resets` (alias `POST /auth/reset-password`).<br>&nbsp;&nbsp;&nbsp;&nbsp;b. **Admin Assistance**: Admin can initiate a temporary password reset for staff via `POST /users/:id/temporary-passwords` (alias `PATCH /users/:id/reset-password`) after verifying staff identity through internal company procedures (Decision UD-02). System generates a single-use temporary password expiring after **24 hours**. Admin communicates it through an appropriate internal channel (registered email account is not required; Admin cannot view user's existing or permanent password). Staff member must create a new password at next login before accessing the application (`mustChangePassword: true`). Temporary credentials must never appear in application logs or audit logs (NFR-009); the reset action is recorded in audit history without exposing credentials (Decision UD-02). |
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
  - *Requisition Rejection Explanation*: Dedicated rejection modal requiring a non-empty explanation before rejection can be confirmed; reviewers cannot modify quantities during approval (Decisions UD-03, superseding U-04).
  - *Goods Receipt Confirmation*: Dedicated entry screen displaying approved quantities where Clerks input actual delivered counts and confirm receipt (Decision U-05).
  - *Google Sheets Custom Export*: Configuration modal allowing column selection and scope toggling (all items vs. active filter) (Decision U-12).

### 4.2 Software Interfaces
- **Database Engine**: PostgreSQL 15+ connected via Prisma client connection pooling.
- **Push Notification Stream**: HTTP/1.1 or HTTP/2 newline-delimited Server-Sent Events (`text/event-stream`).
- **Google Sheets API**: Google APIs Client Library using OAuth2 Service Account JSON credentials for scoped spreadsheet updates.
- **Mailer Adapter**: `MockMailService` abstraction conforming to standard mail dispatch interface contracts, routing dev emails to a secure in-memory mailbox without emitting secrets to logs (NFR-009).

### 4.3 REST API Interface Directory
All API routes strictly adhere to RESTful resource-oriented conventions, utilizing resource nouns and HTTP methods for operations.

| HTTP Method | Route | Description | Authorization |
|:-----------:|:------|:------------|:--------------|
| `POST` | `/auth/register` | Register new user account (accepts `fullName`, `email`, `password`; defaults to Clerk role) | Public |
| `POST` | `/auth/sessions` | Authenticate credentials; sets JWT cookies (alias: `POST /auth/login`) | Public |
| `DELETE` | `/auth/sessions` | Revoke active session and purge auth cookies (alias: `POST /auth/logout`) | Authenticated |
| `POST` | `/auth/tokens/refresh` | Rotate refresh token and obtain fresh access token (alias: `POST /auth/refresh`) | Authenticated |
| `POST` | `/auth/password-reset-requests` | Initiate self-service password reset; dispatches email token (alias: `POST /auth/forgot-password`) | Public (Decision U-13) |
| `POST` | `/auth/password-resets` | Complete password reset using token and new password (alias: `POST /auth/reset-password`) | Public (Decision U-13) |
| `GET` | `/items` | Paginated catalog listing (`page`, `limit`, `search`, `location`, `stockStatus`, `status=active\|inactive\|all`) | All Authenticated (Inactive/All: Admin only) |
| `POST` | `/items` | Create new catalog item (system auto-generates unique SKU) | Admin (Decision U-07) |
| `GET` | `/items/:id` | Retrieve single catalog item details | All Authenticated |
| `PATCH` | `/items/:id` | Update SKU specifications or reorder thresholds (stock quantity cannot be altered via this endpoint) | Admin |
| `DELETE` | `/items/:id` | Soft-delete catalog item (`isActive = false`; confirmation required) | Admin (Decision U-08) |
| `POST` | `/items/:id/adjustments` | Record manual physical count adjustment with signed integer and mandatory reason (FR-025) | Admin, Inventory Clerk |
| `GET` | `/dashboard` | Fetch aggregated dashboard metrics and role-specific activity feed | All Authenticated (Decision U-11) |
| `POST` | `/requisitions` | Submit purchase requisition (immediately enters `Pending` status; no draft state) | Inventory Clerk (Decision U-01) |
| `GET` | `/requisitions` | Query requisitions (`page`, `limit`, `status`, `creatorId`, role-specific presets) | All Authenticated (Decisions U-03, U-09) |
| `GET` | `/requisitions/:id` | Inspect requisition details, snapshotted lines, rejection history, and `timeline[]` | All Authenticated |
| `POST` | `/requisitions/:id/approvals` | Submit managerial or financial approval (reviewers cannot modify quantities, Decision UD-03) | Manager, Finance Officer (Decision UD-03, superseding U-04) |
| `POST` | `/requisitions/:id/rejections` | Reject requisition with required explanation; creator submits new requisition (Decision UD-03) | Manager, Finance Officer |
| `POST` | `/requisitions/:id/cancellations` | Cancel own Pending requisition (`PATCH /requisitions/:id` with `{ status: 'Cancelled' }`) | Inventory Clerk (Creator only) (Decision U-01) |
| `POST` | `/requisitions/:id/excess-requests` | Submit excess-delivery authorization request (Step 1 of excess workflow) | Inventory Clerk (Decisions U-05.1, U-05.2) |
| `POST` | `/requisitions/:id/excess-authorizations` | Authorize or reject excess delivery: Manager operational need (Step 2) or Finance financial commitment (Step 3); rejection transitions to `ExcessRejected` (Decisions U-05.1, U-05.2, UD-01) | Manager, Finance Officer (Decisions U-05.1, U-05.2, UD-01) |
| `POST` | `/requisitions/:id/receipts` | Record actual received quantities and complete goods receipt (valid for standard receipt <= approved, Step 4 after dual excess approval, or approved quantity after excess rejection; single receipt event per requisition) | Inventory Clerk (Decisions U-05, U-05.1, U-05.2, UD-01) |
| `GET` | `/notifications` | List user notification history (`page`, `limit`, `read`; returns `entityType`, `entityId`) | All Authenticated (Own items) (Decision U-10) |
| `PATCH` | `/notifications/:id` | Update individual notification status (e.g. `{ read: true }`) | All Authenticated (Owner only) |
| `PATCH` | `/notifications` | Bulk update notification status (`{ read: true, ids?: string[], all?: boolean }`) | All Authenticated (Owner only) |
| `GET` | `/audit-logs` | Retrieve chronological audit trail entries (`page`, `limit`, `action`, `entityType`, `startDate`, `endDate`) | Admin |
| `GET` | `/users` | Paginated user registry list (`page`, `limit`, `role`, `status`) | Admin |
| `PATCH` | `/users/:id` | Update user attributes (`role`, or `{ isActive: false }` for deactivation, `{ isActive: true }` for reactivation) | Admin |
| `PATCH` | `/users/:id/role` | Modify assigned user security role (or via `PATCH /users/:id`) | Admin |
| `POST` | `/users/:id/temporary-passwords` | Initiate administrative password reset for user (single-use temporary password; must change at next login; credentials never logged, Decision UD-02) | Admin (Decisions U-13, UD-02) |
| `POST` | `/exports/google-sheets` | Generate/update Google Sheet inventory snapshot (Quick Export across all filtered records/pages [Decision UD-04] or Custom Export with modal [Decision U-12]) | Admin, Manager, Finance Officer (Decisions U-12, UD-04) |
| `GET` | `/exports/csv` | Download direct CSV inventory report | All Authenticated |
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
      "rejectionReason": null
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
      "rejectionReason": "Exceeds monthly department allocation"
    }
  ],
  "createdAt": "2026-11-15T08:00:00Z",
  "updatedAt": "2026-11-15T09:30:00Z"
}
```

*Field Specifications:*
- `creator.name`, `actor.name`, `rejectedBy.name`: Full name displayed as the primary human identifier across all workflow audit checkpoints (Decision U-06).
- `items.receivedQty`: Integer indicating actual received count confirmed at goods receipt (`null` prior to receipt; supports partial delivery count or authorized excess delivery count; single receipt event per requisition in MVP) (Decisions U-05, U-05.1).
- `currentRejectionReason`: Non-null string strictly when `status === 'Rejected'`; `null` otherwise.
- `timeline.eventType`: Enum with values `SUBMITTED`, `MANAGER_APPROVED`, `MANAGER_REJECTED`, `FINANCE_APPROVED`, `FINANCE_REJECTED`, `EXCESS_REQUESTED`, `EXCESS_MANAGER_APPROVED`, `EXCESS_FINANCE_APPROVED`, `EXCESS_REJECTED`, `RECEIVED`, `CANCELLED`.
- `rejectionHistory`: Array of rejection audit records recorded for the requisition, tracking `stage`, `rejectedBy`, `rejectedAt`, and `rejectionReason`.
- **Audit Event Representation**: Lifecycle and excess-delivery events correspond directly to immutable `AuditLog` records where `AuditLog.action` is one of `CREATE`, `UPDATE`, `DELETE`, `APPROVE`, `REJECT`, `RECEIVE`, `CANCEL`, `ADJUST`, `EXCESS_REQUEST`, `EXCESS_APPROVE`, `EXCESS_REJECT`, `RESET_PASSWORD`, and the `details` JSON payload records the structured `eventType` (`EXCESS_REQUESTED`, `EXCESS_MANAGER_APPROVED`, `EXCESS_FINANCE_APPROVED`, `EXCESS_REJECTED`), actor metadata, line-item excess counts, and non-empty `rejectionReason` (mandatory when rejected). The requisition `timeline[]` projection in `GET /requisitions/:id` directly maps from these audit log records. *(Note: Reviewer quantity modifications are strictly prohibited per Decision UD-03).*

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
| **NFR‑009** | **Logging & Privacy** | Structured JSON logging to stdout with correlation IDs. Sensitive fields (passwords, temporary credentials, password reset tokens, auth cookies, JWT tokens, PII) are strictly masked and never emitted to application logs, console output, or unrestricted interfaces. In development environments, mock email dispatch must route through a secure in-memory development mailbox or restricted inspector API rather than printing raw reset links or tokens to stdout. | Automated log scanner test asserting absence of raw credential strings and tokens across test execution runs; code review of mock mailer implementation. |
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
4. **Strict Prohibition on Reviewer Quantity Modification**: Approving authorities (Manager, Finance Officer) cannot modify requisition quantities (Decision UD-03, superseding U-04). If a reviewer believes quantities require changes, the reviewer must reject the requisition and supply a non-empty `rejectionReason`. The obsolete "Approve with Changes" dialog is removed.
5. **Rejection & New Requisition Submission**: Rejection terminates the review sequence and transitions the requisition to `Rejected` (terminal state), preserving original requested quantities, reviewer identity, timestamp, and rejection reason for compliance audits (Decision UD-03). The requester receives the rejection explanation and must submit a new requisition with corrected quantities via `POST /requisitions`.
6. **Administrative Governance Safety**: An Admin cannot deactivate their own user account. The system prohibits deactivation of the last remaining active Admin account.
7. **Soft Deletion & Referential Preservation**: Deleting items performs soft deletion (`isActive = false`) and requires a UI confirmation dialog (Decision U-08). Historical requisitions and audit logs preserve references to soft-deleted items without data loss. Hard physical deletion is prohibited for referenced items (HTTP 409 `ItemInUse`).
8. **Immediate Requisition Submission**: Requisition creation immediately submits into `Pending` status upon user confirmation (Decision U-01). No `Draft` state or Save Draft functionality exists. Cancellation applies strictly to the creator's own `Pending` requisitions.
9. **Automatic SKU Generation**: System automatically generates a unique SKU (`Item.sku`) upon catalog item creation (Decision U-07). Users cannot manually choose or enter the SKU.
10. **Goods Receipt Actual Quantities, Single-Event Partial Delivery & Excess Authorization**: Physical goods receipt is performed by Inventory Clerk entering actual received quantities (`receivedQty`) against approved quantities and confirming receipt (Decision U-05).
    - **Single-Event Partial Delivery (MVP Limitation)**: Each requisition supports exactly one receipt event. If fewer units than approved are delivered (`receivedQty < approvedQty`), Clerk records actual quantity received, inventory increments by actual units, and requisition transitions to `Received` (Decision U-05.1). The remaining undelivered quantity is not tracked as outstanding, and additional deliveries against the same requisition are not supported in the MVP.
    - **Excess Delivery Workflow & Rejection Handling**: Excess delivery (`receivedQty > approvedQty`) executes via a discrete four-step workflow (Decisions U-05.1, U-05.2, UD-01):
      1. Clerk submits an excess-delivery authorization request via `POST /requisitions/:id/excess-requests` (`ExcessPendingManager`). Stock is not incremented.
      2. Manager authorizes operational need via `POST /requisitions/:id/excess-authorizations` (`ExcessPendingFinance`) or rejects excess (`ExcessRejected`, Decision UD-01).
      3. Finance Officer authorizes financial commitment via `POST /requisitions/:id/excess-authorizations` (`ExcessApproved`) or rejects excess (`ExcessRejected`, Decision UD-01).
      4. Receipt completion: On dual approval (`ExcessApproved`), Clerk completes receipt via `POST /requisitions/:id/receipts` (`Received`), atomically incrementing inventory by confirmed quantities including excess. If excess is rejected by either reviewer (`ExcessRejected`), only the excess quantity is rejected; the originally approved quantity remains eligible for receipt. Clerk completes receipt for up to the approved quantity via `POST /requisitions/:id/receipts` (`Received`), and excess units are refused at the loading dock. Only accepted units enter inventory (Decision UD-01). Rejection details (reviewer, timestamp, reason) are permanently logged in audit history (`EXCESS_REJECTED`).
11. **Primary User Identification**: Full names serve as the primary human identifier in tables, requisitions, approval histories, and audit logs; email addresses serve as secondary information (Decision U-06).
12. **Dual Password Recovery Paths**: System supports self-service password recovery via email reset tokens (using secure mock mailer in development without emitting tokens to stdout per NFR-009) and Admin assistance fallback (Decisions U-13, UD-02). For Admin assistance, Admin initiates a reset after verifying staff identity through internal company procedures; system generates a single-use temporary password expiring in 24 hours; Admin communicates it through an appropriate internal channel (registered email not required; Admin cannot view user's existing or permanent password); staff member must create a new password at next login before accessing the application (`mustChangePassword: true`); temporary credentials never appear in application or audit logs; reset action is recorded in audit history without exposing credentials (Decision UD-02).

---

## 7. Operational Workflows & State Machines

### 7.1 Requisition Lifecycle State Machine
```mermaid
stateDiagram-v2
    [*] --> Pending : Clerk creates & immediately submits
    Pending --> ManagerApproved : Manager approves
    Pending --> Rejected : Manager rejects (with mandatory reason)
    Pending --> Cancelled : Creator cancels own requisition
    ManagerApproved --> FinanceApproved : Finance approves
    ManagerApproved --> Rejected : Finance rejects (with mandatory reason)
    FinanceApproved --> Received : Clerk confirms receipt (receivedQty <= approvedQty)
    FinanceApproved --> ExcessPendingManager : 1. Clerk submits excess request (receivedQty > approvedQty)
    ExcessPendingManager --> ExcessPendingFinance : 2. Manager authorizes operational excess
    ExcessPendingManager --> ExcessRejected : Manager rejects excess authorization (UD-01)
    ExcessPendingFinance --> ExcessApproved : 3. Finance authorizes financial commitment
    ExcessPendingFinance --> ExcessRejected : Finance rejects excess authorization (UD-01)
    ExcessApproved --> Received : 4. Clerk completes goods receipt (stock incremented with authorized excess)
    ExcessRejected --> Received : Clerk completes goods receipt for approved quantity (excess refused at dock)
    Rejected --> [*] : Preserved as immutable audit record; creator submits new requisition (UD-03)
    Received --> [*]
    Cancelled --> [*]
```

### 7.2 State Transition Matrix
| Source State | Destination State | Permitted Role | Preconditions & Actions |
|:-------------|:------------------|:---------------|:------------------------|
| *(None)* | `Pending` | Inventory Clerk | Immediate submission upon creation (no draft state); at least 1 item line; `snapshotUnitPrice` captured; `totalAmount` computed (Decision U-01). |
| `Pending` | `ManagerApproved` | Manager | Validates requisition; standard approval via `POST /requisitions/:id/approvals`; reviewers cannot modify quantities (Decision UD-03, superseding U-04); logs audit. |
| `Pending` | `Rejected` | Manager | Non-empty `rejectionReason` supplied via `POST /requisitions/:id/rejections`; creator notified; original requisition preserved for audit history; creator submits new requisition with corrected quantities via `POST /requisitions` (Decision UD-03). |
| `Pending` | `Cancelled` | Inventory Clerk | Requisition creator only; cancels own `Pending` requisition via `POST /requisitions/:id/cancellations` (or `PATCH /requisitions/:id` with `{ status: 'Cancelled' }`) (Decision U-01); terminal state; logs audit. |
| `ManagerApproved` | `FinanceApproved`| Finance Officer | Budget validation; fiscal approval via `POST /requisitions/:id/approvals`; reviewers cannot modify quantities (Decision UD-03, superseding U-04); logs audit. |
| `ManagerApproved` | `Rejected` | Finance Officer | Non-empty `rejectionReason` supplied via `POST /requisitions/:id/rejections`; creator notified; original requisition preserved for audit; creator submits new requisition with corrected quantities (Decision UD-03). |
| `FinanceApproved` | `Received` | Inventory Clerk | Goods receipt confirmation via `POST /requisitions/:id/receipts`: Clerk inputs actual quantities received (`receivedQty <= approvedQty`); executed in atomic transaction: increments item inventory by actual received quantity; evaluates stock alerts (Decisions U-05, U-05.1). *MVP Limitation: Exactly one receipt event per requisition; remaining undelivered quantity not tracked; no multiple shipments.* |
| `FinanceApproved` | `ExcessPendingManager` | Inventory Clerk | Step 1: Clerk records delivered count exceeding approved quantity (`receivedQty > approvedQty`) and submits excess authorization request via `POST /requisitions/:id/excess-requests`; inventory is NOT incremented (Decisions U-05.1, U-05.2). |
| `ExcessPendingManager` | `ExcessPendingFinance` | Manager | Step 2: Manager authorizes operational necessity for additional quantity via `POST /requisitions/:id/excess-authorizations` (Decision U-05.2). |
| `ExcessPendingManager` | `ExcessRejected` | Manager | Manager rejects excess operational need via `POST /requisitions/:id/excess-authorizations`; non-empty `rejectionReason` required; only excess quantity is rejected; originally approved quantity remains eligible for receipt; logs audit (`EXCESS_REJECTED`) (Decision UD-01). |
| `ExcessPendingFinance` | `ExcessApproved` | Finance Officer | Step 3: Finance Officer authorizes additional financial commitment via `POST /requisitions/:id/excess-authorizations` (Decision U-05.2). |
| `ExcessPendingFinance` | `ExcessRejected` | Finance Officer | Finance Officer rejects excess financial commitment via `POST /requisitions/:id/excess-authorizations`; non-empty `rejectionReason` required; only excess quantity is rejected; originally approved quantity remains eligible for receipt; logs audit (`EXCESS_REJECTED`) (Decision UD-01). |
| `ExcessApproved` | `Received` | Inventory Clerk | Step 4: Inventory Clerk completes physical goods receipt via `POST /requisitions/:id/receipts` after dual approval; atomic transaction increments stock by confirmed delivered quantities including authorized excess (Decision U-05.2). |
| `ExcessRejected` | `Received` | Inventory Clerk | Inventory Clerk completes physical goods receipt via `POST /requisitions/:id/receipts` for originally approved quantity (`receivedQty <= approvedQty`); excess quantity is refused at loading dock; increments inventory by accepted quantity; single receipt event per requisition (Decisions U-05, U-05.1, UD-01). |
| `Rejected` | `[*]` | None | Terminal state; preserves rejected requisition, original requested quantities, reviewer identity, timestamp, and rejection reason for compliance audits (Decision UD-03). Requester submits a new requisition via `POST /requisitions` with corrected quantities. |

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
| `POST /auth/sessions` | — | — | — | — | **Public access**; authenticates credentials, sets JWT cookies (alias: `POST /auth/login`) |
| `DELETE /auth/sessions` | ✔ | ✔ | ✔ | ✔ | Revokes active session, purges cookies (alias: `POST /auth/logout`) |
| `POST /auth/tokens/refresh` | ✔ | ✔ | ✔ | ✔ | Requires valid refresh token cookie (alias: `POST /auth/refresh`) |
| `POST /auth/password-reset-requests` | — | — | — | — | **Public access**; requests self-service password reset link (alias: `POST /auth/forgot-password`) |
| `POST /auth/password-resets` | — | — | — | — | **Public access**; completes reset with token (alias: `POST /auth/reset-password`) |
| `GET /items` | ✔ | ✔ | ✔ | ✔ | Catalog browsing. `status=inactive\|all` query restricted to Admin; soft-deleted items hidden by default |
| `POST /items` | ✔ | — | — | — | Catalog authoring (system auto-generates unique SKU) |
| `GET /items/:id` | ✔ | ✔ | ✔ | ✔ | Retrieve single catalog item details |
| `PATCH /items/:id` | ✔ | — | — | — | Catalog modification (metadata only; quantity modification prohibited) |
| `DELETE /items/:id` | ✔ | — | — | — | Soft-deletes item (`isActive=false`; confirmation dialog required) |
| `POST /items/:id/adjustments` | ✔ | ✔ | — | — | Stock count adjustment (requires reason) |
| `GET /dashboard` | ✔ | ✔ | ✔ | ✔ | Aggregated view metrics and role-specific activity feed |
| `GET /requisitions` | ✔ | ✔ | ✔ | ✔ | Shared screen with role presets; Clerk can view all requisitions & My Requisitions |
| `GET /requisitions/:id` | ✔ | ✔ | ✔ | ✔ | Detail view with embedded `timeline[]` and rejection history |
| `POST /requisitions` | — | ✔ | — | — | Immediate submission into `Pending` (no draft state) |
| `POST /requisitions/:id/approvals` | — | — | ✔ | ✔ | Manager: `Pending` only; Finance: `ManagerApproved` (standard approval; reviewers cannot modify quantities, Decision UD-03) |
| `POST /requisitions/:id/rejections` | — | — | ✔ | ✔ | Requires mandatory rejection reason; creator submits new requisition (Decision UD-03) |
| `POST /requisitions/:id/cancellations` | — | ✔ | — | — | Creator only; cancels own `Pending` requisition (or `PATCH /requisitions/:id` with `{ status: 'Cancelled' }`) |
| `POST /requisitions/:id/excess-requests` | — | ✔ | — | — | Clerk submits excess-delivery authorization request (Step 1 of excess workflow) |
| `POST /requisitions/:id/excess-authorizations` | — | — | ✔ | ✔ | Authorize or reject excess delivery: Manager operational need (Step 2) or Finance financial commitment (Step 3); rejection transitions to `ExcessRejected` (Decisions U-05.1, U-05.2, UD-01) |
| `POST /requisitions/:id/receipts` | — | ✔ | — | — | Clerk completes receipt (standard <= approved, Step 4 after dual excess approval, or approved quantity after excess rejection; single receipt event per requisition in MVP) (Decisions U-05, U-05.1, U-05.2, UD-01) |
| `GET /notifications` | ✔ | ✔ | ✔ | ✔ | Scoped strictly to authenticated caller; returns deep-link context |
| `PATCH /notifications/:id` | ✔ | ✔ | ✔ | ✔ | Scoped strictly to notification owner (e.g. `{ read: true }`) |
| `PATCH /notifications` | ✔ | ✔ | ✔ | ✔ | Bulk mark-as-read (`{ read: true, ids, all }`) for own notifications |
| `GET /audit-logs` | ✔ | — | — | — | System compliance inspection |
| `GET /users` | ✔ | — | — | — | User directory management (displays full name) |
| `PATCH /users/:id` | ✔ | — | — | — | Update user attributes (`role`, or `{ isActive: false }` for deactivation, `{ isActive: true }` for reactivation; self-deactivation blocked, last Admin protected) |
| `PATCH /users/:id/role` | ✔ | — | — | — | Privilege assignment (or via `PATCH /users/:id`) |
| `POST /users/:id/temporary-passwords` | ✔ | — | — | — | Initiates temporary password reset after identity verification; single-use, expires in 24 hours; must change at next login; credentials never logged (Decision UD-02) |
| `POST /exports/google-sheets` | ✔ | — | ✔ | ✔ | Management & fiscal oversight; Quick Export across all filtered records/pages (Decision UD-04) or Custom Export (Decision U-12) |
| `GET /exports/csv` | ✔ | ✔ | ✔ | ✔ | Tabular catalog export for stock counts, planning, and audits |
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
