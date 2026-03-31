from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import json
import uuid
from pathlib import Path
from datetime import datetime

app = FastAPI(title="Daily Task API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://project.leehenry.top"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"
TODOS_FILE = DATA_DIR / "todos.json"
RECURRING_FILE = DATA_DIR / "recurring.json"

def ensure_files():
    DATA_DIR.mkdir(exist_ok=True)
    if not TODOS_FILE.exists():
        TODOS_FILE.write_text('{"items": []}')
    if not RECURRING_FILE.exists():
        RECURRING_FILE.write_text('{"items": []}')

def read_json(path: Path) -> dict:
    ensure_files()
    return json.loads(path.read_text())

def write_json(path: Path, data: dict):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))


class TodoCreate(BaseModel):
    title: str
    due: Optional[str] = None
    tags: List[str] = []
    done: bool = False

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    due: Optional[str] = None
    tags: Optional[List[str]] = None
    done: Optional[bool] = None

class Todo(BaseModel):
    id: str
    title: str
    due: Optional[str] = None
    tags: List[str] = []
    done: bool = False
    created: str

class RecurringCreate(BaseModel):
    title: str
    recurrence: str = "yearly"
    date: str
    tags: List[str] = []
    notes: str = ""
    remind_days_before: int = 3

class RecurringUpdate(BaseModel):
    title: Optional[str] = None
    recurrence: Optional[str] = None
    date: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    remind_days_before: Optional[int] = None

class RecurringEvent(BaseModel):
    id: str
    title: str
    recurrence: str
    date: str
    tags: List[str] = []
    notes: str = ""
    remind_days_before: int = 3


@app.get("/api/todos")
def get_todos():
    return read_json(TODOS_FILE)

@app.post("/api/todos", status_code=201)
def create_todo(body: TodoCreate):
    data = read_json(TODOS_FILE)
    todo = {
        "id": str(uuid.uuid4()),
        "title": body.title,
        "due": body.due,
        "tags": body.tags,
        "done": body.done,
        "created": datetime.now().isoformat(),
    }
    data["items"].append(todo)
    write_json(TODOS_FILE, data)
    return todo

@app.put("/api/todos/{todo_id}")
def update_todo(todo_id: str, body: TodoUpdate):
    data = read_json(TODOS_FILE)
    for item in data["items"]:
        if item["id"] == todo_id:
            if body.title is not None: item["title"] = body.title
            if body.due is not None: item["due"] = body.due
            if body.tags is not None: item["tags"] = body.tags
            if body.done is not None: item["done"] = body.done
            write_json(TODOS_FILE, data)
            return item
    raise HTTPException(status_code=404, detail="Todo not found")

@app.delete("/api/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: str):
    data = read_json(TODOS_FILE)
    original_len = len(data["items"])
    data["items"] = [i for i in data["items"] if i["id"] != todo_id]
    if len(data["items"]) == original_len:
        raise HTTPException(status_code=404, detail="Todo not found")
    write_json(TODOS_FILE, data)


@app.get("/api/recurring")
def get_recurring():
    return read_json(RECURRING_FILE)

@app.post("/api/recurring", status_code=201)
def create_recurring(body: RecurringCreate):
    data = read_json(RECURRING_FILE)
    event = {
        "id": str(uuid.uuid4()),
        "title": body.title,
        "recurrence": body.recurrence,
        "date": body.date,
        "tags": body.tags,
        "notes": body.notes,
        "remind_days_before": body.remind_days_before,
    }
    data["items"].append(event)
    write_json(RECURRING_FILE, data)
    return event

@app.put("/api/recurring/{event_id}")
def update_recurring(event_id: str, body: RecurringUpdate):
    data = read_json(RECURRING_FILE)
    for item in data["items"]:
        if item["id"] == event_id:
            if body.title is not None: item["title"] = body.title
            if body.recurrence is not None: item["recurrence"] = body.recurrence
            if body.date is not None: item["date"] = body.date
            if body.tags is not None: item["tags"] = body.tags
            if body.notes is not None: item["notes"] = body.notes
            if body.remind_days_before is not None: item["remind_days_before"] = body.remind_days_before
            write_json(RECURRING_FILE, data)
            return item
    raise HTTPException(status_code=404, detail="Recurring event not found")

@app.delete("/api/recurring/{event_id}", status_code=204)
def delete_recurring(event_id: str):
    data = read_json(RECURRING_FILE)
    original_len = len(data["items"])
    data["items"] = [i for i in data["items"] if i["id"] != event_id]
    if len(data["items"]) == original_len:
        raise HTTPException(status_code=404, detail="Recurring event not found")
    write_json(RECURRING_FILE, data)
