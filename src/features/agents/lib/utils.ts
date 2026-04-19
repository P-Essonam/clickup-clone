import { DEFAULT_AGENT_TOOLS, AVAILABLE_TOOLS } from "../../../../convex/lib/constants";


export function splitTools(tools: string[]): {
  defaultTools: string[];
  otherTools: string[];
} {
  const defaultToolsArray: string[] = DEFAULT_AGENT_TOOLS.map((t) => t.id);
  const defaultTools: string[] = [];
  const otherTools: string[] = [];

  for (const tool of tools) {
    if (defaultToolsArray.includes(tool)) {
      defaultTools.push(tool);
    } else {
      otherTools.push(tool);
    }
  }

  return { defaultTools, otherTools };
}


const TOOL_NAME_MAP = new Map<string, string>([
  ...AVAILABLE_TOOLS.map((tool) => [tool.id, tool.name] as const),
  ...DEFAULT_AGENT_TOOLS.map((tool) => [tool.id, tool.name] as const),
]);


export function getToolDisplayName(toolId: string): string {
  return TOOL_NAME_MAP.get(toolId) ?? humanizeToolId(toolId);
}



function humanizeToolId(toolId: string): string {
  const withSpaces = toolId
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}