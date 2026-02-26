import React from "react";
import { MemberShipStatus } from "../lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<
  MemberShipStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "text-emerald-600",
  },
  inactive: {
    label: "Inactive",
    className: "text-muted-foreground",
  },
  pending: {
    label: "Pending",
    className: "text-amber-600",
  },
};

const MemberStatusBadge = ({ status }: { status: MemberShipStatus }) => {
  const style = statusStyles[status];

  return (
    <div className={cn("flex items-center gap-2 text-sm", style.className)}>
      <span className="size-2 rounded-full bg-current" />
      <span className="font-medium">{style.label}</span>
    </div>
  );
};

export default MemberStatusBadge;
