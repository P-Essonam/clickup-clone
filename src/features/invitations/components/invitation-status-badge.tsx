import React from 'react'
import { InvitationState } from '../lib/types';
import { cn } from '@/lib/utils';


const stateStyles: Record<
  InvitationState,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "text-amber-600" },
  accepted: { label: "Accepted", className: "text-emerald-600" },
  revoked: { label: "Revoked", className: "text-muted-foreground" },
  expired: { label: "Expired", className: "text-muted-foreground" },
};


const InvitationStatusBadge = ({ state }: { state: InvitationState }) => {
  const style = stateStyles[state];

  return (
    <div className={cn("flex items-center gap-2 text-sm", style.className)}>
      <span className="size-2 rounded-full bg-current" />
      <span className="font-medium">{style.label}</span>
    </div>
  );
}

export default InvitationStatusBadge