import fs from "fs";
import path from "path";

export class MissingEnvError extends Error {}
export class ValidationError extends Error {}
export class NotFoundError extends Error {}
export class TodoistApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`Todoist API error ${status}`);
  }
}

type Level = "debug" | "info" | "error";

const LEVELS: Record<Level, number> = { debug: 10, info: 20, error: 30 };

const LOG_FILE = process.env.LOG_FILE || "./todoist-mcp.log";
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
