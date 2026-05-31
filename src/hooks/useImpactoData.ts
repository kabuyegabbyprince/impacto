import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { MockDB } from "../lib/mockData";
import {
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
  PlatformSettings,
  PollMessage,
  PollResponse,
  ActivityLog,
  ActivityAttendance,
  MessageTemplate,
  NotificationSend,
  EventRSVP,
  EventWaitlist,
  IdentityVerification,
  Document,
  DocumentAcknowledgement,
  Resignation,
  AuditLog,
  SupportConversation,
  SupportMessage
} from "../types";

// Helper for fake latency/promises
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// 1. ORGANIZATIONS HOOKS
// ==========================================
export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      let orgs: Organization[];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("organizations")
          .select("*")
          .order("name", { ascending: true });
        if (error) throw error;
        orgs = data as Organization[];
      } else {
        await delay();
        orgs = MockDB.getOrgs();
      }
      return orgs.map((org) => {
        const localVal = localStorage.getItem(`impacto_org_is_public_directory_${org.id}`);
        const localJoin = localStorage.getItem(`impacto_org_allow_public_joining_${org.id}`);
        const localPPE = localStorage.getItem(`impacto_org_public_page_enabled_${org.id}`);
        const localSGP = localStorage.getItem(`impacto_org_show_goals_publicly_${org.id}`);
        const localSIP = localStorage.getItem(`impacto_org_show_impact_publicly_${org.id}`);
        return {
          ...org,
          is_public_directory: localVal !== null ? JSON.parse(localVal) : (org.is_public_directory ?? true),
          allow_public_joining: localJoin !== null ? JSON.parse(localJoin) : (org.allow_public_joining ?? true),
          public_page_enabled: localPPE !== null ? JSON.parse(localPPE) : (org.public_page_enabled ?? true),
          show_goals_publicly: localSGP !== null ? JSON.parse(localSGP) : (org.show_goals_publicly ?? true),
          show_impact_publicly: localSIP !== null ? JSON.parse(localSIP) : (org.show_impact_publicly ?? true)
        };
      });
    }
  });
}

export function useOrganization(slug: string | undefined) {
  return useQuery({
    queryKey: ["organization", slug],
    queryFn: async () => {
      if (!slug) return null;
      let org: Organization | null = null;
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (error) throw error;
        org = data as Organization | null;
      } else {
        await delay();
        org = MockDB.getOrgs().find((o) => o.slug === slug) || null;
      }
      if (org) {
        const localVal = localStorage.getItem(`impacto_org_is_public_directory_${org.id}`);
        const localJoin = localStorage.getItem(`impacto_org_allow_public_joining_${org.id}`);
        const localPPE = localStorage.getItem(`impacto_org_public_page_enabled_${org.id}`);
        const localSGP = localStorage.getItem(`impacto_org_show_goals_publicly_${org.id}`);
        const localSIP = localStorage.getItem(`impacto_org_show_impact_publicly_${org.id}`);
        org = {
          ...org,
          is_public_directory: localVal !== null ? JSON.parse(localVal) : (org.is_public_directory ?? true),
          allow_public_joining: localJoin !== null ? JSON.parse(localJoin) : (org.allow_public_joining ?? true),
          public_page_enabled: localPPE !== null ? JSON.parse(localPPE) : (org.public_page_enabled ?? true),
          show_goals_publicly: localSGP !== null ? JSON.parse(localSGP) : (org.show_goals_publicly ?? true),
          show_impact_publicly: localSIP !== null ? JSON.parse(localSIP) : (org.show_impact_publicly ?? true)
        };
      }
      return org;
    },
    enabled: !!slug
  });
}

 export function useUpdateOrganization() {
   const queryClient = useQueryClient();
   return useMutation({
     mutationFn: async (payload: Partial<Organization> & { id: string }) => {
       const { id, is_public_directory, allow_public_joining, public_page_enabled, show_goals_publicly, show_impact_publicly, ...rest } = payload;
       
       if (is_public_directory !== undefined) {
         localStorage.setItem(`impacto_org_is_public_directory_${id}`, JSON.stringify(is_public_directory));
       }
       if (allow_public_joining !== undefined) {
         localStorage.setItem(`impacto_org_allow_public_joining_${id}`, JSON.stringify(allow_public_joining));
       }
       if (public_page_enabled !== undefined) {
         localStorage.setItem(`impacto_org_public_page_enabled_${id}`, JSON.stringify(public_page_enabled));
       }
       if (show_goals_publicly !== undefined) {
         localStorage.setItem(`impacto_org_show_goals_publicly_${id}`, JSON.stringify(show_goals_publicly));
       }
       if (show_impact_publicly !== undefined) {
         localStorage.setItem(`impacto_org_show_impact_publicly_${id}`, JSON.stringify(show_impact_publicly));
       }
 
       if (isSupabaseConfigured) {
         const { data, error } = await supabase
           .from("organizations")
           .update(rest)
           .eq("id", id)
           .select()
           .single();
         if (error) throw error;
         const updatedOrg = data as Organization;
         const localVal = localStorage.getItem(`impacto_org_is_public_directory_${id}`);
         const localJoin = localStorage.getItem(`impacto_org_allow_public_joining_${id}`);
         const localPPE = localStorage.getItem(`impacto_org_public_page_enabled_${id}`);
         const localSGP = localStorage.getItem(`impacto_org_show_goals_publicly_${id}`);
         const localSIP = localStorage.getItem(`impacto_org_show_impact_publicly_${id}`);
         return {
           ...updatedOrg,
           is_public_directory: localVal !== null ? JSON.parse(localVal) : (updatedOrg.is_public_directory ?? true),
           allow_public_joining: localJoin !== null ? JSON.parse(localJoin) : (updatedOrg.allow_public_joining ?? true),
           public_page_enabled: localPPE !== null ? JSON.parse(localPPE) : (updatedOrg.public_page_enabled ?? true),
           show_goals_publicly: localSGP !== null ? JSON.parse(localSGP) : (updatedOrg.show_goals_publicly ?? true),
           show_impact_publicly: localSIP !== null ? JSON.parse(localSIP) : (updatedOrg.show_impact_publicly ?? true)
         };
       }
       await delay();
       const orgs = MockDB.getOrgs();
       const idx = orgs.findIndex((o) => o.id === payload.id);
       if (idx !== -1) {
         orgs[idx] = { ...orgs[idx], ...payload };
         MockDB.saveOrgs(orgs);
         return orgs[idx];
       }
       throw new Error("Organization not found.");
     },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["organization", data.slug] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    }
  });
}

// ==========================================
// 2. MEMBER MANAGEMENT HOOKS
// ==========================================
export function useMembers(orgId: string | undefined) {
  return useQuery({
    queryKey: ["members", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("org_members")
          .select("*, user:user_id(id, email, full_name, avatar_url)")
          .eq("org_id", orgId);
        if (error) throw error;
        return data as OrgMember[];
      }
      await delay();
      const users = MockDB.getUsers();
      return MockDB.getMembers()
        .filter((m) => m.org_id === orgId)
        .map((m) => ({
          ...m,
          user: users.find((u) => u.id === m.user_id)
        })) as OrgMember[];
    },
    enabled: !!orgId
  });
}

export function useApprovedMembers(orgId: string | undefined) {
  const q = useMembers(orgId);
  return {
    ...q,
    data: q.data?.filter((m) => m.status === "active") || []
  };
}

export function useMemberTiers(orgId: string | undefined) {
  return useQuery({
    queryKey: ["tiers", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("member_tiers")
          .select("*")
          .eq("org_id", orgId);
        if (error) throw error;
        return data as MemberTier[];
      }
      await delay();
      return MockDB.getTiers().filter((t) => t.org_id === orgId);
    },
    enabled: !!orgId
  });
}

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, role, is_volunteer }: { id: string; status?: "active" | "suspended" | "pending"; role?: "org_admin" | "member"; is_volunteer?: boolean }) => {
      if (isSupabaseConfigured) {
        const updates: any = {};
        if (status) updates.status = status;
        if (role) updates.role = role;
        if (is_volunteer !== undefined) updates.is_volunteer = is_volunteer;
        const { data, error } = await supabase
          .from("org_members")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      await delay();
      const members = MockDB.getMembers();
      const idx = members.findIndex((m) => m.id === id);
      if (idx !== -1) {
        if (status) members[idx].status = status;
        if (role) members[idx].role = role;
        if (is_volunteer !== undefined) members[idx].is_volunteer = is_volunteer;
        MockDB.saveMembers(members);
        return members[idx];
      }
      throw new Error("Member not found.");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["members", data.org_id] });
    }
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, email, fullName, role }: { orgId: string; email: string; fullName: string; role: "org_admin" | "member" }) => {
      if (isSupabaseConfigured) {
        // Real logic would check if user exists or sign them up, then add org_member
        // For simple integration: we'll run a RPC or a secure transactional SQL insert
        // Here we do standard member create
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        
        let targetId = userData?.id;
        if (!targetId) {
          // Mock insertion for demonstration - in production, this relies on invite workflows
          const tempId = "u-" + Math.random().toString(36).substr(2, 9);
          const { error: insErr } = await supabase.from("users").insert({
            id: tempId,
            email,
            full_name: fullName,
            is_superadmin: false,
          });
          if (insErr) throw insErr;
          targetId = tempId;
        }

        const { data, error } = await supabase
          .from("org_members")
          .insert({
            org_id: orgId,
            user_id: targetId,
            role,
            status: "active",
            member_number: "MEM-" + Math.floor(100 + Math.random() * 900),
            joined_at: new Date().toISOString()
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      await delay();
      const users = MockDB.getUsers();
      const members = MockDB.getMembers();

      let existingUser = users.find((u) => u.email === email);
      if (!existingUser) {
        existingUser = {
          id: "u-" + Math.random().toString(36).substr(2, 9),
          email,
          full_name: fullName,
          is_superadmin: false,
          created_at: new Date().toISOString()
        };
        users.push(existingUser);
        MockDB.saveUsers(users);
      }

      const newMember: OrgMember = {
        id: "mem-" + Math.random().toString(36).substr(2, 9),
        org_id: orgId,
        user_id: existingUser.id,
        role,
        status: "active",
        member_number: "MEM-" + Math.floor(100 + Math.random() * 900),
        joined_at: new Date().toISOString()
      };
      members.push(newMember);
      MockDB.saveMembers(members);
      return newMember;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["members", data.org_id] });
    }
  });
}

// ==========================================
// 3. EVENTS HOOKS
// ==========================================
export function useEvents(orgId: string | undefined) {
  return useQuery({
    queryKey: ["events", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("org_id", orgId)
          .eq("is_deleted", false)
          .order("date_time", { ascending: true });
        if (error) throw error;
        return data as Event[];
      }
      await delay();
      return MockDB.getEvents().filter((e) => e.org_id === orgId && !e.is_deleted);
    },
    enabled: !!orgId
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Event, "id" | "attendees_count" | "qr_code_token">) => {
      if (new Date(payload.date_time) < new Date()) {
        throw new Error("Event date must be in the future.");
      }
      const qr_code_token = "token-" + Math.random().toString(36).substr(2, 9);
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("events")
          .insert({
            ...payload,
            qr_code_token,
            attendees_count: 0
          })
          .select()
          .single();
        if (error) throw error;
        return data as Event;
      }
      await delay();
      const events = MockDB.getEvents();
      const newEvent: Event = {
        ...payload,
        id: "event-" + Math.random().toString(36).substr(2, 9),
        qr_code_token,
        attendees_count: 0
      };
      events.push(newEvent);
      MockDB.saveEvents(events);
      return newEvent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events", data.org_id] });
    }
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Event> & { id: string; org_id: string }) => {
      const { id, org_id, ...updates } = payload;
      const last_edited_at = new Date().toISOString();
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("events")
          .update({ ...updates, last_edited_at })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as Event;
      }
      await delay();
      const events = MockDB.getEvents();
      const idx = events.findIndex((e) => e.id === id);
      if (idx !== -1) {
        events[idx] = { ...events[idx], ...updates, last_edited_at };
        MockDB.saveEvents(events);
        return events[idx];
      }
      throw new Error("Event not found");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events", data.org_id] });
    }
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, org_id }: { id: string; org_id: string }) => {
      const last_edited_at = new Date().toISOString();
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("events")
          .update({ is_deleted: true, last_edited_at })
          .eq("id", id);
        if (error) throw error;
        return { id, org_id };
      }
      await delay();
      const events = MockDB.getEvents();
      const idx = events.findIndex((e) => e.id === id);
      if (idx !== -1) {
        events[idx] = { ...events[idx], is_deleted: true, last_edited_at };
        MockDB.saveEvents(events);
      }
      return { id, org_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events", data.org_id] });
    }
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ event_id, member_id, method }: { event_id: string; member_id: string; method: "manual" | "qr" | "self" }) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("event_attendance")
          .insert({
            event_id,
            member_id,
            check_in_method: method,
            check_in_time: new Date().toISOString()
          });
        if (error) throw error;

        // update attendees count in events
        const { data: ev } = await supabase.from("events").select("attendees_count, org_id").eq("id", event_id).single();
        if (ev) {
          await supabase.from("events").update({ attendees_count: (ev.attendees_count || 0) + 1 }).eq("id", event_id);
          return ev.org_id;
        }
        return "";
      }
      await delay();
      const events = MockDB.getEvents();
      const idx = events.findIndex((e) => e.id === event_id);
      if (idx !== -1) {
        events[idx].attendees_count += 1;
        MockDB.saveEvents(events);
        return events[idx].org_id;
      }
      return "";
    },
    onSuccess: (org_id) => {
      if (org_id) queryClient.invalidateQueries({ queryKey: ["events", org_id] });
    }
  });
}

// ==========================================
// 4. MEETINGS HOOKS
// ==========================================
export function useMeetings(orgId: string | undefined) {
  return useQuery({
    queryKey: ["meetings", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("meetings")
          .select("*")
          .eq("org_id", orgId)
          .order("date_time", { ascending: false });
        if (error) throw error;
        return data as Meeting[];
      }
      await delay();
      return MockDB.getMeetings().filter((m) => m.org_id === orgId);
    },
    enabled: !!orgId
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Meeting, "id" | "status">) => {
      if (new Date(payload.date_time) < new Date()) {
        throw new Error("Meeting date must be in the future.");
      }
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("meetings")
          .insert({ ...payload, status: "scheduled" })
          .select()
          .single();
        if (error) throw error;
        return data as Meeting;
      }
      await delay();
      const meetings = MockDB.getMeetings();
      const newMeet: Meeting = {
        ...payload,
        id: "meet-" + Math.random().toString(36).substr(2, 9),
        status: "scheduled"
      };
      meetings.push(newMeet);
      MockDB.saveMeetings(meetings);
      return newMeet;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["meetings", data.org_id] });
    }
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Meeting> & { id: string; org_id: string }) => {
      if (isSupabaseConfigured) {
        const { id, ...rest } = payload;
        const { data, error } = await supabase
          .from("meetings")
          .update(rest)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as Meeting;
      }
      await delay();
      const meetings = MockDB.getMeetings();
      const idx = meetings.findIndex((m) => m.id === payload.id);
      if (idx !== -1) {
        meetings[idx] = { ...meetings[idx], ...payload };
        MockDB.saveMeetings(meetings);
        return meetings[idx];
      }
      throw new Error("Meeting not found");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["meetings", data.org_id] });
    }
  });
}

// ==========================================
// 5. NEWS / BLOG POSTS HOOKS
// ==========================================
export function useNews(orgId: string | undefined) {
  return useQuery({
    queryKey: ["news", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("news_posts")
          .select("*")
          .eq("org_id", orgId)
          .order("is_pinned", { ascending: false })
          .order("published_at", { ascending: false });
        if (error) throw error;
        return data as NewsPost[];
      }
      await delay();
      return MockDB.getNews().filter((p) => p.org_id === orgId);
    },
    enabled: !!orgId
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<NewsPost, "id" | "likes_count" | "comments_count">) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("news_posts")
          .insert({
            ...payload,
            likes_count: 0,
            comments_count: 0,
            published_at: payload.published_at || new Date().toISOString()
          })
          .select()
          .single();
        if (error) throw error;
        return data as NewsPost;
      }
      await delay();
      const news = MockDB.getNews();
      const newPost: NewsPost = {
        ...payload,
        id: "news-" + Math.random().toString(36).substr(2, 9),
        likes_count: 0,
        comments_count: 0,
        published_at: payload.published_at || new Date().toISOString()
      };
      news.push(newPost);
      MockDB.saveNews(news);
      return newPost;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["news", data.org_id] });
    }
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<NewsPost> & { id: string; org_id: string }) => {
      const last_edited_at = new Date().toISOString();
      if (isSupabaseConfigured) {
        const { id, ...rest } = payload;
        const { data, error } = await supabase
          .from("news_posts")
          .update({ ...rest, last_edited_at })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as NewsPost;
      }
      await delay();
      const news = MockDB.getNews();
      const idx = news.findIndex((p) => p.id === payload.id);
      if (idx !== -1) {
        news[idx] = { ...news[idx], ...payload, last_edited_at };
        MockDB.saveNews(news);
        return news[idx];
      }
      throw new Error("News post not found.");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["news", data.org_id] });
    }
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, org_id }: { id: string; org_id: string }) => {
      const last_edited_at = new Date().toISOString();
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("news_posts")
          .update({ is_deleted: true, last_edited_at })
          .eq("id", id);
        if (error) throw error;
        return { id, org_id };
      }
      await delay();
      const news = MockDB.getNews();
      const idx = news.findIndex((p) => p.id === id);
      if (idx !== -1) {
        news[idx] = { ...news[idx], is_deleted: true, last_edited_at };
        MockDB.saveNews(news);
      }
      return { id, org_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["news", data.org_id] });
    }
  });
}

// ==========================================
// 6. CHAT MESSAGES HOOKS
// ==========================================
export function useChatChannels(orgId: string | undefined) {
  return useQuery({
    queryKey: ["channels", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("chat_channels")
          .select("*")
          .eq("org_id", orgId);
        if (error) throw error;
        return data as ChatChannel[];
      }
      await delay();
      return MockDB.getChannels().filter((c) => c.org_id === orgId);
    },
    enabled: !!orgId
  });
}

export function useChatMessages(channelId: string | undefined) {
  return useQuery({
    queryKey: ["messages", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*, sender:sender_id(full_name, avatar_url)")
          .eq("channel_id", channelId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        // Mapping from relational nested info
        return data.map((m: any) => ({
          ...m,
          sender_name: m.sender?.full_name || "Unknown User",
          sender_avatar: m.sender?.avatar_url || ""
        })) as ChatMessage[];
      }
      await delay(100); // lower delay for crisp chatting click
      return MockDB.getMessages().filter((m) => m.channel_id === channelId);
    },
    enabled: !!channelId
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { orgId: string; name: string; type: "group" | "announcement" | "direct"; channel_type?: string; is_private?: boolean; createdBy: string; member_ids?: string[] }) => {
      const channelId = "chan-" + Math.random().toString(36).substring(2, 9);
      const newChannel: ChatChannel = {
        id: channelId,
        org_id: payload.orgId,
        name: payload.name,
        type: payload.type,
        channel_type: payload.channel_type as any || "general",
        is_private: payload.is_private || false,
        created_by: payload.createdBy,
        member_ids: payload.member_ids || []
      };

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("chat_channels")
          .insert({
            org_id: payload.orgId,
            name: payload.name,
            type: payload.type,
            channel_type: payload.channel_type || "general",
            is_private: payload.is_private || false,
            created_by: payload.createdBy
          })
          .select()
          .single();
        if (error) throw error;
        return data as ChatChannel;
      }
      await delay(150);
      const chans = MockDB.getChannels();
      chans.push(newChannel);
      MockDB.saveChannels(chans);
      return newChannel;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["channels", data.org_id] });
    }
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      channelId,
      senderId,
      text,
      senderName,
      message_type = "text",
      file_url,
      file_name,
      file_size,
      file_mime_type,
      voice_duration_seconds,
      reply_to_id
    }: {
      channelId: string;
      senderId: string;
      text: string;
      senderName: string;
      message_type?: "text" | "file" | "image" | "voice" | "poll" | "system";
      file_url?: string;
      file_name?: string;
      file_size?: number;
      file_mime_type?: string;
      voice_duration_seconds?: number;
      reply_to_id?: string;
    }) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("chat_messages")
          .insert({
            channel_id: channelId,
            sender_id: senderId,
            text,
            message_type,
            file_url,
            file_name,
            file_size,
            file_mime_type,
            voice_duration_seconds,
            reply_to_id,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        if (error) throw error;
        return { ...data, channel_id: channelId };
      }
      await delay(100);
      const messages = MockDB.getMessages();
      const newMsg: ChatMessage = {
        id: "msg-" + Math.random().toString(36).substring(2, 9),
        channel_id: channelId,
        sender_id: senderId,
        text,
        message_type,
        file_url,
        file_name,
        file_size,
        file_mime_type,
        voice_duration_seconds,
        reply_to_id,
        sender_name: senderName,
        sender_avatar: "",
        created_at: new Date().toISOString()
      };
      messages.push(newMsg);
      MockDB.saveMessages(messages);
      return { ...newMsg, channel_id: channelId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages", data.channel_id] });
    }
  });
}

// ==========================================
// 7. GOALS TO TRACK HOOKS
// ==========================================
export function useGoals(orgId: string | undefined) {
  return useQuery({
    queryKey: ["goals", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("goals")
          .select("*")
          .eq("org_id", orgId)
          .order("deadline", { ascending: true });
        if (error) throw error;
        return data as Goal[];
      }
      await delay();
      return MockDB.getGoals().filter((g) => g.org_id === orgId);
    },
    enabled: !!orgId
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Goal, "id" | "created_at"> & { current_progress?: number }) => {
      const startProg = payload.current_progress !== undefined ? payload.current_progress : 0;
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("goals")
          .insert({ ...payload, current_progress: startProg, created_at: new Date().toISOString() })
          .select()
          .single();
        if (error) throw error;
        return data as Goal;
      }
      await delay();
      const goals = MockDB.getGoals();
      const newGoal: Goal = {
        ...payload,
        id: "goal-" + Math.random().toString(36).substr(2, 9),
        current_progress: startProg,
        created_at: new Date().toISOString()
      };
      goals.push(newGoal);
      MockDB.saveGoals(goals);
      return newGoal;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals", data.org_id] });
    }
  });
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ goalId, value, note, orgId }: { goalId: string; value: number; note?: string; orgId: string }) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("goals")
          .update({ current_progress: value })
          .eq("id", goalId)
          .select()
          .single();
        if (error) throw error;

        // Optionally record in goal_updates
        await supabase.from("goal_updates").insert({
          goal_id: goalId,
          value,
          note,
          created_at: new Date().toISOString()
        });

        return { data, orgId };
      }
      await delay();
      const goals = MockDB.getGoals();
      const idx = goals.findIndex((g) => g.id === goalId);
      if (idx !== -1) {
        goals[idx].current_progress = value;
        MockDB.saveGoals(goals);
      }
      return { goalId, orgId };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["goals", res.orgId] });
    }
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Goal> & { id: string; org_id: string }) => {
      const { id, org_id, ...updates } = payload;
      const last_edited_at = new Date().toISOString();
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("goals")
          .update({ ...updates, last_edited_at })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as Goal;
      }
      await delay();
      const goals = MockDB.getGoals();
      const idx = goals.findIndex((g) => g.id === id);
      if (idx !== -1) {
        goals[idx] = { ...goals[idx], ...updates, last_edited_at };
        MockDB.saveGoals(goals);
        return goals[idx];
      }
      throw new Error("Goal not found");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals", data.org_id] });
    }
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, org_id }: { id: string; org_id: string }) => {
      const last_edited_at = new Date().toISOString();
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("goals")
          .update({ is_deleted: true, last_edited_at })
          .eq("id", id);
        if (error) throw error;
        return { id, org_id };
      }
      await delay();
      const goals = MockDB.getGoals();
      const idx = goals.findIndex((g) => g.id === id);
      if (idx !== -1) {
        goals[idx] = { ...goals[idx], is_deleted: true, last_edited_at };
        MockDB.saveGoals(goals);
      }
      return { id, org_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals", data.org_id] });
    }
  });
}

// ==========================================
// 8. GRANTS HOOKS
// ==========================================
export function useGrants(orgId: string | undefined) {
  return useQuery({
    queryKey: ["grants", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("grants")
          .select("*")
          .eq("org_id", orgId)
          .order("deadline", { ascending: true });
        if (error) throw error;
        return data as Grant[];
      }
      await delay();
      return MockDB.getGrants().filter((g) => g.org_id === orgId);
    },
    enabled: !!orgId
  });
}

export function useCreateGrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Grant, "id">) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("grants")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data as Grant;
      }
      await delay();
      const grants = MockDB.getGrants();
      const newGrant: Grant = {
        ...payload,
        id: "grant-" + Math.random().toString(36).substr(2, 9)
      };
      grants.push(newGrant);
      MockDB.saveGrants(grants);
      return newGrant;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["grants", data.org_id] });
    }
  });
}

export function useUpdateGrantStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ grantId, status, orgId }: { grantId: string; status: Grant["status"]; orgId: string }) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("grants")
          .update({ status })
          .eq("id", grantId)
          .select()
          .single();
        if (error) throw error;
        return { data, orgId };
      }
      await delay();
      const grants = MockDB.getGrants();
      const idx = grants.findIndex((g) => g.id === grantId);
      if (idx !== -1) {
        grants[idx].status = status;
        MockDB.saveGrants(grants);
      }
      return { grantId, orgId };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["grants", res.orgId] });
    }
  });
}

// ==========================================
// 9. BOOKKEEPING LEDGER HOOKS
// ==========================================
export function useLedgerEntries(orgId: string | undefined) {
  return useQuery({
    queryKey: ["ledger", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("ledger_entries")
          .select("*")
          .eq("org_id", orgId)
          .order("date", { ascending: false });
        if (error) throw error;
        return data as LedgerEntry[];
      }
      await delay();
      return MockDB.getLedger().filter((l) => l.org_id === orgId);
    },
    enabled: !!orgId
  });
}

export function useCreateLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<LedgerEntry, "id">) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("ledger_entries")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data as LedgerEntry;
      }
      await delay();
      const ledger = MockDB.getLedger();
      const newEntry: LedgerEntry = {
        ...payload,
        id: "led-" + Math.random().toString(36).substr(2, 9)
      };
      ledger.push(newEntry);
      MockDB.saveLedger(ledger);
      return newEntry;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ledger", data.org_id] });
    }
  });
}

// ==========================================
// 10. DONATIONS PORTAL HOOKS
// ==========================================
export function useDonations(orgId: string | undefined) {
  return useQuery({
    queryKey: ["donations", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("donations")
          .select("*")
          .eq("org_id", orgId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data as Donation[];
      }
      await delay();
      return MockDB.getDonations().filter((d) => d.org_id === orgId);
    },
    enabled: !!orgId
  });
}

export function useConfirmDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ donationId, status, orgId }: { donationId: string; status: "confirmed" | "rejected"; orgId: string }) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("donations")
          .update({ status })
          .eq("id", donationId)
          .select()
          .single();
        if (error) throw error;

        // If approved, optionally log as ledger record automatically
        if (status === "confirmed" && data) {
          await supabase.from("ledger_entries").insert({
            org_id: orgId,
            type: "income",
            amount: data.amount,
            currency: "RWF",
            category: "donation",
            description: `Donation by ${data.donor_name} via MoMo`,
            date: new Date().toISOString().split("T")[0],
            reference: `DON-${donationId.slice(0, 8)}`
          });
        }
        return { data, orgId };
      }
      await delay();
      const donations = MockDB.getDonations();
      const idx = donations.findIndex((d) => d.id === donationId);
      if (idx !== -1) {
        donations[idx].status = status;
        MockDB.saveDonations(donations);

        if (status === "confirmed") {
          const ledger = MockDB.getLedger();
          ledger.push({
            id: "led-" + Math.random().toString(36).substr(2, 9),
            org_id: orgId,
            type: "income",
            amount: donations[idx].amount,
            currency: "RWF",
            category: "donation",
            description: `Donation by ${donations[idx].donor_name} (#${donationId.slice(0, 4)})`,
            date: new Date().toISOString().split("T")[0],
            reference: `DON-${donationId.slice(0, 4)}`
          });
          MockDB.saveLedger(ledger);
        }
      }
      return { donationId, orgId };
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["donations", res.orgId] });
      queryClient.invalidateQueries({ queryKey: ["ledger", res.orgId] });
    }
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Donation, "id" | "status" | "created_at">) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("donations")
          .insert({
            ...payload,
            status: "awaiting_approval",
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        if (error) throw error;
        return data as Donation;
      }
      await delay();
      const donations = MockDB.getDonations();
      const newDon: Donation = {
        ...payload,
        id: "don-" + Math.random().toString(36).substr(2, 9),
        status: "awaiting_approval",
        created_at: new Date().toISOString()
      };
      donations.push(newDon);
      MockDB.saveDonations(donations);
      return newDon;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["donations", data.org_id] });
    }
  });
}

// ==========================================
// 11. ERROR REPORTING HOOKS
// ==========================================
export function useErrorReports(orgId: string | undefined) {
  return useQuery({
    queryKey: ["errors", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("error_reports")
          .select("*")
          .eq("org_id", orgId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data as ErrorReport[];
      }
      await delay();
      return MockDB.getErrors().filter((e) => e.org_id === orgId);
    },
    enabled: !!orgId
  });
}

export function useSubmitErrorReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<ErrorReport, "id" | "status" | "created_at">) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("error_reports")
          .insert({
            ...payload,
            status: "open",
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        if (error) throw error;
        return data as ErrorReport;
      }
      await delay();
      const errors = MockDB.getErrors();
      const newErr: ErrorReport = {
        ...payload,
        id: "err-" + Math.random().toString(36).substr(2, 9),
        status: "open",
        created_at: new Date().toISOString()
      };
      errors.push(newErr);
      MockDB.saveErrors(errors);
      return newErr;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["errors", data.org_id] });
    }
  });
}

export function useResolveErrorReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("error_reports")
          .update({ status: "resolved" })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as ErrorReport;
      }
      await delay();
      const errors = MockDB.getErrors();
      const idx = errors.findIndex((e) => e.id === id);
      if (idx !== -1) {
        errors[idx].status = "resolved";
        MockDB.saveErrors(errors);
        return errors[idx];
      }
      throw new Error("Report not found");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["errors", data.org_id] });
      queryClient.invalidateQueries({ queryKey: ["platform_admin_data"] });
    }
  });
}

export function useUpdateErrorReportAdminNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, adminNotes }: { id: string; adminNotes: string }) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("error_reports")
          .update({ admin_notes: adminNotes })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as ErrorReport;
      }
      await delay();
      const errors = MockDB.getErrors();
      const idx = errors.findIndex((e) => e.id === id);
      if (idx !== -1) {
        errors[idx].admin_notes = adminNotes;
        MockDB.saveErrors(errors);
        return errors[idx];
      }
      throw new Error("Report not found");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["errors", data.org_id] });
      queryClient.invalidateQueries({ queryKey: ["platform_admin_data"] });
    }
  });
}

// ==========================================
// 12. SUPERADMIN PORTAL DATA HOOK
// ==========================================
export function usePlatformAdminData() {
  return useQuery({
    queryKey: ["platform_admin_data"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        const { data: orgs } = await supabase.from("organizations").select("*");
        const { data: payments } = await supabase.from("subscription_payments").select("*");
        const { data: errors } = await supabase.from("error_reports").select("*");
        const { data: settingsData } = await supabase.from("platform_settings").select("*").eq("id", "global").maybeSingle();

        const defaultSettings = MockDB.getPlatformSettings();
        return {
          orgs: (orgs || []) as Organization[],
          payments: (payments || []) as SubscriptionPayment[],
          errors: (errors || []) as ErrorReport[],
          settings: settingsData || defaultSettings
        };
      }
      await delay();
      return {
        orgs: MockDB.getOrgs(),
        payments: MockDB.getSubPayments(),
        errors: MockDB.getErrors(),
        settings: MockDB.getPlatformSettings()
      };
    }
  });
}

export function useApproveSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, orgId, status }: { paymentId: string; orgId: string; status: "approved" | "rejected" }) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("subscription_payments")
          .update({ status })
          .eq("id", paymentId)
          .select()
          .single();
        if (error) throw error;

        if (status === "approved") {
          // extend subscription ends at
          const nextExpiry = new Date();
          nextExpiry.setDate(nextExpiry.getDate() + 30);
          await supabase
            .from("organizations")
            .update({
              subscription_status: "active",
              subscription_ends_at: nextExpiry.toISOString()
            })
            .eq("id", orgId);
        }
        return { data, orgId };
      }
      await delay();
      const pays = MockDB.getSubPayments();
      const idx = pays.findIndex((p) => p.id === paymentId);
      if (idx !== -1) {
        pays[idx].status = status;
        MockDB.saveSubPayments(pays);

        if (status === "approved") {
          const orgs = MockDB.getOrgs();
          const oIdx = orgs.findIndex((o) => o.id === orgId);
          if (oIdx !== -1) {
            const nextExpiry = new Date();
            nextExpiry.setDate(nextExpiry.getDate() + 30);
            orgs[oIdx].subscription_status = "active";
            orgs[oIdx].subscription_ends_at = nextExpiry.toISOString();
            MockDB.saveOrgs(orgs);
          }
        }
      }
      return { paymentId, orgId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform_admin_data"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    }
  });
}

export function useSubmitSubscriptionPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<SubscriptionPayment, "id" | "status" | "submitted_at">) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("subscription_payments")
          .insert({
            ...payload,
            status: "awaiting_approval",
            submitted_at: new Date().toISOString()
          })
          .select()
          .single();
        if (error) throw error;
        return data as SubscriptionPayment;
      }
      await delay();
      const pays = MockDB.getSubPayments();
      const newPay: SubscriptionPayment = {
        ...payload,
        id: "sub-pay-" + Math.random().toString(36).substr(2, 9),
        status: "awaiting_approval",
        submitted_at: new Date().toISOString()
      };
      pays.push(newPay);
      MockDB.saveSubPayments(pays);
      return newPay;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform_admin_data"] });
    }
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PlatformSettings) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("platform_settings")
          .upsert({ id: "global", ...payload })
          .select()
          .single();
        if (error) throw error;
        return data as PlatformSettings;
      }
      await delay();
      MockDB.savePlatformSettings(payload);
      return payload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform_admin_data"] });
    }
  });
}

// ==========================================
// V2 ADDONS REACT-QUERY HOOKS
// ==========================================

// 1. Audit Logging helper inside Hook level to log actions cleanly
export function useCreateAuditLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<AuditLog, "id" | "created_at">) => {
      const newLog: AuditLog = {
        id: Math.random().toString(36).substring(2, 11),
        created_at: new Date().toISOString(),
        ...payload
      };
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("audit_logs").insert(newLog).select().single();
        if (error) throw error;
        return data as AuditLog;
      }
      await delay(100);
      const logs = MockDB.getAuditLogs();
      logs.unshift(newLog);
      MockDB.saveAuditLogs(logs);
      return newLog;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["audit_logs", variables.org_id] });
    }
  });
}

export function useAuditLogs(orgId: string | undefined) {
  return useQuery({
    queryKey: ["audit_logs", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("audit_logs")
          .select("*")
          .eq("org_id", orgId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data as AuditLog[];
      }
      await delay(150);
      return MockDB.getAuditLogs();
    },
    enabled: !!orgId
  });
}

// 2. Chat V2 Poll Hooks
export function usePollMessages(channelId: string | undefined) {
  return useQuery({
    queryKey: ["polls", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("poll_messages")
          .select("*")
          .eq("message_id", channelId); // or message ref
        if (error) throw error;
        return data as PollMessage[];
      }
      await delay(100);
      return MockDB.getPollMessages();
    },
    enabled: !!channelId
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();
  const auditMutation = useCreateAuditLog();
  return useMutation({
    mutationFn: async (payload: Omit<PollMessage, "id" | "created_at"> & { orgId: string; userId: string }) => {
      const newPoll: PollMessage = {
        id: "poll-" + Math.random().toString(36).substring(2, 9),
        created_at: new Date().toISOString(),
        question: payload.question,
        options: payload.options,
        allow_multiple: payload.allow_multiple,
        show_results_before_vote: payload.show_results_before_vote,
        is_closed: false,
        expires_at: payload.expires_at,
        message_id: payload.message_id
      };
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("poll_messages").insert({
          message_id: payload.message_id,
          question: payload.question,
          options: payload.options,
          allow_multiple: payload.allow_multiple,
          show_results_before_vote: payload.show_results_before_vote,
          expires_at: payload.expires_at
        }).select().single();
        if (error) throw error;
        return data as PollMessage;
      }
      await delay(200);
      const polls = MockDB.getPollMessages();
      polls.push(newPoll);
      MockDB.savePollMessages(polls);

      // Audit
      await auditMutation.mutateAsync({
        org_id: payload.orgId,
        performed_by: payload.userId,
        action: "create_poll",
        action_label: `Created Live Poll: ${payload.question}`,
        target_table: "poll_messages",
        target_id: newPoll.id,
        target_label: payload.question
      });

      return newPoll;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    }
  });
}

export function useVoteInPoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { pollId: string; memberId: string; selectedOptions: string[] }) => {
      const newVote: PollResponse = {
        id: "vote-" + Math.random().toString(36).substring(2, 9),
        poll_id: payload.pollId,
        member_id: payload.memberId,
        selected_options: payload.selectedOptions,
        created_at: new Date().toISOString()
      };
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("poll_responses").upsert({
          poll_id: payload.pollId,
          member_id: payload.memberId,
          selected_options: payload.selectedOptions
        }).select().single();
        if (error) throw error;
        return data as PollResponse;
      }
      await delay(100);
      const votes = MockDB.getPollResponses();
      const existingIdx = votes.findIndex(v => v.poll_id === payload.pollId && v.member_id === payload.memberId);
      if (existingIdx !== -1) {
        votes[existingIdx].selected_options = payload.selectedOptions;
      } else {
        votes.push(newVote);
      }
      MockDB.savePollResponses(votes);
      return newVote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    }
  });
}

export function usePollResponses(pollId: string | undefined) {
  return useQuery({
    queryKey: ["poll_responses", pollId],
    queryFn: async () => {
      if (!pollId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("poll_responses").select("*").eq("poll_id", pollId);
        if (error) throw error;
        return data as PollResponse[];
      }
      await delay(50);
      return MockDB.getPollResponses().filter(r => r.poll_id === pollId);
    },
    enabled: !!pollId
  });
}

// 3. Activity Tracking beyond meetings
export function useActivityLogs(orgId: string | undefined) {
  return useQuery({
    queryKey: ["activity_logs", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("org_id", orgId)
          .order("activity_date", { ascending: false });
        if (error) throw error;
        return data as ActivityLog[];
      }
      await delay(200);
      return MockDB.getActivityLogs();
    },
    enabled: !!orgId
  });
}

export function useActivityAttendance(activityId: string | undefined) {
  return useQuery({
    queryKey: ["activity_attendance", activityId],
    queryFn: async () => {
      if (!activityId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("activity_attendance")
          .select("*")
          .eq("activity_id", activityId);
        if (error) throw error;
        return data as ActivityAttendance[];
      }
      await delay(100);
      return MockDB.getActivityAttendance().filter(a => a.activity_id === activityId);
    },
    enabled: !!activityId
  });
}

export function useSubmitActivityLog() {
  const queryClient = useQueryClient();
  const auditMutation = useCreateAuditLog();
  return useMutation({
    mutationFn: async (payload: {
      org_id: string;
      title: string;
      description?: string;
      location?: string;
      activity_date: string;
      created_by: string;
      attendees: string[]; // member ids
    }) => {
      const activityId = "act-" + Math.random().toString(36).substring(2, 9);
      const newActivity: ActivityLog = {
        id: activityId,
        org_id: payload.org_id,
        title: payload.title,
        description: payload.description,
        location: payload.location,
        activity_date: payload.activity_date,
        created_by: payload.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        const { data: actData, error: actErr } = await supabase.from("activity_logs").insert({
          org_id: payload.org_id,
          title: payload.title,
          description: payload.description,
          location: payload.location,
          activity_date: payload.activity_date,
          created_by: payload.created_by
        }).select().single();
        if (actErr) throw actErr;

        if (payload.attendees.length > 0) {
          const rows = payload.attendees.map(mId => ({
            activity_id: actData.id,
            member_id: mId,
            recorded_by: payload.created_by
          }));
          const { error: attErr } = await supabase.from("activity_attendance").insert(rows);
          if (attErr) throw attErr;
        }
        return actData as ActivityLog;
      }

      await delay(300);
      const logs = MockDB.getActivityLogs();
      logs.unshift(newActivity);
      MockDB.saveActivityLogs(logs);

      if (payload.attendees.length > 0) {
        const attLogs = MockDB.getActivityAttendance();
        payload.attendees.forEach(mId => {
          attLogs.push({
            id: "att-" + Math.random().toString(36).substring(2, 9),
            activity_id: activityId,
            member_id: mId,
            recorded_by: payload.created_by,
            created_at: new Date().toISOString()
          });
        });
        MockDB.saveActivityAttendance(attLogs);
      }

      // Record Audit trail
      await auditMutation.mutateAsync({
        org_id: payload.org_id,
        performed_by: payload.created_by,
        action: "record_activity",
        action_label: `Logged Activity Outreach: ${payload.title}`,
        target_table: "activity_logs",
        target_id: activityId,
        target_label: payload.title
      });

      return newActivity;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["activity_logs", data.org_id] });
    }
  });
}

// 4. Message Templates System
export function useMessageTemplates(orgId: string | undefined) {
  return useQuery({
    queryKey: ["msg_templates", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("message_templates")
          .select("*")
          .eq("org_id", orgId);
        if (error) throw error;
        return data as MessageTemplate[];
      }
      await delay(100);
      return MockDB.getMessageTemplates();
    },
    enabled: !!orgId
  });
}

export function useSubmitMessageTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<MessageTemplate> & { org_id: string; created_by: string }) => {
      const templateId = payload.id || "tmp-" + Math.random().toString(36).substring(2, 9);
      const newTemplate: MessageTemplate = {
        id: templateId,
        org_id: payload.org_id,
        name: payload.name || "Untitled Template",
        occasion: payload.occasion || "General",
        subject: payload.subject || "",
        body: payload.body || "",
        variables: payload.variables || [],
        is_system_template: false,
        created_by: payload.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("message_templates").upsert(newTemplate).select().single();
        if (error) throw error;
        return data as MessageTemplate;
      }
      await delay(200);
      const list = MockDB.getMessageTemplates();
      const idx = list.findIndex(t => t.id === payload.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...payload, updated_at: new Date().toISOString() };
      } else {
        list.push(newTemplate);
      }
      MockDB.saveMessageTemplates(list);
      return newTemplate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["msg_templates", data.org_id] });
    }
  });
}

export function useDeleteMessageTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; org_id: string }) => {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from("message_templates").delete().eq("id", payload.id);
        if (error) throw error;
        return payload.id;
      }
      await delay(100);
      const list = MockDB.getMessageTemplates().filter(t => t.id !== payload.id);
      MockDB.saveMessageTemplates(list);
      return payload.id;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["msg_templates", variables.org_id] });
    }
  });
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      org_id: string;
      sent_by: string;
      recipient_group: string;
      recipient_count: number;
      body_text: string;
      activity_id?: string;
      event_id?: string;
      meeting_id?: string;
    }) => {
      const newSend: NotificationSend = {
        id: "snd-" + Math.random().toString(36).substring(2, 9),
        org_id: payload.org_id,
        sent_by: payload.sent_by,
        recipient_group: payload.recipient_group,
        recipient_count: payload.recipient_count,
        activity_id: payload.activity_id,
        event_id: payload.event_id,
        meeting_id: payload.meeting_id,
        created_at: new Date().toISOString()
      };
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("notification_sends").insert(newSend).select().single();
        if (error) throw error;
        return data as NotificationSend;
      }
      await delay(150);
      const sends = MockDB.getNotificationSends();
      sends.unshift(newSend);
      MockDB.saveNotificationSends(sends);
      return newSend;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notification_sends", data.org_id] });
    }
  });
}

// 5. Event RSVP and Waitlist
export function useEventRSVPs(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event_v2_rsvps", eventId],
    queryFn: async () => {
      if (!eventId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("event_rsvps").select("*").eq("event_id", eventId);
        if (error) throw error;
        return data as EventRSVP[];
      }
      await delay(100);
      return MockDB.getEventRSVPs().filter(r => r.event_id === eventId);
    },
    enabled: !!eventId
  });
}

export function useSubmitRSVP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { event_id: string; member_id: string; response: "yes" | "no" | "maybe" }) => {
      const newRSVP: EventRSVP = {
        id: "rsvp-" + Math.random().toString(36).substring(2, 9),
        event_id: payload.event_id,
        member_id: payload.member_id,
        response: payload.response,
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("event_rsvps").upsert(newRSVP).select().single();
        if (error) throw error;
        return data as EventRSVP;
      }
      await delay(100);
      const rsvps = MockDB.getEventRSVPs();
      const existingIdx = rsvps.findIndex(r => r.event_id === payload.event_id && r.member_id === payload.member_id);
      if (existingIdx !== -1) {
        rsvps[existingIdx] = { ...rsvps[existingIdx], response: payload.response, updated_at: new Date().toISOString() };
      } else {
        rsvps.push(newRSVP);
      }
      MockDB.saveEventRSVPs(rsvps);
      return newRSVP;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["event_v2_rsvps", data.event_id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    }
  });
}

export function useEventWaitlist(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event_v2_waitlist", eventId],
    queryFn: async () => {
      if (!eventId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("event_waitlist").select("*").eq("event_id", eventId);
        if (error) throw error;
        return data as EventWaitlist[];
      }
      await delay(100);
      return MockDB.getEventWaitlist().filter(w => w.event_id === eventId);
    },
    enabled: !!eventId
  });
}

export function useJoinEventWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { event_id: string; member_id: string }) => {
      const newWait: EventWaitlist = {
        id: "wait-" + Math.random().toString(36).substring(2, 9),
        event_id: payload.event_id,
        member_id: payload.member_id,
        joined_at: new Date().toISOString()
      };
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("event_waitlist").upsert(newWait).select().single();
        if (error) throw error;
        return data as EventWaitlist;
      }
      await delay(100);
      const waitlist = MockDB.getEventWaitlist();
      const exists = waitlist.some(w => w.event_id === payload.event_id && w.member_id === payload.member_id);
      if (!exists) {
        waitlist.push(newWait);
        MockDB.saveEventWaitlist(waitlist);
      }
      return newWait;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["event_v2_waitlist", data.event_id] });
    }
  });
}

// 6. Member Identity verification
export function useIdentityVerifications(orgId: string | undefined) {
  return useQuery({
    queryKey: ["identity_verifications", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("identity_verifications").select("*").eq("org_id", orgId);
        if (error) throw error;
        return data as IdentityVerification[];
      }
      await delay(150);
      return MockDB.getIdentityVerifications();
    },
    enabled: !!orgId
  });
}

export function useSubmitIdentityVerification() {
  const queryClient = useQueryClient();
  const auditMutation = useCreateAuditLog();
  return useMutation({
    mutationFn: async (payload: { member_id: string; org_id: string; document_type: string; document_url: string; userId: string }) => {
      const newVerify: IdentityVerification = {
        id: "verify-" + Math.random().toString(36).substring(2, 9),
        member_id: payload.member_id,
        org_id: payload.org_id,
        document_type: payload.document_type,
        document_url: payload.document_url,
        submitted_at: new Date().toISOString(),
        status: "pending"
      };

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("identity_verifications").insert(newVerify).select().single();
        if (error) throw error;

        // update member status pending document
        await supabase.from("org_members").update({ verification_status: "pending" }).eq("id", payload.member_id);
        return data as IdentityVerification;
      }

      await delay(200);
      const list = MockDB.getIdentityVerifications();
      list.push(newVerify);
      MockDB.saveIdentityVerifications(list);

      // Update mock member verification state
      const members = MockDB.getMembers();
      const idx = members.findIndex(m => m.id === payload.member_id);
      if (idx !== -1) {
        members[idx].verification_status = "pending";
        MockDB.saveMembers(members);
      }

      await auditMutation.mutateAsync({
        org_id: payload.org_id,
        performed_by: payload.userId,
        action: "submit_id_document",
        action_label: "Uploaded verification document photo",
        target_table: "identity_verifications",
        target_id: newVerify.id,
        target_label: payload.document_type
      });

      return newVerify;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["identity_verifications", data.org_id] });
      queryClient.invalidateQueries({ queryKey: ["members", data.org_id] });
    }
  });
}

export function useReviewIdentityVerification() {
  const queryClient = useQueryClient();
  const auditMutation = useCreateAuditLog();
  return useMutation({
    mutationFn: async (payload: { id: string; org_id: string; member_id: string; status: "approved" | "rejected"; reviewed_by: string; review_notes?: string }) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("identity_verifications")
          .update({
            status: payload.status,
            reviewed_at: new Date().toISOString(),
            reviewed_by: payload.reviewed_by,
            review_notes: payload.review_notes
          })
          .eq("id", payload.id)
          .select()
          .single();
        if (error) throw error;

        await supabase.from("org_members")
          .update({
            verification_status: payload.status === "approved" ? "verified" : "rejected"
          })
          .eq("id", payload.member_id);
        return data as IdentityVerification;
      }

      await delay(200);
      const list = MockDB.getIdentityVerifications();
      const vi = list.findIndex(v => v.id === payload.id);
      if (vi !== -1) {
        list[vi] = {
          ...list[vi],
          status: payload.status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: payload.reviewed_by,
          review_notes: payload.review_notes
        };
        MockDB.saveIdentityVerifications(list);
      }

      const members = MockDB.getMembers();
      const mi = members.findIndex(m => m.id === payload.member_id);
      if (mi !== -1) {
        members[mi].verification_status = payload.status === "approved" ? "verified" : "rejected";
        MockDB.saveMembers(members);
      }

      await auditMutation.mutateAsync({
        org_id: payload.org_id,
        performed_by: payload.reviewed_by,
        action: "review_id_document",
        action_label: `Reviewed Identity verification document: ${payload.status.toUpperCase()}`,
        target_table: "identity_verifications",
        target_id: payload.id,
        target_label: `Member verification review`
      });

      return payload;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["identity_verifications", data.org_id] });
      queryClient.invalidateQueries({ queryKey: ["members", data.org_id] });
    }
  });
}

// 7. Secure Documents and Acknowledgements
export function useV2Documents(orgId: string | undefined) {
  return useQuery({
    queryKey: ["v2_documents", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("documents").select("*").eq("org_id", orgId);
        if (error) throw error;
        return data as Document[];
      }
      await delay(100);
      return MockDB.getDocuments();
    },
    enabled: !!orgId
  });
}

export function useSubmitDocument() {
  const queryClient = useQueryClient();
  const auditMutation = useCreateAuditLog();
  return useMutation({
    mutationFn: async (payload: { org_id: string; name: string; file_url: string; file_size: string; uploaded_by: string; uploader_name: string; requires_acknowledgement: boolean; acknowledgement_deadline?: string }) => {
      const docId = "doc-" + Math.random().toString(36).substring(2, 9);
      const newDoc: Document = {
        id: docId,
        org_id: payload.org_id,
        name: payload.name,
        file_url: payload.file_url,
        file_size: payload.file_size,
        uploaded_by: payload.uploaded_by,
        uploader_name: payload.uploader_name,
        requires_acknowledgement: payload.requires_acknowledgement,
        acknowledgement_deadline: payload.acknowledgement_deadline,
        created_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("documents").insert(newDoc).select().single();
        if (error) throw error;
        return data as Document;
      }

      await delay(150);
      const docs = MockDB.getDocuments();
      docs.unshift(newDoc);
      MockDB.saveDocuments(docs);

      await auditMutation.mutateAsync({
        org_id: payload.org_id,
        performed_by: payload.uploaded_by,
        action: "upload_document",
        action_label: `Uploaded Document: ${payload.name}`,
        target_table: "documents",
        target_id: docId,
        target_label: payload.name
      });

      return newDoc;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["v2_documents", data.org_id] });
    }
  });
}

export function useDocumentAcknowledgements(documentId: string | undefined) {
  return useQuery({
    queryKey: ["document_acknowledgements", documentId],
    queryFn: async () => {
      if (!documentId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("document_acknowledgements").select("*").eq("document_id", documentId);
        if (error) throw error;
        return data as DocumentAcknowledgement[];
      }
      await delay(80);
      return MockDB.getDocumentAcknowledgements().filter(a => a.document_id === documentId);
    },
    enabled: !!documentId
  });
}

export function useAcknowledgeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { document_id: string; member_id: string; org_id: string; document_version: number }) => {
      const newAck: DocumentAcknowledgement = {
        id: "ack-" + Math.random().toString(36).substring(2, 9),
        document_id: payload.document_id,
        member_id: payload.member_id,
        org_id: payload.org_id,
        document_version: payload.document_version,
        acknowledged_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("document_acknowledgements").insert(newAck).select().single();
        if (error) throw error;
        return data as DocumentAcknowledgement;
      }

      await delay(150);
      const list = MockDB.getDocumentAcknowledgements();
      const existing = list.some(a => a.document_id === payload.document_id && a.member_id === payload.member_id && a.document_version === payload.document_version);
      if (!existing) {
        list.push(newAck);
        MockDB.saveDocumentAcknowledgements(list);
      }
      return newAck;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["document_acknowledgements", data.document_id] });
      queryClient.invalidateQueries({ queryKey: ["v2_documents"] });
    }
  });
}

// 8. Resignations and Exit offboarding
export function useResignations(orgId: string | undefined) {
  return useQuery({
    queryKey: ["resignations", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("resignations").select("*").eq("org_id", orgId);
        if (error) throw error;
        return data as Resignation[];
      }
      await delay(150);
      return MockDB.getResignations();
    },
    enabled: !!orgId
  });
}

export function useSubmitResignation() {
  const queryClient = useQueryClient();
  const auditMutation = useCreateAuditLog();
  return useMutation({
    mutationFn: async (payload: { member_id: string; org_id: string; reason_category?: string; reason_detail?: string; userId: string }) => {
      const resignId = "res-" + Math.random().toString(36).substring(2, 9);
      const newResign: Resignation = {
        id: resignId,
        member_id: payload.member_id,
        org_id: payload.org_id,
        reason_category: payload.reason_category,
        reason_detail: payload.reason_detail,
        submitted_at: new Date().toISOString(),
        status: "pending"
      };

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("resignations").insert(newResign).select().single();
        if (error) throw error;
        await supabase.from("org_members").update({ status: "resigned" }).eq("id", payload.member_id);
        return data as Resignation;
      }

      await delay(200);
      const list = MockDB.getResignations();
      list.unshift(newResign);
      MockDB.saveResignations(list);

      // update member status
      const members = MockDB.getMembers();
      const idx = members.findIndex(m => m.id === payload.member_id);
      if (idx !== -1) {
        members[idx].status = "resigned";
        MockDB.saveMembers(members);
      }

      await auditMutation.mutateAsync({
        org_id: payload.org_id,
        performed_by: payload.userId,
        action: "member_resign",
        action_label: "Submitted Membership Resignation Request",
        target_table: "resignations",
        target_id: resignId,
        target_label: "Self offboarding submission"
      });

      return newResign;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["resignations", data.org_id] });
      queryClient.invalidateQueries({ queryKey: ["members", data.org_id] });
    }
  });
}

export function useFinalizeResignation() {
  const queryClient = useQueryClient();
  const auditMutation = useCreateAuditLog();
  return useMutation({
    mutationFn: async (payload: { id: string; org_id: string; member_id: string; admin_response?: string; admin_responded_by: string }) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from("resignations")
          .update({
            status: "finalized",
            finalized_at: new Date().toISOString(),
            admin_response: payload.admin_response,
            admin_responded_at: new Date().toISOString(),
            admin_responded_by: payload.admin_responded_by
          })
          .eq("id", payload.id)
          .select()
          .single();
        if (error) throw error;
        return data as Resignation;
      }

      await delay(150);
      const list = MockDB.getResignations();
      const idx = list.findIndex(r => r.id === payload.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          status: "finalized",
          finalized_at: new Date().toISOString(),
          admin_response: payload.admin_response,
          admin_responded_at: new Date().toISOString(),
          admin_responded_by: payload.admin_responded_by
        };
        MockDB.saveResignations(list);
      }

      await auditMutation.mutateAsync({
        org_id: payload.org_id,
        performed_by: payload.admin_responded_by,
        action: "resign_finalized",
        action_label: "Finalized member exit and logged survey",
        target_table: "resignations",
        target_id: payload.id,
        target_label: "Final exit processed"
      });

      return payload;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["resignations", data.org_id] });
      queryClient.invalidateQueries({ queryKey: ["members", data.org_id] });
    }
  });
}

