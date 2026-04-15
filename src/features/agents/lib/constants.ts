import { AlertCircle, BarChart3, ClipboardList } from "lucide-react";

export const SUGGESTED_AGENTS = [
  {
    title: "Daily Briefer",
    description: "Summarizes today's priorities and flags overdue items.",
    icon: BarChart3,
  },
  {
    title: "Priorities Manager",
    description: "Continuously manages priorities, identifying urgent tasks",
    icon: AlertCircle,
  },
  {
    title: "Triage New Tasks",
    description:
      "Reviews incoming tasks to prioritize, schedule, & automatically fill all details.",
    icon: ClipboardList,
  },
] as const;