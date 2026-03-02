import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { getOrganizationId } from "./auth";
import { ConvexError, v } from "convex/values";


export const list = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async(ctx, args) => {
        const org_id = await getOrganizationId(ctx);

        return ctx.db
            .query("spaces")
            .withIndex("by_organization", (q) => q.eq("organizationId", org_id))
            .order("desc")
            .paginate(args.paginationOpts)

    }
})

export const listWithLists = query({
  args: {},
  handler: async (ctx) => {
    const org_id = await getOrganizationId(ctx)


    const spaces = await ctx.db
        .query("spaces")
        .withIndex("by_organization", (q) => q.eq("organizationId", org_id))
        .collect()

    const spacesWithLists = await Promise.all(
        spaces.map( async (space) => {
            const lists = await ctx.db
                .query("lists")
                .withIndex("by_space", (q) => q.eq("spaceId", space._id))
                .collect()

                return {
                    ...space,
                    lists: lists.sort((a, b) => a.sortOrder - b.sortOrder),
                }
        })
    )

    return spacesWithLists.sort((a, b) => a.sortOrder - b.sortOrder)
  }
})



export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        color: v.string(),
        icon: v.string()
    },
    handler: async (ctx, args) => {
        const org_id = await getOrganizationId(ctx)
        
        const lastSapce = await ctx.db
            .query("spaces")
            .withIndex("by_organization", (q) => q.eq("organizationId", org_id))
            .order("desc")
            .first()

        const sortOrder = lastSapce ? lastSapce.sortOrder + 1 : 0


        return ctx.db.insert("spaces", {
            name: args.name,
            description: args.description,
            color: args.color,
            icon: args.icon,
            organizationId: org_id,
            sortOrder,
            updatedAt: Date.now(),
        })
    }
})




export const update = mutation({
    args: {
        id: v.id("spaces"),
        name: v.string(),
        description: v.optional(v.string()),
        color: v.string(),
        icon: v.string()
    },
    handler: async (ctx, args) => {
        const org_id = await getOrganizationId(ctx)
        
        const space = await ctx.db.get(args.id)

        if (!space) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Space not found",
            });
        }


       if (space.organizationId !== org_id) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "You are not authorized to update this space",
            });
        }


        return ctx.db.patch(args.id, {
            name: args.name,
            description: args.description,
            color: args.color,
            icon: args.icon,
            updatedAt: Date.now(),
        })
    }
})


export const remove = mutation({
    args: {
        id: v.id("spaces")
    },
    handler: async (ctx, args) => {
        const org_id = await getOrganizationId(ctx)

        const space = await ctx.db.get(args.id)

        if (!space) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Space not found",
            });
        }


        if (space.organizationId !== org_id) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "You are not authorized to delete this space",
            });
        }


        const lists = await ctx.db
            .query("lists")
            .withIndex("by_space", (q) => q.eq("spaceId", args.id))
            .collect();

        for (const list of lists) {
            const tasks = await ctx.db  
                .query("tasks")
                .withIndex("by_organizationId_and_listId", (q) => q.eq("organizationId", org_id).eq("listId", list._id))
                .collect()

            for (const task of tasks) {
                await ctx.db.delete(task._id);
            }

            await ctx.db.delete(list._id);
        }

        await ctx.db.delete(args.id);
    }
})

export const reorder = mutation({
    args: {
        orderedIds: v.array(v.id("spaces"))
    },
    handler: async (ctx, args) => {
        const org_id = await getOrganizationId(ctx)

        for (const id of args.orderedIds) {
            const space = await ctx.db.get(id)

            if (!space) {
                throw new ConvexError({
                    code: "NOT_FOUND",
                    message: "Space not found",
                });
            }

            if (space.organizationId !== org_id) {
                throw new ConvexError({
                    code: "UNAUTHORIZED",
                    message: "You are not authorized to reorder this space",
                });
            }
        }


            for (let i = 0; i < args.orderedIds.length; i++) {
                await ctx.db.patch(args.orderedIds[i], {
                    sortOrder: i,
                    updatedAt: Date.now()
                })
            }
    }
})