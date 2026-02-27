"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";

interface Props {
  canInvite: boolean;
  trigger?: React.ReactNode;
}

const InviteMemberDialog = ({ canInvite, trigger }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");

  const { data: organization } = useQuery(
    trpc.organization.getOrganization.queryOptions(),
  );

  const inviteUser = useMutation(
    trpc.organization.inviteUser.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        toast.success("Invitation sent!");
        setEmail("");
        setRole("member");
        setOpen(false);
      },
      onError: async (e) => {
        toast.error(e.message);
      },
    }),
  );

  if (!canInvite) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size={"sm"}>Invite User</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your workspace.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={() =>
            inviteUser.mutate({ email: email.trim(), role: role })
          }
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="organization">Workspace</Label>
            <Input
              id="organization"
              value={organization?.name ?? "workspace"}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as "member" | "admin")}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={!email.trim() || inviteUser.isPending}
            >
              {inviteUser.isPending ? "Sending..." : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;
