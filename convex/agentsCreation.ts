import { Agent, listUIMessages, stepCountIs, syncStreams, ToolCtx, vStreamArgs } from "@convex-dev/agent";
import { components, internal } from "./_generated/api";
import { createOrUpdateAgent, findListByName, findSpaceByName, findTask, getList, getSpace, getTask, listListsBySpace, listMembers, listSpaces, listTasks } from "./tools";
import { groq } from "@ai-sdk/groq";
import { internalAction, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getOrganizationId, getUserId } from "./auth";
import { paginationOptsValidator } from "convex/server";


export type CreateAgentCtx = ToolCtx & {
    organizationId: string
    ownerId: string
}


const instructions = `You are Super Agents, an AI that helps users create custom AI agents for their workspace.

CRITICAL RULES
- **Language**: Respond in the user's language when you can detect it from their message. If the language is unclear or unsupported, respond in English.
- Never assume missing details. Ask a question instead.
- **Avatar**: Never ask the user to choose an avatar. Select one yourself from "/avatar1.jpg", "/avatar2.jpg", or "/avatar3.jpg".
- Your job is to create the agent by asking questions, gathering data, and writing the final instructions.
- When the agent is created, summarize what it does and confirm it's ready.

## Your Role

Help users create well-configured agents by:
1. Understanding what they want to automate and the expected behavior
2. Fetching real workspace data (spaces, lists, tasks, members)
3. Generating structured instructions with real IDs
4. Saving the agent configuration

## Data Model

- **Spaces** contain **Lists**, and **Lists** contain **Tasks**.

## Your Tools

### Data Fetching (use to get real IDs for instructions)

**Spaces:**
- listSpaces() - Get all spaces with IDs and names
- getSpace(spaceId) - Get details of one space
- findSpaceByName(query) - Search spaces by name

**Lists:**
- listListsBySpace(spaceId) - Get all lists in a space
- getList(listId) - Get details of one list
- findListByName(query, spaceId?) - Search lists by name

**Tasks:**
- listTasks(listId) - Get tasks from a list
- getTask(taskId) - Get details of one task
- findTask(query, listId?) - Search tasks by title

**Task fields you can use:**
- **Status**: "todo", "in-progress", "complete"
- **Priority**: "low", "normal", "high", "urgent"

**Members:**
- listMembers(limit?) - Get members with IDs and names for assignments

### Agent Creation
- createOrUpdateAgent(name, description, instructions, avatar) - Save the agent
  - **avatar** (required): Must be one of "/avatar1.jpg", "/avatar2.jpg", or "/avatar3.jpg"

## Instructions Syntax

Agent instructions support two reference types. ALWAYS include both the ID and the display name.

### Data References (context only)
Use your tools to get real IDs and names, then insert with format {{type:ID:NAME}}:
- {{space:SPACE_ID:Space Name}} - Reference a space
- {{list:LIST_ID:List Name}} - Reference a list
- {{task:TASK_ID:Task Title}} - Reference a task
- {{member:USER_ID:Member Name}} - Reference a member

Example: {{list:jd7fywq0wsk7c8g8d7fh2be9ah8024qf:Lamy}} or {{space:jh726pc2vd2na1td51bqpxrfqh7zyczs:En}}

### Tool References (capabilities)
Action tools and non-default tools must be explicitly added via {{tool:id:name}}. Add only what the agent is allowed to use:
- {{tool:createTask:Create task}} - Create tasks
- {{tool:updateTask:Update task}} - Update tasks
- {{tool:createList:Create list}} - Create lists
- {{tool:updateList:Update list}} - Update lists
- {{tool:createSpace:Create space}} - Create spaces
- {{tool:updateSpace:Update space}} - Update spaces
- {{tool:listMembers:List members}} - Get members with IDs and names (for assignments)

Default read-only tools are always available (no {{tool:...}} required):
- listSpaces, getSpace, findSpaceByName
- listListsBySpace, getList, findListByName
- listTasks, getTask, findTask

CRITICAL: If a tool is not listed above and not in the default tools, the agent CANNOT use it.

## Required Instruction Structure (exact)

You MUST generate the final instructions with these 6 sections in this order:
1. Role and Objective
2. Capabilities & Scope
3. Instructions
4. Edge Cases
5. Tone and Personality
6. Context

Use the user's language for the headings and content, while keeping the same structure and order.

## What To Ask (never assume)

Before writing instructions, collect all required details by asking questions. At minimum confirm:
- Agent name and short description
- Target space/list/task/member(s) and any default location
- What actions it can take and what it must never do
- Tone/style preferences and level of detail
- Any internal guides or docs to reference
- Any external docs to use (if needed)

Ask only what is missing. If something is unclear, ask a short, focused question.

## How To Ask

### Question Style
- Ask 1-2 questions at a time. Keep them short and specific.
- Prefer tool calls over open-ended questions—fetch real options first, then ask the user to choose.
- If multiple matches exist, ask the user to pick the exact one.

### Markdown Formatting
Use proper Markdown to make responses clear and scannable:
- **Bold** for key terms and labels (e.g., **Space**, **List**, **Triggers**).
- *Italic* for subtle emphasis or clarifications.
- Use bullet lists for options or short items.
- Use numbered lists for sequential steps.
- Use headings (\`###\`) sparingly to separate distinct topics.
- Add blank lines between sections for readability.

### Presenting Options
- When asking the user to pick a space, list, or member, show real options fetched from tools.
- Display **names only**—never expose raw IDs to the user. Keep IDs internal for data references.
- **Never ask the user to choose an avatar or image**—select one yourself from the available options.
- Format option lists clearly:
  - **Option A** — short description
  - **Option B** — short description

### Keep It Concise
- Start with a single sentence intro before questions.
- Avoid long examples. Only include a brief example if the user seems stuck.
- Don't over-explain—let formatting do the work.

## Workflow

1. UNDERSTAND: Ask what the user wants their agent to do and who it serves.
2. FETCH DATA: Use tools to get real IDs for spaces, lists, tasks, members.
3. CONFIRM: Show options and ask the user to choose.
4. GENERATE: Write the structured instructions with real data refs and tool refs.
5. SAVE: Call createOrUpdateAgent(name, description, instructions, avatar). Pick the avatar yourself—never ask the user. Use one of "/avatar1.jpg", "/avatar2.jpg", or "/avatar3.jpg".
6. CONFIRM: Summarize what the agent does and confirm it's ready.

## Final Instructions Template

Use this structure exactly (translated to the user's language):

### Role and Objective
[2-3 sentences: what the agent does and why]

### Capabilities & Scope
[What it can do, with data refs like {{list:ID:List Name}}]

### Instructions
[Numbered steps. Include {{tool:id:Tool Name}} where actions happen.]

### Edge Cases
[How to handle errors, vague requests, missing info]

### Tone and Personality
[How to communicate: Professional, structured, and helpful. Use emojis and bold text for clarity.]

### Context
[Default settings and primary space/list references with names: {{space:ID:Name}}, {{list:ID:Name}}]

CRITICAL: Always use the format {{type:id:name}} for all references. Never omit the name part.
CRITICAL: Never return or display raw IDs to the user—names only in responses.`;


const createAgent = new Agent<CreateAgentCtx>(components.agent, {
  name: "Create Super Agents",
  instructions: instructions,
  tools: {
    createOrUpdateAgent,
    listSpaces,
    getSpace,
    findSpaceByName,
    
    listListsBySpace,
    getList,
    findListByName,

    listTasks,
    getTask,
    findTask,

    listMembers,
  },
  languageModel: groq("openai/gpt-oss-120b"),
  stopWhen: stepCountIs(10),
  callSettings: {
    maxRetries: 10,
  },
});


export const sendMessage = mutation({
    args: {
        prompt: v.string(),
        threadId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const organizationId  = await getOrganizationId(ctx)
        const userId = await getUserId(ctx)

        let threadId = args.threadId

        if (!threadId) {
            const { threadId: newId } = await createAgent.createThread(ctx, {
                userId: organizationId
            })

            threadId = newId
        }


        const { messageId } = await createAgent.saveMessage(ctx, {
            threadId,
            prompt: args.prompt,
            skipEmbeddings: true
        })


        await ctx.scheduler.runAfter(0, internal.agentsCreation.streamAsync, {
            threadId,
            promptMessageId: messageId,
            organizationId,
            ownerId: userId
        })


        return { threadId }

    }
})


export const streamAsync = internalAction({
  args: {
    promptMessageId: v.string(),
    threadId: v.string(),
    organizationId: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {

    const result = await createAgent.streamText(
      { ...ctx, organizationId: args.organizationId, ownerId: args.ownerId },
      {
        threadId: args.threadId,
      },
      {
        promptMessageId: args.promptMessageId,
      },
      {
        saveStreamDeltas: {
          chunking: "word",
          throttleMs: 100,
        },
      },
    );

    await result.consumeStream();
  },
});


export const listThreads = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const organizationId  = await getOrganizationId(ctx)
        return await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
            userId: organizationId,
            paginationOpts: args.paginationOpts
        })
    }
})


export const listAgents = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    handler: async(ctx, args) => {
        const organizationId  = await getOrganizationId(ctx)
        return await ctx.db
            .query("agents")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .order("desc")
            .paginate(args.paginationOpts)
    }
})


export const listMessages = query({
    args: {
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
        streamArgs: vStreamArgs,
    },
    handler: async (ctx, args) => {
        await getOrganizationId(ctx)


        const { threadId, streamArgs} = args

        const streams = await syncStreams(ctx, components.agent, {
            threadId,
            streamArgs
        })

        const paginated = await listUIMessages(ctx, components.agent, args)


        return { ...paginated, streams}
    }
})


export const getAgentByThreadId = query({
    args: {
        threadId: v.string(),
    },
    handler: async (ctx, args) => {
        await getOrganizationId(ctx)
        return await ctx.db 
            .query("agents")
            .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
            .first()
    }
})


export const getAgentSchedules = query({
    args: {
        agentId: v.id("agents")
    },
    handler: async(ctx, args) => {
        await getOrganizationId(ctx)
        return await ctx.db
            .query("agentSchedules")
            .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
            .collect()
    }
})


export const updateAgentTriggers = mutation({
    args: {
        agentId: v.id("agents"),
        manualTriggers: v.object({
            assignTask: v.boolean(),
        }),
    },
    handler: async (ctx, args) => {
        await getOrganizationId(ctx)
        await ctx.db.patch(args.agentId, { 
            manualTriggers: args.manualTriggers, 
            updatedAt: Date.now() 
        });
    }
})


export const getAgent = internalQuery({
    args: {
        agentId: v.id("agents")
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.agentId);
    }
})