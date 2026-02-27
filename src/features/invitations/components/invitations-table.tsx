"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { PER_PAGE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import React from "react";
import InvitationStatusBadge from "./invitation-status-badge";
import InvitationActions from "./invitation-actions";
import InfiniteScroll from "@/components/infinite-scroll";

const InvitationsTable = () => {
  const trpc = useTRPC();
  const { role } = useAuth();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      trpc.organization.listInvitations.infiniteQueryOptions(
        { limit: PER_PAGE },
        { getNextPageParam: (last) => last.nextCursor },
      ),
    );

  const invitations = data?.pages.flatMap((p) => p.items) ?? [];

  const invitationStatus =
    isLoading && !invitations.length
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
          <h2 className="text-sm font-semibold">Invitations</h2>
          <p className="text-xs text-muted-foreground">
            Manage member invitations.
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Sent at</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-3 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="size-6 justify-self-end" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && invitations.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center">
                <span className="text-sm text-muted-foreground">
                  No invitations found.
                </span>
              </TableCell>
            </TableRow>
          )}

          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell className="text-sm font-medium">
                {invitation.email}
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(invitation.createdAt)}
              </TableCell>
              <TableCell>
                <InvitationStatusBadge state={invitation.state} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <InvitationActions
                    invitationId={invitation.id}
                    isAdmin={role === "admin"}
                    state={invitation.state}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}

          <TableRow>
            <TableCell className="p-0" colSpan={4}>
              <InfiniteScroll
                status={invitationStatus}
                isLoading={isLoading}
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

export default InvitationsTable;
