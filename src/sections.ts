import { todoist, getConfig } from "./client.js";
import { NotFoundError, log } from "./logger.js";
import type { SectionName } from "./schemas.js";

type Section = { id: string; name: string; project_id: string };

let cache: Map<string, string> | null = null;

export async function ensureCanonicalSections(): Promise<Map<string, string>> {
  if (cache) return cache;
  const { projectId } = getConfig();
  const sections = await todoist(`/sections?project_id=${projectId}`) as Section[];
  const map = new Map<string,string>();
  
  // Map existing sections directly without trying to create new ones
  for (const s of sections) {
    map.set(s.name, s.id);
  }
  
  // Add flexible mappings for different casings to support both formats
  if (map.has("In progress")) map.set("In Progress", map.get("In progress")!);
  if (map.has("Ready for testing")) map.set("Ready for Testing", map.get("Ready for testing")!);
  
  cache = map;
  log.info(`sections_loaded total=${map.size}`);
  return map;
}

export async function getSectionIdByName(name: SectionName): Promise<string> {
  const map = await ensureCanonicalSections();
  const id = map.get(name);
  if (!id) throw new NotFoundError(`Section not found: ${name}`);
  return id;
}

export function clearSectionCache() { cache = null; }