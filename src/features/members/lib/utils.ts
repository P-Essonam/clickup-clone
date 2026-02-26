import { MemberRole } from "./types";

export const normalizeAdminMemberRole = (role?: string | null): MemberRole => {
  if (role === "admin") return "amdin";

  return "member";
};
