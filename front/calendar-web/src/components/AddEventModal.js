// Modal form for creating a new event and its two competitors.
import React, { useState, useEffect } from 'react';
import { createEvent, fetchSports, fetchTeams, fetchVenues } from '../api';

const AddEventModal = ({ isOpen, onClose, onRefresh }) => {
    const [sports, setSports] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [venues, setVenues] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        match_name: '',
        datetime: '',
        status: 'Scheduled',
        id_sport: '',
        id_venue: 1,
        home_team_id: '',
        away_team_id: '',
        home_score: 0,
        away_score: 0
    });

useEffect(() => {
    if (isOpen) {
        // Load dropdown data when the modal opens.
        setErrorMessage('');
        setFilteredTeams([]);

        fetchSports()
            .then(data => setSports(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error(err);
                setSports([]);
                setErrorMessage('Unable to load sports. Please check the backend connection.');
            });

        fetchVenues()
            .then(data => setVenues(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error(err);
                setVenues([]);
                setErrorMessage('Unable to load venues. Please check the backend connection.');
            });
    }
}, [isOpen]);

    useEffect(() => {
        if (formData.id_sport) {
            // Reload teams whenever the selected sport changes.
            fetchTeams(formData.id_sport)
                .then(data => setFilteredTeams(Array.isArray(data) ? data : []))
                .catch(err => {
                    console.error(err);
                    setFilteredTeams([]);
                    setErrorMessage('Unable to load teams for the selected sport.');
                });
            setFormData(prev => ({ ...prev, home_team_id: '', away_team_id: '' }));
        } else {
            setFilteredTeams([]);
        }
    }, [formData.id_sport]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Prevent an invalid event with the same team on both sides.
        if (formData.home_team_id === formData.away_team_id) {
            setErrorMessage('Home and away teams must be different.');
            return;
        }

        const payload = {
            match_name: formData.match_name,
            datetime: formData.datetime,
            status: formData.status,
            id_sport: parseInt(formData.id_sport),
            id_venue: parseInt(formData.id_venue),
            team_ids: [parseInt(formData.home_team_id), parseInt(formData.away_team_id)],
            home_score: parseInt(formData.home_score) || 0,
            away_score: parseInt(formData.away_score) || 0,
            description: ""
        };

        try {
            await createEvent(payload);
            onRefresh();
            onClose();
        } catch (err) {
            console.error(err);
            setErrorMessage(err.message || 'Unable to create event.');
        }
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-event-title">
            <div className="modal-content-large" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <h2 id="create-event-title" className="gjs-t-h2">Create New Event</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form-body">
                    {errorMessage && (
                        <div style={{ padding: '16px 24px', color: '#b91c1c', backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
                            {errorMessage}
                        </div>
                    )}

                    <div className="form-section dark-section">
                        <label className="form-label-white">SELECT SPORT</label>
                        <select
                            className="form-input-main"
                            required
                            value={formData.id_sport}
                            onChange={e => setFormData({ ...formData, id_sport: e.target.value })}
                        >
                            <option value="">-- Choose Sport --</option>
                            {sports.map(s => <option key={s.id_sport} value={s.id_sport}>{s.sport_name}</option>)}
                        </select>
                    </div>

                    <div className="form-section dark-section">
                        <label className="form-label-white">SELECT VENUE</label>
                        <select
                            className="form-input-main"
                            required
                            value={formData.id_venue}
                            onChange={e => setFormData({ ...formData, id_venue: e.target.value })}
                        >
                            <option value="">-- Choose Venue --</option>
                            {venues.map(v => (
                                <option key={v.id_venue} value={v.id_venue}>
                                    {v.venue_name} ({v.city})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-section">
                        <label className="form-label">EVENT TITLE / MATCH NAME</label>
                        <input
                            type="text"
                            className="form-input-main"
                            placeholder="e.g. Annual Winter Championship"
                            onChange={e => setFormData({ ...formData, match_name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="teams-grid">
                        <div className="team-box home">
                            <span className="team-label">HOME TEAM</span>
                            <select
                                className="form-input"
                                required
                                value={formData.home_team_id}
                                onChange={e => setFormData({ ...formData, home_team_id: e.target.value })}
                                disabled={!formData.id_sport}
                            >
                                <option value="">Select Team</option>
                                {filteredTeams.map(t => <option key={t.id_team} value={t.id_team}>{t.team_name}</option>)}
                            </select>
                            <input type="number" className="form-input mt-2" placeholder="Score" onChange={e => setFormData({ ...formData, home_score: e.target.value })} />
                        </div>

                        <div className="vs-divider">VS</div>

                        <div className="team-box away">
                            <span className="team-label">AWAY TEAM</span>
                            <select
                                className="form-input"
                                required
                                value={formData.away_team_id}
                                onChange={e => setFormData({ ...formData, away_team_id: e.target.value })}
                                disabled={!formData.id_sport}
                            >
                                <option value="">Select Team</option>
                                {filteredTeams.map(t => <option key={t.id_team} value={t.id_team}>{t.team_name}</option>)}
                            </select>
                            <input type="number" className="form-input mt-2" placeholder="Score" onChange={e => setFormData({ ...formData, away_score: e.target.value })} />
                        </div>
                    </div>

                    <div className="details-grid">
                        <div className="form-section">
                            <label className="form-label">DATE & TIME</label>
                            <input type="datetime-local" className="form-input" required onChange={e => setFormData({ ...formData, datetime: e.target.value })} />
                        </div>
                        <div className="form-section">
                            <label className="form-label">STATUS</label>
                            <select className="form-input" onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Live">Live</option>
                                <option value="Finished">Finished</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="gjs-t-button">Create Event</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEventModal;
