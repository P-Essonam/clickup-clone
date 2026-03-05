"use client"

import SecondarySidebar from "@/components/secondary-sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CreateSpaceDialog from "@/features/spaces/components/space-dialog";
import SpacesSidebar from "@/features/spaces/components/spaces-sidebar";
import { useSpaces } from "@/features/spaces/hooks/use-spaces";
import { Plus } from "lucide-react";
import React, { useState } from "react";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  const { isLoading } = useSpaces();
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);

  return (
    <div className="flex flex-1 overflow-hidden">
      <SecondarySidebar
        title="Spaces"
        actions={
          <Button size={"sm"} onClick={() => setCreateSpaceOpen(true)}>
            <Plus className="size-4" />
          </Button>
        }
      >
        {isLoading ? (
          <div className="flex flex-col gap-4 p-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div className="flex flex-col gap-2" key={index}>
                <div className="flex items-center gap-2 px-2">
                  <Skeleton className="size-6 rounded-md " />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="ml-4 flex flex-col gap-2 border-l border-border pl-2">
                  <div className="flex items-center gap-2 px-2">
                    <Skeleton className="size-6 rounded-md " />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <Skeleton className="size-6 rounded-md " />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-2 flex items-center gap-2 px-2 opacity-50">
              <Skeleton className="size-6 rounded-md " />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ) : (
          <SpacesSidebar />
        )}
      </SecondarySidebar>
      <div className="flex-1 min-w-0">{children}</div>
      <CreateSpaceDialog
        open={createSpaceOpen}
        onOpenChange={setCreateSpaceOpen}
        mode="create"
      />
    </div>
  );
};

export default Layout;
