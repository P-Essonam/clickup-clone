import z from "zod";
import {
  createTRPCRouter,
  protectedOrganizationCreationProcedure,
  protectedProcedure,
} from "../init";
import { getWorkOS } from "@workos-inc/authkit-nextjs";

export const organizationRouter = createTRPCRouter({
    
  countMembers: protectedProcedure.query(async ({ ctx }) => {
    const workos = getWorkOS();

    const list = await workos.userManagement.listOrganizationMemberships({
      organizationId: ctx.organizationId,
      statuses: ["active", "inactive", "pending"],
      limit: 100,
    });

    return { count: list.data.length };
  }),

  listOrganizations: protectedProcedure.query(async ({ ctx }) => {
    const workos = getWorkOS();
    const list = await workos.userManagement.listOrganizationMemberships({
      userId: ctx.userId,
    });

    return list.data;
  }),

  createOrganization: protectedOrganizationCreationProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();

      const organization = await workos.organizations.createOrganization({
        name: input.name,
      });

      await workos.userManagement.createOrganizationMembership({
        userId: ctx.userId,
        organizationId: organization.id,
        roleSlug: "admin",
      });

      return organization;
    }),
});
