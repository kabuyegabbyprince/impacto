import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { KeyRound, Mail, User as UserIcon, Building2, ChevronRight, CornerDownRight, Landmark, ArrowLeft, ChevronLeft, Check, Sparkles, Globe, Search, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useOrgStore } from "../store/orgStore";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { useOrganizations, useMembers } from "../hooks/useImpactoData";
import { Button, Input, Card, Badge, Avatar } from "../components/ui";
import { MockDB } from "../lib/mockData";

// ==========================================
// 1. LOGIN PAGE
// ==========================================
export const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser, setSession } = useAuthStore();
  const { setActiveOrg } = useOrgStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isSupabaseConfigured) {
        const { data, error: sError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (sError) throw sError;

        // Fetch users record
        const { data: dbUser, error: uError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user?.id)
          .single();
        if (uError) throw uError;

        setUser(dbUser);
        setSession(data.session);

        if (dbUser.is_superadmin) {
          navigate("/platform/admin");
          return;
        }

        // Fetch active memberships
        const { data: members, error: mError } = await supabase
          .from("org_members")
          .select("*, organizations(*)")
          .eq("user_id", dbUser.id)
          .eq("status", "active");
        if (mError) throw mError;

        if (!members || members.length === 0) {
          setError("No active memberships in any NGO workspace. Contact your administrator.");
          return;
        }

        if (members.length === 1) {
          setActiveOrg(members[0].organizations, members[0]);
          navigate("/dashboard");
        } else {
          navigate("/org-picker");
        }
      } else {
        // DEMO RUN
        await new Promise((res) => setTimeout(res, 800));
        const demoUsers = MockDB.getUsers();
        const matched = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (!matched) {
          setError("Invalid design demo credentials. Try 'admin@impacto.org' or 'member@impacto.org' or 'superadmin@impacto.org'.");
          setLoading(false);
          return;
        }

        setUser(matched);
        setSession({ token: "demo" });

        if (matched.is_superadmin) {
          navigate("/platform/admin");
          return;
        }

        // membership
        const matchedMemberRows = MockDB.getMembers().filter((m) => m.user_id === matched.id && m.status === "active");
        if (matchedMemberRows.length === 0) {
          setError("Your member profile is currently waiting for NGO approval.");
          setLoading(false);
          return;
        }

        if (matchedMemberRows.length === 1) {
          const org = MockDB.getOrgs().find((o) => o.id === matchedMemberRows[0].org_id) || null;
          setActiveOrg(org, matchedMemberRows[0]);
          navigate("/dashboard");
        } else {
          navigate("/org-picker");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center flex flex-col items-center select-none">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold mb-6 select-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3.5 py-1.5 rounded-full shadow-xs duration-150 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home Page
          </Link>
          {/* Logo Knot */}
          <svg className="h-14 w-14 text-emerald-600 mb-4" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="35" r="25" stroke="currentColor" strokeWidth="8" />
            <circle cx="35" cy="65" r="25" stroke="currentColor" strokeWidth="8" />
            <circle cx="65" cy="65" r="25" stroke="currentColor" strokeWidth="8" />
            <polygon points="53,48 47,48 50,42" fill="#F59E0B" />
          </svg>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-gray-905 dark:text-white">
            IMPACTO
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1.5 max-w-sm">
            NGO Branded Workspace & SaaS Portal
          </p>
        </div>

        <Card title="Account Sign In">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-150 rounded-lg text-xs font-semibold text-red-600 leading-snug">
                {error}
              </div>
            )}

            <Input
              type="email"
              label={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@impacto.org"
              prefixIcon={<Mail className="h-4 w-4 text-gray-400" />}
              autoFocus
            />

            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  {t("auth.password")}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[var(--org-primary)] hover:underline"
                >
                  {t("auth.forgot_pass")}
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                prefixIcon={<KeyRound className="h-4 w-4 text-gray-400" />}
              />
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2 py-2.5">
              {t("auth.login")}
            </Button>
          </form>

        
        </Card>

        <div className="text-center text-xs font-semibold text-gray-500">
          <Link to="/register" className="hover:underline text-[var(--org-primary)]">
            {t("auth.no_account")}
          </Link>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. REGISTER PAGE
// ==========================================
export const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: orgs, isLoading: isLoadingOrgs } = useOrganizations();
  const { setUser, setSession } = useAuthStore();
  const { setActiveOrg } = useOrgStore();

  const [mode, setMode] = useState<"participant" | "ngo">("participant");
  const [ngoStep, setNgoStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Participant Account Fields
  const [partName, setPartName] = useState("");
  const [partEmail, setPartEmail] = useState("");
  const [partPassword, setPartPassword] = useState("");
  const [partSelectedOrg, setPartSelectedOrg] = useState("");

  // NGO Workspace Details - Step 1
  const [orgName, setOrgName] = useState("");
  const [orgCategory, setOrgCategory] = useState("Environment");
  const [orgTagline, setOrgTagline] = useState("");

  // NGO Workspace Admin Credentials - Step 2
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Helper to generate slug in real-time
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric except spaces/hyphens
      .trim()
      .replace(/\s+/g, "-") // replace spaces with hyphens
      .replace(/-+/g, "-"); // remove double hyphens
  };

  const generatedSlug = generateSlug(orgName);

  const handleParticipantRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName || !partEmail || !partPassword || !partSelectedOrg) {
      setError("Please fill in all core fields and choose an NGO Workspace.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isSupabaseConfigured) {
        // Sign-up with full name metadata
        const { data, error: sError } = await supabase.auth.signUp({
          email: partEmail,
          password: partPassword,
          options: {
            data: { full_name: partName }
          }
        });
        if (sError) throw sError;

        // Insert/Upsert custom user record
        const { error: dbError } = await supabase.from("users").upsert({
          id: data.user?.id,
          email: partEmail,
          full_name: partName,
          is_superadmin: false
        });
        if (dbError) throw dbError;

        // If organization selected
        if (partSelectedOrg) {
          const { error: memberErr } = await supabase.from("org_members").insert({
            org_id: partSelectedOrg,
            user_id: data.user?.id,
            role: "member",
            status: "pending",
            joined_at: new Date().toISOString()
          });
          if (memberErr) throw memberErr;
        }

        // Auto sign in client-side
        const { data: dbUser } = await supabase.from("users").select("*").eq("id", data.user?.id).single();
        if (dbUser) {
          setUser(dbUser);
          setSession(data.session);
          navigate("/org-picker");
        } else {
          navigate("/login");
        }
      } else {
        // DEMO RUN
        await new Promise((res) => setTimeout(res, 800));
        const users = MockDB.getUsers();
        
        if (users.some((u) => u.email.toLowerCase() === partEmail.toLowerCase())) {
          setError("Email is already registered on this platform.");
          setLoading(false);
          return;
        }

        const newUser = {
          id: "user-" + Math.random().toString(36).substr(2, 9),
          email: partEmail,
          full_name: partName,
          is_superadmin: false,
          created_at: new Date().toISOString()
        };
        users.push(newUser);
        MockDB.saveUsers(users);

        if (partSelectedOrg) {
          const members = MockDB.getMembers();
          members.push({
            id: "member-" + Math.random().toString(36).substr(2, 9),
            org_id: partSelectedOrg,
            user_id: newUser.id,
            role: "member",
            status: "pending",
            joined_at: new Date().toISOString()
          });
          MockDB.saveMembers(members);
        }

        // Automatically log them in so they can launch their portal picker
        setUser(newUser);
        setSession({ token: "demo" });
        navigate("/org-picker");
      }
    } catch (err: any) {
      setError(err.message || "Failed to register participant account.");
    } finally {
      setLoading(false);
    }
  };

  const handleNgoRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ngoStep === 1) {
      if (!orgName || !orgTagline) {
        setError("Please enter both an Organization Name and Tagline.");
        return;
      }
      setError("");
      setNgoStep(2);
      return;
    }

    if (!adminName || !adminEmail || !adminPassword) {
      setError("Please fill in all Admin account credentials.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const slug = generatedSlug;
      if (!slug) {
        throw new Error("Invalid organization name. Could not generate URL slug.");
      }

      if (isSupabaseConfigured) {
        const { data, error: sError } = await supabase.auth.signUp({
          email: adminEmail,
          password: adminPassword,
          options: {
            data: { full_name: adminName }
          }
        });
        if (sError) throw sError;

        // Insert/Upsert database user record
        const { error: dbUserErr } = await supabase.from("users").upsert({
          id: data.user?.id,
          email: adminEmail,
          full_name: adminName,
          is_superadmin: false
        });
        if (dbUserErr) throw dbUserErr;

        // Insert organization
        const { data: newDbOrg, error: orgErr } = await supabase.from("organizations").insert({
          name: orgName,
          slug: slug,
          tagline: orgTagline,
          description: orgTagline,
          org_category: orgCategory,
          primary_color: "#16a34a",
          secondary_color: "#ca8a04",
          subscription_status: "trial",
          donations_enabled: true
        }).select().single();
        if (orgErr) throw orgErr;

        // Insert Admin membership
        const { data: newDbMember, error: memberErr } = await supabase.from("org_members").insert({
          org_id: newDbOrg.id,
          user_id: data.user?.id,
          role: "org_admin",
          status: "active"
        }).select().single();
        if (memberErr) throw memberErr;

        // Set state & push to dashboard
        setUser({
          id: data.user?.id || "",
          email: adminEmail,
          full_name: adminName,
          is_superadmin: false,
          created_at: new Date().toISOString()
        });
        setSession(data.session);
        setActiveOrg(newDbOrg, newDbMember);
        navigate("/dashboard");
      } else {
        // DEMO RUN
        await new Promise((res) => setTimeout(res, 800));
        const users = MockDB.getUsers();
        const orgsList = MockDB.getOrgs();

        if (users.some((u) => u.email.toLowerCase() === adminEmail.toLowerCase())) {
          setError("Administrator email address is already registered.");
          setLoading(false);
          return;
        }

        if (orgsList.some((o) => o.slug.toLowerCase() === slug.toLowerCase())) {
          setError(`NGO website slug "@${slug}" is already taken. Choose another Organization Name.`);
          setLoading(false);
          setNgoStep(1); // Go back to correct the name
          return;
        }

        const newOrg = {
          id: "org-" + Math.random().toString(36).substr(2, 9),
          name: orgName,
          slug: slug,
          tagline: orgTagline,
          description: orgTagline,
          mission: `Unlocking positive communal transformation in Rwanda within the focus of ${orgCategory}.`,
          vision: `A fully transparent, digitalized, and audited community workspace on Impacto.`,
          logo_url: "",
          cover_url: "",
          primary_color: "#16a34a",
          secondary_color: "#ca8a04",
          language: "en" as const,
          auto_confirm_members: true,
          donations_enabled: true,
          donation_mtn_number: "0788100120",
          donation_airtel_number: "0733100120",
          donation_account_name: orgName,
          donation_description: `Support our strategic action in Rwanda's ${orgCategory} field.`,
          subscription_status: "trial" as const,
          subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 day trial
          org_category: orgCategory,
          created_at: new Date().toISOString()
        };

        const newUser = {
          id: "user-" + Math.random().toString(36).substr(2, 9),
          email: adminEmail,
          full_name: adminName,
          is_superadmin: false,
          created_at: new Date().toISOString()
        };

        const newMember = {
          id: "member-" + Math.random().toString(36).substr(2, 9),
          org_id: newOrg.id,
          user_id: newUser.id,
          role: "org_admin" as const,
          status: "active" as const,
          joined_at: new Date().toISOString()
        };

        // Persist records
        orgsList.push(newOrg);
        users.push(newUser);
        const membersList = MockDB.getMembers();
        membersList.push(newMember);

        MockDB.saveOrgs(orgsList);
        MockDB.saveUsers(users);
        MockDB.saveMembers(membersList);

        // Prepopulate general announcement channels
        const channelsList = MockDB.getChannels();
        const chanAnnounce = { id: `chan-ann-${newOrg.id}`, org_id: newOrg.id, name: "general-announcements", type: "announcement" as const, created_by: newUser.id };
        const chanChat = { id: `chan-chat-${newOrg.id}`, org_id: newOrg.id, name: "member-chat", type: "group" as const, created_by: newUser.id };
        channelsList.push(chanAnnounce, chanChat);
        MockDB.saveChannels(channelsList);

        const msgsList = MockDB.getMessages();
        msgsList.push({
          id: `msg-seed-${newOrg.id}`,
          channel_id: chanChat.id,
          sender_id: newUser.id,
          text: `Welcome to the private chat space of ${newOrg.name}. This channel is locked to authorized local members.`,
          created_at: new Date().toISOString(),
          sender_name: newUser.full_name,
          sender_avatar: ""
        });
        MockDB.saveMessages(msgsList);

        // Set Store to auto login
        setUser(newUser);
        setSession({ token: "demo" });
        setActiveOrg(newOrg, newMember);

        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to launch workspace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <div className="text-center flex flex-col items-center select-none">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold mb-6 select-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3.5 py-1.5 rounded-full shadow-xs duration-150 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home Page
          </Link>
          <svg className="h-10 w-10 text-emerald-600 mb-2" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="35" r="25" stroke="currentColor" strokeWidth="8" />
            <circle cx="35" cy="65" r="25" stroke="currentColor" strokeWidth="8" />
            <circle cx="65" cy="65" r="25" stroke="currentColor" strokeWidth="8" />
            <polygon points="53,48 47,48 50,42" fill="#F59E0B" />
          </svg>
          <h1 className="text-2xl font-extrabold tracking-tight font-display text-gray-900 dark:text-white">
            Get Started on Impacto
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Launch your community cooperative or apply to join an active local program.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-slate-900 rounded-xl max-w-md mx-auto w-full select-none">
          <button
            onClick={() => {
              setMode("participant");
              setError("");
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "participant"
                ? "bg-white dark:bg-slate-850 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-slate-300"
            }`}
          >
            Create Participant Account
          </button>
          <button
            onClick={() => {
              setMode("ngo");
              setError("");
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "ngo"
                ? "bg-white dark:bg-slate-855 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-slate-300"
            }`}
          >
            Create NGO Workspace
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-150 rounded-lg text-xs text-red-600 font-semibold leading-normal max-w-md mx-auto w-full">
            {error}
          </div>
        )}

        {/* 1. PARTICIPANT VIEW */}
        {mode === "participant" && (
          <Card title="Participant Registration" className="max-w-md mx-auto w-full">
            <p className="text-xs text-gray-500 mb-4 font-medium leading-relaxed">
              Create an account to participate in active agricultural, green, and health cooperatives across Rwanda.
            </p>
            <form onSubmit={handleParticipantRegister} className="flex flex-col gap-4">
              <Input
                type="text"
                label={t("auth.full_name")}
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder="Marie-Louise Mukamana"
                prefixIcon={<UserIcon className="h-4 w-4 text-gray-400" />}
                required
                autoFocus
              />

              <Input
                type="email"
                label={t("auth.email")}
                value={partEmail}
                onChange={(e) => setPartEmail(e.target.value)}
                placeholder="marie@gmail.com"
                prefixIcon={<Mail className="h-4 w-4 text-gray-400" />}
                required
              />

              <Input
                type="password"
                label={t("auth.password")}
                value={partPassword}
                onChange={(e) => setPartPassword(e.target.value)}
                placeholder="••••••••"
                prefixIcon={<KeyRound className="h-4 w-4 text-gray-400" />}
                required
              />

              {/* Required NGO application picker */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                  Select NGO Workspace to Request Access <span className="text-red-500">*</span>
                </label>
                <select
                  value={partSelectedOrg}
                  onChange={(e) => setPartSelectedOrg(e.target.value)}
                  required
                  className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 px-3.5 py-2.5 text-gray-805 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  <option value="">{isLoadingOrgs ? "Loading organizations..." : "-- Select NGO Workspace --"}</option>
                  {orgs?.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.org_category})
                    </option>
                  ))}
                </select>
                {partSelectedOrg && (
                  <div className="p-2.5 bg-blue-50/50 rounded border border-blue-100 text-[10px] text-blue-800 leading-snug">
                     Your profile will start as **Pending** inside this workspace. An administrator must approve your access before launch.
                  </div>
                )}
              </div>

              <Button type="submit" loading={loading} className="w-full mt-2 py-2.5 bg-emerald-700 hover:bg-emerald-850">
                Register Participant File
              </Button>
            </form>
          </Card>
        )}

        {/* 2. NGO REGISTER VIEW */}
        {mode === "ngo" && (
          <Card
            title={ngoStep === 1 ? "NGO Setup: Step 1 of 2" : "NGO Setup: Step 2 of 2"}
            className="max-w-md mx-auto w-full"
          >
            {/* Step Indicators */}
            <div className="flex gap-2 mb-5 select-none">
              <div className={`h-1.5 flex-1 rounded-full ${ngoStep >= 1 ? "bg-emerald-600" : "bg-gray-200"}`} />
              <div className={`h-1.5 flex-1 rounded-full ${ngoStep >= 2 ? "bg-emerald-600" : "bg-gray-200"}`} />
            </div>

            <form onSubmit={handleNgoRegister} className="flex flex-col gap-4">
              {ngoStep === 1 ? (
                <>
                  <div className="p-3 bg-emerald-50/60 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-xl mb-1 text-xs text-gray-600 dark:text-slate-350 leading-relaxed font-semibold">
                    Register a new NGO Workspace. The system will automatically build a public profile at impacto.org/{`@${generatedSlug || "slug"}`} which anyone can view.
                  </div>

                  <Input
                    type="text"
                    label="Organization (NGO) Name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Rwanda Green Initiative"
                    prefixIcon={<Building2 className="h-4 w-4 text-gray-400" />}
                    required
                    autoFocus
                  />

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                      Organization Category
                    </label>
                    <select
                      value={orgCategory}
                      onChange={(e) => setOrgCategory(e.target.value)}
                      className="w-full text-sm rounded-lg border bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 px-3.5 py-2.5 text-gray-805 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    >
                      <option value="Environment">Environment & Forestry</option>
                      <option value="Education">Education & Tech Mentoring</option>
                      <option value="Health">Health & Sanitization</option>
                      <option value="Social Action">Social Action & Welfare</option>
                      <option value="Enterprise">Enterprise Cooperative</option>
                    </select>
                  </div>

                  <Input
                    type="text"
                    label="Brief Description (Tagline)"
                    value={orgTagline}
                    onChange={(e) => setOrgTagline(e.target.value)}
                    placeholder="e.g. Enhancing biodiversity in Kayonza hills"
                    required
                  />

                  {/* Public Page Slug Preview Box */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                      Dynamic URL Preview
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                      <Globe className="h-3.5 w-3.5 shrink-0" />
                      <span>impacto.org/{generatedSlug ? `@${generatedSlug}` : "..."}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed leading-normal">
                      The public will see your active programs, achievements, and donate button at this page. Note: Only verified administrators can access the secure backend workspace.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      if (!orgName || !orgTagline) {
                        setError("Please enter both an Organization Name and Tagline.");
                        return;
                      }
                      setError("");
                      setNgoStep(2);
                    }}
                    className="w-full mt-2 py-2.5 flex items-center justify-center gap-1.5"
                  >
                    Next: Admin Account Credentials <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="p-3 bg-emerald-50/60 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-xl mb-1 text-xs text-gray-600 dark:text-slate-350 leading-relaxed font-semibold">
                    Set up the owner administrator credentials. This login will have access to the Private Workspace backend, ledger bookkeeping, and configuration settings.
                  </div>

                  <Input
                    type="text"
                    label="Administrator's Full Name"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Anatole Mugisha"
                    prefixIcon={<UserIcon className="h-4 w-4 text-gray-400" />}
                    required
                    autoFocus
                  />

                  <Input
                    type="email"
                    label="Administrative Contact Email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="e.g. admin@yourorg.rw"
                    prefixIcon={<Mail className="h-4 w-4 text-gray-400" />}
                    required
                  />

                  <Input
                    type="password"
                    label="Security Password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    prefixIcon={<KeyRound className="h-4 w-4 text-gray-400" />}
                    required
                  />

                  {/* Summary Recipe Card */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl flex flex-col gap-2 text-xs font-medium">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                      Verification Summary
                    </span>
                    <div className="flex justify-between">
                      <span className="text-gray-450">NGO Workspace:</span>
                      <span className="font-bold text-gray-800 dark:text-slate-200">{orgName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-455">Category Focus:</span>
                      <span className="font-bold text-gray-800 dark:text-slate-200">{orgCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-450">Representative role:</span>
                      <span className="font-bold text-emerald-600">Workspace Administrator</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2 select-none">
                    <Button type="submit" loading={loading} className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-850">
                      Complete & Launch NGO Workspace
                    </Button>
                    <button
                      type="button"
                      onClick={() => setNgoStep(1)}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-slate-300 py-1 flex items-center justify-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous: Edit Workspace Details
                    </button>
                  </div>
                </>
              )}
            </form>
          </Card>
        )}

        <div className="text-center text-xs font-semibold text-gray-500">
          <Link to="/login" className="hover:underline text-[var(--org-primary)]">
            {t("auth.have_account")}
          </Link>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. ORGANIZATIONS PICKER (Multi-membership)
// ==========================================
export const OrgPicker: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { setActiveOrg } = useOrgStore();
  const { data: orgs, isLoading } = useOrganizations();

  // Search input query for available NGOs
  const [searchQuery, setSearchQuery] = useState("");

  // All memberships state of current user to allow real-time request mutations
  const [memberships, setMemberships] = useState<any[]>(() => {
    if (!user) return [];
    return MockDB.getMembers().filter((m) => m.user_id === user.id);
  });

  const handleSelect = (memberRow: any) => {
    const org = orgs?.find((o) => o.id === memberRow.org_id) || MockDB.getOrgs().find((o) => o.id === memberRow.org_id) || null;
    setActiveOrg(org, memberRow);
    navigate("/dashboard");
  };

  const handleApplyJoin = (orgId: string) => {
    if (!user) return;
    
    const members = MockDB.getMembers();
    // Prevent double applications
    if (members.some(m => m.user_id === user.id && m.org_id === orgId)) {
      return;
    }

    const newMemberRow = {
      id: "member-" + Math.random().toString(36).substr(2, 9),
      org_id: orgId,
      user_id: user.id,
      role: "member" as const,
      status: "pending" as const,
      joined_at: new Date().toISOString()
    };

    members.push(newMemberRow);
    MockDB.saveMembers(members);

    // Update state to re-render directories instantly
    setMemberships([...memberships, newMemberRow]);
  };

  const handleLeaveOrCancel = (memberId: string) => {
    const list = MockDB.getMembers().filter(m => m.id !== memberId);
    MockDB.saveMembers(list);
    setMemberships(list.filter(m => m.user_id === user?.id));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-500 animate-pulse">Loading NGO roster...</span>
      </div>
    );
  }

  const activeMemberships = memberships.filter((m) => m.status === "active");
  const pendingMemberships = memberships.filter((m) => m.status === "pending");

  // Filter orgs you haven't applied to yet
  const appliedOrgIds = new Set(memberships.map(m => m.org_id));
  const availableOrgs = orgs?.filter(org => !appliedOrgIds.has(org.id)) || [];

  // Filter based on searchQuery
  const filteredOrgs = availableOrgs.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    org.org_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl flex flex-col gap-6 my-8">
        <div className="text-center flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-gray-950 dark:text-white">
            Workspace Hub
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Hello, <strong className="text-emerald-700 dark:text-emerald-400">{user?.full_name}</strong>. Choose an active workspace, check pending applications, or apply to other verified NGOs.
          </p>
        </div>

        {/* 1. ACTIVE MEMBERSHIPS */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none select-none">
            Active Workspaces ({activeMemberships.length})
          </h3>
          {activeMemberships.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full select-none">
              {activeMemberships.map((row) => {
                const org = orgs?.find((o) => o.id === row.org_id);
                if (!org) return null;

                return (
                  <div
                    key={row.id}
                    onClick={() => handleSelect(row)}
                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5 rounded-2xl shadow-xs hover:border-emerald-600 focus:ring-2 focus:ring-emerald-500 hover:shadow-md transition cursor-pointer flex flex-col gap-4 group justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-lg overflow-hidden shrink-0 bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        {org.logo_url ? (
                          <img src={org.logo_url} alt={org.name} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-5 w-5 text-emerald-600" />
                        )}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="font-display font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {org.name}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-0.5">
                          {org.org_category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-150 dark:border-slate-750 pt-3">
                      <Badge color={row.role === "org_admin" ? "amber" : "blue"}>
                        {row.role === "org_admin" ? "Admin" : "Member"}
                      </Badge>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center group-hover:underline font-bold gap-0.5 transition">
                        Launch <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border text-center select-none text-xs font-semibold text-gray-400">
              No active workspace affiliations yet. See your pending items or browse options below.
            </div>
          )}
        </div>

        {/* 2. PENDING APPLICATIONS */}
        {pendingMemberships.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest leading-none select-none">
              Pending Applications ({pendingMemberships.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {pendingMemberships.map((row) => {
                const org = orgs?.find((o) => o.id === row.org_id);
                if (!org) return null;

                return (
                  <div
                    key={row.id}
                    className="bg-amber-50/40 dark:bg-slate-900/50 border border-amber-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg shrink-0 bg-amber-50 dark:bg-slate-850 flex items-center justify-center border border-amber-100">
                        <Building2 className="h-4 w-4 text-amber-650" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="font-display font-medium text-xs text-gray-800 dark:text-slate-100 truncate">
                          {org.name}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                          {org.org_category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-amber-100/50 dark:border-slate-800">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-md text-[10px] font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Pending approval
                      </span>
                      <button
                        onClick={() => handleLeaveOrCancel(row.id)}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline"
                      >
                        Retract Request
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. SEARCHABLE DIRECTORY */}
        <div className="flex flex-col gap-4 border-t border-gray-200 dark:border-slate-800 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none select-none">
                Discover NGOs in Rwanda
              </h3>
              <p className="text-[11px] text-gray-400 mt-1 select-none">
                Submit an integration request or request to join work pools.
              </p>
            </div>
            {/* Search Input */}
            <div className="relative w-full sm:w-64 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search NGO files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 pl-9 pr-3 py-2 text-gray-805 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {filteredOrgs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredOrgs.map((org) => (
                <div
                  key={org.id}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-3 shadow-xs hover:shadow-xs hover:border-gray-300 dark:hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-slate-850 px-2 py-0.5 rounded-full select-none uppercase tracking-wide">
                        {org.org_category}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 font-semibold select-none">
                        impacto.org/@{org.slug}
                      </span>
                    </div>
                    <h4 className="font-display font-extrabold text-sm text-gray-900 dark:text-white mt-2 leading-tight">
                      {org.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {org.tagline}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                    <Button
                      onClick={() => handleApplyJoin(org.id)}
                      className="text-[10px] py-1.5 px-3 bg-emerald-600 hover:bg-emerald-750 flex items-center gap-1 rounded-md"
                    >
                      <Sparkles className="h-3 w-3 shrink-0" /> Request Membership
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed text-center select-none text-xs text-gray-400">
              {searchQuery ? "No other NGOs matched your active search." : "No other unregistered workspaces available on the platform."}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center border-t border-gray-200 dark:border-slate-800 pt-6 select-none">
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-gray-500 hover:text-red-500 flex items-center gap-1.5 transition"
          >
            <LogOut className="h-4 w-4" /> Sign Out of Account
          </button>
          
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            NGO Workspace Pool
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================

// ==========================================
// 4. FORGOT PASSWORD REQUEST PAGE
// ==========================================
export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold select-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3.5 py-1.5 rounded-full shadow-xs duration-150 transition mb-2 self-start">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home Page
        </Link>
        <Card title="Reset Password" className="w-full">
          {success ? (
            <div className="flex flex-col gap-4 text-center">
              <span className="p-3 bg-emerald-50 rounded-full text-emerald-600 self-center">
                <Mail className="h-8 w-8" />
              </span>
              <h3 className="font-display font-semibold text-gray-900">Email sent successfully</h3>
              <p className="text-xs text-gray-500">
                A password recovery link has been configured and dispatched to **{email}**. Please inspect your inbox.
              </p>
              <Button onClick={() => navigate("/login")} className="mt-4">
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="flex flex-col gap-4">
              <p className="text-xs text-gray-500 mb-2">
                Provide your email address below, and we will dispatch a design mock reset email right away.
              </p>
              <Input
                type="email"
                label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                prefixIcon={<Mail className="h-4 w-4 text-gray-400" />}
              />
              <Button type="submit" className="w-full mt-2 py-2.5">
                Submit Request
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

// ==========================================
// 5. RESET PASSWORD ACTUAL TRIGGER
// ==========================================
export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 font-semibold select-none bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3.5 py-1.5 rounded-full shadow-xs duration-150 transition mb-2 self-start">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home Page
        </Link>
        <Card title="New Credentials" className="w-full">
        {success ? (
          <div className="text-center flex flex-col items-center gap-3">
            <h3 className="font-semibold text-gray-900">Success!</h3>
            <p className="text-xs text-gray-500">Your password has been reset successfully.</p>
            <Button onClick={() => navigate("/login")}>Sign In Now</Button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <Input
              type="password"
              label="New password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••••"
            />
            <Button type="submit" className="w-full">
              Update Password
            </Button>
          </form>
        )}
        </Card>
      </div>
    </div>
  );
};
