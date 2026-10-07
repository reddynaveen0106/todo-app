import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "/api";

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  // Load todos from PostgreSQL through FastAPI
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const response = await fetch(`${API_URL}/todos`);

        if (!response.ok) {
          throw new Error("Failed to fetch todos");
        }

        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error("Failed to load todos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  // Add todo to PostgreSQL through FastAPI
  const addTodo = async () => {
    const text = input.trim();

    if (!text) return;

    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create todo");
      }

      const newTodo = await response.json();

      setTodos((currentTodos) => [...currentTodos, newTodo]);
      setInput("");
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  };

  // Update todo in PostgreSQL
  const toggleTodo = async (id) => {
    const todo = todos.find((todo) => todo.id === id);

    if (!todo) return;

    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !todo.completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      const updatedTodo = await response.json();

      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  // Delete todo from PostgreSQL
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      setTodos((currentTodos) =>
        currentTodos.filter((todo) => todo.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      addTodo();
    }
  };

  const completedCount = todos.filter(
    (todo) => todo.completed
  ).length;

  const remainingCount = todos.length - completedCount;

  return (
    <div className="app">
      <div className="todo-container">

        <header className="header">
          <h1>TaskFlow</h1>
          <p>Organize your tasks and get things done.</p>
        </header>

        <div className="input-section">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button onClick={addTodo}>
            Add Task
          </button>
        </div>

        <div className="stats">
          <span>Total: {todos.length}</span>
          <span>Remaining: {remainingCount}</span>
          <span>Completed: {completedCount}</span>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading tasks...
          </div>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p>Add your first task above.</p>
          </div>
        ) : (
          <div className="todo-list">
            {todos.map((todo) => (
              <div
                className={`todo-item ${
                  todo.completed ? "completed" : ""
                }`}
                key={todo.id}
              >
                <div className="todo-content">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />

                  <span>{todo.text}</span>
                </div>

                <button
                  className="delete-button"
                  onClick={() => deleteTodo(todo.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;