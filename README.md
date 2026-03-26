# Sports Event Calendar

Small full-stack app for viewing and creating sports events.

## Stack

- FastAPI
- SQLAlchemy
- SQLite
- React

## Run

Backend:

1. Activate the virtual environment:
   `.\.venv\Scripts\activate`
2. Start the API:
   `uvicorn back.main:app --reload`

Frontend:

1. Go to the frontend folder:
   `cd front\calendar-web`
2. Start the app:
   `npm start`

## Seed Data

`python back\seed.py`
