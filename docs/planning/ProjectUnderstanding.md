# Project Understanding (Updated)

**Business Goal**: Deliver a portfolio‑ready single‑page web application that showcases full‑stack development (React + TypeScript front‑end, NestJS + Node.js back‑end, PostgreSQL) with a realistic inventory‑procurement workflow.

**Core Users & Roles**
- **Admin** – full system control, user/role management, audit‑log view.
- **Inventory Clerk** – view inventory, create purchase requisitions.
- **Manager** – first‑level approval of requisitions.
- **Finance Officer** – second‑level approval, mark requisitions received, trigger low‑stock alerts, export inventory to Google Sheets.

**Primary Business Workflow (MVP)**
1. Clerk creates a requisition (list of SKUs & quantities).
2. Manager approves/rejects (first step).
3. Finance Officer approves/rejects (second step).
4. Upon final approval, Finance marks the requisition **Received**, which updates inventory quantities.
5. System sends low‑stock alerts (email + in‑app toast) when any SKU drops below its threshold.
6. Dashboard shows totals and tabular views refreshed every 5 seconds (polling).

**MVP Feature Prioritisation (as you confirmed)**
- **Mandatory**: Item catalog CRUD, Authentication & role middleware, Requisition creation, Low‑stock alerts, Basic dashboard, Google Sheets read‑only export.
- **Good to have**: Two‑level approval workflow, Interactive charts.
- **Optional**: Forecasting (SMA).

The above will guide the forthcoming requirements and SRS draft.

