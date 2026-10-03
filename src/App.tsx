import { useEffect, useState } from "preact/hooks";
import { TaskComponent, TreeContext } from "./TaskComponent";
import { arrange, blank, type Edit, hydrate, modify, prune, type Raw, type Stack } from "./task";

type Library = Record<string, Stack>;

type Stored = Record<string, Raw[]> | Raw[];

const KEY = "hyperstack";

const HOME = "";

const current = () => decodeURIComponent(location.hash.slice(1));

const shelve = (stored: Stored): Record<string, Raw[]> => (Array.isArray(stored) ? { [HOME]: stored } : stored);

const tidy = (library: Library): Library =>
	Object.fromEntries(Object.entries(library).filter(([, stack]) => stack.length > 0));

const load = (): Library => {
	try {
		const stored: Stored = JSON.parse(localStorage.getItem(KEY) ?? "{}");
		return tidy(
			Object.fromEntries(Object.entries(shelve(stored)).map(([tag, stack]) => [tag, prune(stack.map(hydrate))]))
		);
	} catch {
		return {};
	}
};

export function App() {
	const [library, setLibrary] = useState<Library>(load);
	const [tag, setTag] = useState(current);
	const [fresh, setFresh] = useState<ReadonlySet<string>>(new Set());
	const stack = library[tag] ?? [];

	useEffect(() => localStorage.setItem(KEY, JSON.stringify(tidy(library))), [library]);

	useEffect(() => {
		const sync = () => setTag(current());
		addEventListener("hashchange", sync);
		return () => removeEventListener("hashchange", sync);
	}, []);

	const change = (edit: (stack: Stack) => Stack) => setLibrary((prev) => ({ ...prev, [tag]: edit(prev[tag] ?? []) }));

	const spawn = () => {
		const task = blank();
		setFresh((prev) => new Set(prev).add(task.id));
		return task;
	};

	const settle = (id: string) => setFresh((prev) => new Set([...prev].filter((item) => item !== id)));

	const add = () => {
		const task = spawn();
		change((prev) => [task, ...prev]);
	};

	const update = (id: string, edit: Edit) => change((prev) => modify(prev, id, edit));

	return (
		<TreeContext.Provider value={{ fresh, spawn, settle, update }}>
			<div class="min-h-screen bg-white text-black">
				<div class="mx-auto flex max-w-6xl flex-col px-4 py-6">
					<nav class="flex items-center justify-between pb-3">
						<h1 class="text-2xl font-bold">
							HyperStack{tag && <span class="text-gray-400"> #{tag}</span>}
						</h1>
						<button
							type="button"
							class="rounded bg-black px-3 py-1 font-bold text-white hover:bg-gray-800"
							onClick={add}
						>
							New
						</button>
					</nav>
					{stack.length === 0 && <p class="text-center text-gray-400">Nothing stacked yet.</p>}
					<ul class="flex flex-col">
						{arrange(stack, fresh).map((task) => (
							<TaskComponent key={task.id} task={task} />
						))}
					</ul>
				</div>
			</div>
		</TreeContext.Provider>
	);
}
