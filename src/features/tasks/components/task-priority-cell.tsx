"use client";

import * as React from "react";
import { Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Task, TaskPriority } from "../lib/types";
import { priorityOptions } from "../lib/constants";
import { cn } from "@/lib/utils";
import { formatPriority } from "../lib/utils";

interface Props {
  task: Task;
  onUpdate: (priority: TaskPriority | undefined) => void;
}

const TaskPriorityCell = ({ task, onUpdate }: Props) => {
  const [open, setOpen] = React.useState(false);

  const priority = task.priority;

  const currentOption = priority
    ? priorityOptions.find((opt) => opt.value === priority)
    : null;

  const hasPriority = priority !== undefined;

  const handleSelect = (newPriority: TaskPriority) => {
    onUpdate(newPriority);
    setOpen(false);
  };

  const handleClear = () => {
    onUpdate(undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          className={cn(
            "h-auto w-full cursor-pointer justify-start gap-2 px-0! py-1 text-xs text-muted-foreground hover:bg-transparent items-center",
            hasPriority && "text-foreground",
          )}
        >
          <Flag className={cn("size-4", currentOption?.flagColor)} />
          {hasPriority && priority && <span>{formatPriority(priority)}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Task Priority
          </div>
          {priorityOptions.map((opt) => {
            const isSelected = priority === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                  isSelected && "bg-accent",
                )}
              >
                <Flag className={cn("size-4", currentOption?.flagColor)} />

                <span className={opt.color}>{opt.label}</span>
              </button>
            );
          })}

          <div className="border-t border-border my-1" />
          <Button
            variant={"ghost"}
            onClick={handleClear}
            className="w-full justify-start gap-2"
          >
            <X className="size-4" />
            <span>Clear</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TaskPriorityCell;
