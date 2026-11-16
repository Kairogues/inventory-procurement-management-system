# IPMS Low-Fidelity Wireframe Prototype

**Document Version:** 1.0  
**Aligned With:** SAD v1.0, SRS v1.5, DecisionLog v1.5, DataModel v1.5  
**Author:** Senior UI/UX Designer & Prototyping Engineer  

---

## 1. Overview & How to Run

This is a complete, interactive, browser-runnable low-fidelity wireframe prototype for the **Inventory & Procurement Management System (IPMS)**.

The prototype is completely self-contained with **zero external dependencies** and runs locally in any modern desktop or mobile browser.

### Quick Start Instructions
1. Open your browser (Google Chrome, Microsoft Edge, Firefox, or Safari).
2. Open the file directly:
   ```text
   wireframes/index.html
   ```
   *(e.g., Double-click `index.html` or drag-and-drop into your browser window).*
3. The interactive prototype will boot up immediately.

---

## 2. Key Interactive Prototype Capabilities

### A. Role Switcher (Top Floating Controller)
At the top of every screen, an interactive role-switcher allows instant testing of the application through the eyes of all four defined enterprise roles:
- **Inventory Clerk** (`Sam Taylor`): Default role. Focus on catalog management, manual stock adjustments, purchase requisition creation (no drafts), and physical loading dock goods receipt.
- **Operational Manager** (`Jordan Lee`): Focus on operational dashboard metrics, first-level requisition approval/rejection (mandatory reasons, no quantity editing), and excess shipment authorization (Step 2).
- **Finance Officer** (`Pat Chen`): Focus on fiscal dashboard metrics, second-level financial approval/rejection, and excess financial authorization (Step 3).
- **System Administrator** (`Alex Morgan`): System governance, staff user directory, role assignment, account deactivation (with self/last-admin safeguards), temporary password generation (24-hour expiry), catalog authoring, soft deletion, and immutable system audit trail inspection.

### B. Screen Quick Jump
A quick jump dropdown in the top bar allows immediate navigation to any of the **13 functional screens** or testing of public authentication workflows without needing to log out.

### C. Contextual Drawers & Modal Dialogs
- **DRAWER-ITEM-01**: Contextual Item Detail Drawer slides in over the catalog list without navigating away (Decision U-02).
- **DRAWER-NOTIF-01**: Notification Slide-Out Panel with unread counts, bulk mark-as-read, and deep linking that highlights target sections (Decision U-10).
- **All 13 Modals Registered in SAD §3.2**: Functional dialogs with validation and feedback.

### D. Unresolved Question Callouts (SAD §9.1)
- **Q-SAD-01** (Separation of duties on Goods Receipt): Clearly highlighted on `SCR-REQ-04` with a callout indicating stakeholder confirmation is pending.
- **Q-SAD-03** (Google Sheets target spreadsheet): Clearly highlighted on `SCR-ITEM-01` and `MOD-EXPORT-CUSTOM` with a callout indicating stakeholder confirmation is pending.

---

## 3. Screen Inventory

| Screen ID | Screen Name | Route Path | Target Roles | Primary Purpose |
|:----------|:------------|:-----------|:-------------|:----------------|
| **SCR-AUTH-01** | User Login | `/login` | Public | Staff login, rate limit warnings, and password visibility toggles. |
| **SCR-AUTH-02** | User Registration | `/register` | Public | Staff self-registration capturing full name (default Clerk role). |
| **SCR-AUTH-03** | Forgot Password Request | `/forgot-password` | Public | Self-service email reset link request. |
| **SCR-AUTH-04** | Reset Password Confirmation | `/reset-password` | Public | Secure token-based password reset form. |
| **SCR-AUTH-05** | Mandatory Temporary Password Change | `/change-password` | Authenticated | Mandatory permanent password update upon login with temporary password. |
| **SCR-DASH-01** | Operational Dashboard | `/dashboard` | All Roles | Aggregated metrics, low-stock count, recent requisitions, role-tailored activity feed. |
| **SCR-ITEM-01** | Item Catalog & Stock Management | `/items` | All Roles | SKU catalog browsing, filtering, search, stock adjustments, Google Sheets/CSV export. |
| **DRAWER-ITEM-01** | Contextual Item Detail Drawer | `/items?selectedItem=:id` | All Roles | Right-side drawer showing SKU specs, stock status, role-dependent actions. |
| **SCR-REQ-01** | Shared Requisition List | `/requisitions` | All Roles | Unified requisition data grid with role-tailored tab presets. |
| **SCR-REQ-02** | Create Purchase Requisition | `/requisitions/new` | Inventory Clerk | Multi-item creation with price snapshotting and immediate submission (no drafts). |
| **SCR-REQ-03** | Requisition Detail & Review | `/requisitions/:id` | All Roles | Snapshot prices, audit timeline, rejection history, and approval/rejection actions. |
| **SCR-REQ-04** | Goods Receipt Verification | `/requisitions/:id/receipt` | Inventory Clerk | Physical counts, partial delivery, and 4-step excess sequence. |
| **SCR-USER-01** | User Management | `/users` | Admin | Staff user directory, role assignment, deactivation, and temporary password reset. |
| **SCR-AUDIT-01** | System Audit Logs | `/audit-logs` | Admin | Chronological immutable audit trail with before/after delta JSON inspector. |
| **DRAWER-NOTIF-01** | Global Notification Panel | Contextual Slide-Out | All Roles | Inbox with unread counts, mark-as-read, and deep-link highlighting. |

---

## 4. Supporting Modal Dialogs

1. **MOD-ITEM-CREATE** — Create Item Modal (Admin only, auto-generated SKU per U-07).
2. **MOD-ITEM-EDIT** — Edit Item Metadata Modal (Admin only, direct quantity edits prohibited per D-015).
3. **MOD-ITEM-ADJUST** — Manual Stock Adjustment Modal (Admin/Clerk, signed integer, mandatory reason, non-negative validation per FR-025).
4. **MOD-ITEM-DELETE** — Soft-Delete Confirmation Dialog (Admin only, preserves historical references per U-08).
5. **MOD-EXPORT-CUSTOM** — Google Sheets Custom Export Modal (Admin/Manager/Finance, column selection & filter scope per U-12).
6. **MOD-REQ-REJECT** — Requisition Rejection Modal (Manager/Finance, mandatory explanation, terminal state per UD-03).
7. **MOD-REQ-CANCEL** — Cancel Requisition Dialog (Creator Clerk, permanent cancellation per U-01).
8. **MOD-EXCESS-AUTHORIZE** — Excess Authorization Modal (Manager Step 2, Finance Step 3 per U-05.2, UD-01).
9. **MOD-RECEIPT-CONFIRM** — Goods Receipt Confirmation Dialog (Clerk, single-event MVP notice per U-05.1).
10. **MOD-USER-ROLE** — Change User Role Dialog (Admin only).
11. **MOD-USER-DEACTIVATE** — User Deactivation Dialog (Admin only, self-deactivation & last Admin guards).
12. **MOD-USER-RESET-PWD** — Admin Password Reset Modal (Admin only, identity verification checkbox, 24h single-use temporary password per UD-02).
13. **MOD-AUDIT-DETAIL** — Audit Event JSON Inspector (Admin only, before/after state diff).

---

## 5. Responsive Breakpoint Conformance

- **Desktop ($\ge 1200\text{px}$)**: Full persistent 250px sidebar, full data grid tables, side-by-side contextual drawers.
- **Tablet ($768\text{px} - 1199\text{px}$)**: Compact mini-drawer sidebar (64px), collapsed secondary columns, 480px slide-over drawers.
- **Mobile ($< 768\text{px}$)**: Off-canvas sidebar with top hamburger toggle, 100% width overlay drawers, stacked filter bars and action areas.
