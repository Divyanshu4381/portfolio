// ─── Lead Status ───────────────────────────────────────────────────────────────
export type LeadStatus =
  | "new"
  | "not_contacted"
  | "contacted"
  | "follow_up"
  | "interested"
  | "not_interested"
  | "qualified"
  | "converted"
  | "archived";

// ─── Contact Status ─────────────────────────────────────────────────────────────
export type ContactStatus = "not_contacted" | "contacted" | "unreachable";

// ─── Lead Record ────────────────────────────────────────────────────────────────
export interface ILead {
  _id?: any;
  leadId: string;
  // Core identity
  companyName: string;
  contactPerson: string;
  // Contact channels — STRICT: each field holds only its own data type
  email: string;        // normalized email only; never a website or phone
  phone: string;        // phone/mobile only; never an email or website
  website: string;      // URL only; never an email or phone
  // Business info
  category: string;     // industry / business category
  businessDescription?: string;
  // Location
  city: string;
  state: string;
  country: string;
  address: string;
  // Lead management
  source: string;
  contactStatus: ContactStatus;
  status: LeadStatus;
  followUpDate?: string | Date | null;
  // Internal admin-only fields (never sent to shared clients)
  internalNotes: string;
  notes: string;        // public-facing notes (may be visible to clients if permitted)
  assignedTo?: string;
  // Audit
  createdBy?: string;
  updatedBy?: string;
  // Import tracking
  batchId: string;
  listIds?: string[];
  isDuplicate?: boolean;
  duplicateOf?: string;
  customFields?: Record<string, string | number | boolean | null>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ─── Batch Import ───────────────────────────────────────────────────────────────
export type BatchStatus = "processing" | "ready_for_review" | "imported" | "failed";

export interface ILeadBatch {
  _id?: any;
  batchId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: BatchStatus;
  totalDetected: number;
  extractedCount: number;
  duplicateCount: number;
  rejectedCount: number;
  skippedCount?: number;
  errorMessage?: string | null;
  columnMapping?: Record<string, string>;
  previewRows?: Record<string, any>[];
  detectedHeaders?: string[];
  uploadedBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ─── Lead Share ──────────────────────────────────────────────────────────────────
export type ShareMode = "restricted" | "public";

/**
 * Fields that are NEVER exposable to shared clients, regardless of allowedFields.
 * Server enforces this list — it is not configurable by the client or share creator.
 */
export const PRIVATE_FIELDS = [
  "internalNotes",
  "assignedTo",
  "createdBy",
  "updatedBy",
  "batchId",
  "listIds",
  "isDuplicate",
  "duplicateOf",
  "customFields",
  "_id",
] as const;

/** Fields that shared clients are permitted to update (allowlist) */
export const CLIENT_WRITABLE_FIELDS: Array<keyof ILead> = [
  "contactStatus",
  "status",
  "followUpDate",
  "notes",
];

/** Fields that the admin PATCH endpoint accepts for update (allowlist) */
export const ADMIN_WRITABLE_FIELDS: Array<string> = [
  "companyName",
  "contactPerson",
  "email",
  "phone",
  "website",
  "category",
  "businessDescription",
  "city",
  "state",
  "country",
  "address",
  "source",
  "contactStatus",
  "status",
  "followUpDate",
  "internalNotes",
  "notes",
  "assignedTo",
];

export interface ILeadShare {
  _id?: any;
  shareId: string;
  title: string;
  description?: string;
  recipientName?: string;
  recipientEmail?: string;
  mode: ShareMode;
  /** Raw bearer token stored in URL — ideally hashed in future migrations */
  token: string;
  listId?: string;
  /** Explicit list of authorized leadIds. Empty = no leads authorized. */
  leadIds: string[];
  /** Fields visible to the recipient (enforced server-side via projection) */
  allowedFields: string[];
  /** Fields the recipient may write to (subset of CLIENT_WRITABLE_FIELDS) */
  writableFields?: string[];
  hasPassword?: boolean;
  passwordHash?: string | null;
  expiresAt?: string | Date | null;
  maxViews?: number | null;
  viewCount: number;
  isRevoked: boolean;
  lastAccessedAt?: string | Date | null;
  lastUpdateAt?: string | Date | null;
  createdBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ─── Analytics ───────────────────────────────────────────────────────────────────
export interface ILeadAnalytics {
  totalLeads: number;
  leadsThisMonth: number;
  leadsWithWebsite: number;
  leadsWithoutWebsite: number;
  leadsWithEmail: number;
  leadsWithPhone: number;
  contactedLeads: number;
  notContactedLeads: number;
  interestedLeads: number;
  followUpRequired: number;
  convertedLeads: number;
  totalBatches: number;
  failedBatches: number;
  duplicatesDetected: number;
  activeShares: number;
  revokedShares: number;
  pendingRequestsCount: number;
  statusBreakdown: Partial<Record<LeadStatus, number>>;
  contactStatusBreakdown: Partial<Record<ContactStatus, number>>;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────────
export type AuditAction =
  | "share_created"
  | "share_accessed"
  | "share_revoked"
  | "share_reactivated"
  | "share_expired"
  | "lead_status_updated_by_client"
  | "lead_updated_by_admin"
  | "batch_imported"
  | "batch_deleted"
  | "leads_deleted";

export interface ILeadAuditLog {
  _id?: any;
  action: AuditAction;
  performedBy: string;
  shareId?: string;
  leadId?: string;
  batchId?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// ─── Update Requests (Collaborative Workflow) ────────────────────────────────────
export interface ILeadUpdateRequest {
  _id?: any;
  requestId: string;
  shareToken: string;
  shareTitle?: string;
  leadId: string;
  companyName: string;
  contactPerson?: string;
  proposedStatus: LeadStatus;
  checklist: {
    contacted: boolean;
    meetingScheduled?: boolean;
    followUpNeeded?: boolean;
  };
  notes: string;
  submittedBy: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string | Date;
  reviewedAt?: string | Date;
  reviewedBy?: string;
}

// ─── Saved Filter View ────────────────────────────────────────────────────────────
export interface ISavedFilterView {
  _id?: any;
  viewId: string;
  name: string;
  description?: string;
  filters: LeadFilterParams;
  createdBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ─── Filter Params ────────────────────────────────────────────────────────────────
export interface LeadFilterParams {
  search?: string;
  status?: LeadStatus | "";
  contactStatus?: ContactStatus | "";
  category?: string;
  city?: string;
  state?: string;
  country?: string;
  batchId?: string;
  hasWebsite?: "yes" | "no" | "";
  hasEmail?: "yes" | "no" | "";
  hasPhone?: "yes" | "no" | "";
  dateField?: "createdAt" | "updatedAt" | "followUpDate";
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
