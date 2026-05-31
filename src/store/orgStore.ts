import { create } from "zustand";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  mission?: string;
  vision?: string;
  logo_url?: string;
  cover_url?: string;
  primary_color: string;
  secondary_color: string;
  language: "en" | "fr" | "rw";
  auto_confirm_members: boolean;
  donations_enabled: boolean;
  donation_mtn_number?: string;
  donation_airtel_number?: string;
  donation_account_name?: string;
  donation_description?: string;
  subscription_status: "trial" | "active" | "expired";
  subscription_ends_at?: string;
  org_category: string;
  created_at: string;
  // Custom public portal settings
  location_name?: string;
  contact_us?: string;
  gallery_urls?: string[];
  // Members dashboard settings
  dashboard_theme?: "light" | "dark" | "custom";
  dashboard_logo?: string;
  is_public_directory?: boolean;
  allow_public_joining?: boolean;
  public_page_enabled?: boolean;
  show_goals_publicly?: boolean;
  show_impact_publicly?: boolean;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: "org_admin" | "member" | "superadmin" | "manager";
  status: "pending" | "active" | "suspended" | "resigned";
  member_number?: string;
  tier_id?: string;
  joined_at: string;
}

export interface OrgState {
  activeOrg: Organization | null;
  activeMember: OrgMember | null;
  setActiveOrg: (org: Organization | null, member: OrgMember | null) => void;
  clearOrg: () => void;
}

const getInitialOrg = (): Organization | null => {
  const saved = localStorage.getItem("impacto_active_org");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
};

const getInitialMember = (): OrgMember | null => {
  const saved = localStorage.getItem("impacto_active_member");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
};

export const useOrgStore = create<OrgState>((set) => ({
  activeOrg: getInitialOrg(),
  activeMember: getInitialMember(),
  setActiveOrg: (org, member) => {
    if (org) {
      localStorage.setItem("impacto_active_org", JSON.stringify(org));
    } else {
      localStorage.removeItem("impacto_active_org");
    }
    if (member) {
      localStorage.setItem("impacto_active_member", JSON.stringify(member));
    } else {
      localStorage.removeItem("impacto_active_member");
    }
    set({ activeOrg: org, activeMember: member });
  },
  clearOrg: () => {
    localStorage.removeItem("impacto_active_org");
    localStorage.removeItem("impacto_active_member");
    set({ activeOrg: null, activeMember: null });
  },
}));
