"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useRouter } from "next/navigation";
import { Skeleton } from "./ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { ChevronDown, Plus, Settings, UserPlus } from "lucide-react";
import InviteMemberDialog from "@/features/invitations/components/invite-member-dialog";

const WorkspaceHeader = () => {
  const trpc = useTRPC();
  const router = useRouter();
  const { organizationId, refreshAuth, role } = useAuth();

  const { data: organizations, isLoading: isOrgsLoading } = useQuery(
    trpc.organization.listOrganizations.queryOptions(),
  );
  const { data: memberCount, isLoading: isCountLoading } = useQuery(
    trpc.organization.countMembers.queryOptions(),
  );

  const currentOrg =
    organizations?.find(
      (memberShip) => memberShip.organizationId === organizationId,
    ) ?? organizations?.[0];

  const otherOrgs =
    organizations?.filter(
      (memberShip) => memberShip.organizationId !== currentOrg?.organizationId,
    ) ?? [];

  const workspaceName = currentOrg?.organizationName ?? "Workspace";
  const initial = workspaceName.charAt(0).toUpperCase();
  const count = memberCount?.count ?? 0;
  const memberLabel = `${count} member${count === 1 ? "" : "s"}`;

  const handleSwitchorg = async (newOrgId: string) => {
    if (newOrgId === organizationId) return;

    await refreshAuth({
      organizationId: newOrgId,
    });

    router.replace("/dashboard");
  };

  if (isOrgsLoading || isCountLoading) {
    return (
      <div className="flex items-center gap-2 h-8 px-2.5 rounded-md bg-muted/50">
        <Skeleton className="size-5 rounded bg-muted-foreground/20" />
        <Skeleton className="h-3.5 w-20 bg-muted-foreground/20" />
        <Skeleton className="size-3 rounded bg-muted-foreground/20" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"secondary"} size={"sm"} className="font-medium gap-2">
          <div className="flex size-5 items-center justify-center rounded bg-emerald-500 text-[10px] font-bold  text-white">
            {initial}
          </div>
          <span className="text-sm truncate max-w-25">{workspaceName}</span>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-72 p-2 flex flex-col gap-2"
      >
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500 font-bold text-white">
            {initial}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold leading-none text-sm">
              {workspaceName}
            </span>
            <span className="text-xs text-muted-foreground">{memberLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1">
          <DropdownMenuItem
            className="gap-2 px-3 py-2 cursor-pointer flex items-center border rounded-md"
            onSelect={() => router.push("/dashboard/settings")}
          >
            <Settings className="size-4 text-muted-foreground" />
            <span className="font-medium text-sm">Settings</span>
          </DropdownMenuItem>

          <InviteMemberDialog
            canInvite={role === "admin"}
            trigger={
              <DropdownMenuItem
                className="gap-2 px-3 py-2 cursor-pointer flex items-center border rounded-md"
                onSelect={(e) => e.preventDefault()}
              >
                <UserPlus className="size-4" />
                <span className="font-medium text-sm">Invite</span>
              </DropdownMenuItem>
            }
          />
        </div>
        <DropdownMenuSeparator className="bg-muted" />
        {otherOrgs.length > 0 && (
          <>
            <div className="space-y-0.5">
              <div className="px-2 py-1.5 tex-xs font-medium text-muted-foreground">
                Switch workspaces
              </div>
              {otherOrgs.map((memberShip) => (
                <DropdownMenuItem
                  key={memberShip.id}
                  className="gap-3 px-3 cursor-pointer"
                  onSelect={() => handleSwitchorg(memberShip.organizationId)}
                >
                  <div className="flex size-6 items-center justify-center rounded-md bg-emerald-500 font-bold text-white">
                    {memberShip.organizationName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm truncate">
                    {memberShip.organizationName}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator className="bg-muted" />
          </>
        )}

        <DropdownMenuItem
          className="gap-3 px-3 py-2 border rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground"
          onSelect={() => router.push("/onboarding")}
        >
          <Plus className="size-4" />
          <span className="font-medium text-sm">Create workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WorkspaceHeader;
