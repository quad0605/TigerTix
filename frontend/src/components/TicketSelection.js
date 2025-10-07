// TicketSelection Component - Select and purchase tickets for an event
import React, { useState, useEffect } from 'react';

const TicketSelection = ({ event, onBack, onPurchaseComplete }) => {
    const [tickets, setTickets] = useState([]);
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);

    useEffect(() => {
        if (event) {
            fetchAvailableTickets();
        }
    }, [event]);

    const fetchAvailableTickets = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5002/api/client/events/${event.id}/tickets`);
            const data = await response.json();
            
            if (data.success) {
                setTickets(data.data);
            } else {
                setError('Failed to load available tickets');
            }
        } catch (error) {
            setError('Error connecting to server');
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketSelection = (ticketId) => {
        setSelectedTickets(prev => {
            if (prev.includes(ticketId)) {
                return prev.filter(id => id !== ticketId);
            } else {
                return [...prev, ticketId];
            }
        });
    };

    const handleCustomerInfoChange = (field, value) => {
        setCustomerInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const calculateTotal = () => {
        return selectedTickets.length * event.price;
    };

    const handlePurchase = async () => {
        if (!customerInfo.email || !customerInfo.first_name || !customerInfo.last_name) {
            setError('Please fill in all required customer information');
            return;
        }

        if (selectedTickets.length === 0) {
            setError('Please select at least one ticket');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:5002/api/client/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerInfo,
                    eventId: event.id,
                    ticketIds: selectedTickets,
                    totalAmount: calculateTotal()
                })
            });

            const data = await response.json();

            if (data.success) {
                onPurchaseComplete && onPurchaseComplete(data.data);
            } else {
                setError(data.error || 'Purchase failed');
            }
        } catch (error) {
            setError('Error processing purchase');
            console.error('Error purchasing tickets:', error);
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

    // Group tickets by section
    const ticketsBySection = tickets.reduce((acc, ticket) => {
        const section = ticket.section || 'General';
        if (!acc[section]) {
            acc[section] = [];
        }
        acc[section].push(ticket);
        return acc;
    }, {});

    if (!event) return null;

    return (
        <div className="ticket-selection">
            <button className="back-button" onClick={onBack}>← Back to Events</button>
            
            <div className="event-header">
                <h2>{event.name}</h2>
                <p><strong>Date:</strong> {formatDate(event.date)}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Price per ticket:</strong> ${event.price}</p>
            </div>

            {error && <div className="error">Error: {error}</div>}

            {!showCheckout ? (
                <div className="ticket-selection-section">
                    <h3>Select Your Seats</h3>
                    {loading ? (
                        <div className="loading">Loading tickets...</div>
                    ) : (
                        <div className="tickets-container">
                            {Object.keys(ticketsBySection).map(section => (
                                <div key={section} className="section-group">
                                    <h4>{section} Section</h4>
                                    <div className="tickets-grid">
                                        {ticketsBySection[section].map(ticket => (
                                            <div
                                                key={ticket.id}
                                                className={`ticket ${selectedTickets.includes(ticket.id) ? 'selected' : ''}`}
                                                onClick={() => handleTicketSelection(ticket.id)}
                                            >
                                                {ticket.seat_number || `Ticket ${ticket.id}`}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedTickets.length > 0 && (
                        <div className="selection-summary">
                            <h4>Selected Tickets: {selectedTickets.length}</h4>
                            <p><strong>Total: ${calculateTotal()}</strong></p>
                            <button 
                                className="proceed-button"
                                onClick={() => setShowCheckout(true)}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="checkout-section">
                    <h3>Customer Information</h3>
                    <div className="customer-form">
                        <input
                            type="email"
                            placeholder="Email *"
                            value={customerInfo.email}
                            onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="First Name *"
                            value={customerInfo.first_name}
                            onChange={(e) => handleCustomerInfoChange('first_name', e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Last Name *"
                            value={customerInfo.last_name}
                            onChange={(e) => handleCustomerInfoChange('last_name', e.target.value)}
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Phone (optional)"
                            value={customerInfo.phone}
                            onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                        />
                    </div>

                    <div className="order-summary">
                        <h4>Order Summary</h4>
                        <p>Event: {event.name}</p>
                        <p>Tickets: {selectedTickets.length}</p>
                        <p><strong>Total: ${calculateTotal()}</strong></p>
                    </div>

                    <div className="checkout-actions">
                        <button 
                            className="back-to-selection"
                            onClick={() => setShowCheckout(false)}
                        >
                            ← Back to Selection
                        </button>
                        <button 
                            className="purchase-button"
                            onClick={handlePurchase}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : `Purchase for $${calculateTotal()}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketSelection;