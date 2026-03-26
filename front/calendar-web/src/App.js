// Main dashboard view for listing and filtering events.
import React, { useState, useEffect } from 'react';
import './App.css';
import AddEventModal from './components/AddEventModal';
import { fetchEvents as fetchEventsRequest } from './api';

function App() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedSport, setSelectedSport] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchEvents = () => {
    // Refresh both the raw dataset and the currently visible table rows.
    setLoading(true);
    setErrorMessage('');

    fetchEventsRequest()
      .then((data) => {
        setEvents(data);
        setFilteredEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API connection error:", err);
        setErrorMessage('Unable to load events. Please make sure the backend is running.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFilter = (sport) => {
    // Apply the selected sport filter without another API request.
    setSelectedSport(sport);
    if (sport === "All") {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event => event.sport_name === sport);
      setFilteredEvents(filtered);
    }
  };

  const uniqueSports = ["All", ...new Set(events.map(e => e.sport_name))];

  if (loading) return <div className="gjs-t-body">Loading events...</div>;

  return (
    <div className="gjs-t-body">
      <header className="header-bar">
        <div className="header-container">
          <div className="header-title-group">
            <h1 className="gjs-t-h1 header-title">Sports Event Calendar</h1>
          </div>
          <button className="gjs-t-button" onClick={() => setIsModalOpen(true)}>+ Add Event</button>
        </div>
      </header>

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchEvents}
      />

      <main className="main-content">
        <section className="table-section">
          <div className="table-header-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '500', color: '#64748b' }}>Filter by sport:</span>
              <select
                aria-label="Sport filter"
                className="filter-select"
                value={selectedSport}
                onChange={(e) => handleFilter(e.target.value)}
              >
                {uniqueSports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>
            <div className="event-count">
              Showing: <strong>{filteredEvents.length}</strong> events
            </div>
          </div>

          {errorMessage && (
            <div style={{ padding: '16px 20px', color: '#b91c1c', borderBottom: '1px solid #e2e8f0' }}>
              {errorMessage}
            </div>
          )}

          <table className="table-main">
            <thead>
              <tr className="table-header-row">
                <th className="cell-datetime">DATE & TIME</th>
                <th className="cell-sport">SPORT</th>
                <th className="cell-matchup">EVENT TITLE</th>
                <th className="cell-score">SCORE/RESULT</th>
                <th className="cell-location">LOCATION</th>
                <th className="cell-status">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id_event} className="event-row">
                  <td className="cell-datetime">
                    {new Date(event.datetime).toLocaleString('en-GB', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="cell-sport">
                    <span className="sport-badge">{event.sport_name}</span>
                  </td>
                  <td className="cell-matchup">
                    <div className="match-name-text" style={{fontWeight: '600'}}>
                      {event.match_name || "Tournament Match"}
                    </div>
                    <div className="matchup-sub-text" style={{fontSize: '0.8rem', color: '#64748b'}}>
                      {event.competitors[0]?.team_name} vs {event.competitors[1]?.team_name}
                    </div>
                  </td>
                  <td className="cell-score">
                    <span className="score-value">
                      {event.status === "Scheduled"
                        ? "N/A"
                        : `${event.competitors[0]?.score} - ${event.competitors[1]?.score}`}
                    </span>
                  </td>
                  <td className="cell-location">
                    <div className="venue-city">{event.venue_name}, {event.city}</div>
                  </td>
                  <td className="cell-status">
                    <span className={`status-badge status-${event.status.toLowerCase()}`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default App;
