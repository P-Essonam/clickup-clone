import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
    onbording: defineTable({
        workosOrganizationId: v.string(),
        workspaceType: v.optional(v.string()),
        manageType: v.optional(v.string()),
    }).index("by_workos_organization_id", ["workosOrganizationId"]),
    
})