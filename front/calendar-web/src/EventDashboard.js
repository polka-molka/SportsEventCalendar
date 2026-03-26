// Alternate dashboard component kept for experimentation and simple display tests.
import React, { useState, useEffect } from 'react';
import { fetchEvents } from './api';

const EventDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load events once when the dashboard mounts.
    fetchEvents()
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => console.error("Backend connection failed:", err));
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="gjs-t-body">
      <header className="header-bar">
        <div className="header-container">
          <h1 className="header-title">Sports Event Calendar</h1>
          <button className="gjs-t-button">+ Add Event</button>
        </div>
      </header>

      <main className="main-content">
        <table className="table-main">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Sport</th>
              <th>Event Title</th>
              <th>Score</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id_event} className="event-row">
                <td>{new Date(event.datetime).toLocaleString('en-GB')}</td>
                <td><span className="sport-badge">{event.sport_name}</span></td>
                <td>
                  <div className="match-name">{event.match_name || "Tournament Match"}</div>
                  <div className="matchup-sub">
                    {event.competitors[0]?.team_name} vs {event.competitors[1]?.team_name}
                  </div>
                </td>
                <td className="evt-score">
                  {event.status === "Scheduled" ? "N/A" : `${event.competitors[0]?.score} - ${event.competitors[1]?.score}`}
                </td>
                <td>{event.venue_name}, {event.city}</td>
                <td>
                  <span className={`status-badge ${event.status.toLowerCase()}`}>
                    {event.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default EventDashboard;
