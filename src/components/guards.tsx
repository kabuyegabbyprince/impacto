import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useOrgStore } from "../store/orgStore";

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const OrgRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const { activeOrg } = useOrgStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!activeOrg) {
    return <Navigate to="/org-picker" replace />;
  }
  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const { activeOrg, activeMember } = useOrgStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!activeOrg) {
    return <Navigate to="/org-picker" replace />;
  }
  if (activeMember?.role !== "org_admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const PlatformRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();

  if (!user || !user.is_superadmin) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
