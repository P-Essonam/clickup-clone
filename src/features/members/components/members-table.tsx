"use client";

import { PER_PAGE } from "@/lib/constants";
import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import React from "react";
import { normalizeAdminMemberRole } from "../lib/utils";
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDate,
  getMemberDisplayName,
  getMemberInitials,
} from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MemberStatusBadge from "./member-status-badge";
import MemberActions from "./member-actions";
import InfiniteScroll from "@/components/infinite-scroll";
import InviteMemberDialog from "@/features/invitations/components/invite-member-dialog";

const MembersTable = () => {
  const trpc = useTRPC();
  const { user } = useAuth();

  const {
    data: membersData,
    isLoading: isLoadingMembers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    trpc.organization.listMembers.infiniteQueryOptions(
      { limit: PER_PAGE },
      { getNextPageParam: (last) => last.nextCursor },
    ),
  );

  const members = membersData?.pages.flatMap((p) => p.items) ?? [];

  const currentUserRole = normalizeAdminMemberRole(
    members.find((member) => member.id === user?.id)?.role,
  );

  const adminCount = members.filter(
    (member) => normalizeAdminMemberRole(member.role) === "admin",
  ).length;
  const canInvite = currentUserRole === "admin";

  const membersStatus =
    isLoadingMembers && !members.length
      ? "LoadingFirstPage"
      : hasNextPage
        ? isFetchingNextPage
          ? "LoadingMore"
          : "CanLoadMore"
        : "Exhausted";

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-sm font-semibold">Team members</h2>
          <p className="text-xs text-muted-foreground">
            Manage workspace members and permissions.
          </p>
        </div>

        <InviteMemberDialog canInvite={canInvite} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Membership</TableHead>
            <TableHead>Last sign-in</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoadingMembers &&
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Skeleton className="h-3 w-16" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-3 w-20" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-3 w-20" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-3 w-16" />
                </TableCell>

                <TableCell className="text-right">
                  <Skeleton className="h-3 w-6 justify-self-end" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoadingMembers && members.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center">
                <span className="text-sm text-muted-foreground">
                  No members found yet.
                </span>
              </TableCell>
            </TableRow>
          )}

          {members.map((member) => {
            const displayName = getMemberDisplayName(member);
            const initials = getMemberInitials(member);
            const role = normalizeAdminMemberRole(member.role);
            return (
              <TableRow key={member.membershipId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={member.profilePictureUrl ?? undefined}
                      />
                      <AvatarFallback className="text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {member.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {displayName}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm capitalize">{role}</TableCell>

                <TableCell>
                  <MemberStatusBadge status={member.membershipStatus} />
                </TableCell>

                <TableCell className="text-sm">
                  {formatDate(member.lastSignInAt)}
                </TableCell>

                <TableCell className="text-sm">
                  {formatDate(member.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <MemberActions
                      member={{ ...member, role }}
                      currentUserId={user?.id}
                      currentUserRole={currentUserRole}
                      adminCount={adminCount}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}

          <TableRow>
            <TableCell colSpan={6} className="p-0">
              <InfiniteScroll
                status={membersStatus}
                isLoading={isLoadingMembers}
                loadMore={() => fetchNextPage()}
                numItems={PER_PAGE}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
};

export default MembersTable;
