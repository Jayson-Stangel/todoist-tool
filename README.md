# Todoist MCP Tool (Local, Single Todoist Project)

This MCP server exposes Todoist operations to Claude Code for **your personal use** (PAT + single project).

## Capabilities
- **create_task** — create parent tasks or subtasks (description required; optional `due_natural`).
- **edit_task** — edit content fields (title, description, due date) and/or move **parent tasks** between canonical sections.
- **list_tasks_by_section** — list active tasks in the 3 default sections: **Current Sprint Backlog**, **In Progress**, **Ready for Testing**.
- **get_task_details** — fetch a task’s title, description (Markdown), and subtasks (titles only).
- **search_tasks** — search active tasks in the configured project by text.

> Scope reductions for simplicity: one Todoist project, no labels/owners/recurrence/bulk ops/deletes; subtasks inherit parent section and cannot be moved directly; completed tasks are never listed.

---

## Canonical Sections
The server ensures these sections exist in your project (creating any missing on first run):

- Backlog
- Deferred
- Current Sprint Backlog
- Blocked
- In Progress
- Ready for Testing
- Complete

Every parent task must live in **exactly one** of the above. Subtasks always inherit their parent’s section.

---

## Environment
Copy `.env.example` to `.env.local` and fill in your values:

```bash
TODOIST_API_TOKEN=your_todoist_pat_here
TODOIST_PROJECT_ID=123456789
# Optional logging config:
LOG_FILE=./todoist-mcp.log         # path to write logs (default: ./todoist-mcp.log)
LOG_LEVEL=info                     # one of: debug | info | error (default: info)
```

If you prefer shell envs instead of `.env`, just `export` them before starting the server.

---

## Install & Build
```bash
pnpm install
pnpm build
```

Run locally (stdio MCP server):
```bash
node ./dist/server.js
```

---

## Add to Claude Code (MCP)

**IMPORTANT:** Claude Code requires absolute paths. Use `$PWD` to get the current directory path.

**Option A — use .env.local file (recommended):**
```bash
# Replace /path/to/your/todoist-tool with the actual path
claude mcp add todoist --scope user -- node -r /path/to/your/todoist-tool/node_modules/dotenv/config /path/to/your/todoist-tool/dist/server.js dotenv_config_path=/path/to/your/todoist-tool/.env.local
```

**Option B — pass env at add-time:**
```bash
# Replace /path/to/your/todoist-tool with the actual path  
claude mcp add todoist --scope user --env TODOIST_API_TOKEN=YOUR_PAT --env TODOIST_PROJECT_ID=123456789 --env LOG_LEVEL=debug --env LOG_FILE=/path/to/your/todoist-tool/todoist-mcp.log -- node /path/to/your/todoist-tool/dist/server.js
```

Manage servers:
```bash
claude mcp list
claude mcp get todoist
claude mcp remove todoist
```

---

## Logging (Detailed, File-Based)
- All actions are logged to `LOG_FILE` (default `./todoist-mcp.log`).
- Levels: `debug` (most verbose), `info`, `error`.
- Each line includes ISO timestamp, level, action, and a concise message.
- **Examples of debug entries**:
  - Section bootstrap results (created vs existing).
  - REST calls (method, path, minimal payload sizes), response status.
  - Task mutations (before/after compact summaries).
- Sensitive data (PAT) is **never** logged.

### Rotate / Inspect
- For quick rotation: `mv todoist-mcp.log todoist-mcp.log.1 && : > todoist-mcp.log`
- To tail in real time: `tail -f todoist-mcp.log`

---

## Tool Definitions (MCP)
Claude will see five tools with zod-validated inputs:

- **create_task**: `{ title, description, section?, due_natural?, parent_task_id? }`
- **edit_task**: `{ task_id, title?, description?, due_natural?, section? }` (section move is **parent-only**)
- **list_tasks_by_section**: `{}` (always returns the default 3 sections)
- **get_task_details**: `{ task_id }`
- **search_tasks**: `{ query }`

---

## Local Smoke Test
```bash
# list default three sections (JSON result)
node -e 'import("./dist/index.js").then(async m => console.log(JSON.stringify(await m.todoist_tool({action:"list_tasks_by_section",args:{}}),null,2)))'
```

If you see an error about missing env, set `TODOIST_API_TOKEN` / `TODOIST_PROJECT_ID` and try again.

---

## Notes
- Moving a parent task to **Deferred** acts as “archive/defer” for your workflow.
- `due_natural` is passed to Todoist as `due_string` (dates only; no times).

Enjoy! 🧰
