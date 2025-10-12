// src/coponents/EventList.js
import React from "react";
import EventItem, { eventShape } from "./EventItem";
import PropTypes from "prop-types";

/**
 * EventList component
 *
 * Renders a list of EventItem components or a message
 * when no events are available. Each EventItem displays event
 * details and includes a button to purchase tickets.
 * @component
 * @param {{ 
 *   events: { id: number, name: string, date: string, tickets_total: number, tickets_sold: number }[], 
 *   onBuy: (id: number) => void 
 * }} props - Includes a list of events(which is an array of eventShape) and a function(onBuy) to call when buying a ticket.
 * @returns {JSX.Element} - Either a list of EventItem, or the message "No events available yet".
 */
export default function EventList({ events, onBuy }) {
  if (!events || events.length === 0) {
    return (
      <p
        role="status"
        aria-live="polite"
      >
        No events available yet.
      </p>
    );
  }

  return (
    <ul className="event-list" aria-label="List of events">
      {events.map((event) => (
        <EventItem key={event.id} event={event} onBuy={onBuy} />
      ))}
    </ul>
  );



}

EventList.propTypes = {
  events: PropTypes.arrayOf(eventShape).isRequired, 
  onBuy: PropTypes.func.isRequired,
};