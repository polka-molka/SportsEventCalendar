# Simple local seed script that recreates the database with sample data.
from database import SessionLocal, engine
import models
from datetime import datetime

# Rebuild the schema from scratch for a clean local demo dataset.
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Sports
    football = models.Sport(sport_name="Football")
    hockey = models.Sport(sport_name="Ice Hockey")
    db.add_all([football, hockey])
    db.commit()

    # Venues
    v1 = models.Venue(venue_name="Red Bull Arena", city="Salzburg")
    v2 = models.Venue(venue_name="Eisstadion Graz Liebenau", city="Graz")
    db.add_all([v1, v2])
    db.commit()

    # Teams
    t1 = models.Team(team_name="Salzburg", abbreviation="RBS", _id_sport=football.id_sport)
    t2 = models.Team(team_name="Sturm Graz", abbreviation="STU", _id_sport=football.id_sport)
    t3 = models.Team(team_name="KAC", abbreviation="KAC", _id_sport=hockey.id_sport)
    t4 = models.Team(team_name="Capitals", abbreviation="VIC", _id_sport=hockey.id_sport)
    db.add_all([t1, t2, t3, t4])
    db.commit()

    # Events
    # Football event: Salzburg vs. Sturm Graz
    event1 = models.Event(
        datetime=datetime(2019, 7, 18, 18, 30),
        status="Finished",
        match_name="Austrian Summer League Finals",
        description="League Match",
        _id_venue=v1.id_venue,
        _id_sport=football.id_sport
    )

    # Ice hockey event: KAC vs. Capitals
    event2 = models.Event(
        datetime=datetime(2019, 10, 23, 9, 45),
        status="Scheduled",
        match_name="Annual Winter Championship",
        description="Championship Game",
        _id_venue=v2.id_venue,
        _id_sport=hockey.id_sport
    )
    db.add_all([event1, event2])
    db.commit()

    # Competitors
    participants = [
        # Event 1
        models.Competitor(_id_event=event1.id_event, _id_team=t1.id_team, role="Home", score=2),
        models.Competitor(_id_event=event1.id_event, _id_team=t2.id_team, role="Away", score=1),

        # Event 2
        # Score is null because the event is still scheduled
        models.Competitor(_id_event=event2.id_event, _id_team=t3.id_team, role="Home", score=None),
        models.Competitor(_id_event=event2.id_event, _id_team=t4.id_team, role="Away", score=None)
    ]
    db.add_all(participants)
    db.commit()

    print("Database seeded successfully according to the ERD!")

except Exception as e:
    print(f"An error occurred: {e}")
    db.rollback()
finally:
    db.close()
