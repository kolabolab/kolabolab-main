export interface TimeSeriesDataPoint {
  period: string;
  count: number;
}

export interface PlatformMetrics {
  totalUsers: number;
  totalStartups: number;
  totalApplications: number;
  totalMessages: number;
}

export interface PopularRole {
  role: string;
  count: number;
}

export interface ActivityEvent {
  type: "signup" | "startup_created" | "application_submitted";
  description: string;
  timestamp: string;
}

export type PeriodGranularity = "daily" | "weekly" | "monthly";

export interface AnalyticsResponse {
  timeSeries: {
    signups: TimeSeriesDataPoint[];
    startups: TimeSeriesDataPoint[];
    applications: TimeSeriesDataPoint[];
  };
  platformMetrics: PlatformMetrics;
  popularRoles: PopularRole[];
  recentActivity: ActivityEvent[];
}
