import { MissingEnvError, log, TodoistApiError } from "./logger.js";

const API = "https://api.todoist.com/rest/v2";

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new MissingEnvError(`Missing env: ${name}`);
  return v;
}

export function getConfig() {
  return {
    token: getEnv("TODOIST_API_TOKEN"),
    projectId: getEnv("TODOIST_PROJECT_ID")
  };
}

export async function todoist(path: string, init?: RequestInit) {
  const { token } = getConfig();
  const url = `${API}${path}`;
  const method = (init?.method ?? "GET").toUpperCase();
  const bodyLen = init?.body ? (typeof init.body === "string" ? init.body.length : -1) : 0;
  log.debug(`HTTP ${method} ${url} bodyBytes=${bodyLen}`);

  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  const status = res.status;
  if (!res.ok) {
    let body: any = null;
    try { body = await res.json(); } catch { try { body = await res.text(); } catch { body = "<unreadable>"; } }
    log.error(`HTTP ${method} ${url} -> ${status} ${JSON.stringify(body).slice(0,500)}`);
    throw new TodoistApiError(status, body);
  }
  if (status === 204) {
    log.debug(`HTTP ${method} ${url} -> 204 No Content`);
    return null;
  }
  const json = await res.json();
  log.debug(`HTTP ${method} ${url} -> ${status} ok`);
  return json;
}
