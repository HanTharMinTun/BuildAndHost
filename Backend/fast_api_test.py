from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI();

@app.get("/",response_class=HTMLResponse)
def home_page():
    return "<h1>Welcome to HOmepage!<h1/>"
    # return {"message": "Hello World"}