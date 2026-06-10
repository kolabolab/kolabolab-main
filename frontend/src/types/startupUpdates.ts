export interface StartupUpdate {
  id: string;
  startupId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface StartupUpdateWithStartupName extends StartupUpdate {
  startupName: string;
}

export interface CreateUpdateRequest {
  content: string;
}

export interface UpdatesResponse {
  updates: StartupUpdate[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface DashboardFeedResponse {
  updates: StartupUpdateWithStartupName[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}
