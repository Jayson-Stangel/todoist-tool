#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { todoist_tool } from "./index.js";
import { log } from "./logger.js";
import { CreateTaskInput, EditTaskInput, ListTasksBySectionInput, GetTaskDetailsInput, SearchTasksInput } from "./schemas.js";

const server = new McpServer({ name: "todoist-mcp", version: "0.1.0" });

server.registerTool(
  "create_task",
  {
    title: "Create a task or subtask",
    description: "Create a task in one of the canonical sections, or a subtask under a parent.",
    inputSchema: CreateTaskInput.shape
  },
  async (args, extra) => {
    log.info("mcp_call create_task");
    const res = await todoist_tool({ action: "create_task", args } as any);
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  }
);

server.registerTool(
  "edit_task",
  {
    title: "Edit/Move a task",
    description: "Edit title/description/due; optionally move a PARENT task between sections.",
    inputSchema: EditTaskInput.shape
  },
  async (args, extra) => {
    log.info("mcp_call edit_task");
    const res = await todoist_tool({ action: "edit_task", args } as any);
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  }
);

server.registerTool(
  "list_tasks_by_section",
  {
    title: "List active tasks (3 default sections)",
    description: "Returns Current Sprint Backlog, In Progress, Ready for Testing.",
    inputSchema: ListTasksBySectionInput.shape
  },
  async (args, extra) => {
    log.info("mcp_call list_tasks_by_section");
    const res = await todoist_tool({ action: "list_tasks_by_section", args } as any);
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  }
);

server.registerTool(
  "get_task_details",
  {
    title: "Get task details",
    description: "Title, description, and subtasks (titles only).",
    inputSchema: GetTaskDetailsInput.shape
  },
  async (args, extra) => {
    log.info("mcp_call get_task_details");
    const res = await todoist_tool({ action: "get_task_details", args } as any);
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  }
);

server.registerTool(
  "search_tasks",
  {
    title: "Search tasks by text",
    description: "Search active tasks in the configured project by text.",
    inputSchema: SearchTasksInput.shape
  },
  async (args, extra) => {
    log.info("mcp_call search_tasks");
    const res = await todoist_tool({ action: "search_tasks", args } as any);
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  }
);

const transport = new StdioServerTransport();
server.connect(transport);
