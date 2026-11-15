# Software Requirements Specification (SRS) Draft

*Version 0.1 – Draft*  
*Prepared on 2026‑11‑12*  

---

## 1. Introduction
### 1.1 Purpose
The purpose of this document is to specify the functional and non‑functional requirements for the **Inventory & Procurement Management System (IPMS)**. The SRS serves as a definitive reference for developers, testers, and stakeholders throughout the project implementation.

### 1.2 Scope
The system enables multiple user roles to manage inventory items, create purchase requisitions, execute a two‑step approval workflow (Manager → Finance), receive goods, generate low‑stock alerts, view a real‑time dashboard, and export inventory data to a read‑only Google Sheet. Optional forecasting and visual analytics may be added after the MVP is delivered.

### 1.3 Definitions, Acronyms, Abbreviations
| Term | Definition |
|------|------------|
| **MVP** | Minimum Viable Product – the set of mandatory features to be completed within the 4‑week sprint. |
| **SSE** | Server‑Sent Events – a unidirectional push mechanism for real‑time updates from the back‑end to the front‑end. |
| **JWT** | JSON Web Token – used for authentication (access token + refresh token). |
| **CRUD** | Create, Read, Update, Delete operations. |
| **SMA** | Simple Moving Average – lightweight demand‑forecasting algorithm (optional). |
| **NFR** | Non‑functional requirement. |
| **FR** | Functional requirement. |

### 1.4 References
- Project Brief (original) – located in `docs/ProjectBrief.md`.
- Data Model & Business Rules – `docs/DataModel.md`.
- Functional Requirements Register – `docs/RequirementsRegister.md`.
- ISO/IEC/IEEE 29148 – Systems and software engineering – Life cycle processes – Requirements engineering.

---

## 2. Overall Description
### 2.1 Product Perspective
IPMS is a **stand‑alone** web application consisting of a React + TypeScript SPA (frontend) communicating with a NestJS RESTful API (backend). PostgreSQL stores persistent data. External services used for the MVP are:
- **SendGrid** (mock email – console log).
- **Google Sheets API** (read‑only export via service‑account).
- **GitHub Actions** for CI/CD.

### 2.2 Product Functions (high‑level)
1. **User Management** – registration, login, role‑based access control.
2. **Item Catalog** – CRUD for inventory items with per‑SKU low‑stock threshold.
3. **Requisition Workflow** – creation, two‑step approval, receipt, stock adjustment.
4. **Alerting** – low‑stock notifications (in‑app toast + mock email).
5. **Real‑time Dashboard** – totals, low‑stock count, recent requisitions, refreshed via SSE.
6. **Export** – read‑only inventory export to Google Sheet.
7. **Infrastructure** – CI/CD pipeline, OpenAPI documentation, Docker containerisation.

### 2.3 User Classes & Characteristics
| Role | Primary Capabilities |
|------|----------------------|
| **Admin** | Manage users & roles, full CRUD on items & requisitions, view audit logs. |
| **Inventory Clerk** | View items, create requisitions, (optional) adjust stock manually. |
| **Manager** | Approve/reject requisitions (first level), receive low‑stock alerts. |
| **Finance Officer** | Approve/reject second level, mark requisitions as Received, trigger stock increment, export to Google Sheet, receive low‑stock alerts. |

### 2.4 Operating Environment
- **Frontend**: Modern browsers (Chrome, Edge, Firefox) on Windows/macOS/Linux.
- **Backend**: Node.js 20+, NestJS 10, PostgreSQL 15 on Render/Railway free tier.
- **Deployment**: Docker containers; optional `docker‑compose.yml` for local development.

### 2.5 Design Constraints & Assumptions
- All mandatory features must be completed within **4 weeks**.
- No real email delivery; SendGrid calls are mocked (console log) to avoid credential exposure.
- Low‑stock threshold is **per‑SKU** (as per decision D‑004).
- Real‑time updates implemented via **SSE** (decision D‑005).
- Two‑step approval workflow is **mandatory** (industry‑standard) – decision D‑002.
- Forecasting and interactive charts are **optional/good‑to‑have** and may be deferred.

---

## 3. Functional Requirements
The functional requirements are enumerated in the **Requirements Register** and are reproduced here with brief acceptance criteria.

| ID | Requirement (summary) | Acceptance Criteria |
|----|-----------------------|----------------------|
| FR‑001 | User registration & login | 1. Registration succeeds with a unique email and a password ≥ 8 chars. 2. Password stored as bcrypt hash. 3. Login returns a JWT access token (15 min) and a refresh token in HttpOnly cookies. |
| FR‑002 | Role‑based access control | 1. Each endpoint validates the JWT and the caller’s role. 2. Admin can access all endpoints; other roles restricted as per matrix. |
| FR‑003 | Item CRUD with `reorderThreshold` | 1. Admin can create, read, update, delete items. 2. `quantity` cannot become negative. 3. Low‑stock alert triggers when `quantity < reorderThreshold`. |
| FR‑004 | Create purchase requisition | 1. Inventory Clerk can submit a requisition containing one or more line items. 2. Requisition status = `Pending` on creation. |
| FR‑005 | Manager approval (first level) | 1. Manager can approve → status becomes `ManagerApproved` or reject → status `Rejected`. 2. An audit‑log entry records the action, user, timestamp, and before/after status. |
| FR‑006 | Finance approval (second level) | 1. Finance Officer can approve → status becomes `FinanceApproved` or reject → status `Rejected`. 2. Audit‑log entry created. |
| FR‑007 | Mark requisition as Received & stock update | 1. Finance Officer can set status to `Received`. 2. For each line item, `Item.quantity` increases by `approvedQty`. 3. Update performed inside a DB transaction; audit‑log recorded. |
| FR‑008 | Low‑stock alert notifications | 1. When `Item.quantity < reorderThreshold`, a `LowStockAlert` notification is created for Manager and Finance Officer. 2. A mock email is logged to the console. |
| FR‑009 | Real‑time updates via SSE | 1. Clients can open `/events` and receive JSON events for stock changes and requisition status updates. 2. Events are emitted within 1 s of the underlying DB change. |
| FR‑010 | Dashboard view | 1. Dashboard shows total items, low‑stock count, and a table of the 5 most recent requisitions. 2. Data refreshed through SSE (no polling). |
| FR‑011 | Export to Google Sheets (read‑only) | 1. Finance Officer can click “Export” and a Google Sheet is created/updated with the current inventory view. 2. Service‑account has read‑only scope; no write‑back to the system. |
| FR‑012 | OpenAPI documentation | 1. Swagger UI available at `/api/docs` and reflects all endpoints. |
| FR‑013 | CI/CD pipeline | 1. On every push, GitHub Actions lint, run unit tests, build Docker images, and push to Docker Hub. |
| FR‑014 | Audit log | 1. Immutable entries store `entity`, `entityId`, `action`, `performedBy`, `timestamp`, and JSON `details` (before/after). |
| FR‑015 | (Optional) SMA demand forecasting | 1. System computes a 4‑week moving average per SKU and displays a recommended reorder quantity on the dashboard. |
| FR‑016 | (Good‑to‑have) Interactive Chart.js visualisations | 1. Stock turnover line chart, monthly spend bar chart, and low‑stock heat map are displayed on the dashboard. |

---

## 4. External Interface Requirements
### 4.1 User Interfaces
- **SPA** built with React + TypeScript, using Material‑UI components (tables, dialogs, snackbars). 
- Responsive layout for desktop and tablet screens.

### 4.2 Software Interfaces
- **REST API** (NestJS) – JSON over HTTPS.
- **SSE endpoint** – `GET /events` streams newline‑delimited JSON events.
- **Google Sheets API** – service‑account JSON key (read‑only).
- **SendGrid (mock)** – console‑log function simulating email dispatch.

### 4.3 API Interfaces (selected) – summarized
| Method | Path | Description | Roles allowed |
|--------|------|-------------|---------------|
| POST | `/auth/register` | Register new user. | Public |
| POST | `/auth/login` | Login, receive JWTs. | Public |
| GET | `/items` | List items. | All authenticated |
| POST | `/items` | Create item. | Admin |
| PATCH | `/items/:id` | Update item (including `reorderThreshold`). | Admin |
| DELETE | `/items/:id` | Delete item. | Admin |
| POST | `/requisitions` | Create requisition. | InventoryClerk |
| PATCH | `/requisitions/:id/approve` | Approve (Manager or Finance). | Manager / FinanceOfficer |
| PATCH | `/requisitions/:id/receive` | Mark as Received, update stock. | FinanceOfficer |
| GET | `/export/google-sheet` | Export inventory to Google Sheet. | FinanceOfficer |
| GET | `/api/docs` | Swagger UI. | All authenticated |

---

## 5. Non‑Functional Requirements
| NFR‑001 | **Performance** – API response time < 200 ms for CRUD operations on up to 5 k items; SSE latency ≤ 1 s. |
| NFR‑002 | **Security** – Passwords hashed with bcrypt; JWT access token lifespan 15 min, refresh token stored HttpOnly; role‑based guards; CSP headers; mock email only, no real credentials stored. |
| NFR‑003 | **Scalability** – Stateless NestJS services; can be horizontally scaled behind a load balancer. |
| NFR‑04 | **Reliability** – All stock adjustments performed inside a PostgreSQL transaction with `SELECT … FOR UPDATE`. |
| NFR‑05 | **Usability** – UI follows Material‑UI accessibility guidelines; toast notifications for alerts. |
| NFR‑06 | **Maintainability** – Codebase follows clean‑architecture folder layout (`src/modules/*`), TypeScript strict mode, ESLint + Prettier, JSDoc comments, auto‑generated OpenAPI spec. |
| NFR‑07 | **Cost** – All services (Render/Railway free tier, SendGrid free tier, Google Sheets service‑account) remain within free limits. |
| NFR‑08 | **Portability** – Dockerfiles provided for both frontend and backend; optional `docker‑compose.yml` for local dev. |

---

## 6. Data Requirements
Refer to **Data Model and Business Rules** (`docs/DataModel.md`) for entity definitions, attributes, relationships, and enumerations.

---

## 7. Use Cases & Workflows (high‑level)
1. **Register / Login** – User registers, receives verification email (mock), logs in, receives JWTs.
2. **Item Management** – Admin creates an item with `reorderThreshold`. System stores the record.
3. **Requisition Creation** – Clerk adds line items, submits; status = `Pending`.
4. **First‑Level Approval** – Manager reviews, approves → status `ManagerApproved`; audit logged.
5. **Second‑Level Approval** – Finance Officer reviews, approves → status `FinanceApproved`; audit logged.
6. **Receipt & Stock Update** – Finance marks as `Received`; stock quantities increment; audit logged; low‑stock alerts evaluated.
7. **Dashboard Refresh** – Front‑end receives SSE events for item quantity changes and requisition status updates; UI updates instantly.
8. **Export** – Finance Officer triggers Google Sheet export; sheet populated with current inventory snapshot.

---

## 8. Acceptance Criteria (summary)
- All **FR‑001 – FR‑014** must be **implemented**, **unit‑tested**, and **verified** within the 4‑week sprint.
- Optional FR‑015 and FR‑016 are **out‑of‑scope** for MVP; they may be added later.
- System passes **performance** test: 200 ms median response time under a load of 100 concurrent users.
- Security audit confirms **no plain‑text passwords** and **HttpOnly cookies** for tokens.
- CI pipeline succeeds on every push without manual intervention.

---

## 9. Appendices
- Appendix A – Glossary (see section 1.3).
- Appendix B – ER diagram (see Data Model file).
- Appendix C – Traceability matrix (FR ↔ Data Model entities ↔ NFRs).

---

*Prepared by*: Antigravity (Business Analyst & Requirements Consultant)  
*Next actions*: Review the draft with the client, confirm acceptance criteria, and proceed to detailed design / implementation planning.

