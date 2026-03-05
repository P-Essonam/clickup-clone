"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface SecondarySidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  leading?: React.ReactNode;
  count?: number;
  active?: boolean;
  actions?: React.ReactNode;
}

const SecondarySidebarItem = ({
  label,
  leading,
  count,
  active = false,
  actions,
  className,
  onClick,
  ...props
}: SecondarySidebarItemProps) => {
  const clickable = typeof onClick === "function";
  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!clickable) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground",
        clickable && "cursor-pointer",
        className,
      )}
      {...props}
    >
      {leading}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {(typeof count === "number" || actions) && (
        <div className="relative ml-auto flex items-center">
          {typeof count === "number" && (
            <span className="absolute right-0 text-xs tabular-nums text-muted-foreground transition-opacity group-hover:opacity-0">
              {count}
            </span>
          )}

          {actions && (
            <div
              className="opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {actions}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SecondarySidebarItem;
