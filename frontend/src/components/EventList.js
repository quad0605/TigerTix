// EventList Component - Display list of available events
import React, { useState, useEffect } from 'react';

const EventList = ({ onEventSelect }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5002/api/client/events');
            const data = await response.json();
            
            if (data.success) {
                setEvents(data.data);
            } else {
                setError('Failed to load events');
            }
        } catch (error) {
            setError('Error connecting to server');
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="loading">Loading events...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="event-list">
            <h2>Available Events</h2>
            {events.length === 0 ? (
                <p>No events available at this time.</p>
            ) : (
                <div className="events-grid">
                    {events.map(event => (
                        <div key={event.id} className="event-card">
                            <h3>{event.name}</h3>
                            <p className="event-description">{event.description}</p>
                            <div className="event-details">
                                <p><strong>Date:</strong> {formatDate(event.date)}</p>
                                <p><strong>Venue:</strong> {event.venue}</p>
                                <p><strong>Available Tickets:</strong> {event.available_tickets}</p>
                                <p className="price"><strong>Price:</strong> ${event.price}</p>
                            </div>
                            <button 
                                className="select-event-btn"
                                onClick={() => onEventSelect && onEventSelect(event)}
                            >
                                View Tickets
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventList;