// src/components/EventItem.js
import React from "react";

export default function EventItem({ event, onBuy }) {
  const isSoldOut = event.tickets_sold == event.tickets_total;

  return (
    <li className="event-card" tabIndex="0">
      <h3
        style={{
          fontSize: "1.2rem",
          marginBottom: "0.25rem",
          color: "#111827",
        }}
      >
        {event.name}
      </h3>

      <p style={{ margin: "0.25rem 0", color: "#374151" }}>
        <time dateTime={new Date(event.date).toISOString()}>
          {new Date(event.date).toLocaleString()}
        </time>
      </p>

      <p style={{ margin: "0.25rem 0 1rem" }}>
        <strong>Tickets available:</strong> {event.tickets_total-event.tickets_sold}
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

