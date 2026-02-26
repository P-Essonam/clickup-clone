import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Member = {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
};

export function getMemberDisplayName(member: Member): string {
  const name = [member.firstName, member.lastName].filter(Boolean).join(" ");
  return name || member.email;
}



export function getMemberInitials(member: Member): string {
  const displayName = getMemberDisplayName(member);
  return displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}



export const formatDate = (value?: string | null) => {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};