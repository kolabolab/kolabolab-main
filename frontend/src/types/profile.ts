export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  skills: string[];
  experience: string | null;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  roles: string[];
  createdAt: string;
}

export interface StartupSummary {
  id: string;
  name: string;
  stage: string;
  status: string;
}

export interface TeamMembership {
  id: string;
  name: string;
  roleTitle: string;
}

export interface StartupInvolvement {
  created: StartupSummary[];
  memberOf: TeamMembership[];
}

export interface ProfileUpdateData {
  bio?: string;
  skills?: string[];
  experience?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
}

export interface UserProfileResponse {
  user: UserProfile;
  startups: StartupInvolvement;
}
