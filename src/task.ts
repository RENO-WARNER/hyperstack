export type Result = false | Date;

export interface Task {
	id: string;
	name: string;
	prereq: Result | Task[];
	notes: string;
}

export type Stack = Task[];

export interface Raw {
	id: string;
	name: string;
	prereq: false | string | Raw[];
	notes: string;
}

const NONE = Number.NEGATIVE_INFINITY;

export const isCompleted = (task: Task): boolean =>
	Array.isArray(task.prereq) ? task.prereq.length > 0 && task.prereq.every(isCompleted) : task.prereq !== false;

const latest = (dates: (Date | null)[]): Date | null =>
	dates.reduce<Date | null>((best, date) => (date && (!best || date > best) ? date : best), null);

export const getLatestActivity = (task: Task): Date | null =>
	Array.isArray(task.prereq) ? latest(task.prereq.map(getLatestActivity)) : task.prereq || null;

const stamp = (task: Task): number => getLatestActivity(task)?.getTime() ?? NONE;

export const sortTasks = (tasks: Task[]): Task[] =>
	[...tasks].sort(
		(a, b) => Number(isCompleted(a)) - Number(isCompleted(b)) || stamp(b) - stamp(a) || a.name.localeCompare(b.name)
	);

export const arrange = (tasks: Task[], fresh: ReadonlySet<string>): Task[] => [
	...tasks.filter((task) => fresh.has(task.id)),
	...sortTasks(tasks.filter((task) => !fresh.has(task.id))),
];

export const blank = (): Task => ({ id: crypto.randomUUID(), name: "", prereq: false, notes: "" });

export const hydrate = (raw: Raw): Task => ({
	...raw,
	prereq: Array.isArray(raw.prereq) ? raw.prereq.map(hydrate) : raw.prereq === false ? false : new Date(raw.prereq),
});

export const shrink = (tasks: Task[]): Result | Task[] => (tasks.length > 0 ? tasks : false);

export const prune = (tasks: Task[]): Task[] =>
	tasks
		.filter((task) => task.name !== "")
		.map((task) => (Array.isArray(task.prereq) ? { ...task, prereq: shrink(prune(task.prereq)) } : task));

export type Edit = (task: Task) => Task | null;

const children = (task: Task): Task[] => (Array.isArray(task.prereq) ? task.prereq : []);

export const modify = (tasks: Task[], id: string, edit: Edit): Task[] =>
	tasks.flatMap((task) =>
		task.id === id
			? [edit(task)].filter((next) => next !== null)
			: [Array.isArray(task.prereq) ? { ...task, prereq: shrink(modify(task.prereq, id, edit)) } : task]
	);

export const nest = (task: Task, child: Task): Task => ({ ...task, prereq: [child, ...children(task)] });
