import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrganizationId } from "./auth";
import { paginationOptsValidator } from "convex/server";



export const getList = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    const org_id = await getOrganizationId(ctx);

    const list = await ctx.db.get(listId);

    if (!list || list.organizationId !== org_id) return null;


    return list;
  },
});


export const getListWithSpace = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {

    const org_id = await getOrganizationId(ctx);

    const list = await ctx.db.get(listId);

    if (!list || list.organizationId !== org_id) return null;

    const space = await ctx.db.get(list.spaceId);

    if (!space || space.organizationId !== org_id) return null;

    return { list, space };
  },
});


export const listBySpace = query({
  args: {
    spaceId: v.id("spaces"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { spaceId, paginationOpts }) => {
    const org_id = await getOrganizationId(ctx);

    const space = await ctx.db.get(spaceId);
    if (!space) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Space not found",
      });
    }

    if (space.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to view this space",
      });
    }

    return ctx.db
      .query("lists")
      .withIndex("by_space", (q) => q.eq("spaceId", spaceId))
      .order("asc")
      .paginate(paginationOpts);
  },
});



export const create = mutation({
  args: {
    spaceId: v.id("spaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx);
    const now = Date.now();

    const space = await ctx.db.get(args.spaceId);
    if (!space) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Space not found",
      });
    }


    if (space.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to create lists in this space",
      });
    }



    const lastList = await ctx.db
      .query("lists")
      .withIndex("by_space_and_sort", (q) => q.eq("spaceId", args.spaceId))
      .order("desc")
      .first();

    const sortOrder = lastList ? lastList.sortOrder + 1 : 0;

    return ctx.db.insert("lists", {
      name: args.name,
      spaceId: args.spaceId,
      organizationId: org_id,
      sortOrder,
      updatedAt: now,
    });
  },
});


export const update = mutation({
  args: {
    id: v.id("lists"),
    name: v.string(),
    spaceId: v.id("spaces"),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx);

    const list = await ctx.db.get(args.id);
    if (!list) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "List not found",
      });
    }


    if (list.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to update this list",
      });
    }

    const space = await ctx.db.get(args.spaceId);
    if (!space) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Space not found",
      });
    }

    if (space.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to move lists to this space",
      });
    }

    return ctx.db.patch(args.id, {
      name: args.name,
      spaceId: args.spaceId,
      updatedAt: Date.now(),
    });
  },
});



export const remove = mutation({
  args: { id: v.id("lists") },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx);

    const list = await ctx.db.get(args.id);
    if (!list) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "List not found",
      });
    }

    if (list.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to delete this list",
      });
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_organizationId_and_listId", (q) =>
        q.eq("organizationId", org_id).eq("listId", args.id),
      )
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    await ctx.db.delete(args.id);
  },
});



export const reorder = mutation({
  args: {
    spaceId: v.id("spaces"),
    orderedIds: v.array(v.id("lists")),
  },
  handler: async (ctx, args) => {
    const org_id = await getOrganizationId(ctx);
    const now = Date.now();

    const space = await ctx.db.get(args.spaceId);
    if (!space) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Space not found",
      });
    }


    if (space.organizationId !== org_id) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to reorder lists in this space",
      });
    }


    for (let i = 0; i < args.orderedIds.length; i++) {
      const list = await ctx.db.get(args.orderedIds[i]);
      if (!list) {
        throw new ConvexError({
          code: "NOT_FOUND",
          message: "List not found",
        });
      }

      
      if (list.organizationId !== org_id) {
        throw new ConvexError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to reorder this list",
        });
      }

      await ctx.db.patch(args.orderedIds[i], {
        spaceId: args.spaceId,
        sortOrder: i,
        updatedAt: now,
      });
    }
  },
});