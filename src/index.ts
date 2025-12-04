import { z } from "zod";
import {
  CreateTaskInput, TaskOut,
  EditTaskInput,
  MoveTaskInput,
  ListTasksBySectionInput, ListTasksBySectionOut,
  GetTaskDetailsInput, TaskDetailsOut,
  SearchTasksInput, SearchTasksOut,
  DeleteTaskInput, DeleteTaskOut,
  GetSectionsInput, GetSectionsOut
} from "./schemas.js";
import { createTask, editTask, moveTask, listTasksDefaultThree, getTaskDetails, searchTasks, deleteTask, getSections } from "./tasks.js";
import { MissingEnvError, ValidationError, NotFoundError, TodoistApiError, log } from "./logger.js";

export type ToolInput =
  | { action: "create_task"; args: z.infer<typeof CreateTaskInput> }
  | { action: "edit_task"; args: z.infer<typeof EditTaskInput> }
  | { action: "move_task"; args: z.infer<typeof MoveTaskInput> }
  | { action: "list_tasks_by_section"; args: z.infer<typeof ListTasksBySectionInput> }
  | { action: "get_task_details"; args: z.infer<typeof GetTaskDetailsInput> }
  | { action: "search_tasks"; args: z.infer<typeof SearchTasksInput> }
  | { action: "delete_task"; args: z.infer<typeof DeleteTaskInput> }
  | { action: "get_sections"; args: z.infer<typeof GetSectionsInput> };

export async function todoist_tool(input: ToolInput) {
  try {
    switch (input.action) {
      case "create_task": {
        const parsed = CreateTaskInput.parse(input.args);
        const out = await createTask(parsed);
        return { ok: true, action: input.action, data: TaskOut.parse(out) };
      }
      case "edit_task": {
        const parsed = EditTaskInput.parse(input.args);
        const out = await editTask(parsed);
        return { ok: true, action: input.action, data: TaskOut.parse(out) };
      }
      case "move_task": {
        const parsed = MoveTaskInput.parse(input.args);
        const out = await moveTask(parsed);
        return { ok: true, action: input.action, data: TaskOut.parse(out) };
      }
      case "list_tasks_by_section": {
        ListTasksBySectionInput.parse(input.args ?? {});
        const out = await listTasksDefaultThree();
        return { ok: true, action: input.action, data: ListTasksBySectionOut.parse(out) };
      }
      case "get_task_details": {
        const parsed = GetTaskDetailsInput.parse(input.args);
        const out = await getTaskDetails(parsed.task_id);
        return { ok: true, action: input.action, data: TaskDetailsOut.parse(out) };
      }
      case "search_tasks": {
        const parsed = SearchTasksInput.parse(input.args);
        const out = await searchTasks(parsed.query, { exact_title: parsed.exact_title });
        return { ok: true, action: input.action, data: SearchTasksOut.parse(out) };
      }
      case "delete_task": {
        const parsed = DeleteTaskInput.parse(input.args);
        const out = await deleteTask(parsed.task_id);
        return { ok: true, action: input.action, data: DeleteTaskOut.parse(out) };
      }
      case "get_sections": {
        GetSectionsInput.parse(input.args ?? {});
        const out = await getSections();
        return { ok: true, action: input.action, data: GetSectionsOut.parse(out) };
      }
      default: {
        const a = (input as any).action;
        return { ok: false, error: `Unknown action: ${a}` };
      }
    }
  } catch (err: any) {
    const errType =
      err instanceof MissingEnvError ? "MissingEnvError" :
      err instanceof ValidationError ? "ValidationError" :
      err instanceof NotFoundError ? "NotFoundError" :
      err instanceof TodoistApiError ? "TodoistApiError" :
      "UnknownError";

    if (errType === "TodoistApiError") {
      log.error(`tool_error type=${errType} msg=${err.message}`);
    } else {
      log.error(`tool_error type=${errType} msg=${err.message ?? String(err)}`);
    }

    const payload = err instanceof TodoistApiError ? { status: err.status, body: err.body } : undefined;
    return { ok: false, error: err.message ?? String(err), error_type: errType, payload };
  }
}

// local smoke test
// if (import.meta.main) {
//   (async () => {
//     const res = await todoist_tool({ action: "list_tasks_by_section", args: {} } as any);
//     console.log(JSON.stringify(res, null, 2));
//   })();
// }
