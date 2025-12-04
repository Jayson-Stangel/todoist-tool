# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Todoist MCP (Model Context Protocol) server that exposes Todoist operations for personal task management. It works with a single Todoist project and implements canonical sections for task organization.

## Build & Development Commands

```bash
# Build the project
npm run build

# Run in development mode with .env.local
npm run dev

# Run built server (stdio MCP server)
node ./dist/server.js

# Smoke test the tool locally
node -e 'import("./dist/index.js").then(async m => console.log(JSON.stringify(await m.todoist_tool({action:"list_tasks_by_section",args:{}}),null,2)))'
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- `TODOIST_API_TOKEN` - Your Todoist Personal Access Token  
- `TODOIST_PROJECT_ID` - The specific Todoist project ID to manage
- `LOG_LEVEL` - Optional: debug | info | error (default: info)
- `LOG_FILE` - Optional: Path to log file (default: ~/Repos/todoist-tool/logs/todoist-mcp.log)

## Architecture

### Core Components

- **`src/server.ts`** - MCP server implementation that registers 4 tools with the MCP SDK
- **`src/index.ts`** - Main entry point with `todoist_tool()` function that routes actions
- **`src/schemas.ts`** - Zod schemas for input validation and type definitions
- **`src/tasks.ts`** - Core task operations (create, edit, list, get details)
- **`src/sections.ts`** - Section management and canonical section enforcement
- **`src/client.ts`** - Todoist REST API client with authentication
- **`src/logger.ts`** - Structured logging with error types

### Canonical Sections

The tool enforces 7 canonical sections in the Todoist project:
- Backlog, Deferred, Current Sprint Backlog, Blocked, In Progress, Ready for Testing, Complete

Every parent task must live in exactly one section. Subtasks inherit their parent's section and cannot be moved directly.

### MCP Tools Exposed

1. **create_task** - Create parent tasks or subtasks with required description
2. **edit_task** - Edit task content fields (title, description, due date)
3. **move_task** - Move parent tasks between canonical sections (uses Sync API)
4. **list_tasks_by_section** - List active tasks in 3 default sections (Current Sprint Backlog, In Progress, Ready for Testing)
5. **get_task_details** - Fetch task with description (Markdown) and subtasks
6. **search_tasks** - Search active tasks by text query with optional exact title matching
7. **delete_task** - Permanently delete tasks or subtasks by ID
8. **get_sections** - List all sections in project (canonical and custom)

## Adding to Claude Code

Use absolute paths with the MCP setup:

```bash
# With .env.local file (recommended)
claude mcp add todoist --scope user -- node -r /absolute/path/to/todoist-tool/node_modules/dotenv/config /absolute/path/to/todoist-tool/dist/server.js dotenv_config_path=/absolute/path/to/todoist-tool/.env.local
```

## Logging

All operations are logged to `LOG_FILE` with ISO timestamps in the centralized `~/Repos/todoist-tool/logs/` directory. Debug level includes REST API calls and task mutations. Sensitive data (API tokens) are never logged.