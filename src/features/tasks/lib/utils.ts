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