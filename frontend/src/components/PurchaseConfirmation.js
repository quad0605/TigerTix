// PurchaseConfirmation Component - Show purchase success and details
import React from 'react';

const PurchaseConfirmation = ({ purchaseData, onBackToEvents }) => {
    if (!purchaseData) return null;

    return (
        <div className="purchase-confirmation">
            <div className="success-message">
                <h2>🎉 Purchase Successful!</h2>
                <p>Thank you for your purchase. Your tickets have been confirmed.</p>
            </div>

            <div className="confirmation-details">
                <h3>Order Details</h3>
                <div className="detail-item">
                    <strong>Customer ID:</strong> {purchaseData.customerId}
                </div>
                <div className="detail-item">
                    <strong>Order IDs:</strong> {purchaseData.orderIds?.join(', ')}
                </div>
                <div className="detail-item">
                    <strong>Ticket IDs:</strong> {purchaseData.ticketIds?.join(', ')}
                </div>
                <div className="detail-item">
                    <strong>Total Amount:</strong> ${purchaseData.totalAmount}
                </div>
            </div>

            <div className="next-steps">
                <h3>Next Steps</h3>
                <ul>
                    <li>You will receive a confirmation email shortly</li>
                    <li>Please bring a valid ID to the event</li>
                    <li>Arrive at least 30 minutes before the event starts</li>
                </ul>
            </div>

            <button 
                className="back-to-events-button"
                onClick={onBackToEvents}
            >
                Browse More Events
            </button>
        </div>
    );
};

export default PurchaseConfirmation;