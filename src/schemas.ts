import { z } from "zod";

export const SectionName = z.enum([
  "Backlog",
  "Deferred",
  "Current Sprint Backlog",
  "Blocked",
  "In Progress",
  "Ready for Testing",
  "Complete",
]);
export type SectionName = z.infer<typeof SectionName>;

export const CreateTaskInput = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  section: SectionName.optional(),      // parent only; default Backlog
  due_natural: z.string().optional(),   // dates only (natural language)
  parent_task_id: z.string().optional() // if set -> subtask
});

export const TaskOut = z.object({
  task_id: z.string(),
  parent_task_id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  section: SectionName,
  due: z.object({
    date: z.string().optional(),
    is_overdue: z.boolean(),
    is_today: z.boolean(),
    is_tomorrow: z.boolean()
  }).nullable(),
  url: z.string()
});

export const EditTaskInput = z.object({
  task_id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  due_natural: z.string().optional(),
  section: SectionName.optional()
});

export const ListTasksBySectionInput = z.object({});

export const ListTasksBySectionOut = z.object({
  project_id: z.string(),
  sections: z.array(z.object({
    name: z.enum(["Current Sprint Backlog", "In Progress", "Ready for Testing"]),
    section_id: z.string(),
    tasks: z.array(z.object({
      task_id: z.string(),
      title: z.string(),
      url: z.string(),
      due: z.object({
        date: z.string().optional(),
        is_overdue: z.boolean(),
        is_today: z.boolean(),
        is_tomorrow: z.boolean()
      }).nullable(),
      has_subtasks: z.boolean()
    }))
  }))
});

export const GetTaskDetailsInput = z.object({ task_id: z.string() });

export const TaskDetailsOut = z.object({
  task_id: z.string(),
  title: z.string(),
  description: z.string(),
  section: SectionName,
  due: z.object({
    date: z.string().optional(),
    is_overdue: z.boolean(),
    is_today: z.boolean(),
    is_tomorrow: z.boolean()
  }).nullable(),
  subtasks: z.array(z.object({ task_id: z.string(), title: z.string() })),
  url: z.string()
});
