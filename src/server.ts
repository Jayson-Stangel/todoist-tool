import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { todoist_tool } from "./index.js";
import { log } from "./logger.js";
import { CreateTaskInput, EditTaskInput, MoveTaskInput, ListTasksBySectionInput, GetTaskDetailsInput, SearchTasksInput, DeleteTaskInput } from "./schemas.js";

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
    title: "Edit a task",
    description: "Edit title/description/due of a task.",
    inputSchema: EditTaskInput.shape
  },
  async (args, extra) => {
    log.info("mcp_call edit_task");
    const res = await todoist_tool({ action: "edit_task", args } as any);
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  }
);

server.registerTool(
  "move_task",
  {
    title: "Move a task to a section",
    description: "Move a PARENT task between canonical sections. Subtasks inherit parent section.",
    inputSchema: MoveTaskInput.shape
  },
  async (args, extra) => {
    log.info("mcp_call move_task");
    const res = await todoist_tool({ action: "move_task", args } as any);
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

server.registerTool(
  "delete_task",
  {
    title: "Delete a task or subtask",
    description: "Delete a task or subtask by its task ID. This will permanently remove the task.",
    inputSchema: DeleteTaskInput.shape
  },
  async (args, extra) => {
    log.info("mcp_call delete_task");
    const res = await todoist_tool({ action: "delete_task", args } as any);
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  }
);

const transport = new StdioServerTransport();
server.connect(transport);
