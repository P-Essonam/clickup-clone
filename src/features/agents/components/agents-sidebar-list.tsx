"use client";

import { usePaginatedQuery } from "convex/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";

import { api } from "../../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import InfiniteScroll from "@/components/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import { PER_PAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const AgentsSidebarList = () => {
  const pathname = usePathname();

  const { results, isLoading, status, loadMore } = usePaginatedQuery(
    api.agentsCreation.listAgents,
    {},
    { initialNumItems: PER_PAGE },
  );

  const isInitialLoading = isLoading && results.length === 0;
  const isEmpty = results.length === 0 && status === "Exhausted";

  return (
    <div className="mt-4  border-t pt-4">
      {isInitialLoading ? (
        <div className="flex flex-col gap-8 px-2">
          {Array.from({ length: 15 }, (_, i) => i + 1).map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-md" />
              <Skeleton className="h-6 flex-1" />
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <p className="px-2 text-xs text-muted-foreground flex items-center justify-center">
          No agents yet.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {results.map((agent) => {
            const isActive = pathname.includes(
              `/dashboard/agents/${agent.threadId}`,
            );

            return (
              <Link
                key={agent._id}
                prefetch={true}
                href={`/dashboard/agents/${agent.threadId}`}
                className={cn(
                  " flex w-full items-center gap-2  px-2 py-1.5 text-left text-sm",
                )}
              >
                <Avatar className="size-6">
                  <AvatarImage
                    src={agent.avatar}
                    alt={`${agent.name} avatar`}
                  />

                  <AvatarFallback>
                    {agent.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <p className="truncate font-medium text-foreground flex-1">
                  {agent.name}
                </p>

                {isActive && <Check className="size-4" />}
              </Link>
            );
          })}

          <InfiniteScroll
            status={status}
            isLoading={isLoading}
            loadMore={loadMore}
            numItems={PER_PAGE}
          />
        </div>
      )}
    </div>
  );
};

export default AgentsSidebarList;
