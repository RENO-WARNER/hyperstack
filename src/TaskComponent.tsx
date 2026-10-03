import { createContext } from "preact";
import { useContext, useEffect, useRef, useState } from "preact/hooks";
import { arrange, blank, isCompleted, type Task } from "./task";

export interface Tree {
	fresh: ReadonlySet<string>;
	spawn: () => Task;
	settle: (id: string) => void;
}

export const TreeContext = createContext<Tree>({ fresh: new Set(), spawn: blank, settle: () => {} });

interface Props {
	task: Task;
	onChange: (task: Task) => void;
}

const BUTTON = "h-7 rounded bg-black px-2 text-sm font-bold text-white hover:bg-gray-800";

export function TaskComponent({ task, onChange }: Props) {
	const tree = useContext(TreeContext);
	const [editing, setEditing] = useState(tree.fresh.has(task.id));
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState({ name: task.name, notes: task.notes });
	const input = useRef<HTMLInputElement>(null);

	useEffect(() => {
		editing && input.current?.focus();
	}, [editing]);

	const subs = Array.isArray(task.prereq) ? task.prereq : null;
	const done = isCompleted(task);
	const foldable = subs !== null || task.notes !== "";
	const visible = editing || (open && foldable);

	const edit = () => {
		setDraft({ name: task.name, notes: task.notes });
		setEditing(true);
	};

	const save = () => {
		onChange({ ...task, ...draft });
		setEditing(false);
		tree.settle(task.id);
	};

	const add = () => {
		onChange({ ...task, prereq: [tree.spawn(), ...(subs ?? [])] });
		setOpen(true);
	};

	const check = () => onChange({ ...task, prereq: task.prereq === false ? new Date() : false });

	const replace = (child: Task) =>
		onChange({ ...task, prereq: (subs ?? []).map((item) => (item.id === child.id ? child : item)) });

	return (
		<li class="flex flex-col gap-2 border border-gray-200 p-2 not-first:border-t-0">
			<div class="flex items-center gap-2">
				{editing ? (
					<input
						ref={input}
						type="text"
						class="flex-1 rounded border border-gray-300 px-2 py-1"
						placeholder="Task name"
						value={draft.name}
						onInput={(event) => setDraft({ ...draft, name: event.currentTarget.value })}
						onKeyDown={(event) => event.key === "Enter" && save()}
					/>
				) : (
					<button
						type="button"
						class="flex flex-1 items-center gap-2 text-left"
						onClick={() => setOpen(!open)}
					>
						<span class="w-4 text-gray-500">{foldable ? (open ? "▾" : "▸") : ""}</span>
						<span class={done ? "text-gray-400 line-through" : ""}>{task.name || "Untitled"}</span>
					</button>
				)}
				<button type="button" class={BUTTON} onClick={editing ? save : edit}>
					{editing ? "Save" : "Edit"}
				</button>
				<button type="button" class={BUTTON} onClick={add}>
					+
				</button>
				<input
					type="checkbox"
					class="size-7 accent-black"
					checked={done}
					disabled={subs !== null}
					onChange={check}
				/>
			</div>
			{visible && (
				<div class="flex flex-col gap-2 pl-6">
					{editing ? (
						<textarea
							class="rounded border border-gray-300 px-2 py-1"
							placeholder="Notes"
							value={draft.notes}
							onInput={(event) => setDraft({ ...draft, notes: event.currentTarget.value })}
						/>
					) : (
						task.notes && <p class="whitespace-pre-wrap text-sm text-gray-600">{task.notes}</p>
					)}
					{subs && (
						<ul class="flex flex-col">
							{arrange(subs, tree.fresh).map((child) => (
								<TaskComponent key={child.id} task={child} onChange={replace} />
							))}
						</ul>
					)}
				</div>
			)}
		</li>
	);
}
