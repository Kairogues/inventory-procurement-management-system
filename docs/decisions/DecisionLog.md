# Decision Log

## 1. System & Architecture Decisions

| ID | Topic | Decision / Proposal | Rationale | Status | Consequences |
|----|-------|---------------------|-----------|--------|--------------|
| D-001 | MVP Feature Prioritisation | Adopt the feature classification you just provided (mandatory, good‑to‑have, optional). | This defines the baseline scope for the 4‑week sprint. | Confirmed | Sets scope boundaries |
| D-002 | Two‑level approval workflow | **Approved – Mandatory (industry‑standard)** – full Manager → Finance two‑step approval as typical procurement process. | Aligns with real‑world procurement practices and your requirement for an industry‑standard flow. | Confirmed | Affects requisition status flow |
| D-003 | Forecasting (SMA) | **Optional** – can be omitted without affecting core workflow. | Reduces front‑end charting effort. | Confirmed | May be added in Phase 2 |
| D-004 | Low‑stock alert threshold handling | **Approved – Per‑SKU** – each item stores its own `reorderThreshold`. | Gives flexibility per product and matches industry practice. | Confirmed | Influences data model |
| D-005 | Real‑time data sync method | **Approved – SSE** – use Server‑Sent Events for push updates. | Provides true real‑time UI with lower server load than polling. | Confirmed | Requires SSE endpoint & client listener |
| D-006 | Inventory Data Export RBAC Governance | **Approved – Tiered Export Access** – grant `GET /export/csv` to all authenticated roles (`Admin`, `Clerk`, `Manager`, `Finance`), and `POST /export/google-sheet` to managerial oversight (`Admin`, `Manager`, `Finance`). | Align with enterprise standards where read-authorized users can export tabular data for physical counts/planning, eliminating cross-departmental bottlenecks while preserving shared sheet management. | Confirmed | Updates SRS FR-011, FR-026, §4.3, and Appendix A RBAC matrix |
| D-007 | Requisition Resubmission API (G01) | **Approved** – Add `PATCH /requisitions/:id/resubmit` for Inventory Clerk (creator only) when requisition is `Rejected`. Resets to `Pending`, captures fresh snapshot prices, restarts approval cycle at Manager. | Resolves API directory gap; preserves requisition ID continuity and historical audit trail without creating duplicate requisition records. | Confirmed | Updates SRS v1.2 §4.3, §6.1, §7.2, Appendix A; DataModel |
| D-008 | Scoped Requisition History & Timeline API (G02) | **Approved** – Embed `timeline[]` array directly in `GET /requisitions/:id` for all authorized requisition viewers. | Non-Admin roles cannot access `GET /audit-logs`. Embedding scoped timeline provides required milestone history without exposing system-wide audit data. | Confirmed | Updates SRS v1.2 §4.3, Appendix A |
| D-009 | Rejection Reason History Tracking (G03) | **Approved** – Preserve prior rejection reasons in audit/timeline and return `currentRejectionReason` + `rejectionHistory[]` in `GET /requisitions/:id`. | Prevents loss of historical reviewer feedback across multi-round edit/resubmission cycles (Q09). | Confirmed | Updates SRS v1.2 §4.3, DataModel |
| D-010 | Bulk Notification Read API (G04) | **Approved** – Add `PATCH /notifications/read` supporting `{ ids?: string[], all?: boolean }`. | Satisfies FR-017 bulk mark-as-read requirement, avoiding N separate client HTTP requests and race conditions with SSE unread count. | Confirmed | Updates SRS v1.2 §4.3, Appendix A, RequirementsRegister |
| D-011 | Inactive Catalog Item Visibility Governance (G05) | **Approved** – Add query parameter `status=active\|inactive\|all` to `GET /items`. Default is `active`; `inactive` and `all` restricted to Admin. | Satisfies Q06; regular users only see active SKUs while Admin can inspect and manage soft-deleted items. | Confirmed | Updates SRS v1.2 §4.3, Appendix A, RequirementsRegister |
| D-012 | Standardized Page-Based Pagination (DOC-02) | **Approved** – Standardize list pagination exclusively on `page` (default 1) and `limit` (default 50, max 100), with response envelope `{ data: [...], pagination: { page, limit, totalCount, totalPages } }`. | Eliminates offset vs. page conflicts across specifications; provides a consistent client-server contract for all list queries. | Confirmed | Updates SRS FR-021, §4.3; RequirementsRegister FR-021 |
| D-013 | Formalized Inventory Query Filters (DOC-03) | **Approved** – Standardize `GET /items` query parameters: `search` (SKU/name), `location`, `stockStatus` (`low` [qty < threshold] \| `normal` [qty >= threshold]), and `status` (`active` \| `inactive` \| `all`, Admin-only). | Clarifies filtering boundaries and aligns RequirementsRegister with SRS §4.3 and threshold alert rules. | Confirmed | Updates SRS FR-021, §4.3; RequirementsRegister FR-021; DataModel |
| D-014 | Requisition Detail & Timeline Response Contract (DOC-04) | **Approved** – Formalize `GET /requisitions/:id` response schema with typed `timeline[]`, `currentRejectionReason`, `rejectionHistory[]`, and `quantityModifications[]`. | Resolves schema ambiguity for workflow tracking across multiple review and resubmission cycles. | Confirmed | Updates SRS §4.3; DataModel |
| D-015 | Separation of Catalog Updates from Stock Adjustments (DOC-05) | **Approved** – Prohibit direct modification of `quantity` via `PATCH /items/:id`. Physical stock changes must exclusively execute via `PATCH /items/:id/adjust` (FR-025) or Goods Receipt (FR-007). | Enforces mandatory adjustment reasons, audit integrity, and eliminates dual-mutation paths for stock counts. | Confirmed | Updates SRS FR-003, §4.3; RequirementsRegister FR-003; DataModel |

---

## 2. Approved UI/UX Architecture Decisions (U-01 – U-13)

### Summary Register

| Decision ID | Topic | Original Ambiguity / Question | Approved Option | Final Decision Summary | Status | Approval Date |
|-------------|-------|-------------------------------|-----------------|------------------------|:------:|:-------------:|
| **U-01** | Requisition creation | Should requisitions support a Draft state / Save Draft, or submit immediately? | Immediate submission | Requisitions submit immediately upon creation with `Pending` status. No Draft state or Save Draft functionality. Cancellation applies to creator's own Pending requisitions. | Approved | 2026-11-15 |
| **U-02** | Item detail presentation | Should item details open in a separate page or a side drawer? | Right-side detail drawer | Item selection in Item Catalog opens a right-side drawer displaying details and role-dependent actions while keeping catalog visible. | Approved | 2026-11-15 |
| **U-03** | Requisition visibility | Should Clerks only see their own requisitions or all requisitions? | All requisitions | Inventory Clerks can view requisitions created by all users with a "My Requisitions" filter preset for their own submissions. Managers and Finance retain required visibility. | Approved | 2026-11-15 |
| **U-04** | Approval quantity changes | How should reviewers modify item quantities during approval? | Separate dialog | Reviewers use "Approve with Changes" action opening a dedicated dialog to review and adjust quantities before confirming. | Approved | 2026-11-15 |
| **U-05** | Goods receipt interaction | Should goods receipt assume 100% receipt or require entering actual quantities, and who executes it? | Allow actual quantity entry | Goods Receipt displays approved quantities; Inventory Clerks enter actual received quantities. System uses recorded received quantities for inventory increments. Clerk confirms before recording. | Approved | 2026-11-15 |
| **U-05.1** | Partial and excess deliveries | Are partial or excess deliveries allowed at goods receipt? | Partial delivery allowed; excess delivery requires authorization | Clerks can record fewer units than approved (partial) or exact approved quantity. Excess quantities require authorization before acceptance. | Approved | 2026-11-15 |
| **U-05.2** | Excess quantity authorization | Who authorizes delivered quantities that exceed approved amounts? | Both Manager and Finance Officer | Two-stage authorization: 1. Manager approves operational need; 2. Finance Officer approves financial commitment. Inventory Clerk completes receipt after both approvals. No inventory increment prior to approvals. | Approved | 2026-11-15 |
| **U-06** | User identification | How should users be primarily identified across tables and logs? | Full name | Display users' full names as primary identifier in tables, requisitions, approval history, and audit logs. Email address is secondary. | Approved | 2026-11-15 |
| **U-07** | SKU generation | Should catalog SKUs be manually entered or system-generated? | Automatic generation | System automatically generates unique SKU on item creation. Manual SKU entry or choice is prohibited. Displayed in details and confirmation. | Approved | 2026-11-15 |
| **U-08** | Item deletion | Should item deletion be hard or soft, and how are references preserved? | Soft deletion | Items are soft-deleted (`isActive = false`), disappearing from normal catalog while preserving historical requisitions and audit logs. Deletion requires confirmation dialog. | Approved | 2026-11-15 |
| **U-09** | Requisition List predefined views | What predefined views should exist for each role on Requisition List? | Role-specific predefined views | Shared Requisition List screen with role-dependent tab/filter presets: Clerk (All, My Requisitions); Manager (Pending Manager Approval, Reviewed, All); Finance (Pending Finance Approval, Reviewed, All); Admin (All). | Approved | 2026-11-15 |
| **U-10** | Notification click behavior | What happens when clicking a notification in the inbox? | Navigate and highlight relevant information | Navigates directly to target screen/record and highlights relevant section. Notification payload must store destination context. | Approved | 2026-11-15 |
| **U-11** | Dashboard activity feed | Should dashboard activity feed be uniform or role-tailored? | Role-specific activity feed | Shared dashboard layout with role-dependent activity data: Clerk (stock changes, requisitions, goods receipts); Manager (submissions, Manager approvals); Finance (Finance approvals, requisition updates); Admin (all system activities). | Approved | 2026-11-15 |
| **U-12** | Google Sheets integration | Should Google Sheets export be direct one-click or configurable? | Direct and configurable export | Quick export exports inventory data with default settings. Custom export opens configuration dialog to select columns and filter scope (all vs filtered). | Approved | 2026-11-15 |
| **U-13** | Password recovery | Should password recovery be strictly Admin-assisted or include self-service? | Both email-based recovery and Admin assistance | Self-service password reset via registered email link plus Admin assistance fallback for users unable to self-recover. Forgot Password flow included. | Approved | 2026-11-15 |

---

### Detailed Decision Profiles

#### U-01 — Requisition creation
- **Decision ID:** U-01
- **Topic:** Requisition creation
- **Original Ambiguity or Question:** Does requisition creation support a draft state (Save Draft) allowing incomplete or unsubmitted requisitions to be saved, or does creation immediately submit into the approval workflow?
- **Approved Option:** Immediate submission
- **Final Decision:**
  - Creating a requisition immediately submits it into the procurement approval workflow.
  - The user selects items, enters quantities, reviews the calculated total, and clicks Submit Requisition.
  - The requisition is created with `Pending` status.
  - There is no `Draft` state or Save Draft functionality.
  - Cancellation applies strictly to the creator's own `Pending` requisitions.
  - The requisition state machine contains no `Draft` state.
- **Explanation or Rationale:** Streamlines requisition creation for warehouse staff, prevents stale or orphaned draft records from accumulating in the database, and keeps requisition state transitions clean and unambiguous for the MVP.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-02 — Item detail presentation
- **Decision ID:** U-02
- **Topic:** Item detail presentation
- **Original Ambiguity or Question:** Should item details be presented on a separate dedicated page or in a contextual right-side drawer over the catalog?
- **Approved Option:** Right-side detail drawer
- **Final Decision:**
  - Selecting an item in the Item Catalog opens a right-side drawer.
  - The catalog remains visible behind the drawer.
  - The drawer displays the selected item's details.
  - Available actions depend on the user's role and permissions.
  - Use a drawer rather than a separate item-detail page.
- **Explanation or Rationale:** Preserves browsing context in high-volume inventory operations, eliminates unnecessary page reloads and scroll-position losses, and provides a modern, responsive user experience.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-03 — Requisition visibility
- **Decision ID:** U-03
- **Topic:** Requisition visibility
- **Original Ambiguity or Question:** Should Inventory Clerks be restricted to viewing only their own requisitions, or should they have visibility into all requisitions across the organization?
- **Approved Option:** All requisitions
- **Final Decision:**
  - Inventory Clerks can view requisitions created by all users.
  - Provide a "My Requisitions" filter for their own submissions.
  - Managers and Finance Officers retain the visibility necessary for their approval and receipt responsibilities.
- **Explanation or Rationale:** Fosters operational transparency, avoids duplicate purchase requests submitted by different clerks for the same depleted stock, and allows team members to cross-cover shifts.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-04 — Approval quantity changes
- **Decision ID:** U-04
- **Topic:** Approval quantity changes
- **Original Ambiguity or Question:** How should approving authorities (Manager, Finance Officer) modify approved item quantities during requisition review? Inline in the main review view or via a dedicated workflow?
- **Approved Option:** Separate dialog
- **Final Decision:**
  - Reviewers use an "Approve with Changes" action when they need to modify approved quantities.
  - A separate dialog allows them to review and modify quantities before confirming.
  - The resulting changes must be clear before confirmation.
  - Normal requisition review remains focused on reviewing information.
  - *(Ambiguity Note: Whether quantity modification is strictly limited to reductions [$\le \text{requestedQty}$] or permits upward adjustment [$\gt \text{requestedQty}$] is an unresolved business rule subject to Product Owner clarification).*
- **Explanation or Rationale:** Prevents accidental inline edits during routine inspection, enforces deliberate confirmation for adjustments altering financial commitments, and keeps the primary review form clean and read-focused.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-05 — Goods receipt interaction
- **Decision ID:** U-05
- **Topic:** Goods receipt interaction
- **Original Ambiguity or Question:** Does the Goods Receipt process automatically assume 100% receipt of approved quantities, or must received quantities be explicitly verified and entered? Who executes the receipt?
- **Approved Option:** Allow actual quantity entry
- **Final Decision:**
  - The Goods Receipt screen displays approved quantities.
  - Inventory Clerks enter the actual quantities received.
  - The system uses recorded received quantities when updating inventory.
  - The Clerk must confirm the receipt before it is recorded.
- **Explanation or Rationale:** Reflects physical dock operations where delivered shipments may vary from approved purchase orders. Enforces warehouse physical counts before stock increments are committed to the ledger.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-05.1 — Partial and excess deliveries
- **Decision ID:** U-05.1
- **Topic:** Partial and excess deliveries
- **Original Ambiguity or Question:** Can goods receipt record partial delivery (fewer units than approved) or excess delivery (more units than approved)?
- **Approved Option:** Partial delivery allowed; excess delivery requires authorization
- **Final Decision:**
  - Clerks can record fewer units than approved (partial delivery allowed).
  - Clerks can record exactly the approved quantity (full delivery).
  - Excess quantities require authorization before they can be accepted and recorded.
- **Explanation or Rationale:** Suppliers often ship partial quantities due to backorders. Allowing partial delivery receipt prevents blocking needed items, while blocking unapproved excess prevents unauthorized budget overruns and warehouse liability.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-05.2 — Excess quantity authorization
- **Decision ID:** U-05.2
- **Topic:** Excess quantity authorization
- **Original Ambiguity or Question:** What authorization workflow governs accepting delivered quantities that exceed approved requisition amounts?
- **Approved Option:** Both Manager and Finance Officer
- **Final Decision:**
  - Excess delivery executes via a four-step authorization and receipt sequence:
    1. Inventory Clerk submits an excess-delivery authorization request upon physical arrival of excess quantities.
    2. Manager authorizes the operational need for the additional quantity.
    3. Finance Officer authorizes the additional financial commitment.
    4. Inventory Clerk completes the receipt of the excess quantity after both approvals are granted.
  - The excess quantity must not be accepted into inventory before the required approvals are complete.
  - *(Unresolved Decision: The fallback behavior and state transition if either Manager or Finance Officer rejects the excess delivery is an open decision requiring Product Owner approval).*
- **Explanation or Rationale:** Dual authorization ensures both operational necessity (storage capacity, departmental demand) and financial authorization (budget allocation, payment approval) are verified prior to receiving excess goods into active inventory.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-06 — User identification
- **Decision ID:** U-06
- **Topic:** User identification
- **Original Ambiguity or Question:** How should users be identified across the application interface (email address vs full name)?
- **Approved Option:** Full name
- **Final Decision:**
  - Display users' full names as the primary identifier in tables, requisitions, approval history, and audit logs.
  - Email addresses are secondary information and should appear in user details where needed.
- **Explanation or Rationale:** Full names provide immediate, unambiguous human recognition in collaborative enterprise workflows, reducing cognitive friction compared to deciphering corporate email handles.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-07 — SKU generation
- **Decision ID:** U-07
- **Topic:** SKU generation
- **Original Ambiguity or Question:** Is the SKU manually entered by the Admin or automatically generated by the system upon item creation?
- **Approved Option:** Automatic generation
- **Final Decision:**
  - The system automatically generates a unique SKU when an inventory item is created.
  - Users cannot manually choose or enter the SKU.
  - The generated SKU is displayed in item details and creation confirmation where appropriate.
- **Explanation or Rationale:** Eliminates format inconsistencies, human typos, and duplicate SKU collisions, ensuring guaranteed uniqueness and standardized catalog indexing across the organization.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-08 — Item deletion
- **Decision ID:** U-08
- **Topic:** Item deletion
- **Original Ambiguity or Question:** Should item deletion allow physical hard deletion or only soft deletion? How is historical requisition and audit data preserved?
- **Approved Option:** Soft deletion
- **Final Decision:**
  - Deleted items disappear from the normal Item Catalog.
  - Historical requisitions retain references to those items.
  - Audit logs preserve relevant historical records.
  - Items are marked as deleted or inactive rather than physically removed from the database.
  - Deletion requires a confirmation dialog.
- **Explanation or Rationale:** Preserves database referential integrity, historical auditability, and past requisition/accounting records while cleanly hiding inactive SKUs from active operational catalog views.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-09 — Requisition List predefined views
- **Decision ID:** U-09
- **Topic:** Requisition List predefined views
- **Original Ambiguity or Question:** What predefined filters or views should be provided on the Requisition List, and should roles have separate screens?
- **Approved Option:** Role-specific predefined views
- **Final Decision:**
  - Provide the following role-specific predefined views:
    - Inventory Clerk: All Requisitions, My Requisitions.
    - Manager: Pending Manager Approval, Reviewed Requisitions, All Requisitions.
    - Finance Officer: Pending Finance Approval, Reviewed Requisitions, All Requisitions.
    - Admin: All Requisitions.
  - Use a shared Requisition List screen with role-dependent tabs or filter presets rather than separate screens for each role.
- **Explanation or Rationale:** Guides each role directly to their primary actionable tasks (e.g. pending approvals) while leveraging a unified shared screen architecture to maximize component reuse and reduce UI maintenance overhead.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-10 — Notification click behavior
- **Decision ID:** U-10
- **Topic:** Notification click behavior
- **Original Ambiguity or Question:** What occurs when a user clicks a notification item? Does it merely dismiss the notification or navigate to the relevant entity?
- **Approved Option:** Navigate and highlight relevant information
- **Final Decision:**
  - When a user clicks a notification:
    - Navigate directly to the relevant screen or record.
    - Highlight the relevant information or section.
  - Examples:
    - Approval notification → relevant requisition and approval section.
    - Goods receipt notification → relevant Goods Receipt information.
    - Low-stock notification → relevant Item Details drawer and stock information.
  - The notification payload must contain sufficient context (`entityType`, `entityId`) to identify the destination record, while the target screen route and highlighted section are derived deterministically from `entityType`, `entityId`, and `type` without adding redundant schema fields.
- **Explanation or Rationale:** Closes the loop between alert and action, minimizing navigation friction and accelerating response time for critical operational events.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-11 — Dashboard activity feed
- **Decision ID:** U-11
- **Topic:** Dashboard activity feed
- **Original Ambiguity or Question:** Should the dashboard activity feed display identical system events for all users or provide role-tailored activity data?
- **Approved Option:** Role-specific activity feed
- **Final Decision:**
  - Provide role-specific activity feed data:
    - Inventory Clerk: Inventory changes, requisitions, and goods receipts.
    - Manager: Requisition submissions and Manager approval decisions.
    - Finance Officer: Finance approval decisions and related requisition updates.
    - Admin: All system activities.
  - Use one shared Dashboard layout with role-dependent activity data.
- **Explanation or Rationale:** Eliminates clutter and noise, ensuring each user's homepage highlights events directly relevant to their responsibilities and authority level.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-12 — Google Sheets integration
- **Decision ID:** U-12
- **Topic:** Google Sheets integration
- **Original Ambiguity or Question:** How should Google Sheets export be initiated? Direct one-click export or configurable options?
- **Approved Option:** Direct and configurable export
- **Final Decision:**
  - Quick export: Export inventory data using default settings. *(Note: The exact default column set and default item scope are implementation defaults subject to Product Owner confirmation).*
  - Custom export: Open a configuration dialog where users can select columns and choose between all items and filtered results.
- **Explanation or Rationale:** Balances immediate, zero-friction export for routine physical counts with customizable, tailored exports for specific managerial and financial reporting needs.
- **Status:** Approved
- **Approval Date:** 2026-11-15

#### U-13 — Password recovery
- **Decision ID:** U-13
- **Topic:** Password recovery
- **Original Ambiguity or Question:** How is password recovery handled? Only Admin-assisted reset, or self-service via email?
- **Approved Option:** Both email-based recovery and Admin assistance
- **Final Decision:**
  - Self-service: Users can request a password-reset link using their registered email address.
  - Admin assistance: Users who cannot complete self-service recovery can request help from an Admin.
  - Include the necessary Forgot Password and password-reset flow in the requirements where applicable.
  - *(Security Note: In accordance with NFR-009, temporary credentials and passwords must never be written to application logs or console output; the exact secure credential handoff mechanism for Admin assistance is an unresolved implementation detail).*
- **Explanation or Rationale:** Eliminates unnecessary administrative overhead for everyday forgotten passwords while retaining admin-assisted reset as a critical recovery lifeline for account lockouts.
- **Status:** Approved
- **Approval Date:** 2026-11-15


