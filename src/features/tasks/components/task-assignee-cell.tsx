"use client";

import React from "react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Skeleton } from "@/components/ui/skeleton";
import InfiniteScroll from "@/components/infinite-scroll";
import { cn, getMemberDisplayName, getMemberInitials } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Task } from "../lib/types";
import { PER_PAGE } from "@/lib/constants";

interface Props {
  task: Task;
  onUpdate: (assigneedIds: string[]) => void;
}

function AssigneeRow({
  selected,
  onToggle,
  children,
}: {
  selected: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
      {children}
      <Button
        variant={"ghost"}
        size={"sm"}
        className="ml-auto h-7 px-2 text-xs"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {selected ? "Remove" : "Add"}
      </Button>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-2 text-sm font-medium border-b-2 -mb-px",
        active
          ? "border-foreground text-foreground"
          : "border-transparent  text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

const TaskAssigneeCell = ({ task, onUpdate }: Props) => {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"people" | "agents">("people");
  const trpc = useTRPC();
  const { assigneeIds } = task;

  const {
    data,
    isLoading: isLoadingMembers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    trpc.organization.listMembers.infiniteQueryOptions(
      { limit: PER_PAGE },
      { getNextPageParam: (last) => last.nextCursor ?? undefined },
    ),
  );

  const members = data?.pages.flatMap((p) => p.items) ?? [];

  const assignedMembers = members.filter((m) => assigneeIds.includes(m.id));
  // TODO LATER
  const assignedAgents = 0;

  const totalAssigned = assignedMembers.length + assignedAgents;

  const toggle = (id: string) =>
    onUpdate(
      assigneeIds.includes(id)
        ? assigneeIds.filter((x) => x !== id)
        : [...assigneeIds, id],
    );

  const membersStatus =
    isLoadingMembers && !members.length
      ? "LoadingFirstPage"
      : hasNextPage
        ? isFetchingNextPage
          ? "LoadingMore"
          : "CanLoadMore"
        : "Exhausted";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          className={cn(
            "h-auto w-full cursor-pointer justify-start gap-2 px-0! py-1 text-xs text-muted-foreground hover:bg-transparent items-center",
            totalAssigned > 0 && "text-foreground",
          )}
        >
          {isLoadingMembers ? (
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ) : totalAssigned > 0 ? (
            <div className="flex items-center gap-1">
              {assignedMembers.slice(0, 2).map((m) => (
                <Avatar key={m.id} className="size-5">
                  <AvatarImage src={m.profilePictureUrl || undefined} />
                  <AvatarFallback>{getMemberInitials(m)}</AvatarFallback>
                </Avatar>
              ))}
             
              {totalAssigned > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{totalAssigned - 2}
                </span>
              )}
            </div>
          ) : (
            <UserPlus className="size-4 " />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="grid grid-cols-2 border-b">
          <TabButton active={tab === "people"} onClick={() => setTab("people")}>
            People
          </TabButton>
          <TabButton active={tab === "agents"} onClick={() => setTab("agents")}>
            Agents
          </TabButton>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {tab === "people" ? (
            isLoadingMembers && !members.length ? (
              <p className="p-2 text-sm text-muted-foreground">Loading...</p>
            ) : !members.length ? (
              <p className="p-2 text-sm text-muted-foreground">No People</p>
            ) : (
              <div>
                {members.map((m) => (
                  <AssigneeRow
                    key={m.id}
                    selected={assigneeIds.includes(m.id)}
                    onToggle={() => toggle(m.id)}
                  >
                    <Avatar key={m.id} className="size-6">
                      <AvatarImage src={m.profilePictureUrl || undefined} />
                      <AvatarFallback className="text-xs font-medium">
                        {getMemberInitials(m)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {getMemberDisplayName(m)}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {m.email}
                      </span>
                    </div>
                  </AssigneeRow>
                ))}
                <InfiniteScroll
                  status={membersStatus}
                  isLoading={isLoadingMembers}
                  loadMore={() => fetchNextPage()}
                  numItems={PER_PAGE}
                />
              </div>
            )
          ) : (
            // TODOD AGENT
            <p>AGENT</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TaskAssigneeCell;
