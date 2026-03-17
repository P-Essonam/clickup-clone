import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
// import { computeTools } from "./lib/utils";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

const vTaskStatus = v.union(
  v.literal("todo"),
  v.literal("in-progress"),
  v.literal("complete"),
);

const vTaskPriority = v.union(
  v.literal("low"),
  v.literal("normal"),
  v.literal("high"),
  v.literal("urgent"),
);

const clamp = (n?: number) =>
  Math.min(Math.max(n ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

// ─────────────────────────────────────────────────────────────────────────────
// Spaces
// ─────────────────────────────────────────────────────────────────────────────

export const listSpaces = internalQuery({
  args: {
    organizationId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { organizationId, limit }) =>
    ctx.db
      .query("spaces")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId),
      )
      .order("asc")
      .take(clamp(limit)),
});

export const getSpace = internalQuery({
  args: { spaceId: v.id("spaces") },
  handler: async (ctx, { spaceId }) => ctx.db.get(spaceId),
});

export const findSpacesByName = internalQuery({
  args: {
    organizationId: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { organizationId, query, limit }) =>
    ctx.db
      .query("spaces")
      .withSearchIndex("search_by_name", (q) =>
        q.search("name", query).eq("organizationId", organizationId),
      )
      .take(clamp(limit)),
});

export const createSpace = internalMutation({
  args: {
    organizationId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, { organizationId, name, description, color, icon }) => {
    const now = Date.now();
    const last = await ctx.db
      .query("spaces")
      .withIndex("by_organization_and_sort", (q) =>
        q.eq("organizationId", organizationId),
      )
      .order("desc")
      .first();
    return ctx.db.insert("spaces", {
      name,
      description,
      color,
      icon,
      organizationId,
      sortOrder: last ? last.sortOrder + 1 : 0,
      updatedAt: now,
    });
  },
});

export const updateSpace = internalMutation({
  args: {
    spaceId: v.id("spaces"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, { spaceId, name, description, color, icon }) =>
    ctx.db.patch(spaceId, {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(color !== undefined && { color }),
      ...(icon !== undefined && { icon }),
      updatedAt: Date.now(),
    }),
});

export const deleteSpace = internalMutation({
  args: { spaceId: v.id("spaces") },
  handler: async (ctx, { spaceId }) => {
    const lists = await ctx.db
      .query("lists")
      .withIndex("by_space", (q) => q.eq("spaceId", spaceId))
      .collect();
    for (const list of lists) {
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_organizationId_and_listId", (q) =>
          q.eq("organizationId", list.organizationId).eq("listId", list._id),
        )
        .collect();
      for (const task of tasks) await ctx.db.delete(task._id);
      await ctx.db.delete(list._id);
    }
    await ctx.db.delete(spaceId);
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Lists
// ─────────────────────────────────────────────────────────────────────────────

export const listListsBySpace = internalQuery({
  args: {
    spaceId: v.id("spaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { spaceId, limit }) =>
    ctx.db
      .query("lists")
      .withIndex("by_space", (q) => q.eq("spaceId", spaceId))
      .order("asc")
      .take(clamp(limit)),
});

export const getList = internalQuery({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => ctx.db.get(listId),
});

export const getListWithSpace = internalQuery({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    const list = await ctx.db.get(listId);
    if (!list) return null;
    const space = await ctx.db.get(list.spaceId);
    return { list, space };
  },
});

export const findListsByName = internalQuery({
  args: {
    organizationId: v.string(),
    query: v.string(),
    spaceId: v.optional(v.id("spaces")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { organizationId, query, spaceId, limit }) => {
    const search = ctx.db
      .query("lists")
      .withSearchIndex("search_by_name", (q) => {
        const base = q
          .search("name", query)
          .eq("organizationId", organizationId);
        return spaceId ? base.eq("spaceId", spaceId) : base;
      });
    return search.take(clamp(limit));
  },
});

export const createList = internalMutation({
  args: {
    organizationId: v.string(),
    spaceId: v.id("spaces"),
    name: v.string(),
  },
  handler: async (ctx, { organizationId, spaceId, name }) => {
    const now = Date.now();
    const last = await ctx.db
      .query("lists")
      .withIndex("by_space_and_sort", (q) => q.eq("spaceId", spaceId))
      .order("desc")
      .first();
    return ctx.db.insert("lists", {
      name,
      spaceId,
      organizationId,
      sortOrder: last ? last.sortOrder + 1 : 0,
      updatedAt: now,
    });
  },
});

export const updateList = internalMutation({
  args: {
    listId: v.id("lists"),
    name: v.optional(v.string()),
    spaceId: v.optional(v.id("spaces")),
  },
  handler: async (ctx, { listId, name, spaceId }) =>
    ctx.db.patch(listId, {
      ...(name !== undefined && { name }),
      ...(spaceId !== undefined && { spaceId }),
      updatedAt: Date.now(),
    }),
});

export const deleteList = internalMutation({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    const list = await ctx.db.get(listId);
    if (!list) return;
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_organizationId_and_listId", (q) =>
        q.eq("organizationId", list.organizationId).eq("listId", listId),
      )
      .collect();
    for (const task of tasks) await ctx.db.delete(task._id);
    await ctx.db.delete(listId);
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Tasks
// ─────────────────────────────────────────────────────────────────────────────

export const listTasksByList = internalQuery({
  args: {
    organizationId: v.string(),
    listId: v.id("lists"),
    status: v.optional(vTaskStatus),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { organizationId, listId, status, limit }) => {
    const q = status
      ? ctx.db
          .query("tasks")
          .withIndex("by_org_list_status_sort", (idx) =>
            idx
              .eq("organizationId", organizationId)
              .eq("listId", listId)
              .eq("status", status),
          )
      : ctx.db
          .query("tasks")
          .withIndex("by_organizationId_and_listId", (idx) =>
            idx.eq("organizationId", organizationId).eq("listId", listId),
          );
    return q.order("asc").take(clamp(limit));
  },
});

export const getTask = internalQuery({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => ctx.db.get(taskId),
});

export const findTasksByText = internalQuery({
  args: {
    organizationId: v.string(),
    query: v.string(),
    listId: v.optional(v.id("lists")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { organizationId, query, listId, limit }) => {
    const search = ctx.db
      .query("tasks")
      .withSearchIndex("search_by_title", (q) => {
        const base = q
          .search("title", query)
          .eq("organizationId", organizationId);
        return listId ? base.eq("listId", listId) : base;
      });
    return search.take(clamp(limit));
  },
});

export const createTask = internalMutation({
  args: {
    organizationId: v.string(),
    listId: v.id("lists"),
    title: v.string(),
    description: v.optional(v.string()),
    status: vTaskStatus,
    priority: v.optional(vTaskPriority),
    assigneeIds: v.optional(v.array(v.string())),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const last = await ctx.db
      .query("tasks")
      .withIndex("by_list_status_and_sort", (q) =>
        q.eq("listId", args.listId).eq("status", args.status),
      )
      .order("desc")
      .first();
    return ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      listId: args.listId,
      status: args.status,
      sortOrder: last ? last.sortOrder + 1 : 0,
      priority: args.priority,
      assigneeIds: args.assigneeIds ?? [],
      startDate: args.startDate,
      dueDate: args.dueDate,
      organizationId: args.organizationId,
      updatedAt: now,
    });
  },
});

export const updateTask = internalMutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(vTaskStatus),
    priority: v.optional(vTaskPriority),
    assigneeIds: v.optional(v.array(v.string())),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) return;

    let sortOrder = task.sortOrder;
    if (args.status && args.status !== task.status) {
      const last = await ctx.db
        .query("tasks")
        .withIndex("by_list_status_and_sort", (q) =>
          q.eq("listId", task.listId).eq("status", args.status!),
        )
        .order("desc")
        .first();
      sortOrder = last ? last.sortOrder + 1 : 0;
    }

    return ctx.db.patch(args.taskId, {
      ...(args.title !== undefined && { title: args.title }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.status !== undefined && { status: args.status, sortOrder }),
      ...(args.priority !== undefined && { priority: args.priority }),
      ...(args.assigneeIds !== undefined && { assigneeIds: args.assigneeIds }),
      ...(args.startDate !== undefined && { startDate: args.startDate }),
      ...(args.dueDate !== undefined && { dueDate: args.dueDate }),
      updatedAt: Date.now(),
    });
  },
});

export const updateTaskStatus = internalMutation({
  args: {
    taskId: v.id("tasks"),
    status: vTaskStatus,
    sortOrder: v.number(),
  },
  handler: async (ctx, { taskId, status, sortOrder }) =>
    ctx.db.patch(taskId, { status, sortOrder, updatedAt: Date.now() }),
});

export const deleteTask = internalMutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => ctx.db.delete(taskId),
});

// ─────────────────────────────────────────────────────────────────────────────
// Agents
// ─────────────────────────────────────────────────────────────────────────────

// export const listAgents = internalQuery({
//   args: {
//     organizationId: v.string(),
//     limit: v.optional(v.number()),
//   },
//   handler: async (ctx, { organizationId, limit }) =>
//     ctx.db
//       .query("agents")
//       .withIndex("by_organization", (q) =>
//         q.eq("organizationId", organizationId),
//       )
//       .order("desc")
//       .take(clamp(limit)),
// });

// export const createOrUpdateAgent = internalMutation({
//   args: {
//     organizationId: v.string(),
//     ownerId: v.string(),
//     threadId: v.string(),
//     name: v.string(),
//     description: v.string(),
//     instructions: v.string(),
//     avatar: v.string(), // Required: one of /avatar1.jpg, /avatar2.jpg, /avatar3.jpg
//     tools: v.optional(v.array(v.string())),
//   },
//   handler: async (ctx, args) => {
//     // Compute tools from instruction text
//     const tools = computeTools(args.instructions);

//     const now = Date.now();
//     const existing = await ctx.db
//       .query("agents")
//       .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
//       .first();

//     if (existing) {
//       await ctx.db.patch(existing._id, {
//         ...(args.name !== undefined && { name: args.name }),
//         ...(args.description !== undefined && {
//           description: args.description,
//         }),
//         ...(args.instructions !== undefined && {
//           instructions: args.instructions,
//         }),
//         ...(args.threadId !== undefined && { threadId: args.threadId }),
//         tools, // Use computed tools
//         updatedAt: now,
//         // Note: avatar is never updated after creation
//       });
//       return existing._id;
//     }

//     return ctx.db.insert("agents", {
//       name: args.name,
//       description: args.description,
//       organizationId: args.organizationId,
//       ownerId: args.ownerId,
//       threadId: args.threadId,
//       instructions: args.instructions,
//       avatar: args.avatar,
//       isActive: true,
//       manualTriggers: {
//         assignTask: true,
//       },
//       tools, // Use computed tools
//       createdAt: now,
//       updatedAt: now,
//     });
//   },
// });