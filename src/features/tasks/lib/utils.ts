import { Task, TaskFormValues } from "./types";


export function getDefaultValues(
  task?: Task,
  defaultStatus?: TaskFormValues["status"],
): TaskFormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? defaultStatus ?? "todo",
    priority: task?.priority ?? null,
    assigneeIds: task?.assigneeIds ?? [],
    startDate: task?.startDate ? new Date(task.startDate) : null,
    dueDate: task?.dueDate ? new Date(task.dueDate) : null,
  };
}


export function formatTaskDate(timestamp: number | undefined): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}


export function formatPriority(priority: string | undefined): string {
  if (!priority) return "-";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}


export function prepareTaskUpdate(
  task: Task,
  updates: Partial<
    Pick<
      Task,
      | "title"
      | "description"
      | "priority"
      | "assigneeIds"
      | "startDate"
      | "dueDate"
    >
  >,
) {
  return {
    id: task._id,
    ...{
      title: task.title,
      description: task.description,
      priority: task.priority,
      assigneeIds: task.assigneeIds,
      startDate: task.startDate,
      dueDate: task.dueDate,
    },
    ...updates,
  };
}