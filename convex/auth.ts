import { ConvexError } from "convex/values";
import { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";

export async function getOrganizationId(
    ctx: QueryCtx | MutationCtx | ActionCtx
) : Promise<string> {

    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
        throw new ConvexError({
            code: "UNAUTHORIZED",
            message: "Identity not found",
        });
    }

    const org_id = identity.org_id as string | undefined;

    if (!org_id) {
        throw new ConvexError({
            code: "NOT_FOUND",
            message: "Organization not found",
        });
    }

    return org_id
}



export async function getUserId(
  ctx: QueryCtx | MutationCtx | ActionCtx,
): Promise<string> {

    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
        throw new ConvexError({
            code: "UNAUTHORIZED",
            message: "Identity not found",
        });
    }

    return identity.subject
}