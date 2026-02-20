import { mutation } from "./_generated/server";
import { v } from "convex/values"

export const startOnboarding = mutation({
    args: {
        organizationId: v.string(),
        workspaceType: v.optional(v.string()),
        manageType: v.optional(v.string()),
    },
    handler: async(ctx, args)=> {
        return await ctx.db.insert("onbording", {
            workosOrganizationId: args.organizationId,
            workspaceType: args.workspaceType,
            manageType: args.manageType
        })
    }
})