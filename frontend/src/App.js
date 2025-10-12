// src/App.js
import React, { useEffect, useState } from "react";
import EventList from "./components/EventList";
import Message from "./components/Message";


/**
 * Main application component for TigerTix.
 * Handles fetching event data and managing ticket purchases.
 *
 * @component
 * @returns {JSX.Element} The rendered TigerTix application interface.
 */
export default function App() {

  /**
   * List of all events fetched from the backend.
   * @type {Array<Object>}
   */
  const [events, setEvents] = useState([]);

  /**
   * Temporary user message (In this state only purchase confirmation).
   * @type {string}
   */
  const [message, setMessage] = useState("");

  // Fetch events on initial mount
  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch((e) => console.error("GET /api/events failed", e));
  }, []);

    /**
   * Sends a POST request to purchase a ticket for a specific event.
   * Updates the local event list and shows a confirmation message.
   *
   * @async
   * @function buy
   * @param {number|string} id - The unique ID of the event being purchased.
   * @returns {Promise<void>} Resolves when the purchase and UI update complete.
   */
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

  //Render the main app interface
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

