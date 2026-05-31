import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocalTranslation } from "../locales/additional-translations";
import {
  Sliders,
  CreditCard,
  Ambulance,
  Check,
  Save,
  Send,
  Globe,
  Plus,
  Crown,
  Sparkles,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  BadgeCheck
} from "lucide-react";
import { useOrgStore } from "../store/orgStore";
import { useCurrencyStore } from "../store/currencyStore";
import {
  useUpdateOrganization,
  useSubmitErrorReport,
  usePlatformAdminData,
  useSubmitSubscriptionPayment,
  useErrorReports
} from "../hooks/useImpactoData";
import { useToast } from "../components/Toast";
import { Button, Input, Card, Badge, Modal, Avatar, ImageUploadInput } from "../components/ui";

export const OrganizationSettingsPage: React.FC = () => {
  const { t } = useLocalTranslation();
  const { activeOrg, setActiveOrg } = useOrgStore();
  const { activeCurrency, formatAmount, convertToRWF } = useCurrencyStore();
  const { addToast } = useToast();
  
  const updateMutation = useUpdateOrganization();
  const supportMutation = useSubmitErrorReport();
  const submitPaymentMutation = useSubmitSubscriptionPayment();
  const { data: platformData } = usePlatformAdminData();
  const { data: supportChats, refetch: refetchSupport } = useErrorReports(activeOrg?.id);

  const [activeTab, setActiveTab] = useState<"general" | "public_portal" | "members_dashboard" | "momo" | "subscription" | "support">("general");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const platformSettings = platformData?.settings || {
    usd_to_rwf_rate: 1300,
    mtn_payment_number: "0788100100",
    airtel_payment_number: "0733100100",
    payment_name: "VIRELLIX INC"
  };

  // General Settings Form
  const [name, setName] = useState(activeOrg?.name || "");
  const [tagline, setTagline] = useState(activeOrg?.tagline || "");
  const [desc, setDesc] = useState(activeOrg?.description || "");
  const [mission, setMission] = useState(activeOrg?.mission || "");
  const [vision, setVision] = useState(activeOrg?.vision || "");
  const [pColor, setPColor] = useState(activeOrg?.primary_color || "#15803D");

  // Public Portal Settings Form
  const [slug, setSlug] = useState(activeOrg?.slug || "");
  const [locationName, setLocationName] = useState(activeOrg?.location_name || "Kigali, Rwanda");
  const [contactUs, setContactUs] = useState(activeOrg?.contact_us || "contact@ourngo.org / +250 788 123 456");
  const [logoUrl, setLogoUrl] = useState(activeOrg?.logo_url || "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=150");
  const [coverUrl, setCoverUrl] = useState(activeOrg?.cover_url || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000");
  const [galleryInput, setGalleryInput] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(activeOrg?.gallery_urls || [
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300",
    "https://images.unsplash.com/photo-1541604193435-22419446656f?w=300"
  ]);
  const [isPublicDir, setIsPublicDir] = useState(activeOrg?.is_public_directory ?? true);
  const [allowPublicJoining, setAllowPublicJoining] = useState(activeOrg?.allow_public_joining ?? true);
  const [publicPageEnabled, setPublicPageEnabled] = useState(activeOrg?.public_page_enabled ?? true);
  const [showGoalsPublicly, setShowGoalsPublicly] = useState(activeOrg?.show_goals_publicly ?? true);
  const [showImpactPublicly, setShowImpactPublicly] = useState(activeOrg?.show_impact_publicly ?? true);

  // Members Dashboard Style Form
  const [dashboardTheme, setDashboardTheme] = useState<"light" | "dark" | "custom">(activeOrg?.dashboard_theme || "light");
  const [dashboardLogo, setDashboardLogo] = useState(activeOrg?.dashboard_logo || "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=150");

  // MoMo merchant details form
  const [mName, setMName] = useState(activeOrg?.donation_account_name || "");
  const [mtnNum, setMtnNum] = useState(activeOrg?.donation_mtn_number || "");
  const [airtelNum, setAirtelNum] = useState(activeOrg?.donation_airtel_number || "");
  const [enableDonations, setEnableDonations] = useState(activeOrg?.donations_enabled || false);

  // Manual Subscription payment modal form
  const [openSubModal, setOpenSubModal] = useState(false);
  const [subPlan, setSubPlan] = useState("Growth Plan - $25/month");
  const [payerPhone, setPayerPhone] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [momoSmsProof, setMomoSmsProof] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Support Request / Chat line Form
  const [supportMessage, setSupportMessage] = useState("");

  useEffect(() => {
    if (activeOrg) {
      setName(activeOrg.name || "");
      setTagline(activeOrg.tagline || "");
      setDesc(activeOrg.description || "");
      setMission(activeOrg.mission || "");
      setVision(activeOrg.vision || "");
      setPColor(activeOrg.primary_color || "#15803D");
      setSlug(activeOrg.slug || "");
      setLocationName(activeOrg.location_name || "Kigali, Rwanda");
      setContactUs(activeOrg.contact_us || "contact@ourngo.org / +250 788 123 456");
      setLogoUrl(activeOrg.logo_url || "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=150");
      setCoverUrl(activeOrg.cover_url || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000");
      if (activeOrg.gallery_urls && activeOrg.gallery_urls.length > 0) {
        setGalleryUrls(activeOrg.gallery_urls);
      }
      setIsPublicDir(activeOrg.is_public_directory ?? true);
      setAllowPublicJoining(activeOrg.allow_public_joining ?? true);
      setPublicPageEnabled(activeOrg.public_page_enabled ?? true);
      setShowGoalsPublicly(activeOrg.show_goals_publicly ?? true);
      setShowImpactPublicly(activeOrg.show_impact_publicly ?? true);
      setDashboardTheme(activeOrg.dashboard_theme || "light");
      setDashboardLogo(activeOrg.dashboard_logo || "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=150");
      setMName(activeOrg.donation_account_name || "");
      setMtnNum(activeOrg.donation_mtn_number || "");
      setAirtelNum(activeOrg.donation_airtel_number || "");
      setEnableDonations(activeOrg.donations_enabled || false);
    }
  }, [activeOrg]);

  const colors = [
    { name: "Forest", hex: "#15803D" },
    { name: "Ocean", hex: "#1D4ED8" },
    { name: "Crimson", hex: "#B91C1C" },
    { name: "Indigo", hex: "#4338CA" },
    { name: "Teal", hex: "#0F766E" },
    { name: "Coffee", hex: "#78350F" }
  ];

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tagline) return;

    try {
      const updated = await updateMutation.mutateAsync({
        id: activeOrg?.id || "",
        name,
        tagline,
        description: desc,
        mission,
        vision,
        primary_color: pColor,
        donations_enabled: enableDonations,
        donation_account_name: mName,
        donation_mtn_number: mtnNum,
        donation_airtel_number: airtelNum
      });
      setActiveOrg(updated, useOrgStore.getState().activeMember);
      addToast("NGO Workspace generic branding variables saved successfully!", "success");
    } catch (err: any) {
      console.error(err);
      addToast(err?.message || "Failed to save general workspace variables.", "error");
    }
  };

  const handleSavePublicSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateMutation.mutateAsync({
        id: activeOrg?.id || "",
        slug,
        location_name: locationName,
        contact_us: contactUs,
        logo_url: logoUrl,
        cover_url: coverUrl,
        gallery_urls: galleryUrls,
        is_public_directory: isPublicDir,
        allow_public_joining: allowPublicJoining,
        public_page_enabled: publicPageEnabled,
        show_goals_publicly: showGoalsPublicly,
        show_impact_publicly: showImpactPublicly
      });
      setActiveOrg(updated, useOrgStore.getState().activeMember);
      addToast("NGO profile page configuration successfully synced live!", "success");
    } catch (err: any) {
      console.error(err);
      addToast(err?.message || "Failed to save public portal profile details.", "error");
    }
  };

  const handleSaveDashboardTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateMutation.mutateAsync({
        id: activeOrg?.id || "",
        dashboard_theme: dashboardTheme,
        dashboard_logo: dashboardLogo
      });
      setActiveOrg(updated, useOrgStore.getState().activeMember);
      addToast("Members' Internal Dashboard branding synced successfully!", "success");
    } catch (err: any) {
      console.error(err);
      addToast(err?.message || "Failed to update dashboard theme settings.", "error");
    }
  };

  const handleSaveMomo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enableDonations) {
      if (!/^07\d{8}$/.test(mtnNum)) {
        addToast("Error: MTN Merchant number must be exactly 10 digits and start with 07 (e.g. 07xxxxxxxx)", "error");
        return;
      }
      if (!/^07\d{8}$/.test(airtelNum)) {
        addToast("Error: Airtel Merchant number must be exactly 10 digits and start with 07 (e.g. 07xxxxxxxx)", "error");
        return;
      }
    }
    try {
      const updated = await updateMutation.mutateAsync({
        id: activeOrg?.id || "",
        donations_enabled: enableDonations,
        donation_account_name: mName,
        donation_mtn_number: mtnNum,
        donation_airtel_number: airtelNum
      });
      setActiveOrg(updated, useOrgStore.getState().activeMember);
      addToast("Rwandan Mobile Money merchant details synced successfully!", "success");
    } catch (err: any) {
      console.error(err);
      addToast(err?.message || "Failed to update MoMo merchant details.", "error");
    }
  };

  const handlePaySubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerPhone || !paymentRef || !momoSmsProof) {
      addToast("Please provide all manual payment evidence details to alert Superadmin.", "error");
      return;
    }

    if (!/^07\d{8}$/.test(payerPhone)) {
      addToast("Error: Payer phone number must be exactly 10 digits and start with 07 (e.g. 07xxxxxxxx)", "error");
      return;
    }

    setSubmittingPayment(true);
    try {
      const rate = platformSettings.usd_to_rwf_rate || 1350;
      let costUsd = 25;
      if (subPlan.includes("Starter")) costUsd = 10;
      if (subPlan.includes("Enterprise")) costUsd = 50;

      await submitPaymentMutation.mutateAsync({
        org_id: activeOrg?.id || "",
        plan: subPlan,
        amount_usd: costUsd,
        amount_local: costUsd * rate,
        method: payerPhone.startsWith("078") || payerPhone.startsWith("079") ? "mtn" : "airtel",
        phone: payerPhone,
        reference: paymentRef,
        proof_url: momoSmsProof // use SMS field to store the raw payment verification detail
      });

      addToast(`Manual payment proof logged! Superadmin notified to verify and unlock licenses.`, "success");
      setOpenSubModal(false);
      setPayerPhone("");
      setPaymentRef("");
      setMomoSmsProof("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleSubmitEscalationChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    try {
      await supportMutation.mutateAsync({
        org_id: activeOrg?.id || "",
        title: "Support Ticket Message",
        description: supportMessage,
        priority: "normal",
        screenshot_url: "Support Chat"
      });
      setSupportMessage("");
      refetchSupport();
      addToast("Direct support message transmitted to Gaby Prince Superadmin!", "success");
    } catch (err) {
      console.error(err);
    }
  };

  // Math days setup
  const joinedDays = Math.max(0, Math.ceil((new Date().getTime() - new Date(activeOrg?.created_at || "").getTime()) / (1000 * 60 * 60 * 24)));
  const daysLeft = activeOrg?.subscription_status === "expired" ? 0 : Math.max(0, Math.ceil((new Date(activeOrg?.subscription_ends_at || "").getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="flex flex-col gap-6 select-none font-sans w-full animate-in">
      <div className="border-b pb-4 shrink-0">
        <h2 className="text-xl md:text-2xl font-bold font-display text-gray-901">{t("settings_title", "NGO Settings Management")}</h2>
        <p className="text-xs text-gray-500 font-medium">{t("settings_subtitle", "Coordinate custom primary color palettes, public profile pages, members' layouts, and manual subscription billing gateways.")}</p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-150 text-xs text-emerald-800 font-semibold rounded-lg flex items-center gap-2 animate-bounce">
          <Check className="h-4.5 w-4.5" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-150 text-xs text-rose-800 font-semibold rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
          {errorMsg}
        </div>
      )}

      {/* Settings Tab Headers */}
      <div className="flex gap-4 border-b pb-1 overflow-x-auto scrollbar-none font-display mb-2 select-none shrink-0">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "general"
              ? "border-[var(--org-primary)] text-[var(--org-primary)]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Sliders className="h-4 w-4" /> {t("set_tab_general")}
        </button>

        <button
          onClick={() => setActiveTab("public_portal")}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "public_portal"
              ? "border-[var(--org-primary)] text-[var(--org-primary)]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Globe className="h-4 w-4" /> {t("set_tab_public")}
        </button>

        <button
          onClick={() => setActiveTab("members_dashboard")}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "members_dashboard"
              ? "border-[var(--org-primary)] text-[var(--org-primary)]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <BadgeCheck className="h-4 w-4" /> {t("set_tab_members")}
        </button>

        <button
          onClick={() => setActiveTab("momo")}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "momo"
              ? "border-[var(--org-primary)] text-[var(--org-primary)]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <CreditCard className="h-4 w-4" /> {t("set_tab_momo")}
        </button>

        <button
          onClick={() => setActiveTab("subscription")}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "subscription"
              ? "border-[var(--org-primary)] text-[var(--org-primary)]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Crown className="h-4 w-4" /> {t("set_tab_subscription")}
        </button>

        <button
          onClick={() => setActiveTab("support")}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "support"
              ? "border-[var(--org-primary)] text-[var(--org-primary)]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Ambulance className="h-4 w-4" /> {t("set_tab_support")}
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="w-full">
        {/* General workspace properties */}
        {activeTab === "general" && (
          <Card title={t("settings_branding_title")}>
            <form onSubmit={handleSaveGeneral} className="flex flex-col gap-6 text-xs md:text-sm font-medium">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t("lbl_title_name")} value={name} onChange={(e) => setName(e.target.value)} />
                <Input label={t("lbl_tagline")} value={tagline} onChange={(e) => setTagline(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-gray-750">{t("lbl_focus_desc")}</label>
                <textarea
                  className="w-full text-sm rounded-lg border bg-white border-gray-300 p-3 min-h-20 focus:ring-2 focus:ring-[var(--org-primary)] focus:outline-none"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-gray-750">{t("lbl_mission_statement")}</label>
                  <textarea
                    className="w-full text-sm rounded-lg border bg-white border-gray-300 p-3 min-h-20 focus:ring-2 focus:ring-[var(--org-primary)] focus:outline-none"
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-gray-750">{t("lbl_vision_blueprint")}</label>
                  <textarea
                    className="w-full text-sm rounded-lg border bg-white border-gray-300 p-3 min-h-20 focus:ring-2 focus:ring-[var(--org-primary)] focus:outline-none"
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                  />
                </div>
              </div>

              {/* Primary color presets */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-semibold text-gray-755">{t("lbl_theme_brand")}</label>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {colors.map((col) => (
                    <button
                      type="button"
                      key={col.hex}
                      onClick={() => setPColor(col.hex)}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold font-display cursor-pointer transition flex items-center gap-2 ${
                        pColor === col.hex
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                          : "border-gray-205 shadow-xs text-gray-700 bg-white"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full block border shadow-xs shrink-0" style={{ backgroundColor: col.hex }} />
                      {col.name}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" loading={updateMutation.isPending} icon={<Save className="h-4.5 w-4.5" />} className="self-end px-7 mt-4 py-2.5">
                {t("btn_save_branding")}
              </Button>
            </form>
          </Card>
        )}

        {/* Public profile page tab */}
        {activeTab === "public_portal" && (
          <Card title={t("settings_public_title")}>
            <form onSubmit={handleSavePublicSettings} className="flex flex-col gap-6 text-xs md:text-sm font-medium">
              <p className="text-gray-550 font-normal leading-normal mb-1">
                {t("Configure content displayed externally to donors and search crawlers on the public web directory.")}
              </p>

              {/* Public Page Live Link Preview */}
              <div className="p-4 bg-[var(--org-primary-l)] border border-[var(--org-primary)]/20 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[var(--org-primary)] shrink-0 shadow-xs border">
                    <Globe className="h-5 w-5 animate-spin-slow" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{t("Your Public NGO Profile is Live")}</span>
                    <span className="text-[11px] text-gray-400 font-mono mt-0.5">/@{slug || activeOrg?.slug}</span>
                  </div>
                </div>
                <Link
                  to={`/@${slug || activeOrg?.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[var(--org-primary)] text-white hover:opacity-90 font-bold text-xs rounded-xl flex items-center gap-1.5 self-start w-fit shadow-xs transition"
                >
                  <Globe className="h-4 w-4" /> {t("View Public Page")}
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t("lbl_public_slug")} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. green-kigali" />
                <Input label={t("NGO Location Name")} value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="e.g. Nyarugenge Hill, Sector 4" />
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800 dark:text-slate-200">Enable Public Portal Page</span>
                  <span className="text-xs text-gray-500">Allow anyone on the internet to view your public profile at impacto.rw/@slug.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={publicPageEnabled} onChange={(e) => setPublicPageEnabled(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--org-primary)]"></div>
                </label>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800 dark:text-slate-200">Show Goals Publicly</span>
                  <span className="text-xs text-gray-500">Expose your active civic and environmental progress goals to community stakeholders.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={showGoalsPublicly} onChange={(e) => setShowGoalsPublicly(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--org-primary)]"></div>
                </label>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800 dark:text-slate-200">Show Impact Metrics Publicly</span>
                  <span className="text-xs text-gray-500">Expose physical activity log registries and verified impact metrics metrics transparently.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={showImpactPublicly} onChange={(e) => setShowImpactPublicly(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--org-primary)]"></div>
                </label>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800 dark:text-slate-200">Public Visibility on Discovery Feed</span>
                  <span className="text-xs text-gray-500">Allow your organization to be listed on the main Impacto discovery landing page.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isPublicDir} onChange={(e) => setIsPublicDir(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--org-primary)]"></div>
                </label>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{t("Allow Member Registration Requests")}</span>
                  <span className="text-xs text-gray-500">{t("Display a registration request button on your public organization homepage.")}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={allowPublicJoining} onChange={(e) => setAllowPublicJoining(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--org-primary)]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Banner Cover Customization */}
                <ImageUploadInput
                  label={t("NGO Banner Cover Picture")}
                  value={coverUrl}
                  onChange={setCoverUrl}
                  placeholder="Paste image link or upload"
                />

                {/* Brand Logo Customization */}
                <ImageUploadInput
                  label={t("NGO Brand Logo Image")}
                  value={logoUrl}
                  onChange={setLogoUrl}
                  placeholder="Paste image link or upload"
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-gray-750">{t("Contact Us Details / Location coordinates")}</label>
                <textarea
                  className="w-full text-sm rounded-lg border bg-white border-gray-300 p-3 h-20 focus:ring-2 focus:ring-[var(--org-primary)] focus:outline-none"
                  value={contactUs}
                  onChange={(e) => setContactUs(e.target.value)}
                  placeholder="e.g. Email: info@organization.org | Tel: +250 788 000 000 | Location: Kigali"
                />
              </div>

              {/* Gallery List Preview */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-gray-755">{t("lbl_gallery_photos")}</label>
                <div className="flex gap-4 items-end">
                   <div className="flex-1">
                     <ImageUploadInput 
                       value={galleryInput}
                       onChange={setGalleryInput}
                       placeholder="Paste image link or upload file..."
                     />
                   </div>
                   <Button type="button" onClick={() => {
                     if (galleryInput.trim()) {
                        setGalleryUrls([...galleryUrls, galleryInput]);
                        setGalleryInput("");
                     }
                   }}>
                     {t("btn_add_to_gallery")}
                   </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 border-t pt-4">
                  {galleryUrls.map((g, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border">
                      <img src={g} referrerPolicy="no-referrer" alt="gallery" className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                      >
                        {t("Remove Image")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" loading={updateMutation.isPending} icon={<Save className="h-4.5 w-4.5" />} className="self-end px-7 mt-4 py-2.5">
                {t("btn_save_public_settings")}
              </Button>
            </form>
          </Card>
        )}

        {/* Member panel workspace changes */}
        {activeTab === "members_dashboard" && (
          <Card title={t("settings_members_title")}>
            <form onSubmit={handleSaveDashboardTheme} className="flex flex-col gap-6 text-xs md:text-sm font-medium">
              <p className="text-gray-550 font-normal leading-normal">
                {t("Brand the layout used internally by employees, volunteers, and admin staff inside the authenticated login console.")}
              </p>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold">{t("Select Member Theme Vibe Preference")}</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setDashboardTheme("light")}
                    className={`p-4 border rounded-xl text-center cursor-pointer flex flex-col items-center gap-1.5 ${
                      dashboardTheme === "light" ? "border-emerald-600 bg-emerald-50/20" : "bg-white"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full bg-slate-100 block border border-slate-400" />
                    <span className="font-bold text-xs">{t("Standard Light Theme")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDashboardTheme("dark")}
                    className={`p-4 border rounded-xl text-center cursor-pointer flex flex-col items-center gap-1.5 ${
                      dashboardTheme === "dark" ? "border-emerald-600 bg-emerald-50/20" : "bg-white"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full bg-slate-900 block border border-slate-905" />
                    <span className="font-bold text-xs">{t("Aesthetic Dark Theme")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDashboardTheme("custom")}
                    className={`p-4 border rounded-xl text-center cursor-pointer flex flex-col items-center gap-1.5 ${
                      dashboardTheme === "custom" ? "border-emerald-600 bg-emerald-50/20" : "bg-white"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full bg-gradient-to-r from-teal-500 to-amber-500 block border" />
                    <span className="font-bold text-xs">{t("Primary NGO Branding")}</span>
                  </button>
                </div>
              </div>

              <ImageUploadInput 
                label={t("NGO Workspace Panel Brand Logo URL")} 
                value={dashboardLogo} 
                onChange={setDashboardLogo} 
              />

              <div className="p-4 bg-slate-50 border rounded-xl flex gap-3.5 items-center">
                <Avatar name={activeOrg?.name || "Suite"} size="sm" />
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-extrabold text-stone-900">{activeOrg?.name} {t("Dashboard Setup Saved")}</span>
                  <span className="text-[10px] text-gray-400 mt-1 font-mono">
                    {t("Theme setting:")} {dashboardTheme.toUpperCase()} • {t("Logo:")} {dashboardLogo.substring(0, 40)}...
                  </span>
                </div>
              </div>

              <Button type="submit" loading={updateMutation.isPending} icon={<Save className="h-4.5 w-4.5" />} className="self-end px-7 mt-2 py-2.5">
                {t("btn_save_members_settings")}
              </Button>
            </form>
          </Card>
        )}

        {/* Momo credentials setup */}
        {activeTab === "momo" && (
          <Card title={t("settings_momo_title")}>
            <form onSubmit={handleSaveMomo} className="flex flex-col gap-6 text-xs md:text-sm font-medium">
              <div className="flex items-center gap-3 select-none py-1 border-b">
                <input
                  type="checkbox"
                  id="momo_active_tick"
                  checked={enableDonations}
                  onChange={(e) => setEnableDonations(e.target.checked)}
                  className="h-4.5 w-4.5 text-[var(--org-primary)] focus:ring-[var(--org-primary)] rounded border-gray-300 cursor-pointer"
                />
                <label htmlFor="momo_active_tick" className="text-xs font-extrabold leading-none cursor-pointer text-stone-850">
                  {t("Enable and Unlock public MoMo/Airtel donation forms")}
                </label>
              </div>

              {enableDonations && (
                <div className="flex flex-col gap-4 animate-in duration-100">
                  <Input label={t("Authorized Merchant Account Name")} value={mName} onChange={(e) => setMName(e.target.value)} placeholder="e.g. GREENING KIGALI LTD" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label={t("lbl_billing_momo_number")} value={mtnNum} onChange={(e) => setMtnNum(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="e.g. 078XXXXXXX" />
                    <Input label={t("lbl_airtel_merchant_number")} value={airtelNum} onChange={(e) => setAirtelNum(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="e.g. 073XXXXXXX" />
                  </div>
                </div>
              )}

              <Button type="submit" loading={updateMutation.isPending} icon={<Save className="h-4.5 w-4.5" />} className="self-end px-6.5 mt-4 py-2.5">
                {t("btn_save_momo_accounts")}
              </Button>
            </form>
          </Card>
        )}        {/* Subscription pricing structures */}
        {activeTab === "subscription" && (
          <div className="flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4 leading-none select-none">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono font-bold">{t("lbl_trial_starter")}</span>
                    <Badge color="blue">{t("Best Entry")}</Badge>
                  </div>
                  <h3 className="text-2xl font-extrabold font-display leading-none">$10 <span className="text-xs font-normal text-gray-400">/ {t("month")} ({formatAmount(convertToRWF(10, "USD"))})</span></h3>
                  <ul className="text-xs font-semibold text-stone-600 space-y-2 mt-6 leading-relaxed">
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{t("Manage up to 25 active members")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{t("1 Secure Private Chat channel")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{t("Basic community event calendar")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{t("English, French, & Kinyarwanda support")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-stone-400">•</span>
                      <span className="text-gray-400 line-through">{t("Offline auto queue sync")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-stone-400">•</span>
                      <span className="text-gray-400 line-through">{t("Member ID Doc Verification")}</span>
                    </li>
                  </ul>
                </div>
                {activeOrg?.subscription_status !== "active" && (
                  <Button variant="outline" className="w-full mt-6" onClick={() => { setSubPlan("Starter Plan - $10/month"); setOpenSubModal(true); }}>
                    {t("Choose Starter")}
                  </Button>
                )}
              </div>

              <div className="bg-emerald-50/20 border-2 border-emerald-500 rounded-2xl p-5 shadow-xs flex flex-col justify-between relative">
                <span className="absolute -top-3.5 right-4 bg-emerald-600 text-[10px] px-2.5 py-1 text-white font-extrabold rounded-full font-mono">{t("RECOMMENDED")}</span>
                <div>
                  <div className="flex justify-between items-center mb-4 leading-none select-none">
                    <span className="text-[10px] uppercase tracking-widest text-emerald-800 font-mono font-bold">{t("Growth Plan")}</span>
                    <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold font-display leading-none text-emerald-950">$25 <span className="text-xs font-normal text-stone-500">/ {t("month")} ({formatAmount(convertToRWF(25, "USD"))})</span></h3>
                  <p className="text-[11px] text-emerald-800 font-bold mt-2 font-mono">{t("Everything in Starter, plus:")}</p>
                  <ul className="text-xs font-semibold text-stone-700 space-y-2 mt-3 leading-relaxed">
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{t("Unlimited members and volunteers")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{t("Rich Media Chat: Voice notes, files (50MB), images")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{t("Unlimited channels & direct group chats")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{t("In-Chat Live Polls (informal vote decisions)")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{t("Event RSVPs & waitlisting systems")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{t("Advanced financial accounting ledger sheets")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{t("Bento-grid strategic goal analytics")}</span>
                    </li>
                  </ul>
                </div>
                <Button className="w-full mt-6 bg-emerald-650 hover:bg-emerald-700" onClick={() => { setSubPlan("Growth Plan - $25/month"); setOpenSubModal(true); }}>
                  {t("Choose Growth Option")}
                </Button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between text-white">
                <div>
                  <div className="flex justify-between items-center mb-4 leading-none select-none">
                    <span className="text-[10px] uppercase tracking-widest text-[var(--org-primary)] font-mono font-bold">{t("lbl_unlimited_pro")}</span>
                    <Crown className="h-4.5 w-4.5 text-yellow-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold font-display leading-none text-white">$50 <span className="text-xs font-normal text-slate-400">/ {t("month")} ({formatAmount(convertToRWF(50, "USD"))})</span></h3>
                  <p className="text-[11px] text-[var(--org-primary)] font-bold mt-2 font-mono">{t("Ultimate V2 Modules, plus:")}</p>
                  <ul className="text-xs font-semibold text-slate-200 space-y-2 mt-3 leading-relaxed">
                    <li className="flex items-start gap-1">
                      <span className="text-[var(--org-primary)] font-bold">✓</span>
                      <span>{t("PWA Offline Mode & Sync Queue (for sector field work)")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[var(--org-primary)] font-bold">✓</span>
                      <span>{t("Member Identity Verification Verification Hub")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[var(--org-primary)] font-bold">✓</span>
                      <span>{t("Granular Roles & Manager Rights Checkbox")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[var(--org-primary)] font-bold">✓</span>
                      <span>{t("Governance Quorum Meetings Validation")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[var(--org-primary)] font-bold">✓</span>
                      <span>{t("Dynamic Variable Message Templates Creator")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[var(--org-primary)] font-bold">✓</span>
                      <span>{t("Secure Document Signing & Version Acknowledgement")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[var(--org-primary)] font-bold">✓</span>
                      <span>{t("Full Audit Trail Historical Logs Tracker")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[var(--org-primary)] font-bold">✓</span>
                      <span>{t("3-Step Resignations & Exit offboarding surveys")}</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[var(--org-primary)] font-bold">✓</span>
                      <span>{t("24/7 priority line to Superadmin Gaby")}</span>
                    </li>
                  </ul>
                </div>
                {activeOrg?.subscription_status !== "active" && (
                  <Button variant="outline" className="w-full mt-6 text-stone-900 bg-white hover:bg-gray-100" onClick={() => { setSubPlan("Enterprise Monolith - $50/month"); setOpenSubModal(true); }}>
                    {t("Choose Enterprise")}
                  </Button>
                )}
              </div>
            </div>

            <Card title={t("settings_sub_title")}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 mt-1 select-none font-medium text-xs md:text-sm">
                <div className="p-4 border rounded-xl flex flex-col gap-1.5 bg-gray-50">
                  <span className="text-[10px] uppercase text-gray-400 font-mono tracking-wider font-bold">Tenant History</span>
                  <span className="text-stone-900 font-bold flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-stone-550" />
                    {t("Joined system:")} {new Date(activeOrg?.created_at || "").toLocaleDateString()}
                  </span>
                  <p className="text-[11px] text-gray-450 mt-1 font-semibold">{t("Active in the system:")} <span className="text-stone-900 font-bold">{joinedDays} {t("days")}</span> ({t("counted starting from when you first registered!")})</p>
                </div>

                <div className="p-4 border rounded-xl flex flex-col gap-1.5 bg-gray-50">
                  <span className="text-[10px] uppercase text-gray-400 font-mono tracking-wider font-bold">Activation Status</span>
                  <div className="flex items-center gap-2">
                    <Badge color={activeOrg?.subscription_status === "active" ? "green" : activeOrg?.subscription_status === "expired" ? "red" : "amber"}>
                      {activeOrg?.subscription_status?.toUpperCase() || "TRIAL"}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-gray-450 font-semibold">{t("All administrative components are fully unlocked.")}</span>
                </div>

                <div className="p-4 border rounded-xl flex flex-col gap-1.5 bg-gray-50">
                  <span className="text-[10px] uppercase text-gray-400 font-mono tracking-wider font-bold">Duration Remaining</span>
                  <span className="text-stone-950 font-extrabold flex items-center gap-1.5 text-base font-display">
                    <Clock className="h-5 w-5 text-gray-500 shrink-0" />
                    {daysLeft} {t("Days Remaining")}
                  </span>
                  <p className="text-[11px] text-gray-455 mt-1">{t("Renewal occurs every 30 days based on manual validation of invoice receipt logs.")}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4 select-none shrink-0">
                <Button onClick={() => setOpenSubModal(true)}>
                  {t("settings_sub_title")}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Support Chat dialog back and forth */}
        {activeTab === "support" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full font-medium">
            <div className="lg:col-span-2 flex flex-col h-[65vh] border rounded-2xl bg-white overflow-hidden shadow-xs">
              <div className="px-5 py-4.5 bg-gray-50 border-b flex justify-between items-center leading-none">
                <span className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                  <MessageSquare className="h-4.5 w-4.5 text-[var(--org-primary)]" /> {t("Support Conversation Log with Superadmin Gaby")}
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse block" /> {t("Live Direct Connection")}
                </span>
              </div>

              {/* Chat threads */}
              <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
                {supportChats && supportChats.length > 0 ? (
                  supportChats.map((c) => (
                    <div key={c.id} className="flex flex-col gap-3.5 border-b pb-4">
                      {/* Org Sent Message */}
                      <div className="flex gap-3 max-w-[85%] self-start">
                        <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold shrink-0">
                          {activeOrg?.name.charAt(0)}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-stone-500 font-bold">{activeOrg?.name} {t("Admin")}</span>
                          <div className="p-3 bg-gray-100 rounded-xl text-xs text-stone-850 leading-relaxed font-bold">
                            {c.description}
                          </div>
                          <span className="text-[9px] text-gray-450 font-mono">{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Superadmin Response */}
                      {c.admin_notes && (
                        <div className="flex gap-3 max-w-[85%] self-end flex-row-reverse">
                          <div className="h-8 w-8 rounded-full bg-slate-900 text-yellow-500 flex items-center justify-center text-xs font-bold shrink-0">
                            SA
                          </div>
                          <div className="flex flex-col gap-1.5 text-right">
                            <span className="text-[10px] text-stone-550 font-bold flex items-center justify-end gap-1">
                              {t("Superadmin Gaby Prince")} <Sparkles className="h-3 w-3 text-amber-500" />
                            </span>
                            <div className="p-3 bg-slate-900 text-white rounded-xl text-xs leading-relaxed text-left font-semibold">
                              {c.admin_notes}
                            </div>
                            <span className="text-[9px] text-gray-440 font-mono">{t("Verified Reply")}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 flex flex-col items-center justify-center gap-2">
                    <MessageSquare className="h-10 w-10 text-gray-300" />
                    <p className="text-xs text-gray-500 font-bold">{t("No previous direct line chats recorded with Superadmins.")}</p>
                    <p className="text-[11px] text-gray-455">{t("Type your first direct message below to talk as well or report an error.")}</p>
                  </div>
                )}
              </div>

              {/* Chat send input */}
              <form onSubmit={handleSubmitEscalationChat} className="p-4 border-t bg-gray-50 flex items-center gap-3">
                <div className="flex-1">
                  <Input value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder={t("Type a message to Superadmin Gaby to report a bug or just talk...")} />
                </div>
                <Button type="submit" loading={supportMutation.isPending}>
                  <Send className="h-4.5 w-4.5" />
                </Button>
              </form>
            </div>

            <div className="flex flex-col gap-6">
              <Card title={t("Direct Support Hotline")}>
                <div className="flex flex-col gap-4 text-xs font-semibold text-gray-700 leading-relaxed">
                  <p>
                    {t("Your dedicated subscription gives you direct communication with developers and system architects.")}
                  </p>
                  <p className="p-3 bg-amber-50 rounded-xl border border-amber-250 flex gap-2 text-amber-900 font-bold">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0" /> {t("Response times generally range under 2 hours during GMT+2 business windows.")}
                  </p>

                  <div className="border-t pt-4 flex flex-col gap-2 font-mono text-[11px] text-stone-500">
                    <span>{t("lbl_host_domain", "Host Domain:")} <span className="text-stone-900">impacto-saas.rw</span></span>
                    <span>{t("lbl_direct_admin", "Direct Admin:")} <span className="text-stone-900">Gaby Prince</span></span>
                    <span>{t("lbl_dedicated_instance", "Dedicated Instance:")} <span className="text-stone-910">{t("lbl_kigali_region", "AWS Kigali region")}</span></span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Manual Subscription payment modal details */}
      <Modal open={openSubModal} onClose={() => setOpenSubModal(false)} title={t("lbl_license_sub_gateway", "License Subscription Gateway")}>
        <form onSubmit={handlePaySubscription} className="flex flex-col gap-4 text-xs font-semibold text-stone-704">
          <p className="text-stone-550 font-normal leading-normal">
            {t("lbl_momo_transfer_info", "As a Rwandese localized portal, payments resolve manually via MTN MoMo / Airtel Money. Please transfer correct funds, then complete raw SMS confirmation logs below.")}
          </p>

          <div className="p-4 bg-emerald-50 rounded-2xl border flex flex-col gap-2 font-display text-emerald-950">
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-800 leading-none">{t("lbl_selected_license_tier", "Selected License Tier")}</span>
            <div className="flex justify-between items-center select-none font-bold">
              <span>{subPlan}</span>
              <span className="text-base font-extrabold text-emerald-900">
                {(parseFloat(subPlan.split("$")[1]) * platformSettings.usd_to_rwf_rate).toLocaleString()} RWF
              </span>
            </div>
            <p className="text-[10px] text-emerald-650 mt-1 font-mono font-bold leading-none">{t("lbl_local_rate_label", "Local Rate:")} 1 USD = {platformSettings.usd_to_rwf_rate} RWF</p>
          </div>

          <div className="bg-amber-50 border border-amber-250 p-4 rounded-xl flex flex-col gap-2 text-amber-950 select-none">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-800 leading-none font-bold">{t("lbl_payment_instructions", "Payment Instructions")}</span>
            <span className="text-xs leading-5">
              {t("lbl_payment_steps_1", "1. Pay with Mobile Money on:")}<br />
              • MTN Account: <span className="font-extrabold text-stone-900">{platformSettings.mtn_payment_number}</span> ({t("lbl_name", "Name:")} <span className="font-extrabold text-stone-900">{platformSettings.payment_name}</span>)<br />
              • Airtel Account: <span className="font-extrabold text-stone-900">{platformSettings.airtel_payment_number}</span> ({t("lbl_name", "Name:")} <span className="font-extrabold text-stone-900">{platformSettings.payment_name}</span>)<br />
              {t("lbl_payment_steps_2", "2. Keep MTN or Airtel SMS receipt text confirmation.")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t("lbl_payer_momo_phone", "Your Payer Momo Phone Number")} value={payerPhone} onChange={(e) => setPayerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="e.g. 0788123456" />
            <Input label={t("lbl_momo_trans_ref", "MoMo Transaction Reference ID")} value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="e.g. TXN2468135" />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-gray-700">{t("lbl_momo_sms_proof", "MTN or Airtel Money confirmation SMS text proof")}</label>
            <textarea
              className="w-full text-xs rounded-lg border bg-white border-gray-300 p-3 h-20 focus:ring-2 focus:ring-[var(--org-primary)] focus:outline-none focus:border-transparent font-medium"
              value={momoSmsProof}
              onChange={(e) => setMomoSmsProof(e.target.value)}
              placeholder="Paste raw SMS text transaction copy, e.g. TxId: 4810294. Yello! You have sent 30,000 RWF to VIRELLIX INC..."
            />
          </div>

          <div className="flex gap-4 border-t pt-4">
            <Button type="button" variant="outline" className="w-1/2" onClick={() => setOpenSubModal(false)}>
              {t("btn_back", "Back")}
            </Button>
            <Button type="submit" loading={submittingPayment} className="w-1/2">
              {t("btn_submit_receipt", "Submit Payment Receipt Proof")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
