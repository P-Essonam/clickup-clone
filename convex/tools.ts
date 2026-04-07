import { createTool } from "@convex-dev/agent";
import type { ToolSet } from "ai";
import z from "zod/v3";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import type { BrainCtx } from "./brain";
// import type { CreateAgentCtx } from "./agentsCreation";
import { ConvexError } from "convex/values";
import { CreateAgentCtx } from "./agentsCreation";

// Shared schemas
const zLimit = z
  .number()
  .int()
  .min(1)
  .max(100)
  .optional()
  .describe("Max results (default: 50, max: 100)");
const zTaskStatus = z
  .enum(["todo", "in-progress", "complete"])
  .describe("'todo', 'in-progress', or 'complete'");
const zTaskPriority = z
  .enum(["low", "normal", "high", "urgent"])
  .describe("'low', 'normal', 'high', or 'urgent'");
const zColor = z
  .enum([
    "bg-violet-500",
    "bg-indigo-500",
    "bg-blue-500",
    "bg-sky-500",
    "bg-teal-500",
    "bg-emerald-500",
    "bg-green-500",
    "bg-amber-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-rose-500",
    "bg-pink-500",
    "bg-fuchsia-500",
    "bg-stone-500",
  ])
  .describe("Tailwind color class");

// ─────────────────────────────────────────────────────────────────────────────
// Spaces
// ─────────────────────────────────────────────────────────────────────────────

export const listSpaces = createTool({
  description: "Get all spaces in the workspace",
  args: z.object({ limit: zLimit }),
  handler: async (ctx: BrainCtx, args): Promise<Doc<"spaces">[]> => {
    return (await ctx.runQuery(internal.toolsApi.listSpaces, {
      organizationId: ctx.organizationId,
      limit: args.limit,
    })) as Doc<"spaces">[];
  },
});

export const getSpace = createTool({
  description: "Get space details by ID",
  args: z.object({ spaceId: z.string().describe("Space ID") }),
  handler: async (ctx: BrainCtx, args): Promise<Doc<"spaces"> | null> => {
    return (await ctx.runQuery(internal.toolsApi.getSpace, {
      spaceId: args.spaceId as Id<"spaces">,
    })) as Doc<"spaces"> | null;
  },
});

export const findSpaceByName = createTool({
  description: "Find spaces by name (case-insensitive, partial matching)",
  args: z.object({
    query: z.string().min(1).describe("Space name to search"),
    limit: zLimit,
  }),
  handler: async (ctx: BrainCtx, args): Promise<Doc<"spaces">[]> => {
    return (await ctx.runQuery(internal.toolsApi.findSpacesByName, {
      organizationId: ctx.organizationId,
      query: args.query,
      limit: args.limit,
    })) as Doc<"spaces">[];
  },
});

export const createSpace = createTool({
  description: "Create a new space",
  args: z.object({
    name: z.string().min(1).describe("Space name"),
    description: z.string().optional().describe("Space description"),
    color: zColor,
    icon: z
      .string()
      .min(1)
      .describe("Lucide icon name (e.g., 'Folder', 'Rocket', 'Star')"),
  }),
  handler: async (ctx: BrainCtx, args): Promise<Id<"spaces">> => {
    return (await ctx.runMutation(internal.toolsApi.createSpace, {
      organizationId: ctx.organizationId,
      ...args,
    })) as Id<"spaces">;
  },
});

export const updateSpace = createTool({
  description: "Update space properties",
  args: z.object({
    spaceId: z.string().describe("Space ID"),
    name: z.string().optional().describe("New name"),
    description: z.string().optional().describe("New description"),
    color: zColor.optional(),
    icon: z.string().optional().describe("New icon"),
  }),
  handler: async (ctx: BrainCtx, args): Promise<string> => {
    await ctx.runMutation(internal.toolsApi.updateSpace, {
      ...args,
      spaceId: args.spaceId as Id<"spaces">,
    });
    return args.spaceId;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Lists
// ─────────────────────────────────────────────────────────────────────────────

export const listListsBySpace = createTool({
  description: "Get all lists in a space",
  args: z.object({ spaceId: z.string().describe("Space ID"), limit: zLimit }),
  handler: async (ctx: BrainCtx, args): Promise<Doc<"lists">[]> => {
    return (await ctx.runQuery(internal.toolsApi.listListsBySpace, {
      ...args,
      spaceId: args.spaceId as Id<"spaces">,
    })) as Doc<"lists">[];
  },
});

export const getList = createTool({
  description: "Get list details by ID",
  args: z.object({ listId: z.string().describe("List ID") }),
  handler: async (ctx: BrainCtx, args): Promise<Doc<"lists"> | null> => {
    return (await ctx.runQuery(internal.toolsApi.getList, {
      listId: args.listId as Id<"lists">,
    })) as Doc<"lists"> | null;
  },
});

export const findListByName = createTool({
  description:
    "Find lists by name (case-insensitive, partial matching). Searches across all spaces if no spaceId is provided.",
  args: z.object({
    query: z.string().min(1).describe("List name to search"),
    spaceId: z
      .string()
      .optional()
      .describe("Optional: Limit search to this specific space"),
    limit: zLimit,
  }),
  handler: async (ctx: BrainCtx, args): Promise<Doc<"lists">[]> => {
    return (await ctx.runQuery(internal.toolsApi.findListsByName, {
      organizationId: ctx.organizationId,
      query: args.query,
      limit: args.limit,
      spaceId: args.spaceId as Id<"spaces"> | undefined,
    })) as Doc<"lists">[];
  },
});

export const createList = createTool({
  description: "Create a new list in a space",
  args: z.object({
    spaceId: z.string().describe("Space ID"),
    name: z.string().min(1).describe("List name"),
  }),
  handler: async (ctx: BrainCtx, args): Promise<Id<"lists">> => {
    return (await ctx.runMutation(internal.toolsApi.createList, {
      organizationId: ctx.organizationId,
      ...args,
      spaceId: args.spaceId as Id<"spaces">,
    })) as Id<"lists">;
  },
});

export const updateList = createTool({
  description: "Update list name or move to different space",
  args: z.object({
    listId: z.string().describe("List ID"),
    name: z.string().optional().describe("New name"),
    spaceId: z.string().optional().describe("New space ID"),
  }),
  handler: async (ctx: BrainCtx, args): Promise<string> => {
    await ctx.runMutation(internal.toolsApi.updateList, {
      ...args,
      listId: args.listId as Id<"lists">,
      spaceId: args.spaceId as Id<"spaces"> | undefined,
    });
    return args.listId;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Tasks
// ─────────────────────────────────────────────────────────────────────────────

export const listTasks = createTool({
  description: "Get tasks from a list",
  args: z.object({
    listId: z.string().describe("List ID"),
    status: zTaskStatus.optional().describe("Filter by status"),
    limit: zLimit,
  }),
  handler: async (ctx: BrainCtx, args): Promise<Doc<"tasks">[]> => {
    return (await ctx.runQuery(internal.toolsApi.listTasksByList, {
      organizationId: ctx.organizationId,
      status: args.status,
      limit: args.limit,
      listId: args.listId as Id<"lists">,
    })) as Doc<"tasks">[];
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Members
// ─────────────────────────────────────────────────────────────────────────────

export const listMembers = createTool({
  description: "Get all members in the workspace with their IDs and names",
  args: z.object({ limit: zLimit }),
  handler: async (
    ctx: BrainCtx,
    args,
  ): Promise<Array<{ userId: string; name: string }>> => {
    return await ctx.runAction(internal.nodeAction.listMembersIds, {
      organizationId: ctx.organizationId,
      limit: args.limit,
    });
  },
});

export const getTask = createTool({
  description: "Get task details by ID",
  args: z.object({ taskId: z.string().describe("Task ID") }),
  handler: async (ctx: BrainCtx, args): Promise<Doc<"tasks"> | null> => {
    return (await ctx.runQuery(internal.toolsApi.getTask, {
      taskId: args.taskId as Id<"tasks">,
    })) as Doc<"tasks"> | null;
  },
});

export const findTask = createTool({
  description:
    "Search tasks by title (case-insensitive, partial matching). Searches across all lists in the workspace if no listId is provided.",
  args: z.object({
    query: z.string().min(1).describe("Text to search in task title"),
    listId: z
      .string()
      .optional()
      .describe("Optional: Limit search to this specific list"),
    limit: zLimit,
  }),
  handler: async (ctx: BrainCtx, args): Promise<Doc<"tasks">[]> => {
    return (await ctx.runQuery(internal.toolsApi.findTasksByText, {
      organizationId: ctx.organizationId,
      query: args.query,
      limit: args.limit,
      listId: args.listId as Id<"lists"> | undefined,
    })) as Doc<"tasks">[];
  },
});

export const createTask = createTool({
  description: "Create a new task in a list",
  args: z.object({
    listId: z.string().describe("List ID"),
    title: z.string().min(1).describe("Task title"),
    description: z.string().optional().describe("Task description"),
    status: zTaskStatus.default("todo"),
    priority: zTaskPriority.optional(),
    assigneeIds: z.array(z.string()).optional().describe("User IDs to assign"),
    startDate: z.number().optional().describe("Start date (Unix ms)"),
    dueDate: z.number().optional().describe("Due date (Unix ms)"),
  }),
  handler: async (ctx: BrainCtx, args): Promise<Id<"tasks">> => {
    return (await ctx.runMutation(internal.toolsApi.createTask, {
      organizationId: ctx.organizationId,
      ...args,
      listId: args.listId as Id<"lists">,
    })) as Id<"tasks">;
  },
});

export const updateTask = createTool({
  description: "Update task properties",
  args: z.object({
    taskId: z.string().describe("Task ID"),
    title: z.string().optional().describe("New title"),
    description: z.string().optional().describe("New description"),
    status: zTaskStatus.optional(),
    priority: zTaskPriority.optional(),
    assigneeIds: z.array(z.string()).optional().describe("New assignee IDs"),
    startDate: z.number().optional().describe("New start date (Unix ms)"),
    dueDate: z.number().optional().describe("New due date (Unix ms)"),
  }),
  handler: async (ctx: BrainCtx, args): Promise<string> => {
    await ctx.runMutation(internal.toolsApi.updateTask, {
      ...args,
      taskId: args.taskId as Id<"tasks">,
    });
    return args.taskId;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Agents
// ─────────────────────────────────────────────────────────────────────────────

export const listAgents = createTool({
  description: "Get all agents in the workspace",
  args: z.object({ limit: zLimit }),
  handler: async (ctx: BrainCtx, args): Promise<Doc<"agents">[]> => {
    return (await ctx.runQuery(internal.toolsApi.listAgents, {
      organizationId: ctx.organizationId,
      limit: args.limit,
    })) as Doc<"agents">[];
  },
});

export const createOrUpdateAgent = createTool({
  description:
    "Create a new agent or update an existing one. Use agentId to update, omit to create. The threadId will be automatically set from the current conversation thread.",
  args: z.object({
    name: z.string().describe("Agent name"),
    description: z.string().describe("Agent description"),
    instructions: z.string().describe("Agent instructions/prompt"),
    avatar: z
      .string()
      .describe(
        "Agent avatar path - must be one of: /avatar1.jpg, /avatar2.jpg, /avatar3.jpg",
      ),
    tools: z
      .array(z.string())
      .optional()
      .describe("Array of tool IDs the agent can use"),
  }),
  handler: async (ctx: CreateAgentCtx, args): Promise<Id<"agents">> => {
    let threadId = ctx.threadId;
    if (!threadId) {
      throw new ConvexError("Thread ID is required");
    }

    return (await ctx.runMutation(internal.toolsApi.createOrUpdateAgent, {
      organizationId: ctx.organizationId,
      ownerId: ctx.ownerId,
      threadId: threadId,
      name: args.name,
      description: args.description,
      instructions: args.instructions,
      avatar: args.avatar,
      tools: args.tools,
    })) as Id<"agents">;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export const tools: ToolSet = {
  listSpaces,
  getSpace,
  findSpaceByName,
  createSpace,
  updateSpace,
  listListsBySpace,
  getList,
  findListByName,
  createList,
  updateList,
  listTasks,
  getTask,
  findTask,
  createTask,
  updateTask,
  listMembers,
  listAgents,
};