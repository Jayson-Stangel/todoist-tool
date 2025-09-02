import { todoist, getConfig } from "./client.js";
import { NotFoundError, ValidationError, log } from "./logger.js";
import { getSectionIdByName, ensureCanonicalSections } from "./sections.js";
import { dateFlags } from "./utils.js";
import type { SectionName } from "./schemas.js";

type Task = {
  id: string;
  content: string;
  description?: string;
  url: string;
  project_id: string;
  section_id?: string;
  parent_id?: string;
  due?: { date?: string|null } | null;
};

async function getTask(id: string): Promise<Task> {
  const t = await todoist(`/tasks/${id}`) as Task;
  const { project_id } = t;
  const { projectId } = getConfig();
  if (project_id !== projectId) throw new NotFoundError(`Task not in configured project`);
  return t;
}

async function findSubtasks(parentId: string): Promise<Task[]> {
  const { projectId } = getConfig();
  return await todoist(`/tasks?project_id=${projectId}&parent_id=${parentId}`) as Task[];
}

export async function createTask(args: {
  title: string;
  description: string;
  section?: SectionName;
  due_natural?: string;
  parent_task_id?: string;
}) {
  const { projectId } = getConfig();
  await ensureCanonicalSections();

  let section_id: string | undefined;
  if (args.parent_task_id) {
    const parent = await getTask(args.parent_task_id);
    section_id = parent.section_id;
    if (!section_id) {
      section_id = await getSectionIdByName("Backlog");
    }
  } else {
    const target = args.section ?? "Backlog";
    section_id = await getSectionIdByName(target);
  }

  const body: any = {
    content: args.title,
    description: args.description,
    project_id: projectId,
    section_id
  };
  if (args.parent_task_id) body.parent_id = args.parent_task_id;
  if (args.due_natural) body.due_string = args.due_natural;

  const t = await todoist(`/tasks`, { method: "POST", body: JSON.stringify(body) }) as Task;

  log.info(`create_task id=${t.id} parent=${t.parent_id ?? "none"} section_id=${t.section_id}`);

  return {
    task_id: t.id,
    parent_task_id: t.parent_id,
    title: t.content,
    description: t.description ?? "",
    section: await sectionNameFromId(t.section_id),
    due: dateFlags(t.due?.date ?? undefined),
    url: t.url
  };
}

export async function editTask(args: {
  task_id: string;
  title?: string;
  description?: string;
  due_natural?: string;
  section?: SectionName;
}) {
  const t = await getTask(args.task_id);

  const patch: any = {};
  if (args.title) patch.content = args.title;
  if (args.description !== undefined) patch.description = args.description;
  if (args.due_natural !== undefined) patch.due_string = args.due_natural;

  if (args.section) {
    if (t.parent_id) throw new ValidationError("Subtasks inherit parent section and cannot be moved directly.");
    const section_id = await getSectionIdByName(args.section);
    patch.section_id = section_id;
  }

  const updated = await todoist(`/tasks/${t.id}`, { method: "POST", body: JSON.stringify(patch) }) as Task;
  log.info(`edit_task id=${updated.id} moved_section=${args.section ? "yes" : "no"}`);

  return {
    task_id: updated.id,
    parent_task_id: updated.parent_id,
    title: updated.content,
    description: updated.description ?? "",
    section: await sectionNameFromId(updated.section_id),
    due: dateFlags(updated.due?.date ?? undefined),
    url: updated.url
  };
}

export async function listTasksDefaultThree() {
  const { projectId } = getConfig();
  const map = await ensureCanonicalSections();

  const wanted: Array<{name: "Current Sprint Backlog"|"In Progress"|"Ready for Testing", id: string}> = [
    { name: "Current Sprint Backlog", id: map.get("Current Sprint Backlog")! },
    { name: "In Progress", id: map.get("In Progress")! },
    { name: "Ready for Testing", id: map.get("Ready for Testing")! }
  ];

  const sections = [];
  for (const w of wanted) {
    const tasks = await todoist(`/tasks?project_id=${projectId}&section_id=${w.id}`) as Task[];
    const entries = [];
    for (const t of tasks) {
      const subs = await findSubtasks(t.id);
      entries.push({
        task_id: t.id,
        title: t.content,
        url: t.url,
        due: dateFlags(t.due?.date ?? undefined),
        has_subtasks: subs.length > 0
      });
    }
    sections.push({ name: w.name, section_id: w.id, tasks: entries });
  }

  log.info(`list_tasks_by_section sections=3`);

  return { project_id: projectId, sections };
}

export async function getTaskDetails(task_id: string) {
  const t = await getTask(task_id);
  const subs = await findSubtasks(task_id);

  log.info(`get_task_details id=${task_id} subtasks=${subs.length}`);

  return {
    task_id: t.id,
    title: t.content,
    description: t.description ?? "",
    section: await sectionNameFromId(t.section_id),
    due: dateFlags(t.due?.date ?? undefined),
    subtasks: subs.map(s => ({ task_id: s.id, title: s.content })),
    url: t.url
  };
}

async function sectionNameFromId(id?: string): Promise<SectionName> {
  const map = await ensureCanonicalSections();
  for (const [name, sid] of map.entries()) if (sid === id) return name as SectionName;
  return "Backlog";
}
