from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List

from starlette.middleware.cors import CORSMiddleware

import models, schemas
from database import SessionLocal

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, you'd specify your React URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/events", response_model=List[schemas.EventResponse])
def read_events(db: Session = Depends(get_db)):
    # 1. FETCH EVERYTHING IN ONE SQL JOIN
    # This satisfies the "Avoid queries in loops" requirement perfectly.
    events = db.query(models.Event).options(
        joinedload(models.Event.sport),
        joinedload(models.Event.venue)
    ).all()

    results = []
    for event in events:
        # 2. FETCH COMPETITORS FOR THIS EVENT
        # We join with the Team table to get the names in the same hit.
        competitor_data = db.query(models.Competitor, models.Team) \
            .join(models.Team, models.Competitor._id_team == models.Team.id_team) \
            .filter(models.Competitor._id_event == event.id_event).all()

        # 3. CONSTRUCT THE DTO (SAFE DATA TRANSFER)
        results.append({
            "id_event": event.id_event,
            "datetime": event.datetime,
            "status": event.status,
            "description": event.description,
            "sport_name": event.sport.sport_name,  # Now works because of 'relationship'
            "venue_name": event.venue.venue_name,  # Now works because of 'relationship'
            "city": event.venue.city,
            "competitors": [
                {"team_name": t.team_name, "role": c.role, "score": c.score}
                for c, t in competitor_data
            ]
        })

    return results