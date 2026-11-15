# Inventory and Procurement Management System (IPMS)

A robust, enterprise-grade full-stack web application for inventory tracking, procurement requisition workflows, and real-time stock monitoring.

---

## 📌 Project Overview

This project implements a complete inventory-procurement lifecycle:
- **Role-Based Workflows**: Multi-tier access control for Admins, Inventory Clerks, Managers, and Finance Officers.
- **Two-Level Requisition Approval**: Purchase requisitions require sequential Manager approval followed by Finance Officer approval.
- **Automated Inventory Updates**: Receiving goods automatically adjusts stock quantities with atomic transactions.
- **Real-Time Push Updates**: Server-Sent Events (SSE) deliver real-time notifications and dashboard updates without polling overhead.
- **Data Integration & Fallbacks**: Export capabilities via Google Sheets API with standalone CSV stream fallback.

---

## 🛠 Tech Stack

- **Frontend**: React (TypeScript), Tailwind CSS, Vite
- **Backend**: NestJS / Node.js (TypeScript)
- **Database**: PostgreSQL with Prisma / TypeORM
- **Real-Time Sync**: Server-Sent Events (SSE)
- **External Services**: Google Sheets API, SendGrid (mocked/console in dev)

---

## 📂 Project Structure

```text
.
├── docs/                     # Project documentation & specifications
│   ├── README.md             # Documentation index & guide
│   ├── specs/                # Authoritative specifications (SRS, Data Model, Requirements)
│   ├── planning/             # Context, project brief, and discovery notes
│   ├── decisions/            # Architecture Decision Records (ADRs)
│   └── archive/              # Historical drafts and audit reviews
│
│   # --- Application code (Planned / In Development) ---
├── apps/                     # Application source packages
│   ├── client/               # Frontend SPA (React + TypeScript)
│   └── server/               # Backend REST API (NestJS)
└── scripts/                  # Development scripts, database migrations & seed utilities
```

---

## 📖 Documentation Quick Links

For complete technical specifications and requirements, please refer to:
- [**Documentation Index**](docs/README.md)
- [**Software Requirements Specification (SRS v1.0)**](docs/specs/SRS.md)
- [**Data Model & Business Rules**](docs/specs/DataModel.md)
- [**Functional Requirements Register**](docs/specs/RequirementsRegister.md)
- [**Architectural Decision Log**](docs/decisions/DecisionLog.md)
