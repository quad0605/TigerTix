// src/App.js
import React, { useEffect, useState } from "react";

export default function App() {
  const [events, setEvents] = useState([]);

  // Load events from client-service on mount
  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch((e) => console.error("GET /api/events failed", e));
  }, []);

  // Buy one ticket, then update the row in place
  async function buy(id) {
    const res = await fetch(`/api/events/${id}/purchase`, { method: "POST" });
    if (!res.ok) {
      console.error("purchase failed", res.status);
      return;
    }
    const { event } = await res.json(); // controller returns { message, event }
    setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));
  }

  return (
    <div>
      <h1>TigerTix</h1>
      {events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ul>
          {events.map((e) => (
            <li key={e.id}>
              {e.name} — {new Date(e.date).toLocaleString()} — available: {e.tickets_available}
              <button
                onClick={() => buy(e.id)}
                disabled={e.tickets_available <= 0}
                style={{ marginLeft: 8 }}
              >
                {e.tickets_available <= 0 ? "Sold Out" : "Buy Ticket"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
