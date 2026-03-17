
import { WorkOS } from "@workos-inc/node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";


export const listMembersIds = internalAction({
  args: {
    organizationId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { organizationId, limit }) => {
    const workos = new WorkOS({ apiKey: process.env.WORKOS_API_KEY });

    
    const members = await workos.userManagement.listOrganizationMemberships({
      organizationId: organizationId,
      limit: limit,
    });

    // Fetch user details for each membership
    const membersWithNames = await Promise.all(
      members.data.map(async (membership) => {
        const user = await workos.userManagement.getUser(membership.userId);
        const name = `${user.firstName} ${user.lastName}`.trim();
        return {
          userId: membership.userId,
          name: name,
        };
      }),
    );

    return membersWithNames;
  },
});