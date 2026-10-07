import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const text = input.trim();

    if (!text) return;

    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
    };

    setTodos((currentTodos) => [...currentTodos, newTodo]);
    setInput("");
  };

  const toggleTodo = (id) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== id)
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      addTodo();
    }
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const remainingCount = todos.length - completedCount;

  return (
    <div className="app">
      <div className="container">

        {/* Header */}
        <header className="header">
          <div className="logo">
            <div className="logo-icon">✓</div>

            <div>
              <h1>TaskFlow</h1>
              <p>Stay organized. Get things done.</p>
            </div>
          </div>

          <div className="task-count">
            {todos.length} {todos.length === 1 ? "task" : "tasks"}
          </div>
        </header>

        {/* Main Card */}
        <main className="todo-card">

          <div className="section-header">
            <div>
              <h2>My Tasks</h2>
              <p>
                {remainingCount === 0
                  ? "Everything is completed!"
                  : `${remainingCount} ${
                      remainingCount === 1 ? "task" : "tasks"
                    } remaining`}
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="input-container">
            <input
              type="text"
              value={input}
              placeholder="What needs to be done?"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button onClick={addTodo}>
              <span>+</span>
              Add
            </button>
          </div>

          {/* Todo List */}
          <div className="todo-list">

            {todos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✓</div>
                <h3>No tasks yet</h3>
                <p>Add your first task above and get started.</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  className={`todo-item ${
                    todo.completed ? "completed" : ""
                  }`}
                  key={todo.id}
                >
                  <button
                    className={`checkbox ${
                      todo.completed ? "checked" : ""
                    }`}
                    onClick={() => toggleTodo(todo.id)}
                    aria-label={
                      todo.completed
                        ? "Mark task incomplete"
                        : "Mark task complete"
                    }
                  >
                    {todo.completed && "✓"}
                  </button>

                  <span className="todo-text">{todo.text}</span>

                  <button
                    className="delete-button"
                    onClick={() => deleteTodo(todo.id)}
                    aria-label="Delete task"
                  >
                    🗑
                  </button>
                </div>
              ))
            )}

          </div>

          {/* Footer */}
          {todos.length > 0 && (
            <div className="todo-footer">
              <span>
                {remainingCount} remaining
              </span>

              <span>
                {completedCount} completed
              </span>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer>
          <span>Built with React + Vite</span>
          <span>•</span>
          <span>Dockerized with Nginx</span>
        </footer>

      </div>
    </div>
  );
}

export default App;


