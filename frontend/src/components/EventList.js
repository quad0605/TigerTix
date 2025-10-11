// src/coponents/EventList.js
import React from "react";
import EventItem from "./EventItem";

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
