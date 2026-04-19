export const STATUSES = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  COMPLETE: "complete",
} as const;


export const DEFAULT_AGENT_TOOLS = [
  // Spaces
  { id: "listSpaces", name: "List spaces" },
  { id: "getSpace", name: "Get space" },
  { id: "findSpaceByName", name: "Find space by name" },
  // Lists
  { id: "listListsBySpace", name: "List lists by space" },
  { id: "getList", name: "Get list" },
  { id: "findListByName", name: "Find list by name" },
  // Tasks
  { id: "listTasks", name: "List tasks" },
  { id: "getTask", name: "Get task" },
  { id: "findTask", name: "Find task by name" },
  // Members
  { id: "listMembers", name: "List members" },
] as const;


export const AVAILABLE_TOOLS = [
  // Spaces
  { id: "createSpace", name: "Create space" },
  { id: "updateSpace", name: "Update space" },
  // Lists
  { id: "createList", name: "Create list" },
  { id: "updateList", name: "Update list" },
  // Tasks
  { id: "createTask", name: "Create task" },
  { id: "updateTask", name: "Update task" },
] as const;