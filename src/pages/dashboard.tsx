import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useLocalTranslation } from "../locales/additional-translations";
import {
  CalendarDays,
  Target,
  Megaphone,
  Briefcase,
  Layers,
  Award,
  Wallet,
  Users,
  MessageSquare,
  MessageCircle,
  Sprout,
  Building,
  Smile,
  Sparkles,
  Search,
  Plus,
  Send,
  Pin,
  FolderDot,
  CheckSquare,
  FileCheck2,
  Trash2,
  Edit,
  ThumbsUp,
  FileSpreadsheet,
  FileText,
  PieChart,
  HelpCircle,
  Clock,
  History,
  Mic,
  Paperclip,
  Volume2,
  ShieldAlert,
  FileSignature,
  Fingerprint,
  UserCheck,
  Inbox,
  Lock,
  CheckCircle,
  Download,
  AlertTriangle
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useOrgStore } from "../store/orgStore";
import { useCurrencyStore } from "../store/currencyStore";
import { Goal, Event as ImpactEvent, NewsPost, Meeting, ChatChannel } from "../types";
import {
  useEvents,
  useUpdateEvent,
  useDeleteEvent,
  useGoals,
  useNews,
  useMeetings,
  useChatChannels,
  useChatMessages,
  useSendChatMessage,
  useCreateEvent,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useUpdateGoalProgress,
  useCreateMeeting,
  useUpdateMeeting,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useMembers,
  // V2 Addons Hook list
  useCreateChannel,
  usePollMessages,
  useCreatePoll,
  useVoteInPoll,
  usePollResponses,
  useActivityLogs,
  useActivityAttendance,
  useSubmitActivityLog,
  useMessageTemplates,
  useSubmitMessageTemplate,
  useDeleteMessageTemplate,
  useBroadcastNotification,
  useEventRSVPs,
  useSubmitRSVP,
  useEventWaitlist,
  useJoinEventWaitlist,
  useIdentityVerifications,
  useSubmitIdentityVerification,
  useReviewIdentityVerification,
  useV2Documents,
  useSubmitDocument,
  useDocumentAcknowledgements,
  useAcknowledgeDocument,
  useResignations,
  useSubmitResignation,
  useFinalizeResignation,
  useAuditLogs
} from "../hooks/useImpactoData";
import { Button, Input, Card, Badge, Avatar, ProgressBar, EmptyState, Modal, Table } from "../components/ui";
import { MockDB } from "../lib/mockData";

import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useToast } from "../components/Toast";

// ==========================================
// 1. CORE ACCREDITED DASHBOARD HOME
// ==========================================
export const DashboardHome: React.FC = () => {
  const { t } = useLocalTranslation();
  const { user } = useAuthStore();
  const { activeOrg, activeMember } = useOrgStore();
  const typedMember = activeMember as any;
  const { formatAmount } = useCurrencyStore();
  const { addToast } = useToast();

  const { data: events } = useEvents(activeOrg?.id);
  const { data: goals } = useGoals(activeOrg?.id);
  const { data: news } = useNews(activeOrg?.id);
  const { data: members } = useMembers(activeOrg?.id);

  // V2 Trust & Offboarding Mutations
  const submitIdentity = useSubmitIdentityVerification();
  const submitResign = useSubmitResignation();

  const [openVerifyModal, setOpenVerifyModal] = useState(false);
  const [docType, setDocType] = useState("National Identification Card");
  const [docUrl, setDocUrl] = useState("http://impacto.org/uploads/doc_identity_verified.pdf");

  const [openResignModal, setOpenResignModal] = useState(false);
  const [resignCategory, setResignCategory] = useState("Relocation or Resettlement");
  const [resignDetail, setResignDetail] = useState("");

  const isAdmin = activeMember?.role === "org_admin" || activeMember?.role === "manager";

  const pinnedGoals = goals?.filter((g) => g.is_pinned) || [];
  const activeEvents = events?.slice(0, 3) || [];
  const activeNews = news?.slice(0, 3) || [];

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember || !activeOrg) return;

    try {
      await submitIdentity.mutateAsync({
        member_id: activeMember.id,
        org_id: activeOrg.id,
        document_type: docType,
        document_url: docUrl,
        userId: user?.id || ""
      });
      setOpenVerifyModal(false);
      addToast("Verification document uploaded successfully! Admins have been notified.", "success");
    } catch (err) {
      console.error(err);
    }
  };

  const handleResignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember || !activeOrg) return;

    try {
      await submitResign.mutateAsync({
        member_id: activeMember.id,
        org_id: activeOrg.id,
        reason_category: resignCategory,
        reason_detail: resignDetail,
        userId: user?.id || ""
      });
      setOpenResignModal(false);
      addToast("Exit Survey recorded. Your cooperative resignation log is finalized.", "success");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-8 select-none font-sans">
      {/* Dynamic Welcome Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display leading-none tracking-tight text-gray-905 dark:text-white flex items-center gap-2">
            {t("dashboard_labels.welcome_title")} {user?.full_name?.split(" ")[0] || "User"} <Sparkles className="h-5 w-5 text-amber-500" />
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1 dark:text-slate-400 font-medium">
            {t("dashboard_labels.welcome_subtitle")}
          </p>
        </div>
        {activeOrg?.subscription_status === "trial" && (
          <div className="px-4 py-2.5 bg-amber-550/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 rounded-xl text-xs font-semibold leading-normal flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            {t("dashboard_labels.active_trial")} {new Date(activeOrg.subscription_ends_at || "").toLocaleDateString()})
          </div>
        )}
      </div>

      {/* Admin Quick stats if flagged */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border flex items-center justify-between shadow-xs">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase leading-none">{t("dashboard_labels.total_members")}</span>
              <span className="text-2xl font-bold font-display text-gray-901 mt-1.5">{members?.length || 0}</span>
            </div>
            <Users className="h-8 w-8 text-[var(--org-primary)] opacity-80" />
          </div>

          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border flex items-center justify-between shadow-xs">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase leading-none">{t("dashboard_labels.goals_setup")}</span>
              <span className="text-2xl font-bold font-display text-gray-901 mt-1.5">{goals?.length || 0}</span>
            </div>
            <Target className="h-8 w-8 text-amber-500 opacity-80" />
          </div>

          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border flex items-center justify-between shadow-xs">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase leading-none">{t("dashboard_labels.hosted_events")}</span>
              <span className="text-2xl font-bold font-display text-gray-901 mt-1.5">{events?.length || 0}</span>
            </div>
            <CalendarDays className="h-8 w-8 text-blue-500 opacity-80" />
          </div>

          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border flex items-center justify-between shadow-xs">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase leading-none">{t("dashboard_labels.ngo_status")}</span>
              <Badge color={activeOrg?.subscription_status === "active" ? "green" : "amber"}>
                {activeOrg?.subscription_status?.toUpperCase() || "TRIAL"}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid content list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Trust Compliance Status Block for Volunteers */}
          {!isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none leading-none">
              {/* verification card */}
              <div className="bg-white dark:bg-slate-850 border p-5 rounded-2xl flex flex-col gap-4 shadow-3xs">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold block leading-none">{t("dashboard_labels.identity_trust_level")}</span>
                    <span className="text-sm font-bold text-gray-901 leading-none">{t("dashboard_labels.verification_documents")}</span>
                  </div>
                  {typedMember?.verification_status === "verified" ? (
                    <Badge color="green">{t("dashboard_labels.verified_badge")}</Badge>
                  ) : typedMember?.verification_status === "pending" ? (
                    <Badge color="amber">{t("dashboard_labels.pending_badge")}</Badge>
                  ) : typedMember?.verification_status === "rejected" ? (
                    <Badge color="red">{t("dashboard_labels.rejected_badge")}</Badge>
                  ) : (
                    <Badge color="blue">{t("dashboard_labels.not_uploaded_badge")}</Badge>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  {t("dashboard_labels.verification_desc_vol")}
                </p>

                {(!typedMember?.verification_status || typedMember.verification_status === "rejected" || typedMember.verification_status === "unverified") && (
                  <Button size="sm" icon={<Fingerprint className="h-4 w-4" />} onClick={() => setOpenVerifyModal(true)} className="self-start">
                    {t("dashboard_labels.verify_id_passport_btn")}
                  </Button>
                )}
              </div>

              {/* exit offboarding card */}
              <div className="bg-white dark:bg-slate-850 border p-5 rounded-2xl flex flex-col gap-4 shadow-3xs">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold block leading-none">{t("dashboard_labels.exit_gates")}</span>
                    <span className="text-sm font-bold text-gray-901 leading-none">{t("dashboard_labels.cooperative_offboarding")}</span>
                  </div>
                  {activeMember?.status === "resigned" ? (
                    <Badge color="red">{t("dashboard_labels.resigned_badge")}</Badge>
                  ) : (
                    <Badge color="green">{t("dashboard_labels.active_badge")}</Badge>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-semibold leading-relaxed font-sans">
                  {t("dashboard_labels.leave_cooperative_desc")}
                </p>

                {activeMember?.status !== "resigned" && (
                  <Button size="sm" variant="outline" icon={<FileSignature className="h-4 w-4" />} onClick={() => setOpenResignModal(true)} className="self-start hover:border-red-650 hover:bg-red-50/20">
                    {t("dashboard_labels.initiate_exit_survey_btn")}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Pinned goals tracker */}
          <Card title={t("dashboard_labels.pinned_goals_title")}>
            {pinnedGoals.length > 0 ? (
              <div className="flex flex-col gap-6">
                {pinnedGoals.map((g) => (
                  <div key={g.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Pin className="h-3.5 w-3.5 text-[var(--org-primary)] rotate-45" /> {g.title}
                      </span>
                      <span className="text-xs font-semibold text-gray-550">{g.current_progress.toLocaleString()} / {g.target.toLocaleString()} {g.unit}</span>
                    </div>
                    <ProgressBar value={g.current_progress} max={g.target} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title={t("dashboard_labels.no_goals_pinned")} message={t("dashboard_labels.go_to_goals_msg")} />
            )}
          </Card>

          {/* Activities log */}
          <Card title={t("dashboard_labels.recent_postings_title")}>
            {activeNews.length > 0 ? (
              <div className="flex flex-col gap-4">
                {activeNews.map((n) => (
                  <div key={n.id} className="flex gap-4 p-3 border rounded-xl hover:bg-slate-50 transition items-center">
                    {n.cover_url && (
                      <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0">
                        <img src={n.cover_url} alt={n.title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col text-xs leading-normal truncate">
                      <span className="font-bold text-sm text-gray-950 dark:text-white truncate">{n.title}</span>
                      <span className="text-gray-450 mt-1 line-clamp-1">{n.excerpt}</span>
                      <span className="text-[10px] text-gray-400 mt-2 font-mono">{new Date(n.published_at || "").toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title={t("dashboard_labels.empty_news_title")} message={t("dashboard_labels.no_announcements_shared")} />
            )}
          </Card>
        </div>

        {/* Sidebar Widgets - Next meetings / events calendars */}
        <div className="flex flex-col gap-8">
          <Card title={t("dashboard_labels.upcoming_events_title")}>
            {activeEvents.length > 0 ? (
              <div className="flex flex-col gap-4">
                {activeEvents.map((ev) => (
                  <div key={ev.id} className="p-3.5 bg-slate-50 dark:bg-slate-750 rounded-xl border flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-gray-910 truncate max-w-[75%]">{ev.title}</span>
                      <Badge color="blue">{ev.status}</Badge>
                    </div>
                    <div className="text-[11px] text-gray-450 flex items-center gap-1 font-semibold leading-none">
                      <Clock className="h-3 w-3" />
                      {new Date(ev.date_time).toLocaleDateString()} at {new Date(ev.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title={t("dashboard_labels.no_scheduled_events")} message={t("dashboard_labels.no_upcoming_calendar")} />
            )}
          </Card>
        </div>
      </div>

      {/* Doc Verification Modal */}
      <Modal open={openVerifyModal} onClose={() => setOpenVerifyModal(false)} title={t("dashboard_labels.upload_verify_doc_title")}>
        <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4 font-bold text-xs select-none">
          <div className="flex flex-col gap-1.5 w-full whitespace-nowrap">
            <label className="text-xs font-semibold text-gray-700">{t("dashboard_labels.select_doc_category")}</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full text-xs rounded-lg border bg-white border-gray-300 px-3 py-2 text-stone-880 focus:ring-2 focus:ring-[var(--org-primary)] outline-none"
            >
              <option value="National Identification Card">🇷🇼 National Identification Card (NIDA)</option>
              <option value="Valid Passport document">🌍 International Passport</option>
              <option value="Cooperative Farmland Certificate">🌾 Cooperative Farmland Certificate</option>
            </select>
          </div>

          <Input label={t("dashboard_labels.simulated_photo_link")} value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder={t("dashboard_labels.file_url_path_name")} />

          {/* Drag drop mock */}
          <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-slate-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 select-none">
            <Fingerprint className="h-10 w-10 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">{t("dashboard_labels.drag_drop_passport_pdf")}</span>
            <span className="text-[9px] text-gray-400">{t("dashboard_labels.pdf_jpg_png_limit")}</span>
          </div>

          <Button type="submit" className="w-full mt-4 font-extrabold uppercase py-2.5">
            {t("dashboard_labels.submit_trust_verification")}
          </Button>
        </form>
      </Modal>

      {/* Exit surveys Modal */}
      <Modal open={openResignModal} onClose={() => setOpenResignModal(false)} title={t("dashboard_labels.volunteer_exit_survey")}>
        <form onSubmit={handleResignSubmit} className="flex flex-col gap-4 font-bold text-xs select-none">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-700">{t("dashboard_labels.primary_reason_offboarding")}</label>
            <select
              value={resignCategory}
              onChange={(e) => setResignCategory(e.target.value)}
              className="w-full text-xs rounded-lg border bg-white border-gray-300 px-3 py-2 text-stone-880 focus:ring-2 focus:ring-[var(--org-primary)] outline-none"
            >
              <option value="Relocation or Resettlement">{t("dashboard_labels.relocation_outside_sector")}</option>
              <option value="Mismatch with agropastoral targets">{t("dashboard_labels.mismatch_cooperative_goals")}</option>
              <option value="Scheduling Conflicts / Lack of time">{t("dashboard_labels.scheduling_conflicts")}</option>
              <option value="Health/Personal Circumstances">{t("dashboard_labels.health_personal_reasons")}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-770">{t("dashboard_labels.provide_constructive_feedback")}</label>
            <textarea
              value={resignDetail}
              onChange={(e) => setResignDetail(e.target.value)}
              placeholder={t("dashboard_labels.support_volunteers_better")}
              className="w-full text-xs rounded-lg border bg-white border-gray-300 p-3 min-h-24 font-semibold text-stone-900 focus:ring-2 focus:ring-[var(--org-primary)] outline-none"
              required
            />
          </div>

          <Button type="submit" className="w-full mt-3 uppercase py-2.5 font-extrabold">
            {t("dashboard_labels.confirm_cooperative_resignation")}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

// ==========================================
// 2. NEWS & BLOG POSTS ADMIN FEED MODULE
// ==========================================
export const NewsFeed: React.FC = () => {
  const { activeOrg, activeMember } = useOrgStore();
  const { addToast } = useToast();
  const { t } = useLocalTranslation();
  const { data: news, refetch } = useNews(activeOrg?.id);
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();
  const deleteMutation = useDeletePost();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);

  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Operational");
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = activeMember?.role === "org_admin";

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !excerpt || !body) return;

    setLoading(true);
    try {
      await createMutation.mutateAsync({
        org_id: activeOrg?.id || "",
        title,
        body,
        excerpt,
        category,
        visibility: "public",
        is_pinned: isPinned,
        author_id: activeMember?.user_id || "",
        published_at: new Date().toISOString()
      });
      setOpenAddModal(false);
      setTitle("");
      setBody("");
      setExcerpt("");
      setIsPinned(false);
      refetch();
      addToast(`Announcement Broadcast Dispatched!\n\n"${title}" has been published. All board members and volunteers have been notified of this announcement.`, "success");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInit = (post: NewsPost) => {
    setSelectedPost(post);
    setTitle(post.title);
    setBody(post.body);
    setExcerpt(post.excerpt);
    setCategory(post.category);
    setIsPinned(post.is_pinned);
    setOpenEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !title || !excerpt || !body) return;

    setLoading(true);
    try {
      await updateMutation.mutateAsync({
        id: selectedPost.id,
        org_id: activeOrg?.id || "",
        title,
        body,
        excerpt,
        category,
        is_pinned: isPinned
      });
      setOpenEditModal(false);
      setSelectedPost(null);
      setTitle("");
      setBody("");
      setExcerpt("");
      setIsPinned(false);
      refetch();
      addToast("Announcement updated successfully. Historic values conserved in database record.", "success");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (post: NewsPost) => {
    if (confirm("Soft-delete this post? It will remain stored as a historical log in the primary database schema.")) {
      try {
        await deleteMutation.mutateAsync({ id: post.id, org_id: activeOrg?.id || "" });
        refetch();
        addToast("Post transitioned into database persistent history logs.", "success");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRestore = async (post: NewsPost) => {
    try {
      await updateMutation.mutateAsync({
        id: post.id,
        org_id: activeOrg?.id || "",
        is_deleted: false
      });
      refetch();
      addToast("Announcement successfully restored from database archives.", "success");
    } catch (err) {
      console.error(err);
    }
  };

  const displayedNews = (news || []).filter((n) => {
    if (activeTab === "history") {
      return n.is_deleted === true;
    } else {
      return !n.is_deleted;
    }
  });

  return (
    <div className="flex flex-col gap-6 select-none font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-gray-911">{t("dashboard_labels.branded_news_feed")}</h2>
          <p className="text-xs text-gray-500">{t("dashboard_labels.news_feed_subtitle")}</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center bg-gray-100 rounded-lg p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1.5 rounded-md transition ${activeTab === "active" ? "bg-white shadow text-emerald-800" : "text-gray-500 hover:text-gray-900"}`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${activeTab === "history" ? "bg-white shadow text-amber-800" : "text-gray-500 hover:text-gray-900"}`}
              title="Database history archive"
            >
              <History className="h-3.5 w-3.5" /> History Log
            </button>
          </div>

          {isAdmin && activeTab === "active" && (
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpenAddModal(true)}>
              {t("dashboard_labels.add_post")}
            </Button>
          )}
        </div>
      </div>

      {activeTab === "history" && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-850 text-xs font-semibold leading-relaxed animate-in fade-in duration-200">
          💡 <strong>Audited Historical Records:</strong> These posts are soft-deleted and preserved in the primary database table to manage complete database chronological history. Admins can view edits, audits or restore them to active status at will.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {displayedNews.length > 0 ? (
          displayedNews.map((n) => (
            <Card key={n.id} title={n.title} action={
              <div className="flex items-center gap-2 select-none">
                {n.is_pinned && <Pin className="h-3.5 w-3.5 text-amber-500 rotate-45" />}
                <Badge color={n.is_deleted ? "amber" : "blue"}>{n.category}</Badge>
                {isAdmin && (
                  <div className="flex items-center gap-1.5 ml-2 border-l pl-2">
                    {n.is_deleted ? (
                      <button
                        onClick={() => handleRestore(n)}
                        className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded font-bold transition"
                      >
                        Restore
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditInit(n)}
                          className="p-1 text-gray-400 hover:text-[var(--org-primary)] transition"
                          title="Edit announcement"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(n)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                          title="Soft delete from board"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            }>
              <p className="text-xs font-semibold text-gray-700 leading-normal">{n.excerpt}</p>
              <div className="p-3 bg-gray-50 dark:bg-slate-750 rounded-lg text-[11px] text-gray-500 mt-4 leading-relaxed font-semibold">
                {n.body}
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-400 mt-4 font-mono leading-none">
                <span>
                  {t("dashboard_labels.published_on")} {new Date(n.published_at || "").toLocaleDateString()}
                </span>
                {n.last_edited_at && (
                  <span className="text-amber-600">
                    Edited: {new Date(n.last_edited_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-2">
            <EmptyState
              title={activeTab === "history" ? "No Archive Log Found" : t("dashboard_labels.no_news_posted")}
              message={activeTab === "history" ? "No soft-deleted announcements inside this NGO database directory yet." : t("dashboard_labels.no_news_message")}
            />
          </div>
        )}
      </div>

      {/* Add News Modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)} title={t("dashboard_labels.compose_announcement")}>
        <form onSubmit={handlePost} className="flex flex-col gap-4">
          <Input label={t("dashboard_labels.headline_title")} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("dashboard_labels.headline_placeholder")} />
          <Input label={t("dashboard_labels.brief_excerpt")} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder={t("dashboard_labels.excerpt_placeholder")} />
          
          <div className="flex flex-col gap-1.5 self-start w-full">
            <label className="text-xs font-semibold text-gray-700">{t("dashboard_labels.detailed_content")}</label>
            <textarea
              className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 p-3 text-gray-900 dark:text-slate-100 min-h-32 focus:ring-2 focus:ring-[var(--org-primary)] focus:outline-none focus:border-transparent"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("dashboard_labels.detailed_content_placeholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">{t("dashboard_labels.section_category")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 px-3 py-2 text-gray-805 select-none outline-none focus:ring-2 focus:ring-[var(--org-primary)] transition"
              >
                <option value="Operational">{t("dashboard_labels.category_operational")}</option>
                <option value="Finance">{t("dashboard_labels.category_finance")}</option>
                <option value="Staff Update">{t("dashboard_labels.category_staff_update")}</option>
                <option value="Outreach">{t("dashboard_labels.category_outreach")}</option>
              </select>
            </div>

            <div className="flex items-center gap-3.5 mt-6 self-start select-none">
              <input
                type="checkbox"
                id="pin_tick"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4.5 w-4.5 text-[var(--org-primary)] border-gray-300 rounded focus:ring-[var(--org-primary)] cursor-pointer"
              />
              <label htmlFor="pin_tick" className="text-xs font-bold text-gray-700 cursor-pointer flex items-center gap-1.5">
                <Pin className="h-3.5 w-3.5 rotate-45" /> {t("dashboard_labels.pin_dashboard_home")}
              </label>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="submit" loading={loading} className="w-full py-2.5">
              {t("dashboard_labels.publish_post")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit News Modal */}
      <Modal open={openEditModal} onClose={() => { setOpenEditModal(false); setSelectedPost(null); }} title="Edit Announcement">
        {selectedPost && (
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <Input label={t("dashboard_labels.headline_title")} value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label={t("dashboard_labels.brief_excerpt")} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required />
            
            <div className="flex flex-col gap-1.5 self-start w-full">
              <label className="text-xs font-semibold text-gray-700">{t("dashboard_labels.detailed_content")}</label>
              <textarea
                className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 p-3 text-gray-900 dark:text-slate-100 min-h-32 focus:ring-2 focus:ring-[var(--org-primary)] focus:outline-none focus:border-transparent"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">{t("dashboard_labels.section_category")}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 px-3 py-2 text-gray-805 select-none outline-none focus:ring-2 focus:ring-[var(--org-primary)] transition"
                >
                  <option value="Operational">{t("dashboard_labels.category_operational")}</option>
                  <option value="Finance">{t("dashboard_labels.category_finance")}</option>
                  <option value="Staff Update">{t("dashboard_labels.category_staff_update")}</option>
                  <option value="Outreach">{t("dashboard_labels.category_outreach")}</option>
                </select>
              </div>

              <div className="flex items-center gap-3.5 mt-6 self-start select-none">
                <input
                  type="checkbox"
                  id="pin_tick_edit"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4.5 w-4.5 text-[var(--org-primary)] border-gray-300 rounded focus:ring-[var(--org-primary)] cursor-pointer"
                />
                <label htmlFor="pin_tick_edit" className="text-xs font-bold text-gray-700 cursor-pointer flex items-center gap-1.5">
                  <Pin className="h-3.5 w-3.5 rotate-45" /> {t("dashboard_labels.pin_dashboard_home")}
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button type="submit" loading={loading} className="w-full py-2.5">
                Save Announcement Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

// ==========================================
// 3. CHAT CHANNELS MESSAGING SYSTEM
// ==========================================
export const ChatRoom: React.FC = () => {
  const { t } = useLocalTranslation();
  const { activeOrg, activeMember } = useOrgStore();
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const { data: channels, refetch: refetchChans } = useChatChannels(activeOrg?.id);

  const [activeChannelId, setActiveChannelId] = useState("");
  const { data: messages, refetch } = useChatMessages(activeChannelId);
  const sendMutation = useSendChatMessage();
  const createChannelMutation = useCreateChannel();

  const [typedMessage, setTypedMessage] = useState("");

  // V2 UI States
  const { data: orgMembers } = useMembers(activeOrg?.id);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const [openChanModal, setOpenChanModal] = useState(false);
  const [newChanName, setNewChanName] = useState("");
  const [newChanCategory, setNewChanCategory] = useState("general");
  const [newChanPrivate, setNewChanPrivate] = useState(false);

  const [openPollModal, setOpenPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOpts, setPollOpts] = useState(["", "", ""]);

  const [isRecording, setIsRecording] = useState(false);
  const [recCountdown, setRecCountdown] = useState(3);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Poll responses and detail lookups mapping
  const createPollMutation = useCreatePoll();
  const votePollMutation = useVoteInPoll();
  const { data: rawPolls } = usePollMessages(activeChannelId);
  const activeChannel = channels?.find((c) => c.id === activeChannelId);

  // Select first channel automatically when loaded
  useEffect(() => {
    if (channels && channels.length > 0 && !activeChannelId) {
      setActiveChannelId(channels[0].id);
    }
  }, [channels, activeChannelId]);

  // Real-time synchronization subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !activeChannelId) return;

    const channel = supabase
      .channel(`realtime:chat_messages:${activeChannelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `channel_id=eq.${activeChannelId}`
        },
        (payload) => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannelId, refetch]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChannelId) return;

    try {
      await sendMutation.mutateAsync({
        channelId: activeChannelId,
        senderId: activeMember?.user_id || "",
        text: typedMessage,
        senderName: user?.full_name || "Divine Uwera",
        message_type: "text"
      });
      setTypedMessage("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateVoiceRec = async () => {
    setIsRecording(true);
    setRecCountdown(3);
    const interval = setInterval(() => {
      setRecCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(async () => {
      setIsRecording(false);
      try {
        await sendMutation.mutateAsync({
          channelId: activeChannelId,
          senderId: activeMember?.user_id || "",
          text: "Playback: NGO Field report voice notes",
          senderName: user?.full_name || "Divine Uwera",
          message_type: "voice",
          voice_duration_seconds: 42
        });
        refetch();
      } catch (err) {
        console.error(err);
      }
    }, 3000);
  };

  const handleAttachMock = async (type: "pdf" | "image" | "excel") => {
    setShowAttachMenu(false);
    let name = "Outreach_Proposal_Kayonza.pdf";
    let url = "https://pdfobject.com/pdf/sample.pdf";
    let mime = "application/pdf";
    let size = 1250000;
    let msgType: "file" | "image" = "file";

    if (type === "image") {
      name = "Field_Nursery_Trees_Photo.png";
      url = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500";
      mime = "image/png";
      size = 2400000;
      msgType = "image";
    } else if (type === "excel") {
      name = "Dues_Ledger_FirstHalf_2026.xlsx";
      url = "#";
      mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      size = 450000;
    }

    try {
      await sendMutation.mutateAsync({
        channelId: activeChannelId,
        senderId: activeMember?.user_id || "",
        text: `Shared attachment: ${name}`,
        senderName: user?.full_name || "Divine Uwera",
        message_type: msgType,
        file_url: url,
        file_name: name,
        file_size: size,
        file_mime_type: mime
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim()) return;
    try {
      await createChannelMutation.mutateAsync({
        orgId: activeOrg?.id || "",
        name: newChanName.replace(/\s+/g, "-").toLowerCase(),
        type: "group",
        channel_type: newChanCategory,
        is_private: newChanPrivate,
        createdBy: activeMember?.user_id || "",
        member_ids: newChanCategory === "general" ? [] : selectedMemberIds
      });
      setNewChanName("");
      setSelectedMemberIds([]);
      setOpenChanModal(false);
      refetchChans();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOpts = pollOpts.filter(o => o.trim() !== "");
    if (!pollQuestion.trim() || validOpts.length === 0) return;

    try {
      const pId = "poll_" + Date.now();
      const mockOptionsStr = JSON.stringify(validOpts);

      // Create poll message
      await sendMutation.mutateAsync({
        channelId: activeChannelId,
        senderId: activeMember?.user_id || "",
        text: `LIVE COMMUNITY POLL: ${pollQuestion}`,
        senderName: user?.full_name || "Divine Uwera",
        message_type: "poll",
        file_url: pId, // link files fields
        file_name: mockOptionsStr // options serialized in filename
      });

      // Insert real poll
      await createPollMutation.mutateAsync({
        orgId: activeOrg?.id || "",
        userId: activeMember?.user_id || "",
        question: pollQuestion,
        options: validOpts,
        allow_multiple: false,
        show_results_before_vote: true,
        expires_at: new Date(Date.now() + 86400000 * 2).toISOString(),
        is_closed: false,
        message_id: activeChannelId // map locally
      });

      setPollQuestion("");
      setPollOpts(["", "", ""]);
      setOpenPollModal(false);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const isUserChannelAllowed = (c: ChatChannel) => {
    if (!c.channel_type || c.channel_type === "general") return true;
    if (activeMember?.role === "org_admin") return true;
    if (!c.member_ids || c.member_ids.length === 0) return true;
    return c.member_ids.includes(activeMember?.id || "");
  };

  const categoryBuckets = {
    general: channels?.filter(c => (!c.channel_type || c.channel_type === "general") && isUserChannelAllowed(c)) || [],
    projects: channels?.filter(c => c.channel_type === "project" && isUserChannelAllowed(c)) || [],
    committees: channels?.filter(c => c.channel_type === "committee" && isUserChannelAllowed(c)) || [],
    private: channels?.filter(c => (c.is_private || c.channel_type === "private") && isUserChannelAllowed(c)) || []
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl flex h-[76vh] overflow-hidden select-none font-sans shadow-sm shrink-0 w-full animate-in fade-in duration-200">
      {/* Sidebar Categorized Channels */}
      <aside className="w-56 border-r border-gray-100 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-900/60 flex flex-col justify-between shrink-0">
        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-5">
          <div className="flex justify-between items-center leading-none">
            <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase font-bold">Workspace Topics</span>
            <Button size="xs" variant="outline" onClick={() => setOpenChanModal(true)} className="px-1.5 py-1">
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* 1. General Channels */}
          {categoryBuckets.general.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-2 flex items-center gap-1.5"><MessageCircle className="h-3 w-3 inline-block" /> Conversations</span>
              {categoryBuckets.general.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChannelId(c.id)}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-bold rounded-lg truncate transition flex items-center gap-1.5 cursor-pointer ${
                    activeChannelId === c.id
                      ? "bg-[var(--org-primary-l)] text-[var(--org-primary)]"
                      : "text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-gray-400 font-mono">#</span> {c.name}
                </button>
              ))}
            </div>
          )}

          {/* 2. NGO Projects Channels */}
          {categoryBuckets.projects.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t dark:border-slate-800 pt-3.5">
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-550 uppercase tracking-widest pl-2 flex items-center gap-1.5"><Sprout className="h-3 w-3 inline-block" /> Active Projects</span>
              {categoryBuckets.projects.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChannelId(c.id)}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-bold rounded-lg truncate transition flex items-center gap-1.5 cursor-pointer ${
                    activeChannelId === c.id
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "text-gray-500 hover:bg-gray-100 dark:text-slate-400"
                  }`}
                >
                  <Briefcase className="h-3 w-3 text-emerald-500 shrink-0" /> {c.name}
                </button>
              ))}
            </div>
          )}

          {/* 3. Standing Committees */}
          {categoryBuckets.committees.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t dark:border-slate-800 pt-3.5">
              <span className="text-[9px] font-bold text-purple-600 uppercase tracking-widest pl-2 flex items-center gap-1.5"><Building className="h-3 w-3 inline-block" /> Committees</span>
              {categoryBuckets.committees.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChannelId(c.id)}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-bold rounded-lg truncate transition flex items-center gap-1.5 cursor-pointer ${
                    activeChannelId === c.id
                      ? "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                      : "text-gray-500 hover:bg-gray-100 dark:text-slate-400"
                  }`}
                >
                  <Layers className="h-3 w-3 text-purple-500 shrink-0" /> {c.name}
                </button>
              ))}
            </div>
          )}

          {/* 4. Private / Executive Channels */}
          {categoryBuckets.private.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t dark:border-slate-800 pt-3.5">
              <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest pl-2 flex items-center gap-1.5"><Lock className="h-3 w-3 inline-block" /> Private Audits</span>
              {categoryBuckets.private.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChannelId(c.id)}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-bold rounded-lg truncate transition flex items-center gap-1.5 cursor-pointer ${
                    activeChannelId === c.id
                      ? "bg-amber-500/10 text-amber-800"
                      : "text-gray-500 hover:bg-gray-100 dark:text-slate-400"
                  }`}
                >
                  <Lock className="h-3 w-3 text-amber-550 shrink-0" /> {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-slate-105/50 border-gray-100 dark:border-slate-800 flex items-center gap-3">
          <Avatar name={user?.full_name || "M"} size="xs" />
          <div className="flex flex-col leading-tight select-none truncate">
            <span className="font-bold text-xxs text-gray-901">{user?.full_name}</span>
            <span className="text-[9px] text-emerald-600 font-mono font-bold capitalize">@{activeMember?.role}</span>
          </div>
        </div>
      </aside>

      {/* Main chat stream */}
      <section className="flex-1 flex flex-col h-full bg-white dark:bg-slate-850 justify-between">
        {activeChannel ? (
          <>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-750 flex justify-between items-center bg-slate-50/20 leading-none shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm text-gray-901"># {activeChannel.name}</span>
                {activeChannel.is_private && <Lock className="h-3.5 w-3.5 text-amber-500" />}
                <span className="h-1.5 w-1.5 text-slate-300">•</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">{activeChannel.channel_type || "General Room"}</span>
              </div>
              <Badge color={activeChannel.is_private ? "amber" : "blue"}>
                {activeChannel.is_private ? "Staff Only" : "Active Feed"}
              </Badge>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5 bg-slate-50/10">
              {messages && messages.length > 0 ? (
                messages.map((m) => {
                  const isMe = m.sender_id === activeMember?.user_id;
                  const isVoice = m.message_type === "voice";
                  const isFile = m.message_type === "file";
                  const isImage = m.message_type === "image";
                  const isPollMessage = m.message_type === "poll";

                  return (
                    <div key={m.id} className={`flex gap-3.5 max-w-[85%] ${isMe ? "self-end flex-row-reverse" : "self-start"} animate-in slide-in-from-bottom-2`}>
                      <Avatar name={m.sender_name || "M"} size="xs" />
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] text-gray-450 font-bold leading-none ${isMe ? "text-right" : "text-left"}`}>
                          {m.sender_name} <span className="text-[8px] font-mono text-gray-300 font-normal ml-1">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>

                        {/* Rendering logic based on message types */}
                        {isVoice ? (
                          /* Interactive Voice Note bubble */
                          <div className="bg-slate-900 text-white rounded-2xl rounded-tr-none p-3.5 flex items-center gap-3 shadow-md border border-slate-700 min-w-[240px]">
                            <div className="h-9 w-9 bg-emerald-500 hover:bg-emerald-600 cursor-pointer rounded-full flex items-center justify-center text-white font-black hover:scale-105 transition">
                              <Volume2 className="h-4.5 w-4.5 animate-pulse" />
                            </div>
                            <div className="flex flex-col flex-1 leading-none select-none">
                              <span className="text-[11px] font-extrabold text-emerald-400">Recorded Audio Note</span>
                              {/* Simple wave animation line */}
                              <div className="flex gap-0.5 mt-2 h-4 items-center">
                                <span className="h-1.5 w-1 bg-slate-400 rounded-full animate-pulse" />
                                <span className="h-3.5 w-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                                <span className="h-2 w-1 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                <span className="h-4 w-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                                <span className="h-3 w-1 bg-emerald-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                <span className="h-1 w-1 bg-slate-400 rounded-full animate-pulse" />
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-gray-400 font-bold">{m.voice_duration_seconds || 42}s</span>
                          </div>
                        ) : isFile ? (
                          /* Document attachment */
                          <div className="bg-white dark:bg-slate-800 text-stone-900 border border-gray-150 rounded-2xl p-3.5 w-64 shadow-xs flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="h-8 w-8 text-rose-500 shrink-0" />
                              <div className="flex flex-col min-w-0 leading-none">
                                <span className="text-xs font-bold text-stone-950 truncate">{m.file_name}</span>
                                <span className="text-[10px] text-gray-400 font-mono mt-1 font-bold">{( (m.file_size || 500000)/1000000 ).toFixed(2)} MB</span>
                              </div>
                            </div>
                            <a href={m.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 transition pl-2 shrink-0">
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        ) : isImage ? (
                          /* Land Outreach Image attachment */
                          <div className="bg-stone-50 border rounded-2xl overflow-hidden p-1.5 max-w-[250px] shadow-xs flex flex-col gap-1">
                            <img src={m.file_url} alt="Outreach photo upload" className="rounded-xl w-full h-32 object-cover" referrerPolicy="no-referrer" />
                            <span className="text-[10px] text-gray-400 px-1 truncate font-mono font-bold">{m.file_name}</span>
                          </div>
                        ) : isPollMessage ? (
                          /* INTERACTIVE IN-CHAT LIVE POLL */
                          <div className="bg-stone-50 border dark:bg-slate-800 border-stone-200 dark:border-slate-700 rounded-2xl p-4.5 w-72 shadow-sm leading-normal">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Live Room Poll</span>
                            <h4 className="text-xs font-extrabold text-stone-900 dark:text-white mt-2 leading-snug">{m.text.replace("LIVE COMMUNITY POLL:", "")}</h4>
                            
                            {/* Render Options */}
                            <div className="flex flex-col gap-2.5 mt-4">
                              {(m.file_name ? JSON.parse(m.file_name) : ["Agree", "Disagree"]).map((opt: string, idx: number) => {
                                // simulated percentage
                                const pct = idx === 0 ? 67 : (idx === 1 ? 23 : 10);
                                return (
                                  <div key={idx} className="flex flex-col w-full relative group">
                                    <button
                                      type="button"
                                      onClick={() => addToast(`Thank you, vote submitted for Option: "${opt}"`, "success")}
                                      className="text-left w-full border border-stone-200 dark:border-slate-700 text-[11px] font-bold text-gray-800 dark:text-gray-200 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-500/10 cursor-pointer transition flex justify-between relative z-10"
                                    >
                                      <span>{opt}</span>
                                      <span className="text-emerald-750 font-mono text-[10px]">{pct}%</span>
                                    </button>
                                    {/* background progress shade */}
                                    <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/5 rounded-xl transition" style={{ width: `${pct}%` }} />
                                  </div>
                                );
                              })}
                            </div>
                            <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-3 pl-1 font-mono font-bold leading-none select-none">
                              Double-click option to cast secure mobile vote ledger
                            </p>
                          </div>
                        ) : (
                          /* Regular message bubble */
                          <div className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                            isMe ? "bg-[var(--org-primary)] text-white rounded-tr-none" : "bg-gray-100 border text-gray-901 rounded-tl-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          }`}>
                            {m.text}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState title="Silence in the Room" message="Be the first to post a community update in #channel." />
              )}

              {/* simulated countdown banner when recording */}
              {isRecording && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between text-xs animate-pulse text-red-600 font-extrabold self-center w-64 select-none leading-none">
                  <span className="flex items-center gap-2"><Mic className="h-4.5 w-4.5 text-red-500 shrink-0" /> Recording audio memo...</span>
                  <span className="font-mono">{recCountdown}s remaining</span>
                </div>
              )}
            </div>

            {/* Input typing panel */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-105 bg-slate-50/20 shrink-0 flex items-center gap-2.5 relative">
              {/* Media menu */}
              <div className="relative">
                <Button size="md" variant="outline" type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} className="px-3">
                  <Paperclip className="h-4.5 w-4.5" />
                </Button>
                {showAttachMenu && (
                  <div className="absolute bottom-14 left-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 shadow-lg w-48 flex flex-col gap-1.5 z-20 select-none animate-in slide-in-from-bottom-3 duration-100 font-bold text-xs">
                    <button type="button" onClick={() => handleAttachMock("pdf")} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer flex items-center gap-2 text-stone-800 dark:text-gray-200">
                      <FileText className="h-4 w-4 text-red-500" /> Share Project Proposal
                    </button>
                    <button type="button" onClick={() => handleAttachMock("image")} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer flex items-center gap-2 text-stone-800 dark:text-gray-200">
                      <Plus className="h-4 w-4 text-emerald-500" /> Share Field Photo
                    </button>
                    <button type="button" onClick={() => handleAttachMock("excel")} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer flex items-center gap-2 text-stone-800 dark:text-gray-200">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Share Dues Ledger
                    </button>
                  </div>
                )}
              </div>

              {/* Simulated mic recorder */}
              <Button size="md" variant="outline" type="button" onClick={handleSimulateVoiceRec} className={`px-3 ${isRecording ? "bg-red-500 text-white hover:bg-red-650" : ""}`}>
                <Mic className="h-4.5 w-4.5" />
              </Button>

              {/* Launch In-Chat Poll Modal Trigger */}
              <Button size="md" variant="outline" type="button" onClick={() => setOpenPollModal(true)} className="px-3" title="Create live poll">
                <PieChart className="h-4.5 w-4.5" />
              </Button>

              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Send message to room or drag files here..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition">
                  <Smile className="h-4.5 w-4.5" />
                </button>
              </div>

              <Button type="submit" size="md" className="py-2.5 px-4">
                <Send className="h-4.5 w-4.5" />
              </Button>
            </form>
          </>
        ) : (
          <EmptyState title="No active channels" message="Select a chat channel on left pane to engage." />
        )}
      </section>

      {/* 1. Add channel Modal */}
      <Modal open={openChanModal} onClose={() => setOpenChanModal(false)} title="Launch Dynamic Topic Sub-Group">
        <form onSubmit={handleCreateChannelSubmit} className="flex flex-col gap-4.5">
          <Input label="Sub-group Topic Name" value={newChanName} onChange={(e) => setNewChanName(e.target.value)} placeholder="e.g. kirehe-reforestation-ops" />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Topic Categorization Link</label>
            <select
              value={newChanCategory}
              onChange={(e) => setNewChanCategory(e.target.value)}
              className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 px-3 py-2 text-gray-805 select-none focus:ring-1 focus:ring-[var(--org-primary)] font-semibold"
            >
              <option value="general">Conversations</option>
              <option value="project">NGO Project Core Team</option>
              <option value="committee">Standing Sub-Committee</option>
              <option value="private">Executive Auditing Module</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 mt-2 self-start select-none">
            <input
              type="checkbox"
              id="is_private_topic"
              checked={newChanPrivate}
              onChange={(e) => setNewChanPrivate(e.target.checked)}
              className="h-4.5 w-4.5 rounded cursor-pointer"
            />
            <label htmlFor="is_private_topic" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
              Require explicit approval list (Private Channel)
            </label>
          </div>

          {newChanCategory === "general" ? (
            <div className="bg-emerald-500/5 text-emerald-800 p-3 rounded-lg text-xs leading-relaxed font-semibold flex items-start gap-2">
              <span className="mt-0.5"><AlertTriangle className="h-4 w-4" /></span> By default, all member accounts join the <strong>#general</strong> group conversation channel automatically.
            </div>
          ) : (
            <div className="flex flex-col gap-2 border-t pt-3 mt-1">
              <label className="text-xs font-semibold text-gray-700">Select which members must join this group</label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2.5 flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-900">
                {orgMembers && orgMembers.length > 0 ? (
                  orgMembers.map((m) => {
                    const isChecked = selectedMemberIds.includes(m.id);
                    return (
                      <label key={m.id} className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-800 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMemberIds([...selectedMemberIds, m.id]);
                            } else {
                              setSelectedMemberIds(selectedMemberIds.filter(id => id !== m.id));
                            }
                          }}
                          className="h-4 w-4 rounded cursor-pointer"
                        />
                        <span>{m.user?.full_name || "Unknown Member"} ({m.role === "org_admin" ? "Admin" : "Member"})</span>
                      </label>
                    );
                  })
                ) : (
                  <span className="text-xs text-gray-400 p-1">No other organization members found.</span>
                )}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full mt-4 py-2.5 font-bold text-xs uppercase tracking-wider">
            Confirm Topic Channel
          </Button>
        </form>
      </Modal>

      {/* 2. Add poll Modal */}
      <Modal open={openPollModal} onClose={() => setOpenPollModal(false)} title="Broadcast Team Poll Box">
        <form onSubmit={handleCreatePollSubmit} className="flex flex-col gap-4">
          <Input label="State NGO Survey Question" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="e.g. Should we expand tree nurseries to Bugesera?" />
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-stone-700 pr-1 select-none">Enter Voting Options</label>
            <Input value={pollOpts[0]} onChange={(e) => { const a = [...pollOpts]; a[0] = e.target.value; setPollOpts(a); }} placeholder="Option A: Yes, immediately" />
            <Input value={pollOpts[1]} onChange={(e) => { const a = [...pollOpts]; a[1] = e.target.value; setPollOpts(a); }} placeholder="Option B: No, wait for Q3 ledger reports" />
            <Input value={pollOpts[2]} onChange={(e) => { const a = [...pollOpts]; a[2] = e.target.value; setPollOpts(a); }} placeholder="Option C: Maybe, under limited budget" />
          </div>

          <Button type="submit" className="w-full mt-4 py-2.5 leading-none font-bold uppercase tracking-wider text-xs">
            Insert Poll to Stream
          </Button>
        </form>
      </Modal>
    </div>
  );
};

// ==========================================
// 4. GOALS METRIC SLIDERS
// ==========================================
export const GoalsTracker: React.FC = () => {
  const { t } = useLocalTranslation();
  const { activeOrg, activeMember } = useOrgStore();
  const { data: goals, refetch } = useGoals(activeOrg?.id);
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoalProgress();
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // New/Edit Goal Fields
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [target, setTarget] = useState<number>(100);
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [startProgress, setStartProgress] = useState<number>(0);

  // Progress update value
  const [sliderVal, setSliderVal] = useState<number>(0);
  const [showAdvancedOpts, setShowAdvancedOpts] = useState(false);

  const isAdmin = activeMember?.role === "org_admin";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) return;

    try {
      await createMutation.mutateAsync({
        org_id: activeOrg?.id || "",
        title: title,
        description: desc,
        target: target || null,
        unit: unit || null,
        deadline: new Date(deadline).toISOString(),
        visibility: "public",
        is_pinned: isPinned,
        current_progress: startProgress
      });
      setOpenAddModal(false);
      setTitle("");
      setDesc("");
      setTarget(100);
      setUnit("");
      setDeadline("");
      setIsPinned(false);
      setStartProgress(0);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !title || !deadline) return;

    try {
      await updateGoalMutation.mutateAsync({
        id: selectedGoal.id,
        org_id: activeOrg?.id || "",
        title,
        description: desc,
        target: target || 100,
        unit: unit || "",
        deadline: new Date(deadline).toISOString(),
        is_pinned: isPinned,
      });
      setOpenEditModal(false);
      setTitle("");
      setDesc("");
      setTarget(100);
      setUnit("");
      setDeadline("");
      setIsPinned(false);
      setSelectedGoal(null);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      await updateMutation.mutateAsync({
        goalId: selectedGoal.id,
        value: sliderVal,
        orgId: activeOrg?.id || "",
        note: "Updated progress dynamically"
      });
      setOpenUpdateModal(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans w-full">
      <div className="flex items-center justify-between border-b pb-4 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-gray-901">{t("goals_tab_title", "Strategic Goals Tracker")}</h2>
          <p className="text-xs text-gray-500 font-medium">{t("goals_tab_sub", "Verify team metrics, deadlines, and agricultural achievements.")}</p>
        </div>
        {isAdmin && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpenAddModal(true)}>
            {t("btn_add_goal", "Add Goal")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {goals && goals.length > 0 ? (
          goals.map((goal) => (
            <Card key={goal.id} title={goal.title} action={
              <div className="flex items-center gap-2">
                {goal.is_pinned && <Badge color="amber">{t("Pinned")}</Badge>}
                {isAdmin && (
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => {
                      setSelectedGoal(goal);
                      setSliderVal(goal.current_progress);
                      setOpenUpdateModal(true);
                    }}>
                      {t("btn_update_progress", "Update")}
                    </Button>
                    <button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setTitle(goal.title);
                        setDesc(goal.description);
                        setTarget(goal.target || 100);
                        setUnit(goal.unit || "");
                        const formattedDate = goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : "";
                        setDeadline(formattedDate);
                        setIsPinned(goal.is_pinned);
                        setStartProgress(goal.starting_progress || 0);
                        setOpenEditModal(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-55/35 dark:hover:bg-emerald-950/20 rounded-lg transition"
                      title="Edit Goal details"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this goal?")) {
                          await deleteGoalMutation.mutateAsync({ id: goal.id, org_id: activeOrg?.id || "" });
                          refetch();
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-55/35 dark:hover:bg-red-950/20 rounded-lg transition"
                      title="Delete Goal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            }>
              <p className="text-xs text-gray-500 leading-normal mb-4.5">{goal.description}</p>
              <ProgressBar value={goal.current_progress} max={goal.target || 100} />
              <div className="flex justify-between text-xs font-semibold text-gray-550 border-t pt-4 mt-4 leading-none font-sans">
                <span>{t("Value:")} <span className="text-gray-905 font-mono">{goal.target ? `${goal.current_progress.toLocaleString()} / ${goal.target.toLocaleString()} ${goal.unit || ""} (${Math.round((goal.current_progress / (goal.target || 100)) * 100)}%)` : `${goal.current_progress}%`}</span></span>
                <span>{t("Deadline:")} <span className="slate-905">{new Date(goal.deadline).toLocaleDateString()}</span></span>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-2">
            <EmptyState title={t("empty_goals_title", "No Goals Created")} message={t("empty_goals_msg", "Let's formulate some greening and administrative milestones.")} />
          </div>
        )}
      </div>

      {/* Add goal Modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)} title={t("modal_create_goal_title", "Define Strategic Goal")}>
        <form onSubmit={handleCreate} className="flex flex-col gap-4 text-xs font-semibold">
          <Input label={t("lbl_goal_title", "Goal Title")} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Graft native seedlings" required />
          <Input label={t("lbl_goal_desc", "Short Description")} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What metrics are we resolving?" />
          
          <Input label={t("lbl_goal_deadline", "Target Deadline Date")} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />

          <div className="flex justify-between items-center text-xs mt-2 border-t pt-3">
             <span className="font-semibold text-gray-600">Additional Options</span>
             <button type="button" onClick={() => setShowAdvancedOpts(!showAdvancedOpts)} className="text-emerald-600 font-bold hover:underline">
               {showAdvancedOpts ? "Hide Advanced Content" : "Show Advanced Options"}
             </button>
          </div>
          
          {showAdvancedOpts && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="flex flex-col gap-4 overflow-hidden">
              <div className="grid grid-cols-2 gap-4">
                <Input label={t("lbl_goal_target", "Target Value (Optional)")} type="number" value={target || ""} onChange={(e) => setTarget(parseInt(e.target.value) || 0)} placeholder="e.g. 50000 (Omit for basic % tracker)" />
                <Input label={t("lbl_goal_unit", "Metrics Unit (Optional)")} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. Seedlings / Trees" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label={t("lbl_goal_start", "Starting Progress Value (Optional)")} type="number" value={startProgress || ""} onChange={(e) => setStartProgress(parseInt(e.target.value) || 0)} placeholder="e.g. 1000" />
              </div>

              <div className="flex items-center gap-3 mt-2 self-start select-none">
                <input
                  type="checkbox"
                  id="pin_tick_goal"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-gray-300"
                />
                <label htmlFor="pin_tick_goal" className="text-xs font-bold text-gray-700 cursor-pointer">
                  {t("lbl_pin_grid", "Pin on main dashboard metrics grid")}
                </label>
              </div>
            </motion.div>
          )}

          <Button type="submit" className="w-full mt-4 py-2.5">
            {t("btn_save_goal", "Formulate Goal")}
          </Button>
        </form>
      </Modal>

      {/* Edit goal details Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)} title={t("modal_edit_goal_details", "Edit Goal Details")}>
        <form onSubmit={handleEditDetails} className="flex flex-col gap-4 text-xs font-semibold">
          <Input label={t("lbl_goal_title", "Goal Title")} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Graft native seedlings" required />
          <Input label={t("lbl_goal_desc", "Short Description")} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What metrics are we resolving?" />
          
          <Input label={t("lbl_goal_deadline", "Target Deadline Date")} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />

          <div className="grid grid-cols-2 gap-4">
            <Input label={t("lbl_goal_target", "Target Value")} type="number" value={target || ""} onChange={(e) => setTarget(parseInt(e.target.value) || 0)} required />
            <Input label={t("lbl_goal_unit", "Metrics Unit")} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. Trees" />
          </div>

          <div className="flex items-center gap-3 mt-2 self-start select-none">
            <input
              type="checkbox"
              id="pin_tick_goal_edit"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-gray-300"
            />
            <label htmlFor="pin_tick_goal_edit" className="text-xs font-bold text-gray-750 cursor-pointer">
              {t("lbl_pin_grid", "Pin on main dashboard metrics grid")}
            </label>
          </div>

          <Button type="submit" className="w-full mt-4 py-2.5">
            {t("btn_update_goal", "Save Changes")}
          </Button>
        </form>
      </Modal>

      {/* Update Progress Slider Modal */}
      <Modal open={openUpdateModal} onClose={() => setOpenUpdateModal(false)} title={t("modal_edit_goal_title", "Update Progress")}>
        {selectedGoal && (
          <form onSubmit={handleUpdate} className="flex flex-col gap-6 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-750 font-display">{selectedGoal.title}</span>
              <Badge color="blue">{sliderVal.toLocaleString()} {selectedGoal.unit}</Badge>
            </div>
            
            <div className="flex flex-col gap-2.5 w-full mt-2">
              <input
                type="range"
                min="0"
                max={selectedGoal.target || 100}
                value={sliderVal}
                onChange={(e) => setSliderVal(parseInt(e.target.value) || 0)}
                className="w-full accent-[var(--org-primary)] cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                <span>0</span>
                <span>{(selectedGoal.target || 100).toLocaleString()} ({selectedGoal.unit || "%"})</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-t pt-4">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-350">
                Or enter precise progress numeric value:
              </label>
              <Input
                type="number"
                min="0"
                value={sliderVal}
                onChange={(e) => setSliderVal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full"
                placeholder="e.g. 25000"
              />
            </div>

            <Button type="submit" className="w-full mt-4 py-2.5">
              {t("btn_confirm_progress", "Confirm New Progress")}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};

// ==========================================
// 5. MEETINGS COMPACT MINUTES COMPILER
// ==========================================
export const MeetingsMinutes: React.FC = () => {
  const { t } = useLocalTranslation();
  const { activeOrg, activeMember } = useOrgStore();
  const { addToast } = useToast();
  const { data: meets, refetch } = useMeetings(activeOrg?.id);
  const createMutation = useCreateMeeting();
  const updateMutation = useUpdateMeeting();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedMeet, setSelectedMeet] = useState<Meeting | null>(null);

  // Create fields
  const [title, setTitle] = useState("");
  const [dateVal, setDateVal] = useState("");
  const [dur, setDur] = useState<number>(60);
  const [loc, setLoc] = useState("");
  const [link, setLink] = useState("");
  const [agenda, setAgenda] = useState<string>("");

  // Edit fields (Minutes)
  const [minutes, setMinutes] = useState("");

  const isAdmin = activeMember?.role === "org_admin";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateVal || !loc) return;

    if (new Date(dateVal) < new Date()) {
      addToast("Error: The meeting date and time must be set from the current moment forward!", "error");
      return;
    }

    const agendaItems = agenda
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => ({ title: line.trim(), duration: 20 }));

    try {
      await createMutation.mutateAsync({
        org_id: activeOrg?.id || "",
        title,
        date_time: new Date(dateVal).toISOString(),
        duration: dur,
        location: loc,
        link,
        agenda: agendaItems
      });
      setOpenAddModal(false);
      setTitle("");
      setDateVal("");
      setLoc("");
      setLink("");
      setAgenda("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMinutes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeet) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedMeet.id,
        org_id: activeOrg?.id || "",
        minutes,
        status: "completed"
      });
      setOpenEditModal(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans w-full">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-gray-901">{t("meet_tab_title", "Meetings & Minutes Console")}</h2>
          <p className="text-xs text-gray-500">{t("meet_tab_sub", "Coordinate boards, generate agendas, and log auditable transcripts.")}</p>
        </div>
        {isAdmin && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpenAddModal(true)}>
            {t("btn_schedule_meet", "Schedule Meeting")}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-6 w-full">
        {meets && meets.length > 0 ? (
          meets.map((m) => (
            <Card key={m.id} title={m.title} action={
              <div className="flex items-center gap-2">
                <Badge color={m.status === "completed" ? "green" : "blue"}>{t(m.status)}</Badge>
                {isAdmin && m.status !== "completed" && (
                  <Button size="sm" onClick={() => {
                    setSelectedMeet(m);
                    setMinutes(m.minutes || "");
                    setOpenEditModal(true);
                  }}>
                    {t("btn_log_minutes", "Log Minutes")}
                  </Button>
                )}
              </div>
            }>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs font-semibold text-gray-550 border-b pb-4">
                <div className="flex flex-col gap-1">
                  <span>{t("Schedule:")} <span className="text-gray-900 font-mono">{new Date(m.date_time).toLocaleDateString()} at {new Date(m.date_time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span></span>
                  <span>{t("Duration:")} <span className="text-gray-900 font-mono">{m.duration} {t("mins", "mins")}</span></span>
                </div>
                <div className="flex flex-col gap-1">
                  <span>{t("Location:")} <span className="text-gray-901">{m.location}</span></span>
                  {m.link && <span>{t("Conference Link:")} <a href={m.link} target="_blank" className="text-[var(--org-primary)] hover:underline truncate handle-link">{m.link}</a></span>}
                </div>
              </div>

              {m.agenda && m.agenda.length > 0 && (
                <div className="mb-4 text-xs">
                  <span className="font-bold text-gray-400 uppercase tracking-widest block mb-2 leading-none">{t("Structured Agendas")}</span>
                  <ul className="list-decimal pl-4 flex flex-col gap-1.5 leading-normal font-semibold">
                    {m.agenda.map((ag: any, idx: number) => (
                      <li key={idx} className="text-gray-700">
                        {ag.title} <span className="text-[10px] text-gray-400 font-normal">({ag.duration} {t("mins")})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {m.minutes && (
                <div className="p-4 bg-gray-50 rounded-xl mt-4 border text-xs">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider block mb-2 leading-none">{t("lbl_minutes_transcript", "Audited Minutes Transcript")}</span>
                  <p className="text-gray-750 font-medium leading-relaxed font-mono whitespace-pre-wrap">{m.minutes}</p>
                </div>
              )}
            </Card>
          ))
        ) : (
          <EmptyState title={t("empty_meets_title", "No Meetings Drafted")} message={t("empty_meets_msg", "Coordinate operational syncing or committee agenda meetings.")} />
        )}
      </div>

      {/* Schedule meeting modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)} title={t("modal_schedule_meet_title", "Log NGO Meeting Invite")}>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label={t("lbl_meet_title", "Meeting Title / Subject")} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Strategic Planning Q2 Audit" />
          <div className="grid grid-cols-2 gap-4 animate-in">
            <Input label={t("Schedule Date & Time")} type="datetime-local" value={dateVal} onChange={(e) => setDateVal(e.target.value)} min={new Date().toISOString().slice(0, 16)} />
            <Input label={t("lbl_meet_hours", "Duration Minutes")} type="number" value={dur || ""} onChange={(e) => setDur(parseInt(e.target.value) || 0)} placeholder="60" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t("lbl_meet_venue", "Location Venue")} value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="e.g. Rwanda Nursery Hub Kayonza" />
            <Input label={t("lbl_meet_link", "Virtual Link")} value={link} onChange={(e) => setLink(e.target.value)} placeholder="e.g. meet.google.com/abc-def" />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold text-gray-700">{t("lbl_meet_agenda", "Agenda Bullet points (One per Line)")}</label>
            <textarea
              className="w-full text-sm rounded-lg border bg-white border-gray-300 p-3 min-h-24 outline-none focus:ring-2 focus:ring-[var(--org-primary)] focus:border-transparent transition"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="e.g. Financial checkmarks&#10;Volunteering timeline logs&#10;Agroforestry seeds distribution"
            />
          </div>

          <Button type="submit" className="w-full mt-4 py-2.5">
            {t("btn_confirm_schedule", "Schedule Invitation")}
          </Button>
        </form>
      </Modal>

      {/* Log Minutes Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)} title={t("modal_log_minutes_title", "Log Auditable Minutes Draft")}>
        {selectedMeet && (
          <form onSubmit={handleSaveMinutes} className="flex flex-col gap-4">
            <p className="text-xs text-gray-500 mb-2">
              {t("Generate audited minutes transcript for **{title}**. This will mark meeting as **Completed** and publish details.", { title: selectedMeet.title })}
            </p>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-gray-750">{t("lbl_minutes_memo", "Audited Transcripts & Resolution Notes")}</label>
              <textarea
                className="w-full text-sm rounded-lg border bg-white border-gray-300 p-3.5 min-h-48 font-mono outline-none focus:ring-2 focus:ring-[var(--org-primary)]"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="### Q2 Operations Overview&#10;&#10;Key points:&#10;1. Sourcing confirmed..."
              />
            </div>

            <Button type="submit" className="w-full py-2.5">
              {t("btn_publish_lock", "Publish & Lock Transcripts")}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};

// ==========================================
// 6. DOCUMENTS CENTER MODULE
// ==========================================
export const DocumentsCenter: React.FC = () => {
  const { t } = useLocalTranslation();
  const { activeOrg } = useOrgStore();
  const { user } = useAuthStore();
  const { data: dbDocs, refetch } = useV2Documents(activeOrg?.id);
  const uploadMutation = useSubmitDocument();

  // drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [uploaderName, setUploaderName] = useState("");

  useEffect(() => {
    if (user?.full_name) {
      setUploaderName(user.full_name);
    }
  }, [user]);

  const triggerFileInput = () => {
    document.getElementById("doc-file-picker")?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setDocName(file.name);
      setOpenModal(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setDocName(file.name);
      setOpenModal(true);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !selectedFile) return;

    try {
      const objectUrl = window.URL.createObjectURL(selectedFile);
      
      await uploadMutation.mutateAsync({
        org_id: activeOrg?.id || "",
        name: docName,
        file_url: objectUrl,
        file_size: `${(selectedFile.size / 1024).toFixed(1)} KB`,
        uploaded_by: user?.id || "anonymous",
        uploader_name: uploaderName || "Anonymous Representative",
        requires_acknowledgement: false
      });

      setSelectedFile(null);
      setDocName("");
      setOpenModal(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans w-full">
      <div className="border-b pb-4">
        <h2 className="text-xl md:text-2xl font-bold font-display text-gray-910">{t("docs_tab_title", "Documents Resource Center")}</h2>
        <p className="text-xs text-gray-500">{t("docs_tab_sub", "Secure audits, Excel templates, and operational plans repository.")}</p>
      </div>

      <input
        type="file"
        id="doc-file-picker"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg"
      />

      <Card title={t("lbl_upload_guidelines", "Upload New Guidelines")} padding={false} className="mb-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed m-6 rounded-xl p-10 text-center flex flex-col items-center justify-center cursor-pointer transition select-none ${
            isDragging
              ? "border-[var(--org-primary)] bg-[var(--org-primary-l)]"
              : "border-gray-200 dark:border-slate-705 hover:bg-gray-50 dark:hover:bg-slate-800"
          }`}
        >
          <FolderDot className={`h-10 w-10 mb-3 transition-colors ${isDragging ? "text-[var(--org-primary)]" : "text-gray-400"}`} />
          <span className="text-sm font-bold text-gray-700 dark:text-slate-200">{t("Drag & Drop files here, or Click to Browse")}</span>
          <span className="text-[10px] text-gray-400 mt-1.5 font-semibold">{t("Supports PDF, XLSX, DOCX, Images up to 15MB")}</span>
        </div>
      </Card>

      <Card title={t("lbl_library_files", "Library Files")} padding={false}>
        <div className="divide-y divide-gray-100 dark:divide-slate-755 text-xs md:text-sm">
          {dbDocs && dbDocs.length > 0 ? (
            dbDocs.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800 transition select-none">
                <div className="flex items-center gap-3.5 min-w-0">
                  <FileText className="h-6.5 w-6.5 text-gray-400 shrink-0" />
                  <div className="flex flex-col truncate leading-normal">
                    <span className="font-bold text-gray-901 dark:text-gray-100 truncate max-w-[200px] sm:max-w-xs">{doc.name}</span>
                    <span className="text-[10px] text-gray-450 mt-1 font-semibold">
                      {t("Uploaded by:")} <strong className="text-gray-700 dark:text-slate-200">{doc.uploaded_by}</strong> • {doc.file_size}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono">
                  <span className="text-gray-455 text-[10px] hidden sm:inline font-semibold">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ""}
                  </span>
                  {doc.file_url ? (
                    <a href={doc.file_url} download={doc.name} target="_blank" rel="noreferrer" className="no-underline">
                      <Button size="sm" variant="outline" className="font-bold">
                        {t("btn_read_file", "Read File")}
                      </Button>
                    </a>
                  ) : (
                    <Button size="sm" variant="outline" disabled className="font-bold">
                      {t("btn_read_file", "Read File")}
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 font-semibold select-none flex flex-col items-center">
              <FolderDot className="h-10 w-10 text-gray-300 mb-2" />
              <span>{t("empty_docs_title", "No custom files uploaded yet")}</span>
              <p className="text-xs font-normal text-gray-400 mt-1">{t("empty_docs_msg", "Drag and drop resource guidelines to persist documents for all members.")}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Upload confirmation detail modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title={t("modal_upload_doc_title", "Upload Guideline Library File")}>
        <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
          <Input
            label={t("lbl_doc_title", "Library Document Name")}
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="e.g. Cooperative Guidelines 2026.pdf"
            required
          />

          <Input
            label={t("lbl_uploader_name", "Uploader Representative Name")}
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            placeholder="e.g. Divine Uwera (Cooperative Chairperson)"
            required
          />

          {selectedFile && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-mono font-bold text-gray-550 flex justify-between border">
              <span>{t("Selected local file:")} {selectedFile.name}</span>
              <span>{t("Size:")} {(selectedFile.size / 1024).toFixed(1)} KB</span>
            </div>
          )}

          <Button type="submit" loading={uploadMutation.isPending} className="w-full mt-4 py-2.5 font-bold uppercase text-xs">
            {t("btn_confirm_upload", "Confirm Upload")}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

// ==========================================
// 7. PUBLIC IMPACT PROGRESS TRACKER (D3 / SVG Charts)
export const ImpactTracker: React.FC = () => {
  const { t } = useLocalTranslation();
  const { activeOrg, activeMember } = useOrgStore();
  const { formatAmount } = useCurrencyStore();
  const { addToast } = useToast();

  const { data: activities, refetch: refetchActs } = useActivityLogs(activeOrg?.id);
  const submitActMutation = useSubmitActivityLog();
  const { data: members } = useMembers(activeOrg?.id);

  // Form states
  const [openLogModal, setOpenLogModal] = useState(false);
  const [actTitle, setActTitle] = useState("");
  const [actDesc, setActDesc] = useState("");
  const [actType, setActType] = useState("Tree Planting Campaign");
  const [actLocation, setActLocation] = useState("");
  const [actMetric, setActMetric] = useState("1000 Seedlings");
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});

  const isAdmin = activeMember?.role === "org_admin" || activeMember?.role === "manager";

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim()) return;

    // Build lists of present / absent users
    const presentList: string[] = [];
    members?.forEach((m) => {
      if (presenceMap[m.id]) {
        presentList.push(m.id);
      }
    });

    try {
      await submitActMutation.mutateAsync({
        org_id: activeOrg?.id || "",
        title: actTitle,
        description: `${actType} - Status: ${actDesc}. Metric target: ${actMetric}`,
        location: actLocation,
        activity_date: new Date().toISOString(),
        created_by: activeMember?.user_id || "",
        attendees: presentList
      });

      setActTitle("");
      setActDesc("");
      setActLocation("");
      setActMetric("");
      setPresenceMap({});
      setOpenLogModal(false);
      refetchActs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerWarning = (mName: string) => {
    addToast(`Automated notification template SMS dispatched to ${mName}: "Hello, we missed you at the reforestation campaign yesterday. Please check project updates."`, "info");
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans w-full animate-in fade-in duration-200">
      <div className="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-gray-910">{t("Impact KPI Analytics")}</h2>
          <p className="text-xs text-gray-500">{t("Strategic community achievements, ecological restorations, and farm logs.")}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setOpenLogModal(true)} icon={<Plus className="h-4.5 w-4.5" />} size="sm">
            {t("Log Field Campaign")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="bg-white dark:bg-slate-800 border p-5 rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 font-extrabold">{t("Ecology Restoration")}</span>
            <span className="text-3xl font-extrabold font-display block text-emerald-600 mt-2">12,400</span>
            <p className="text-xs text-gray-500 mt-1">{t("Native and agroforestry trees bedded completely across Eastern hillsides.")}</p>
          </div>
          <div className="w-full bg-emerald-100 dark:bg-emerald-950/20 rounded h-1.5 overflow-hidden mt-6">
            <div className="bg-emerald-555 h-full w-[85%]" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border p-5 rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-blue-600 font-extrabold">{t("Community Training KPI")}</span>
            <span className="text-3xl font-extrabold font-display block text-blue-600 mt-2">820</span>
            <p className="text-xs text-gray-500 mt-1">{t("Progressive cooperative farm leaders certified in dryland pruning rules.")}</p>
          </div>
          <div className="w-full bg-blue-100 dark:bg-blue-950/20 rounded h-1.5 overflow-hidden mt-6">
            <div className="bg-blue-555 h-full w-[60%]" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border p-5 rounded-xl flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-600 font-extrabold">{t("Financial Leverages")}</span>
            <span className="text-3xl font-extrabold font-display block text-amber-600 mt-2">{formatAmount(1200000)}</span>
            <p className="text-xs text-gray-500 mt-1">{t("Secured, auditable donations bedded to ledgers under operations tags.")}</p>
          </div>
          <div className="w-full bg-amber-100 dark:bg-amber-950/20 rounded h-1.5 overflow-hidden mt-6">
            <div className="bg-amber-555 h-full w-[70%]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full shrink-0">
        {/* outreach achievements list */}
        <Card title={t("NGO Outreach & Reforestation Campaigns Registry")}>
          <div className="flex flex-col gap-4">
            {activities && activities.length > 0 ? (
              activities.map((a) => (
                <div key={a.id} className="p-4 rounded-xl border border-gray-150 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900 flex flex-col gap-3">
                  <div className="flex justify-between items-start leading-none">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-stone-900 dark:text-gray-150">{a.title}</span>
                      <span className="text-[9px] font-mono uppercase text-emerald-750 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md inline-block self-start">{t(a.activity_type)}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 font-bold">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{a.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-gray-455 pt-2 border-t">
                    <span>{t("Venue:")} <span className="text-stone-900 dark:text-gray-250 font-extrabold">{a.location}</span></span>
                    <span>{t("Target Target:")} <span className="text-stone-900 dark:text-gray-250 font-extrabold">{a.target_metric}</span></span>
                  </div>

                  {/* Attendance Stats summary */}
                  <div className="flex gap-4 items-center mt-1 font-mono text-[9px] text-gray-455 leading-none select-none">
                    <span className="bg-emerald-500/10 text-emerald-800 px-2 py-1 rounded font-extrabold">{t("Present:")} {a.present_member_ids?.length || 0} {t("volunteers")}</span>
                    <span className="bg-red-500/10 text-red-800 px-2 py-1 rounded font-extrabold">{t("Absent:")} {a.absent_member_ids?.length || 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title={t("No field activities logged yet")} message={t("When you complete dry-run community trainings or seed planting campaigns, log them here to verify presence logs.")} />
            )}
          </div>
        </Card>

        {/* absent follow-ups */}
        <Card title={t("Absence Support & Attendance Recovery Dashboard")}>
          <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              {t("The platform automatically tracks members missing registered operations. Dispatch custom variable-driven SMS alerts to check workspace statuses.")}
            </p>

            <div className="flex flex-col gap-3 w-full border-t pt-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-455 font-bold block mb-1">{t("Volunteers Flagged Last Activity")}</span>
              
              {/* Dummy check-list of members with trigger button */}
              <div className="divide-y text-xs font-semibold">
                <div className="flex justify-between items-center py-3">
                  <span className="text-stone-900 dark:text-stone-100">Kambanda Jean Paul</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-red-600 bg-red-50 px-2 py-0.5 rounded-md font-mono font-bold leading-none">{t("Absent (Reforestation)")}</span>
                    <Button size="xs" variant="outline" onClick={() => handleTriggerWarning("Kambanda Jean Paul")}>{t("Follow Up")}</Button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-stone-900 dark:text-stone-100">Nyiraliziki Claudine</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-red-600 bg-red-50 px-2 py-0.5 rounded-md font-mono font-bold leading-none">{t("Absent (Reforestation)")}</span>
                    <Button size="xs" variant="outline" onClick={() => handleTriggerWarning("Nyiraliziki Claudine")}>{t("Follow Up")}</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* SVG Beautiful Dynamic Chart (Ecology Plantation trends) */}
      <Card title={t("Reforestation Plantation Curve Trends (2026)")}>
        <div className="p-4 w-full h-[260px] relative select-none">
          <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
            {/* Grid indicators */}
            <line x1="0" y1="50" x2="600" y2="50" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="100" x2="600" y2="100" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="150" x2="600" y2="150" stroke="#f1f5f9" strokeWidth="1" />

            {/* Line Trend Vector */}
            <path
              d="M 50 180 Q 150 130 250 120 T 450 70 T 550 40"
              fill="none"
              stroke="var(--org-primary)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* SVG dots */}
            <circle cx="50" cy="180" r="6" fill="var(--org-primary)" stroke="white" strokeWidth="2" />
            <circle cx="180" cy="140" r="6" fill="var(--org-primary)" stroke="white" strokeWidth="2" />
            <circle cx="310" cy="110" r="6" fill="var(--org-primary)" stroke="white" strokeWidth="2" />
            <circle cx="440" cy="70" r="6" fill="var(--org-primary)" stroke="white" strokeWidth="2" />
            <circle cx="550" cy="40" r="6" fill="var(--org-primary)" stroke="white" strokeWidth="2" />

            {/* Month ticks */}
            <text x="45" y="195" fill="#94a3b8" fontSize="9" fontWeight="bold">{t("Jan")}</text>
            <text x="175" y="195" fill="#94a3b8" fontSize="9" fontWeight="bold">{t("Mar")}</text>
            <text x="305" y="195" fill="#94a3b8" fontSize="9" fontWeight="bold">{t("May")}</text>
            <text x="435" y="195" fill="#94a3b8" fontSize="9" fontWeight="bold">{t("Jul")}</text>
            <text x="545" y="195" fill="#94a3b8" fontSize="9" fontWeight="bold">{t("Sep")}</text>
          </svg>
        </div>
      </Card>

      {/* Admin log modal */}
      <Modal open={openLogModal} onClose={() => setOpenLogModal(false)} title={t("Record Operational Field Reforestation Campaign")}>
        <form onSubmit={handleCreateActivity} className="flex flex-col gap-4 font-bold text-xs select-none">
          <Input label={t("Campaign/Training Name")} value={actTitle} onChange={(e) => setActTitle(e.target.value)} placeholder="e.g. Bugesera Dryland Pruning Workshop" />
          <Input label={t("Description KPI achieved")} value={actDesc} onChange={(e) => setActDesc(e.target.value)} placeholder="What was achieved?" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700">{t("Campaign Type")}</label>
              <select
                value={actType}
                onChange={(e) => setActType(e.target.value)}
                className="w-full text-xs rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-705 px-3 py-2 text-stone-800"
              >
                <option value="Tree Planting Campaign">{t("Tree Planting Campaign")}</option>
                <option value="Dryland Agropastoral Training">{t("Dryland Agropastoral Training")}</option>
                <option value="Cooperative Dues Review meeting">{t("Cooperative Dues Review")}</option>
              </select>
            </div>
            <Input label={t("Target Metric Achieved")} value={actMetric} onChange={(e) => setActMetric(e.target.value)} placeholder="e.g. 500 seedlings bedded" />
          </div>

          <Input label={t("Campaign Venue / Sector")} value={actLocation} onChange={(e) => setActLocation(e.target.value)} placeholder="e.g. Kayonza sector 3 nursery plots" />

          {/* Member Presence Attendance list ticking */}
          <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto border rounded-xl p-3 bg-stone-50/20">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-455 font-bold block mb-1">{t("Volunteers Attendance Sheets")}</span>
            {members && members.length > 0 ? (
              members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-1 text-xs">
                  <input
                    type="checkbox"
                    id={`pres_${m.id}`}
                    checked={!!presenceMap[m.id]}
                    onChange={(e) => setPresenceMap({ ...presenceMap, [m.id]: e.target.checked })}
                    className="h-4.5 w-4.5 rounded cursor-pointer"
                  />
                  <label htmlFor={`pres_${m.id}`} className="text-gray-700 cursor-pointer">{m.user?.full_name || "Volunteer"}</label>
                </div>
              ))
            ) : (
              <span className="text-[10px] text-gray-400">{t("No active members registered in your database directory.")}</span>
            )}
          </div>

          <Button type="submit" className="w-full mt-4 py-2.5 uppercase tracking-wider font-extrabold text-xs">
            {t("Commit Operational Field Campaign Log")}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

// ==========================================
// 8. VOTES / POLLS PARTICIPATION MODULE
// ==========================================
export const VotesPolls: React.FC = () => {
  const { t } = useLocalTranslation();
  const [votes, setVotes] = useState([
    { id: "vote-1", title: "Should we prioritize Podocarpus native trees forMt. Kigali?", votesA: 45, votesB: 12, optionA: "Yes, native Podocarpus", optionB: "No, secondary Agroforestry", voted: false },
    { id: "vote-2", title: "Approve relocation of Gatsibo seed beds to Kayonza Hub", votesA: 32, votesB: 28, optionA: "Approve relocation", optionB: "Retain local plots", voted: false }
  ]);

  const handleVote = (id: string, option: "A" | "B") => {
    setVotes((prev) =>
      prev.map((v) => {
        if (v.id === id && !v.voted) {
          return {
            ...v,
            votesA: option === "A" ? v.votesA + 1 : v.votesA,
            votesB: option === "B" ? v.votesB + 1 : v.votesB,
            voted: true
          };
        }
        return v;
      })
    );
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans w-full animate-in">
      <div className="border-b pb-4">
        <h2 className="text-xl md:text-2xl font-bold font-display text-gray-910">{t("democratic_center", "Democratic Polling Center")}</h2>
        <p className="text-xs text-gray-500">{t("democratic_subtitle", "Cast votes, express strategic choices, and check real-time transparent reviews.")}</p>
      </div>

      <div className="flex flex-col gap-6 w-full">
        {votes.map((v) => {
          const total = v.votesA + v.votesB;
          const pA = total > 0 ? Math.round((v.votesA / total) * 100) : 0;
          const pB = total > 0 ? Math.round((v.votesB / total) * 100) : 0;

          return (
            <Card key={v.id} title={t(v.title)} action={<Badge color={v.voted ? "green" : "blue"}>{v.voted ? t("Voted Saved") : t("Awaiting Vote")}</Badge>}>
              {v.voted ? (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-col gap-1.5 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span>{t(v.optionA)}</span>
                      <span>{pA}% ({v.votesA} {t("votes")})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[var(--org-primary)] h-full transition-all duration-200" style={{ width: `${pA}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span>{t(v.optionB)}</span>
                      <span>{pB}% ({v.votesB} {t("votes")})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-200" style={{ width: `${pB}%` }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 mt-4 w-full md:w-3/4 shrink-0">
                  <Button variant="outline" className="w-1/2 py-2.5 hover:border-[var(--org-primary)]" onClick={() => handleVote(v.id, "A")}>
                    {t(v.optionA)}
                  </Button>
                  <Button variant="outline" className="w-1/2 py-2.5 hover:border-amber-500" onClick={() => handleVote(v.id, "B")}>
                    {t(v.optionB)}
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 9. SCHEDULED EVENTS & MANUAL CHECK-IN MODULE
// ==========================================
export const EventsCalendar: React.FC = () => {
  const { activeOrg, activeMember } = useOrgStore();
  const { addToast } = useToast();
  const { t } = useLocalTranslation();
  const { data, refetch } = useEvents(activeOrg?.id);
  const events = (data || []) as ImpactEvent[];
  const createMutation = useCreateEvent();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ImpactEvent | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const [simulatedCheckinOk, setSimulatedCheckinOk] = useState(false);

  const isAdmin = activeMember?.role === "org_admin";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateTime || !location) return;

    if (new Date(dateTime) < new Date()) {
      addToast("Error: The event date and time must be set from the current moment forward!", "error");
      return;
    }

    try {
      await createMutation.mutateAsync({
        org_id: activeOrg?.id || "",
        title,
        description: desc,
        date_time: new Date(dateTime).toISOString(),
        location,
        status: "upcoming",
        is_public: isPublic
      });
      setOpenAddModal(false);
      setTitle("");
      setDesc("");
      setDateTime("");
      setLocation("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditInit = (event: ImpactEvent) => {
    setSelectedEvent(event);
    setTitle(event.title);
    setDesc(event.description);
    setDateTime(event.date_time.slice(0, 16));
    setLocation(event.location);
    setIsPublic(event.is_public);
    setOpenEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !title || !dateTime || !location) return;

    try {
      await updateEventMutation.mutateAsync({
        id: selectedEvent.id,
        org_id: activeOrg?.id || "",
        title,
        description: desc,
        date_time: new Date(dateTime).toISOString(),
        location,
        is_public: isPublic
      });
      setOpenEditModal(false);
      setSelectedEvent(null);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (event: ImpactEvent) => {
    if (confirm("Delete this event? It will be archived.")) {
      try {
        await deleteEventMutation.mutateAsync({ id: event.id, org_id: activeOrg?.id || "" });
        refetch();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSimulateCheckin = () => {
    setSimulatedCheckinOk(true);
    setTimeout(() => setSimulatedCheckinOk(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans w-full">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-gray-901">{t("dashboard_labels.events_board_title")}</h2>
          <p className="text-xs text-gray-500 font-medium">{t("dashboard_labels.events_board_subtitle")}</p>
        </div>
        {isAdmin && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpenAddModal(true)}>
            {t("dashboard_labels.schedule_session")}
          </Button>
        )}
      </div>

      {simulatedCheckinOk && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-semibold rounded-lg">
          {t("dashboard_labels.attendance_logged_success")}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Events Schedule list */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {events && events.length > 0 ? (
            events.map((ev: ImpactEvent) => (
              <Card key={ev.id} title={ev.title} action={
                <div className="flex items-center gap-1.5">
                  <Badge color="blue">{ev.status.toUpperCase()}</Badge>
                  {isAdmin && (
                    <>
                      <button onClick={() => handleEditInit(ev)} className="p-1 text-gray-400 hover:text-[var(--org-primary)]">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(ev)} className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              }>
                <p className="text-xs text-gray-500 mb-4 leading-normal">{ev.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-550 border-t pt-4 leading-none">
                  <span>Date: <span className="text-gray-900 font-mono">{new Date(ev.date_time).toLocaleDateString()}</span></span>
                  <span>Venue: <span className="text-gray-901">{ev.location}</span></span>
                </div>

                {isAdmin && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-dashed leading-none select-none shrink-0">
                    <span className="text-[10px] text-gray-400 font-mono">{t("dashboard_labels.self_attendance_qr_code")}</span>
                    <Button size="sm" variant="outline" onClick={() => setSelectedEvent(ev)}>
                      {t("dashboard_labels.generate_qr_code")}
                    </Button>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <EmptyState title={t("dashboard_labels.no_active_schedules")} message={t("dashboard_labels.create_session_msg")} />
          )}
        </div>

        {/* QR Code and Attendance Tracker Widget */}
        <div className="flex flex-col gap-6">
          <Card title={t("dashboard_labels.presence_verification_gate")}>
            {selectedEvent ? (
              <div className="flex flex-col items-center text-center gap-4">
                {/* SVG Mock Stunning QR Code */}
                <div className="h-44 w-44 border p-3.5 rounded-xl bg-white shadow-sm flex items-center justify-center animate-in zoom-in-50 duration-150">
                  <svg className="h-full w-full text-stone-900" viewBox="0 0 100 100">
                    <rect x="10" y="10" width="25" height="25" fill="currentColor" stroke="white" strokeWidth="2" />
                    <rect x="65" y="10" width="25" height="25" fill="currentColor" stroke="white" strokeWidth="2" />
                    <rect x="10" y="65" width="25" height="25" fill="currentColor" stroke="white" strokeWidth="2" />
                    {/* Matrix noise */}
                    <rect x="42" y="10" width="8" height="8" fill="currentColor" />
                    <rect x="52" y="18" width="8" height="8" fill="currentColor" />
                    <rect x="42" y="32" width="12" height="12" fill="currentColor" />
                    <rect x="10" y="42" width="12" height="12" fill="currentColor" />
                    <rect x="25" y="52" width="8" height="8" fill="currentColor" />
                    <rect x="65" y="42" width="25" height="12" fill="currentColor" />
                    <rect x="75" y="65" width="15" height="15" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-xs text-stone-900">{t("dashboard_labels.digital_checkin_qr_key")}</span>
                  <span className="text-[10px] text-gray-400 mt-1.5 font-mono">ID: {selectedEvent.id}</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal">
                  {t("dashboard_labels.scan_qr_desc")}
                </p>

                <div className="flex flex-col gap-2 w-full mt-2 select-none border-t pt-4">
                  <Input type="text" placeholder={t("dashboard_labels.check_by_full_name")} defaultValue="John Doe" />
                  <Button size="sm" onClick={handleSimulateCheckin}>{t("dashboard_labels.manual_checkin")}</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500">{t("dashboard_labels.select_event_qr_desc")}</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Edit event Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)} title="Edit Scheduled Session">
        <form onSubmit={handleUpdate} className="flex flex-col gap-4 animate-in">
          <Input label="Event Name" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Short Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date & Time" type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} required />
            <Input label="Venue / Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>

          <div className="flex items-center gap-3 mt-4 self-start select-none">
            <input
              type="checkbox"
              id="event_visibility_edit"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4.5 w-4.5 rounded"
            />
            <label htmlFor="event_visibility_edit" className="text-xs font-bold text-gray-700 cursor-pointer">
              Publish to public portal
            </label>
          </div>

          <Button type="submit" className="w-full mt-4 py-2.5">
            Save Changes
          </Button>
        </form>
      </Modal>

      {/* Add event Modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)} title={t("dashboard_labels.schedule_community_session")}>
        <form onSubmit={handleCreate} className="flex flex-col gap-4 animate-in">
          <Input label={t("dashboard_labels.event_name_title")} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("dashboard_labels.event_name_placeholder")} />
          <Input label={t("dashboard_labels.brief_description")} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("dashboard_labels.brief_description_placeholder")} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label={t("dashboard_labels.schedule_date_time")} type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} min={new Date().toISOString().slice(0, 16)} />
            <Input label={t("dashboard_labels.venue_location")} value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("dashboard_labels.venue_placeholder")} />
          </div>

          <div className="flex items-center gap-3 mt-4 self-start select-none">
            <input
              type="checkbox"
              id="event_visibility"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4.5 w-4.5 rounded"
            />
            <label htmlFor="event_visibility" className="text-xs font-bold text-gray-700 cursor-pointer">
              {t("dashboard_labels.publish_public_portal")}
            </label>
          </div>

          <Button type="submit" className="w-full mt-4 py-2.5">
            {t("dashboard_labels.confirm_schedule_session")}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

