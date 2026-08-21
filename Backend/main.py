from fastapi import FastAPI
from database import get_connection


app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "FastAPI is running"
    }



# SELECT query
@app.get("/api/projects")
def get_projects():

    conn = get_connection()

    cursor = conn.cursor()


    cursor.execute(
        """
        SELECT id, title, description, image
        FROM projects
        ORDER BY id
        """
    )


    rows = cursor.fetchall()


    cursor.close()
    conn.close()


    projects = []

    for row in rows:
        projects.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "image": row[3]
        })


    return projects