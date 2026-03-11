"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { useQueryState } from "nuqs";
import { listViewParser, VIEW_PARAM, VIEW_TABS } from "../lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ListChecks, Plus } from "lucide-react";
import TaskDialog from "../../tasks/components/task-dialog";

interface Props {
  preloadedGetListWithSpace: Preloaded<typeof api.lists.getListWithSpace>;
}

const ListPageHeader = ({ preloadedGetListWithSpace }: Props) => {
  const [view, setView] = useQueryState(VIEW_PARAM, listViewParser);

  const data = usePreloadedQuery(preloadedGetListWithSpace);

  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);

  return (
    <header className="flex shrink-0 flex-col bg-background px-6 pt-3">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={"ghost"}
            size={"sm"}
            className="h-7 gap-2 px-1  hover:bg-transparent"
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded text-[10px] font-semibold text-white",
                data?.space.color,
              )}
            >
              {(data?.space.name ?? "Space").charAt(0).toUpperCase()}
            </span>
            <span className="text-sm font-semibold">
              {data?.space.name ?? "Space"}
            </span>
          </Button>
          <span className="text-muted-foreground/50">/</span>
          <Button
            variant={"ghost"}
            size={"sm"}
            className="h-7 gap-2 px-1 hover:bg-transparent"
          >
            <ListChecks className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {data?.list.name ?? "List"}
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size={"sm"}
            className="h-8 gap-2"
            onClick={() => setTaskDialogOpen(true)}
          >
            <Plus className="size-4" />
            Add Task
          </Button>
        </div>
      </div>


      <nav className="flex items-center gap-6 border-b  bg-background/80">
              {VIEW_TABS.map((tab) => {
                const isActive = view === tab.value
                const Icon = tab.icon
                return (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => setView(tab.value)}
                        className={cn(
                            "relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors",
                            isActive 
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon className="size-4" />
                        {tab.label}
                        {isActive && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                        )}
                    </button>
                )
              })}

      </nav>
      {data?.list._id && (
        <TaskDialog 
            open={taskDialogOpen}
            onOpenChange={setTaskDialogOpen}
            listId={data.list._id}
            mode="create"
        />
      )}
    </header>
  );
};

export default ListPageHeader;
