import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  Megaphone,
  MessageSquare,
  Vote,
  FolderOpen,
  BarChart3,
  Target,
  Award,
  Coins,
  Heart,
  FileBarChart,
  Settings,
  Shield,
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Globe,
  Crown,
  AlertTriangle,
  Send,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useOrgStore } from "../store/orgStore";
import { useCurrencyStore } from "../store/currencyStore";
import { Avatar, Badge, Button, Input, Card } from "./ui";
import {
  useSubmitSubscriptionPayment,
  useSubmitErrorReport,
  usePlatformAdminData,
  useNews,
  useMeetings
} from "../hooks/useImpactoData";
import { useToast } from "./Toast";

// ==========================================
// 1. ORGANIZATIONAL BRANDING INJECTOR
// ==========================================
export const OrgThemeInjector: React.FC = () => {
  const { activeOrg } = useOrgStore();

  useEffect(() => {
    const root = document.documentElement;
    if (activeOrg) {
      root.style.setProperty("--org-primary", activeOrg.primary_color);
      root.style.setProperty("--org-primary-l", activeOrg.primary_color + "1e"); // rgba equivalent or opacity hex
      root.style.setProperty("--org-primary-d", activeOrg.primary_color); // standard fallback
      root.style.setProperty("--org-secondary", activeOrg.secondary_color);
      document.title = `${activeOrg.name} | Impacto`;
      
      // Inject the dashboard theme if it is not "custom"
      if (activeOrg.dashboard_theme === "dark") {
        root.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      } else if (activeOrg.dashboard_theme === "light") {
        root.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
      }
    } else {
      root.style.setProperty("--org-primary", "#15803D"); // Default Impacto Green
      root.style.setProperty("--org-primary-l", "rgba(21, 128, 61, 0.12)");
      root.style.setProperty("--org-primary-d", "#14532D");
      root.style.setProperty("--org-secondary", "#F59E0B");
      document.title = "Impacto";
    }
  }, [activeOrg]);

  return null;
};

// ==========================================
// 2. TOPBAR COMPONENT
// ==========================================
export const Topbar: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const { activeOrg, clearOrg } = useOrgStore();
  const { t, i18n } = useTranslation();
  const [dark, setDark] = useState(() => {
    const currentTheme = localStorage.getItem("theme") || "light";
    return currentTheme === "dark";
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [lastNotificationTimestamp, setLastNotificationTimestamp] = useState(() => {
    return localStorage.getItem("last_notification_seen") || "1970-01-01T00:00:00.000Z";
  });
  const navigate = useNavigate();

  const { activeCurrency, setActiveCurrency, setRates } = useCurrencyStore();
  const { addToast } = useToast();
  const { data: platformData } = usePlatformAdminData();

  const { data: news } = useNews(activeOrg?.id);
  const { data: meetings } = useMeetings(activeOrg?.id);

  const announcementsList = [
    ...(news || []).map((n) => ({
      id: n.id,
      type: "news" as const,
      title: n.title,
      summary: n.excerpt,
      time: n.published_at || new Date().toISOString(),
      path: "/dashboard/news",
    })),
    ...(meetings || []).map((m) => ({
      id: m.id,
      type: "meeting" as const,
      title: `Upcoming Meeting: ${m.title}`,
      summary: `Meeting venue/link at ${m.location}.`,
      time: m.date_time || new Date().toISOString(),
      path: "/dashboard",
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const hasNewNotification = announcementsList.length > 0 && 
    new Date(announcementsList[0].time).getTime() > new Date(lastNotificationTimestamp).getTime();

  useEffect(() => {
    if (platformData?.settings) {
      setRates({
        USD_to_RWF: Number(platformData.settings.usd_to_rwf_rate) || 1300,
        EUR_to_RWF: Number(platformData.settings.eur_to_rwf_rate) || 1400,
        KES_to_RWF: Number(platformData.settings.kes_to_rwf_rate) || 10,
      });
    }
  }, [platformData, setRates]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    const nextTheme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const handleLanguageSwitch = (lng: "en" | "fr" | "rw") => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl backdrop-saturate-150 border-b border-black/5 dark:border-white/10 flex items-center justify-between px-4 z-40 shrink-0 select-none">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand Logo / Icon */}
        <Link to="/" className="flex items-center gap-2" onClick={() => clearOrg()}>
          {activeOrg?.dashboard_logo ? (
            <img 
              src={activeOrg.dashboard_logo} 
              alt="Dashboard Logo" 
              className="h-8 shrink-0 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=150";
              }}
            />
          ) : (
            <svg className="h-7 w-7 text-[var(--org-primary)] shrink-0" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="35" r="25" stroke="currentColor" strokeWidth="8" />
              <circle cx="35" cy="65" r="25" stroke="currentColor" strokeWidth="8" />
              <circle cx="65" cy="65" r="25" stroke="currentColor" strokeWidth="8" />
              <polygon points="53,48 47,48 50,42" fill="currentColor" opacity="0.8" />
            </svg>
          )}
          <span className="font-display font-extrabold text-lg tracking-tight text-gray-900 dark:text-white hidden sm:inline">
            IMPACTO
          </span>
        </Link>

        {activeOrg && (
          <div className="hidden xs:flex items-center gap-2">
            <span className="text-gray-300 dark:text-slate-700 font-light font-sans">/</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--org-primary-l)] text-[var(--org-primary)] font-sans">
              {activeOrg.name} 
            </span>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full select-none font-mono ${
              activeOrg.subscription_status === "active"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : activeOrg.subscription_status === "expired"
                ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                : "bg-amber-100 text-amber-850 border border-amber-300"
            }`}>
              {activeOrg.subscription_status === "active" ? "PREMIUM MASTER" : activeOrg.subscription_status === "expired" ? "EXPIRED LICENSE" : "TRIAL PERIOD"}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Currency Switcher */}
        <div className="relative group flex items-center">
          <button className="flex items-center gap-1.5 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-gray-250 dark:border-slate-700 rounded-lg text-xs font-extrabold text-gray-750 dark:text-slate-200 transition h-8 cursor-pointer shadow-xs whitespace-nowrap">
            <Coins className="h-3.5 w-3.5 text-amber-500 shrink-0 animate-spin-slow" />
            <span>{activeCurrency}</span>
          </button>
          <div className="absolute right-0 top-9 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl hidden group-hover:block w-36 overflow-hidden shrink-0 z-50">
            <div className="px-2.5 py-1.5 border-b text-[9px] uppercase tracking-wider font-mono text-gray-400 font-bold dark:border-slate-700">
              Active Currency
            </div>
            {(["RWF", "USD", "EUR", "KES"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setActiveCurrency(code)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-750 transition cursor-pointer ${
                  activeCurrency === code ? "text-[var(--org-primary)] font-bold bg-slate-50 dark:bg-slate-750" : "text-gray-700 dark:text-slate-200"
                }`}
              >
                <span>{code === "USD" ? "USD ($)" : code === "EUR" ? "EUR (€)" : code === "KES" ? "KES (KES)" : "RWF (RWF)"}</span>
                {activeCurrency === code && <span className="h-1.5 w-1.5 rounded-full bg-[var(--org-primary)]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Language switch */}
        <div className="relative group flex items-center">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400">
            <Globe className="h-4.5 w-4.5" />
          </button>
          <div className="absolute right-0 top-9 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg hidden group-hover:block w-30 overflow-hidden shrink-0">
            <button
              onClick={() => handleLanguageSwitch("en")}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200"
            >
              English
            </button>
            <button
              onClick={() => handleLanguageSwitch("fr")}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200"
            >
              Français
            </button>
            <button
              onClick={() => handleLanguageSwitch("rw")}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200"
            >
              Kinyarwanda
            </button>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400"
        >
          {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications */}
        {activeOrg && (
          <div className="relative">
            <button
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                const now = new Date().toISOString();
                localStorage.setItem("last_notification_seen", now);
                setLastNotificationTimestamp(now);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 relative focus:outline-none"
            >
              <Bell className="h-4.5 w-4.5" />
              {hasNewNotification && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            {notificationOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotificationOpen(false)} />
                <div className="absolute right-0 top-10 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl py-3.5 z-20 text-sm shrink-0 flex flex-col gap-2">
                  <div className="px-4 pb-2 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-gray-950 dark:text-white">Announcements & Notices</span>
                    <Badge color={hasNewNotification ? "red" : "blue"}>{hasNewNotification ? "New" : "All Read"}</Badge>
                  </div>

                  <div className="max-h-72 overflow-y-auto px-2 flex flex-col gap-1.5">
                    {announcementsList.length > 0 ? (
                      announcementsList.map((ann) => (
                        <button
                          key={ann.id}
                          onClick={() => {
                            setNotificationOpen(false);
                            navigate(ann.path);
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-755 transition flex items-start gap-3 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 leading-tight"
                        >
                          <div className={`p-2 rounded-lg shrink-0 ${
                            ann.type === "news" ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40" : "bg-blue-100 text-blue-600 dark:bg-blue-950/40"
                          }`}>
                            {ann.type === "news" ? <Megaphone className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="font-bold text-xs text-gray-900 dark:text-white truncate">{ann.title}</span>
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{ann.summary}</span>
                            <span className="text-[9px] text-gray-400 font-mono mt-0.5">{new Date(ann.time).toLocaleDateString()}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-gray-450 font-semibold gap-1.5 flex flex-col items-center">
                        <span>🔔</span>
                        <span>No announcements posted yet.</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-100 dark:border-slate-700 pt-2.5 px-3.5 flex justify-between select-none">
                    <button
                      onClick={() => {
                        setNotificationOpen(false);
                        navigate("/dashboard/news");
                      }}
                      className="text-[11px] text-emerald-600 hover:underline font-bold"
                    >
                      View all news →
                    </button>
                    <button
                      onClick={() => {
                        setNotificationOpen(false);
                        navigate("/dashboard/chat");
                      }}
                      className="text-[11px] text-gray-400 hover:underline font-bold"
                    >
                      Open Chat Rooms
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Profile Avatar Menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 hover:opacity-90 outline-none"
            >
              <Avatar name={user.full_name} size="xs" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-20 overflow-hidden text-sm shrink-0">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  {user.is_superadmin && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/platform/admin");
                      }}
                      className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      {t("nav.platform_admin")}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      clearOrg();
                      navigate("/org-picker");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
                  >
                    Switch NGO
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 flex items-center gap-2 border-t border-gray-100 dark:border-slate-700 font-semibold"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t("auth.logout")}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to="/login" className="text-xs font-semibold hover:underline text-gray-500">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

// ==========================================
// 3. SIDEBAR COMPONENT
// ==========================================
export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { activeOrg, activeMember } = useOrgStore();
  const location = useLocation();

  const isAdmin = activeMember?.role === "org_admin";

  const navigation = [
    { name: t("nav.dashboard"), path: "/dashboard", icon: LayoutDashboard },
    { name: t("nav.news"), path: "/dashboard/news", icon: Megaphone },
    { name: t("nav.chat"), path: "/dashboard/chat", icon: MessageSquare },
    { name: t("nav.events"), path: "/dashboard/events", icon: Calendar },
    { name: t("nav.meetings"), path: "/dashboard/meetings", icon: Clock },
    { name: t("nav.goals"), path: "/dashboard/goals", icon: Target },
    { name: t("nav.documents"), path: "/dashboard/documents", icon: FolderOpen },
    { name: t("nav.impact"), path: "/dashboard/impact", icon: BarChart3 },
    { name: "Public Portal", path: `/@${activeOrg?.slug}`, icon: Globe, target: "_blank" },
    // Admin only links:
    { name: t("nav.members"), path: "/dashboard/members", icon: Users, admin: true },
    { name: t("nav.ledger"), path: "/dashboard/ledger", icon: Coins, admin: true },
    { name: t("nav.donors"), path: "/dashboard/donors", icon: Heart, admin: true },
    { name: t("nav.grants"), path: "/dashboard/grants", icon: Award, admin: true },
    { name: t("nav.reports"), path: "/dashboard/reports", icon: FileBarChart, admin: true },
    { name: t("nav.settings"), path: "/dashboard/settings", icon: Settings, admin: true }
  ];

  return (
    <>
      {/* Sidebar background shade on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-14 left-0 bottom-0 w-52 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-30 transition-transform duration-200 shrink-0 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col justify-between p-3 select-none overflow-y-auto">
          <nav className="flex flex-col gap-1 w-full">
            {navigation.map((item) => {
              // Hide from standard members if admin-only feature is flagged
              if (item.admin && !isAdmin) return null;

              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  target={item.target}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? "bg-[var(--org-primary-l)] text-[var(--org-primary)] shadow-xs"
                      : "text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[var(--org-primary)]" : "text-gray-400"}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-slate-800 shrink-0">
            <div className="px-3">
              <span className="text-[10px] font-mono tracking-wider uppercase text-gray-500 block">NGO Suite</span>
              <span className="text-[9px] text-gray-400 block mt-0.5">Impacto v1.0 • © 2026</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// ==========================================
// 4. MAIN DASHBOARD LAYOUT COMPONENT WITH EXPIRED SHIELD
// ==========================================
export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeOrg, activeMember } = useOrgStore();
  const { activeCurrency, formatAmount, convertToRWF } = useCurrencyStore();
  const { addToast } = useToast();

  const { data: platformData, refetch: refetchSaas } = usePlatformAdminData();
  const submitPaymentMutation = useSubmitSubscriptionPayment();
  const supportMutation = useSubmitErrorReport();

  const [supportText, setSupportText] = useState("");
  const [momoPhone, setMomoPhone] = useState("");
  const [momoRef, setMomoRef] = useState("");
  const [smsProof, setSmsProof] = useState("");
  const [selectedTier, setSelectedTier] = useState("Growth Plan - $25/month");
  
  const [alertNotify, setAlertNotify] = useState(false);
  const [paySuccessAlert, setPaySuccessAlert] = useState("");
  const [supportSuccessAlert, setSupportSuccessAlert] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [sendingSupport, setSendingSupport] = useState(false);

  const platformSettings = platformData?.settings || {
    usd_to_rwf_rate: 1300,
    mtn_payment_number: "0788100100",
    airtel_payment_number: "0733100100",
    payment_name: "VIRELLIX INC"
  };

  const isAdmin = activeMember?.role === "org_admin";
  const isExpired = activeOrg?.subscription_status === "expired" || 
    (activeOrg?.subscription_ends_at && new Date(activeOrg?.subscription_ends_at) < new Date());

  const handlePayLockout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!momoPhone || !momoRef || !smsProof) {
      addToast("Please provide complete payment reference IDs and SMS receipts to alert Superadmin.", "error");
      return;
    }

    if (!/^07\d{8}$/.test(momoPhone)) {
      addToast("Error: Phone number must be exactly 10 digits and start with 07 (e.g., 07xxxxxxxx)", "error");
      return;
    }

    setSubmittingPayment(true);
    try {
      const rate = platformSettings.usd_to_rwf_rate || 1350;
      let costUsd = 25;
      if (selectedTier.includes("Starter")) costUsd = 10;
      if (selectedTier.includes("Enterprise")) costUsd = 50;

      await submitPaymentMutation.mutateAsync({
        org_id: activeOrg?.id || "",
        plan: selectedTier,
        amount_usd: costUsd,
        amount_local: costUsd * rate,
        method: momoPhone.startsWith("078") || momoPhone.startsWith("079") ? "mtn" : "airtel",
        phone: momoPhone,
        reference: momoRef,
        proof_url: smsProof
      });

      setPaySuccessAlert("Invoice proof dispatched! Platform Superadmin notified to verify and unlock licenses.");
      setMomoPhone("");
      setMomoRef("");
      setSmsProof("");
      refetchSaas();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleSupportLockout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportText.trim()) return;

    setSendingSupport(true);
    try {
      await supportMutation.mutateAsync({
        org_id: activeOrg?.id || "",
        title: "Incident Lockout Direct Comment",
        description: supportText,
        priority: "critical",
        screenshot_url: "Lockout direct line"
      });
      setSupportText("");
      setSupportSuccessAlert("Direct support comments successfully saved and escalated!");
    } catch (err) {
      console.error(err);
    } finally {
      setSendingSupport(false);
    }
  };

  // If expired, warp standard screen
  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col pt-14 text-sm select-none font-sans">
        <OrgThemeInjector />
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex-1 max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6 justify-center items-center w-full my-auto animate-in zoom-in-95">
          <div className="text-center flex flex-col items-center gap-2 mb-2 select-none">
            <div className="h-16 w-16 bg-red-105 border border-red-200 text-red-600 flex items-center justify-center rounded-3xl shrink-0 shadow-lg mb-2">
              <AlertTriangle className="h-8 w-8 shrink-0 animate-bounce" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-display leading-none tracking-tight text-gray-901">
              Workspace Access Paused
            </h1>
            <p className="text-xs text-gray-400 font-medium">
              The active licensing subscription plan for <span className="text-emerald-750 font-bold">@{activeOrg?.slug}</span> has expired.
            </p>
          </div>

          {isAdmin ? (
            // ADMIN LICENSE UPGRADE & ESCALATION CONTROL HUB
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full font-medium">
              <Card title="NGO Plan Upgrades & Subscriptions Form">
                {paySuccessAlert ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-150 text-[11px] text-emerald-800 font-semibold rounded-lg flex flex-col gap-2 leading-relaxed">
                    <span className="font-bold flex items-center gap-1.5"><CheckCircle className="h-4 w-4 shrink-0" /> Receipt Sent</span>
                    <p>{paySuccessAlert}</p>
                  </div>
                ) : (
                  <form onSubmit={handlePayLockout} className="flex flex-col gap-3 text-xs font-semibold text-gray-700">
                    <p className="text-gray-500 font-normal leading-normal text-[11px] mb-1">
                      Pay manually via Mobile Money then complete Raw SMS confirmation logs below.
                    </p>

                    <div className="bg-amber-50/50 border border-amber-250 p-2.5 rounded-lg text-[10px] text-amber-950 font-mono flex flex-col leading-5 select-none">
                      <span className="font-bold uppercase tracking-wider text-amber-800 mb-1 text-[9px]">Platform Transfer Targets</span>
                      <span>MTN: <span className="font-extrabold">{platformSettings.mtn_payment_number}</span> ({platformSettings.payment_name})</span>
                      <span>Airtel: <span className="font-extrabold">{platformSettings.airtel_payment_number}</span> ({platformSettings.payment_name})</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-gray-400 font-mono tracking-wider font-bold">Select Active Tier</label>
                      <select
                        value={selectedTier}
                        onChange={(e) => setSelectedTier(e.target.value)}
                        className="w-full text-xs rounded-lg border bg-white border-gray-305 px-3 py-2 text-stone-800 select-none focus:ring-1 focus:ring-emerald-500 font-semibold dark:bg-slate-900 dark:border-slate-705 dark:text-slate-100"
                      >
                        <option value="Starter Plan - $10/month">Starter Tier — $10 ({(10 * platformSettings.usd_to_rwf_rate).toLocaleString()} RWF / {formatAmount(convertToRWF(10, 'USD'))})</option>
                        <option value="Growth Plan - $25/month">Growth Tier — $25 ({(25 * platformSettings.usd_to_rwf_rate).toLocaleString()} RWF / {formatAmount(convertToRWF(25, 'USD'))})</option>
                        <option value="Enterprise Plan - $50/month">Enterprise Monolith — $50 ({(50 * platformSettings.usd_to_rwf_rate).toLocaleString()} RWF / {formatAmount(convertToRWF(50, 'USD'))})</option>
                      </select>
                    </div>

                    <Input label="MoMo Payer Phone Number" value={momoPhone} onChange={(e) => setMomoPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="078XXXXXXX" />
                    <Input label="MoMo / Airtel Ref ID Key" value={momoRef} onChange={(e) => setMomoRef(e.target.value)} placeholder="TXNXXXXXXX" />

                    <div className="flex flex-col gap-1 w-full">
                      <label className="text-[10px] uppercase text-gray-400 font-mono tracking-wider font-bold">MoMo/Airtel Text SMS Confirmation Receipt</label>
                      <textarea
                        className="w-full text-xs rounded-lg border bg-white border-gray-305 p-2 h-16 bg-slate-50/20 text-stone-900"
                        value={smsProof}
                        onChange={(e) => setSmsProof(e.target.value)}
                        placeholder="Paste transaction copy e.g. TxId: 41209. You have transferred..."
                      />
                    </div>

                    <Button type="submit" loading={submittingPayment} className="w-full py-2.5 mt-2">
                      Submit Payment SMS Proof
                    </Button>
                  </form>
                )}
              </Card>

              <Card title="Contact Gaby Prince Superadmin Direct Line">
                {supportSuccessAlert ? (
                  <div className="p-3 bg-emerald-55/10 border border-emerald-500/25 text-emerald-800 text-[11px] font-semibold rounded-lg flex flex-col gap-1.5 leading-relaxed">
                    <span className="font-bold flex items-center gap-1.5"><CheckCircle className="h-4 w-4 shrink-0" /> Conversation Log Update</span>
                    {supportSuccessAlert}
                  </div>
                ) : (
                  <form onSubmit={handleSupportLockout} className="flex flex-col gap-4 text-xs font-semibold text-gray-700">
                    <p className="text-gray-500 font-normal leading-normal text-[11px]">
                      Stuck or experiencing confirmation lags? Text Gaby Prince platform superadmin directly below.
                    </p>

                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-[10px] uppercase text-gray-400 font-mono tracking-wider font-bold">Write support ticket message or just talk</label>
                      <textarea
                        className="w-full text-xs rounded-lg border bg-white border-gray-305 p-3 h-28 bg-slate-50/20 text-stone-900"
                        value={supportText}
                        onChange={(e) => setSupportText(e.target.value)}
                        placeholder="Type direct support Comments here, e.g. Just paid Growth plan, please approve..."
                      />
                    </div>

                    <Button type="submit" loading={sendingSupport} icon={<Send className="h-4 w-4" />} className="w-full py-2.5">
                      Transmit Direct Support Comments
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          ) : (
            // VOLUNTEER/MEMBER LICENSE BLOCK
            <div className="w-full max-w-md">
              <Card title="License Lock Alert">
                <div className="text-center py-6 flex flex-col items-center gap-4 text-xs font-semibold text-gray-650 leading-relaxed">
                  <p>
                    Please notify your Workspace Administrator or NGO Operations Manager to upgrade their plan to restore employee check-in calendars, ledgers, and team channels.
                  </p>

                  {alertNotify ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-150 text-emerald-850 rounded-lg font-bold flex items-center gap-2">
                      <CheckCircle className="h-4.5 w-4.5" /> Workspace Administrator @Admin notified successfully!
                    </div>
                  ) : (
                    <Button onClick={() => setAlertNotify(true)} icon={<Send className="h-4.5 w-4.5" />} className="w-full py-2.5">
                      Notify Administrator @Admin
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-14 text-sm">
      <OrgThemeInjector />
      <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 md:pl-52 min-w-0 flex flex-col">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

