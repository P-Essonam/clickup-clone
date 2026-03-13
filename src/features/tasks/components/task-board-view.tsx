import React, { useEffect, useMemo } from "react";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { StatusKey, Task, TaskStatus } from "../lib/types";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { defaultStatuses, priorityOptions } from "../lib/constants";
import { formatTaskDate } from "../lib/utils";
import {
  DragDropContext,
  Draggable,
  DragStart,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getMemberInitials } from "@/lib/utils";
import { Calendar, Flag, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PER_PAGE } from "@/lib/constants";
import InfiniteScroll from "@/components/infinite-scroll";
import TaskDialog from "./task-dialog";

interface Props {
  listId: Id<"lists">;
}

const TaskBoardView = ({ listId }: Props) => {
  const reorderTasks = useMutation(api.tasks.reorder);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [defaultStatus, setDefaultStatus] = React.useState<StatusKey>("todo");

  const [optimisticTasks, setOptimisticTasks] = React.useState<
    Partial<Record<StatusKey, Task[]>>
  >({});

  const todoQuery = usePaginatedQuery(
    api.tasks.listByListAndStatus,
    { listId, status: "todo" },
    { initialNumItems: PER_PAGE },
  );

  const inProgressQuery = usePaginatedQuery(
    api.tasks.listByListAndStatus,
    { listId, status: "in-progress" },
    { initialNumItems: PER_PAGE },
  );

  const completeQuery = usePaginatedQuery(
    api.tasks.listByListAndStatus,
    { listId, status: "complete" },
    { initialNumItems: PER_PAGE },
  );

  const statusQueries = {
    todo: todoQuery,
    "in-progress": inProgressQuery,
    complete: completeQuery,
  };

  const serverTasksByStatus: Record<StatusKey, Task[]> = useMemo(
    () => ({
      todo: todoQuery.results,
      "in-progress": inProgressQuery.results,
      complete: completeQuery.results,
    }),
    [todoQuery.results, inProgressQuery.results, completeQuery.results],
  );

  const tasksByStatus: Record<StatusKey, Task[]> = useMemo(
    () => ({
      todo: optimisticTasks.todo ?? serverTasksByStatus.todo,
      "in-progress":
        optimisticTasks["in-progress"] ?? serverTasksByStatus["in-progress"],
      complete: optimisticTasks.complete ?? serverTasksByStatus.complete,
    }),
    [optimisticTasks, serverTasksByStatus],
  );

  useEffect(() => {
    if (Object.keys(optimisticTasks).length === 0) return;
    setOptimisticTasks((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const status of Object.keys(prev) as StatusKey[]) {
        const optimistic = prev[status];
        const server = serverTasksByStatus[status];

        if (!optimistic) continue;

        const optimisticIds = optimistic.map((t) => t._id).join(",");
        const serverIds = server.map((s) => s._id).join(",");

        if (optimisticIds === serverIds) {
          delete next[status];
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [serverTasksByStatus, optimisticTasks]);

  const handleDragStart = (_start: DragStart) => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);

    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStatusId = source.droppableId as StatusKey;
    const destStatusId = destination.droppableId as StatusKey;

    const previousOptimisticState = { ...optimisticTasks };

    const sourceTasks = [...tasksByStatus[sourceStatusId]];
    const destTasks =
      sourceStatusId === destStatusId
        ? sourceTasks
        : [...tasksByStatus[destStatusId]];

    const [movedTask] = sourceTasks.splice(source.index, 1);
    if (!movedTask) return;

    const updatedTask =
      sourceStatusId !== destStatusId
        ? { ...movedTask, status: destStatusId }
        : movedTask

    if (sourceStatusId === destStatusId) {
      sourceTasks.splice(destination.index, 0, updatedTask);
    } else {
      destTasks.splice(destination.index, 0, updatedTask);
    }

    setOptimisticTasks((prev) => ({
      ...prev,
      [sourceStatusId]: sourceTasks,
      ...(sourceStatusId !== destStatusId && { [destStatusId]: destTasks }),
    }));

    const orderedIds = destTasks.map((t) => t._id);

    try {
      await reorderTasks({
        listId,
        status: destStatusId,
        orderedIds,
      });
    } catch (error) {
      setOptimisticTasks(previousOptimisticState);
    }
  };

  return (
    <>
      <div className="flex h-full flex-col">
        <DragDropContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            className={cn(
              "flex flex-1 gap-4 overflow-x-auto pb-2",
              isDragging && "**:cursor-pointer",
            )}
          >
            {defaultStatuses.map((taskStatus) => {
              const statuskey = taskStatus.id as StatusKey;
              const query = statusQueries[statuskey];

              return (
                <BoardColumn
                  key={taskStatus.id}
                  status={taskStatus}
                  tasks={tasksByStatus[statuskey]}
                  onAddTask={() => {
                    setEditingTask(null);
                    setDefaultStatus(statuskey);
                    setIsDialogOpen(true);
                  }}
                  onTaskClick={(task) => {
                    setEditingTask(task);
                    setIsDialogOpen(true);
                  }}
                >
                  <InfiniteScroll
                    status={query.status}
                    isLoading={query.isLoading}
                    loadMore={query.loadMore}
                    numItems={PER_PAGE}
                  />
                </BoardColumn>
              );
            })}
          </div>
        </DragDropContext>
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
        defaultStatus={editingTask ? undefined : defaultStatus}
      />
    </>
  );
};

export default TaskBoardView;

function TaskCard({
  task,
  index,
  onClick,
}: {
  task: Task;
  index: number;
  onClick: () => void;
}) {
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.organization.listMembers.queryOptions({
      limit: 100,
    }),
  );

  const members = data?.items ?? [];

  const assignedMembers = React.useMemo(() => {
    return members.filter((m) => task.assigneeIds.includes(m.id));
  }, [members, task.assigneeIds]);

  const priorityOption = task.priority
    ? priorityOptions.find((opt) => opt.value === task.priority)
    : null;

  const formattedDate = task.dueDate ? formatTaskDate(task.dueDate) : null;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => {
              if (!snapshot.isDragging) onClick();
            }}
            className="flex flex-col gap-3 rounded-lg bg-card text-foreground dark:bg-secondary p-3 border  cursor-pointer!"
          >
            <div className="text-sm font-medium leading-tight">
              {task.title}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {assignedMembers.length > 0 && (
                  <div className="flex items-center gap-1 -space-x-1">
                    {assignedMembers.slice(0, 2).map((member) => (
                      <Avatar key={member.id} className="size-5">
                        <AvatarImage
                          src={member.profilePictureUrl || undefined}
                        />
                        <AvatarFallback className="text-[10px] font-medium text-white">
                          {getMemberInitials(member)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {assignedMembers.length > 2 && (
                      <span className="ml-1 text-xs font-medium">
                        +{assignedMembers.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {formattedDate && (
                  <div className="flex items-center gap-1 text-xs">
                    <Calendar className="size-3" />
                    <span>{formattedDate}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {priorityOption && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      priorityOption.flagColor,
                    )}
                  >
                    <Flag className="size-3 fill-current" />
                    <span className="font-medium">{priorityOption.label}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
}

function BoardColumn({
  status,
  tasks,
  children,
  onAddTask,
  onTaskClick,
}: {
  status: TaskStatus;
  tasks: Task[];
  children: React.ReactNode;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
}) {
  return (
    <div
      className={cn(
        "grid h-full max-h-full min-w-75  flex-1 grid-rows-[auto_1fr] rounded-lg p-2",
        status.columnClassName,
      )}
    >
      <div className="mb-3 flex shrink-0 sticky top-0 items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Badge
            variant={"outline"}
            className={cn(
              "rounded-sm border-transparent px-2 py-0.5 text-xs  font-medium uppercase",
              status.badgeClassName,
            )}
          >
            {status.name}
          </Badge>
          <span className="text-xs text-muted-foreground">{tasks.length}</span>
        </div>
      </div>

      <Droppable droppableId={status.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1",
              snapshot.isDraggingOver && "rounded-md bg-black/5",
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {provided.placeholder}
            <Button
              variant={"ghost"}
              className="mt-1 w-full shrink-0 justify-start gap-2 text-muted-foreground hover:bg-black/5 hover:text-foreground"
              onClick={onAddTask}
            >
              <Plus className="size-4" />
              Add Task
            </Button>

            {children}
          </div>
        )}
      </Droppable>
    </div>
  );
}
