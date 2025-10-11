// src/App.js
import React, { useEffect, useState } from "react";
import EventList from "./components/EventList";
import Message from "./components/Message";

export default function App() {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch((e) => console.error("GET /api/events failed", e));
  }, []);

  async function buy(id) {
    try {
      const res = await fetch(`/api/events/${id}/purchase`, { method: "POST" });
      if (!res.ok) throw new Error("purchase failed");

      const { event, message: serverMessage } = await res.json();
      setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));

      const confirmation =
        serverMessage || `Successfully purchased a ticket for "${event.name}"!`;
      setMessage(confirmation);
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("Purchase request failed:", err);
    }
  }

  return (
    <main
      role="main"
      aria-label="Event ticket purchasing system"
    >
      <header>
        <h1
          tabIndex="0"
        >TigerTix</h1>
      </header>

      <Message message={message} />
      <EventList events={events} onBuy={buy} />
    </main>
  );
}

