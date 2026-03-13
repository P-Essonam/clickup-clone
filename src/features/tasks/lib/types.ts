import z from "zod";
import { Doc } from "../../../../convex/_generated/dataModel";


export type Task = Doc<"tasks">;
export type StatusKey = Doc<"tasks">["status"];

export type TaskPriority = Exclude<Doc<"tasks">["priority"], undefined>;


export type TaskStatus = {
  id: string;
  name: string;
  badgeClassName?: string;
  columnClassName?: string;
};


export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "complete"]),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional().nullable(),
  assigneeIds: z.array(z.string()).optional(),
  startDate: z.date().optional().nullable(),
  dueDate: z.date().optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;