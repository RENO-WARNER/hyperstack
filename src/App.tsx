import { useEffect, useState } from "preact/hooks";
import { TaskComponent, TreeContext } from "./TaskComponent";
import { arrange, blank, type Edit, hydrate, modify, prune, type Raw, type Stack } from "./task";

const KEY = "hyperstack";

const load = (): Stack => {
	try {
		return prune((JSON.parse(localStorage.getItem(KEY) ?? "[]") as Raw[]).map(hydrate));
	} catch {
		return [];
	}
};

export function App() {
	const [stack, setStack] = useState<Stack>(load);
	const [fresh, setFresh] = useState<ReadonlySet<string>>(new Set());

	useEffect(() => localStorage.setItem(KEY, JSON.stringify(stack)), [stack]);

	const spawn = () => {
		const task = blank();
		setFresh((prev) => new Set(prev).add(task.id));
		return task;
	};

	const settle = (id: string) => setFresh((prev) => new Set([...prev].filter((item) => item !== id)));

	const add = () => {
		const task = spawn();
		setStack((prev) => [task, ...prev]);
	};

	const update = (id: string, edit: Edit) => setStack((prev) => modify(prev, id, edit));

	return (
		<TreeContext.Provider value={{ fresh, spawn, settle, update }}>
			<div class="min-h-screen bg-white text-black">
				<div class="mx-auto flex max-w-6xl flex-col px-4 py-6">
					<nav class="flex items-center justify-between pb-3">
						<h1 class="text-2xl font-bold">HyperStack</h1>
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
