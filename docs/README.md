# Documentation Index

Welcome to the documentation repository for the **Inventory and Procurement Management System**.

This directory is organized into distinct subdirectories based on document lifecycle and audience to maintain a clear **Single Source of Truth (SSOT)**.

---

## Directory Overview

```text
docs/
├── specs/       # Authoritative specifications (Active / SSOT)
├── planning/    # Project context, discovery, and scope definitions
├── decisions/   # Architectural Decision Records (ADRs) & trade-off logs
└── archive/     # Historical iterations, audit logs, and superseded drafts
```

---

## 1. Specifications (`docs/specs/`)
*The authoritative technical and functional specifications governing the implementation.*

| Document | Purpose | Status |
| :--- | :--- | :--- |
| [**SRS.md**](./specs/SRS.md) | Software Requirements Specification (IEEE 29148 standard compliant). Defines all functional and non-functional requirements, RBAC matrix, and RESTful API contracts. | **Official Baseline v1.5** |
| [**DataModel.md**](./specs/DataModel.md) | PostgreSQL schema definitions, table relationships, foreign key constraints, and core business rules. | **Active v1.5** |
| [**RequirementsRegister.md**](./specs/RequirementsRegister.md) | Functional requirements matrix mapping business goals to entities, RESTful endpoints, and validation criteria. | **Active v1.5** |
| [**SAD.md**](./specs/SAD.md) | Screen Architecture Document (MUI v5 / React 18). Defines the screen inventory, layout hierarchies, role-based workflows, and UI state machines. | **Active v1.0** |

---

## 2. Planning & Context (`docs/planning/`)
*High-level discovery, business background, and onboarding material.*

| Document | Purpose |
| :--- | :--- |
| [**ProjectBrief.md**](./planning/ProjectBrief.md) | Initial project vision, tech stack guidelines, business workflow, and phased milestone breakdown. |
| [**ProjectUnderstanding.md**](./planning/ProjectUnderstanding.md) | Executive summary of stakeholder roles, core workflow steps, and MVP priority classification. |

---

## 3. Decisions (`docs/decisions/`)
*Records of critical architectural and technical decisions.*

| Document | Purpose |
| :--- | :--- |
| [**DecisionLog.md**](./decisions/DecisionLog.md) | Log of key architecture decisions (ADRs) including SSE adoption, per-SKU thresholds, U-01–U-13 UX decisions, and post-UX resolved decisions UD-01–UD-04. |

---

## 4. Archive (`docs/archive/`)
*Superseded drafts and audit trails maintained for historical reference.*

| Document | Purpose |
| :--- | :--- |
| [**IPMS_Documentation_Consolidation_Report.md**](./archive/IPMS_Documentation_Consolidation_Report.md) | Final consolidation report documenting resolution of UD-01–UD-04, superseding of U-04, partial receipt MVP scope, NFR-009 secret masking, and unconditional readiness for SAD creation. |
| [**IPMS_Documentation_Audit_and_Correction_Report.md**](./archive/IPMS_Documentation_Audit_and_Correction_Report.md) | Comprehensive audit and correction report verifying UI/UX consolidation, formalizing excess-delivery workflows, and noting open PO decisions. |
| [**SRS_Draft_Review.md**](./archive/SRS_Draft_Review.md) | Independent audit review logs and recommendations that shaped the final SRS baseline. |
| [**SRS_Draft.md**](./archive/SRS_Draft.md) | Pre-baseline working draft (v1.1) incorporating initial review revisions. |
| [**SRS_OldDraft.md**](./archive/SRS_OldDraft.md) | Initial preliminary draft before IEEE 29148 alignment and formal review. |
