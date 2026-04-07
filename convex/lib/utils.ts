import { DEFAULT_AGENT_TOOLS } from "./constants";



export type ToolRef = {
  toolId: string;
  name: string;
};

// Format: {{tool:toolId:name}} e.g. {{tool:updateTask:Update task}}
export function parseToolRefs(text: string): ToolRef[] {
  const regex = /\{\{tool:([^:}]+):([^}]+)\}\}/g;
  const refs: ToolRef[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    refs.push({
      toolId: match[1],
      name: match[2],
    });
  }
  return refs;
}


export function computeTools(instructions: string) : string[] {
    const toolRefs = parseToolRefs(instructions)

    const instructionTools = toolRefs.map((r) => r.toolId);


    return [
    ...new Set([...DEFAULT_AGENT_TOOLS.map((t) => t.id), ...instructionTools]),
   ];


}