/**
 * IPMS Low-Fidelity Wireframe Prototype Application
 * Conforming strictly to: SAD v1.0, SRS v1.5, DecisionLog v1.5, DataModel v1.5
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. MOCK DATASETS & STATE
  // ==========================================================================

  const ROLES = {
    ADMIN: 'Admin',
    CLERK: 'Inventory Clerk',
    MANAGER: 'Manager',
    FINANCE: 'Finance Officer'
  };

  const USERS = {
    admin: {
      id: 'usr-admin-01',
      fullName: 'Alex Morgan',
      email: 'alex.morgan@company.internal',
      role: ROLES.ADMIN,
      initials: 'AM',
      isActive: true,
      mustChangePassword: false
    },
    clerk: {
      id: 'usr-clerk-01',
      fullName: 'Sam Taylor',
      email: 'sam.taylor@company.internal',
      role: ROLES.CLERK,
      initials: 'ST',
      isActive: true,
      mustChangePassword: false
    },
    manager: {
      id: 'usr-mgr-01',
      fullName: 'Jordan Lee',
      email: 'jordan.lee@company.internal',
      role: ROLES.MANAGER,
      initials: 'JL',
      isActive: true,
      mustChangePassword: false
    },
    finance: {
      id: 'usr-fin-01',
      fullName: 'Pat Chen',
      email: 'pat.chen@company.internal',
      role: ROLES.FINANCE,
      initials: 'PC',
      isActive: true,
      mustChangePassword: false
    }
  };

  let state = {
    currentRoleKey: 'clerk', // Default demo role: Clerk to show procurement focus
    currentScreen: 'dashboard',
    selectedItemId: 'item-1',
    selectedRequisitionId: 'req-1',
    selectedAuditId: 'aud-1',
    requisitionsTab: 'my-reqs', // 'my-reqs', 'all-reqs', 'pending-mgr', 'pending-fin', 'reviewed'
    showAnnotations: true,
    sseStatus: 'connected', // 'connected', 'reconnecting', 'disconnected'
    sidebarCollapsed: false,
    mobileSidebarOpen: false,

    // Filters
    itemFilter: {
      search: '',
      location: 'ALL',
      stockStatus: 'ALL', // 'ALL', 'low', 'normal'
      catalogStatus: 'ACTIVE' // 'ACTIVE', 'INACTIVE', 'ALL'
    },
    reqFilter: {
      search: '',
      status: 'ALL'
    },
    userFilter: {
      search: '',
      role: 'ALL',
      status: 'ALL'
    },
    auditFilter: {
      entity: 'ALL',
      action: 'ALL',
      actor: ''
    },

    // New requisition draft (in-memory while on SCR-REQ-02)
    newReqLines: [
      { itemId: 'item-1', requestedQty: 10 },
      { itemId: 'item-3', requestedQty: 4 }
    ],

    // Mock Catalog Items
    items: [
      {
        id: 'item-1',
        sku: 'SKU-A1098',
        name: 'Industrial Ball Valve 2-Inch',
        description: 'Cast stainless steel 316 ball valve with flanged end connections for heavy steam and fluid lines.',
        location: 'Aisle A-01, Bin 12',
        quantity: 12,
        unitPrice: 45.0,
        reorderThreshold: 25,
        isActive: true,
        createdAt: '2026-08-10 10:00',
        updatedAt: '2026-11-14 16:30'
      },
      {
        id: 'item-2',
        sku: 'SKU-B2045',
        name: 'High-Pressure Hydraulic Seal Ring',
        description: 'Viton 75 Shore rubber O-ring seal with high heat and chemical degradation resistance.',
        location: 'Aisle B-04, Shelf 3',
        quantity: 150,
        unitPrice: 8.5,
        reorderThreshold: 50,
        isActive: true,
        createdAt: '2026-08-12 11:20',
        updatedAt: '2026-11-10 09:15'
      },
      {
        id: 'item-3',
        sku: 'SKU-C3012',
        name: 'Centrifugal Water Pump Impeller',
        description: 'Enclosed bronze replacement impeller for multi-stage centrifugal boiler feedwater pumps.',
        location: 'Aisle C-02, Bay 1',
        quantity: 4,
        unitPrice: 320.0,
        reorderThreshold: 10,
        isActive: true,
        createdAt: '2026-08-15 14:00',
        updatedAt: '2026-11-15 08:45'
      },
      {
        id: 'item-4',
        sku: 'SKU-D4099',
        name: 'Safety Pressure Relief Valve',
        description: 'Direct-acting spring loaded pressure relief valve set at 150 PSI.',
        location: 'Aisle A-03, Bin 05',
        quantity: 45,
        unitPrice: 110.0,
        reorderThreshold: 20,
        isActive: true,
        createdAt: '2026-08-20 09:30',
        updatedAt: '2026-11-01 13:20'
      },
      {
        id: 'item-5',
        sku: 'SKU-E5120',
        name: 'Heavy-Duty Conveyor Belt Joint',
        description: 'Mechanical fastener kit for 1200mm rubber conveyor belts.',
        location: 'Aisle D-01, Floor Pallet',
        quantity: 18,
        unitPrice: 75.0,
        reorderThreshold: 15,
        isActive: true,
        createdAt: '2026-09-01 10:00',
        updatedAt: '2026-10-28 11:00'
      },
      {
        id: 'item-6',
        sku: 'SKU-F6033',
        name: 'Digital Flow Meter Sensor Unit',
        description: 'Electromagnetic flow sensor with remote 4-20mA telemetry output.',
        location: 'Aisle E-05, Secure Cabinet',
        quantity: 3,
        unitPrice: 480.0,
        reorderThreshold: 5,
        isActive: true,
        createdAt: '2026-09-10 15:30',
        updatedAt: '2026-11-14 17:00'
      },
      {
        id: 'item-7',
        sku: 'SKU-G7104',
        name: 'Flange Gasket Kit 4-Inch (Pack of 10)',
        description: 'Non-asbestos compressed fiber sheet ring gaskets.',
        location: 'Aisle B-02, Shelf 1',
        quantity: 85,
        unitPrice: 24.0,
        reorderThreshold: 30,
        isActive: true,
        createdAt: '2026-09-18 10:45',
        updatedAt: '2026-11-02 14:10'
      },
      {
        id: 'item-8',
        sku: 'SKU-H8290',
        name: 'Stainless Steel Hex Bolt M12 (Box 100)',
        description: 'Grade 316 metric coarse threaded hex head fastener bolts.',
        location: 'Aisle F-03, Bin 18',
        quantity: 240,
        unitPrice: 18.5,
        reorderThreshold: 80,
        isActive: true,
        createdAt: '2026-09-25 16:00',
        updatedAt: '2026-11-12 11:30'
      },
      {
        id: 'item-9',
        sku: 'SKU-I9011',
        name: 'Pneumatic Air Filter Regulator',
        description: 'Modular particulate filter and precision pressure control regulator unit.',
        location: 'Aisle C-04, Shelf 2',
        quantity: 22,
        unitPrice: 65.0,
        reorderThreshold: 15,
        isActive: true,
        createdAt: '2026-10-05 08:30',
        updatedAt: '2026-11-08 15:00'
      },
      {
        id: 'item-10',
        sku: 'SKU-J0142',
        name: 'Legacy Obsolete Pipe Fitting [Decommissioned]',
        description: 'Old threaded iron coupling fitting retired from active pipeline service.',
        location: 'Aisle Z-99, Archive',
        quantity: 0,
        unitPrice: 15.0,
        reorderThreshold: 10,
        isActive: false, // Soft-deleted
        createdAt: '2026-07-01 09:00',
        updatedAt: '2026-10-01 12:00'
      }
    ],

    // Mock Requisitions
    requisitions: [
      {
        id: 'req-1',
        code: 'REQ-2026-0104',
        creatorId: 'usr-clerk-01',
        creatorName: 'Sam Taylor',
        creatorRole: ROLES.CLERK,
        createdAt: '2026-11-15 09:30',
        status: 'Pending',
        totalAmount: 4850.0,
        items: [
          { itemId: 'item-1', sku: 'SKU-A1098', name: 'Industrial Ball Valve 2-Inch', snapshotUnitPrice: 45.0, requestedQty: 30, approvedQty: 30, receivedQty: null },
          { itemId: 'item-3', sku: 'SKU-C3012', name: 'Centrifugal Water Pump Impeller', snapshotUnitPrice: 320.0, requestedQty: 10, approvedQty: 10, receivedQty: null },
          { itemId: 'item-6', sku: 'SKU-F6033', name: 'Digital Flow Meter Sensor Unit', snapshotUnitPrice: 480.0, requestedQty: 3, approvedQty: 3, receivedQty: null }
        ],
        timeline: [
          { id: 'tl-101', eventType: 'SUBMITTED', actorName: 'Sam Taylor', actorRole: 'Inventory Clerk', timestamp: '2026-11-15 09:30', desc: 'Requisition submitted directly to Pending status (No draft workflow, Decision U-01).' }
        ],
        currentRejectionReason: null,
        rejectionHistory: []
      },
      {
        id: 'req-2',
        code: 'REQ-2026-0098',
        creatorId: 'usr-clerk-01',
        creatorName: 'Sam Taylor',
        creatorRole: ROLES.CLERK,
        createdAt: '2026-11-14 14:15',
        status: 'ManagerApproved',
        totalAmount: 1270.0,
        items: [
          { itemId: 'item-4', sku: 'SKU-D4099', name: 'Safety Pressure Relief Valve', snapshotUnitPrice: 110.0, requestedQty: 8, approvedQty: 8, receivedQty: null },
          { itemId: 'item-9', sku: 'SKU-I9011', name: 'Pneumatic Air Filter Regulator', snapshotUnitPrice: 65.0, requestedQty: 6, approvedQty: 6, receivedQty: null }
        ],
        timeline: [
          { id: 'tl-201', eventType: 'SUBMITTED', actorName: 'Sam Taylor', actorRole: 'Inventory Clerk', timestamp: '2026-11-14 14:15', desc: 'Requisition submitted.' },
          { id: 'tl-202', eventType: 'MANAGER_APPROVED', actorName: 'Jordan Lee', actorRole: 'Manager', timestamp: '2026-11-14 16:30', desc: 'Operational need verified. Approved without quantity changes (Decision UD-03).' }
        ],
        currentRejectionReason: null,
        rejectionHistory: []
      },
      {
        id: 'req-3',
        code: 'REQ-2026-0095',
        creatorId: 'usr-clerk-01',
        creatorName: 'Sam Taylor',
        creatorRole: ROLES.CLERK,
        createdAt: '2026-11-13 11:00',
        status: 'FinanceApproved',
        totalAmount: 3200.0,
        items: [
          { itemId: 'item-3', sku: 'SKU-C3012', name: 'Centrifugal Water Pump Impeller', snapshotUnitPrice: 320.0, requestedQty: 10, approvedQty: 10, receivedQty: null }
        ],
        timeline: [
          { id: 'tl-301', eventType: 'SUBMITTED', actorName: 'Sam Taylor', actorRole: 'Inventory Clerk', timestamp: '2026-11-13 11:00', desc: 'Requisition submitted.' },
          { id: 'tl-302', eventType: 'MANAGER_APPROVED', actorName: 'Jordan Lee', actorRole: 'Manager', timestamp: '2026-11-13 14:00', desc: 'Manager operational approval granted.' },
          { id: 'tl-303', eventType: 'FINANCE_APPROVED', actorName: 'Pat Chen', actorRole: 'Finance Officer', timestamp: '2026-11-13 16:45', desc: 'Fiscal commitment authorized. Order released for vendor dispatch and dock receipt.' }
        ],
        currentRejectionReason: null,
        rejectionHistory: []
      },
      {
        id: 'req-4',
        code: 'REQ-2026-0089',
        creatorId: 'usr-clerk-01',
        creatorName: 'Sam Taylor',
        creatorRole: ROLES.CLERK,
        createdAt: '2026-11-12 08:45',
        status: 'ExcessPendingManager',
        totalAmount: 2250.0,
        items: [
          { itemId: 'item-1', sku: 'SKU-A1098', name: 'Industrial Ball Valve 2-Inch', snapshotUnitPrice: 45.0, requestedQty: 50, approvedQty: 50, receivedQty: null, deliveredQty: 60 }
        ],
        excessDetails: {
          excessUnits: 10,
          excessFinancialCommitment: 450.0,
          dockNote: 'Vendor delivered 1 extra crate (60 units vs 50 approved).'
        },
        timeline: [
          { id: 'tl-401', eventType: 'SUBMITTED', actorName: 'Sam Taylor', timestamp: '2026-11-12 08:45', desc: 'Requisition submitted.' },
          { id: 'tl-402', eventType: 'MANAGER_APPROVED', actorName: 'Jordan Lee', timestamp: '2026-11-12 10:15', desc: 'Manager approved.' },
          { id: 'tl-403', eventType: 'FINANCE_APPROVED', actorName: 'Pat Chen', timestamp: '2026-11-12 11:30', desc: 'Finance approved.' },
          { id: 'tl-404', eventType: 'EXCESS_REQUESTED', actorName: 'Sam Taylor', timestamp: '2026-11-14 13:20', desc: 'Physical shipment arrived with 60 units (+10 excess). Step 1 excess authorization initiated (Decision U-05.2).' }
        ],
        currentRejectionReason: null,
        rejectionHistory: []
      },
      {
        id: 'req-5',
        code: 'REQ-2026-0084',
        creatorId: 'usr-clerk-01',
        creatorName: 'Sam Taylor',
        creatorRole: ROLES.CLERK,
        createdAt: '2026-11-11 10:30',
        status: 'ExcessRejected',
        totalAmount: 1600.0,
        items: [
          { itemId: 'item-3', sku: 'SKU-C3012', name: 'Centrifugal Water Pump Impeller', snapshotUnitPrice: 320.0, requestedQty: 5, approvedQty: 5, receivedQty: null, deliveredQty: 7 }
        ],
        excessDetails: {
          excessUnits: 2,
          excessFinancialCommitment: 640.0,
          dockNote: 'Carrier delivered 7 impellers instead of 5.'
        },
        timeline: [
          { id: 'tl-501', eventType: 'SUBMITTED', actorName: 'Sam Taylor', timestamp: '2026-11-11 10:30', desc: 'Submitted.' },
          { id: 'tl-502', eventType: 'MANAGER_APPROVED', actorName: 'Jordan Lee', timestamp: '2026-11-11 13:00', desc: 'Manager approved.' },
          { id: 'tl-503', eventType: 'FINANCE_APPROVED', actorName: 'Pat Chen', timestamp: '2026-11-11 14:15', desc: 'Finance approved.' },
          { id: 'tl-504', eventType: 'EXCESS_REQUESTED', actorName: 'Sam Taylor', timestamp: '2026-11-13 09:10', desc: 'Excess delivery recorded at loading dock (+2 units).' },
          { id: 'tl-505', eventType: 'EXCESS_MANAGER_APPROVED', actorName: 'Jordan Lee', timestamp: '2026-11-13 11:00', desc: 'Manager authorized operational necessity.' },
          { id: 'tl-506', eventType: 'EXCESS_REJECTED', actorName: 'Pat Chen', timestamp: '2026-11-13 14:30', rejectionReason: 'Q4 pump maintenance budget cap reached; surplus 2 units must be refused at dock.', desc: 'Finance rejected excess commitment. Under Decision UD-01, Clerk may receive originally approved 5 units at dock.' }
        ],
        currentRejectionReason: 'Q4 pump maintenance budget cap reached; surplus 2 units must be refused at dock.',
        rejectionHistory: [
          { stage: 'Finance', rejectedBy: 'Pat Chen', rejectedAt: '2026-11-13 14:30', rejectionReason: 'Q4 pump maintenance budget cap reached; surplus 2 units must be refused at dock.' }
        ]
      },
      {
        id: 'req-6',
        code: 'REQ-2026-0077',
        creatorId: 'usr-clerk-01',
        creatorName: 'Sam Taylor',
        creatorRole: ROLES.CLERK,
        createdAt: '2026-11-09 13:00',
        status: 'Received',
        totalAmount: 850.0,
        items: [
          { itemId: 'item-2', sku: 'SKU-B2045', name: 'High-Pressure Hydraulic Seal Ring', snapshotUnitPrice: 8.5, requestedQty: 100, approvedQty: 100, receivedQty: 100 }
        ],
        timeline: [
          { id: 'tl-601', eventType: 'SUBMITTED', actorName: 'Sam Taylor', timestamp: '2026-11-09 13:00', desc: 'Requisition submitted.' },
          { id: 'tl-602', eventType: 'MANAGER_APPROVED', actorName: 'Jordan Lee', timestamp: '2026-11-09 15:30', desc: 'Manager approved.' },
          { id: 'tl-603', eventType: 'FINANCE_APPROVED', actorName: 'Pat Chen', timestamp: '2026-11-10 09:45', desc: 'Finance approved.' },
          { id: 'tl-604', eventType: 'RECEIVED', actorName: 'Sam Taylor', timestamp: '2026-11-12 11:15', desc: 'Physical goods verified and received into active stock.' }
        ],
        currentRejectionReason: null,
        rejectionHistory: []
      },
      {
        id: 'req-7',
        code: 'REQ-2026-0070',
        creatorId: 'usr-clerk-01',
        creatorName: 'Sam Taylor',
        creatorRole: ROLES.CLERK,
        createdAt: '2026-11-08 09:10',
        status: 'Rejected',
        totalAmount: 6400.0,
        items: [
          { itemId: 'item-3', sku: 'SKU-C3012', name: 'Centrifugal Water Pump Impeller', snapshotUnitPrice: 320.0, requestedQty: 20, approvedQty: 20, receivedQty: null }
        ],
        currentRejectionReason: 'Quantity exceeds allocated monthly maintenance budget. Please revise and request maximum 10 units instead of 20.',
        rejectionHistory: [
          { stage: 'Manager', rejectedBy: 'Jordan Lee', rejectedAt: '2026-11-08 11:30', rejectionReason: 'Quantity exceeds allocated monthly maintenance budget. Please revise and request maximum 10 units instead of 20.' }
        ],
        timeline: [
          { id: 'tl-701', eventType: 'SUBMITTED', actorName: 'Sam Taylor', timestamp: '2026-11-08 09:10', desc: 'Requisition submitted.' },
          { id: 'tl-702', eventType: 'MANAGER_REJECTED', actorName: 'Jordan Lee', timestamp: '2026-11-08 11:30', rejectionReason: 'Quantity exceeds allocated monthly maintenance budget. Please revise and request maximum 10 units instead of 20.', desc: 'Reviewer rejected. Terminal state. Reviewers cannot edit quantities; requester must submit new requisition (Decision UD-03).' }
        ]
      },
      {
        id: 'req-8',
        code: 'REQ-2026-0065',
        creatorId: 'usr-clerk-01',
        creatorName: 'Sam Taylor',
        creatorRole: ROLES.CLERK,
        createdAt: '2026-11-06 15:00',
        status: 'Cancelled',
        totalAmount: 340.0,
        items: [
          { itemId: 'item-8', sku: 'SKU-H8290', name: 'Stainless Steel Hex Bolt M12', snapshotUnitPrice: 18.5, requestedQty: 18, approvedQty: 18, receivedQty: null }
        ],
        timeline: [
          { id: 'tl-801', eventType: 'SUBMITTED', actorName: 'Sam Taylor', timestamp: '2026-11-06 15:00', desc: 'Requisition submitted.' },
          { id: 'tl-802', eventType: 'CANCELLED', actorName: 'Sam Taylor', timestamp: '2026-11-06 16:20', desc: 'Creator cancelled own pending requisition (Decision U-01, FR-024).' }
        ],
        currentRejectionReason: null,
        rejectionHistory: []
      }
    ],

    // Mock Users Directory (SCR-USER-01)
    usersList: [
      { id: 'usr-admin-01', fullName: 'Alex Morgan', email: 'alex.morgan@company.internal', role: ROLES.ADMIN, isActive: true, mustChangePassword: false, createdAt: '2026-01-10' },
      { id: 'usr-clerk-01', fullName: 'Sam Taylor', email: 'sam.taylor@company.internal', role: ROLES.CLERK, isActive: true, mustChangePassword: false, createdAt: '2026-02-15' },
      { id: 'usr-mgr-01', fullName: 'Jordan Lee', email: 'jordan.lee@company.internal', role: ROLES.MANAGER, isActive: true, mustChangePassword: false, createdAt: '2026-03-01' },
      { id: 'usr-fin-01', fullName: 'Pat Chen', email: 'pat.chen@company.internal', role: ROLES.FINANCE, isActive: true, mustChangePassword: false, createdAt: '2026-03-12' },
      { id: 'usr-clerk-02', fullName: 'Emma Watson', email: 'emma.watson@company.internal', role: ROLES.CLERK, isActive: true, mustChangePassword: true, createdAt: '2026-11-01' },
      { id: 'usr-clerk-03', fullName: 'David Miller', email: 'david.miller@company.internal', role: ROLES.CLERK, isActive: false, mustChangePassword: false, createdAt: '2026-04-20' }
    ],

    // Mock Audit Logs (SCR-AUDIT-01)
    auditLogs: [
      {
        id: 'aud-1',
        timestamp: '2026-11-15 09:30:14',
        performedByName: 'Sam Taylor',
        performedByRole: ROLES.CLERK,
        entity: 'Requisition',
        entityId: 'REQ-2026-0104',
        action: 'CREATE',
        detailsSummary: 'Status set to Pending with 3 line items (Total: $4,850.00)',
        details: {
          eventType: 'SUBMITTED',
          previousStatus: null,
          newStatus: 'Pending',
          totalAmount: 4850.0,
          lineItemCount: 3,
          items: [
            { sku: 'SKU-A1098', requestedQty: 30, snapshotUnitPrice: 45.0 },
            { sku: 'SKU-C3012', requestedQty: 10, snapshotUnitPrice: 320.0 },
            { sku: 'SKU-F6033', requestedQty: 3, snapshotUnitPrice: 480.0 }
          ]
        }
      },
      {
        id: 'aud-2',
        timestamp: '2026-11-14 16:30:02',
        performedByName: 'Jordan Lee',
        performedByRole: ROLES.MANAGER,
        entity: 'Requisition',
        entityId: 'REQ-2026-0098',
        action: 'APPROVE',
        detailsSummary: 'Status changed: Pending -> ManagerApproved',
        details: {
          eventType: 'MANAGER_APPROVED',
          previousStatus: 'Pending',
          newStatus: 'ManagerApproved',
          reviewerNote: 'Operational requirement vetted.'
        }
      },
      {
        id: 'aud-3',
        timestamp: '2026-11-14 14:10:55',
        performedByName: 'Alex Morgan',
        performedByRole: ROLES.ADMIN,
        entity: 'Item',
        entityId: 'SKU-A1098',
        action: 'ADJUST',
        detailsSummary: 'Quantity adjusted: 22 -> 12 (-10 units)',
        details: {
          adjustment: -10,
          previousQuantity: 22,
          resultingQuantity: 12,
          reason: 'Physical count correction during weekly aisle cycle audit.'
        }
      },
      {
        id: 'aud-4',
        timestamp: '2026-11-13 16:45:10',
        performedByName: 'Pat Chen',
        performedByRole: ROLES.FINANCE,
        entity: 'Requisition',
        entityId: 'REQ-2026-0095',
        action: 'APPROVE',
        detailsSummary: 'Status changed: ManagerApproved -> FinanceApproved',
        details: {
          eventType: 'FINANCE_APPROVED',
          previousStatus: 'ManagerApproved',
          newStatus: 'FinanceApproved',
          approvedBudgetCode: 'MNT-PUMP-2026'
        }
      },
      {
        id: 'aud-5',
        timestamp: '2026-11-13 14:30:40',
        performedByName: 'Pat Chen',
        performedByRole: ROLES.FINANCE,
        entity: 'Requisition',
        entityId: 'REQ-2026-0084',
        action: 'EXCESS_REJECT',
        detailsSummary: 'Excess delivery rejected; status changed to ExcessRejected',
        details: {
          eventType: 'EXCESS_REJECTED',
          previousStatus: 'ExcessPendingFinance',
          newStatus: 'ExcessRejected',
          excessUnitsRejected: 2,
          rejectionReason: 'Q4 pump maintenance budget cap reached; surplus 2 units must be refused at dock.'
        }
      },
      {
        id: 'aud-6',
        timestamp: '2026-11-11 11:20:00',
        performedByName: 'Alex Morgan',
        performedByRole: ROLES.ADMIN,
        entity: 'User',
        entityId: 'usr-clerk-02',
        action: 'RESET_PASSWORD',
        detailsSummary: 'Generated single-use 24h temporary password for Emma Watson (mustChangePassword=true)',
        details: {
          targetUser: 'Emma Watson',
          procedure: 'Internal identity verification completed',
          temporaryPasswordExpires: '24 hours from generation',
          credentialMasked: 'Credentials never emitted to audit logs (NFR-009)'
        }
      }
    ],

    // Notifications (DRAWER-NOTIF-01)
    notifications: [
      {
        id: 'notif-1',
        type: 'LowStockAlert',
        entityType: 'Item',
        entityId: 'item-1',
        message: 'LOW STOCK ALERT: Industrial Ball Valve 2-Inch (SKU-A1098) on-hand quantity (12) crossed below reorder threshold (25).',
        timestamp: '15 mins ago',
        read: false
      },
      {
        id: 'notif-2',
        type: 'ApprovalResult',
        entityType: 'Requisition',
        entityId: 'req-7',
        message: 'Requisition REQ-2026-0070 was REJECTED by Jordan Lee: "Quantity exceeds allocated monthly maintenance budget."',
        timestamp: '2 hours ago',
        read: false
      },
      {
        id: 'notif-3',
        type: 'ApprovalResult',
        entityType: 'Requisition',
        entityId: 'req-3',
        message: 'Requisition REQ-2026-0095 has been fully approved by Finance Officer Pat Chen and is ready for Goods Receipt.',
        timestamp: 'Yesterday',
        read: false
      },
      {
        id: 'notif-4',
        type: 'RequisitionUpdate',
        entityType: 'Requisition',
        entityId: 'req-4',
        message: 'Excess delivery recorded at loading dock for REQ-2026-0089 (+10 units); requires Manager & Finance authorization.',
        timestamp: 'Nov 14',
        read: true
      }
    ]
  };

  // Helper: Get active user object
  function getCurrentUser() {
    return USERS[state.currentRoleKey];
  }

  // ==========================================================================
  // 2. CORE NAVIGATION & ROLE SWITCHING ENGINE
  // ==========================================================================

  function switchRole(roleKey) {
    if (!USERS[roleKey]) return;
    state.currentRoleKey = roleKey;
    const user = getCurrentUser();

    // Update Role Switcher UI buttons in top bar
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === roleKey);
    });

    // Update Topbar User Identity
    const avatarEl = document.getElementById('topbar-avatar');
    const nameEl = document.getElementById('topbar-fullname');
    const roleTagEl = document.getElementById('topbar-role-tag');
    if (avatarEl) avatarEl.textContent = user.initials;
    if (nameEl) nameEl.textContent = user.fullName;
    if (roleTagEl) roleTagEl.textContent = user.role;

    // Apply RBAC Navigation Visibility
    updateSidebarRBAC();

    // Reset default requisition tabs based on role (Decision U-09)
    if (user.role === ROLES.CLERK) {
      state.requisitionsTab = 'my-reqs';
    } else if (user.role === ROLES.MANAGER) {
      state.requisitionsTab = 'pending-mgr';
    } else if (user.role === ROLES.FINANCE) {
      state.requisitionsTab = 'pending-fin';
    } else if (user.role === ROLES.ADMIN) {
      state.requisitionsTab = 'all-reqs';
    }

    // Role Guard Check: If on a screen inaccessible to new role, redirect to dashboard
    const adminOnlyScreens = ['users', 'audit-logs'];
    const clerkOnlyScreens = ['requisition-new', 'requisition-receipt'];

    if (adminOnlyScreens.includes(state.currentScreen) && user.role !== ROLES.ADMIN) {
      showToast('Role Guard: Screen restricted to Admin. Redirected to Dashboard.', 'info');
      navigateTo('dashboard');
    } else if (clerkOnlyScreens.includes(state.currentScreen) && user.role !== ROLES.CLERK) {
      showToast('Role Guard: Screen restricted to Inventory Clerk. Redirected to Dashboard.', 'info');
      navigateTo('dashboard');
    } else {
      // Re-render current screen with new role permissions
      renderActiveScreen();
    }

    showToast(`Role switched to: ${user.fullName} (${user.role})`, 'info');
  }

  function updateSidebarRBAC() {
    const user = getCurrentUser();

    // Admin Group Items (User Management & Audit Logs)
    const adminNavSection = document.getElementById('nav-section-admin');
    if (adminNavSection) {
      adminNavSection.style.display = (user.role === ROLES.ADMIN) ? 'block' : 'none';
    }

    // Update Badges on Sidebar
    const lowStockChip = document.getElementById('sidebar-low-stock-badge');
    const lowStockCount = state.items.filter(i => i.isActive && i.quantity < i.reorderThreshold).length;
    if (lowStockChip) {
      lowStockChip.textContent = lowStockCount;
      lowStockChip.style.display = lowStockCount > 0 ? 'inline-block' : 'none';
    }

    const reqBadge = document.getElementById('sidebar-req-badge');
    if (reqBadge) {
      let pendingCount = 0;
      if (user.role === ROLES.MANAGER) {
        pendingCount = state.requisitions.filter(r => r.status === 'Pending').length;
      } else if (user.role === ROLES.FINANCE) {
        pendingCount = state.requisitions.filter(r => r.status === 'ManagerApproved').length;
      } else if (user.role === ROLES.CLERK) {
        pendingCount = state.requisitions.filter(r => ['FinanceApproved', 'ExcessApproved', 'ExcessRejected'].includes(r.status)).length;
      }

      if (pendingCount > 0) {
        reqBadge.textContent = pendingCount;
        reqBadge.style.display = 'inline-block';
      } else {
        reqBadge.style.display = 'none';
      }
    }
  }

  function navigateTo(screenId, params = {}) {
    // Check if auth screens
    const isAuthScreen = screenId.startsWith('auth-');

    const authLayout = document.getElementById('auth-layout');
    const appShell = document.getElementById('app-shell');

    if (isAuthScreen) {
      if (authLayout) authLayout.style.display = 'flex';
      if (appShell) appShell.style.display = 'none';
    } else {
      if (authLayout) authLayout.style.display = 'none';
      if (appShell) appShell.style.display = 'flex';
    }

    // Update screen state
    state.currentScreen = screenId;
    if (params.selectedItemId) state.selectedItemId = params.selectedItemId;
    if (params.selectedRequisitionId) state.selectedRequisitionId = params.selectedRequisitionId;
    if (params.selectedAuditId) state.selectedAuditId = params.selectedAuditId;

    // Update Quick Jump Select
    const quickJumpSelect = document.getElementById('demo-quick-jump');
    if (quickJumpSelect) quickJumpSelect.value = screenId;

    // Update Active Nav Item in Sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.screen === screenId);
    });

    // Update Breadcrumbs
    updateBreadcrumbs(screenId);

    // Hide any open drawer on standard screen navigation unless specifically preserved
    if (!params.keepDrawerOpen) {
      closeAllDrawers();
    }

    // Render Target Screen
    renderActiveScreen();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateBreadcrumbs(screenId) {
    const container = document.getElementById('breadcrumbs-trail');
    if (!container) return;

    let crumbs = [{ label: 'Home', screen: 'dashboard' }];

    switch (screenId) {
      case 'dashboard':
        crumbs.push({ label: 'Operational Dashboard', active: true });
        break;
      case 'items':
        crumbs.push({ label: 'Item Catalog & Inventory', active: true });
        break;
      case 'requisitions':
        crumbs.push({ label: 'Purchase Requisitions', active: true });
        break;
      case 'requisition-new':
        crumbs.push({ label: 'Requisitions', screen: 'requisitions' });
        crumbs.push({ label: 'Create Purchase Requisition', active: true });
        break;
      case 'requisition-detail':
        crumbs.push({ label: 'Requisitions', screen: 'requisitions' });
        const req = state.requisitions.find(r => r.id === state.selectedRequisitionId);
        crumbs.push({ label: req ? req.code : 'Requisition Detail', active: true });
        break;
      case 'requisition-receipt':
        crumbs.push({ label: 'Requisitions', screen: 'requisitions' });
        const reqRc = state.requisitions.find(r => r.id === state.selectedRequisitionId);
        crumbs.push({ label: reqRc ? `${reqRc.code} (Receipt)` : 'Goods Receipt', active: true });
        break;
      case 'users':
        crumbs.push({ label: 'User Governance & Access', active: true });
        break;
      case 'audit-logs':
        crumbs.push({ label: 'System Audit Trail', active: true });
        break;
      default:
        crumbs.push({ label: screenId, active: true });
    }

    container.innerHTML = crumbs.map((c, index) => {
      if (c.active) {
        return `<span class="breadcrumb-item active">${c.label}</span>`;
      } else {
        return `<span class="breadcrumb-item" onclick="IPMS.navigateTo('${c.screen}')">${c.label}</span><span class="breadcrumb-separator">/</span>`;
      }
    }).join('');
  }

  function renderActiveScreen() {
    // Hide all screens
    document.querySelectorAll('.screen-container').forEach(el => el.classList.remove('active-screen'));

    const screenEl = document.getElementById(`screen-${state.currentScreen}`);
    if (screenEl) {
      screenEl.classList.add('active-screen');
    }

    // Call screen-specific render methods
    switch (state.currentScreen) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'items':
        renderItemsCatalog();
        break;
      case 'requisitions':
        renderRequisitionsList();
        break;
      case 'requisition-new':
        renderRequisitionCreate();
        break;
      case 'requisition-detail':
        renderRequisitionDetail();
        break;
      case 'requisition-receipt':
        renderGoodsReceipt();
        break;
      case 'users':
        renderUsersList();
        break;
      case 'audit-logs':
        renderAuditLogs();
        break;
    }
  }

  // ==========================================================================
  // 3. SCREEN RENDERERS
  // ==========================================================================

  // --- SCR-DASH-01: Real-Time Operational Dashboard ---
  function renderDashboard() {
    const user = getCurrentUser();

    // 1. Calculate Metrics
    const totalItems = state.items.filter(i => i.isActive).length;
    const lowStockItems = state.items.filter(i => i.isActive && i.quantity < i.reorderThreshold);
    const lowStockCount = lowStockItems.length;
    const activeReqsCount = state.requisitions.filter(r => !['Received', 'Rejected', 'Cancelled'].includes(r.status)).length;

    // Role-tailored 4th card
    let roleActionTitle = 'Pending Action';
    let roleActionValue = 0;
    let roleActionSubtitle = '';

    if (user.role === ROLES.MANAGER) {
      roleActionTitle = 'Pending Manager Approval';
      roleActionValue = state.requisitions.filter(r => r.status === 'Pending').length;
      roleActionSubtitle = 'Awaiting your operational review';
    } else if (user.role === ROLES.FINANCE) {
      roleActionTitle = 'Pending Finance Approval';
      roleActionValue = state.requisitions.filter(r => r.status === 'ManagerApproved').length;
      roleActionSubtitle = 'Awaiting your fiscal authorization';
    } else if (user.role === ROLES.CLERK) {
      roleActionTitle = 'Ready for Goods Receipt';
      roleActionValue = state.requisitions.filter(r => ['FinanceApproved', 'ExcessApproved', 'ExcessRejected'].includes(r.status)).length;
      roleActionSubtitle = 'Approved orders awaiting dock arrival';
    } else if (user.role === ROLES.ADMIN) {
      roleActionTitle = 'Active Staff Accounts';
      roleActionValue = state.usersList.filter(u => u.isActive).length;
      roleActionSubtitle = 'Total users in enterprise directory';
    }

    const mTotal = document.getElementById('dash-metric-total-items');
    const mLow = document.getElementById('dash-metric-low-stock');
    const mActive = document.getElementById('dash-metric-active-reqs');
    const mRoleTitle = document.getElementById('dash-metric-role-title');
    const mRoleVal = document.getElementById('dash-metric-role-value');
    const mRoleSub = document.getElementById('dash-metric-role-subtitle');

    if (mTotal) mTotal.textContent = totalItems;
    if (mLow) mLow.textContent = lowStockCount;
    if (mActive) mActive.textContent = activeReqsCount;
    if (mRoleTitle) mRoleTitle.textContent = roleActionTitle;
    if (mRoleVal) mRoleVal.textContent = roleActionValue;
    if (mRoleSub) mRoleSub.textContent = roleActionSubtitle;

    // 2. Recent Requisitions Table (5 Latest)
    const recentTableBody = document.getElementById('dash-recent-reqs-tbody');
    if (recentTableBody) {
      const recent = state.requisitions.slice(0, 5);
      recentTableBody.innerHTML = recent.map(req => `
        <tr onclick="IPMS.navigateTo('requisition-detail', { selectedRequisitionId: '${req.id}' })">
          <td><strong>${req.code}</strong></td>
          <td>${req.creatorName}</td>
          <td>${req.createdAt}</td>
          <td class="align-right">$${req.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td class="align-center">${renderStatusChip(req.status)}</td>
          <td class="align-right">
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); IPMS.navigateTo('requisition-detail', { selectedRequisitionId: '${req.id}' })">View Details</button>
          </td>
        </tr>
      `).join('');
    }

    // 3. Role-Tailored Activity Feed (Decision U-11)
    const feedContainer = document.getElementById('dash-activity-feed');
    if (feedContainer) {
      let activities = [];
      if (user.role === ROLES.CLERK) {
        activities = [
          { actor: 'Sam Taylor', action: 'Created Purchase Requisition REQ-2026-0104 with 3 line items ($4,850.00).', time: '15 mins ago' },
          { actor: 'Pat Chen', action: 'Finance approved REQ-2026-0095; order now ready for dockside goods receipt.', time: '2 hours ago' },
          { actor: 'Sam Taylor', action: 'Recorded dock arrival for REQ-2026-0089 (+10 excess units). Step 1 initiated.', time: 'Yesterday' },
          { actor: 'Sam Taylor', action: 'Received 100 units of Hydraulic Seal Rings against REQ-2026-0077.', time: '3 days ago' }
        ];
      } else if (user.role === ROLES.MANAGER) {
        activities = [
          { actor: 'Sam Taylor', action: 'Submitted new requisition REQ-2026-0104 ($4,850.00) awaiting your review.', time: '15 mins ago' },
          { actor: 'Jordan Lee (You)', action: 'Approved operational necessity for REQ-2026-0098 ($1,270.00).', time: 'Yesterday' },
          { actor: 'Sam Taylor', action: 'Submitted excess delivery request for REQ-2026-0089 (Step 1).', time: 'Yesterday' },
          { actor: 'Jordan Lee (You)', action: 'Rejected REQ-2026-0070 due to monthly budget cap.', time: 'Nov 8' }
        ];
      } else if (user.role === ROLES.FINANCE) {
        activities = [
          { actor: 'Jordan Lee', action: 'Manager approved REQ-2026-0098; now awaiting your fiscal sign-off.', time: 'Yesterday' },
          { actor: 'Pat Chen (You)', action: 'Authorized fiscal commitment for REQ-2026-0095 ($3,200.00).', time: '2 days ago' },
          { actor: 'Pat Chen (You)', action: 'Rejected excess delivery for REQ-2026-0084 (surplus 2 units refused at dock).', time: 'Nov 13' },
          { actor: 'Sam Taylor', action: 'Physical receipt completed for REQ-2026-0077.', time: 'Nov 12' }
        ];
      } else if (user.role === ROLES.ADMIN) {
        activities = [
          { actor: 'Sam Taylor', action: 'Submitted REQ-2026-0104 into approval workflow.', time: '15 mins ago' },
          { actor: 'Alex Morgan (You)', action: 'Adjusted inventory count on SKU-A1098 (-10 units, cycle discrepancy).', time: 'Yesterday' },
          { actor: 'Alex Morgan (You)', action: 'Issued single-use temporary password for Emma Watson.', time: 'Nov 11' },
          { actor: 'Pat Chen', action: 'Rejected excess on REQ-2026-0084 under Decision UD-01.', time: 'Nov 13' }
        ];
      }

      feedContainer.innerHTML = activities.map(act => `
        <li class="activity-feed-item">
          <div class="activity-dot"></div>
          <div><span class="activity-actor">${act.actor}</span>: ${act.action}</div>
          <div class="activity-time">${act.time}</div>
        </li>
      `).join('');
    }
  }

  // --- SCR-ITEM-01: Item Catalog & Inventory ---
  function renderItemsCatalog() {
    const user = getCurrentUser();

    // Role-dependent Actions in Catalog Header
    const btnAddItem = document.getElementById('catalog-btn-add-item');
    const btnSheetsExport = document.getElementById('catalog-btn-sheets-export');
    const filterCatalogStatus = document.getElementById('catalog-filter-status');

    if (btnAddItem) {
      btnAddItem.style.display = (user.role === ROLES.ADMIN) ? 'inline-flex' : 'none';
    }

    if (btnSheetsExport) {
      // Admin, Manager, Finance can export to Google Sheets; Clerk has CSV only (Decision D-006, UD-04)
      btnSheetsExport.style.display = (user.role === ROLES.CLERK) ? 'none' : 'inline-flex';
    }

    if (filterCatalogStatus) {
      // Admin only sees deleted/inactive filter toggle (Decision D-011)
      filterCatalogStatus.style.display = (user.role === ROLES.ADMIN) ? 'inline-block' : 'none';
    }

    // Filter Items
    const searchLower = state.itemFilter.search.toLowerCase().trim();
    const filteredItems = state.items.filter(item => {
      // Inactive items guard (Decision D-011): non-admins NEVER see inactive items
      if (user.role !== ROLES.ADMIN && !item.isActive) return false;

      // Admin catalog status filter
      if (user.role === ROLES.ADMIN) {
        if (state.itemFilter.catalogStatus === 'ACTIVE' && !item.isActive) return false;
        if (state.itemFilter.catalogStatus === 'INACTIVE' && item.isActive) return false;
      }

      // Keyword search (SKU or Name)
      if (searchLower) {
        const matchSku = item.sku.toLowerCase().includes(searchLower);
        const matchName = item.name.toLowerCase().includes(searchLower);
        if (!matchSku && !matchName) return false;
      }

      // Stock Status Filter (Decision D-013)
      if (state.itemFilter.stockStatus === 'low' && !(item.quantity < item.reorderThreshold)) return false;
      if (state.itemFilter.stockStatus === 'normal' && !(item.quantity >= item.reorderThreshold)) return false;

      // Location Filter
      if (state.itemFilter.location !== 'ALL' && !item.location.includes(state.itemFilter.location)) return false;

      return true;
    });

    const tbody = document.getElementById('catalog-table-tbody');
    const countDisplay = document.getElementById('catalog-item-count');
    if (countDisplay) countDisplay.textContent = `${filteredItems.length} items`;

    if (tbody) {
      if (filteredItems.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="${user.role === ROLES.ADMIN ? 9 : 8}" style="text-align:center; padding: 40px; color: var(--text-muted);">
              <strong>No inventory items match your search or filter criteria.</strong>
              <div style="margin-top: 8px;"><button class="btn btn-secondary btn-sm" onclick="IPMS.resetItemFilters()">Clear Filters</button></div>
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = filteredItems.map(item => {
          const isLowStock = item.quantity < item.reorderThreshold;
          return `
            <tr onclick="IPMS.openItemDetailDrawer('${item.id}')">
              <td><strong>${item.sku}</strong></td>
              <td>${item.name}</td>
              <td>${item.location}</td>
              <td class="align-right"><strong>${item.quantity}</strong></td>
              <td class="align-right">$${item.unitPrice.toFixed(2)}</td>
              <td class="align-right">${item.reorderThreshold}</td>
              <td class="align-center">
                <span class="chip ${isLowStock ? 'chip-low-stock' : 'chip-normal-stock'}">
                  ${isLowStock ? '⚠️ Low Stock' : '✓ Normal'}
                </span>
              </td>
              ${user.role === ROLES.ADMIN ? `
                <td class="align-center">
                  <span class="chip ${item.isActive ? 'chip-active' : 'chip-inactive'}">
                    ${item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              ` : ''}
              <td class="align-right" onclick="event.stopPropagation();">
                <div style="display:flex; gap:4px; justify-content:flex-end;">
                  <button class="btn btn-secondary btn-sm" title="View Specifications" onclick="IPMS.openItemDetailDrawer('${item.id}')">View</button>
                  ${(user.role === ROLES.ADMIN || user.role === ROLES.CLERK) && item.isActive ? `
                    <button class="btn btn-secondary btn-sm" title="Stock Adjustment" onclick="IPMS.openStockAdjustModal('${item.id}')">Adjust</button>
                  ` : ''}
                  ${user.role === ROLES.ADMIN && item.isActive ? `
                    <button class="btn btn-danger btn-sm" title="Soft Delete" onclick="IPMS.openItemDeleteModal('${item.id}')">Delete</button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  // --- DRAWER-ITEM-01: Contextual Item Detail Drawer ---
  function openItemDetailDrawer(itemId) {
    state.selectedItemId = itemId;
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;

    const user = getCurrentUser();
    const isLowStock = item.quantity < item.reorderThreshold;

    const drawer = document.getElementById('drawer-item-detail');
    const backdrop = document.getElementById('drawer-backdrop');

    // Populate Drawer Content
    document.getElementById('drawer-item-sku').textContent = item.sku;
    document.getElementById('drawer-item-name').textContent = item.name;

    // Stock status alert banner
    const banner = document.getElementById('drawer-item-alert-banner');
    if (banner) {
      if (isLowStock) {
        banner.className = 'alert-banner alert-danger';
        banner.innerHTML = `<strong>⚠️ LOW STOCK ALERT:</strong> Current on-hand quantity (${item.quantity}) is below minimum reorder threshold (${item.reorderThreshold}). Operational buffer breached!`;
        banner.style.display = 'block';
      } else {
        banner.className = 'alert-banner alert-success';
        banner.innerHTML = `<strong>✓ STOCK LEVEL NORMAL:</strong> Current on-hand quantity (${item.quantity}) meets operational buffer (Threshold: ${item.reorderThreshold}).`;
        banner.style.display = 'block';
      }
    }

    // Specifications
    document.getElementById('drawer-item-location').textContent = item.location;
    document.getElementById('drawer-item-qty').textContent = item.quantity;
    document.getElementById('drawer-item-threshold').textContent = item.reorderThreshold;
    document.getElementById('drawer-item-price').textContent = `$${item.unitPrice.toFixed(2)}`;
    document.getElementById('drawer-item-total-value').textContent = `$${(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('drawer-item-desc').textContent = item.description || 'No description provided.';
    document.getElementById('drawer-item-created').textContent = item.createdAt;
    document.getElementById('drawer-item-updated').textContent = item.updatedAt;

    // Role-Dependent Footer Actions (SAD §4.8)
    const footer = document.getElementById('drawer-item-footer');
    if (footer) {
      if (user.role === ROLES.ADMIN) {
        footer.innerHTML = `
          <button class="btn btn-danger btn-sm" onclick="IPMS.openItemDeleteModal('${item.id}')">Soft Delete</button>
          <button class="btn btn-secondary btn-sm" onclick="IPMS.openItemEditModal('${item.id}')">Edit Metadata</button>
          <button class="btn btn-primary btn-sm" onclick="IPMS.openStockAdjustModal('${item.id}')">Adjust Stock</button>
        `;
      } else if (user.role === ROLES.CLERK) {
        footer.innerHTML = `
          <button class="btn btn-primary btn-sm" onclick="IPMS.openStockAdjustModal('${item.id}')">Adjust Stock</button>
        `;
      } else {
        // Manager & Finance Officer: Read-Only
        footer.innerHTML = `<span style="font-size:12px; color:var(--text-muted); font-style:italic;">Read-only view for ${user.role}</span>`;
      }
    }

    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  }

  // --- SCR-REQ-01: Shared Requisition List ---
  function renderRequisitionsList() {
    const user = getCurrentUser();

    // 1. Render Role-Specific Navigation Tabs (Decision U-09)
    const tabsContainer = document.getElementById('req-tabs-container');
    if (tabsContainer) {
      let tabs = [];
      if (user.role === ROLES.CLERK) {
        tabs = [
          { id: 'my-reqs', label: 'My Requisitions', count: state.requisitions.filter(r => r.creatorId === user.id).length },
          { id: 'all-reqs', label: 'All Requisitions', count: state.requisitions.length }
        ];
      } else if (user.role === ROLES.MANAGER) {
        tabs = [
          { id: 'pending-mgr', label: 'Pending Manager Approval', count: state.requisitions.filter(r => r.status === 'Pending').length },
          { id: 'reviewed', label: 'Reviewed Requisitions', count: state.requisitions.filter(r => r.status !== 'Pending').length },
          { id: 'all-reqs', label: 'All Requisitions', count: state.requisitions.length }
        ];
      } else if (user.role === ROLES.FINANCE) {
        tabs = [
          { id: 'pending-fin', label: 'Pending Finance Approval', count: state.requisitions.filter(r => r.status === 'ManagerApproved').length },
          { id: 'reviewed', label: 'Reviewed Requisitions', count: state.requisitions.filter(r => !['Pending', 'ManagerApproved'].includes(r.status)).length },
          { id: 'all-reqs', label: 'All Requisitions', count: state.requisitions.length }
        ];
      } else if (user.role === ROLES.ADMIN) {
        tabs = [
          { id: 'all-reqs', label: 'All Requisitions', count: state.requisitions.length }
        ];
      }

      // If current tab is invalid for this role, reset to first
      if (!tabs.some(t => t.id === state.requisitionsTab)) {
        state.requisitionsTab = tabs[0].id;
      }

      tabsContainer.innerHTML = tabs.map(t => `
        <button class="tab-btn ${state.requisitionsTab === t.id ? 'active' : ''}" onclick="IPMS.setRequisitionsTab('${t.id}')">
          ${t.label} <span class="tab-count-pill">${t.count}</span>
        </button>
      `).join('');
    }

    // 2. Action Button: "Create Requisition" (Clerk Only per FR-004)
    const btnCreateReq = document.getElementById('req-btn-create');
    if (btnCreateReq) {
      btnCreateReq.style.display = (user.role === ROLES.CLERK) ? 'inline-flex' : 'none';
    }

    // 3. Filter Requisitions
    const searchLower = state.reqFilter.search.toLowerCase().trim();
    const filteredReqs = state.requisitions.filter(req => {
      // Tab Preset Filtering
      if (state.requisitionsTab === 'my-reqs' && req.creatorId !== user.id) return false;
      if (state.requisitionsTab === 'pending-mgr' && req.status !== 'Pending') return false;
      if (state.requisitionsTab === 'pending-fin' && req.status !== 'ManagerApproved') return false;
      if (state.requisitionsTab === 'reviewed') {
        if (user.role === ROLES.MANAGER && req.status === 'Pending') return false;
        if (user.role === ROLES.FINANCE && ['Pending', 'ManagerApproved'].includes(req.status)) return false;
      }

      // Keyword Search (ID or Creator Full Name per U-06)
      if (searchLower) {
        const matchCode = req.code.toLowerCase().includes(searchLower);
        const matchCreator = req.creatorName.toLowerCase().includes(searchLower);
        if (!matchCode && !matchCreator) return false;
      }

      // Status dropdown filter
      if (state.reqFilter.status !== 'ALL' && req.status !== state.reqFilter.status) return false;

      return true;
    });

    const tbody = document.getElementById('req-table-tbody');
    if (tbody) {
      if (filteredReqs.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center; padding: 40px; color: var(--text-muted);">
              <strong>No requisitions found for this view preset.</strong>
              ${user.role === ROLES.CLERK && state.requisitionsTab === 'my-reqs' ? `
                <div style="margin-top: 10px;">
                  <button class="btn btn-primary btn-sm" onclick="IPMS.navigateTo('requisition-new')">+ Create Your First Requisition</button>
                </div>
              ` : ''}
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = filteredReqs.map(req => {
          let actionButtonHtml = '';
          if (user.role === ROLES.MANAGER && req.status === 'Pending') {
            actionButtonHtml = `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); IPMS.navigateTo('requisition-detail', { selectedRequisitionId: '${req.id}' })">Review</button>`;
          } else if (user.role === ROLES.FINANCE && req.status === 'ManagerApproved') {
            actionButtonHtml = `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); IPMS.navigateTo('requisition-detail', { selectedRequisitionId: '${req.id}' })">Review</button>`;
          } else if (user.role === ROLES.CLERK && ['FinanceApproved', 'ExcessApproved', 'ExcessRejected'].includes(req.status)) {
            actionButtonHtml = `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); IPMS.navigateTo('requisition-receipt', { selectedRequisitionId: '${req.id}' })">Receive Goods</button>`;
          } else {
            actionButtonHtml = `<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); IPMS.navigateTo('requisition-detail', { selectedRequisitionId: '${req.id}' })">View Details</button>`;
          }

          return `
            <tr onclick="IPMS.navigateTo('requisition-detail', { selectedRequisitionId: '${req.id}' })">
              <td><strong>${req.code}</strong></td>
              <td>${req.creatorName}</td>
              <td>${req.createdAt}</td>
              <td class="align-center">${req.items.length} items</td>
              <td class="align-right"><strong>$${req.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
              <td class="align-center">${renderStatusChip(req.status)}</td>
              <td class="align-right">${actionButtonHtml}</td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  // --- SCR-REQ-02: Purchase Requisition Creation ---
  function renderRequisitionCreate() {
    const user = getCurrentUser();

    // Guard: Only Clerk can create (FR-004)
    if (user.role !== ROLES.CLERK) {
      document.getElementById('screen-requisition-new').innerHTML = `
        <div class="alert-banner alert-danger">
          <strong>Access Denied (HTTP 403 Forbidden):</strong> Only users with the Inventory Clerk role are authorized to create purchase requisitions (FR-004).
        </div>
        <button class="btn btn-secondary" onclick="IPMS.navigateTo('requisitions')">← Return to Requisitions</button>
      `;
      return;
    }

    // Populate Requester Metadata Card
    const reqNameEl = document.getElementById('newreq-requester-name');
    if (reqNameEl) reqNameEl.textContent = user.fullName;

    // Render Autocomplete Dropdown Options
    const selectEl = document.getElementById('newreq-item-picker');
    if (selectEl) {
      const activeItems = state.items.filter(i => i.isActive);
      selectEl.innerHTML = '<option value="">-- Choose active SKU or item name --</option>' + activeItems.map(i => `
        <option value="${i.id}">${i.sku} — ${i.name} ($${i.unitPrice.toFixed(2)} | On-Hand: ${i.quantity})</option>
      `).join('');
    }

    // Render Added Line Items Table
    const tbody = document.getElementById('newreq-lines-tbody');
    let grandTotal = 0;
    let totalUnits = 0;

    if (tbody) {
      if (state.newReqLines.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center; padding: 30px; color: var(--text-muted);">
              No items added to this requisition yet. Select an item above and specify quantity to begin.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = state.newReqLines.map((line, index) => {
          const item = state.items.find(i => i.id === line.itemId);
          if (!item) return '';

          const lineTotal = line.requestedQty * item.unitPrice;
          grandTotal += lineTotal;
          totalUnits += line.requestedQty;

          return `
            <tr>
              <td><strong>${item.sku}</strong></td>
              <td>${item.name}</td>
              <td class="align-right">${item.quantity}</td>
              <td class="align-right">$${item.unitPrice.toFixed(2)}</td>
              <td style="width: 140px;">
                <input type="number" min="1" class="form-input" value="${line.requestedQty}" onchange="IPMS.updateReqLineQty(${index}, this.value)">
              </td>
              <td class="align-right"><strong>$${lineTotal.toFixed(2)}</strong></td>
              <td class="align-center">
                <button class="btn btn-danger btn-sm" onclick="IPMS.removeReqLine(${index})">Remove</button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Update Summary Footer
    const countItemsEl = document.getElementById('newreq-summary-item-count');
    const countUnitsEl = document.getElementById('newreq-summary-unit-count');
    const grandTotalEl = document.getElementById('newreq-summary-grand-total');
    const btnSubmit = document.getElementById('newreq-btn-submit');

    if (countItemsEl) countItemsEl.textContent = state.newReqLines.length;
    if (countUnitsEl) countUnitsEl.textContent = totalUnits;
    if (grandTotalEl) grandTotalEl.textContent = `$${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    if (btnSubmit) {
      btnSubmit.disabled = (state.newReqLines.length === 0);
    }
  }

  // --- SCR-REQ-03: Requisition Detail, Timeline & Approval Review ---
  function renderRequisitionDetail() {
    const user = getCurrentUser();
    const req = state.requisitions.find(r => r.id === state.selectedRequisitionId);
    if (!req) return;

    // Header Info
    document.getElementById('req-detail-code').textContent = req.code;
    document.getElementById('req-detail-status-chip').innerHTML = renderStatusChip(req.status);
    document.getElementById('req-detail-created-at').textContent = req.createdAt;
    document.getElementById('req-detail-creator').textContent = req.creatorName;
    document.getElementById('req-detail-grand-total').textContent = `$${req.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    // Rejection Banner (Visible strictly if status === 'Rejected' per Decision UD-03)
    const rejBanner = document.getElementById('req-detail-rejection-banner');
    if (rejBanner) {
      if (req.status === 'Rejected') {
        rejBanner.style.display = 'block';
        document.getElementById('req-detail-rejection-reason-text').textContent = req.currentRejectionReason || 'No reason specified.';
      } else {
        rejBanner.style.display = 'none';
      }
    }

    // Excess Notice Banner (Visible if excess states)
    const excessBanner = document.getElementById('req-detail-excess-banner');
    if (excessBanner) {
      if (['ExcessPendingManager', 'ExcessPendingFinance', 'ExcessApproved', 'ExcessRejected'].includes(req.status)) {
        excessBanner.style.display = 'block';
        const excessText = document.getElementById('req-detail-excess-text');
        if (req.status === 'ExcessPendingManager') {
          excessText.textContent = `Physical dock delivery recorded surplus items (${req.excessDetails ? req.excessDetails.excessUnits : ''} units, +$${req.excessDetails ? req.excessDetails.excessFinancialCommitment.toFixed(2) : ''}). Awaiting Step 2 Manager Operational Authorization.`;
        } else if (req.status === 'ExcessPendingFinance') {
          excessText.textContent = `Manager authorized excess operational need. Awaiting Step 3 Finance Fiscal Authorization.`;
        } else if (req.status === 'ExcessApproved') {
          excessText.textContent = `Both Manager and Finance authorized excess delivery. Inventory Clerk can proceed to Goods Receipt to commit all units.`;
        } else if (req.status === 'ExcessRejected') {
          excessText.textContent = `Excess delivery rejected: "${req.currentRejectionReason}". Under Decision UD-01, originally approved quantity remains eligible for dock receipt; excess units refused.`;
        }
      } else {
        excessBanner.style.display = 'none';
      }
    }

    // Line Items Table (Read-Only: Reviewers cannot modify quantities per Decision UD-03)
    const tbody = document.getElementById('req-detail-items-tbody');
    if (tbody) {
      tbody.innerHTML = req.items.map(line => {
        const lineTotal = line.requestedQty * line.snapshotUnitPrice;
        return `
          <tr>
            <td><strong>${line.sku}</strong></td>
            <td>${line.name}</td>
            <td class="align-right">$${line.snapshotUnitPrice.toFixed(2)}</td>
            <td class="align-right">${line.requestedQty}</td>
            <td class="align-right"><strong>${line.approvedQty}</strong></td>
            <td class="align-right">${line.receivedQty !== null ? line.receivedQty : '—'}</td>
            <td class="align-right"><strong>$${lineTotal.toFixed(2)}</strong></td>
          </tr>
        `;
      }).join('');
    }

    // Timeline (Decisions D-008, D-014)
    const timelineContainer = document.getElementById('req-detail-timeline');
    if (timelineContainer) {
      timelineContainer.innerHTML = req.timeline.map((event, index) => {
        const isLast = index === req.timeline.length - 1;
        const isRejection = event.eventType.includes('REJECTED');

        return `
          <div class="timeline-item ${isRejection ? 'rejected' : 'completed'}">
            <div class="timeline-line"></div>
            <div class="timeline-node"></div>
            <div class="timeline-event-header">
              <span class="timeline-event-title">${event.eventType.replace('_', ' ')}</span>
              <span class="timeline-event-time">${event.timestamp}</span>
            </div>
            <div class="timeline-event-desc">
              <strong>${event.actorName}</strong> ${event.actorRole ? `(${event.actorRole})` : ''}: ${event.desc || ''}
            </div>
            ${event.rejectionReason ? `
              <div class="timeline-rejection-callout">
                <strong>Reason:</strong> "${event.rejectionReason}"
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    // Sticky Action Bar (Strictly Role-Governed per RBAC Matrix SAD §6.2)
    const actionContainer = document.getElementById('req-detail-action-buttons');
    if (actionContainer) {
      let buttonsHtml = '';

      // 1. Manager First-Level Review (Pending)
      if (user.role === ROLES.MANAGER && req.status === 'Pending') {
        buttonsHtml = `
          <button class="btn btn-danger" onclick="IPMS.openReqRejectModal('${req.id}')">Reject Requisition</button>
          <button class="btn btn-success" onclick="IPMS.managerApproveReq('${req.id}')">Approve Requisition</button>
        `;
      }
      // 2. Finance Second-Level Review (ManagerApproved)
      else if (user.role === ROLES.FINANCE && req.status === 'ManagerApproved') {
        buttonsHtml = `
          <button class="btn btn-danger" onclick="IPMS.openReqRejectModal('${req.id}')">Reject Requisition</button>
          <button class="btn btn-success" onclick="IPMS.financeApproveReq('${req.id}')">Approve Requisition</button>
        `;
      }
      // 3. Excess Authorizations (Steps 2 & 3 per Decision U-05.2, UD-01)
      else if (user.role === ROLES.MANAGER && req.status === 'ExcessPendingManager') {
        buttonsHtml = `
          <button class="btn btn-danger" onclick="IPMS.openExcessAuthorizeModal('${req.id}', 'reject')">Reject Excess Delivery</button>
          <button class="btn btn-primary" onclick="IPMS.openExcessAuthorizeModal('${req.id}', 'approve')">Authorize Excess Operational Need</button>
        `;
      } else if (user.role === ROLES.FINANCE && req.status === 'ExcessPendingFinance') {
        buttonsHtml = `
          <button class="btn btn-danger" onclick="IPMS.openExcessAuthorizeModal('${req.id}', 'reject')">Reject Excess Commitment</button>
          <button class="btn btn-primary" onclick="IPMS.openExcessAuthorizeModal('${req.id}', 'approve')">Authorize Excess Fiscal Commitment</button>
        `;
      }
      // 4. Clerk Dock Receipt & Cancellation
      else if (user.role === ROLES.CLERK) {
        if (req.status === 'Pending' && req.creatorId === user.id) {
          buttonsHtml = `
            <button class="btn btn-danger" onclick="IPMS.openReqCancelModal('${req.id}')">Cancel Requisition</button>
          `;
        } else if (['FinanceApproved', 'ExcessApproved', 'ExcessRejected'].includes(req.status)) {
          buttonsHtml = `
            <button class="btn btn-primary" onclick="IPMS.navigateTo('requisition-receipt', { selectedRequisitionId: '${req.id}' })">Proceed to Goods Receipt Verification →</button>
          `;
        }
      }
      // 5. Admin / Inactive State Note
      if (!buttonsHtml) {
        if (['Received', 'Rejected', 'Cancelled'].includes(req.status)) {
          buttonsHtml = `<span style="font-size:12px; color:var(--text-muted); font-style:italic;">This requisition is in terminal status (${req.status}) and is locked from further mutations.</span>`;
        } else {
          buttonsHtml = `<span style="font-size:12px; color:var(--text-muted); font-style:italic;">No actionable workflow reviews required for role: ${user.role}.</span>`;
        }
      }

      actionContainer.innerHTML = buttonsHtml;
    }
  }

  // --- SCR-REQ-04: Goods Receipt & Physical Quantity Verification ---
  function renderGoodsReceipt() {
    const user = getCurrentUser();
    const req = state.requisitions.find(r => r.id === state.selectedRequisitionId);
    if (!req) return;

    // Guard: Clerk Only (Decision U-05)
    if (user.role !== ROLES.CLERK) {
      document.getElementById('screen-requisition-receipt').innerHTML = `
        <div class="alert-banner alert-danger">
          <strong>Access Denied (HTTP 403 Forbidden):</strong> Physical goods receipt verification is restricted to the Inventory Clerk role (FR-007, Decision U-05).
        </div>
        <button class="btn btn-secondary" onclick="IPMS.navigateTo('requisition-detail', { selectedRequisitionId: '${req.id}' })">← Return to Requisition Detail</button>
      `;
      return;
    }

    document.getElementById('receipt-req-code').textContent = req.code;
    document.getElementById('receipt-approved-date').textContent = req.createdAt;
    document.getElementById('receipt-total-items').textContent = req.items.length;

    // Dynamic Guidance Banner based on Requisition State
    const banner = document.getElementById('receipt-guidance-banner');
    if (banner) {
      if (req.status === 'ExcessRejected') {
        banner.className = 'alert-banner alert-warning';
        banner.innerHTML = `<strong>UD-01 DOCK GUIDANCE:</strong> Excess shipment was rejected by Finance ("${req.currentRejectionReason}"). You may receive up to the originally approved quantity (${req.items[0].approvedQty} units). Excess units must be refused at the loading dock.`;
      } else if (req.status === 'ExcessApproved') {
        banner.className = 'alert-banner alert-success';
        banner.innerHTML = `<strong>DUAL AUTHORIZATION COMPLETE:</strong> Both Manager and Finance have authorized the physical excess shipment. You may commit all delivered units to active inventory.`;
      } else {
        banner.className = 'alert-banner alert-info';
        banner.innerHTML = `<strong>PHYSICAL DOCK VERIFICATION:</strong> Inspect packages and enter actual physical counts delivered. Single partial receipt is accepted directly into inventory (Decision U-05.1). Any quantity exceeding approved units requires sequential authorization (Decision U-05.2).`;
      }
    }

    // Render Verification Items Table
    const tbody = document.getElementById('receipt-table-tbody');
    if (tbody) {
      tbody.innerHTML = req.items.map((line, index) => {
        const item = state.items.find(i => i.id === line.itemId);
        const defaultVal = line.deliveredQty || line.approvedQty;

        return `
          <tr>
            <td>
              <strong>${line.sku}</strong>
              <div style="font-size:12px; color:var(--text-secondary);">${line.name}</div>
            </td>
            <td>${item ? item.location : 'Dock Staging A'}</td>
            <td class="align-right"><strong>${line.approvedQty}</strong></td>
            <td style="width: 140px;">
              <input type="number" min="0" ${req.status === 'ExcessRejected' ? `max="${line.approvedQty}"` : ''} class="form-input receipt-input-qty" data-index="${index}" data-approved="${line.approvedQty}" value="${defaultVal}" oninput="IPMS.onReceiptQtyChange(${index}, this.value, ${line.approvedQty})">
            </td>
            <td class="align-center" id="receipt-variance-cell-${index}">
              ${getVarianceBadge(defaultVal, line.approvedQty)}
            </td>
          </tr>
        `;
      }).join('');
    }

    updateReceiptSummary();
  }

  function getVarianceBadge(received, approved) {
    received = parseInt(received, 10) || 0;
    if (received === approved) {
      return '<span class="chip chip-success">✓ Full Match</span>';
    } else if (received < approved) {
      return '<span class="chip chip-pending">⚠️ Partial Delivery (U-05.1)</span>';
    } else {
      return '<span class="chip chip-excess-manager">⬆ Excess (+ ' + (received - approved) + ' units)</span>';
    }
  }

  function updateReceiptSummary() {
    const req = state.requisitions.find(r => r.id === state.selectedRequisitionId);
    if (!req) return;

    let hasExcess = false;
    let hasPartial = false;
    const inputs = document.querySelectorAll('.receipt-input-qty');

    inputs.forEach(input => {
      const val = parseInt(input.value, 10) || 0;
      const approved = parseInt(input.dataset.approved, 10) || 0;
      if (val > approved) hasExcess = true;
      if (val < approved) hasPartial = true;
    });

    const submitBtn = document.getElementById('receipt-btn-submit');
    if (submitBtn) {
      if (req.status === 'ExcessRejected') {
        submitBtn.className = 'btn btn-primary';
        submitBtn.textContent = 'Confirm Receipt of Approved Units (Refuse Surplus)';
      } else if (hasExcess && req.status !== 'ExcessApproved') {
        submitBtn.className = 'btn btn-primary';
        submitBtn.textContent = 'Submit Excess Authorization Request (Step 1)';
      } else {
        submitBtn.className = 'btn btn-success';
        submitBtn.textContent = hasPartial ? 'Confirm Partial Goods Receipt (Commit Stock)' : 'Confirm Full Goods Receipt (Commit Stock)';
      }
    }
  }

  // --- SCR-USER-01: User Management (Admin Only) ---
  function renderUsersList() {
    const user = getCurrentUser();

    if (user.role !== ROLES.ADMIN) {
      document.getElementById('screen-users').innerHTML = `
        <div class="alert-banner alert-danger">
          <strong>Access Denied (HTTP 403 Forbidden):</strong> User governance and staff directory management is restricted to Administrators (FR-023).
        </div>
      `;
      return;
    }

    const searchLower = state.userFilter.search.toLowerCase().trim();
    const filteredUsers = state.usersList.filter(u => {
      if (searchLower) {
        const matchName = u.fullName.toLowerCase().includes(searchLower);
        const matchEmail = u.email.toLowerCase().includes(searchLower);
        if (!matchName && !matchEmail) return false;
      }
      if (state.userFilter.role !== 'ALL' && u.role !== state.userFilter.role) return false;
      if (state.userFilter.status === 'ACTIVE' && !u.isActive) return false;
      if (state.userFilter.status === 'DEACTIVATED' && u.isActive) return false;
      return true;
    });

    const tbody = document.getElementById('users-table-tbody');
    if (tbody) {
      tbody.innerHTML = filteredUsers.map(u => {
        const isSelf = u.id === user.id;
        return `
          <tr>
            <td>
              <strong>${u.fullName}</strong> ${isSelf ? '<span class="chip chip-gray">(You)</span>' : ''}
            </td>
            <td>${u.email}</td>
            <td><span class="chip chip-default">${u.role}</span></td>
            <td class="align-center">
              <span class="chip ${u.isActive ? 'chip-active' : 'chip-error'}">
                ${u.isActive ? 'Active' : 'Deactivated'}
              </span>
            </td>
            <td class="align-center">
              ${u.mustChangePassword ? '<span class="chip chip-pending">Temporary Pwd Active</span>' : '—'}
            </td>
            <td>${u.createdAt}</td>
            <td class="align-right">
              <div style="display:flex; gap:4px; justify-content:flex-end;">
                <button class="btn btn-secondary btn-sm" onclick="IPMS.openUserRoleModal('${u.id}')">Change Role</button>
                <button class="btn btn-secondary btn-sm" onclick="IPMS.openUserResetPwdModal('${u.id}')">Reset Pwd</button>
                ${u.isActive ? `
                  <button class="btn btn-danger btn-sm" ${isSelf ? 'disabled title="You cannot deactivate your own account."' : ''} onclick="IPMS.openUserDeactivateModal('${u.id}')">Deactivate</button>
                ` : `
                  <button class="btn btn-success btn-sm" onclick="IPMS.toggleUserActivation('${u.id}', true)">Reactivate</button>
                `}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // --- SCR-AUDIT-01: System Audit Logs (Admin Only) ---
  function renderAuditLogs() {
    const user = getCurrentUser();

    if (user.role !== ROLES.ADMIN) {
      document.getElementById('screen-audit-logs').innerHTML = `
        <div class="alert-banner alert-danger">
          <strong>Access Denied (HTTP 403 Forbidden):</strong> Immutable audit trail inspection is restricted to Administrators (FR-014).
        </div>
      `;
      return;
    }

    const filtered = state.auditLogs.filter(a => {
      if (state.auditFilter.entity !== 'ALL' && a.entity !== state.auditFilter.entity) return false;
      if (state.auditFilter.action !== 'ALL' && a.action !== state.auditFilter.action) return false;
      if (state.auditFilter.actor) {
        if (!a.performedByName.toLowerCase().includes(state.auditFilter.actor.toLowerCase())) return false;
      }
      return true;
    });

    const tbody = document.getElementById('audit-table-tbody');
    if (tbody) {
      tbody.innerHTML = filtered.map(log => `
        <tr>
          <td><code style="font-size:12px;">${log.timestamp}</code></td>
          <td><strong>${log.performedByName}</strong> <span style="font-size:11px; color:var(--text-muted);">(${log.performedByRole})</span></td>
          <td><span class="chip chip-gray">${log.entity}</span></td>
          <td><code>${log.entityId}</code></td>
          <td><span class="chip ${getActionChipClass(log.action)}">${log.action}</span></td>
          <td>${log.detailsSummary}</td>
          <td class="align-right">
            <button class="btn btn-secondary btn-sm" onclick="IPMS.openAuditDetailModal('${log.id}')">Inspect JSON</button>
          </td>
        </tr>
      `).join('');
    }
  }

  function getActionChipClass(action) {
    if (action.includes('APPROVE') || action === 'CREATE' || action === 'RECEIVE') return 'chip-success';
    if (action.includes('REJECT') || action === 'DELETE') return 'chip-error';
    if (action.includes('ADJUST') || action.includes('REQUEST')) return 'chip-pending';
    return 'chip-gray';
  }

  // --- DRAWER-NOTIF-01: Global Notification Panel ---
  function openNotificationDrawer() {
    const drawer = document.getElementById('drawer-notifications');
    const backdrop = document.getElementById('drawer-backdrop');

    renderNotificationList('all');

    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  }

  function renderNotificationList(filter) {
    const listEl = document.getElementById('notif-list-container');
    const badgeEl = document.getElementById('topbar-notif-badge');
    const unreadCount = state.notifications.filter(n => !n.read).length;

    if (badgeEl) {
      badgeEl.textContent = unreadCount;
      badgeEl.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    if (!listEl) return;

    let items = state.notifications;
    if (filter === 'unread') {
      items = items.filter(n => !n.read);
    }

    if (items.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding: 40px 20px; color:var(--text-muted);">
          <strong>You're all caught up!</strong>
          <div style="margin-top: 4px; font-size:12px;">No unread notifications in your inbox.</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items.map(n => `
      <div class="activity-feed-item" style="cursor:pointer; background-color:${n.read ? 'transparent' : '#f0fdf4'}; border-radius:4px; padding:10px 12px; margin-bottom:6px;" onclick="IPMS.onNotificationClick('${n.id}')">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <span class="chip ${n.type === 'LowStockAlert' ? 'chip-error' : (n.type === 'ApprovalResult' ? 'chip-success' : 'chip-pending')}" style="font-size:10px;">
            ${n.type}
          </span>
          <span style="font-size:11px; color:var(--text-muted);">${n.timestamp}</span>
        </div>
        <div style="margin-top:6px; font-size:13px; color:var(--text-main); font-weight:${n.read ? '400' : '600'};">${n.message}</div>
        <div style="margin-top:6px; font-size:11px; color:var(--wire-primary); display:flex; justify-content:space-between; align-items:center;">
          <span>Click to deep-link & highlight target</span>
          ${!n.read ? `<button class="btn btn-secondary btn-sm" style="font-size:10px; padding:1px 6px;" onclick="event.stopPropagation(); IPMS.markNotifRead('${n.id}')">Mark Read</button>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Notification Deep-Linking & Highlighting (Decision U-10)
  function onNotificationClick(notifId) {
    const notif = state.notifications.find(n => n.id === notifId);
    if (!notif) return;

    notif.read = true;
    closeAllDrawers();

    if (notif.entityType === 'Item') {
      navigateTo('items');
      openItemDetailDrawer(notif.entityId);
      // Highlight banner
      setTimeout(() => {
        const banner = document.getElementById('drawer-item-alert-banner');
        if (banner) banner.classList.add('pulse-highlight');
      }, 300);
    } else if (notif.entityType === 'Requisition') {
      navigateTo('requisition-detail', { selectedRequisitionId: notif.entityId });
      setTimeout(() => {
        if (notif.message.includes('REJECTED')) {
          const banner = document.getElementById('req-detail-rejection-banner');
          if (banner) banner.classList.add('pulse-highlight');
        } else if (notif.message.includes('Excess')) {
          const banner = document.getElementById('req-detail-excess-banner');
          if (banner) banner.classList.add('pulse-highlight');
        }
      }, 300);
    }

    renderNotificationList('all');
  }

  // ==========================================================================
  // 4. MODALS & WORKFLOW ACTIONS
  // ==========================================================================

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('open'));
  }

  function closeAllDrawers() {
    document.querySelectorAll('.drawer-panel').forEach(el => el.classList.remove('open'));
    const backdrop = document.getElementById('drawer-backdrop');
    if (backdrop) backdrop.classList.remove('open');
  }

  // --- MOD-ITEM-CREATE: Create Item (Admin Only, Auto-SKU) ---
  function openItemCreateModal() {
    const modal = document.getElementById('modal-item-create');
    if (modal) modal.classList.add('open');
  }

  function submitItemCreate() {
    const name = document.getElementById('modal-create-name').value.trim();
    const location = document.getElementById('modal-create-location').value.trim();
    const price = parseFloat(document.getElementById('modal-create-price').value) || 0;
    const qty = parseInt(document.getElementById('modal-create-qty').value, 10) || 0;
    const threshold = parseInt(document.getElementById('modal-create-threshold').value, 10) || 0;
    const desc = document.getElementById('modal-create-desc').value.trim();

    if (!name || !location) {
      showToast('Please provide required Item Name and Location.', 'error');
      return;
    }

    // Auto-generate SKU (Decision U-07)
    const newSkuNumber = 5000 + state.items.length + 1;
    const autoSku = `SKU-K${newSkuNumber}`;

    const newItem = {
      id: `item-${Date.now()}`,
      sku: autoSku,
      name,
      description: desc,
      location,
      quantity: qty,
      unitPrice: price,
      reorderThreshold: threshold,
      isActive: true,
      createdAt: 'Just now',
      updatedAt: 'Just now'
    };

    state.items.unshift(newItem);
    closeAllModals();
    renderItemsCatalog();
    showToast(`Catalog item created successfully with auto-generated ${autoSku}!`, 'success');
  }

  // --- MOD-ITEM-EDIT: Edit Item Metadata (Admin Only, Quantity Prohibited D-015) ---
  function openItemEditModal(itemId) {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('modal-edit-sku-display').textContent = item.sku;
    document.getElementById('modal-edit-name').value = item.name;
    document.getElementById('modal-edit-location').value = item.location;
    document.getElementById('modal-edit-price').value = item.unitPrice;
    document.getElementById('modal-edit-threshold').value = item.reorderThreshold;
    document.getElementById('modal-edit-desc').value = item.description || '';

    const modal = document.getElementById('modal-item-edit');
    if (modal) modal.classList.add('open');
  }

  function submitItemEdit() {
    const item = state.items.find(i => i.id === state.selectedItemId);
    if (!item) return;

    item.name = document.getElementById('modal-edit-name').value.trim();
    item.location = document.getElementById('modal-edit-location').value.trim();
    item.unitPrice = parseFloat(document.getElementById('modal-edit-price').value) || item.unitPrice;
    item.reorderThreshold = parseInt(document.getElementById('modal-edit-threshold').value, 10) || item.reorderThreshold;
    item.description = document.getElementById('modal-edit-desc').value.trim();
    item.updatedAt = 'Just now';

    closeAllModals();
    renderItemsCatalog();
    openItemDetailDrawer(item.id);
    showToast(`Metadata for ${item.sku} updated successfully.`, 'success');
  }

  // --- MOD-ITEM-ADJUST: Manual Stock Adjustment (Admin & Clerk, FR-025, D-015) ---
  function openStockAdjustModal(itemId) {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;

    state.selectedItemId = itemId;
    document.getElementById('modal-adjust-sku').textContent = item.sku;
    document.getElementById('modal-adjust-current-qty').textContent = item.quantity;
    document.getElementById('modal-adjust-value').value = '';
    document.getElementById('modal-adjust-result-preview').textContent = item.quantity;
    document.getElementById('modal-adjust-reason').value = '';

    const modal = document.getElementById('modal-item-adjust');
    if (modal) modal.classList.add('open');
  }

  function onAdjustInputChange(val) {
    const item = state.items.find(i => i.id === state.selectedItemId);
    if (!item) return;

    const delta = parseInt(val, 10) || 0;
    const result = item.quantity + delta;
    const previewEl = document.getElementById('modal-adjust-result-preview');
    const errorEl = document.getElementById('modal-adjust-error');

    if (previewEl) {
      previewEl.textContent = result;
      if (result < 0) {
        previewEl.style.color = '#dc2626';
        if (errorEl) {
          errorEl.textContent = 'Stock integrity error: Resulting inventory cannot be negative (< 0) (FR-025).';
          errorEl.style.display = 'block';
        }
      } else {
        previewEl.style.color = 'inherit';
        if (errorEl) errorEl.style.display = 'none';
      }
    }
  }

  function submitStockAdjustment() {
    const item = state.items.find(i => i.id === state.selectedItemId);
    if (!item) return;

    const delta = parseInt(document.getElementById('modal-adjust-value').value, 10);
    const reason = document.getElementById('modal-adjust-reason').value.trim();

    if (isNaN(delta) || delta === 0) {
      showToast('Please specify a non-zero signed integer adjustment value.', 'error');
      return;
    }
    if (!reason) {
      showToast('Adjustment reason is mandatory for audit logging (FR-025).', 'error');
      return;
    }
    if (item.quantity + delta < 0) {
      showToast('Adjustment rejected: Inventory stock cannot become negative.', 'error');
      return;
    }

    const prevQty = item.quantity;
    item.quantity += delta;
    item.updatedAt = 'Just now';

    // Log to Audit Trail
    state.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
      performedByName: getCurrentUser().fullName,
      performedByRole: getCurrentUser().role,
      entity: 'Item',
      entityId: item.sku,
      action: 'ADJUST',
      detailsSummary: `Stock count adjusted: ${prevQty} -> ${item.quantity} (${delta > 0 ? '+' : ''}${delta})`,
      details: {
        adjustment: delta,
        previousQuantity: prevQty,
        resultingQuantity: item.quantity,
        reason
      }
    });

    closeAllModals();
    renderItemsCatalog();
    if (state.currentScreen === 'items') {
      openItemDetailDrawer(item.id);
    }
    showToast(`Stock adjusted on ${item.sku}. New on-hand: ${item.quantity}`, 'success');
  }

  // --- MOD-ITEM-DELETE: Soft-Delete (Admin Only, Decision U-08) ---
  function openItemDeleteModal(itemId) {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    state.selectedItemId = itemId;

    document.getElementById('modal-delete-item-name').textContent = `${item.sku} — ${item.name}`;
    const modal = document.getElementById('modal-item-delete');
    if (modal) modal.classList.add('open');
  }

  function confirmItemDelete() {
    const item = state.items.find(i => i.id === state.selectedItemId);
    if (!item) return;

    // Soft delete per Decision U-08
    item.isActive = false;
    item.updatedAt = 'Just now';

    // Log Audit
    state.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
      performedByName: getCurrentUser().fullName,
      performedByRole: getCurrentUser().role,
      entity: 'Item',
      entityId: item.sku,
      action: 'DELETE',
      detailsSummary: `Soft deleted catalog item: ${item.sku} (isActive=false)`,
      details: {
        softDelete: true,
        reason: 'Catalog cleanup'
      }
    });

    closeAllModals();
    closeAllDrawers();
    renderItemsCatalog();
    showToast(`${item.sku} soft-deleted. Item is hidden from non-admin users.`, 'info');
  }

  // --- MOD-EXPORT-CUSTOM: Google Sheets Custom Export (Decision U-12) ---
  function openCustomExportModal() {
    const modal = document.getElementById('modal-export-custom');
    if (modal) modal.classList.add('open');
  }

  function triggerQuickExport() {
    // Quick Export per Decision UD-04: Exports all filtered records across pages using standard columns
    showToast('Exporting all filtered records to Google Sheets with 10 standard columns (UD-04)...', 'info');
    setTimeout(() => {
      showToast('✓ Google Sheets export complete: Spreadsheet generated successfully!', 'success');
    }, 1000);
  }

  function submitCustomExport() {
    closeAllModals();
    showToast('Generating custom Google Sheets export with selected columns...', 'info');
    setTimeout(() => {
      showToast('✓ Custom Google Sheets export ready!', 'success');
    }, 1000);
  }

  function downloadCsvExport() {
    showToast('✓ Direct CSV inventory stream downloaded to your browser (FR-026).', 'success');
  }

  // --- Requisition Line Items Creation Handlers ---
  function addLineItemToNewReq() {
    const selectEl = document.getElementById('newreq-item-picker');
    const qtyInput = document.getElementById('newreq-qty-input');

    const itemId = selectEl.value;
    const qty = parseInt(qtyInput.value, 10) || 0;

    if (!itemId) {
      showToast('Please select a catalog item from the list.', 'error');
      return;
    }
    if (qty <= 0) {
      showToast('Requested quantity must be at least 1.', 'error');
      return;
    }

    // Check if already in list -> increment
    const existing = state.newReqLines.find(l => l.itemId === itemId);
    if (existing) {
      existing.requestedQty += qty;
    } else {
      state.newReqLines.push({ itemId, requestedQty: qty });
    }

    qtyInput.value = '1';
    renderRequisitionCreate();
  }

  function updateReqLineQty(index, newQty) {
    newQty = parseInt(newQty, 10);
    if (newQty <= 0 || isNaN(newQty)) {
      showToast('Quantity must be greater than zero.', 'error');
      renderRequisitionCreate();
      return;
    }
    state.newReqLines[index].requestedQty = newQty;
    renderRequisitionCreate();
  }

  function removeReqLine(index) {
    state.newReqLines.splice(index, 1);
    renderRequisitionCreate();
  }

  function submitNewRequisition() {
    if (state.newReqLines.length === 0) {
      showToast('Requisition must have at least 1 line item.', 'error');
      return;
    }

    const user = getCurrentUser();
    const newReqId = `req-${Date.now()}`;
    const newReqCode = `REQ-2026-0${105 + state.requisitions.length}`;

    let totalAmount = 0;
    const items = state.newReqLines.map(line => {
      const item = state.items.find(i => i.id === line.itemId);
      const snapshotPrice = item.unitPrice; // Price snapshot rule (FR-004)
      totalAmount += line.requestedQty * snapshotPrice;
      return {
        itemId: line.itemId,
        sku: item.sku,
        name: item.name,
        snapshotUnitPrice: snapshotPrice,
        requestedQty: line.requestedQty,
        approvedQty: line.requestedQty,
        receivedQty: null
      };
    });

    const newReq = {
      id: newReqId,
      code: newReqCode,
      creatorId: user.id,
      creatorName: user.fullName,
      creatorRole: user.role,
      createdAt: 'Just now',
      status: 'Pending', // Immediate submission; no draft state (Decision U-01)
      totalAmount,
      items,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          eventType: 'SUBMITTED',
          actorName: user.fullName,
          actorRole: user.role,
          timestamp: 'Just now',
          desc: 'Requisition submitted immediately with Pending status (No draft workflow, Decision U-01).'
        }
      ],
      currentRejectionReason: null,
      rejectionHistory: []
    };

    state.requisitions.unshift(newReq);
    state.newReqLines = []; // Clear draft

    // Add Audit Log
    state.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
      performedByName: user.fullName,
      performedByRole: user.role,
      entity: 'Requisition',
      entityId: newReqCode,
      action: 'CREATE',
      detailsSummary: `Requisition submitted to Pending status (Total: $${totalAmount.toFixed(2)})`,
      details: {
        eventType: 'SUBMITTED',
        totalAmount,
        lineItemCount: items.length
      }
    });

    showToast(`Requisition ${newReqCode} created and submitted immediately into Pending!`, 'success');
    navigateTo('requisition-detail', { selectedRequisitionId: newReqId });
  }

  // --- Manager / Finance Approval Handlers ---
  function managerApproveReq(reqId) {
    const req = state.requisitions.find(r => r.id === reqId);
    if (!req) return;

    req.status = 'ManagerApproved';
    req.timeline.push({
      id: `tl-${Date.now()}`,
      eventType: 'MANAGER_APPROVED',
      actorName: getCurrentUser().fullName,
      actorRole: getCurrentUser().role,
      timestamp: 'Just now',
      desc: 'Manager operational approval granted. Line items approved without modification (Decision UD-03).'
    });

    state.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
      performedByName: getCurrentUser().fullName,
      performedByRole: getCurrentUser().role,
      entity: 'Requisition',
      entityId: req.code,
      action: 'APPROVE',
      detailsSummary: 'Status changed: Pending -> ManagerApproved',
      details: { eventType: 'MANAGER_APPROVED' }
    });

    renderRequisitionDetail();
    showToast(`Requisition ${req.code} approved by Manager. Now routed to Finance.`, 'success');
  }

  function financeApproveReq(reqId) {
    const req = state.requisitions.find(r => r.id === reqId);
    if (!req) return;

    req.status = 'FinanceApproved';
    req.timeline.push({
      id: `tl-${Date.now()}`,
      eventType: 'FINANCE_APPROVED',
      actorName: getCurrentUser().fullName,
      actorRole: getCurrentUser().role,
      timestamp: 'Just now',
      desc: 'Finance fiscal commitment approved. Order released for dock goods receipt.'
    });

    state.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
      performedByName: getCurrentUser().fullName,
      performedByRole: getCurrentUser().role,
      entity: 'Requisition',
      entityId: req.code,
      action: 'APPROVE',
      detailsSummary: 'Status changed: ManagerApproved -> FinanceApproved',
      details: { eventType: 'FINANCE_APPROVED' }
    });

    renderRequisitionDetail();
    showToast(`Requisition ${req.code} approved by Finance. Order is ready for Goods Receipt!`, 'success');
  }

  // --- MOD-REQ-REJECT: Rejection with Mandatory Reason (Decision UD-03) ---
  function openReqRejectModal(reqId) {
    state.selectedRequisitionId = reqId;
    document.getElementById('modal-reject-reason').value = '';
    const modal = document.getElementById('modal-req-reject');
    if (modal) modal.classList.add('open');
  }

  function submitRequisitionRejection() {
    const req = state.requisitions.find(r => r.id === state.selectedRequisitionId);
    if (!req) return;

    const reason = document.getElementById('modal-reject-reason').value.trim();
    if (!reason) {
      showToast('Rejection reason is mandatory (FR-005, FR-006, Decision UD-03).', 'error');
      return;
    }

    const user = getCurrentUser();
    req.status = 'Rejected'; // Terminal state per Decision UD-03
    req.currentRejectionReason = reason;
    req.rejectionHistory.push({
      stage: user.role === ROLES.MANAGER ? 'Manager' : 'Finance',
      rejectedBy: user.fullName,
      rejectedAt: 'Just now',
      rejectionReason: reason
    });

    const eventType = user.role === ROLES.MANAGER ? 'MANAGER_REJECTED' : 'FINANCE_REJECTED';
    req.timeline.push({
      id: `tl-${Date.now()}`,
      eventType,
      actorName: user.fullName,
      actorRole: user.role,
      timestamp: 'Just now',
      rejectionReason: reason,
      desc: `Rejected. Requisition is terminal. Requester must submit a new requisition with corrected quantities (Decision UD-03).`
    });

    state.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
      performedByName: user.fullName,
      performedByRole: user.role,
      entity: 'Requisition',
      entityId: req.code,
      action: 'REJECT',
      detailsSummary: `Requisition rejected by ${user.role}: "${reason}"`,
      details: {
        eventType,
        rejectionReason: reason,
        newStatus: 'Rejected'
      }
    });

    closeAllModals();
    renderRequisitionDetail();
    showToast(`Requisition ${req.code} rejected. Record is now terminal.`, 'info');
  }

  // --- MOD-REQ-CANCEL: Creator Cancels Own Requisition (Decision U-01, FR-024) ---
  function openReqCancelModal(reqId) {
    state.selectedRequisitionId = reqId;
    const modal = document.getElementById('modal-req-cancel');
    if (modal) modal.classList.add('open');
  }

  function confirmReqCancel() {
    const req = state.requisitions.find(r => r.id === state.selectedRequisitionId);
    if (!req) return;

    req.status = 'Cancelled';
    req.timeline.push({
      id: `tl-${Date.now()}`,
      eventType: 'CANCELLED',
      actorName: getCurrentUser().fullName,
      actorRole: getCurrentUser().role,
      timestamp: 'Just now',
      desc: 'Requisition permanently cancelled by creator.'
    });

    closeAllModals();
    renderRequisitionDetail();
    showToast(`Requisition ${req.code} cancelled.`, 'info');
  }

  // --- MOD-EXCESS-AUTHORIZE: Dual Authorization (Steps 2 & 3 per Decision U-05.2, UD-01) ---
  function openExcessAuthorizeModal(reqId, actionType) {
    state.selectedRequisitionId = reqId;
    state.excessActionType = actionType;

    const req = state.requisitions.find(r => r.id === reqId);
    if (!req) return;

    const modal = document.getElementById('modal-excess-authorize');
    document.getElementById('modal-excess-req-code').textContent = req.code;
    document.getElementById('modal-excess-units').textContent = req.excessDetails ? req.excessDetails.excessUnits : '10';
    document.getElementById('modal-excess-cost').textContent = req.excessDetails ? `$${req.excessDetails.excessFinancialCommitment.toFixed(2)}` : '$450.00';

    const reasonGroup = document.getElementById('modal-excess-reject-reason-group');
    const submitBtn = document.getElementById('modal-excess-btn-submit');

    if (actionType === 'approve') {
      if (reasonGroup) reasonGroup.style.display = 'none';
      if (submitBtn) {
        submitBtn.className = 'btn btn-primary';
        submitBtn.textContent = 'Authorize Excess Delivery';
      }
    } else {
      if (reasonGroup) reasonGroup.style.display = 'block';
      if (submitBtn) {
        submitBtn.className = 'btn btn-danger';
        submitBtn.textContent = 'Reject Excess Delivery';
      }
    }

    if (modal) modal.classList.add('open');
  }

  function submitExcessAuthorization() {
    const req = state.requisitions.find(r => r.id === state.selectedRequisitionId);
    if (!req) return;

    const user = getCurrentUser();
    const action = state.excessActionType;

    if (action === 'approve') {
      if (user.role === ROLES.MANAGER) {
        req.status = 'ExcessPendingFinance';
        req.timeline.push({
          id: `tl-${Date.now()}`,
          eventType: 'EXCESS_MANAGER_APPROVED',
          actorName: user.fullName,
          actorRole: user.role,
          timestamp: 'Just now',
          desc: 'Manager authorized operational necessity of excess delivery (Step 2).'
        });
        showToast('Excess delivery operational need authorized by Manager. Routed to Finance (Step 3).', 'success');
      } else if (user.role === ROLES.FINANCE) {
        req.status = 'ExcessApproved';
        req.timeline.push({
          id: `tl-${Date.now()}`,
          eventType: 'EXCESS_FINANCE_APPROVED',
          actorName: user.fullName,
          actorRole: user.role,
          timestamp: 'Just now',
          desc: 'Finance authorized fiscal commitment for excess delivery (Step 3). Ready for Clerk receipt.'
        });
        showToast('Excess delivery authorized by Finance! Clerk can now commit all units at loading dock.', 'success');
      }
    } else {
      // Reject Excess (Decision UD-01: surplus rejected, approved quantity remains eligible for receipt)
      const reason = document.getElementById('modal-excess-reject-reason').value.trim();
      if (!reason) {
        showToast('Mandatory rejection reason required.', 'error');
        return;
      }

      req.status = 'ExcessRejected';
      req.currentRejectionReason = reason;
      req.timeline.push({
        id: `tl-${Date.now()}`,
        eventType: 'EXCESS_REJECTED',
        actorName: user.fullName,
        actorRole: user.role,
        timestamp: 'Just now',
        rejectionReason: reason,
        desc: `Excess delivery rejected by ${user.role}. Under Decision UD-01, Clerk may receive originally approved units; excess refused at dock.`
      });

      showToast('Excess rejected. Under rule UD-01, Clerk can still receive approved units at dock.', 'info');
    }

    closeAllModals();
    renderRequisitionDetail();
  }

  // --- Goods Receipt Verification Submit (Decision U-05, U-05.1, UD-01) ---
  function onReceiptQtyChange(index, newVal, approvedVal) {
    const varianceCell = document.getElementById(`receipt-variance-cell-${index}`);
    if (varianceCell) {
      varianceCell.innerHTML = getVarianceBadge(newVal, approvedVal);
    }
    updateReceiptSummary();
  }

  function submitGoodsReceipt() {
    const req = state.requisitions.find(r => r.id === state.selectedRequisitionId);
    if (!req) return;

    let hasExcess = false;
    let hasPartial = false;
    const inputs = document.querySelectorAll('.receipt-input-qty');

    inputs.forEach((input, index) => {
      const val = parseInt(input.value, 10) || 0;
      const approved = parseInt(input.dataset.approved, 10) || 0;
      req.items[index].receivedQty = val;
      if (val > approved) hasExcess = true;
      if (val < approved) hasPartial = true;
    });

    // Case A: Excess Trigger (Step 1 per Decision U-05.2)
    if (hasExcess && req.status !== 'ExcessApproved') {
      req.status = 'ExcessPendingManager';
      req.timeline.push({
        id: `tl-${Date.now()}`,
        eventType: 'EXCESS_REQUESTED',
        actorName: getCurrentUser().fullName,
        actorRole: getCurrentUser().role,
        timestamp: 'Just now',
        desc: 'Delivered counts exceeded approved quantity at dock. Excess authorization request submitted to Manager (Step 1).'
      });
      showToast('Physical excess recorded! Excess delivery authorization initiated (Step 1).', 'info');
      navigateTo('requisition-detail', { selectedRequisitionId: req.id });
      return;
    }

    // Case B: Standard / Partial Goods Receipt Confirmation Modal
    const modal = document.getElementById('modal-receipt-confirm');
    if (modal) modal.classList.add('open');
  }

  function confirmGoodsReceiptFinal() {
    const req = state.requisitions.find(r => r.id === state.selectedRequisitionId);
    if (!req) return;

    // Increment inventory atomically
    req.items.forEach(line => {
      const item = state.items.find(i => i.id === line.itemId);
      if (item && line.receivedQty) {
        item.quantity += line.receivedQty;
      }
    });

    req.status = 'Received'; // Terminal state
    req.timeline.push({
      id: `tl-${Date.now()}`,
      eventType: 'RECEIVED',
      actorName: getCurrentUser().fullName,
      actorRole: getCurrentUser().role,
      timestamp: 'Just now',
      desc: 'Goods receipt verified and completed at loading dock. Inventory stock quantities incremented atomically (Decision U-05.1).'
    });

    state.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
      performedByName: getCurrentUser().fullName,
      performedByRole: getCurrentUser().role,
      entity: 'Requisition',
      entityId: req.code,
      action: 'RECEIVE',
      detailsSummary: `Goods verified and received. Status set to Received. Inventory updated.`,
      details: {
        eventType: 'RECEIVED',
        newStatus: 'Received'
      }
    });

    closeAllModals();
    showToast(`✓ Goods Receipt completed for ${req.code}. Stock levels updated!`, 'success');
    navigateTo('requisition-detail', { selectedRequisitionId: req.id });
  }

  // --- User Governance Modals (Admin Only) ---
  function openUserRoleModal(userId) {
    const u = state.usersList.find(x => x.id === userId);
    if (!u) return;
    state.selectedTargetUserId = userId;

    document.getElementById('modal-role-user-name').textContent = u.fullName;
    document.getElementById('modal-role-select').value = u.role;

    const modal = document.getElementById('modal-user-role');
    if (modal) modal.classList.add('open');
  }

  function submitUserRoleChange() {
    const u = state.usersList.find(x => x.id === state.selectedTargetUserId);
    if (!u) return;

    const newRole = document.getElementById('modal-role-select').value;
    u.role = newRole;

    closeAllModals();
    renderUsersList();
    showToast(`Role for ${u.fullName} changed to ${newRole}.`, 'success');
  }

  function openUserDeactivateModal(userId) {
    const u = state.usersList.find(x => x.id === userId);
    if (!u) return;

    // Guards (FR-023, DataModel Rule 14): Cannot self-deactivate or deactivate last admin
    if (u.id === getCurrentUser().id) {
      showToast('Guard: You cannot deactivate your own administrative account.', 'error');
      return;
    }

    const activeAdmins = state.usersList.filter(x => x.role === ROLES.ADMIN && x.isActive);
    if (u.role === ROLES.ADMIN && activeAdmins.length <= 1) {
      showToast('Guard: System requires at least one active Admin (HTTP 409 LastAdminAccount).', 'error');
      return;
    }

    state.selectedTargetUserId = userId;
    document.getElementById('modal-deactivate-user-name').textContent = u.fullName;

    const modal = document.getElementById('modal-user-deactivate');
    if (modal) modal.classList.add('open');
  }

  function confirmUserDeactivation() {
    const u = state.usersList.find(x => x.id === state.selectedTargetUserId);
    if (!u) return;

    u.isActive = false;
    closeAllModals();
    renderUsersList();
    showToast(`Account for ${u.fullName} has been deactivated. Sessions invalidated.`, 'info');
  }

  function toggleUserActivation(userId, newStatus) {
    const u = state.usersList.find(x => x.id === userId);
    if (!u) return;
    u.isActive = newStatus;
    renderUsersList();
    showToast(`Account for ${u.fullName} reactivated.`, 'success');
  }

  // --- MOD-USER-RESET-PWD: Admin-Assisted Temporary Password Reset (Decisions U-13, UD-02) ---
  function openUserResetPwdModal(userId) {
    const u = state.usersList.find(x => x.id === userId);
    if (!u) return;
    state.selectedTargetUserId = userId;

    document.getElementById('modal-reset-user-name').textContent = u.fullName;
    document.getElementById('modal-reset-verify-checkbox').checked = false;
    document.getElementById('modal-reset-step1').style.display = 'block';
    document.getElementById('modal-reset-step2').style.display = 'none';

    const modal = document.getElementById('modal-user-reset-pwd');
    if (modal) modal.classList.add('open');
  }

  function generateTemporaryPassword() {
    const verified = document.getElementById('modal-reset-verify-checkbox').checked;
    if (!verified) {
      showToast('You must confirm internal identity verification before generating credentials.', 'error');
      return;
    }

    const u = state.usersList.find(x => x.id === state.selectedTargetUserId);
    if (!u) return;

    // Generate single-use temporary password expiring in 24 hours (Decision UD-02)
    const tempPassword = `Temp-${Math.floor(100000 + Math.random() * 900000)}!`;
    u.mustChangePassword = true;

    document.getElementById('modal-reset-temp-password-box').value = tempPassword;
    document.getElementById('modal-reset-step1').style.display = 'none';
    document.getElementById('modal-reset-step2').style.display = 'block';

    showToast(`Temporary password generated for ${u.fullName} (24-hour validity).`, 'success');
  }

  function copyTempPassword() {
    const copyBox = document.getElementById('modal-reset-temp-password-box');
    copyBox.select();
    navigator.clipboard.writeText(copyBox.value);
    showToast('Temporary password copied to clipboard! Transmit out-of-band.', 'info');
  }

  // --- MOD-AUDIT-DETAIL: JSON Inspector (FR-014) ---
  function openAuditDetailModal(auditId) {
    const log = state.auditLogs.find(a => a.id === auditId);
    if (!log) return;

    document.getElementById('modal-audit-json-box').textContent = JSON.stringify(log, null, 2);
    const modal = document.getElementById('modal-audit-detail');
    if (modal) modal.classList.add('open');
  }

  // ==========================================================================
  // 5. GLOBAL UI & PROTOTYPE UTILITIES
  // ==========================================================================

  function renderStatusChip(status) {
    const classMap = {
      Pending: 'chip-pending',
      ManagerApproved: 'chip-manager-approved',
      FinanceApproved: 'chip-finance-approved',
      ExcessPendingManager: 'chip-excess-manager',
      ExcessPendingFinance: 'chip-excess-finance',
      ExcessApproved: 'chip-excess-approved',
      ExcessRejected: 'chip-excess-rejected',
      Received: 'chip-received',
      Rejected: 'chip-rejected',
      Cancelled: 'chip-cancelled'
    };
    return `<span class="chip ${classMap[status] || 'chip-default'}">${status}</span>`;
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 768) {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
      if (sidebar) sidebar.classList.toggle('mobile-open', state.mobileSidebarOpen);
    } else {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      if (sidebar) sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
    }
  }

  function toggleAnnotations() {
    state.showAnnotations = !state.showAnnotations;
    document.querySelectorAll('.wireframe-annotation').forEach(el => {
      el.style.display = state.showAnnotations ? 'block' : 'none';
    });
    const btn = document.getElementById('demo-toggle-annotations-btn');
    if (btn) btn.classList.toggle('active', state.showAnnotations);
    showToast(`Wireframe Annotations: ${state.showAnnotations ? 'Enabled' : 'Hidden'}`, 'info');
  }

  function cycleSseStatus() {
    const statuses = ['connected', 'reconnecting', 'disconnected'];
    const nextIdx = (statuses.indexOf(state.sseStatus) + 1) % statuses.length;
    state.sseStatus = statuses[nextIdx];

    const pill = document.getElementById('topbar-sse-pill');
    const dot = document.getElementById('topbar-sse-dot');
    const text = document.getElementById('topbar-sse-text');

    if (dot && text) {
      dot.className = `sse-dot ${state.sseStatus}`;
      if (state.sseStatus === 'connected') text.textContent = 'Live';
      else if (state.sseStatus === 'reconnecting') text.textContent = 'Reconnecting...';
      else text.textContent = 'Offline';
    }

    showToast(`SSE Connection Simulated State: ${state.sseStatus.toUpperCase()}`, 'info');
  }

  function toggleUserDropdown() {
    const menu = document.getElementById('user-dropdown-menu');
    if (menu) menu.classList.toggle('open');
  }

  function setRequisitionsTab(tabId) {
    state.requisitionsTab = tabId;
    renderRequisitionsList();
  }

  function resetItemFilters() {
    state.itemFilter = { search: '', location: 'ALL', stockStatus: 'ALL', catalogStatus: 'ACTIVE' };
    const searchInput = document.getElementById('catalog-search-input');
    const locSelect = document.getElementById('catalog-location-select');
    const stockSelect = document.getElementById('catalog-stock-select');
    const statusSelect = document.getElementById('catalog-filter-status');

    if (searchInput) searchInput.value = '';
    if (locSelect) locSelect.value = 'ALL';
    if (stockSelect) stockSelect.value = 'ALL';
    if (statusSelect) statusSelect.value = 'ACTIVE';

    renderItemsCatalog();
  }

  function resetDemoData() {
    location.reload();
  }

  // ==========================================================================
  // 6. INITIALIZATION & EXPOSURE
  // ==========================================================================

  window.IPMS = {
    state,
    switchRole,
    navigateTo,
    toggleSidebar,
    toggleAnnotations,
    cycleSseStatus,
    toggleUserDropdown,
    setRequisitionsTab,
    resetItemFilters,
    resetDemoData,
    showToast,
    renderDashboard,
    renderItemsCatalog,
    renderRequisitionsList,
    renderUsersList,
    renderAuditLogs,
    renderNotificationList,

    // Drawers
    openItemDetailDrawer,
    openNotificationDrawer,
    closeAllDrawers,
    closeAllModals,
    onNotificationClick,
    markNotifRead: function (id) {
      const n = state.notifications.find(x => x.id === id);
      if (n) n.read = true;
      renderNotificationList('all');
    },

    // Modals
    openItemCreateModal,
    submitItemCreate,
    openItemEditModal,
    submitItemEdit,
    openStockAdjustModal,
    onAdjustInputChange,
    submitStockAdjustment,
    openItemDeleteModal,
    confirmItemDelete,
    openCustomExportModal,
    triggerQuickExport,
    submitCustomExport,
    downloadCsvExport,

    // Requisition creation & actions
    addLineItemToNewReq,
    updateReqLineQty,
    removeReqLine,
    submitNewRequisition,
    managerApproveReq,
    financeApproveReq,
    openReqRejectModal,
    submitRequisitionRejection,
    openReqCancelModal,
    confirmReqCancel,
    openExcessAuthorizeModal,
    submitExcessAuthorization,

    // Goods receipt
    onReceiptQtyChange,
    submitGoodsReceipt,
    confirmGoodsReceiptFinal,

    // User management
    openUserRoleModal,
    submitUserRoleChange,
    openUserDeactivateModal,
    confirmUserDeactivation,
    toggleUserActivation,
    openUserResetPwdModal,
    generateTemporaryPassword,
    copyTempPassword,

    // Audit logs
    openAuditDetailModal
  };

  // DOMContentLoaded Handler
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize with default role (Inventory Clerk to showcase procurement focus)
    switchRole('clerk');
    navigateTo('dashboard');

    // Click outside to close user dropdown & drawers
    document.addEventListener('click', (e) => {
      const userMenu = document.getElementById('user-dropdown-menu');
      const userTrigger = document.getElementById('user-menu-trigger');
      if (userMenu && userMenu.classList.contains('open') && !userMenu.contains(e.target) && !userTrigger.contains(e.target)) {
        userMenu.classList.remove('open');
      }
    });

    // Escape key closes modals and drawers
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
        closeAllDrawers();
      }
    });

    // Search inputs with simple debouncing
    const catalogSearchInput = document.getElementById('catalog-search-input');
    if (catalogSearchInput) {
      catalogSearchInput.addEventListener('input', (e) => {
        state.itemFilter.search = e.target.value;
        renderItemsCatalog();
      });
    }

    const reqSearchInput = document.getElementById('req-search-input');
    if (reqSearchInput) {
      reqSearchInput.addEventListener('input', (e) => {
        state.reqFilter.search = e.target.value;
        renderRequisitionsList();
      });
    }

    const userSearchInput = document.getElementById('users-search-input');
    if (userSearchInput) {
      userSearchInput.addEventListener('input', (e) => {
        state.userFilter.search = e.target.value;
        renderUsersList();
      });
    }

    const auditActorSearch = document.getElementById('audit-actor-search');
    if (auditActorSearch) {
      auditActorSearch.addEventListener('input', (e) => {
        state.auditFilter.actor = e.target.value;
        renderAuditLogs();
      });
    }
  });

})();
