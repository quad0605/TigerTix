// src/components/EventItem.js
import React from "react";
import PropTypes from "prop-types";

/**
 * EventItem component which represents a single event in the event list.
 * 
 * @component
 * @param {object} props The component props.
 * @param {EventShape} props.event The event object to display.
 * @param {(id: number) => void} props.onBuy The function to call when the buy button is clicked.
 * @returns {JSX.Element} An event card for a single event, including a button to purchase a ticket.
 */
export default function EventItem({ event, onBuy }) {
  const isSoldOut = event.tickets_sold === event.tickets_total;
  return (
    <li className="event-card" tabIndex="0">
      <h3>
        {event.name}
      </h3>

      <p>
        <time dateTime={new Date(event.date).toISOString()}>
          {new Date(event.date).toLocaleString()}
        </time>
      </p>

      <p>
        <strong>Tickets available:</strong> {event.tickets_total - event.tickets_sold}
      </p>
      <button
        className="buy"
        onClick={() => onBuy(event.id)}
        disabled={isSoldOut}
      >

        {isSoldOut ? "Sold Out" : `Buy Ticket for ${event.name}`}
      </button>
    </li>
  );
}

/**
 * Defines the prop types for a single event object.
 * This shape is used for validating event props in components.
 * @typedef {Object} EventShape
 * @property {number} id - The unique identifier for the event.
 * @property {string} name - The name of the event.
 * @property {string} date - The date and time of the event as an ISO string.
 * @property {number} tickets_total - The total number of tickets available for the event.
 * @property {number} tickets_sold - The number of tickets that have been sold.
 */
export const eventShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  tickets_total: PropTypes.number.isRequired,
  tickets_sold: PropTypes.number.isRequired,
});

EventItem.propTypes = {
  event: eventShape.isRequired,
  onBuy: PropTypes.func.isRequired,
};