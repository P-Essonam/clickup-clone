import z from "zod";
import {
  createTRPCRouter,
  protectedOrganizationCreationProcedure,
  protectedProcedure,
} from "../init";
import { getWorkOS } from "@workos-inc/authkit-nextjs";

export const organizationRouter = createTRPCRouter({
  inviteUser: protectedProcedure
    .input(
      z.object({
        email: z.string(),
        role: z.enum(["owner", "admin", "member"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      return await workos.userManagement.sendInvitation({
        email: input.email,
        roleSlug: input.role,
        organizationId: ctx.organizationId,
        inviterUserId: ctx.userId,
      });
    }),

  resendInvitation: protectedProcedure
    .input(
      z.object({
        invitationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      return await workos.userManagement.resendInvitation(input.invitationId);
    }),

  revokeInvitation: protectedProcedure
    .input(
      z.object({
        invitationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      return await workos.userManagement.revokeInvitation(input.invitationId);
    }),

  listInvitations: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const workos = getWorkOS();
      const list = await workos.userManagement.listInvitations({
        organizationId: ctx.organizationId,
        limit: input.limit,
        after: input.cursor ?? undefined,
        order: "desc",
      });

      return {
        items: list.data,
        nextCursor: list.listMetadata.after ?? null,
      };
    }),

  listMembers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const workos = getWorkOS();
      const memberShips =
        await workos.userManagement.listOrganizationMemberships({
          organizationId: ctx.organizationId,
          limit: input.limit,
          after: input.cursor ?? undefined,
          order: "desc",
          statuses: ["active", "inactive", "pending"],
        });

      const membersWithUsers = await Promise.all(
        memberShips.data.map(async (memberShip) => {
          const user = await workos.userManagement.getUser(memberShip.userId);
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePictureUrl: user.profilePictureUrl,
            lastSignInAt: user.lastSignInAt,
            createdAt: user.createdAt,
            membershipId: memberShip.id,
            role: memberShip.role?.slug ?? "member",
            membershipStatus: memberShip.status,
          };
        }),
      );

      return {
        items: membersWithUsers,
        nextCursor: memberShips.listMetadata.after ?? null,
      };
    }),

  updateOrganizationMembershipRole: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
        role: z.enum(["owner", "admin", "member"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      return await workos.userManagement.updateOrganizationMembership(
        input.memberId,
        { roleSlug: input.role },
      );
    }),

  desactivateOrganizationMembership: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      return await workos.userManagement.deactivateOrganizationMembership(
        input.memberId,
      );
    }),

  reactivateOrganizationMembership: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      return await workos.userManagement.reactivateOrganizationMembership(
        input.memberId,
      );
    }),

  deleteOrganizationMembership: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      return await workos.userManagement.deleteOrganizationMembership(
        input.memberId,
      );
    }),

  getOrganization: protectedProcedure.query(async ({ ctx }) => {
    const workos = getWorkOS();
    const organization = await workos.organizations.getOrganization(
      ctx.organizationId,
    );

    return organization;
  }),

  updateOrganizationName: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workos = getWorkOS();
      await workos.organizations.updateOrganization({
        organization: ctx.organizationId,
        name: input.name,
      });
    }),

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

  getUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const workos = getWorkOS();
      const user = await workos.userManagement.getUser(input.userId);
      return user;
    }),
});
