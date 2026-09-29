import type { JobPosting as SchemaJobPosting } from 'schema-dts';

/**
 * Extension of Schema.org JobPosting to include SaaS-specific recruitment metrics
 */
export interface JobPosting extends SchemaJobPosting {
  id: string;
  status: 'active' | 'draft' | 'closed';
  applicationCount: number;
  hiringTeam?: {
    name: string;
    lead: string;
    department: string;
  };
}

/**
 * Interface for the Dashboard UI Component
 */
export interface RecruitmentDashboardData {
  // Maps to 'Requirements' (24+)
  requirements: {
    total: number;
    displayValue: string; // e.g., "24+"
    activeBriefs: HiringBrief[];
  };
  
  // Maps to 'Applications' (148)
  applications: {
    total: number;
    newToday: number;
  };
  
  // Maps to 'Open Roles' (12)
  openRoles: {
    total: number;
    items: JobPosting[];
  };

  // For 'Teams hiring' descriptions
  teamsHiring: Array<{
    teamId: string;
    name: string;
    openCount: number;
    description: string;
  }>;
}

export interface HiringBrief {
  id: string;
  title: string;
  status: string;
}
