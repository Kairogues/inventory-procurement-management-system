# SRS Draft — Third-Round Audit Report

*Reviewer: Independent Senior Software Requirements Auditor*
*Review Date: 2026-11-14*
*SRS Version Reviewed: 1.1 – Draft (2026-11-14)*
*Focus: Technical correctness of fixes, business quality, IEEE 29148 conformance, structural assessment, wording quality*

---

## 1. Executive Summary

This third review evaluates the SRS v1.1 holistically — not just whether prior fixes were applied, but whether the document would pass professional scrutiny as a development baseline for a real application.

**Overall Assessment: The SRS is now a solid, internally consistent document suitable for a development handoff. No Critical or High issues remain from previous rounds. This round found 0 Critical, 1 High, 7 Medium, and 7 Low issues — primarily concerning business realism, IEEE standards conformance, wording precision, and a few edge cases introduced by the fixes.**

### Grading Summary

| Dimension | Grade | Comment |
|-----------|-------|---------|
| Technical Completeness | **A−** | All major system behaviors specified. A few edge cases remain. |
| Internal Consistency | **A** | RBAC matrix, API table, FRs, and DataModel are now aligned. |
| Business Realism | **B+** | Plausible as a simplified procurement system. Some real-world patterns simplified beyond what's typical (see §3). |
| IEEE 29148 Conformance | **C+** | Structure roughly follows the standard but deviates in wording conventions, section organization, and requirement language. Acceptable for an internship project; would not pass a formal IEEE compliance audit. |
| Wording Quality | **B** | Clear and readable. Uses informal language instead of IEEE "shall" keyword convention. Some inconsistent terminology. |
| Development Readiness | **A−** | A developer could implement from this document with minimal ambiguity. |

---

## 2. IEEE 29148 / Industry Standard Assessment

### 2.1 What the SRS Gets Right

- **Section structure** broadly mirrors IEEE 29148: Introduction → Overall Description → Specific Requirements (split across §3–§5) → Appendices.
- **Separation of concerns**: FRs have acceptance criteria, NFRs are separate, external interfaces have their own section.
- **Traceability support**: RBAC matrix, cross-references between FRs, and a traceability matrix placeholder exist.
- **Revision history** is included (added in v1.1).
- **Definitions and acronyms** section exists.
- **Referenced documents** are listed with file paths.

### 2.2 Where It Deviates from IEEE 29148

#### REV3-001 — Requirement Language Does Not Use IEEE "Shall" Convention
- **ID:** REV3-001
- **Location:** §3 (all FRs)
- **Category:** IEEE Conformance / Wording
- **Severity:** Medium
- **Finding:** IEEE 29148 mandates specific keywords for requirements:
  - **"shall"** = mandatory requirement
  - **"should"** = recommended but not mandatory
  - **"may"** = permitted but optional
  - **"will"** = statement of fact or future intent (not a requirement)
  - **"can"** = capability (not a requirement)

  The SRS uses none of these conventions. Instead, it uses informal language: *"Admin can create, read, update, delete items"*, *"Manager can approve"*, *"Finance Officer can set status."* In IEEE terms, "can" expresses capability, not a requirement. A formal SRS would say: *"The system shall allow the Admin to create, read, update, and delete items."*

  This matters because "can" is ambiguous — does it mean the system permits it (requirement) or the user is capable of it (assumption)? Additionally, the acceptance criteria use imperative mood (*"Registration succeeds"*, *"Password stored as bcrypt hash"*) which is fine for test cases but non-standard for requirements.

- **Impact:** For this project, the impact is low — the intent is clear to any developer. In a regulated industry (medical, aviation, defense), this would cause the SRS to fail compliance review.
- **Recommendation:** If you want IEEE conformance, adopt "shall" for all mandatory requirements: *"The system shall allow..."*. For this project's scope, the current informal style is pragmatic and readable — this is more of an awareness point than a blocking issue. Add a note to §1 stating the document uses plain language rather than IEEE keyword convention.
- **Confidence:** High

---

#### REV3-002 — Functional Requirements Are Presented as a Flat Table Rather Than Structured Subsections
- **ID:** REV3-002
- **Location:** §3
- **Category:** Structure / IEEE Conformance
- **Severity:** Low
- **Finding:** IEEE 29148 expects each functional requirement to be a subsection with structured fields (description, inputs, outputs, preconditions, postconditions, error handling). The SRS presents all 28 FRs as rows in a single Markdown table. This is compact and readable, but:
  - Long acceptance criteria in table cells are hard to read (some cells span 5+ sentences).
  - Preconditions and postconditions are not explicitly labeled.
  - Error responses are sometimes mentioned (HTTP 409, 422, 429) and sometimes omitted.
  - Cross-references (e.g., "see FR-008") work but are harder to follow in a table than in subsections.
- **Impact:** Readability suffers for complex FRs (FR-005, FR-006, FR-023 are especially dense). A developer must parse multi-sentence table cells to extract behavior.
- **Recommendation:** This is a style choice. The table format works for an SRS of this size (~30 FRs). For larger systems, structured subsections would be necessary. If the author prefers the table format, consider expanding the most complex FRs (FR-005, FR-006, FR-023) into subsections below the table while keeping simpler ones in the table.
- **Confidence:** Medium (subjective preference)

---

#### REV3-003 — NFRs Lack Verification Methods
- **ID:** REV3-003
- **Location:** §5
- **Category:** Verifiability / IEEE Conformance
- **Severity:** Medium
- **Finding:** IEEE 29148 requires that each requirement be verifiable — meaning there must be a defined method to confirm it has been met. The SRS provides verification details for some NFRs (NFR-001 has specific latency numbers, NFR-018 names specific indexes) but not for others:
  - NFR-005: *"UI follows Material-UI accessibility guidelines"* — Which guidelines? WCAG 2.1 AA? How is this verified? Automated accessibility scan? Manual checklist?
  - NFR-006: *"Clean-architecture folder layout"* — What constitutes "clean"? This is subjective and unverifiable.
  - NFR-009: *"Sensitive fields are masked or omitted"* — Verified how? Log audit? Automated test?
  - NFR-012: *"Immutable audit-log entries include system-level events and error details for forensic analysis"* — Which system-level events? All? Some? What constitutes "forensic analysis"?
- **Impact:** A tester cannot write pass/fail criteria for these NFRs. They will either be skipped or subjectively assessed.
- **Recommendation:** For each NFR, add a brief "Verification" column or statement specifying how compliance is confirmed (e.g., "Verified by: ESLint config enforces folder structure rules" or "Verified by: WCAG 2.1 AA automated scan using axe-core").
- **Confidence:** High

---

## 3. Business Realism Assessment

#### REV3-004 — `GET /export/google-sheet` Uses GET for a Write Operation
- **ID:** REV3-004
- **Location:** §4.3, FR-011
- **Category:** REST Convention / Technical Correctness
- **Severity:** High
- **Finding:** `GET /export/google-sheet` creates or updates a Google Sheet — this is a side-effect-producing operation. In REST semantics, GET must be safe (no side effects) and idempotent. Creating/updating an external resource violates this contract. Practical consequences:
  - Browser prefetching, link crawlers, or caching proxies could trigger unintended exports.
  - A user bookmarking the URL would trigger an export on every visit.
  - Retry logic for failed GETs could create duplicate sheets.
- **Evidence:** §4.3: *"GET | `/export/google-sheet` | Export inventory to Google Sheet."* FR-011: *"a Google Sheet is created or updated."*
- **Impact:** This is an HTTP semantics violation that could cause real bugs (duplicate sheet creation, unintended API calls).
- **Recommendation:** Change to `POST /export/google-sheet`. This signals that the operation has side effects and should not be cached, prefetched, or retried blindly. Keep `GET /export/csv` as-is (serving a downloadable file is a legitimate GET).
- **Confidence:** High

---

#### REV3-005 — Finance Officer Both Approves and Receives — No Separation of Duties
- **ID:** REV3-005
- **Location:** §2.3, FR-006, FR-007
- **Category:** Business Logic
- **Severity:** Medium
- **Finding:** In the current workflow, the same Finance Officer who approves a requisition (FR-006) can also mark it as Received (FR-007). In real-world procurement, separation of duties is a basic internal control — the person who authorizes a purchase should not also be the person who confirms receipt of goods. This prevents fraud (e.g., approving a fictitious purchase and then confirming fictitious receipt to siphon funds).

  For this internship project, having only 4 roles makes full separation impractical. However, the SRS should at minimum acknowledge this limitation.
- **Impact:** In a real deployment, this would be an audit finding. For a portfolio project, it's an awareness point.
- **Recommendation:** Add a note in §2.5 (Design Constraints) acknowledging that the Finance Officer role combines approval and receipt authority for simplicity, and that a production system would separate these into distinct roles (e.g., Finance Approver vs. Receiving Clerk).
- **Confidence:** High

---

#### REV3-006 — No Purchase Order or Supplier Concept Between Approval and Receipt
- **ID:** REV3-006
- **Location:** §7 (Use Cases), State Machine
- **Category:** Business Logic
- **Severity:** Low
- **Finding:** The requisition lifecycle jumps directly from `FinanceApproved` to `Received` with no intermediate state representing the actual procurement process (purchase order sent to supplier → supplier ships → goods arrive → goods inspected → receipt confirmed). The SRS scopes out supplier management (Project Brief §3), which is fine, but the gap means the system cannot track: (a) whether a PO was issued; (b) expected delivery date; (c) partial deliveries.
- **Impact:** For an MVP/portfolio project, this is acceptable. The current scope is a requisition management system, not a full procurement system. No action needed, but the author should be aware that calling this a "Procurement Management System" slightly overstates its capability.
- **Recommendation:** Consider acknowledging in §1.2 or §2.5 that the MVP covers the internal requisition and approval workflow. Supplier-facing procurement (PO generation, delivery tracking) is out of scope. Alternatively, consider renaming to "Inventory & Requisition Management System" for accuracy. This is a naming suggestion, not a requirement defect.
- **Confidence:** Medium

---

#### REV3-007 — `totalAmount` Uses Unit Price at Requisition Time — No Price Change Handling
- **ID:** REV3-007
- **Location:** FR-004, FR-007
- **Category:** Business Logic
- **Severity:** Low
- **Finding:** `totalAmount` is computed as `Σ(requestedQty × Item.unitPrice)` at creation time. If an Admin updates `Item.unitPrice` between requisition creation and receipt, the `totalAmount` does not reflect the new price. The SRS does not specify whether `totalAmount` should use: (a) price at requisition time (snapshot); (b) price at approval time; or (c) price at receipt time.
- **Impact:** For this project, this is a minor edge case. In real procurement, price at PO-issue time is locked in. Since there's no PO, the ambiguity is understandable.
- **Recommendation:** Add a note to FR-004 stating that `unitPrice` is captured at requisition creation time and is not affected by subsequent price changes. This makes the behavior explicit.
- **Confidence:** Medium

---

## 4. Technical Issues Introduced or Remaining

#### REV3-008 — Dashboard SSE Integration Gap
- **ID:** REV3-008
- **Location:** FR-010, §4.4
- **Category:** Functional Gap
- **Severity:** Medium
- **Finding:** FR-010 says the dashboard *"loads initial data from `GET /dashboard` and stays updated via SSE."* But the SSE event types (§4.4) emit raw entity events (`item.updated`, `requisition.updated`), not aggregated dashboard events. When the frontend receives an `item.updated` event, it cannot update `totalItems` or `lowStockCount` from the event payload alone — it would need to either:
  - (a) Re-fetch `GET /dashboard` after every event (defeats the purpose of SSE).
  - (b) Maintain a local count and increment/decrement (fragile, requires tracking all item creates/deletes).
  - (c) Receive a dedicated `dashboard.updated` event with pre-computed aggregates.

  None of these approaches is specified.
- **Impact:** A developer will have to choose an approach. Option (a) is simplest but wasteful. Option (c) is cleanest but requires another event type.
- **Recommendation:** Either: (a) add a `dashboard.updated` SSE event type emitted after any operation that affects aggregates; or (b) specify that the frontend re-fetches `GET /dashboard` upon receiving `item.*` events; or (c) have the SSE `item.updated` event include current aggregate counts in the payload.
- **Confidence:** High

---

#### REV3-009 — Admin Self-Deactivation Not Prevented
- **ID:** REV3-009
- **Location:** FR-023
- **Category:** Edge Case
- **Severity:** Medium
- **Finding:** FR-023 allows Admin to deactivate any user. There is no restriction preventing an Admin from deactivating their own account or the last remaining Admin account. If the sole Admin deactivates themselves, no one can manage users, reactivate accounts, or reset passwords — the system is effectively locked.
- **Impact:** System could become unrecoverable without database intervention.
- **Recommendation:** Add a guard: *"An Admin cannot deactivate their own account. The system must have at least one active Admin at all times."*
- **Confidence:** High

---

#### REV3-010 — Concurrent Approval Race Condition
- **ID:** REV3-010
- **Location:** FR-005, FR-006, NFR-004
- **Category:** Concurrency
- **Severity:** Medium
- **Finding:** NFR-004 specifies `SELECT … FOR UPDATE` for stock adjustments (quantity changes). However, no equivalent concurrency control is specified for requisition status transitions. If two Managers simultaneously try to approve/reject the same `Pending` requisition, both could read the current status as `Pending`, and both could write different outcomes. Similarly, if a Manager and the Creator act simultaneously (Manager approving while Creator cancels), the outcome is undefined.
- **Impact:** Race condition could result in a requisition in an invalid state (e.g., cancelled but also approved).
- **Recommendation:** Add to NFR-004 or a new NFR: *"Requisition status transitions must use `SELECT … FOR UPDATE` to prevent concurrent conflicting operations on the same requisition."*
- **Confidence:** High

---

#### REV3-011 — Google Sheets Export Success Response Not Specified
- **ID:** REV3-011
- **Location:** FR-011
- **Category:** Completeness
- **Severity:** Low
- **Finding:** FR-011 specifies what happens on failure (HTTP 502) but not on success. What does the Finance Officer receive? Options: (a) HTTP 200 with the Google Sheet URL in the response body; (b) HTTP 201 Created with a Location header; (c) HTTP 302 redirect to the Sheet. This is needed for the frontend to present the result to the user.
- **Impact:** Minor — a developer will likely return 200 with a URL, which is reasonable.
- **Recommendation:** Add: *"On success, the endpoint returns HTTP 200 with `{ sheetUrl: string }` containing the Google Sheet URL."*
- **Confidence:** High

---

## 5. Wording and Terminology Issues

#### REV3-012 — Inconsistent Role Name Abbreviation
- **ID:** REV3-012
- **Location:** Throughout
- **Category:** Wording Consistency
- **Severity:** Low
- **Finding:** The document alternates between "Inventory Clerk" (full name) and "Clerk" (abbreviation) without defining the shorthand. Examples:
  - §7 use case 3: *"Clerk adds line items"*
  - §7.1 transition table: *"Creator (Clerk)"*
  - FR-004: *"Inventory Clerk can submit"*
  - State machine: *"Clerk creates"*

  Similarly, "Finance Officer" is sometimes abbreviated to "Finance" in the state machine diagram.
- **Impact:** Minor readability issue. Could cause confusion if a "Procurement Officer" role name resurfaces from the Project Brief.
- **Recommendation:** Add to §1.3: *"Clerk" is used as shorthand for "Inventory Clerk" throughout this document. "Finance" is used as shorthand for "Finance Officer."*
- **Confidence:** High

---

#### REV3-013 — FR-023 Bundles 4 Distinct Requirements Into One
- **ID:** REV3-013
- **Location:** FR-023
- **Category:** Atomicity
- **Severity:** Low
- **Finding:** FR-023 combines four distinct capabilities: list users, change role, deactivate, and reactivate. IEEE 29148 recommends requirements be atomic (one requirement = one testable behavior). FR-023 is effectively four requirements with four different endpoints and four different test scenarios. This makes traceability and test planning harder.
- **Impact:** Low — a developer can parse the sub-points. A tester will need to decompose FR-023 into 4 test cases manually.
- **Recommendation:** Split into FR-023a through FR-023d, or accept the current grouping and note that testing should decompose it. This is a stylistic improvement, not a defect.
- **Confidence:** Medium

---

#### REV3-014 — Missing "Out of Scope" Section
- **ID:** REV3-014
- **Location:** §1.2 or §2.5
- **Category:** Completeness / Clarity
- **Severity:** Low
- **Finding:** The SRS specifies what the system does but does not have a consolidated "Out of Scope" section. Out-of-scope items are scattered: self-service password reset (§2.5), forecasting/charts (§2.5), supplier management (Project Brief only), CSV import (Project Brief only), QR codes (Project Brief only). A reader cannot quickly determine what was explicitly excluded.
- **Impact:** Stakeholder expectations may not be properly managed. A developer may wonder whether a missing feature is an omission or a deliberate exclusion.
- **Recommendation:** Add a §2.6 "Out of Scope" section listing all explicitly excluded features with one-line rationale:
  - Self-service password reset (mocked email)
  - Supplier/PO management (future phase)
  - CSV bulk import (future phase)
  - QR/barcode scanning (future phase)
  - Multi-tenancy (out of scope)
  - Advanced AI forecasting (out of scope)
- **Confidence:** High

---

#### REV3-015 — Revision History Entry Is Too Dense
- **ID:** REV3-015
- **Location:** Revision History table (line 10)
- **Category:** Documentation Quality
- **Severity:** Low
- **Finding:** The v1.1 revision history entry is a single run-on cell listing every change made. This is difficult to scan and defeats the purpose of a revision history (quick identification of what changed).
- **Impact:** Cosmetic — but revision history is read by people deciding whether to re-review the document.
- **Recommendation:** Keep the v1.1 entry concise: *"Comprehensive revision addressing first and second independent audits. Added FR-023–FR-030. Corrected RBAC matrix, SSE specification, NFRs, DataModel, and Requirements Register. See SRS_Draft_Review.md for full audit trail."*
- **Confidence:** Low (subjective)

---

## 6. Previous Findings — Final Disposition

All 19 second-round findings are confirmed resolved in the current document. No regressions detected.

---

## 7. Summary Table — Third-Round Findings

| ID | Severity | Category | Location | Finding (short) |
|----|----------|----------|----------|-----------------|
| REV3-001 | Medium | IEEE Conformance | §3 | No "shall" keyword convention for requirements |
| REV3-002 | Low | Structure | §3 | FRs in flat table rather than structured subsections |
| REV3-003 | Medium | Verifiability | §5 | Several NFRs lack verification methods |
| REV3-004 | High | REST / Technical | §4.3, FR-011 | `GET /export/google-sheet` performs a write — should be POST |
| REV3-005 | Medium | Business Logic | §2.3, FR-006/007 | No separation of duties between approval and receipt |
| REV3-006 | Low | Business Logic | §7 | No PO/supplier stage between approval and receipt |
| REV3-007 | Low | Business Logic | FR-004, FR-007 | `unitPrice` snapshot timing not specified |
| REV3-008 | Medium | Functional Gap | FR-010, §4.4 | Dashboard SSE update strategy not specified |
| REV3-009 | Medium | Edge Case | FR-023 | Admin self-deactivation and last-Admin-standing not prevented |
| REV3-010 | Medium | Concurrency | FR-005/006 | No concurrency control for requisition status transitions |
| REV3-011 | Low | Completeness | FR-011 | Export success response format not specified |
| REV3-012 | Low | Wording | Throughout | "Clerk" / "Finance" shorthand not defined |
| REV3-013 | Low | Atomicity | FR-023 | Bundles 4 distinct requirements into one |
| REV3-014 | Low | Completeness | §1.2 / §2.5 | No consolidated "Out of Scope" section |
| REV3-015 | Low | Documentation | Revision History | v1.1 entry too dense to scan |

**Totals: 0 Critical, 1 High, 6 Medium, 8 Low.**

---

## 8. Is This SRS Industry-Standard for a Real App?

### Honest Assessment

**For an internship/portfolio project:** This SRS is **above average**. Most internship projects have no SRS at all, or a vague one-page description. This document has 30 functional requirements with acceptance criteria, a complete RBAC matrix, an SSE event specification, a state machine diagram, and cross-referenced supporting documents. It would impress reviewers and demonstrate requirements engineering skill.

**For a startup MVP:** This SRS is **adequate**. Startups typically use lighter formats (user stories, PRDs), but the coverage here is comprehensive enough to hand to a small development team. The main gaps — no use case diagrams, no sequence diagrams, no UI wireframes — are normal for this stage.

**For a mid-size enterprise project:** This SRS would need **significant additional work**:
- Formal "shall" language throughout
- Detailed use cases with preconditions, postconditions, main flows, and exception flows
- UI wireframes or mockups
- Sequence diagrams for complex interactions (approval workflow, SSE event flow)
- Non-functional requirements with quantifiable verification criteria
- Complete traceability matrix (not a placeholder)
- Formal sign-off section with stakeholder signatures
- Change control process

**For a regulated industry (healthcare, finance, defense):** This would **not pass**. Regulated environments require formal verification matrices, safety/risk analysis, compliance mapping, and strict IEEE/ISO keyword conventions.

### Bottom Line

This SRS is well-suited for its actual context: an internship project that demonstrates professional engineering practices. It is significantly better than what most projects at this level produce, and is detailed enough to serve as a real development baseline. The remaining findings are refinements, not blockers.

---

*End of Third-Round Audit Report*

*Recommended action: Fix REV3-004 (change GET to POST for Google Sheets export — this is a real bug) and REV3-009/REV3-010 (concurrency guards — these prevent actual data corruption). The remaining findings can be addressed at the author's discretion.*
