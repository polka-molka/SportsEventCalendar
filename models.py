from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Sport(Base):
    __tablename__ = "sports"
    id_sport = Column(Integer, primary_key=True, index=True)
    sport_name = Column(String(100), nullable=False)

class Venue(Base):
    __tablename__ = "venues"
    id_venue = Column(Integer, primary_key=True, index=True)
    venue_name = Column(String(255))
    city = Column(String(100))

class Team(Base):
    __tablename__ = "teams"
    id_team = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(255))
    abbreviation = Column(String(10))
    country_code = Column(String(5))

class Event(Base):
    __tablename__ = "events"
    id_event = Column(Integer, primary_key=True, index=True)
    datetime = Column(DateTime)
    status = Column(String(50))
    description = Column(String(500))
    _id_venue = Column(Integer, ForeignKey("venues.id_venue"))
    _id_sport = Column(Integer, ForeignKey("sports.id_sport"))

class Competitor(Base):
    __tablename__ = "competitors"
    _id_team = Column(Integer, ForeignKey("teams.id_team"), primary_key=True)
    _id_event = Column(Integer, ForeignKey("events.id_event"), primary_key=True)
    role = Column(String(50)) # e.g., 'home' or 'away'
    score = Column(Integer, nullable=True) # Matches 'N' (Nullable) in your diagram