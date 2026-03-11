import { LayoutGrid, ListChecks } from "lucide-react";
import { parseAsStringLiteral } from "nuqs";


export const listViewParser = parseAsStringLiteral([
  "list",
  "board",
] as const).withDefault("list");


export const VIEW_TABS = [
  { value: "list" as const, label: "List", icon: ListChecks },
  { value: "board" as const, label: "Board", icon: LayoutGrid },
] as const;


export const VIEW_PARAM = "view";
