export type LeadStatus = "new" | "reviewed" | "contacted" | "qualified" | "archived";

export interface ILead {
  _id?: any;
  leadId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  category: string;
  city: string;
  state: string;
  country: string;
  address: string;
  source: string;
  notes: string;
  customFields?: Record<string, string | number | boolean | null>;
  status: LeadStatus;
  batchId: string;
  listIds?: string[];
  isDuplicate?: boolean;
  duplicateOf?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

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
  errorMessage?: string | null;
  columnMapping?: Record<string, string>;
  previewRows?: Record<string, any>[];
  detectedHeaders?: string[];
  uploadedBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type ShareMode = "restricted" | "public";

export interface ILeadShare {
  _id?: any;
  shareId: string;
  title: string;
  description?: string;
  mode: ShareMode;
  token: string;
  listId?: string;
  leadIds?: string[];
  allowedFields: string[];
  hasPassword?: boolean;
  passwordHash?: string | null;
  expiresAt?: string | Date | null;
  maxViews?: number | null;
  viewCount: number;
  isRevoked: boolean;
  lastAccessedAt?: string | Date | null;
  createdBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ILeadAnalytics {
  totalLeads: number;
  leadsThisMonth: number;
  totalBatches: number;
  failedBatches: number;
  duplicatesDetected: number;
  privateListsCount: number;
  activeRestrictedShares: number;
  publicPublishedShares: number;
  statusBreakdown: Record<LeadStatus, number>;
}
