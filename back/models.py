# SQLAlchemy ORM models for sports, venues, teams, events, and competitors.
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class Sport(Base):
    # Sports group teams and events, for example Football or Ice Hockey.
    __tablename__ = "sports"

    id_sport = Column(Integer, primary_key=True, index=True)
    sport_name = Column(String(100), nullable=False)

    events = relationship("Event", back_populates="sport")
    teams = relationship("Team", back_populates="sport")


class Venue(Base):
    # Venues describe where an event takes place.
    __tablename__ = "venues"

    id_venue = Column(Integer, primary_key=True, index=True)
    venue_name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)

    events = relationship("Event", back_populates="venue")


class Team(Base):
    # Teams belong to a sport and can appear in many event competitors rows.
    __tablename__ = "teams"

    id_team = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(255), nullable=False)
    abbreviation = Column(String(10))
    country_code = Column(String(5))
    _id_sport = Column(Integer, ForeignKey("sports.id_sport"), nullable=False)

    sport = relationship("Sport", back_populates="teams")
    competitors = relationship("Competitor", back_populates="team")


class Event(Base):
    # Events tie together a sport, venue, and scheduled match information.
    __tablename__ = "events"

    id_event = Column(Integer, primary_key=True, index=True)
    datetime = Column(DateTime, nullable=False)
    status = Column(String(50), nullable=False)
    description = Column(String(500))
    match_name = Column(String(255), nullable=True)
    _id_venue = Column(Integer, ForeignKey("venues.id_venue"), nullable=False)
    _id_sport = Column(Integer, ForeignKey("sports.id_sport"), nullable=False)

    sport = relationship("Sport", back_populates="events")
    venue = relationship("Venue", back_populates="events")
    competitors = relationship("Competitor", back_populates="event")


class Competitor(Base):
    # Competitor is the join table that stores each team's role and score in an event.
    __tablename__ = "competitors"

    _id_team = Column(Integer, ForeignKey("teams.id_team"), primary_key=True)
    _id_event = Column(Integer, ForeignKey("events.id_event"), primary_key=True)
    role = Column(String(50), nullable=False)
    score = Column(Integer, nullable=True)

    team = relationship("Team", back_populates="competitors")
    event = relationship("Event", back_populates="competitors")
