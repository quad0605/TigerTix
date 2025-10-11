// src/coponents/Message.js
import React from "react";

export default function Message({ message }) {
	if (!message) return null;

	return (
		<div className="alert" role="alert" aria-live="assertive">
		{message}
		</div>

	);
}
