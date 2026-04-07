import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  onbording: defineTable({
    workosOrganizationId: v.string(),
    workspaceType: v.optional(v.string()),
    manageType: v.optional(v.string()),
  }).index("by_workos_organization_id", ["workosOrganizationId"]),

  spaces: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    organizationId: v.string(),
    color: v.string(),
    icon: v.string(),
    sortOrder: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_organization_and_sort", ["organizationId", "sortOrder"])
    .searchIndex("search_by_name", {
      searchField: "name",
      filterFields: ["organizationId"],
    }),

  lists: defineTable({
    name: v.string(),
    spaceId: v.id("spaces"),
    sortOrder: v.number(),
    organizationId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_space", ["spaceId"])
    .index("by_space_and_sort", ["spaceId", "sortOrder"])
    .searchIndex("search_by_name", {
      searchField: "name",
      filterFields: ["organizationId", "spaceId"],
    }),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    listId: v.id("lists"),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("complete"),
    ),
    sortOrder: v.number(),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("normal"),
        v.literal("high"),
        v.literal("urgent"),
      ),
    ),
    assigneeIds: v.array(v.string()),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    organizationId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_organizationId_and_listId", ["organizationId", "listId"])
    .index("by_list_status_and_sort", ["listId", "status", "sortOrder"])
    .index("by_org_list_status_sort", [
      "organizationId",
      "listId",
      "status",
      "sortOrder",
    ])
    .searchIndex("search_by_title", {
      searchField: "title",
      filterFields: ["organizationId", "listId"],
    }),
  currentThreads: defineTable({
    threadId: v.string(),
    userId: v.string(),
  }).index("by_userId", ["userId"]),

  agents: defineTable({
    name: v.string(),
    description: v.string(),
    organizationId: v.string(),
    ownerId: v.string(),
    threadId: v.string(),
    instructions: v.string(),
    isActive: v.boolean(),
    avatar: v.string(),

    manualTriggers: v.object({
      assignTask: v.boolean(),
    }),

    tools: v.array(v.string()),

    updatedAt: v.number(),
  })
    .index("by_threadId", ["threadId"])
    .index("by_organization", ["organizationId"]),

  agentSchedules: defineTable({
    agentId: v.id("agents"),
    cronId: v.optional(v.string()),

    instructions: v.optional(v.string()),

    intervalType: v.union(v.literal("day"), v.literal("week")),
    intervalValue: v.number(),

    daysOfWeek: v.array(
      v.union(
        v.literal(0), // Sun
        v.literal(1),
        v.literal(2),
        v.literal(3),
        v.literal(4),
        v.literal(5),
        v.literal(6), // Sat
      ),
    ),

    timeOfDay: v.string(), // 14:33
    timezone: v.string(),

    startDate: v.number(),
    endDate: v.optional(v.number()),

    isActive: v.boolean(),
    lastRunAt: v.optional(v.number()),

    updatedAt: v.number(),
  }).index("by_agent", ["agentId"]),
});
