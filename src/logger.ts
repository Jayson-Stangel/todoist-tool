import fs from "fs";
import path from "path";

export class MissingEnvError extends Error {}
export class ValidationError extends Error {}
export class NotFoundError extends Error {}
export class TodoistApiError extends Error {
  constructor(public status: number, public body: unknown) {
    // Extract meaningful error messages from common scenarios
    let message = `Todoist API error ${status}`;
    
    if (typeof body === 'string') {
      // Handle common error messages
      if (body.includes('Maximum number of items per user project limit reached')) {
        message = `Project has reached maximum task limit. Delete some existing tasks before creating new ones.`;
      } else if (body.includes('rate limit')) {
        message = `Rate limit exceeded. Wait before making more requests.`;
      } else if (body.includes('insufficient permissions') || body.includes('forbidden')) {
        message = `Insufficient permissions. Check API token permissions.`;
      } else if (body.includes('not found')) {
        message = `Resource not found. Task or project may have been deleted.`;
      } else if (body.length > 0 && body !== '<unreadable>') {
        message = `Todoist API error ${status}: ${body}`;
      }
    } else if (body && typeof body === 'object' && 'error' in body) {
      // Handle JSON error responses
      const errorObj = body as any;
      if (errorObj.error) {
        message = `Todoist API error ${status}: ${errorObj.error}`;
      }
    }
    
    super(message);
  }
}

type Level = "debug" | "info" | "error";

const LEVELS: Record<Level, number> = { debug: 10, info: 20, error: 30 };

const LOG_FILE = process.env.LOG_FILE || path.join(process.env.HOME || "~", "Repos/todoist-tool/logs/todoist-mcp.log");
const LOG_LEVEL = (process.env.LOG_LEVEL as Level) || "info";

function stamp(level: Level, msg: string) {
  const ts = new Date().toISOString();
  return `${ts} ${level.toUpperCase()} ${msg}`;
}

function ensureDir(p: string) {
  try {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch {}
}

export const log = {
  level: LOG_LEVEL as Level,
  debug(msg: string) {
    if (LEVELS[this.level] <= LEVELS.debug) {
      const line = stamp("debug", msg) + "\n";
      ensureDir(LOG_FILE);
      fs.appendFileSync(LOG_FILE, line, "utf8");
    }
  },
  info(msg: string) {
    if (LEVELS[this.level] <= LEVELS.info) {
      const line = stamp("info", msg) + "\n";
      ensureDir(LOG_FILE);
      fs.appendFileSync(LOG_FILE, line, "utf8");
    }
  },
  error(msg: string) {
    if (LEVELS[this.level] <= LEVELS.error) {
      const line = stamp("error", msg) + "\n";
      ensureDir(LOG_FILE);
      fs.appendFileSync(LOG_FILE, line, "utf8");
    }
  }
};
