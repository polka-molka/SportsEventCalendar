# Pydantic schemas used for request validation and API responses.
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

EventStatus = Literal["Scheduled", "Live", "Finished"]


class CompetitorOut(BaseModel):
    # Nested competitor payload returned inside event responses.
    team_name: str
    role: str
    score: Optional[int] = None

    class Config:
        from_attributes = True


class EventResponse(BaseModel):
    # Full event payload returned to the frontend table.
    id_event: int
    datetime: datetime
    status: EventStatus
    description: Optional[str]
    sport_name: str
    venue_name: str
    city: str
    competitors: List[CompetitorOut]
    match_name: Optional[str] = None

    class Config:
        from_attributes = True


class EventCreate(BaseModel):
    # Payload expected when the frontend creates a new event.
    datetime: datetime
    status: EventStatus
    description: str = ""
    id_sport: int
    id_venue: int
    team_ids: List[int]
    match_name: Optional[str] = None
    home_score: Optional[int] = 0
    away_score: Optional[int] = 0


class EventCreateResponse(BaseModel):
    # Small success response for event creation.
    status: str
    id: int


class SportResponse(BaseModel):
    # Basic sport lookup object for dropdowns.
    id_sport: int
    sport_name: str

    class Config:
        from_attributes = True


class VenueResponse(BaseModel):
    # Basic venue lookup object for dropdowns.
    id_venue: int
    venue_name: str
    city: str

    class Config:
        from_attributes = True


class TeamBase(BaseModel):
    # Team lookup object used in the event creation form.
    id_team: int
    team_name: str
    _id_sport: Optional[int] = None

    class Config:
        from_attributes = True


class CompetitorCreate(BaseModel):
    # Optional direct competitor creation payload.
    id_team: int
    id_event: int
    role: str = Field(default="Home", min_length=1)
    score: Optional[int] = None


class StatusResponse(BaseModel):
    # Generic status response for simple POST endpoints.
    status: str
