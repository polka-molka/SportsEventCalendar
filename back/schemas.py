from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# Displaying teams within an event
class CompetitorOut(BaseModel):
    team_name: str
    role: str
    score: Optional[int] = None

    class Config:
        from_attributes = True

# The main structure for "Get Events"
class EventResponse(BaseModel):
    id_event: int
    datetime: datetime
    status: str
    description: Optional[str]
    sport_name: str
    venue_name: str
    city: str
    competitors: List[CompetitorOut]

    class Config:
        from_attributes = True

# Adding a new event
class EventCreate(BaseModel):
    datetime: datetime
    status: str
    description: str
    id_sport: int
    id_venue: int
    team_ids: List[int]