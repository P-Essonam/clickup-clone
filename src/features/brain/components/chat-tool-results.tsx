import { useState } from "react";
import type { UIMessage } from "@convex-dev/agent/react";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Doc } from "../../../../convex/_generated/dataModel";
import TaskListView from "@/features/tasks/components/task-list-view";

type ToolPart = ToolUIPart | DynamicToolUIPart;

const isToolPart = (p: UIMessage["parts"][number]): p is ToolPart =>
  p.type.startsWith("tool-") || p.type === "dynamic-tool";

const getListIdFromParts = (
  parts: UIMessage["parts"],
): Doc<"tasks">["listId"] | null => {
  const listIds: Doc<"tasks">["listId"][] = [];

  for (const p of parts) {
    if (
      isToolPart(p) &&
      p.input &&
      typeof p.input === "object" &&
      "listId" in p.input
    ) {
      const listId = p.input.listId;
      if (typeof listId === "string") {
        listIds.push(listId as Doc<"tasks">["listId"]);
      }
    }
  }

  if (listIds.length === 0) return null;
  if (listIds.some((id) => id !== listIds[0])) return null;

  return listIds[0];
};

interface Props {
  parts?: UIMessage["parts"];
}

const ChatToolResults = ({ parts }: Props) => {
  const [showTasks, setShowTasks] = useState(false);

  const safeParts = parts ?? [];

  const listId = getListIdFromParts(safeParts);

  if (!listId) return null;
  return (
    <>
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => setShowTasks(true)}
          className="h-7 gap-2"
        >
          <ExternalLink className="size-3.5" />
          Show all tasks
        </Button>
      </div>

      <Dialog open={showTasks} onOpenChange={setShowTasks}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>Tasks</DialogTitle>
          </DialogHeader>

          <div className="flex-1">
            <TaskListView listId={listId} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatToolResults;
