import { z } from "zod";
import {
  CreateTaskInput, TaskOut,
  EditTaskInput,
  ListTasksBySectionInput, ListTasksBySectionOut,
  GetTaskDetailsInput, TaskDetailsOut
} from "./schemas.js";
import { createTask, editTask, listTasksDefaultThree, getTaskDetails } from "./tasks.js";
import { MissingEnvError, ValidationError, NotFoundError, TodoistApiError, log } from "./logger.js";

export type ToolInput =
  | { action: "create_task"; args: z.infer<typeof CreateTaskInput> }
  | { action: "edit_task"; args: z.infer<typeof EditTaskInput> }
  | { action: "list_tasks_by_section"; args: z.infer<typeof ListTasksBySectionInput> }
  | { action: "get_task_details"; args: z.infer<typeof GetTaskDetailsInput> };

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
