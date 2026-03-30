import React from "react";
import DashboardSidebarClient from "./dashboard-sidebar-client";
import { preloadQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { withAuth } from "@workos-inc/authkit-nextjs";

interface Props {
  children: React.ReactNode;
}

const DashboardSidebar = async ({ children }: Props) => {
  const { accessToken } = await withAuth({ ensureSignedIn: true });

  const preloadedCurrentThread = await preloadQuery(
    api.brain.getCurrentThread,
    {},
    { token: accessToken },
  );

  return (
    <DashboardSidebarClient preloadedCurrentThread={preloadedCurrentThread}>
      {children}
    </DashboardSidebarClient>
  );
};

export default DashboardSidebar;
