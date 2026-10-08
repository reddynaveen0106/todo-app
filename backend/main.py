from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
import os
import time

app = FastAPI(title="Todo API", version="0.1.0")


# =========================
# Database Configuration
# =========================

DB_HOST = os.getenv("DB_HOST", "db")
DB_NAME = os.getenv("POSTGRES_DB", "todo_db")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")


def get_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )


# =========================
# Initialize Database
# =========================

def init_db():
    for _ in range(10):
        try:
            conn = get_connection()
            cursor = conn.cursor()

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS todos (
                    id SERIAL PRIMARY KEY,
                    text TEXT NOT NULL,
                    completed BOOLEAN NOT NULL DEFAULT FALSE
                )
            """)

            conn.commit()
            cursor.close()
            conn.close()

            print("Database initialized")
            return

        except psycopg2.OperationalError:
            print("Waiting for PostgreSQL...")
            time.sleep(2)

    raise Exception("Could not connect to PostgreSQL")


@app.on_event("startup")
def startup():
    init_db()


# =========================
# Pydantic Models
# =========================

class TodoCreate(BaseModel):
    text: str


class TodoUpdate(BaseModel):
    completed: bool


class Todo(BaseModel):
    id: int
    text: str
    completed: bool


class DeleteResponse(BaseModel):
    message: str


# =========================
# Health Check
# =========================

@app.get("/health")
def health():
    return {"status": "ok"}


# =========================
# GET ALL TODOS
# =========================

@app.get("/todos", response_model=list[Todo])
def get_todos():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, text, completed FROM todos ORDER BY id"
    )

    todos = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            "id": todo[0],
            "text": todo[1],
            "completed": todo[2]
        }
        for todo in todos
    ]


# =========================
# CREATE TODO
# =========================

@app.post("/todos", response_model=Todo)
def create_todo(todo: TodoCreate):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO todos (text)
        VALUES (%s)
        RETURNING id, text, completed
        """,
        (todo.text,)
    )

    new_todo = cursor.fetchone()

    conn.commit()

    cursor.close()
    conn.close()

    return {
        "id": new_todo[0],
        "text": new_todo[1],
        "completed": new_todo[2]
    }


# =========================
# UPDATE TODO
# =========================

@app.put("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, todo: TodoUpdate):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE todos
        SET completed = %s
        WHERE id = %s
        RETURNING id, text, completed
        """,
        (todo.completed, todo_id)
    )

    updated_todo = cursor.fetchone()

    if not updated_todo:
        cursor.close()
        conn.close()

        raise HTTPException(
            status_code=404,
            detail="Todo not found"
        )

    conn.commit()

    cursor.close()
    conn.close()

    return {
        "id": updated_todo[0],
        "text": updated_todo[1],
        "completed": updated_todo[2]
    }


# =========================
# DELETE TODO
# =========================

@app.delete("/todos/{todo_id}", response_model=DeleteResponse)
def delete_todo(todo_id: int):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM todos
        WHERE id = %s
        RETURNING id
        """,
        (todo_id,)
    )

    deleted = cursor.fetchone()

    if not deleted:
        cursor.close()
        conn.close()

        raise HTTPException(
            status_code=404,
            detail="Todo not found"
        )

    conn.commit()

    cursor.close()
    conn.close()

    return {
        "message": "Todo deleted"
    }
