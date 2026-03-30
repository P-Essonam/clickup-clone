import { Space } from "@/features/spaces/lib/types";

import { useState } from "react";
import { Check, ChevronDown, ListTodo } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAskAIStore } from "../hooks/use-ask-ai-store";
import { Id } from "../../../../convex/_generated/dataModel";

type List = { _id: string; name: string };
interface Props {
  spaces: Space[];
}

const ResourcePicker = ({ spaces }: Props) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { selectedContext, selectSpace, selectList, clearContext } =
    useAskAIStore();

  const { spaceId, spaceName, listId, listName } = selectedContext;

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      prev.has(id) ? next.delete(id) : next.add(id);

      return next;
    });

  const handleSelectSpace = (space: Space) => {
    spaceId === space._id && !listId
      ? clearContext()
      : selectSpace(space._id as Id<"spaces">, space.name);
  };

  const handleSelectList = (space: Space, list: List) => {
    listId === list._id
      ? selectSpace(space._id as Id<"spaces">, space.name)
      : selectList(
          space._id as Id<"spaces">,
          space.name,
          list._id as Id<"lists">,
          list.name,
        );
  };

  const displayText = listName
    ? `${spaceName} > ${listName}`
    : (spaceName ?? "All Sources");

  const hasSelection = spaceName !== null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"secondary"}
          size={"sm"}
          className="h-7 gap-1.5 text-xs font-normal"
        >
          <ListTodo
            className={cn(
              "size-3.5",
              hasSelection ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="max-w-37.5 truncate">{displayText}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-1" align="start">
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors",
            !spaceId ? "bg-primary/10" : "hover:bg-accent",
          )}
          onClick={() => {
            clearContext();
            setOpen(false);
          }}
        >
          <ListTodo
            className={cn(
              "size-3.5",
              !spaceId ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="flex-1 text-sm font-medium">All Sources</span>
          {!spaceId && <Check className="size-3.5 text-primary" />}
        </div>

        <p className="px-2 py-1.5  text-xs font-medium text-muted-foreground">
          Spaces
        </p>

        {spaces.map((space) => {
          const isExpanded = expanded.has(space._id);
          const isSpaceSelected = spaceId === space._id && !listId;

          return (
            <div key={space._id}>
              <div
                className={cn(
                  "group flex items-center gap-1 rounded-md p-1 cursor-pointer transition-colors",
                  isSpaceSelected ? "bg-primary/10" : "hover:bg-accent",
                )}
                onClick={() => handleSelectSpace(space)}
              >
                <button
                  type="button"
                  className="flex size-6 items-center justify-center rounded-md hover:bg-accent-foreground/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(space._id);
                  }}
                >
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-muted-foreground transition-transform",
                      !isExpanded && "-rotate-90",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded text-[10px]  font-bold text-white",
                    space.color ?? "bg-primary",
                  )}
                >
                  {space.name[0].toUpperCase()}
                </div>
                <span className="flex-1 truncate text-sm font-medium">
                  {space.name}
                </span>
                {isSpaceSelected && (
                  <Check className="size-3.5  text-primary" />
                )}
              </div>

              {isExpanded && space.lists.length > 0 && (
                <div className="ml-3.5 pl-3 border-l  border-border/50 space-y-0.5 mt-0.5">
                  {space.lists.map((list) => {
                    const isListSelected = listId === list._id;

                    return (
                      <div
                        key={list._id}
                        className={cn(
                          "group flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors",
                          isListSelected ? "bg-primary/10" : "hover:bg-accent",
                        )}
                        onClick={() => handleSelectList(space, list)}
                      >
                        <ListTodo
                          className={cn(
                            "size-3.5 transition-colors",
                            isListSelected
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                        <span className="flex-1 truncate text-sm">
                          {list.name}
                        </span>
                        {isListSelected && (
                          <Check className="size-3.5 text-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

export default ResourcePicker;
