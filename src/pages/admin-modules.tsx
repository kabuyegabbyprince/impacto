import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useLocalTranslation } from "../locales/additional-translations";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  Users,
  UserCheck,
  UserMinus,
  Coins,
  Download,
  Award,
  Clock,
  Trash2,
  Plus,
  Search,
  Heart,
  Camera,
  FileCheck2,
  Printer,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Mail,
  AlertCircle,
  Fingerprint,
  CheckCircle2,
  XCircle,
  FileText
} from "lucide-react";
import { useOrgStore } from "../store/orgStore";
import { useCurrencyStore } from "../store/currencyStore";
import {
  useMembers,
  useUpdateMemberStatus,
  useCreateMember,
  useLedgerEntries,
  useCreateLedgerEntry,
  useDonations,
  useConfirmDonation,
  useCreateDonation,
  useGrants,
  useCreateGrant,
  useUpdateGrantStatus,
  useIdentityVerifications,
  useReviewIdentityVerification,
  useResignations,
  useGoals
} from "../hooks/useImpactoData";
import { Button, Input, Card, Badge, Avatar, Table, Modal, EmptyState } from "../components/ui";
import { useToast } from "../components/Toast";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

// ==========================================
// 1. ROSTER MEMBERS LISTS (Admin Route)
// ==========================================
export const MembersManagement: React.FC = () => {
  const { t } = useLocalTranslation();
  const { addToast } = useToast();
  const { activeOrg, activeMember } = useOrgStore();
  const { data: members, refetch } = useMembers(activeOrg?.id);
  const inviteMutation = useCreateMember();
  const statusMutation = useUpdateMemberStatus();

  // New V2 states & modules integrations
  const [activeTab, setActiveTab ] = useState<"directory" | "volunteers" | "verifications" | "resignations">("directory");
  const { data: verifications, refetch: refetchVerifs } = useIdentityVerifications(activeOrg?.id);
  const reviewVerifMutation = useReviewIdentityVerification();
  const { data: resignations, refetch: refetchResigns } = useResignations(activeOrg?.id);

  const totalResigns = resignations ? resignations.length : 0;
  const relocationCount = resignations ? resignations.filter(r => r.reason_category?.includes("Relocation") || r.reason_category?.includes("Resettlement")).length : 0;
  const mismatchCount = resignations ? resignations.filter(r => r.reason_category?.includes("Mismatch")).length : 0;
  const schedulingCount = resignations ? resignations.filter(r => r.reason_category?.includes("Scheduling") || r.reason_category?.includes("Conflict")).length : 0;
  const healthCount = resignations ? resignations.filter(r => r.reason_category?.includes("Health") || r.reason_category?.includes("Personal")).length : 0;

  const relocationPercent = totalResigns > 0 ? Math.round((relocationCount / totalResigns) * 100) : 0;
  const mismatchPercent = totalResigns > 0 ? Math.round((mismatchCount / totalResigns) * 100) : 0;
  const schedulingPercent = totalResigns > 0 ? Math.round((schedulingCount / totalResigns) * 100) : 0;
  const healthPercent = totalResigns > 0 ? Math.round((healthCount / totalResigns) * 100) : 0;

  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"org_admin" | "member">("member");
  const [search, setSearch] = useState("");

  // Volunteer hours ledger states
  const [openHourLogModal, setOpenHourLogModal] = useState(false);
  const [selectedVol, setSelectedVol] = useState<any | null>(null);
  const [loggedHours, setLoggedHours] = useState<number>(0);
  const [loggedTask, setLoggedTask] = useState("");
  const [volunteerHours, setVolunteerHours] = useState<Record<string, { hours: number; task: string }>>(() => {
    try {
      const saved = localStorage.getItem("impacto_vol_hours");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleLogHours = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVol) return;
    const updated = {
      ...volunteerHours,
      [selectedVol.id]: {
        hours: (volunteerHours[selectedVol.id]?.hours || 0) + loggedHours,
        task: loggedTask || volunteerHours[selectedVol.id]?.task || "General Helper"
      }
    };
    setVolunteerHours(updated);
    localStorage.setItem("impacto_vol_hours", JSON.stringify(updated));
    setOpenHourLogModal(false);
    setLoggedHours(0);
    setLoggedTask("");
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    try {
      await inviteMutation.mutateAsync({
        orgId: activeOrg?.id || "",
        email: inviteEmail,
        fullName: inviteName,
        role: inviteRole
      });
      setOpenInviteModal(false);
      setInviteName("");
      setInviteEmail("");
      refetch();
      addToast("Member invited successfully", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to invite member", "error");
    }
  };

  const handleToggleVolunteer = async (memberId: string, currentStatus: boolean | undefined) => {
    try {
      await statusMutation.mutateAsync({ id: memberId, is_volunteer: !currentStatus });
      refetch();
      addToast("Volunteer status updated", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to update status", "error");
    }
  };

  const handleStatusChange = async (memberId: string, action: "active" | "suspended") => {
    try {
      await statusMutation.mutateAsync({ id: memberId, status: action });
      refetch();
      addToast("Member status updated", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to update status", "error");
    }
  };

  const handleReviewVerification = async (vId: string, mId: string, decision: "approved" | "rejected") => {
    try {
      await reviewVerifMutation.mutateAsync({
        id: vId,
        org_id: activeOrg?.id || "",
        member_id: mId,
        status: decision,
        reviewed_by: activeMember?.user_id || "",
        review_notes: decision === "approved" ? "Verified via automatic portal audit." : "Document photo is blurry. Please re-upload clear proof of identity."
      });
      refetchVerifs();
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMembers = members?.filter((m) => {
    const term = search.toLowerCase();
    return m.user?.full_name.toLowerCase().includes(term) ||
           m.user?.email.toLowerCase().includes(term) ||
           (m.member_number || "").toLowerCase().includes(term);
  }) || [];

  const columns = [
    {
      header: t("lbl_avatar_name"),
      accessor: "name",
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.user?.full_name || "M"} size="xs" />
          <div className="flex flex-col text-xs leading-none">
            <span className="font-bold text-gray-911 dark:text-white flex items-center gap-1.5">
              {row.user?.full_name}
              {row.verification_status === "verified" && (
                <Fingerprint className="h-3.5 w-3.5 text-emerald-555 shrink-0" title={t("lbl_badge_stamped")} />
              )}
            </span>
            <span className="text-[10px] text-gray-400 mt-1 font-mono">{row.user?.email}</span>
          </div>
        </div>
      )
    },
    {
      header: t("lbl_member_id"),
      accessor: "member_number",
      cell: (row: any) => <span className="font-mono text-xs font-semibold text-gray-650">{row.member_number || "--"}</span>
    },
    {
      header: t("lbl_system_role"),
      accessor: "role",
      cell: (row: any) => (
        <Badge color={row.role === "org_admin" ? "amber" : "blue"}>
          {row.role === "org_admin" ? t("lbl_role_admin") : t("lbl_role_participant")}
        </Badge>
      )
    },
    {
      header: t("lbl_member_status"),
      accessor: "status",
      cell: (row: any) => {
        const lbl = row.status === "active" ? t("lbl_status_active") : row.status === "pending" ? t("lbl_status_pending") : t("lbl_status_suspended");
        return (
          <Badge color={row.status === "active" ? "green" : row.status === "pending" ? "amber" : "red"}>
            {lbl}
          </Badge>
        );
      }
    },
    {
      header: t("lbl_roster_actions"),
      accessor: "actions",
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={row.is_volunteer ? "solid" : "outline"}
            className={!row.is_volunteer ? "text-amber-600 border-amber-600" : ""}
            onClick={() => handleToggleVolunteer(row.id, row.is_volunteer)}
            icon={<Heart className="h-3.5 w-3.5" />}
          >
            {row.is_volunteer ? t("btn_remove_volunteer") : t("btn_make_volunteer")}
          </Button>

          {row.status === "pending" && (
            <Button size="sm" icon={<UserCheck className="h-3.5 w-3.5" />} onClick={() => handleStatusChange(row.id, "active")}>
              {t("btn_approve")}
            </Button>
          )}

          {row.status === "active" && (
            <Button size="sm" variant="outline" icon={<UserMinus className="h-3.5 w-3.5" />} onClick={() => handleStatusChange(row.id, "suspended")}>
              {t("btn_suspend")}
            </Button>
          )}

          {row.status === "suspended" && (
            <Button size="sm" variant="outline" onClick={() => handleStatusChange(row.id, "active")}>
              {t("btn_reinstate")}
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 select-none font-sans w-full animate-in fade-in duration-250">
      <div className="flex items-center justify-between border-b pb-4 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-gray-901">{t("members_dir_title")}</h2>
          <p className="text-xs text-gray-400">{t("members_dir_subtitle")}</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpenInviteModal(true)}>
          {t("btn_invite_member")}
        </Button>
      </div>

      {/* Modern navigation subtabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 gap-6 select-none font-sans leading-none pb-0.5">
        <button
          onClick={() => setActiveTab("directory")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 hover:text-stone-900 leading-none ${
            activeTab === "directory"
              ? "border-[var(--org-primary)] text-stone-900 font-extrabold"
              : "border-transparent text-gray-450"
          }`}
        >
          {t("tab_directory")}
        </button>
        <button
          onClick={() => setActiveTab("volunteers")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 hover:text-stone-900 leading-none ${
            activeTab === "volunteers"
              ? "border-[var(--org-primary)] text-stone-900 font-extrabold"
              : "border-transparent text-gray-450"
          }`}
        >
          {t("tab_volunteers")}
        </button>
        <button
          onClick={() => setActiveTab("verifications")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 hover:text-stone-900 leading-none flex items-center gap-1.5 ${
            activeTab === "verifications"
              ? "border-[var(--org-primary)] text-stone-900 font-extrabold"
              : "border-transparent text-gray-450"
          }`}
        >
          {t("tab_verifications")}
          {verifications && verifications.filter(v => v.status === "pending").length > 0 && (
            <Badge color="amber" className="text-[9px] px-1 py-0">{verifications.filter(v => v.status === "pending").length}</Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("resignations")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 hover:text-stone-900 leading-none flex items-center gap-1.5 ${
            activeTab === "resignations"
              ? "border-[var(--org-primary)] text-stone-900 font-extrabold"
              : "border-transparent text-gray-450"
          }`}
        >
          {t("tab_resignations")}
          {resignations && resignations.filter(r => r.status === "pending").length > 0 && (
            <Badge color="red" className="text-[9px] px-1 py-0">{resignations.filter(r => r.status === "pending").length}</Badge>
          )}
        </button>
      </div>

      {activeTab === "directory" && (
        <div className="flex flex-col gap-6">
          <div className="w-full md:w-80 select-none">
            <Input
              type="text"
              placeholder={t("search_members_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefixIcon={<Search className="h-4 w-4 text-gray-400" />}
            />
          </div>

          <Table columns={columns} data={filteredMembers} emptyMessage={t("empty_search_members")} />
        </div>
      )}

      {activeTab === "volunteers" && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-slate-500/5 p-4 rounded-xl border">
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-150">{t("vol_ledger_title")}</h3>
              <p className="text-[11px] text-gray-500">{t("vol_ledger_subtitle")}</p>
            </div>
            <div className="text-xs font-bold text-[var(--org-primary)] bg-emerald-500/10 px-3 py-1 rounded">
              {t("vol_active_count", { count: filteredMembers.filter(m => m.role !== "org_admin").length })}
            </div>
          </div>

          <div className="w-full md:w-80 select-none">
            <Input
              type="text"
              placeholder={t("vol_search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefixIcon={<Search className="h-4 w-4 text-gray-400" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members?.filter(m => m.is_volunteer).map((m) => {
              const ledger = volunteerHours[m.id] || { hours: 0, task: "General Volunteer" };
              return (
                <Card key={m.id} title={m.user?.full_name || t("lbl_role_participant")} action={
                  <Button size="sm" variant="outline" onClick={() => {
                    setSelectedVol(m);
                    setOpenHourLogModal(true);
                  }}>
                    {t("btn_log_contribution")}
                  </Button>
                }>
                  <p className="text-xs text-gray-500 font-semibold mb-3">Email: <span className="text-gray-700 dark:text-slate-350 font-mono">{m.user?.email}</span></p>
                  <div className="grid grid-cols-2 gap-2 border-t pt-3 mt-3 text-xs leading-none">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-450 text-[10px] font-bold uppercase">{t("vol_logged_hours")}</span>
                      <span className="font-mono text-stone-900 dark:text-stone-100 font-extrabold text-sm">{t("vol_hours_display", { hours: ledger.hours })}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-455 text-[10px] font-bold uppercase">{t("vol_primary_task")}</span>
                      <span className="text-stone-800 dark:text-stone-200 truncate font-bold" title={ledger.task}>{ledger.task}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "verifications" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title={t("verif_pending_title")}>
            <div className="flex flex-col gap-4">
              {verifications && verifications.filter((v) => v.status === "pending").length > 0 ? (
                verifications
                  .filter((v) => v.status === "pending")
                  .map((v) => {
                    const profile = m => m.id === v.member_id;
                    const matched = members?.find(profile);
                    const name = matched?.user?.full_name || "Unknown Volunteer";

                    return (
                      <div key={v.id} className="p-4 border rounded-xl bg-stone-50/50 dark:bg-slate-900 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{t("lbl_doc_type", { type: v.document_type })}</span>
                          </div>
                          <Badge color="amber">{t("lbl_awaiting_review")}</Badge>
                        </div>

                        <div className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-150 bg-stone-100/50 dark:bg-slate-950 font-mono text-[10px] text-gray-500">
                          <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                          <span className="truncate flex-1 font-bold">{v.document_url || "id_passport_photo.pdf"}</span>
                          <a href={v.document_url || "#"} className="underline text-[var(--org-primary)] font-extrabold hover:text-emerald-700">{t("lbl_open")}</a>
                        </div>

                        <div className="flex gap-2.5 mt-2 justify-end">
                          <Button
                             size="sm"
                             variant="outline"
                             color="red"
                             icon={<XCircle className="h-4 w-4" />}
                             onClick={() => handleReviewVerification(v.id, v.member_id, "rejected")}
                          >
                            {t("btn_reject_proof")}
                          </Button>
                          <Button
                            size="sm"
                            icon={<CheckCircle2 className="h-4 w-4" />}
                            onClick={() => handleReviewVerification(v.id, v.member_id, "approved")}
                          >
                            {t("btn_verify_identity")}
                          </Button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <EmptyState title={t("empty_pending_verifs")} message={t("empty_pending_verifs_msg")} />
              )}
            </div>
          </Card>

          <Card title={t("verif_history_title")}>
            <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto">
              {verifications && verifications.filter((v) => v.status !== "pending").length > 0 ? (
                verifications
                  .filter((v) => v.status !== "pending")
                  .map((v) => {
                    const matched = members?.find((m) => m.id === v.member_id);
                    const name = matched?.user?.full_name || "Unknown Volunteer";

                    return (
                      <div key={v.id} className="flex justify-between items-center py-2.5 border-b text-xs">
                        <div className="flex flex-col gap-0.5 font-semibold">
                          <span className="text-stone-900 dark:text-stone-100">{name}</span>
                          <span className="text-[9px] text-gray-400 font-mono">{t("lbl_reviewed_log", { date: new Date(v.reviewed_at || "").toLocaleDateString() })}</span>
                        </div>
                        <Badge color={v.status === "approved" ? "green" : "red"}>
                          {v.status === "approved" ? t("lbl_badge_stamped") : t("lbl_rejected")}
                        </Badge>
                      </div>
                    );
                  })
              ) : (
                <span className="text-xs text-gray-400 leading-normal block">{t("empty_verif_history")}</span>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "resignations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title={t("resign_pending_title")}>
            <div className="flex flex-col gap-4">
              {resignations && resignations.filter((r) => r.status === "pending").length > 0 ? (
                resignations
                  .filter((r) => r.status === "pending")
                  .map((r) => {
                    const matched = members?.find((m) => m.id === r.member_id);
                    const name = matched?.user?.full_name || "Unknown Volunteer";

                    return (
                      <div key={r.id} className="p-4 border rounded-xl bg-stone-50/50 dark:bg-slate-900 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold font-mono">{t("lbl_exit_date", { date: new Date(r.resignation_date).toLocaleDateString() })}</span>
                          </div>
                          <Badge color="red">{t("lbl_pending_processing")}</Badge>
                        </div>

                        <div className="p-3 bg-red-50/20 dark:bg-red-950/10 border border-red-100/45 text-xs rounded-xl flex flex-col gap-1">
                          <span className="font-extrabold text-red-800">{t("lbl_reason_leaving")}</span>
                          <p className="text-slate-500 italic leading-relaxed font-semibold">"{r.reason}"</p>
                        </div>

                        {r.feedback && (
                          <div className="p-3 bg-stone-100/50 dark:bg-slate-950 border text-xs rounded-xl flex flex-col gap-1">
                            <span className="font-bold text-stone-605">{t("lbl_org_feedback")}</span>
                            <p className="text-gray-500 leading-relaxed font-semibold">"{r.feedback}"</p>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 text-xs font-semibold">
                          <Button size="sm" color="amber" variant="outline" onClick={() => handleStatusChange(r.member_id, "active")}>
                            {t("btn_retain_member")}
                          </Button>
                          <Button size="sm" onClick={() => handleStatusChange(r.member_id, "suspended")}>
                            {t("btn_process_checklist")}
                          </Button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <EmptyState title={t("empty_pending_resigns")} message={t("empty_pending_resigns_msg")} />
              )}
            </div>
          </Card>

          <Card title={t("resign_metrics_title", { count: totalResigns })}>
            <div className="flex flex-col gap-4">
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                {t("resign_metrics_subtitle")}
              </p>

              <div className="flex flex-col gap-3 font-mono text-[10px] text-gray-450 pt-2 border-t w-full">
                <div className="flex justify-between items-center bg-stone-50 dark:bg-slate-950 p-2.5 rounded-xl border">
                  <span>{t("trend_relocation")}</span>
                  <span className="font-extrabold text-stone-800 dark:text-stone-100">{t("trend_count_logs", { percent: relocationPercent, count: relocationCount })}</span>
                </div>
                <div className="flex justify-between items-center bg-stone-50 dark:bg-slate-950 p-2.5 rounded-xl border">
                  <span>{t("trend_mismatch")}</span>
                  <span className="font-extrabold text-stone-800 dark:text-stone-100">{t("trend_count_comments", { percent: mismatchPercent, count: mismatchCount })}</span>
                </div>
                <div className="flex justify-between items-center bg-stone-50 dark:bg-slate-950 p-2.5 rounded-xl border">
                  <span>{t("trend_scheduling")}</span>
                  <span className="font-extrabold text-stone-800 dark:text-stone-100">{t("trend_count_comments", { percent: schedulingPercent, count: schedulingCount })}</span>
                </div>
                <div className="flex justify-between items-center bg-stone-50 dark:bg-slate-950 p-2.5 rounded-xl border">
                  <span>{t("trend_health")}</span>
                  <span className="font-extrabold text-stone-800 dark:text-stone-100">{t("trend_count_metrics", { percent: healthPercent, count: healthCount })}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Invite Member modal */}
      <Modal open={openInviteModal} onClose={() => setOpenInviteModal(false)} title={t("modal_invite_title")}>
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <Input label={t("lbl_full_name")} value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder={t("placeholder_name")} prefixIcon={<Users className="h-4 w-4 text-gray-400" />} />
          <Input label={t("lbl_email_address")} type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder={t("placeholder_email")} prefixIcon={<Mail className="h-4 w-4 text-gray-400" />} />
          
          <div className="flex flex-col gap-1.5 self-start w-full whitespace-nowrap">
            <label className="text-xs font-semibold text-gray-750">{t("lbl_system_role_perm")}</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "org_admin" | "member")}
              className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 px-3 py-2 text-gray-805 dark:text-slate-100 select-none focus:ring-2 focus:ring-[var(--org-primary)] outline-none"
            >
              <option value="member">{t("opt_role_member")}</option>
              <option value="org_admin">{t("opt_role_admin")}</option>
            </select>
          </div>

          <Button type="submit" loading={inviteMutation.isPending} className="w-full mt-4 py-2.5">
            {t("btn_add_member")}
          </Button>
        </form>
      </Modal>

      {/* Log Hours and Task modal */}
      <Modal open={openHourLogModal} onClose={() => setOpenHourLogModal(false)} title={t("modal_log_contribution_title")}>
        <form onSubmit={handleLogHours} className="flex flex-col gap-4">
          {selectedVol && (
            <div className="bg-emerald-500/5 p-3 rounded-lg text-xs leading-relaxed font-semibold mb-2 text-emerald-800">
              ℹ️ {t("vol_hours_log_msg", { name: selectedVol.user?.full_name })}
            </div>
          )}

          <Input
            label={t("lbl_hours_volunteered")}
            type="number"
            min="1"
            value={loggedHours || ""}
            onChange={(e) => setLoggedHours(parseInt(e.target.value) || 0)}
            placeholder={t("placeholder_hours")}
            required
          />

          <Input
            label={t("lbl_task_description")}
            value={loggedTask}
            onChange={(e) => setLoggedTask(e.target.value)}
            placeholder={t("placeholder_task_desc")}
            required
          />

          <Button type="submit" className="w-full mt-4 py-2.5 font-bold uppercase text-xs">
            {t("btn_save_contribution")}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

// ==========================================
// 2. FINANCIAL LEDGER (Admin Route)
// ==========================================
export const LedgerBookkeeping: React.FC = () => {
  const { t } = useLocalTranslation();
  const { activeOrg } = useOrgStore();
  const { addToast } = useToast();
  const { data: ledger, refetch } = useLedgerEntries(activeOrg?.id);
  const entryMutation = useCreateLedgerEntry();
  const { formatAmount } = useCurrencyStore();

  // Real-time synchronization subscription for ledger entries
  useEffect(() => {
    if (!isSupabaseConfigured || !activeOrg?.id) return;

    const channel = supabase
      .channel(`realtime:ledger:${activeOrg.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ledger_entries",
          filter: `org_id=eq.${activeOrg.id}`
        },
        (payload) => {
          console.log("Real-time ledger event received:", payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeOrg?.id, refetch]);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [type, setType] = useState<"income" | "expense">("income");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState("grant");
  const [date, setDate] = useState("");
  const [refNum, setRefNum] = useState("");

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || !date) return;

    try {
      await entryMutation.mutateAsync({
        org_id: activeOrg?.id || "",
        type,
        amount,
        currency: "RWF",
        category,
        description: desc,
        date,
        reference: refNum
      });
      setOpenAddModal(false);
      setDesc("");
      setAmount(0);
      setRefNum("");
      refetch();
      addToast("Entry added successfully", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to add entry", "error");
    }
  };

  // Calculations
  const income = ledger?.filter((l) => l.type === "income").reduce((acc, entry) => acc + entry.amount, 0) || 0;
  const expense = ledger?.filter((l) => l.type === "expense").reduce((acc, entry) => acc + entry.amount, 0) || 0;
  const balance = income - expense;

  const columns = [
    {
      header: t("lbl_date"),
      accessor: "date",
      cell: (row: any) => <span className="font-mono text-xs font-semibold">{row.date}</span>
    },
    {
      header: t("lbl_description"),
      accessor: "description"
    },
    {
      header: t("lbl_category"),
      accessor: "category",
      cell: (row: any) => <Badge color="gray">{row.category.toUpperCase()}</Badge>
    },
    {
      header: t("lbl_reference"),
      accessor: "reference",
      cell: (row: any) => <span className="font-mono text-xs font-semibold text-gray-500">{row.reference || "--"}</span>
    },
    {
      header: t("lbl_amount"),
      accessor: "amount",
      cell: (row: any) => (
        <span className={`font-mono text-xs font-extrabold ${row.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
          {row.type === "income" ? "+" : "-"} {formatAmount(row.amount)}
        </span>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 select-none font-sans w-full animate-in">
      <div className="flex items-center justify-between border-b pb-4 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-gray-901">{t("ledger_title")}</h2>
          <p className="text-xs text-gray-500">{t("ledger_subtitle")}</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpenAddModal(true)}>
          {t("btn_add_entry")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="bg-white dark:bg-slate-800 border p-5 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400">{t("lbl_total_income")}</span>
          <span className="text-2xl font-extrabold font-display block text-emerald-600 mt-2">
            + {formatAmount(income)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 border p-5 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400">{t("lbl_total_expenses")}</span>
          <span className="text-2xl font-extrabold font-display block text-red-600 mt-2">
            - {formatAmount(expense)}
          </span>
        </div>

        <div className="bg-gradient-to-tr from-[var(--org-primary)] to-[var(--org-primary-d)] text-white border p-5 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/70">{t("lbl_balance_sheet")}</span>
          <span className="text-2xl font-extrabold font-display block mt-2">
            {formatAmount(balance)}
          </span>
        </div>
      </div>

      <Table columns={columns} data={ledger || []} emptyMessage={t("empty_transactions")} />

      {/* Add Entry Modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)} title={t("modal_ledger_title")}>
        <form onSubmit={handleAddEntry} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType("income")}
              className={`p-3 border rounded-xl font-bold font-display flex flex-col items-center justify-center transition ${
                type === "income" ? "border-emerald-500 bg-emerald-50/25 text-emerald-700" : "bg-white"
              }`}
            >
              {t("opt_income")}
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`p-3 border rounded-xl font-bold font-display flex flex-col items-center justify-center transition ${
                type === "expense" ? "border-red-500 bg-red-50/25 text-red-700" : "bg-white"
              }`}
            >
              {t("opt_expense")}
            </button>
          </div>

          <Input label={t("lbl_trans_desc")} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("placeholder_tx_desc")} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label={t("lbl_trans_amount")} type="number" value={amount || ""} onChange={(e) => setAmount(parseInt(e.target.value) || 0)} placeholder="15000" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-755">{t("lbl_trans_category")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 px-3 py-2.5 text-gray-805 dark:text-slate-100 select-none outline-none focus:ring-2 focus:ring-[var(--org-primary)]"
              >
                <option value="donation">{t("opt_donation")}</option>
                <option value="grant">{t("opt_grant")}</option>
                <option value="rent">{t("opt_rent")}</option>
                <option value="salary">{t("opt_salary")}</option>
                <option value="equipment">{t("opt_equipment")}</option>
                <option value="transport">{t("opt_transport")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t("lbl_trans_date")} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input label={t("lbl_momo_txid")} value={refNum} onChange={(e) => setRefNum(e.target.value)} placeholder="MOMO-9524021" />
          </div>

          <Button type="submit" loading={entryMutation.isPending} className="w-full mt-4 py-2.5">
            {t("btn_save_transaction")}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

// ==========================================
// 3. DONOR PORTAL - APPROVE MOMO PROOF
// ==========================================
export const DonorsPortal: React.FC = () => {
  const { t } = useLocalTranslation();
  const { activeOrg } = useOrgStore();
  const { addToast } = useToast();
  const { data: donations, refetch } = useDonations(activeOrg?.id);
  const confirmMutation = useConfirmDonation();
  const { formatAmount } = useCurrencyStore();

  const { data: members } = useMembers(activeOrg?.id);
  const createDonationMutation = useCreateDonation();

  // manual states
  const [openAddDonationModal, setOpenAddDonationModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [amountVal, setAmountVal] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"mtn" | "airtel">("mtn");
  const [message, setMessage] = useState("");

  const handleCreateDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedMember = members?.find(m => m.id === selectedMemberId);
    if (!matchedMember || !amountVal) return;

    try {
      await createDonationMutation.mutateAsync({
        org_id: activeOrg?.id || "",
        amount: amountVal,
        donor_name: matchedMember.user?.full_name || "Unknown Member",
        donor_email: matchedMember.user?.email || "",
        payment_method: paymentMethod,
        message: message,
        proof_url: ""
      });
      setOpenAddDonationModal(false);
      setSelectedMemberId("");
      setAmountVal(0);
      setMessage("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  // Real-time synchronization subscription for donations
  useEffect(() => {
    if (!isSupabaseConfigured || !activeOrg?.id) return;

    const channel = supabase
      .channel(`realtime:donations:${activeOrg.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "donations",
          filter: `org_id=eq.${activeOrg.id}`
        },
        (payload) => {
          console.log("Real-time donation event received:", payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeOrg?.id, refetch]);

  const handleApprove = async (id: string) => {
    try {
      await confirmMutation.mutateAsync({
        donationId: id,
        status: "confirmed",
        orgId: activeOrg?.id || ""
      });
      refetch();
      addToast("Donation approved", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to approve donation", "error");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await confirmMutation.mutateAsync({
        donationId: id,
        status: "rejected",
        orgId: activeOrg?.id || ""
      });
      refetch();
      addToast("Donation rejected", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to reject donation", "error");
    }
  };

  const pendingDonations = donations?.filter((d) => d.status === "awaiting_approval") || [];
  const approvedDonations = donations?.filter((d) => d.status === "confirmed") || [];

  return (
    <div className="flex flex-col gap-6 select-none font-sans w-full animate-in">
      <div className="flex items-center justify-between border-b pb-4 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-gray-910">{t("donors_title")}</h2>
          <p className="text-xs text-gray-500">{t("donors_subtitle")}</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpenAddDonationModal(true)}>
          {t("btn_new_donation")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full shrink-0">
        {/* Pending Approval list */}
        <Card title={t("pending_donations_title", { count: pendingDonations.length })}>
          {pendingDonations.length > 0 ? (
            <div className="flex flex-col gap-4">
              {pendingDonations.map((d) => (
                <div key={d.id} className="p-4 bg-slate-50 border rounded-xl flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{d.donor_name}</span>
                      <span className="text-[10px] text-gray-405 font-mono mt-0.5">{d.donor_email}</span>
                    </div>
                    <span className="font-mono text-sm font-extrabold text-[#15803D]">{formatAmount(d.amount)}</span>
                  </div>

                  <div className="p-2.5 bg-yellow-50 text-[11px] text-amber-800 italic leading-relaxed border rounded font-semibold whitespace-pre-wrap">
                    "{d.message || t("lbl_no_message")}"
                  </div>

                  <div className="flex items-center gap-3">
                    <a href={d.proof_url} target="_blank" className="text-xs font-semibold flex items-center gap-1.5 text-blue-600 hover:underline">
                      <Camera className="h-4 w-4" /> {t("lnk_view_slip")}
                    </a>
                  </div>

                  <div className="flex gap-2.5 mt-2">
                    <Button size="sm" onClick={() => handleApprove(d.id)}>
                      {t("btn_approve_proof")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(d.id)}>
                      {t("btn_reject")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={t("empty_pending_donors")} message={t("empty_pending_donors_msg")} />
          )}
        </Card>

        {/* History of approved list */}
        <Card title={t("approved_donations_title")}>
          {approvedDonations.length > 0 ? (
            <div className="divide-y text-xs select-none">
              {approvedDonations.map((d) => (
                <div key={d.id} className="py-3 flex justify-between items-center leading-none">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-955 font-display">{d.donor_name}</span>
                    <span className="text-[10px] text-gray-455 font-mono mt-1">{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-[#15803D]">{formatAmount(d.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={t("empty_approved_donors")} message={t("empty_approved_donors_msg")} />
          )}
        </Card>
      </div>

      {/* Add manually tracked donation modal */}
      <Modal open={openAddDonationModal} onClose={() => setOpenAddDonationModal(false)} title={t("modal_add_donation_title")}>
        <form onSubmit={handleCreateDonationSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-755">{t("lbl_select_donor")}</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 px-3 py-2.5 text-gray-805 dark:text-slate-100 select-none outline-none focus:ring-2 focus:ring-[var(--org-primary)]"
              required
            >
              <option value="">{t("opt_choose_member")}</option>
              {members && members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user?.full_name} ({m.user?.email})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 font-semibold">{t("donor_bylaws_notice")}</p>
          </div>

          <Input
            label={t("lbl_pledged_amount")}
            type="number"
            min="100"
            value={amountVal || ""}
            onChange={(e) => setAmountVal(parseInt(e.target.value) || 0)}
            placeholder="e.g. 5000"
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-755">{t("lbl_carrier_gateway")}</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "mtn" | "airtel")}
              className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 px-3 py-2.5 text-gray-805 dark:text-slate-100 select-none outline-none focus:ring-2 focus:ring-[var(--org-primary)]"
              required
            >
              <option value="mtn">{t("opt_mtn")}</option>
              <option value="airtel">{t("opt_airtel")}</option>
            </select>
          </div>

          <Input
            label={t("lbl_remarks_optional")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("placeholder_remarks")}
          />

          <Button type="submit" loading={createDonationMutation.isPending} className="w-full py-2.5 mt-4 font-bold uppercase text-xs">
            {t("btn_log_donation")}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

// ==========================================
// 4. GRANTS CALENDAR (Admin Route)
// ==========================================
export const GrantsTracker: React.FC = () => {
  const { t } = useLocalTranslation();
  const { activeOrg } = useOrgStore();
  const { data: grants, refetch } = useGrants(activeOrg?.id);
  const createMutation = useCreateGrant();
  const statusMutation = useUpdateGrantStatus();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [funder, setFunder] = useState("");
  const [range, setRange] = useState("");
  const [deadline, setDeadline] = useState("");
  const [link, setLink] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [showAdvancedOpts, setShowAdvancedOpts] = useState(false);

  const handleCreateGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !funder || !range || !deadline) return;

    try {
      await createMutation.mutateAsync({
        org_id: activeOrg?.id || "",
        title,
        funder,
        amount_range: range,
        currency: "USD",
        deadline: new Date(deadline).toISOString(),
        link,
        eligibility,
        status: "tracking"
      });
      setOpenAddModal(false);
      setTitle("");
      setFunder("");
      setRange("");
      setDeadline("");
      setLink("");
      setEligibility("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (id: string, nextStatus: any) => {
    try {
      await statusMutation.mutateAsync({ grantId: id, status: nextStatus, orgId: activeOrg?.id || "" });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans w-full animate-in">
      <div className="flex items-center justify-between border-b pb-4 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-gray-910">{t("grants_title")}</h2>
          <p className="text-xs text-gray-500 font-medium">{t("grants_subtitle")}</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setOpenAddModal(true)}>
          {t("btn_track_grant")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {grants && grants.length > 0 ? (
          grants.map((g) => {
            const daysLeft = Math.ceil((new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            const urgency = daysLeft < 7 ? "red" : daysLeft < 30 ? "amber" : "green";

            return (
              <Card key={g.id} title={g.title} action={
                <Badge color={urgency}>
                  {daysLeft > 0 ? t("lbl_days_left", { days: daysLeft }) : t("lbl_expired")}
                </Badge>
              }>
                <div className="flex flex-col gap-2.5 text-xs text-gray-550 mb-4 leading-normal font-semibold">
                  <span>{t("lbl_funder_agent", { funder: g.funder })}</span>
                  <span>{t("lbl_amount_range", { range: `${g.amount_range} ${g.currency}` })}</span>
                  {g.eligibility && <span>{t("lbl_eligibility_focus", { focus: g.eligibility })}</span>}
                </div>

                <div className="flex items-center justify-between border-t pt-4 leading-none select-none">
                  <span className="text-xs text-gray-400">{t("lbl_current_phase", { phase: g.status.toUpperCase() })}</span>
                  
                  <div className="flex gap-1.5 shrink-0 select-none">
                    {g.status === "tracking" && (
                      <Button size="sm" onClick={() => handleStatusUpdate(g.id, "applied")}>
                        {t("btn_mark_applied")}
                      </Button>
                    )}
                    {g.status === "applied" && (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => handleStatusUpdate(g.id, "successful")}>
                          {t("btn_successful")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(g.id, "unsuccessful")}>
                          {t("btn_unsuccessful")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-2">
            <EmptyState title={t("empty_grants")} message={t("empty_grants_msg")} />
          </div>
        )}
      </div>

      {/* Track Grant Modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)} title={t("modal_track_grant_title")}>
        <form onSubmit={handleCreateGrant} className="flex flex-col gap-4 animate-in duration-100">
          <Input label={t("lbl_proposal_title")} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("placeholder_grant_title")} />
          <Input label={t("lbl_funder_agency")} value={funder} onChange={(e) => setFunder(e.target.value)} placeholder={t("placeholder_funder")} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label={t("lbl_range_pool")} value={range} onChange={(e) => setRange(e.target.value)} placeholder={t("lbl_range_pool")} required />
            <Input label={t("lbl_deadline_date")} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
          </div>

          <div className="flex justify-between items-center text-xs mt-2 border-t pt-3">
             <span className="font-semibold text-gray-600">Additional Options</span>
             <button type="button" onClick={() => setShowAdvancedOpts(!showAdvancedOpts)} className="text-[var(--org-primary)] font-bold hover:underline">
               {showAdvancedOpts ? "Hide Advanced Content" : "Show Advanced Options"}
             </button>
          </div>

          {showAdvancedOpts && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="flex flex-col gap-4 overflow-hidden">
              <Input label={t("lbl_funder_link")} type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder={t("placeholder_funder_link")} />

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-gray-755">{t("lbl_eligibility_focus_label")}</label>
                <textarea
                  className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-301 dark:border-slate-700 p-3.5 min-h-20 focus:ring-2 focus:ring-[var(--org-primary)] outline-none dark:text-slate-100"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder={t("placeholder_eligibility")}
                />
              </div>
            </motion.div>
          )}

          <Button type="submit" className="w-full py-2.5 mt-4">
            {t("btn_begin_tracking")}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

// ==========================================
// 5. ANNUAL AUDIT REPORT COMPILER (Admin, jsPDF)
// ==========================================
export const AnnualReports: React.FC = () => {
  const { t } = useLocalTranslation();
  const { activeOrg } = useOrgStore();
  const { formatAmount } = useCurrencyStore();
  const [downloading, setDownloading] = useState(false);

  const { data: goals } = useGoals(activeOrg?.id);
  const { data: ledger } = useLedgerEntries(activeOrg?.id);
  
  const completedGoals = goals?.filter(g => g.current_progress >= (g.target || 100)).length || 0;
  const balance = ledger?.reduce((acc, curr) => curr.type === "income" ? acc + curr.amount : acc - curr.amount, 0) || 0;
  
  const recentReceipts = [...(ledger || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  const activeGoals = [...(goals || [])].slice(0, 2);

  const handleCompilePDF = async () => {
    const docElement = document.getElementById("report-printable-canvas");
    if (!docElement) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(docElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // mm
      const pageHeight = 295; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Annual_Report_Audit_${activeOrg?.slug}_2026.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans w-full">
      <div className="flex items-center justify-between border-b pb-4 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-gray-910">{t("reports_title")}</h2>
          <p className="text-xs text-gray-500">{t("reports_subtitle")}</p>
        </div>
        <Button loading={downloading} icon={<Printer className="h-4 w-4" />} onClick={handleCompilePDF}>
          {t("btn_compile_pdf")}
        </Button>
      </div>

      <p className="text-[11px] text-gray-400 font-mono text-center">{t("lbl_canvas_preview")}</p>

      {/* A4 Printable container mockup */}
      <div className="bg-gray-105 border p-1 border-gray-200 shadow-lg justify-center max-w-[210mm] mx-auto select-none overflow-hidden rounded-xl bg-white text-gray-805">
        <div id="report-printable-canvas" className="p-12 w-full flex flex-col gap-8 text-xs leading-relaxed max-w-[210mm] mx-auto bg-white font-sans text-stone-900 border" style={{ minHeight: "297mm" }}>
          {/* Branded header block */}
          <div className="flex justify-between items-center border-b pb-6 shrink-0 leading-none">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold font-display uppercase tracking-tight text-emerald-900">{activeOrg?.name || t("lbl_default_header", "Annual Report")}</h1>
              <p className="text-[11px] font-semibold text-gray-500 font-mono">{t("pdf_header_report_type")}</p>
            </div>
            <span className="text-[10px] font-bold py-1 px-2.5 bg-emerald-50 rounded-full text-emerald-700">{t("pdf_year_badge")}</span>
          </div>

          {/* Quick statement */}
          <section className="flex flex-col gap-2 shrink-0 border-b pb-4">
            <span className="text-[10px] font-mono tracking-widest text-[#15803D] uppercase font-bold leading-none">{t("pdf_mission_title")}</span>
            <p className="text-stone-700 leading-relaxed font-semibold">
              {t("pdf_mission_desc", { slug: activeOrg?.slug || "" })}
            </p>
          </section>

          {/* Table Metrics */}
          <div className="grid grid-cols-2 gap-4 shrink-0 border-b pb-6">
            <div className="p-4 bg-slate-50 rounded-lg flex flex-col justify-between">
              <span className="font-bold text-gray-500 font-mono block">{t("pdf_achievements_title")}</span>
              <span className="text-xl font-bold font-display block text-stone-900 mt-2">{completedGoals} Goals Completed</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg flex flex-col justify-between">
              <span className="font-bold text-gray-500 font-mono block">{t("pdf_ledger_title")}</span>
              <span className="text-xl font-bold font-display block text-stone-900 mt-2">{formatAmount(balance)}</span>
            </div>
          </div>

          <section className="flex flex-col gap-8 flex-grow">
            {/* Outline goals */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-800 leading-none">{t("pdf_goals_review")}</span>
              <div className="flex flex-col gap-2 font-semibold text-[11px] text-stone-700">
                {activeGoals.map(g => (
                  <div key={g.id} className="flex justify-between border-b pb-1">
                    <span>{g.title}</span>
                    <span className="font-mono">{Math.round((g.current_progress / (g.target || 100)) * 100)}% Completed</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Ledger summaries */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-800 leading-none">{t("pdf_ledger_receipts")}</span>
              <div className="flex flex-col gap-2 font-semibold font-mono text-[10px] text-stone-600">
                {recentReceipts.map(rec => (
                  <div key={rec.id} className="flex justify-between border-b pb-1 leading-none">
                    <span>{rec.date} • {rec.description}</span>
                    <span className={`font-bold ${rec.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>{rec.type === 'income' ? '+' : '-'} {formatAmount(rec.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer of PDF page */}
          <div className="border-t pt-4 text-center text-[10px] text-stone-400 font-mono shrink-0 select-none">
            {t("pdf_footer")}
          </div>
        </div>
      </div>
    </div>
  );
};
