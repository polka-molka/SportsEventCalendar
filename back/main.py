# FastAPI application entry point and API route definitions.
from typing import List

from fastapi import Depends, FastAPI, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload
from starlette.middleware.cors import CORSMiddleware

import models
import schemas
from database import SessionLocal

app = FastAPI(title="Sports Event Calendar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    # Provide a database session per request and always close it afterwards.
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def serialize_event(event: models.Event) -> schemas.EventResponse:
    # Keep competitors in a stable home/away order for the frontend.
    ordered_competitors = sorted(
        event.competitors,
        key=lambda competitor: (competitor.role.lower() != "home", competitor.team.team_name),
    )
    return schemas.EventResponse(
        id_event=event.id_event,
        datetime=event.datetime,
        status=event.status,
        description=event.description,
        sport_name=event.sport.sport_name,
        venue_name=event.venue.venue_name,
        city=event.venue.city,
        match_name=event.match_name,
        competitors=[
            schemas.CompetitorOut(
                team_name=competitor.team.team_name,
                role=competitor.role,
                score=competitor.score,
            )
            for competitor in ordered_competitors
        ],
    )


@app.get("/events", response_model=List[schemas.EventResponse])
def read_events(db: Session = Depends(get_db)):
    # Load related entities up front to avoid repeated lazy-loading queries.
    events = (
        db.query(models.Event)
        .options(
            selectinload(models.Event.sport),
            selectinload(models.Event.venue),
            selectinload(models.Event.competitors).selectinload(models.Competitor.team),
        )
        .order_by(models.Event.datetime.asc(), models.Event.id_event.asc())
        .all()
    )
    return [serialize_event(event) for event in events]


@app.get("/sports", response_model=List[schemas.SportResponse])
def read_sports(db: Session = Depends(get_db)):
    return db.query(models.Sport).order_by(models.Sport.sport_name.asc()).all()


@app.get("/venues", response_model=List[schemas.VenueResponse])
def read_venues(db: Session = Depends(get_db)):
    return db.query(models.Venue).order_by(models.Venue.city.asc(), models.Venue.venue_name.asc()).all()


@app.get("/teams", response_model=List[schemas.TeamBase])
def read_teams(
    sport_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
):
    # Filtering by sport keeps the event creation form focused.
    query = db.query(models.Team)
    if sport_id is not None:
        query = query.filter(models.Team._id_sport == sport_id)
    return query.order_by(models.Team.team_name.asc()).all()


@app.post(
    "/competitors",
    response_model=schemas.StatusResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_competitor(competitor_data: schemas.CompetitorCreate, db: Session = Depends(get_db)):
    # Guard against creating references to missing records.
    event = db.get(models.Event, competitor_data.id_event)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found.")

    team = db.get(models.Team, competitor_data.id_team)
    if team is None:
        raise HTTPException(status_code=404, detail="Team not found.")

    competitor = models.Competitor(
        _id_team=competitor_data.id_team,
        _id_event=competitor_data.id_event,
        role=competitor_data.role,
        score=competitor_data.score,
    )
    db.add(competitor)
    db.commit()
    return {"status": "added"}


@app.post(
    "/events",
    response_model=schemas.EventCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_event(event_data: schemas.EventCreate, db: Session = Depends(get_db)):
    # The UI always creates a two-team matchup, so validate that contract here.
    if len(event_data.team_ids) != 2:
        raise HTTPException(status_code=400, detail="Exactly two teams are required.")

    if event_data.team_ids[0] == event_data.team_ids[1]:
        raise HTTPException(status_code=400, detail="Home and away teams must be different.")

    sport = db.get(models.Sport, event_data.id_sport)
    if sport is None:
        raise HTTPException(status_code=404, detail="Sport not found.")

    venue = db.get(models.Venue, event_data.id_venue)
    if venue is None:
        raise HTTPException(status_code=404, detail="Venue not found.")

    teams = db.query(models.Team).filter(models.Team.id_team.in_(event_data.team_ids)).all()
    if len(teams) != 2:
        raise HTTPException(status_code=404, detail="One or more teams were not found.")

    invalid_teams = [team.team_name for team in teams if team._id_sport != event_data.id_sport]
    if invalid_teams:
        raise HTTPException(
            status_code=400,
            detail=f"Teams do not belong to the selected sport: {', '.join(invalid_teams)}.",
        )

    new_event = models.Event(
        datetime=event_data.datetime,
        status=event_data.status,
        description=event_data.description.strip(),
        match_name=event_data.match_name,
        _id_venue=event_data.id_venue,
        _id_sport=event_data.id_sport,
    )
    db.add(new_event)
    # Flush so the event primary key is available before inserting competitors.
    db.flush()

    home_competitor = models.Competitor(
        _id_event=new_event.id_event,
        _id_team=event_data.team_ids[0],
        role="Home",
        score=event_data.home_score if event_data.home_score is not None else 0,
    )
    away_competitor = models.Competitor(
        _id_event=new_event.id_event,
        _id_team=event_data.team_ids[1],
        role="Away",
        score=event_data.away_score if event_data.away_score is not None else 0,
    )

    db.add(home_competitor)
    db.add(away_competitor)
    db.commit()

    return {"status": "success", "id": new_event.id_event}


if __name__ == "__main__":
    import uvicorn

    # Running this file directly starts the local development server.
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
