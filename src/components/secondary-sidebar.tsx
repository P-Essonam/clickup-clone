"use client";

import { useSidebar } from "@/hooks/use-sidebar-store";
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronsLeft } from "lucide-react";

type Props = {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

const SecondarySidebar = ({ title, actions, children } : Props) => {
  const { sidebarOpen, closeSidebar } = useSidebar();
  if (!sidebarOpen) return null;


  return (
    <div className="group/secondary flex w-72 shrink-0 flex-col  border-r bg-muted/30">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 px-4">
            <h2 className="text-sm font-semibold">
                {title}
            </h2>
            <div className="flex items-center gap-1">
                <Button
                    variant={"ghost"}
                    size={"sm"}
                    onClick={closeSidebar}
                    className="transition-opacity hover:bg-muted xl:opacity-0 xl:group-hover/secondary:opacity-100"
                >
                    <ChevronsLeft className="size-4"/>
                </Button>
                {actions}
            </div>
        </div>

        <div className="flex-1 p-2">
            {children}
        </div>
    </div>
  )
};

export default SecondarySidebar;
