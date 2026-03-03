import { FunctionArgs } from "convex/server";
import { api } from "../../../../convex/_generated/api";

export type SpaceFormValues = FunctionArgs<typeof api.spaces.create>;

export type ListFormValues = FunctionArgs<typeof api.lists.create>;