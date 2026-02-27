"use client";

import React from "react";
import { Button } from "./ui/button";
import {
  Bot,
  Calendar,
  ChevronsRight,
  Layers,
  Settings,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar-store";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import WorkspaceHeader from "./workspace-header";
import InviteMemberDialog from "@/features/invitations/components/invite-member-dialog";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

const navItems = [
  { title: "Spaces", url: "/dashboard", icon: Layers },
  { title: "Chat", url: "/dashboard/chat", icon: Calendar },
  { title: "Agents", url: "/dashboard/agents", icon: Bot },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

interface Props {
  children: React.ReactNode;
}

const DashboardSidebarClient = ({ children }: Props) => {
  const { sidebarOpen, openSidebar } = useSidebar();
  const { role } = useAuth()

  const pathname = usePathname();

  const isActive = (url: string) => {
    if (url === "/dashboard")
      return (
        pathname === "/dashboard" || pathname.startsWith("/dashboard/lists")
      );

    return pathname.startsWith(url);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden px-2 pb-2">
      <header className="flex h-12 shrink-0 items-center justify-between bg-background">
        <WorkspaceHeader />

        <div className="flex items-center gap-2">
          <Button variant={"secondary"} size={"sm"} className="h-8 gap-2">
            <Sparkles className="size-4" />
            Ask AI
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden gap-2">
        <aside className="flex w-16 shrink-0 flex-col rounded-lg bg-primary">
          {!sidebarOpen && (
            <div className="flex justify-center border-b border-primary-foreground/15 py-2">
              <button
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                onClick={openSidebar}
              >
                <span className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-primary-foreground/10">
                  <ChevronsRight />
                </span>
              </button>
            </div>
          )}
          <nav className="flex flex-1 flex-col items-center gap-2 py-1">
            {navItems.map((item) => {
              const active = isActive(item.url);
              return (
                <Link
                  key={item.title}
                  prefetch={true}
                  href={item.url}
                  className="group flex flex-col items-center  gap-1 px-2 py-1 text-sm font-medium text-primary-foreground"
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg transition-colors",
                      active
                        ? "bg-primary-foreground text-primary"
                        : "group-hover:bg-primary-foreground/10",
                    )}
                  >
                    <item.icon className="size-4" />
                  </span>
                  <span className="font-medium text-xs">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col items-center gap-2 border-t border-primary-foreground/20 pb-2">
            <InviteMemberDialog 
              canInvite={role === "admin"}
              trigger={
                <button
                  type="button"
                  className="group flex flex-col items-center gap-1 text-xs font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg transition-colors group-hover:bg-primary-foreground/10">
                    <UserPlus className="size-4"/>
                  </span>
                  <span className="font-medium text-xs">
                    Invite
                  </span>
                </button>
              }
            />
          </div>

        </aside>

        
        <main className="flex flex-1 overflow-hidden border rounded-lg">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardSidebarClient;
