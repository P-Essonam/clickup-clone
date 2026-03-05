import { FunctionArgs } from "convex/server";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

export type SpaceFormValues = FunctionArgs<typeof api.spaces.create>;

export type ListFormValues = FunctionArgs<typeof api.lists.create>;

export type Space = Doc<"spaces"> & {
  lists: Doc<"lists">[];
  isOpen?: boolean;
};

export type SpaceDialogState = {
    open: boolean
    mode: "create" | "edit"
    space?: Space
}

export type ListDialogState = {
    open: boolean
    mode: "create" | "edit"
    spaceId: Id<"spaces"> | null
    list?: Doc<"lists">
}