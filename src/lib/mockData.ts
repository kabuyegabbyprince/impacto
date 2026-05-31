import {
  User,
  Organization,
  OrgMember,
  Event,
  Meeting,
  NewsPost,
  ChatChannel,
  ChatMessage,
  Goal,
  Grant,
  LedgerEntry,
  Donation,
  ErrorReport,
  SubscriptionPayment,
  MemberTier,
  PlatformSettings
} from "../types";

// Seed data
const defaultUsers: User[] = [
  {
    id: "user-super",
    email: "superadmin@impacto.org",
    full_name: "Gaby Prince Kabuye",
    is_superadmin: true,
    created_at: new Date("2026-01-01").toISOString()
  },
  {
    id: "user-admin",
    email: "admin@impacto.org",
    full_name: "Anatole Mugisha",
    is_superadmin: false,
    created_at: new Date("2026-02-01").toISOString()
  },
  {
    id: "user-member",
    email: "member@impacto.org",
    full_name: "Divine Uwera",
    is_superadmin: false,
    created_at: new Date("2026-03-01").toISOString()
  },
  {
    id: "user-donor",
    email: "john@funder.org",
    full_name: "John Radcliffe",
    is_superadmin: false,
    created_at: new Date("2026-04-01").toISOString()
  }
];

const defaultOrgs: Organization[] = [
  {
    id: "org-rfc",
    name: "Rwanda Forestry Center",
    slug: "rfc",
    tagline: "Restoring hillsides and greening Kigali's future",
    description: "Our mission is to achieve 1 million impact milestones across regional initiatives by 2028, training local cooperatives in effective resource management.",
    mission: "To inspire community-led landscape restoration for climate resilience.",
    vision: "A green and climate-resilient Rwanda with flourishing indigenous woodlands.",
    logo_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80",
    primary_color: "#16a34a",
    secondary_color: "#ca8a04",
    language: "en",
    auto_confirm_members: true,
    donations_enabled: true,
    donation_mtn_number: "0788123456",
    donation_airtel_number: "0733123456",
    donation_account_name: "Rwanda Forestry Center",
    donation_description: "Support our regional project. Every 1,000 RWF contributes to active community development.",
    subscription_status: "active",
    subscription_ends_at: new Date("2027-12-31").toISOString(),
    org_category: "Environment",
    created_at: new Date("2026-01-10").toISOString()
  },
  {
    id: "org-imbuto",
    name: "Imbuto Scholars Foundation",
    slug: "imbuto",
    tagline: "Empowering underrepresented youth in ICT",
    description: "Imbuto Scholars Foundation matches high-potential high schoolers in Rwanda with top-tier tech mentorship and university scholarships.",
    mission: "Unlocking extraordinary talent through quality secondary and tertiary resources.",
    vision: "Leading tech-driven sustainable economies throughout East Africa.",
    logo_url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=150&auto=format&fit=crop&q=80",
    cover_url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80",
    primary_color: "#1d4ed8",
    secondary_color: "#f59e0b",
    language: "fr",
    auto_confirm_members: false,
    donations_enabled: true,
    donation_mtn_number: "0788777888",
    donation_airtel_number: "0733777888",
    donation_account_name: "Imbuto Scholars Trust",
    donation_description: "Help buy laptops for 20 incoming female engineering students.",
    subscription_status: "trial",
    subscription_ends_at: new Date("2026-06-30").toISOString(),
    org_category: "Education",
    created_at: new Date("2026-05-01").toISOString()
  }
];

const defaultMembers: OrgMember[] = [
  {
    id: "member-1",
    org_id: "org-rfc",
    user_id: "user-admin",
    role: "org_admin",
    status: "active",
    member_number: "RFC-001",
    tier_id: "tier-gold",
    joined_at: new Date("2026-01-10").toISOString()
  },
  {
    id: "member-2",
    org_id: "org-rfc",
    user_id: "user-member",
    role: "member",
    status: "active",
    member_number: "RFC-014",
    tier_id: "tier-bronze",
    joined_at: new Date("2026-03-01").toISOString()
  },
  {
    id: "member-3",
    org_id: "org-imbuto",
    user_id: "user-admin",
    role: "org_admin",
    status: "active",
    member_number: "IS-001",
    joined_at: new Date("2026-05-01").toISOString()
  }
];

const defaultTiers: MemberTier[] = [
  {
    id: "tier-gold",
    org_id: "org-rfc",
    name: "Gold Conservator",
    annual_fee: 50000,
    currency: "RWF",
    benefits: ["Priority planting access", "Quarterly printed audits", "Annual Forest banquet invitation"],
    color: "#ca8a04"
  },
  {
    id: "tier-bronze",
    org_id: "org-rfc",
    name: "Seedling Guardian",
    annual_fee: 10000,
    currency: "RWF",
    benefits: ["Eco-badge on active lists", "Bi-annual planting meetups"],
    color: "#854d0e"
  }
];

const defaultEvents: Event[] = [];

const defaultMeetings: Meeting[] = [
  {
    id: "meet-1",
    org_id: "org-rfc",
    title: "Q2 Operations & Seedling Distribution",
    date_time: "2026-06-01T09:00:00Z",
    duration: 90,
    location: "Kacyiru Registry Hub & Google Meet",
    link: "https://meet.google.com/abc-defg-hij",
    agenda: [
      { title: "Review of Bugesera soil testing records", presenter: "Anatole Mugisha", duration: 25 },
      { title: "Cooperatives logistics planning", presenter: "Divine Uwera", duration: 30 },
      { title: "Seedling sourcing budget checks", presenter: "Anatole Mugisha", duration: 25 }
    ],
    minutes: "### Q2 Operations Overview\n\nMinutes prepared by Anatole Mugisha.\nAll key points agreed upon. Seedling logistics confirmed with transport service on 0788-XXX.",
    status: "scheduled"
  }
];

const defaultNews: NewsPost[] = [];

const defaultChannels: ChatChannel[] = [
  { id: "chan-general", org_id: "org-rfc", name: "general-announcements", type: "announcement", created_by: "user-admin" },
  { id: "chan-chat", org_id: "org-rfc", name: "member-chat", type: "group", created_by: "user-admin" }
];

const defaultMessages: ChatMessage[] = [
  {
    id: "msg-1",
    channel_id: "chan-chat",
    sender_id: "user-admin",
    text: "Welcome back everyone! Our general planning documents are uploaded under documents tab.",
    created_at: "2026-05-24T10:00:00Z",
    sender_name: "Anatole Mugisha",
    sender_avatar: ""
  },
  {
    id: "msg-2",
    channel_id: "chan-chat",
    sender_id: "user-member",
    text: "Thanks Anatole! Looking forward to Mt. Kigali Planting Day.",
    created_at: "2026-05-24T10:05:00Z",
    sender_name: "Divine Uwera",
    sender_avatar: ""
  }
];

const defaultGoals: Goal[] = [];

const defaultGrants: Grant[] = [];

const defaultLedger: LedgerEntry[] = [
  {
    id: "led-1",
    org_id: "org-rfc",
    type: "income",
    amount: 1200000,
    currency: "RWF",
    category: "donation",
    description: "Major contribution from Kayonza Conservation Fund",
    date: "2026-05-15",
    reference: "MOMO-95514210"
  },
  {
    id: "led-2",
    org_id: "org-rfc",
    type: "expense",
    amount: 350000,
    currency: "RWF",
    category: "rent",
    description: "Monthly Nursery Land Rental Space - Gatsibo Site",
    date: "2026-05-01",
    reference: "VOUCHER-04"
  },
  {
    id: "led-3",
    org_id: "org-rfc",
    type: "expense",
    amount: 140000,
    currency: "RWF",
    category: "equipment",
    description: "Purchased premium compost spades and gardening tubes",
    date: "2026-05-04",
    reference: "MOMO-9524041"
  }
];

const defaultDonations: Donation[] = [
  {
    id: "don-1",
    org_id: "org-rfc",
    amount: 10000,
    donor_name: "Alphonse Nshuti",
    donor_email: "nshuti@gmail.com",
    message: "Keep reforesting our beautiful mountains!",
    payment_method: "mtn",
    status: "confirmed",
    created_at: "2026-05-12T14:24:00Z"
  },
  {
    id: "don-2",
    org_id: "org-rfc",
    amount: 25000,
    donor_name: "Marie-Louise Mukamana",
    donor_email: "mlouise@yahoo.com",
    message: "Donating on behalf of the Gisozi youth cell.",
    payment_method: "airtel",
    status: "awaiting_approval",
    proof_url: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300&auto=format&fit=crop&q=80",
    created_at: "2026-05-24T12:00:00Z"
  }
];

const defaultErrors: ErrorReport[] = [
  {
    id: "err-1",
    org_id: "org-rfc",
    title: "Ledger export failing in Chrome",
    description: "When downloading CSV, the currency markers are broken for accented symbols.",
    priority: "normal",
    status: "open",
    created_at: "2026-05-20T10:00:00Z"
  }
];

const defaultSubscriptionPayments: SubscriptionPayment[] = [];

// Storage utilities
const load = <T>(key: string, backup: T): T => {
  const data = localStorage.getItem(`impacto_mock_v3_${key}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return backup;
    }
  }
  // save default
  localStorage.setItem(`impacto_mock_v3_${key}`, JSON.stringify(backup));
  return backup;
};

const save = <T>(key: string, data: T): void => {
  localStorage.setItem(`impacto_mock_v3_${key}`, JSON.stringify(data));
};

export class MockDB {
  static getUsers(): User[] { return load("users", defaultUsers); }
  static saveUsers(data: User[]) { save("users", data); }

  static getOrgs(): Organization[] { return load("orgs", defaultOrgs); }
  static saveOrgs(data: Organization[]) { save("orgs", data); }

  static getMembers(): OrgMember[] { return load("members", defaultMembers); }
  static saveMembers(data: OrgMember[]) { save("members", data); }

  static getTiers(): MemberTier[] { return load("tiers", defaultTiers); }
  static saveTiers(data: MemberTier[]) { save("tiers", data); }

  static getEvents(): Event[] { return load("events", defaultEvents); }
  static saveEvents(data: Event[]) { save("events", data); }

  static getMeetings(): Meeting[] { return load("meetings", defaultMeetings); }
  static saveMeetings(data: Meeting[]) { save("meetings", data); }

  static getNews(): NewsPost[] { return load("news", defaultNews); }
  static saveNews(data: NewsPost[]) { save("news", data); }

  static getChannels(): ChatChannel[] { return load("channels", defaultChannels); }
  static saveChannels(data: ChatChannel[]) { save("channels", data); }

  static getMessages(): ChatMessage[] { return load("messages", defaultMessages); }
  static saveMessages(data: ChatMessage[]) { save("messages", data); }

  static getGoals(): Goal[] { return load("goals", defaultGoals); }
  static saveGoals(data: Goal[]) { save("goals", data); }

  static getGrants(): Grant[] { return load("grants", defaultGrants); }
  static saveGrants(data: Grant[]) { save("grants", data); }

  static getLedger(): LedgerEntry[] { return load("ledger", defaultLedger); }
  static saveLedger(data: LedgerEntry[]) { save("ledger", data); }

  static getDonations(): Donation[] { return load("donations", defaultDonations); }
  static saveDonations(data: Donation[]) { save("donations", data); }

  static getErrors(): ErrorReport[] { return load("errors", defaultErrors); }
  static saveErrors(data: ErrorReport[]) { save("errors", data); }

  static getSubPayments(): SubscriptionPayment[] { return load("sub_payments", defaultSubscriptionPayments); }
  static saveSubPayments(data: SubscriptionPayment[]) { save("sub_payments", data); }

  // Shared Helper
  static getPlatformSettings(): PlatformSettings {
    const backup: PlatformSettings = {
      usd_to_rwf_rate: 1300,
      eur_to_rwf_rate: 1400,
      kes_to_rwf_rate: 10,
      mtn_payment_number: "0788100100",
      airtel_payment_number: "0733100100",
      payment_name: "VIRELLIX INC"
    };
    return load("platform_settings", backup);
  }

  static savePlatformSettings(data: PlatformSettings) {
    save("platform_settings", data);
  }

  // ==========================================
  // V2 ADDITIONAL MODULE DATA LAYERS
  // ==========================================
  static getPollMessages(): any[] { return load("v2_poll_messages", []); }
  static savePollMessages(data: any[]) { save("v2_poll_messages", data); }

  static getPollResponses(): any[] { return load("v2_poll_responses", []); }
  static savePollResponses(data: any[]) { save("v2_poll_responses", data); }

  static getActivityLogs(): any[] { return load("v2_activity_logs", []); }
  static saveActivityLogs(data: any[]) { save("v2_activity_logs", data); }

  static getActivityAttendance(): any[] { return load("v2_activity_attendance", []); }
  static saveActivityAttendance(data: any[]) { save("v2_activity_attendance", data); }

  static getMessageTemplates(): any[] {
    const defaultTemplates = [
      {
        id: "sys-tmp-1",
        org_id: "all",
        name: "Welcome New Member",
        occasion: "Welcome New Member",
        subject: "Welcome to our family!",
        body: "Dear {{member_first_name}},\n\nWe are absolutely delighted to welcome you to {{org_name}}! Your registration was confirmed on {{join_date}}.\n\nWarm regards,\n{{admin_name}}",
        variables: ["member_first_name", "org_name", "join_date", "admin_name"],
        is_system_template: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "sys-tmp-2",
        org_id: "all",
        name: "Absence Follow-up",
        occasion: "Absense Follow-up",
        subject: "We missed you!",
        body: "Dear {{member_first_name}},\n\nWe missed your presence at our recent community activity '{{activity_title}}' held on {{activity_date}}. We hope all is well! Please let us know if there's any support you need from the {{org_name}} team.\n\nBest,\n{{admin_name}}",
        variables: ["member_first_name", "activity_title", "activity_date", "org_name", "admin_name"],
        is_system_template: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "sys-tmp-3",
        org_id: "all",
        name: "Attendance Thank You",
        occasion: "Attendance Thank You",
        subject: "Thank you for participating",
        body: "Hi {{member_first_name}},\n\nThank you for volunteering and participating in our '{{activity_title}}' on {{activity_date}}! Your energy drives {{org_name}} forward.",
        variables: ["member_first_name", "activity_title", "activity_date", "org_name"],
        is_system_template: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "sys-tmp-4",
        org_id: "all",
        name: "Dues Reminder",
        occasion: "Dues Reminder",
        subject: "Annual contribution reminder",
        body: "Hello {{member_name}},\n\nThis is a friendly reminder that your membership contribution of {{dues_amount}} for the year {{dues_year}} is pending. Contributions support vital infrastructure in {{org_name}}.\n\nThank you!",
        variables: ["member_name", "dues_amount", "dues_year", "org_name"],
        is_system_template: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    return load("v2_message_templates", defaultTemplates);
  }
  static saveMessageTemplates(data: any[]) { save("v2_message_templates", data); }

  static getNotificationSends(): any[] { return load("v2_notification_sends", []); }
  static saveNotificationSends(data: any[]) { save("v2_notification_sends", data); }

  static getEventRSVPs(): any[] { return load("v2_event_rsvps", []); }
  static saveEventRSVPs(data: any[]) { save("v2_event_rsvps", data); }

  static getEventWaitlist(): any[] { return load("v2_event_waitlist", []); }
  static saveEventWaitlist(data: any[]) { save("v2_event_waitlist", data); }

  static getIdentityVerifications(): any[] { return load("v2_identity_verifications", []); }
  static saveIdentityVerifications(data: any[]) { save("v2_identity_verifications", data); }

  static getDocuments(): any[] {
    const defaultDocs: any[] = [];
    return load("v2_documents", defaultDocs);
  }
  static saveDocuments(data: any[]) { save("v2_documents", data); }

  static getDocumentAcknowledgements(): any[] { return load("v2_document_acknowledgements", []); }
  static saveDocumentAcknowledgements(data: any[]) { save("v2_document_acknowledgements", data); }

  static getResignations(): any[] { return load("v2_resignations", []); }
  static saveResignations(data: any[]) { save("v2_resignations", data); }

  static getAuditLogs(): any[] { return load("v2_audit_logs", [
    {
      id: "a-1",
      org_id: "all",
      performed_by: "u-1",
      action: "member_approved",
      action_label: "Approved Member Registration",
      target_table: "org_members",
      target_id: "m-1",
      target_label: "Alice Mukamana",
      created_at: new Date().toISOString()
    }
  ]); }
  static saveAuditLogs(data: any[]) { save("v2_audit_logs", data); }

  static getSupportConversations(): any[] { return load("v2_support_conversations", []); }
  static saveSupportConversations(data: any[]) { save("v2_support_conversations", data); }

  static getSupportMessages(): any[] { return load("v2_support_messages", []); }
  static saveSupportMessages(data: any[]) { save("v2_support_messages", data); }
}
