from Fastapi import FastAPI, HTTPException 

from pydantic import BaseModel 

from typing import Optional

app = FastAPI(title="API Básica de Tarefas"), version="1.0"

Class Task(BaseModel):
    title: str
    done: Optional[bool] = False 

Tasks = [
    {"id": 1, "title": "Estudar Python e FastAPI", "done": False}, 
    {"id": 2, "title": "Fazer exercicíos de back-end", "done": True}
]       

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à nossa API! Acesse /docs para ver a documentação interativa."}

@app.get("/tasks")
def get_tasks()
     return tasks

@app.post("/tasks", status_code=201)
def create_task(task: Task): 
    new_id = tasks[-1]["id"] + 1 if tasks else 1 
    new_task = {"id": new_id, "title": task.title, "done": task.done}
    tasks.append(new_task)
    return {"message": "Tarefa criada com sucesso!", "task": new_task}

@app.put(/"tasks/{task_id}")
def update_task(task_id: int, task: Task):
    for t in tasks:
        if t["id"] == task_id:
            t["title"] = task.title
            t["done"] = task.done
            return {"message": "Tarefa atualizada com sucesso!",  "task"}

raise HTTPException(status_code=404, detail="Tarefa não encontrada")
@app.delete("/tasks/{task_id}")
def delete_task(task_id int):
    for index, t in enumerate(tasks):
        if t ["id"] == task_id:
            tasks.pop(index)

return {"message": "Tarefa deletada com sucesso!"}
raise HTTPException(status_code=404, detail="Tarefa não encontrada")

