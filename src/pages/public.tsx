import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalTranslation } from "../locales/additional-translations";
import { useForm, ValidationError } from "@formspree/react";
import {
  Search,
  Share2,
  Heart,
  Globe,
  MapPin,
  Check,
  Building2,
  AlertCircle,
  FileCheck,
  Eye,
  Camera,
  CalendarDays,
  Target,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  Minus,
  Lock
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useOrgStore } from "../store/orgStore";
import { useCurrencyStore } from "../store/currencyStore";
import {
  useOrganizations,
  useOrganization,
  useNews,
  useGoals,
  useDonations,
  useEvents,
  useCreateDonation,
  useCheckIn,
  useActivityLogs
} from "../hooks/useImpactoData";
import { Button, Input, Card, Badge, Avatar, ProgressBar, EmptyState, Modal } from "../components/ui";
import { Organization } from "../types";

// ==========================================
// 1. DYNAMIC HOMEPAGE & DISCOVERY FEED
// ==========================================
export const Landing: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data: orgs, isLoading } = useOrganizations();
  const navigate = useNavigate();
  const { convertToRWF, formatAmount, activeCurrency } = useCurrencyStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [logoError, setLogoError] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Contact modal states
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const [formspreeState, handleFormspreeSubmit] = useForm("xojbrlel");

  useEffect(() => {
    if (formspreeState.succeeded) {
      setContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
    }
  }, [formspreeState.succeeded]);

  const isRw = i18n.language?.startsWith("rw");
  const isFr = i18n.language?.startsWith("fr");

  const handleLanguageSwitch = (lng: "en" | "fr" | "rw") => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  const categories = ["All", "Environment", "Education", "Health", "Social Action", "Enterprise"];

  const getCategoryLabel = (cat: string) => {
    if (isRw) {
      switch (cat) {
        case "All": return "Byose";
        case "Environment": return "Ibidukikije";
        case "Education": return "Uburezi";
        case "Health": return "Ubuzima";
        case "Social Action": return "Imibereho Myiza";
        case "Enterprise": return "Koperative n'Ubucuruzi";
        default: return cat;
      }
    }
    if (isFr) {
      switch (cat) {
        case "All": return "Tout";
        case "Environment": return "Environnement";
        case "Education": return "Éducation";
        case "Health": return "Santé";
        case "Social Action": return "Action Sociale";
        case "Enterprise": return "Entreprise";
        default: return cat;
      }
    }
    return cat;
  };

  const rwFaqs = [
    {
      id: 1,
      question: "Impacto ni iki kandi igenewe bande?",
      answer: "Impacto ni ihuriro ry'imikorere n'ibaruranyandiko ry'imiryango itegamiye kuri Leta (NGOs), amakoperative y'iterambere, n'amashyirahamwe y'abaturage mu Rwanda. Itanga uburyo bwiza bwo gushyira amakuru mu buryo bw'ikoranabuhanga n'ubugenzuzi bwa Mobile Money."
    },
    {
      id: 2,
      question: "Ibitabo by'imari bya Mobile Money bikora bite kuri Impacto?",
      answer: "Impacto itanga igitabo cy'imari gikurikirana inkunga n'inkunga z'abaturage. Abayobozi bashobora kwandika ibikorwa by'imari byemejwe na nimero ya gihamya (MTN MoMo cyangwa Airtel Money ID), hagamijwe umucyo wa 100%."
    },
    {
      id: 3,
      question: "Ese mbuga z'imiryango ziba ziri kuri Google / moteri zishakisha?",
      answer: "Yego! Buri muryango wemejwe uhabwa urubuga rwa rwo kuri impacto.org/@slug. Uru rubuga rugaragaza ibikorwa bihari, impeshyi z'inkunga zakusanyijwe, amatangazo, n'inkunga zose mu buryo bugaragarira buri wese."
    },
    {
      id: 4,
      question: "Twaba dushobora gutumira abayobozi bacu cyangwa abakozi mu nzego zo mukarere?",
      answer: "Yego rwose. Impacto ifite inshingano zinyuranye: Ubuyobozi bushobora gucunga porogaramu, guhindura ibitabo by'imari, no gutangaza amakuru, mu gihe abanyamuryango basanzwe bashobora kwerekana ko bahari bakokesheje QR code, cyangwa bagatunganya ibijyanye n'amatora."
    },
    {
      id: 5,
      question: "Agasanduku ko kwandikisha abantu hakoreshejwe QR kodi ni iki?",
      answer: "Kugira ngo hemezwe ko inama rusange cyangwa amahugurwa byabayeho koko, abayobozi bashobora kurema QR kodi yihariye. Abanyamuryango bascaninga iyo kodi bakoresheje terefone zabo kugira ngo bandikwe ku rutonde rw'ababonetse."
    },
    {
      id: 6,
      question: "Twakorera gute ihererekanya ry'ifatabuguzi?",
      answer: "Ushobora guhindura ifatabuguzi mu buryo bworoshye unyuze ku kiganiro cy'Igenamiterere ryawe. Ifatabuguzi ryishyurwa buri kwezi (agaciro mu mafaranga y'u Rwanda - RWF kaboneka mu buryo bworoshye), kandi umwanya wo kubika ukaba wagera kuri 20GB ku rwego rwa Pro."
    },
    {
      id: 7,
      question: "Impacto yaba ifasha gukoresha indimi zinyuranye?",
      answer: "Yego kaboneka! urubuga ndetse n'ibikorwa byarwo byose bikorwa mu ndimi eshatu: Ikinyarwanda (RW), Icyongereza (EN), ndetse n'Igifaransa (FR), byorohereza abakozi gukora mu rurimi rwo guhitamo kwabo."
    }
  ];

  const frFaqs = [
    {
      id: 1,
      question: "Qu'est-ce qu'Impacto et à qui s'adresse-t-il ?",
      answer: "Impacto est un espace de travail SaaS multi-tenant conçu spécifiquement pour les organisations non gouvernementales (ONG) rwandaises, les coopératives sociales, les initiatives forestières et les associations communautaires."
    },
    {
      id: 2,
      question: "Comment fonctionnent les registres Mobile Money sur Impacto ?",
      answer: "Impacto propose un registre manuel et numérique auditable qui suit les campagnes de dons et le soutien local. Les administrateurs peuvent enregistrer les transactions vérifiées par rapport aux références de paiement officielles (MTN MoMo ou Airtel Money ID)."
    },
    {
      id: 3,
      question: "Les pages publiques sous @slug sont-elles indexées par les moteurs de recherche ?",
      answer: "Oui ! Chaque espace de travail vérifié reçoit un profil public sur impacto.org/@slug. Cette page présente les programmes civiques actifs, les jalons de campagne en temps réel, les annonces publiques et un mur de donateurs."
    },
    {
      id: 4,
      question: "Pouvons-nous inviter les membres de notre conseil d'administration et nos agents de terrain ?",
      answer: "Absolument. Impacto dispose de rôles granulaires : les administrateurs peuvent coordonner les programmes, modifier les registres et publier des bulletins d'information, tandis que les membres peuvent s'enregistrer avec des codes QR."
    },
    {
      id: 5,
      question: "Qu'est-ce que le registre de présence par QR Code ?",
      answer: "Pour vérifier les réunions physiques et les sessions de formation, les administrateurs peuvent générer des codes QR spécifiques. Les membres scannent simplement le code avec leur appareil mobile pour signer le registre de présence."
    },
    {
      id: 6,
      question: "Comment pouvons-nous mettre à niveau notre abonnement ?",
      answer: "Vous pouvez effectuer la transition entre les plans dans vos paramètres d'administration. Les abonnements sont facturés mensuellement (avec des prix convertis en Francs Rwandais - RWF)."
    },
    {
      id: 7,
      question: "Impacto prend-il en charge la traduction multilingue ?",
      answer: "Oui ! La plateforme et les processus de travail sont entièrement traduits pour prendre en charge l'anglais, le français (FR) et le kinyarwanda (RW)."
    }
  ];

  const enFaqs = [
    {
      id: 1,
      question: "What is Impacto and who is it designed for?",
      answer: "Impacto is a local multi-tenant workspace platform designed specifically for Rwandan social cooperatives, forestry initiatives, and community associations. It provides secure modules to digitize and audit operations, from grassroots member directories to Mobile Money databases."
    },
    {
      id: 2,
      question: "How do Mobile Money ledgers work on Impacto?",
      answer: "Impacto provides an auditable manual and digital ledger that tracks donor campaigns and local support. Administrators can log transactions, verified against official payment references (such as MTN MoMo or Airtel Money receipt IDs), ensuring 100% transparency in local fundraising."
    },
    {
      id: 3,
      question: "Are the public organization pages under @slug search-engine indexed?",
      answer: "Yes! Every verified workspace receives a public profile at impacto.org/@slug. This public page showcases active civic programs, real-time campaign milestones, public announcements, and a donor wall to securely verify impact to the community and global partners."
    },
    {
      id: 4,
      question: "Can we invite our board members and field workers into the workspace?",
      answer: "Absolutely. Impacto has granular roles: Workspace Administrators can coordinate programs, edit ledger books, and publish news bulletins, while Field Members can check-in on-site using QR codes, upload documents, and participate in votes and decisions."
    },
    {
      id: 5,
      question: "What is the QR Attendance Register capability?",
      answer: "To verify physical community meetings and cooperative training sessions, admins can dynamically generate session-specific QR codes. Members simply scan the code with their mobile devices to sign the attendance log with a verified date stamp, keeping community operations honest and auditable."
    },
    {
      id: 6,
      question: "How can we upgrade our workspace subscription plan?",
      answer: "You can seamlessly transition between plans inside your Admin Panel Settings. Subscriptions are billed monthly (with approximate prices shown in Rwandan Francs - RWF), and storage scales up to 20GB on our Pro tier with priority technical support."
    },
    {
      id: 7,
      question: "Does Impacto support multi-language translation?",
      answer: "Yes! The core platform and workflows are fully localized to support English, French (FR), and Kinyarwanda (RW), ensuring field coordinators and community groups can operate in their language of choice."
    }
  ];

  const faqsData = isRw ? rwFaqs : isFr ? frFaqs : enFaqs;

  const filteredOrgs = orgs?.filter((o) => {
    const isPublic = o.is_public_directory ?? true;
    const matchesSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || o.org_category === selectedCategory;
    return isPublic && matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 text-sm font-sans flex flex-col justify-between">
      {/* Dynamic Header */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 md:px-12 z-50 select-none shrink-0 transition-all duration-150">
        <Link to="/" className="flex items-center gap-2.5 group">
          {!logoError ? (
            <img 
              src="/logo.png" 
              onError={() => setLogoError(true)} 
              className="h-8 w-auto shrink-0 max-w-[140px] object-contain" 
              alt="Impacto Logo" 
            />
          ) : (
            <div className="flex items-center gap-2">
              <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-500 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="35" r="25" stroke="currentColor" strokeWidth="8" />
                <circle cx="35" cy="65" r="25" stroke="currentColor" strokeWidth="8" />
                <circle cx="65" cy="65" r="25" stroke="currentColor" strokeWidth="8" />
                <polygon points="53,48 47,48 50,42" fill="#F59E0B" />
              </svg>
              <span className="font-display font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white font-semibold">
                IMPACTO
              </span>
            </div>
          )}
        </Link>
        
        {/* Navigation Content Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold text-gray-505 dark:text-slate-300">
          <a href="#capabilities" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition duration-150 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-600 hover:after:w-full after:transition-all">{t("landing.nav_capabilities")}</a>
          <a href="#discovery" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition duration-150 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-600 hover:after:w-full after:transition-all">{t("landing.nav_discover")}</a>
          <a href="#pricing" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition duration-150 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-600 hover:after:w-full after:transition-all">{t("landing.nav_pricing")}</a>
          <a href="#faqs" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition duration-150 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-600 hover:after:w-full after:transition-all">{t("landing.nav_faqs")}</a>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200/50 dark:border-slate-700/50 mr-1 select-none">
            <button
              onClick={() => handleLanguageSwitch("en")}
              title="English"
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                i18n.language === "en"
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageSwitch("fr")}
              title="Français"
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                i18n.language?.startsWith("fr")
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              FR
            </button>
            <button
              onClick={() => handleLanguageSwitch("rw")}
              title="Kinyarwanda"
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                i18n.language?.startsWith("rw")
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              RW
            </button>
          </div>

          <Link to="/login">
            <Button variant="ghost" className="font-semibold text-gray-600 dark:text-slate-300">{t("auth.login")}</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl transition duration-150 transform hover:scale-[1.02]">
              {t("landing.nav_get_started")}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Modern Hero Section */}
      <section className="pt-36 pb-20 px-6 max-w-5xl mx-auto text-center flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[550px] h-[250px] bg-emerald-500/10 dark:bg-emerald-400/5 blur-[100px] pointer-events-none rounded-full" />
        
        <span className="inline-flex items-center gap-2 px-3.5 py-1 text-[10px] font-bold tracking-widest text-[#15803D] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 rounded-full font-display uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {t("landing.hero_badge")}
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white font-display mt-6 max-w-4xl leading-tight uppercase">
          {t("landing.title")}
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-4 max-w-2xl leading-normal">
          {t("landing.tagline")}
        </p>

        <div className="flex gap-4 mt-8 shrink-0">
          <a href="#discovery">
            <Button variant="primary" size="lg" className="bg-emerald-700 hover:bg-emerald-800 text-white" icon={<Search className="h-4 w-4" />}>
              {t("landing.cta_discover")}
            </Button>
          </a>
          <Link to="/register">
            <Button variant="outline" size="lg">
              {t("landing.cta_start")}
            </Button>
          </Link>
        </div>

        {/* Highlight Tickers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mt-16 pt-10 border-t border-gray-200/60 dark:border-slate-800/80 w-full text-center">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gray-900 dark:text-white">1M+</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{t("landing.ticker_trees")}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gray-900 dark:text-white">100%</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{t("landing.ticker_momo")}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gray-900 dark:text-white">RWF 15M+</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{t("landing.ticker_donations")}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gray-900 dark:text-white">Active</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{t("landing.ticker_active")}</span>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid Section */}
      <section id="capabilities" className="py-16 bg-slate-50/50 dark:bg-slate-900 border-t border-b border-gray-200/60 dark:border-slate-800/60 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase font-mono">{t("landing.capabilities_badge")}</span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-gray-900 dark:text-white mt-1">
              {t("landing.capabilities_title")}
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              {t("landing.capabilities_desc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition duration-200">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/15 rounded-xl text-emerald-700 dark:text-emerald-400 h-10 w-10 flex items-center justify-center shrink-0">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm font-display">
                  {t("landing.card1_title")}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-300 leading-relaxed mt-1.5">
                  {t("landing.card1_desc")}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition duration-200">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 dark:text-amber-400 h-10 w-10 flex items-center justify-center shrink-0">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm font-display">
                  {t("landing.card2_title")}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-300 leading-relaxed mt-1.5">
                  {t("landing.card2_desc")}
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition duration-200">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/15 rounded-xl text-blue-700 dark:text-blue-400 h-10 w-10 flex items-center justify-center shrink-0">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm font-display">
                  {t("landing.card3_title")}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-300 leading-relaxed mt-1.5">
                  {t("landing.card3_desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NGOs Discovery Feed */}
      <section id="discovery" className="py-12 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8.5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display text-gray-900 dark:text-white">
                {t("landing.featured")}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{t("landing.directory_desc")}</p>
            </div>

            {/* Quick Search Input */}
            <div className="w-full md:w-80 select-none">
              <Input
                type="text"
                placeholder={t("landing.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefixIcon={<Search className="h-4 w-4 text-gray-400" />}
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2.5 overflow-x-auto pb-4 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full shrink-0 border cursor-pointer transition ${
                  selectedCategory === cat
                    ? "bg-[#15803D] border-[#15803D] text-white shadow-xs"
                    : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100"
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {/* Org Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-64 bg-gray-50 dark:bg-slate-800 border rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredOrgs.length === 0 ? (
            <EmptyState 
              title={isRw ? "Nta Muyoboro Uhuye" : isFr ? "Aucune ONG trouvée" : "No NGOs Matched"} 
              message={isRw ? "Gerageza guhindura amagambo ushakisha cyangwa uhitemo ibindi bice." : isFr ? "Essayez de modifier vos mots-clés ou sélectionnez d'autres catégories." : "Try customizing your keywords or select another categories."} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrgs.map((org) => (
                <Card 
                  key={org.id} 
                  padding={false} 
                  className="flex flex-col h-full group hover:border-[var(--org-primary)] transition cursor-pointer"
                  onClick={() => navigate(`/@${org.slug}`)}
                >
                  <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                    {org.cover_url ? (
                      <img src={org.cover_url} alt={org.name} className="h-full w-full object-cover group-hover:scale-103 transition duration-200" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-tr from-emerald-500 to-indigo-600 opacity-80" />
                    )}
                    <Badge color="green" className="absolute top-3 left-3">{getCategoryLabel(org.org_category)}</Badge>
                  </div>
                  <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-display font-bold text-base text-gray-900 dark:text-white group-hover:text-[var(--org-primary)] truncate">
                        {org.name}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 line-clamp-2 h-8.5">
                        {org.tagline}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-4 mt-auto">
                      <div className="flex flex-col gap-0.5 font-sans leading-none border-0 select-none">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{isRw ? "Ihuriro" : isFr ? "Espace" : "Workspace"}</span>
                        <span className="font-mono text-[11px] font-bold text-[var(--org-primary)]">@{org.slug}</span>
                      </div>
                      <Link to={`/@${org.slug}`} onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" icon={<Eye className="h-3.5 w-3.5" />}>
                          {isRw ? "Sura Umuryango" : isFr ? "Voir l'ONG" : "View NGO"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section id="pricing" className="py-20 bg-gray-50/55 dark:bg-slate-950 border-t border-gray-150 dark:border-slate-900 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono tracking-widest text-[#15803D] uppercase block font-bold">{t("landing.pricing_badge")}</span>
            <h2 className="text-2xl md:text-3xl font-bold font-display mt-1 text-gray-950 dark:text-white">
              {t("landing.pricing_title")}
            </h2>
            <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">
              {t("landing.pricing_desc")}
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 select-none">
            {/* 1. Trial */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-600 transition">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{isRw ? "Umushinga w'Ikigereranyo" : isFr ? "Projet Pilote" : "Pilot Project"}</span>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-1">{isRw ? "Uruhushya rw'Ikigereranyo" : isFr ? "Licence d'Essai" : "Trial License"}</h3>
                <p className="text-2xl font-black text-slate-950 dark:text-white mt-3">
                  {formatAmount(convertToRWF(0, "RWF"), "USD")}
                  <span className="text-xs font-semibold text-gray-400">{isRw ? " / iminsi 30" : isFr ? " / 30 jours" : " / 30 days"}</span>
                </p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                  {formatAmount(convertToRWF(0, "RWF"), activeCurrency)}
                </p>
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{isRw ? "Ibikubiyemo:" : isFr ? "Comprend :" : "Includes:"}</p>
                  <ul className="text-[11px] text-slate-500 flex flex-col gap-2 mt-2 font-medium">
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {isRw ? "Abanyamuryango banyuranye" : isFr ? "Membres illimités" : "Unlimited members"}</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {isRw ? "Ibikoresho byose birafunguye" : isFr ? "Tous les modules actifs" : "All modules active"}</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {isRw ? "500 MB y'ubushiko" : isFr ? "Stockage 500 Mo" : "500 MB storage cap"}</li>
                  </ul>
                </div>
              </div>
              <Link to="/register" className="mt-8">
                <Button variant="outline" className="w-full text-xs font-bold py-2">
                  {isRw ? "Kora Ikigereranyo" : isFr ? "Activer l'Essai" : "Activate Trial"}
                </Button>
              </Link>
            </div>

            {/* 2. Starter */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-600 transition">
              <div>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block font-bold">{isRw ? "Ihuriro rito ry'Abaturage" : isFr ? "Rassemblement Local" : "Local Grassroots"}</span>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-1">{isRw ? "Ifatabuguzi ry'Imberabutsa" : isFr ? "Formule Starter" : "Starter Plan"}</h3>
                <p className="text-2xl font-black text-slate-950 dark:text-white mt-3">
                  {formatAmount(convertToRWF(10, "USD"), "USD")}
                  <span className="text-xs font-semibold text-gray-400">{isRw ? " / ukwezi" : isFr ? " / mois" : " / mo"}</span>
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold font-mono mt-0.5">
                  {formatAmount(convertToRWF(10, "USD"), activeCurrency)}
                </p>
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{isRw ? "Ibikubiyemo:" : isFr ? "Comprend :" : "Includes:"}</p>
                  <ul className="text-[11px] text-slate-500 flex flex-col gap-2 mt-2 font-medium">
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {isRw ? "Kugeza ku banyamuryango 100" : isFr ? "Jusqu'à 100 membres" : "Up to 100 members"}</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {isRw ? "Igitabo cy'imari n'ibikorwa" : isFr ? "Grand livre local & événements" : "Local ledger & events"}</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {isRw ? "1 GB y'ubushiko" : isFr ? "Stockage 1 Go" : "1 GB storage cap"}</li>
                  </ul>
                </div>
              </div>
              <Link to="/register" className="mt-8">
                <Button variant="outline" className="w-full text-xs font-bold py-2">
                  {isRw ? "Tangiza Plan" : isFr ? "Lancer Starter" : "Launch Starter"}
                </Button>
              </Link>
            </div>

            {/* 3. Growth */}
            <div className="bg-white dark:bg-slate-900 border-2 border-[#15803D] p-6 rounded-2xl relative flex flex-col justify-between shadow-sm">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#15803D] text-white px-3 py-0.5 text-[8px] uppercase font-bold tracking-widest rounded-full">{isRw ? "Icyerekezo Cyiza" : isFr ? "Hautement Recommandé" : "Highly Recommended"}</span>
              <div>
                <span className="text-[9px] font-bold text-[#15803D] uppercase tracking-widest block font-bold">{isRw ? "Umuryango Uri Gukura" : isFr ? "ONG en Croissance" : "Scaling NGO"}</span>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-1">{isRw ? "Ifatabuguzi ry'Iterambere" : isFr ? "Formule Growth" : "Growth Plan"}</h3>
                <p className="text-2xl font-black text-slate-950 dark:text-white mt-3">
                  {formatAmount(convertToRWF(25, "USD"), "USD")}
                  <span className="text-xs font-semibold text-gray-400">{isRw ? " / ukwezi" : isFr ? " / mois" : " / mo"}</span>
                </p>
                <p className="text-[10px] text-[#15803D] font-mono font-bold mt-0.5">
                  {formatAmount(convertToRWF(25, "USD"), activeCurrency)}
                </p>
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{isRw ? "Ibikubiyemo:" : isFr ? "Comprend :" : "Includes:"}</p>
                  <ul className="text-[11px] text-slate-500 flex flex-col gap-2 mt-2 font-medium">
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {isRw ? "Kugeza ku banyamuryango 500" : isFr ? "Jusqu'à 500 membres" : "Up to 500 members"}</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {isRw ? "Ibiganiro bitsinda birakora" : isFr ? "Messagerie de groupe active" : "Group messaging active"}</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {isRw ? "5 GB y'ubushiko" : isFr ? "Stockage 5 Go" : "5 GB storage cap"}</li>
                  </ul>
                </div>
              </div>
              <Link to="/register" className="mt-8">
                <Button className="w-full bg-[#15803D] hover:bg-[#14532D] text-xs font-bold py-2">
                  {isRw ? "Tangiza Iterambere" : isFr ? "Lancer Growth" : "Launch Growth"}
                </Button>
              </Link>
            </div>

            {/* 4. Pro */}
            <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between text-white hover:border-[#15803D] transition">
              <div>
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block font-bold">{isRw ? "Icyerekezo Cyagutse" : isFr ? "Horizon Infini" : "Infinite Horizon"}</span>
                <h3 className="text-base font-extrabold text-slate-50 mt-1">{isRw ? "Ifatabuguzi rya Pro" : isFr ? "Licence Pro" : "Pro License"}</h3>
                <p className="text-2xl font-black text-white mt-3">
                  {formatAmount(convertToRWF(50, "USD"), "USD")}
                  <span className="text-xs font-semibold text-slate-400">{isRw ? " / ukwezi" : isFr ? " / mois" : " / mo"}</span>
                </p>
                <p className="text-[10px] text-amber-500 font-mono font-bold mt-0.5">
                  {formatAmount(convertToRWF(50, "USD"), activeCurrency)}
                </p>
                <div className="mt-5 pt-4 border-t border-slate-800">
                  <p className="text-xs font-bold text-slate-200">{isRw ? "Ibikubiyemo:" : isFr ? "Comprend :" : "Includes:"}</p>
                  <ul className="text-[11px] text-slate-400 flex flex-col gap-2 mt-2 font-medium">
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-amber-400 shrink-0" /> {isRw ? "Abanyamuryango bose" : isFr ? "Membres illimités" : "Unlimited members"}</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-amber-400 shrink-0" /> {isRw ? "Inyandiko za PDF n'Abaterankunga" : isFr ? "Compilateurs PDF & Donateurs" : "PDF compilers & Donors"}</li>
                    <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-amber-400 shrink-0" /> {isRw ? "20 GB y'ubushiko" : isFr ? "Stockage 20 Go" : "20 GB storage cap"}</li>
                  </ul>
                </div>
              </div>
              <Link to="/register" className="mt-8">
                <Button variant="outline" className="w-full text-xs font-bold py-2 text-white border-slate-700 hover:bg-slate-800">
                  {isRw ? "Tangiza Pro" : isFr ? "Activer Pro" : "Activate Pro"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section id="faqs" className="py-20 bg-white dark:bg-slate-900 border-t border-gray-150 dark:border-slate-805 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 select-none">
            <span className="text-[10px] font-mono tracking-widest text-emerald-600 dark:text-emerald-400 block uppercase font-bold">{t("landing.faq_badge")}</span>
            <h2 className="text-2xl md:text-3xl font-bold font-display mt-1 text-gray-950 dark:text-white uppercase leading-tight">
              {t("landing.faq_title")}
            </h2>
            <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
              {t("landing.faq_desc")}
            </p>
          </div>

          {/* FAQ Accordion List */}
          <div className="flex flex-col gap-4">
            {faqsData.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div 
                  key={faq.id} 
                  className="border border-gray-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden transition-all duration-150 shadow-xs"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-display font-bold text-xs md:text-sm text-gray-950 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-850 transition duration-150 focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <span className="ml-4 shrink-0 p-1 bg-slate-50 dark:bg-slate-805 rounded-full border border-gray-150 dark:border-slate-750">
                      {isOpen ? (
                        <Minus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 text-gray-400 dark:text-slate-400 shrink-0" />
                      )}
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-gray-600 dark:text-slate-350 leading-relaxed border-t border-gray-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/40">
                      {faq.answer}
                      
                      {/* Deep Comparison Matrix embedded on the last FAQ item dynamically */}
                      {faq.id === 7 && (
                        <div className="mt-4 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-xs">
                          <div className="p-4 bg-slate-50/50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                            <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                              {isRw ? "Imbonerahamwe y'Igereranya ry'Ibikoresho" : isFr ? "Matrice de comparaison détaillée des fonctionnalités" : "Deep Feature Comparison Matrix"}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {isRw ? "Genzura neza ibikoresho byemewe ku rwego rw'ifatabuguzi ryawe." : isFr ? "Analysez exactement quels modules techniques sont autorisés sur votre abonnement." : "Analyze exactly which technical modules are allowed on your plan tier."}
                            </p>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-gray-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900 font-bold text-gray-800 dark:text-white font-mono">
                                  <th className="p-3 w-1/3">
                                    {isRw ? "Ibiranga Ubushobozi" : isFr ? "Fonctionnalités de la plateforme" : "Feature Capabilities"}
                                  </th>
                                  <th className="p-3 text-center text-[10px]">{isRw ? "Ikigereranyo" : "Trial"}</th>
                                  <th className="p-3 text-center text-[10px]">{isRw ? "Igihe cyo Gutangira" : "Starter"}</th>
                                  <th className="p-3 text-center text-[10px]">{isRw ? "Ukwiyongera" : "Growth"}</th>
                                  <th className="p-3 text-center text-[10px]">Pro</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                                <tr className="hover:bg-gray-50 dark:hover:bg-slate-900/60 transition text-[11px]">
                                  <td className="p-2.5 font-bold text-gray-800 dark:text-slate-200">
                                    {isRw ? "Membres (kugeza)" : isFr ? "Membres (jusqu'à)" : "Members (up to)"}
                                  </td>
                                  <td className="p-2.5 text-center font-bold text-gray-950 dark:text-white">∞</td>
                                  <td className="p-2.5 text-center text-gray-700 dark:text-slate-300">100</td>
                                  <td className="p-2.5 text-center text-gray-700 dark:text-slate-300">500</td>
                                  <td className="p-2.5 text-center font-bold text-gray-950 dark:text-white">∞</td>
                                </tr>
                                
                                {[
                                  { name: isRw ? "Gucunga Abanyamuryango" : isFr ? "Gestion des membres" : "Member Management", trial: true, starter: true, growth: true, pro: true },
                                  { name: isRw ? "Ibikorwa + Kwandika hakoreshejwe QR" : isFr ? "Événements + Présence QR" : "Events + QR Attendance", trial: true, starter: true, growth: true, pro: true },
                                  { name: isRw ? "Amakuru & Amatangazo" : isFr ? "Actualités & Annonces" : "News & Announcements", trial: true, starter: true, growth: true, pro: true },
                                  { name: isRw ? "Intego Nyamukuru (kurikirana & gutangaza)" : isFr ? "Objectifs (suivre & publier)" : "Goals (track & publish)", trial: true, starter: true, growth: true, pro: true },
                                  { name: isRw ? "Inyandiko n'Impapuro" : isFr ? "Documents" : "Documents", trial: true, starter: true, growth: true, pro: true },
                                  { name: isRw ? "Urubuga rusange rw'umuryango (@slug)" : isFr ? "Page publique de l'ONG (@slug)" : "Public NGO Page (@slug)", trial: true, starter: true, growth: true, pro: true },
                                  { name: isRw ? "Igitabo cy'Imari bafata n'intoki" : isFr ? "Grand livre manuel" : "Manual Ledger", trial: true, starter: true, growth: true, pro: true },
                                  { name: isRw ? "Ibiganiro bitsinda n'umuntu ku giti cye" : isFr ? "Chat (groupe & direct)" : "Chat (group & direct)", trial: true, starter: false, growth: true, pro: true },
                                  { name: isRw ? "Amatora n'Imyanzuro" : isFr ? "Votes & Décisions" : "Votes & Decisions", trial: true, starter: false, growth: true, pro: true },
                                  { name: isRw ? "Porogaramu n'Ibyagezweho" : isFr ? "Programmes & Jalons" : "Programs & Milestones", trial: true, starter: false, growth: true, pro: true },
                                  { name: isRw ? "Inama n'Ibyemezo byazo" : isFr ? "Réunions + Comptes-rendus" : "Meetings + Minutes", trial: true, starter: false, growth: true, pro: true },
                                  { name: isRw ? "Ibipimo by'Umusaruro" : isFr ? "Indicateurs d'Impact" : "Impact Metrics", trial: true, starter: false, growth: true, pro: true },
                                  { name: isRw ? "Gukurikirana Ibihe by'Inkunga" : isFr ? "Suivi des échéances d'aide" : "Grant Deadline Tracker", trial: true, starter: false, growth: true, pro: true },
                                  { name: isRw ? "Ihuriro n'ibikorwa by'abaterankunga" : isFr ? "Portail des donateurs & campagnes" : "Donor Portal & campaigns", trial: true, starter: false, growth: false, pro: true },
                                  { name: isRw ? "Raporo z'Umusaruro mu buryo bwa PDF" : isFr ? "Générateur PDF de rapports annuels" : "Annual Report PDF Gen", trial: true, starter: false, growth: false, pro: true },
                                  { name: isRw ? "Indimi nyinshi (FR/RW/EN)" : isFr ? "Multi-langues (FR/RW)" : "Multi-language (FR/RW)", trial: true, starter: true, growth: true, pro: true },
                                  { name: isRw ? "Kugaragara ku Rutonde rw'Imiryango" : isFr ? "Inscription au registre des ONG" : "NGO Discovery Listing", trial: true, starter: true, growth: true, pro: true },
                                  { name: isRw ? "Ubufasha bw'isumbuye" : isFr ? "Support Prioritaire" : "Priority Support", trial: false, starter: false, growth: false, pro: true },
                                ].map((row, index) => (
                                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-900/60 transition text-[11px]">
                                    <td className="p-2.5 text-gray-600 dark:text-slate-355">{row.name}</td>
                                    <td className="p-2.5 text-center">
                                      {row.trial ? <Check className="h-3.5 w-3.5 text-emerald-600 mx-auto" /> : <span className="text-red-500 font-bold">✗</span>}
                                    </td>
                                    <td className="p-2.5 text-center">
                                      {row.starter ? <Check className="h-3.5 w-3.5 text-emerald-600 mx-auto" /> : <span className="text-red-500 font-bold">✗</span>}
                                    </td>
                                    <td className="p-2.5 text-center">
                                      {row.growth ? <Check className="h-3.5 w-3.5 text-emerald-600 mx-auto" /> : <span className="text-red-500 font-bold">✗</span>}
                                    </td>
                                    <td className="p-2.5 text-center">
                                      {row.pro ? <Check className="h-3.5 w-3.5 text-emerald-650 mx-auto" /> : <span className="text-red-500 font-bold">✗</span>}
                                    </td>
                                  </tr>
                                ))}

                                <tr className="hover:bg-gray-50 dark:hover:bg-slate-900/60 transition text-[11px]">
                                  <td className="p-2.5 font-bold text-gray-800 dark:text-slate-200">
                                    {isRw ? "Kubika (Space Limit)" : isFr ? "Limite de stockage" : "Storage Limit"}
                                  </td>
                                  <td className="p-2.5 text-center font-mono text-[10px] text-gray-504">500MB</td>
                                  <td className="p-2.5 text-center font-mono text-[10px] text-gray-504">1GB</td>
                                  <td className="p-2.5 text-center font-mono text-[10px] text-gray-504">5GB</td>
                                  <td className="p-2.5 text-center font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">20GB</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Still have questions? Block */}
          <div className="mt-12 bg-emerald-50/50 dark:bg-slate-900/60 border border-emerald-100/80 dark:border-slate-800 p-8 rounded-3xl text-center max-w-xl mx-auto select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
              {t("landing.contact_box_title")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
              {t("landing.contact_box_desc")}
            </p>
            <div className="mt-5">
              <Button
                onClick={() => {
                  setContactModalOpen(true);
                  setContactSuccess(false);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl transition cursor-pointer"
              >
                {t("landing.contact_box_btn")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Branded Navigation & Product-centric Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-850 pt-16 pb-8 px-6 md:px-12 select-none">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-slate-800 pb-12 mb-8">
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg className="h-7 w-7 text-emerald-500 shrink-0" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="35" r="25" stroke="currentColor" strokeWidth="8" />
                <circle cx="35" cy="65" r="25" stroke="currentColor" strokeWidth="8" />
                <circle cx="65" cy="65" r="25" stroke="currentColor" strokeWidth="8" />
                <polygon points="53,48 47,48 50,42" fill="#F59E0B" />
              </svg>
              <span className="font-display font-extrabold text-lg tracking-tight text-white uppercase">
                IMPACTO
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipping registered Rwandan cooperatives, local forest initiatives, and social welfare organizations with beautiful workspaces that verify impact digitally.
            </p>
            <span className="text-[10px] font-semibold text-slate-500 font-mono uppercase tracking-wide">
              Kigali Office • Rwanda
            </span>
          </div>

          {/* Module Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-display">Core Modules</span>
            <ul className="text-xs text-slate-400 flex flex-col gap-2 font-medium">
              <li><span className="hover:text-white transition cursor-pointer">Member CRM Directory</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Mobile Money Ledgers</span></li>
              <li><span className="hover:text-white transition cursor-pointer">QR Attendance Registers</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Annual Report Compiler</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Interactive Goals Tracker</span></li>
            </ul>
          </div>

          {/* Platform Directory Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-display">Verified Directory</span>
            <ul className="text-xs text-slate-400 flex flex-col gap-2 font-medium">
              <li><a href="#discovery" className="hover:text-white transition">Environments & Forestry</a></li>
              <li><a href="#discovery" className="hover:text-white transition">Education & Mentorship</a></li>
              <li><a href="#discovery" className="hover:text-white transition">Health Care Cooperatives</a></li>
              <li><a href="#discovery" className="hover:text-white transition">Social Action & Welfare</a></li>
              <li><a href="#discovery" className="hover:text-white transition">Enterprise Cooperatives</a></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-display">Get Support</span>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {t("landing.footer_desc")}
            </p>
            <button
              onClick={() => {
                setContactModalOpen(true);
                setContactSuccess(false);
              }}
              className="mt-1 w-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-3 rounded-xl transition duration-150 transform hover:scale-[1.02] text-center cursor-pointer select-none"
            >
              {t("landing.footer_btn")}
            </button>
            <div className="text-xs font-mono font-bold text-emerald-500 mt-1">
              support@impacto.org
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Multi-language support available in Kinyarwanda, English, and French.
            </p>
          </div>
        </div>

        {/* Lower copyright row */}
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <p>© 2026 Virellix Inc. All rights reserved. Registered trademark under Rwanda RDB.</p>
          <div className="flex gap-4 font-mono text-[10px] uppercase tracking-wider">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Rwandan SaaS Protocol</span>
          </div>
        </div>
      </footer>

      {/* Contact Support Modal */}
      <Modal open={contactModalOpen} onClose={() => setContactModalOpen(false)} title="Contact support & registration desk">
        {contactSuccess ? (
          <div className="flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in zoom-in duration-200">
            <span className="p-3 bg-emerald-50 dark:bg-slate-900/40 text-emerald-600 rounded-full mb-4">
              <Check className="h-6 w-6" />
            </span>
            <h3 className="font-display font-extrabold text-sm text-gray-900 dark:text-white uppercase">
              Message submitted successfully!
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mt-2 leading-relaxed">
              Murakoze! Your registration or system inquiry has been dispatched to our support managers in Kigali. We will follow up via email within 24 hours.
            </p>
            <Button
              className="mt-6 font-bold"
              onClick={() => {
                setContactModalOpen(false);
                setContactSuccess(false);
              }}
            >
              Back to landing page
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleFormspreeSubmit}
            className="flex flex-col gap-4 text-xs font-semibold"
          >
            <p className="text-gray-500 dark:text-slate-400 font-medium leading-relaxed mb-1">
              Have complex questions about setting up your NGO, custom local workflows, or Mobile Money integrations? Fill in the form and our team in Kigali will respond promptly.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 dark:text-slate-300">Full Name *</label>
              <Input
                type="text"
                name="name"
                placeholder="e.g. Jean Damascene"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
              <ValidationError field="name" prefix="Name" errors={formspreeState.errors} className="text-red-500 text-xxs mt-0.5" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 dark:text-slate-300">Email Address *</label>
              <Input
                type="email"
                name="email"
                placeholder="e.g. contact@cooperative.org"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
              <ValidationError field="email" prefix="Email" errors={formspreeState.errors} className="text-red-500 text-xxs mt-0.5" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 dark:text-slate-300">Subject (Optional)</label>
              <Input
                type="text"
                name="subject"
                placeholder="e.g. Setup support, Upgrade request"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
              />
              <ValidationError field="subject" prefix="Subject" errors={formspreeState.errors} className="text-red-500 text-xxs mt-0.5" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 dark:text-slate-300">Message / Inquiry *</label>
              <textarea
                name="message"
                placeholder="How can we help your social workspace?"
                required
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-850 rounded-xl p-3 text-xs outline-none focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-600 dark:focus:ring-emerald-400 transition min-h-[90px] resize-y text-gray-900 dark:text-white"
              />
              <ValidationError field="message" prefix="Message" errors={formspreeState.errors} className="text-red-500 text-xxs mt-0.5" />
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setContactModalOpen(false)}
                disabled={formspreeState.submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                disabled={formspreeState.submitting}
              >
                {formspreeState.submitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

// ==========================================
// 2. WHITE-LABELED PUBLIC NGO PROFILE PAGE
// ==========================================
export const OrgPublicPage: React.FC = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeOrg, activeMember, setActiveOrg } = useOrgStore();

  const cleanSlug = slug?.startsWith("@") ? slug.slice(1) : slug;

  const { data: org, isLoading: loadingOrg } = useOrganization(cleanSlug);
  const { data: news } = useNews(org?.id);
  const { data: goals } = useGoals(org?.id);
  const { data: donations } = useDonations(org?.id);
  const { data: activities } = useActivityLogs(org?.id);

  const [activeTab, setActiveTab] = useState("about");
  const [successMsg, setSuccessMsg] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Apply organization branding dynamically in head
  React.useEffect(() => {
    if (org) {
      const primary = org.primary_color || "#10b981";
      const secondary = org.secondary_color || "#ca8a04";
      document.documentElement.style.setProperty("--org-primary", primary);
      document.documentElement.style.setProperty("--org-primary-l", primary + "14");
      document.documentElement.style.setProperty("--org-secondary", secondary);
      document.documentElement.style.setProperty("--org-secondary-l", secondary + "14");
    }
  }, [org]);

  // Redirect selected tab if it is configured to be hidden
  React.useEffect(() => {
    if (activeTab === "goals" && org && !(org.show_goals_publicly ?? true)) {
      setActiveTab("about");
    }
    if (activeTab === "impact" && org && !(org.show_impact_publicly ?? true)) {
      setActiveTab("about");
    }
  }, [activeTab, org]);

  if (loadingOrg) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-955 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <span className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Building2 className="h-6 w-6 text-emerald-600 animate-spin" />
          </span>
          <span className="text-xs font-bold text-gray-500 tracking-wide">Retrieving NGO portal...</span>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-955 flex items-center justify-center">
        <EmptyState
          icon={<AlertCircle className="h-8 w-8 text-amber-500" />}
          title="NGO Portal Not Found"
          message="The slug or workspace you queried is currently unavailable or doesn't exist."
          action={<Link to="/"><Button>Return Home</Button></Link>}
        />
      </div>
    );
  }

  const isSuperadmin = user?.is_superadmin === true;
  const isMemberOrAdminOfThisOrg = activeOrg?.id === org?.id && activeMember !== null;
  const isAllowedToView = (org.public_page_enabled ?? true) || isSuperadmin || isMemberOrAdminOfThisOrg;

  if (!isAllowedToView) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-955 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xl flex flex-col items-center gap-5">
          <div className="h-16 w-16 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/10 text-amber-500 rounded-3xl flex items-center justify-center shadow-lg">
            <Lock className="h-8 w-8 animate-pulse" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold font-display leading-tight text-gray-901">NGO Portal is Private</h2>
            <p className="text-xs text-gray-400 leading-relaxed font-semibold">
              The workspace administrator of <span className="text-[var(--org-primary)] font-bold">@{org.slug}</span> has set the public portal visibility to private.
            </p>
          </div>
          <p className="text-xs text-slate-400 font-normal max-w-sm">
            If you are an active member or workspace administrator of this NGO, please sign in to your workspace dashboard to access resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2 select-none">
            {user ? (
              <Button onClick={() => navigate("/dashboard")} className="w-full font-bold">
                Go to Workspace Dashboard
              </Button>
            ) : (
              <>
                <Button onClick={() => navigate("/login")} className="w-full font-bold bg-[var(--org-primary)] hover:opacity-95">
                  Sign In to Workspace
                </Button>
                <Button onClick={() => navigate("/")} variant="outline" className="w-full font-bold">
                  Discover NGOs
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const defaultTaglines: Record<string, string> = {
    "Environment": "Preserving Rwanda's landscapes, promoting sustainable practices, and securing a green future.",
    "Education": "Expanding access to knowledge, empowering local schools, and building tomorrow's leaders.",
    "Health": "Providing equitable healthcare, public health training, and community wellness programs.",
    "Social Action": "Mobilizing civic action, supporting vulnerable groups, and cultivating social harmony.",
    "Enterprise": "Empowering local entrepreneurship, fostering trade cooperatives, and driving community wealth."
  };

  const tagline = org.tagline || defaultTaglines[org.org_category] || "Empowering community development and transparent impact tracking.";
  const description = org.description || `We are a registered community organization in Rwanda focused on ${org.org_category || 'development'}. Through transparent leadership, collaborative programs, and verified civic involvement, we strive to build sustainable, high-impact communities across our region. Join us, review our progress, or support our goals below.`;

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setSuccessMsg("Link copied to clipboard!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setSuccessMsg("Could not copy automatically.");
    }
  };

  const handleJoinRequest = () => {
    if (!user) {
      navigate("/register");
      return;
    }
    setSuccessMsg("Join request submitted! An administrator will review your email.");
    setShowJoinModal(false);
  };

  const confirmedDonors = donations?.filter((d) => d.status === "confirmed") || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-16 font-sans">
      <OrgBrandingHeader org={org} onShare={handleShare} onJoin={() => setShowJoinModal(true)} />

      {/* Quick alert */}
      {successMsg && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold rounded-lg flex items-center gap-2">
            <Check className="h-4.5 w-4.5" />
            {successMsg}
          </div>
        </div>
      )}

      {/* Dynamic Tabs list */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex gap-4 border-b pb-1 overflow-x-auto scrollbar-none font-display mb-6">
          <button
            onClick={() => setActiveTab("about")}
            className={`pb-3 text-xs md:text-sm font-bold border-b-2 hover:text-gray-900 transition shrink-0 ${
              activeTab === "about" ? "border-[var(--org-primary)] text-[var(--org-primary)]" : "border-transparent text-gray-500"
            }`}
          >
            About
          </button>
          {(org.show_goals_publicly ?? true) && (
            <button
              onClick={() => setActiveTab("goals")}
              className={`pb-3 text-xs md:text-sm font-bold border-b-2 hover:text-gray-900 transition shrink-0 ${
                activeTab === "goals" ? "border-[var(--org-primary)] text-[var(--org-primary)]" : "border-transparent text-gray-500"
              }`}
            >
              Goals
            </button>
          )}
          {(org.show_impact_publicly ?? true) && (
            <button
              onClick={() => setActiveTab("impact")}
              className={`pb-3 text-xs md:text-sm font-bold border-b-2 hover:text-gray-900 transition shrink-0 ${
                activeTab === "impact" ? "border-[var(--org-primary)] text-[var(--org-primary)]" : "border-transparent text-gray-500"
              }`}
            >
              Impact Log
            </button>
          )}
          <button
            onClick={() => setActiveTab("news")}
            className={`pb-3 text-xs md:text-sm font-bold border-b-2 hover:text-gray-900 transition shrink-0 ${
              activeTab === "news" ? "border-[var(--org-primary)] text-[var(--org-primary)]" : "border-transparent text-gray-500"
            }`}
          >
            News Feed
          </button>
          <button
            onClick={() => setActiveTab("donors")}
            className={`pb-3 text-xs md:text-sm font-bold border-b-2 hover:text-gray-900 transition shrink-0 ${
              activeTab === "donors" ? "border-[var(--org-primary)] text-[var(--org-primary)]" : "border-transparent text-gray-500"
            }`}
          >
            Wall of Donors
          </button>
        </div>

        {/* Tab content renders */}
        {activeTab === "about" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex flex-col gap-6">
              <Card title="Our Mission">
                <p className="text-sm text-gray-700 dark:text-slate-250 leading-relaxed font-medium">
                  {description}
                </p>
                {org.mission && (
                  <div className="mt-5 p-4 bg-[var(--org-primary-l)] rounded-xl border border-[var(--org-primary-l)]">
                    <span className="text-[10px] font-bold text-[var(--org-primary)] uppercase tracking-wider block font-display">Mission Statement</span>
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 mt-1 leading-snug">{org.mission}</p>
                  </div>
                )}
                {org.vision && (
                  <div className="mt-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block font-display">Vision Statement</span>
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 mt-1 leading-snug">{org.vision}</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar Contact Info */}
            <div className="flex flex-col gap-6">
              <Card title="Quick Info">
                <div className="flex flex-col gap-3 text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-2 text-gray-505">
                    <Building2 className="h-4.5 w-4.5 text-[var(--org-primary)]" />
                    <span className="text-gray-750 font-semibold">{org.org_category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-505">
                    <MapPin className="h-4.5 w-4.5 text-[var(--org-primary)]" />
                    <span className="text-gray-750">{org.location_name || "Kigali, Rwanda"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-505">
                    <Globe className="h-4.5 w-4.5 text-[var(--org-primary)]" />
                    <span className="text-gray-750 truncate font-semibold">impacto.org/@{org.slug}</span>
                  </div>

                  {org.contact_us && (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                      <span className="font-bold text-gray-800">Contact Us:</span>
                      {org.contact_us}
                    </div>
                  )}
                </div>
              </Card>

              {org.donations_enabled && (
                <Card title="Fuel the Workspace" className="text-center bg-gradient-to-tr from-[var(--org-primary)] to-[var(--org-secondary)] text-white">
                  <div className="flex flex-col items-center gap-3">
                    <Heart className="h-9 w-9 text-amber-400 fill-amber-400" />
                    <p className="text-xs text-white/90">MoMo Donations are active for this NGO workspace.</p>
                    <Link to={`/@${org.slug}/donate`} className="w-full mt-3">
                      <Button variant="secondary" className="w-full">
                        Donate Now
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Gallery if exists */}
        {activeTab === "about" && org.gallery_urls && org.gallery_urls.length > 0 && (
          <div className="mt-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold font-display text-gray-900 border-b pb-2">Organizational Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {org.gallery_urls.map((url, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden border bg-gray-100 dark:bg-slate-800 shadow-xs">
                  <img src={url} alt={`Gallery image ${idx + 1}`} className="h-full w-full object-cover hover:scale-105 transition duration-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "goals" && (
          <div className="flex flex-col gap-4">
            {goals && goals.length > 0 ? (
              goals.map((goal) => (
                <Card key={goal.id} title={goal.title}>
                  <p className="text-xs text-gray-500 mb-4">{goal.description}</p>
                  <ProgressBar value={goal.current_progress} max={goal.target} />
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-550 mt-3 pt-3 border-t">
                    <span>Target: <span className="text-gray-900 mono">{goal.target.toLocaleString()} {goal.unit}</span></span>
                    <span>Deadline: <span className="text-gray-901">
                      {new Date(goal.deadline).toLocaleDateString()}
                    </span></span>
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState title="No Goals Logged" message="This NGO workspace has not shared any public goals yet." />
            )}
          </div>
        )}

        {activeTab === "news" && (
          <div className="flex flex-col gap-6">
            {news && news.length > 0 ? (
              news.filter((post) => post.visibility === "public").map((post) => (
                <Card key={post.id} title={post.title} action={<Badge color="blue">{post.category}</Badge>} padding={false}>
                  {post.cover_url && (
                    <div className="h-48 w-full">
                      <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-sm font-semibold text-gray-800 leading-normal">{post.excerpt}</p>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-400 leading-none">
                      <span>Published: {new Date(post.published_at || "").toLocaleDateString()}</span>
                      <div className="flex gap-4">
                        <span>Likes: {post.likes_count}</span>
                        <span>Comments: {post.comments_count}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState title="No news postings" message="This organization has not posted any announcements recently." />
            )}
          </div>
        )}

        {activeTab === "donors" && (
          <div className="flex flex-col gap-4">
            <Card title="Certified Public Donor Wall">
              {confirmedDonors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {confirmedDonors.map((d) => (
                    <div key={d.id} className="p-4 bg-slate-50 dark:bg-slate-750 border rounded-xl flex gap-3 h-full">
                      <Avatar name={d.donor_name} size="xs" />
                      <div className="flex flex-col text-xs leading-normal">
                        <span className="font-bold text-gray-900 dark:text-white truncate">{d.donor_name}</span>
                        <span className="font-bold text-[var(--org-primary)] mt-0.5">{d.amount.toLocaleString()} RWF</span>
                        {d.message && <span className="text-gray-500 italic mt-2 font-medium leading-snug">"{d.message}"</span>}
                        <span className="text-[9px] text-gray-400 block mt-2 font-mono">{new Date(d.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No donors listed" message="Be the first supporter of this project by uploading your donation proof!" />
              )}
            </Card>
          </div>
        )}

        {activeTab === "impact" && (
          <div className="flex flex-col gap-4">
            {activities && activities.length > 0 ? (
              activities.map((act) => (
                <Card key={act.id} title={act.title} action={<Badge color="green">Logged Activity</Badge>}>
                  <div className="flex flex-col gap-2 mt-1">
                    <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 whitespace-pre-line">
                      {act.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 pt-3 border-t text-xs font-semibold text-gray-500">
                      {act.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-[var(--org-primary)]" />
                          <span>Location: <span className="text-gray-900 font-bold">{act.location}</span></span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-[var(--org-primary)]" />
                        <span>Date: <span className="text-gray-900">{new Date(act.activity_date).toLocaleDateString()}</span></span>
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState title="No Activities Logged Yet" message="This NGO workspace has not shared any public impact logs yet." />
            )}
          </div>
        )}
      </div>

      {/* Join US Modal */}
      <Modal open={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join NGO Workspace">
        <div className="flex flex-col gap-4 text-sm leading-relaxed">
          <p className="text-gray-500 text-xs">
            Apply to become an active community member of **{org.name}** workspace on Impacto. 
            Once approved, you will get access to full internal events calendars, documents tab, and localized member messaging boards.
          </p>
          <div className="flex items-center justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowJoinModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoinRequest}>
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Subcomponent: Org header
const OrgBrandingHeader: React.FC<{ org: Organization; onShare: () => void; onJoin: () => void }> = ({ org, onShare, onJoin }) => {
  const [logoErr, setLogoErr] = React.useState(false);
  const [coverErr, setCoverErr] = React.useState(false);

  const getCategoryCover = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "environment":
        return "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&q=80&w=1200";
      case "education":
        return "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=1200";
      case "health":
        return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200";
      case "social action":
      case "social_action":
        return "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200";
      case "enterprise":
        return "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200";
      default:
        return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200";
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "ORG";
  };

  const defaultTaglines: Record<string, string> = {
    "Environment": "Preserving Rwanda's landscapes, promoting sustainable practices, and securing a green future.",
    "Education": "Expanding access to knowledge, empowering local schools, and building tomorrow's leaders.",
    "Health": "Providing equitable healthcare, public health training, and community wellness programs.",
    "Social Action": "Mobilizing civic action, supporting vulnerable groups, and cultivating social harmony.",
    "Enterprise": "Empowering local entrepreneurship, fostering trade cooperatives, and driving community wealth."
  };

  const tagline = org.tagline || defaultTaglines[org.org_category] || "Empowering community development and transparent impact tracking.";

  return (
    <div className="bg-white dark:bg-slate-900 border-b select-none">
      {/* Cover picture */}
      <div className="h-48 md:h-64 w-full bg-indigo-50/50 relative overflow-hidden">
        {org.cover_url && !coverErr ? (
          <img 
            src={org.cover_url} 
            alt={org.name} 
            className="h-full w-full object-cover" 
            onError={() => setCoverErr(true)}
          />
        ) : (
          <div className="h-full w-full relative">
            <img 
              src={getCategoryCover(org.org_category)} 
              alt={org.name} 
              className="h-full w-full object-cover brightness-[0.85] contrast-[1.05]" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20" />
          </div>
        )}
        <Link 
          to="/" 
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 hover:bg-white dark:bg-slate-950/95 dark:hover:bg-slate-900 text-slate-850 dark:text-slate-100 text-xs font-bold px-3.5 py-2 rounded-full shadow-lg z-30 transition hover:scale-103 duration-150"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> Back to Home Page
        </Link>
      </div>

      {/* Main panel profile overlapping */}
      <div className="max-w-4xl mx-auto px-4 relative pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 -mt-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4.5">
          <div className="h-20 w-20 rounded-2xl bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-800 overflow-hidden shadow-lg shrink-0 flex items-center justify-center p-0.5 translate-y-3 md:translate-y-0.5 animate-in slide-in-from-bottom-2 duration-150">
            {org.logo_url && !logoErr ? (
              <img 
                src={org.logo_url} 
                alt={org.name} 
                className="h-full w-full object-cover rounded-xl" 
                onError={() => setLogoErr(true)}
              />
            ) : (
              <div 
                className="h-full w-full rounded-xl flex items-center justify-center text-white text-base md:text-lg font-extrabold select-none shadow-inner"
                style={{
                  background: `linear-gradient(135deg, var(--org-primary, #10b981) 0%, var(--org-secondary, #ca8a04) 100%)`
                }}
              >
                {getInitials(org.name)}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 select-none">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold font-display leading-tight text-gray-905 dark:text-white">
                {org.name}
              </h1>
              <Badge color={org.subscription_status === "active" ? "green" : "amber"} className="text-[9px] uppercase font-bold tracking-wider py-0 px-2 rounded-full">
                {org.subscription_status === "active" ? "Verified" : "Trial"}
              </Badge>
            </div>
            <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-slate-400 leading-none">
              {tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 select-none">
          <Button variant="outline" size="sm" icon={<Share2 className="h-4 w-4" />} onClick={onShare}>
            Share
          </Button>
          {(org.allow_public_joining ?? true) && (
            <Button size="sm" onClick={onJoin} className="bg-[var(--org-primary)] hover:opacity-90 border-transparent text-white font-bold h-9">
              Join Organization
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. INTEGRATED DONATION EXECUTION PAGE
// ==========================================
export const DonatePage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useLocalTranslation();

  const cleanSlug = slug?.startsWith("@") ? slug.slice(1) : slug;
  const { data: org, isLoading } = useOrganization(cleanSlug);
  const donationMutation = useCreateDonation();

  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [amount, setAmount] = useState<number>(5000);
  const [msg, setMsg] = useState("");
  const [momoMethod, setMomoMethod] = useState<"mtn" | "airtel">("mtn");
  const [proofSent, setProofSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const presets = [1000, 5000, 10000, 25000];

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorEmail || !amount) {
      setErrorMsg(t("Please fill in Name, Email and select Amount."));
      return;
    }

    try {
      await donationMutation.mutateAsync({
        org_id: org?.id || "",
        amount,
        donor_name: donorName,
        donor_email: donorEmail,
        message: msg,
        payment_method: momoMethod,
        proof_url: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=300" // Simulated premium upload
      });
      setProofSent(true);
    } catch {
      setErrorMsg(t("Failed to upload receipt record."));
    }
  };

  if (isLoading) return <div className="p-16 text-center text-sm">{t("Validating Portal...")}</div>;
  if (!org) return <div className="p-16 text-center text-sm">{t("Organization workspace is offline.")}</div>;

  if (!org.donations_enabled) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <EmptyState 
          title="Donations Not Active" 
          message="This organization currently has public donations disabled." 
          action={<Link to={`/@${org.slug}`}><Button>Return to Profile</Button></Link>}
        />
      </div>
    );
  }

  const momoNumber = momoMethod === "mtn" ? org.donation_mtn_number : org.donation_airtel_number;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-16 pt-8 px-4 font-sans select-none">
      <div className="w-full max-w-xl mx-auto flex flex-col gap-6 animate-in fade-in duration-150">
        <div className="flex items-center gap-3 border-b pb-4 mb-4">
          <Avatar name={org.name} size="xs" src={org.logo_url} />
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-gray-901 leading-none">{org.name}</span>
            <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">{t("Branded Donation System")}</span>
          </div>
        </div>

        {proofSent ? (
          <Card title={t("Donation Receipt Pending Approval")} className="text-center font-display flex flex-col items-center">
            <div className="p-3 bg-emerald-50 rounded-full text-emerald-600 mb-4 h-12 w-12 flex items-center justify-center">
              <FileCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base md:text-lg">{t("Donation Proof Submitted!")}</h3>
            <p className="text-xs text-gray-500 max-w-sm mt-2">
              {t("Our administration at")} **{org.name}** {t("has received your MTN/Airtel deposit slip. Your name will be approved and placed on our public wall within 1-2 hours.")}
            </p>
            <div className="flex gap-4 mt-8 w-full md:w-3/4 shrink-0 justify-center">
              <Button onClick={() => navigate(`/@${slug}`)} className="w-1/2">{t("Back to Profile")}</Button>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmitProof} className="flex flex-col gap-6">
            <Card title={t("MoMo Donation Options")}>
              {errorMsg && <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-150 font-semibold mb-4 leading-normal">{errorMsg}</div>}

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={t("Full Name (for Wall)")}
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder={t("e.g. Alphonse Nshuti")}
                  />
                  <Input
                    label={t("Email (Auditable)")}
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="alphonse@work.rw"
                  />
                </div>

                {/* Amount presets slider */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-750">{t("Donation Amount (RWF)")}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {presets.map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setAmount(p)}
                        className={`py-2 text-xs font-bold rounded-lg border transition ${
                          amount === p
                            ? "bg-[var(--org-primary)] border-[var(--org-primary)] text-white shadow"
                            : "bg-white border-gray-250 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 w-full">
                    <Input
                      type="number"
                      placeholder={t("Or enter custom amount in RWF")}
                      value={amount || ""}
                      onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <Input
                  label={t("Optional message")}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder={t("e.g. Keep up the high effort reforestation guides!")}
                />
              </div>
            </Card>

            {/* Merchant info */}
            <Card title={t("Rwandan Mobile Money Instructions")}>
              <div className="flex flex-col gap-4 text-xs font-medium">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMomoMethod("mtn")}
                    className={`p-3.5 border rounded-xl font-bold font-display flex flex-col items-center gap-1.5 transition ${
                      momoMethod === "mtn"
                        ? "border-[#15803D] bg-emerald-50/40 text-[#15803D]"
                        : "border-gray-250 bg-white"
                    }`}
                  >
                    {t("MTN Mobile Money")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMomoMethod("airtel")}
                    className={`p-3.5 border rounded-xl font-bold font-display flex flex-col items-center gap-1.5 transition ${
                      momoMethod === "airtel"
                        ? "border-[#15803D] bg-emerald-50/40 text-[#15803D]"
                        : "border-gray-250 bg-white"
                    }`}
                  >
                    {t("Airtel Money")}
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-750 border rounded-xl flex flex-col gap-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-450 leading-none">{t("Registered Name:")}</span>
                    <span className="font-bold text-gray-901">{org.donation_account_name || org.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-450 leading-none">{t("Registered Number:")}</span>
                    <span className="font-mono font-bold text-emerald-650">{momoNumber || t("Not Configured")}</span>
                  </div>
                  <div className="flex justify-between items-center leading-none">
                    <span className="text-gray-450">{t("Estimated confirm window:")}</span>
                    <span className="font-semibold text-slate-700">{t("Instant — 2 hours")}</span>
                  </div>
                </div>

                {/* Dial instructions */}
                <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-[11px] leading-relaxed select-none">
                  <span className="font-bold text-amber-900 block">{t("Dial to Deposit Instructions:")}</span>
                  {t("Dial")} <span className="font-bold font-mono text-gray-901">*182#</span> {t("on your mobile device. Pay Amount of")} **{amount.toLocaleString()} RWF** {t("directly to merchant code/phone listed above.")} 
                  {t("Capture a digital screenshot of your MoMo receipt and attach it below as a pledge.")}
                </div>

                {/* Capture block */}
                <div className="flex flex-col gap-1.5 mt-3 self-start">
                  <span className="text-xs font-semibold">{t("Upload Receipt Proof (Screenshot)")}</span>
                  <div className="border border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-slate-800 flex flex-col items-center justify-center cursor-pointer text-center relative select-none">
                    <Camera className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-xs font-bold text-gray-700">momo_slip_receipt.png</span>
                    <span className="text-[10px] text-gray-400 mt-1">{t("Uploaded successfully — Attached")}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Button type="submit" loading={donationMutation.isPending} className="w-full py-3 text-sm font-bold shadow-md">
              {t("Submit Donation Slip")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. EVENT CHECK-IN SCREEN (@slug/checkin)
// ==========================================
export const EventCheckinPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const cleanSlug = slug?.startsWith("@") ? slug.slice(1) : slug;
  const checkinMutation = useCheckIn();
  const { data: org } = useOrganization(cleanSlug);
  const { data: events } = useEvents(org?.id);

  const [selectedEventId, setSelectedEventId] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSelfCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      setErrorMsg("Please select an event to check in.");
      return;
    }

    try {
      await checkinMutation.mutateAsync({
        event_id: selectedEventId,
        member_id: "member-2", // Mock standard user member-2 checking in
        method: "self"
      });
      setSuccess(true);
    } catch {
      setErrorMsg("Check in failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <Card title="Mobile Event Check-In" className="w-full max-w-md">
        {success ? (
          <div className="text-center flex flex-col items-center gap-3">
            <span className="p-3 bg-emerald-100 rounded-full text-emerald-600 mb-2">
              <FileCheck className="h-6 w-6" />
            </span>
            <h3 className="font-bold text-gray-900 text-base md:text-lg">Checked In Successfully!</h3>
            <p className="text-xs text-gray-500">Your presence has been successfully saved to our attendance logs.</p>
            <Button onClick={() => navigate(`/@${slug}`)} className="mt-4">
              Return to Profile
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSelfCheckin} className="flex flex-col gap-4">
            <p className="text-xs text-gray-500 mb-2">
              Select which event or session you are attending currently.
            </p>

            {errorMsg && <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-150 font-semibold mb-4 leading-normal">{errorMsg}</div>}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-750">Active Sessions</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 px-3.5 py-2.5 text-gray-805 outline-none focus:ring-2 focus:ring-[var(--org-primary)] transition"
              >
                <option value="">-- Select Active Session --</option>
                {events?.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({new Date(ev.date_time).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" loading={checkinMutation.isPending} className="w-full mt-4">
              Self Check-In Presence
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};
