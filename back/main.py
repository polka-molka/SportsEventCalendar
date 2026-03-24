from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List

from starlette.middleware.cors import CORSMiddleware

import models, schemas
from database import SessionLocal

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    events = db.query(models.Event).options(
        joinedload(models.Event.sport),
        joinedload(models.Event.venue)
    ).all()

    results = []
    for event in events:
        # fetch competitors for the event
        competitor_data = db.query(models.Competitor, models.Team) \
            .join(models.Team, models.Competitor._id_team == models.Team.id_team) \
            .filter(models.Competitor._id_event == event.id_event).all()

        # dto
        results.append({
            "id_event": event.id_event,
            "datetime": event.datetime,
            "status": event.status,
            "description": event.description,
            "sport_name": event.sport.sport_name,
            "venue_name": event.venue.venue_name,
            "city": event.venue.city,
            "competitors": [
                {"team_name": t.team_name, "role": c.role, "score": c.score}
                for c, t in competitor_data
            ]
        })

    return results