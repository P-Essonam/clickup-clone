"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import React, { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  MessageSquare,
  Plus,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Doc } from "../../../../convex/_generated/dataModel";
import TriggersSection from "./triggers-section";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getToolDisplayName, splitTools } from "../lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import InstructionsViewer from "./instructions-viewer";

interface Props {
  preloadedAgent: Preloaded<typeof api.agentsCreation.getAgentByThreadId>;
}
const AgentDetailsSidebar = ({ preloadedAgent }: Props) => {
  const agent = usePreloadedQuery(preloadedAgent);
  const trpc = useTRPC();
  const router = useRouter();

  const { data: user } = useQuery(
    trpc.organization.getUser.queryOptions({ userId: agent?.ownerId ?? "" }),
  );

  const handleMessageAgent = () => {};

  if (!agent) {
    return (
      <div className="w-full flex-1 shrink-0 border-l p-4">
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <Avatar className="size-16 mb-3">
            <AvatarImage src={"/avatar1.jpg"} />
            <AvatarFallback>
              <Wrench className="size-6" />
            </AvatarFallback>
          </Avatar>
          <p className="font-medium text-sm">Agent not created yet</p>
          <p className="text-xs mt-0.5">
            Keep chatting to configure your agent
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 shrink-0 overflow-y-auto border-l bg-background">
      <div className="sticky top-0 z-10 bg-background p-6">
        <div className="flex flex-col items-start gap-4">
          <div className="relative shrink-0">
            <Avatar className="size-16">
              <AvatarImage
                src={agent.avatar}
                alt={`${agent.name} avatar`}
                className="object-cover"
              />
              <AvatarFallback>
                {agent.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0 w-full">
            <h2 className="text-xl font-semibold leading-tight truncate">
              {agent.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {agent.description}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Avatar className="size-5">
                <AvatarImage src={user?.profilePictureUrl ?? undefined} />
                <AvatarFallback className="bg-background text-foreground text-[10px] font-bold">
                  {(user?.firstName?.charAt(0)?.toUpperCase() ?? "") +
                    (user?.lastName?.charAt(0)?.toUpperCase() ?? "") || ""}
                </AvatarFallback>
              </Avatar>

              <span className="text-xs text-muted-foreground">
                Managed by{" "}
                <span className="font-medium text-foreground">
                  {user?.firstName} {user?.lastName}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            className="flex-1 gap-2 shadow-none"
            size="sm"
            onClick={handleMessageAgent}
          >
            <MessageSquare className="size-4" />
            Message
          </Button>
          <Button
            variant={"secondary"}
            className="flex-1 gap-2 shadow-none"
            size="sm"
            onClick={handleMessageAgent}
          >
            Run agent
          </Button>
        </div>

        <div className="flex-1 py-4">
          <InstructionsSection agent={agent} />
          <div className="p-8">
            <Separator className="bg-border/50" />
          </div>
          <TriggersSection agent={agent} />
          <div className="p-8">
            <Separator className="bg-border/50" />
          </div>
          <ToolsSection agent={agent} />
        </div>
      </div>
    </div>
  );
};

export default AgentDetailsSidebar;

function InstructionsSection({ agent }: { agent: Doc<"agents"> }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-2">
        {isOpen ? (
          <ChevronDown className="size-3.5 text-muted-foreground/70" />
        ) : (
          <ChevronRight className="size-3.5 text-muted-foreground/70" />
        )}
 
        <span className="font-medium text-[15px]">Tools</span>
    
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-11 py-2 space-y-1">
          <InstructionsViewer  instructions={agent.instructions} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ToolsSection({ agent }: { agent: Doc<"agents"> }) {
  const [isOpen, setIsOpen] = useState(false);

  const { defaultTools, otherTools } = splitTools(agent.tools);
  const totalTools = agent.tools.length;
  const toolIcon = (
    <img src="/logo.svg" alt="" className="h-3.5 w-3.5" aria-hidden="true" />
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-2">
        {isOpen ? (
          <ChevronDown className="size-3.5 text-muted-foreground/70" />
        ) : (
          <ChevronRight className="size-3.5 text-muted-foreground/70" />
        )}
        <div className="flex items-center gap-2">
          <span className="font-medium text-[15px]">Tools</span>
          <Badge
            variant={"secondary"}
            className="text-[10px] h-4 px-1 min-w-4 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground border-none"
          >
            {totalTools}
          </Badge>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-11 py-2 space-y-1">
          {defaultTools.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between rounded-md py-1">
                  <div className="flex items-center gap-2">
                    {toolIcon}
                    <span className="text-sm">Default Tools</span>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {defaultTools.length}
                  </span>
                </div>
              </TooltipTrigger>

              <TooltipContent side="left" className="max-w-xs">
                <div className="space-y-1">
                  {defaultTools
                    .map((tool) => getToolDisplayName(tool))
                    .join(", ")}
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          {otherTools.map((tool) => (
            <div key={tool} className="flex items-center gap-2 rounded-md py-1">
              {toolIcon}
              <span className="text-sm">{getToolDisplayName(tool)}</span>
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground mt-2 h-8 -ml-2"
          >
            <Plus className="size-3.5" />
            Add tools
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
