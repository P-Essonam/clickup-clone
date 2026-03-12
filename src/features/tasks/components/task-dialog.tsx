"use client";

import React from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, ChevronDown, Flag } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import InfiniteScroll from "@/components/infinite-scroll";

import { cn, getMemberDisplayName, getMemberInitials } from "@/lib/utils";
import { PER_PAGE } from "@/lib/constants";
import { useTRPC } from "@/trpc/client";
import {
  useMutation as useConvexMutation,
  usePaginatedQuery,
} from "convex/react";
import {
  Task,
  taskFormSchema,
  TaskFormValues,
  TaskPriority,
} from "../lib/types";
import { api } from "../../../../convex/_generated/api";
import { getDefaultValues } from "../lib/utils";
import { defaultStatuses, priorityOptions } from "../lib/constants";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: Id<"lists">;
  mode: "create" | "edit";

  task?: Task;
  taskId?: Id<"tasks">;
  defaultStatus?: TaskFormValues["status"];
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
          : "border-transparent text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function AssigneeOption({
  selected,
  onClick,
  avatar,
  name,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  avatar: React.ReactNode;
  name: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
        selected && "bg-accent",
      )}
    >
      {avatar}
      <div className="flex  flex-col min-w-0 flex-1 text-left">
        <span className="text-sm font-medium">{name}</span>
        {subtitle && (
          <span className="text-xs text-muted-foreground truncate">
            {subtitle}
          </span>
        )}
      </div>

      {selected && <span className="text-xs text-muted-foreground">✓</span>}
    </button>
  );
}

const TaskDialog = ({
  open,
  onOpenChange,
  listId,
  mode,
  task,
  taskId,
  defaultStatus,
}: Props) => {
  const trpc = useTRPC();
  const createTask = useConvexMutation(api.tasks.create);
  const updateTask = useConvexMutation(api.tasks.update);

  const [assigneesOpen, setAssigneesOpen] = useState(false);
  const [assigneeTab, setAssigneeTab] = useState<"people" | "agents">("people");
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const isEdit = mode === "edit";

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

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: getDefaultValues(task, defaultStatus),
  });

  useEffect(() => {
    if (open) {
      form.reset(
        getDefaultValues(
          isEdit ? task : undefined,
          isEdit ? undefined : defaultStatus,
        ),
      );
    }
  }, [open, isEdit, task, form, defaultStatus]);

  const assigneeIds = form.watch("assigneeIds") ?? [];
  const assignedMembers = members.filter((m) => assigneeIds.includes(m.id));

  const toggleAssignee = (id: string) => {
    const ids = form.getValues("assigneeIds") ?? [];
    form.setValue(
      "assigneeIds",
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  };

  const membersStatus =
    isLoadingMembers && !members.length
      ? "LoadingFirstPage"
      : hasNextPage
        ? isFetchingNextPage
          ? "LoadingMore"
          : "CanLoadMore"
        : "Exhausted";

  const handleSubmit = async (data: TaskFormValues) => {
    if (isEdit && !taskId) return;

    try {
      const taskData = {
        title: data.title,
        description: data.description?.trim() || undefined,
        status: data.status,
        priority: data.priority || undefined,
        assigneeIds: data.assigneeIds?.length ? data.assigneeIds : [],
        startDate: data.startDate?.getTime() || undefined,
        dueDate: data.dueDate?.getTime() || undefined,
      };

      isEdit
        ? await updateTask({ id: taskId!, ...taskData })
        : await createTask({ listId, ...taskData });

      onOpenChange(false);
    } catch (error) {
      console.error(`Failed to ${isEdit ? "update" : "create"} task:`, error);
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the task details below."
              : "Add a new task to this list. Fill in the details below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Title <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Enter task title"
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Add a description..."
                  rows={3}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    {defaultStatuses.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="priority"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={(v) => field.onChange(v as TaskPriority)}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>

                    <SelectContent>
                      {priorityOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          <div className="flex items-center gap-2">
                            <Flag className={cn("size-4", o.flagColor)} />
                            <span>{o.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="assigneeIds"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Assignees</FieldLabel>
                  <Popover open={assigneesOpen} onOpenChange={setAssigneesOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        type="button"
                        className="w-full justify-between"
                        aria-invalid={fieldState.invalid}
                      >
                        TODO Later
                      </Button>
                    </PopoverTrigger>
                  </Popover>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="startDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <DataPicker
                  field={field}
                  fieldState={fieldState}
                  open={startDateOpen}
                  onOpenChange={setStartDateOpen}
                  label="Start Date"
                  placeholder="Pick start date"
                />
              )}
            />
            <Controller
              name="dueDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <DataPicker
                  field={field}
                  fieldState={fieldState}
                  open={dueDateOpen}
                  onOpenChange={setDueDateOpen}
                  label="Due Date"
                  placeholder="Pick due date"
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save Changes"
                  : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;

function DataPicker({
  field,
  fieldState,
  open,
  onOpenChange,
  label,
  placeholder,
}: {
  field: {
    value: Date | null | undefined;
    onChange: (date: Date | null) => void;
  };
  fieldState: { invalid: boolean; error?: { message?: string } };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <Field className="w-full" data-invalid={fieldState.invalid}>
      <FieldLabel>{label}</FieldLabel>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !field.value && "text-muted-foreground",
            )}
            type="button"
            aria-invalid={fieldState.invalid}
          >
            <CalendarIcon className="mr-2 size-4" />
            {field.value ? (
              field.value.toLocaleDateString()
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={field.value ?? undefined}
            onSelect={(data) => {
              field.onChange(data ?? null);
              if (data) onOpenChange(false);
            }}
            defaultMonth={field.value ?? undefined}
          />
        </PopoverContent>
      </Popover>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
