import z from "zod";
import { createTRPCRouter, protectedOrganizationCreationProcedure } from "../init";
import { getWorkOS } from "@workos-inc/authkit-nextjs";


export const organizationRouter = createTRPCRouter({
    createOrganization: protectedOrganizationCreationProcedure
        .input(z.object({
            name: z.string()
        }))
        .mutation(async({ ctx, input }) => {
            const workos = getWorkOS();


            const organization = await workos.organizations.createOrganization({
                name: input.name
            })

            await workos.userManagement.createOrganizationMembership({
                userId: ctx.userId,
                organizationId: organization.id,
                roleSlug: "admin",
            })

            return organization;
        })
})