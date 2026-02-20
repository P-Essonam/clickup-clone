import { initTRPC, TRPCError } from '@trpc/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { cache } from 'react';
import superjson from "superjson"


export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */

  const { user, organizationId, role, permissions } = await withAuth();


  return { 
    userId: user?.id,
    userEmail: user?.email,
    organizationId: organizationId,
    role: role,
    permissions: permissions,
  };
});

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;


// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<TRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  async function isAuthed(opts) {
    const { ctx } = opts;

    if (
      !ctx.userId ||
      !ctx.organizationId ||
      !ctx.role ||
      !ctx.permissions ||
      !ctx.userEmail
    ) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "unauthorized" })
    }

    return opts.next({
      ctx: {
        ...ctx,
        userId: ctx.userId,
        userEmail: ctx.userEmail,
        organizationId: ctx.organizationId,
        permissions: ctx.permissions,
        role: ctx.role
      }
    })
  }
)


export const protectedOrganizationCreationProcedure = t.procedure.use(
  async function isAuthed(opts) {
    const { ctx } = opts;

    if (
      !ctx.userId 
    ) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "unauthorized" })
    }

    return opts.next({
      ctx: {
        ...ctx,
        userId: ctx.userId,
      }
    })
  }
)