import AuthGuard from "@/features/auth/components/auth-guard";
import WorkspaceGuard from "@/features/auth/components/workspace-guard";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <AuthGuard>
      <WorkspaceGuard>{children}</WorkspaceGuard>
    </AuthGuard>
  );
};

export default Layout;
