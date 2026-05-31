import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Automatically migrate legacy hashed URLs (e.g. /#/@slug or /#/login) to standard clean paths
if (window.location.hash && window.location.hash.startsWith('#/')) {
  try {
    const cleanPath = window.location.hash.substring(1); // Keeps the slash: /@slug, /login, etc.
    window.history.replaceState(null, '', cleanPath || '/');
  } catch (err) {
    console.error("Hash routing translation failed:", err);
  }
}

// Authentication Pages
import {
  Login,
  Register,
  OrgPicker,
  ForgotPassword,
  ResetPassword
} from "./pages/auth";

// Public Portal Pages
import {
  Landing,
  OrgPublicPage,
  DonatePage,
  EventCheckinPage
} from "./pages/public";

// Active Dashboard Pages
import {
  DashboardHome,
  NewsFeed,
  ChatRoom,
  GoalsTracker,
  MeetingsMinutes,
  DocumentsCenter,
  ImpactTracker,
  VotesPolls,
  EventsCalendar
} from "./pages/dashboard";

// Administrative Modules
import {
  MembersManagement,
  LedgerBookkeeping,
  DonorsPortal,
  GrantsTracker,
  AnnualReports
} from "./pages/admin-modules";

// Organization Brand Settings
import { OrganizationSettingsPage } from "./pages/settings";

// Platform Operators Control
import { SuperadminDashboard } from "./pages/superadmin";

// Guard Gatewards & Layouts
import { PrivateRoute, OrgRoute, AdminRoute, PlatformRoute } from "./components/guards";
import { DashboardLayout } from "./components/layout";

import { ToastProvider } from "./components/Toast";
// Prepare Query cache client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <Routes>
            {/* ==========================================
                1. PUBLIC DISCOVERY & WHITE-LABELED PORTALS
                ========================================== */}
            <Route path="/" element={<Landing />} />
            <Route path="/@:slug" element={<OrgPublicPage />} />
            <Route path="/@:slug/donate" element={<DonatePage />} />
            <Route path="/@:slug/checkin" element={<EventCheckinPage />} />
            <Route path="/:slug" element={<OrgPublicPage />} />
            <Route path="/:slug/donate" element={<DonatePage />} />
            <Route path="/:slug/checkin" element={<EventCheckinPage />} />

            {/* ==========================================
                2. PUBLIC AUTH GATES
                ========================================== */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route
              path="/org-picker"
              element={
                <PrivateRoute>
                  <OrgPicker />
                </PrivateRoute>
              }
            />

            {/* ==========================================
                3. SUPERADMIN CONTROL PANELS
                ========================================== */}
            <Route
              path="/platform/admin"
              element={
                <PlatformRoute>
                  <SuperadminDashboard />
                </PlatformRoute>
              }
            />

            {/* ==========================================
                4. ACTIVE NGO BRANDED WORKSPACE
                ========================================== */}
            <Route
              path="/dashboard"
              element={
                <OrgRoute>
                  <DashboardLayout>
                    <DashboardHome />
                  </DashboardLayout>
                </OrgRoute>
              }
            />

            <Route
              path="/dashboard/news"
              element={
                <OrgRoute>
                  <DashboardLayout>
                    <NewsFeed />
                  </DashboardLayout>
                </OrgRoute>
              }
            />

            <Route
              path="/dashboard/chat"
              element={
                <OrgRoute>
                  <DashboardLayout>
                    <ChatRoom />
                  </DashboardLayout>
                </OrgRoute>
              }
            />

            <Route
              path="/dashboard/events"
              element={
                <OrgRoute>
                  <DashboardLayout>
                    <EventsCalendar />
                  </DashboardLayout>
                </OrgRoute>
              }
            />

            <Route
              path="/dashboard/meetings"
              element={
                <OrgRoute>
                  <DashboardLayout>
                    <MeetingsMinutes />
                  </DashboardLayout>
                </OrgRoute>
              }
            />

            <Route
              path="/dashboard/goals"
              element={
                <OrgRoute>
                  <DashboardLayout>
                    <GoalsTracker />
                  </DashboardLayout>
                </OrgRoute>
              }
            />

            <Route
              path="/dashboard/documents"
              element={
                <OrgRoute>
                  <DashboardLayout>
                    <DocumentsCenter />
                  </DashboardLayout>
                </OrgRoute>
              }
            />

            <Route
              path="/dashboard/impact"
              element={
                <OrgRoute>
                  <DashboardLayout>
                    <ImpactTracker />
                  </DashboardLayout>
                </OrgRoute>
              }
            />

            <Route
              path="/dashboard/votes"
              element={
                <OrgRoute>
                  <DashboardLayout>
                    <VotesPolls />
                  </DashboardLayout>
                </OrgRoute>
              }
            />

            {/* ==========================================
                5. ADMINISTRATIVE CONTROLS
                ========================================== */}
            <Route
              path="/dashboard/members"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <MembersManagement />
                  </DashboardLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/dashboard/ledger"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <LedgerBookkeeping />
                  </DashboardLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/dashboard/donors"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <DonorsPortal />
                  </DashboardLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/dashboard/grants"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <GrantsTracker />
                  </DashboardLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/dashboard/reports"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <AnnualReports />
                  </DashboardLayout>
                </AdminRoute>
              }
            />

            <Route
              path="/dashboard/settings"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <OrganizationSettingsPage />
                  </DashboardLayout>
                </AdminRoute>
              }
            />

            {/* Fallback catcher */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
}
