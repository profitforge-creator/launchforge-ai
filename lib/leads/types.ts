export type LeadUrgency = "this-week" | "this-month" | "later";
export type LeadStatus = "new" | "qualified" | "nurture" | "low-fit" | "closed";
export type LeadPriority = "high" | "medium" | "low";
export type FollowUpState = "draft" | "approved" | "sent" | "archived";

export interface LeadInput {
  name: string;
  email: string;
  company: string;
  website: string;
  budget: string;
  urgency: LeadUrgency;
  need: string;
}

export interface LeadClassification {
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
  reasons: string[];
}

export interface LeadRecord extends LeadInput {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  classification: LeadClassification;
  followUpDraft: string;
  followUpState: FollowUpState;
}

export interface WeeklyLeadDigest {
  totalLeads: number;
  qualifiedCount: number;
  nurtureCount: number;
  lowFitCount: number;
  averageScore: number;
  topOpportunities: string[];
  summary: string;
}

export interface LeadActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
