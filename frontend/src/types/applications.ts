export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  applicantId: string;
  startupId: string;
  roleTitle: string;
  message: string;
  highlightedSkills: string[];
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationSubmission {
  startupId: string;
  roleTitle: string;
  message: string;
  highlightedSkills?: string[];
}

export interface ApplicationWithDetails extends Application {
  applicantName: string;
  startupName: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ReceivedApplicationsResponse {
  applications: ApplicationWithDetails[];
  pagination: PaginationInfo;
}

export interface MyApplicationsResponse {
  applications: ApplicationWithDetails[];
}
