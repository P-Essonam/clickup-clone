import { Id } from "../../../../convex/_generated/dataModel";

import * as React from "react";
import { useMutation, usePaginatedQuery } from "convex/react";
import {
  ChevronDown,
  CheckSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import InfiniteScroll from "@/components/infinite-scroll";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

import TaskAssigneeCell from "./task-assignee-cell";
import TaskDueDateCell from "./task-due-date-cell";
import TaskPriorityCell from "./task-priority-cell";
import { api } from "../../../../convex/_generated/api";
import { Task } from "../lib/types";
import { defaultStatuses } from "../lib/constants";
import { PER_PAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { prepareTaskUpdate } from "../lib/utils";
import TaskDialog from "./task-dialog";
import DeleteConfirmDialog from "@/components/delete-confirm-dialog";

interface Props {
  listId: Id<"lists">;
}

const TaskListView = ({ listId }: Props) => {
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);

  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [deletingTask, setDeletingTask] = React.useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const toggleStatus = (statusId: string) => {
    setCollapsed((prev) => ({ ...prev, [statusId]: !prev[statusId] }));
  };

  const visibleStatuses = defaultStatuses.filter(
    (status) => status.id !== "complete",
  );

  const todoTasks = usePaginatedQuery(
    api.tasks.listByListAndStatus,
    { listId, status: "todo" },
    { initialNumItems: PER_PAGE },
  );

  const inProgressTasks = usePaginatedQuery(
    api.tasks.listByListAndStatus,
    { listId, status: "in-progress" },
    { initialNumItems: PER_PAGE },
  );

  const statusesWithTasks = visibleStatuses
    .map((status) => {
      const queryResult = status.id === "todo" ? todoTasks : inProgressTasks;
      return {
        status,
        queryResult,
        tasks: queryResult.results,
      };
    })
    .filter(({ tasks }) => tasks.length > 0);

  if (
    !todoTasks.isLoading &&
    !inProgressTasks.isLoading &&
    statusesWithTasks.length === 0
  ) {
    return (
      <div className="flex  h-full flex-col overflow-y-auto">
        <Empty>
          <EmptyMedia variant={"icon"}>
            <CheckSquare className="size-6" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No tasks yet</EmptyTitle>
            <EmptyDescription>
              Get started by creating your first task in this list.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex flex-col gap-10 mt-4">
          {statusesWithTasks.map(({ status, queryResult, tasks }) => {
            const isCollapsed = collapsed[status.id] ?? false;
            return (
              <div key={status.id} className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => toggleStatus(status.id)}
                  className="flex w-fit items-center gap-2 text-sm font-medium"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        isCollapsed && "-rotate-90",
                      )}
                    />
                    <Badge
                      variant={"outline"}
                      className={cn(
                        "uppercase px-3 rounded-sm",
                        status.badgeClassName,
                      )}
                    >
                      {status.name}
                    </Badge>
                    <span className="text-xs  text-muted-foreground">
                      {tasks.length}
                    </span>
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="w-full">
                    <table className="w-fulln caption-bottom text-sm">
                      <thead className="sticky top-0 z-10 bg-background [&_tr]:border-b">
                        <tr className="border-b hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors">
                          <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap w-[40%]">
                            Name
                          </th>
                          <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap w-[20%]">
                            Assignee
                          </th>
                          <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap w-[20%]">
                            Due Date
                          </th>
                          <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap w-[20%]">
                            Priority
                          </th>
                          <th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap" />
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {tasks.map((task) => (
                          <tr
                            key={task._id}
                            className="border-b hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors"
                          >
                            <td className="p-2 align-middle whitespace-nowrap">
                              {task.title}
                            </td>
                            <td className="p-2  align-middle whitespace-nowrap">
                              <TaskAssigneeCell
                                task={task}
                                onUpdate={(assigneeIds) => {
                                  updateTask(
                                    prepareTaskUpdate(task, { assigneeIds }),
                                  );
                                }}
                              />
                            </td>
                            <td className="p-2  align-middle whitespace-nowrap">
                              <TaskDueDateCell
                                task={task}
                                onUpdate={(startDate, dueDate) => {
                                  updateTask(
                                    prepareTaskUpdate(task, {
                                      startDate: startDate ?? undefined,
                                      dueDate: dueDate ?? undefined,
                                    }),
                                  );
                                }}
                              />
                            </td>
                            <td className="p-2  align-middle whitespace-nowrap">
                              <TaskPriorityCell
                                task={task}
                                onUpdate={(priority) => {
                                  updateTask(
                                    prepareTaskUpdate(task, {
                                      priority,
                                    }),
                                  );
                                }}
                              />
                            </td>

                            <td className="p-2  align-middle whitespace-nowrap">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant={"ghost"}
                                    size={"icon-sm"}
                                    className="text-muted-foreground"
                                  >
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      setEditingTask(task);
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="size-4" />
                                    Edit task
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={() => {
                                      setDeletingTask(task);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="size-4" />
                                    Delete task
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <InfiniteScroll
                      status={queryResult.status}
                      isLoading={queryResult.isLoading}
                      loadMore={queryResult.loadMore}
                      numItems={PER_PAGE}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingTask(null);
          }
        }}
        listId={listId}
        mode={editingTask ? "edit" : "create"}
        task={editingTask ?? undefined}
        taskId={editingTask?._id}
      />
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeletingTask(null);
          }
        }}
        title="Delete task"
        description={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        onConfirm={() => {
          if (deletingTask) {
            deleteTask({ id: deletingTask._id });
            setIsDeleteDialogOpen(false);
            setDeletingTask(null);
          }
        }}
      />
    </>
  );
};

export default TaskListView;
