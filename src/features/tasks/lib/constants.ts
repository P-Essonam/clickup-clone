import { TaskPriority, TaskStatus } from "./types";


export const defaultStatuses: TaskStatus[] = [
  {
    id: "todo",
    name: "To Do",
    badgeClassName: "bg-muted text-muted-foreground border-border",
    columnClassName: "bg-muted/60",
  },
  {
    id: "in-progress",
    name: "In Progress",
    badgeClassName: "bg-primary text-primary-foreground border-primary",
    columnClassName: "bg-primary/5 dark:bg-primary/10",
  },
  {
    id: "complete",
    name: "Complete",
    badgeClassName:
      "bg-emerald-700 text-white border-emerald-700 dark:bg-emerald-600 dark:border-emerald-600",
    columnClassName: "bg-emerald-600/5 dark:bg-emerald-500/5",
  },
];



export type PriorityOption = {
  value: TaskPriority;
  label: string;
  color: string;
  flagColor: string;
};



export const priorityOptions: PriorityOption[] = [
  {
    value: "urgent",
    label: "Urgent",
    color: "text-red-600 dark:text-red-400",
    flagColor: "text-red-600 dark:text-red-400",
  },
  {
    value: "high",
    label: "High",
    color: "text-yellow-600 dark:text-yellow-400",
    flagColor: "text-yellow-600 dark:text-yellow-400",
  },
  {
    value: "normal",
    label: "Normal",
    color: "text-blue-600 dark:text-blue-400",
    flagColor: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "low",
    label: "Low",
    color: "text-muted-foreground",
    flagColor: "text-muted-foreground",
  },
]