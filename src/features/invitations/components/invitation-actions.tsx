"use client";

import React from "react";
import { InvitationState } from "../lib/types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, RotateCcw, X } from "lucide-react";

interface Props {
  invitationId: string;
  isAdmin: boolean;
  state: InvitationState;
}

const InvitationActions = ({ invitationId, isAdmin, state }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const resendInvitation = useMutation(
    trpc.organization.resendInvitation.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        toast.success("Invitation resent.");
      },
      onError: (e) => {
        toast.error(e.message);
      },
    }),
  );

  const revokeInvitation = useMutation(
    trpc.organization.revokeInvitation.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        toast.success("Invitation revoked.");
      },
      onError: (e) => {
        toast.error(e.message);
      },
    }),
  );

  if (!isAdmin || state !== "pending") return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon-sm"}
          className="text-muted-foreground"
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onSelect={() => resendInvitation.mutate({ invitationId })}
        >
          <RotateCcw className="size-4" />
          Resend
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => revokeInvitation.mutate({ invitationId })}
          className="text-destructive"
        >
          <X className="size-4" />
          Revoke
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InvitationActions;
