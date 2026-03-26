# Sports Event Calendar overview

Sports Event Calendar is a small full-stack app for viewing and creating sports events.

I used a data modeler to visualise visualize the database structure:

<img width="1125" height="682" alt="image" src="https://github.com/user-attachments/assets/a5d107f1-7e5a-4e7b-bbd3-4a3c80c4cbed" />

For this project, I chose a simplified schema because the application scope is relatively small and does not require a highly scalable or heavily normalized solution. For example, I kept venue data in a single Venue table instead of splitting address details into separate tables. I also did not introduce enums or additional lookup tables for values such as event status, because that would add complexity without much benefit at this scale.

I still included the relationships that were necessary for the domain model though. For example, the Competitor table acts as a junction table between Event and Team and it stores extra match-specific data such as role and score.

As for the backend, my first thought was to build it in C#, but I feel like it requires a lot more patience with APIs and entities and for a project like this it did not feel worth it. I chose FastAPI because it was the more practical option.

As for the frontend I know React the best, so that was a quick choice.

## Stack

- Backend: FastAPI, SQLAlchemy, SQLite
- Frontend: React

## Project Structure

- `back/` contains the FastAPI backend, database models, schemas, and seed script
- `front/calendar-web/` contains the React frontend

## Run the Backend

1. Activate the virtual environment:
   `.\.venv\Scripts\activate`
2. Start the API:
   1. Go to the frontend folder:
   `cd back`
   2. Run:
   `uvicorn main:app --reload` 

The backend runs on `http://127.0.0.1:8000`.

## Seed the Database

To add sample data:

`python back\seed.py`

## Run the Frontend

1. Go to the frontend folder:
   `cd front\calendar-web`
2. Start the React app:
   `npm start`

The frontend runs on `http://localhost:3000`. 

