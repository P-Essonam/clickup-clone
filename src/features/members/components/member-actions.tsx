"use client";

import React from "react";
import { MemberRole, MemberShipStatus } from "../lib/types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserMinus, UserPlus } from "lucide-react";

export type MemberRowItem = {
  id: string;
  email: string;
  membershipId: string;
  role: MemberRole;
  membershipStatus: MemberShipStatus;
};

type MemberActionsProps = {
  member: MemberRowItem;
  currentUserId?: string | null;
  currentUserRole: MemberRole;
  adminCount: number;
};

const MemberActions = ({
  member,
  currentUserId,
  currentUserRole,
  adminCount,
}: MemberActionsProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateRole = useMutation(
    trpc.organization.updateOrganizationMembershipRole.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        toast.success("Role updated.");
      },
      onError: async (e) => {
        toast.error(e.message);
      },
    }),
  );

  const desactivate = useMutation(
    trpc.organization.desactivateOrganizationMembership.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        toast.success("Member deactivated.");
      },
      onError: () => {
        toast.error("Failed to deactivate member.");
      },
    }),
  );

  const reactivate = useMutation(
    trpc.organization.reactivateOrganizationMembership.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        toast.success("Member reactivated.");
      },
      onError: () => {
        toast.error("Failed to reactivate member.");
      },
    }),
  );

  const removeMember = useMutation(
    trpc.organization.deleteOrganizationMembership.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        toast.success("Member removed.");
      },
      onError: () => {
        toast.error("Failed to remove member.");
      },
    }),
  );

  const isSelf = member.id === currentUserId;
  const canManage = currentUserRole === "admin" && !isSelf;

  const canLeave = isSelf && (currentUserRole === "member" || adminCount >= 2);

  const canRemove = currentUserRole === "admin" && !isSelf;

  if (!canManage && !canLeave) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon-sm"}
          className="text-muted-foreground"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {canLeave && (
          <DropdownMenuItem
            onSelect={() =>
              removeMember.mutate({
                memberId: member.id,
              })
            }
            className="text-destructive"
          >
            Leave workspace
          </DropdownMenuItem>
        )}
        {canManage && (
          <>
            {member.role !== "member" && (
              <DropdownMenuItem
                onSelect={() =>
                  updateRole.mutate({
                    memberId: member.membershipId,
                    role: "member",
                  })
                }
              >
                Set as member
              </DropdownMenuItem>
            )}

            {member.role !== "admin" && (
              <DropdownMenuItem
                onSelect={() =>
                  updateRole.mutate({
                    memberId: member.membershipId,
                    role: "admin",
                  })
                }
              >
                Set as admin
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {member.membershipStatus !== "pending" &&
              (member.membershipStatus === "inactive" ? (
                <DropdownMenuItem
                  onSelect={() =>
                    reactivate.mutate({ memberId: member.membershipId })
                  }
                >
                  <UserPlus className="size-4" />
                  Reactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() =>
                    desactivate.mutate({ memberId: member.membershipId })
                  }
                >
                  <UserMinus className="size-4" />
                  Desactivate
                </DropdownMenuItem>
              ))}

            {canRemove && (
              <DropdownMenuItem
                onSelect={() =>
                  removeMember.mutate({ memberId: member.membershipId })
                }
                className="text-destructive"
              >
                Remove member
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MemberActions;
