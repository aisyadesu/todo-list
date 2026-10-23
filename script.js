const { useState, useEffect, useRef } = React;

function App() {

    const [tasks, setTasks] = useState(() => {
        try {
            const savedTasks = localStorage.getItem("myTasks");
            return savedTasks ? JSON.parse(savedTasks) : [];
        } catch (error) {
            return [];
        }
    });

    const [input, setInput] = useState("");

    const listRef = useRef(null);

    useEffect(() => {
        localStorage.setItem("myTasks", JSON.stringify(tasks));
    }, [tasks]);

    function addTask(event) {
        event.preventDefault();

        const taskName = input.trim();

        if (taskName === "") {
            return;
        }

        const newTask = {
            id: Date.now() + Math.random(),
            text: taskName,
            status: "Proses"
        };

        const li = createTaskElement(newTask);

        listRef.current.appendChild(li);

        setTasks(previousTasks => [
            ...previousTasks,
            newTask
        ]);

        setInput("");
    }

    function createTaskElement(task) {

        const li = document.createElement("li");

        li.dataset.id = task.id;

        li.className =
            "flex items-start gap-3 rounded-xl border p-3 sm:p-4 " +
            (task.status === "Selesai"
                ? "border-emerald-100 bg-emerald-50"
                : "border-slate-200 bg-white");

        const taskButton = document.createElement("button");

        taskButton.type = "button";
        taskButton.dataset.action = "toggle";
        taskButton.dataset.id = task.id;
        taskButton.setAttribute(
            "aria-pressed",
            task.status === "Selesai"
        );

        taskButton.className =
            "min-w-0 flex-1 break-words text-left text-base leading-6";

        const taskText = document.createElement("span");

        taskText.textContent = task.text;

        taskText.className =
            task.status === "Selesai"
                ? "text-slate-400 line-through"
                : "text-slate-700";

        const statusText = document.createElement("span");

        statusText.textContent = task.status;

        statusText.className =
            "mt-1 block text-xs " +
            (task.status === "Selesai"
                ? "text-emerald-600"
                : "text-amber-600");

        taskButton.appendChild(taskText);
        taskButton.appendChild(statusText);

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = task.id;
        deleteButton.textContent = "Hapus";

        deleteButton.className =
            "shrink-0 rounded-lg px-3 py-2 text-sm font-medium " +
            "text-red-500 transition hover:bg-red-50 hover:text-red-700";

        deleteButton.setAttribute(
            "aria-label",
            "Hapus tugas: " + task.text
        );

        li.appendChild(taskButton);
        li.appendChild(deleteButton);

        return li;
    }

    useEffect(() => {

        const list = listRef.current;

        if (!list) {
            return;
        }

        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }

        tasks.forEach(task => {
            const li = createTaskElement(task);
            list.appendChild(li);
        });

    }, [tasks]);

    useEffect(() => {

        const list = listRef.current;

        if (!list) {
            return;
        }

        function handleListClick(event) {

            const button = event.target.closest(
                "button[data-action]"
            );

            if (!button || !list.contains(button)) {
                return;
            }

            const id = Number(button.dataset.id);
            const action = button.dataset.action;

            if (action === "toggle") {

                setTasks(previousTasks =>
                    previousTasks.map(task =>
                        task.id === id
                            ? {
                                ...task,
                                status:
                                    task.status === "Proses"
                                        ? "Selesai"
                                        : "Proses"
                            }
                            : task
                    )
                );

            }

            if (action === "delete") {

                const li = button.closest("li");

                if (li && list.contains(li)) {
                    list.removeChild(li);
                }

                setTasks(previousTasks =>
                    previousTasks.filter(task => task.id !== id)
                );

            }
        }

        list.addEventListener("click", handleListClick);

        return () => {
            list.removeEventListener("click", handleListClick);
        };

    }, []);

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        task => task.status === "Selesai"
    ).length;

    const pendingTasks = tasks.filter(
        task => task.status === "Proses"
    ).length;

    const progress = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    return (

        <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">

            <div className="mx-auto w-full max-w-2xl">

                <header className="mb-8 text-center">

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        My To-Do List
                    </h1>

                    <p className="mt-3 text-sm text-slate-500 sm:text-base">
                        Atur kegiatanmu dan selesaikan satu per satu.
                    </p>

                </header>

                <section className="mb-6 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">

                        <p className="text-sm text-slate-500">
                            Proses
                        </p>

                        <p className="mt-1 text-2xl font-bold text-amber-500">
                            {pendingTasks}
                        </p>

                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">

                        <p className="text-sm text-slate-500">
                            Selesai
                        </p>

                        <p className="mt-1 text-2xl font-bold text-emerald-600">
                            {completedTasks}
                        </p>

                    </div>

                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Tambahkan Tugas
                    </h2>

                    <form
                        id="taskForm"
                        onSubmit={addTask}
                        className="flex flex-col gap-3 sm:flex-row"
                    >

                        <input
                            type="text"
                            value={input}
                            onChange={event => setInput(event.target.value)}
                            placeholder="Masukkan tugas baru..."
                            aria-label="Nama kegiatan"
                            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-100"
                        />

                        <button
                            type="submit"
                            className="rounded-xl bg-lime-400 px-5 py-3 font-semibold text-white transition hover:bg-lime-600 active:scale-95"
                        >
                            + Tambah
                        </button>

                    </form>

                </section>

                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

                    <h2 className="mb-5 text-lg font-semibold text-slate-900">
                        Daftar Tugas
                    </h2>

                    <ul
                        ref={listRef}
                        id="taskList"
                        className="space-y-3"
                    >
                    </ul>

                    {tasks.length === 0 && (

                        <p className="py-8 text-center text-sm text-slate-400">
                            Belum ada tugas. Tambahkan tugas pertamamu!
                        </p>

                    )}

                    {totalTasks > 0 && (

                        <div className="mt-6 border-t border-slate-100 pt-5">

                            <div className="mb-2 flex justify-between text-sm">

                                <span className="text-slate-500">
                                    Progress Tugas
                                </span>

                                <span className="font-semibold text-indigo-600">
                                    {progress}%
                                </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                <div
                                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                                    style={{
                                        width: progress + "%"
                                    }}
                                ></div>

                            </div>

                        </div>

                    )}

                </section>

                <footer className="mt-8 text-center text-xs text-slate-400 sm:text-sm">
                    My To-Do List · Aishandisu
                </footer>

            </div>

        </main>

    );
}

const root = ReactDOM.createRoot(
    document.getElementById("root")
);

root.render(<App />);