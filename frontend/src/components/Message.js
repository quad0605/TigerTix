// src/coponents/Message.js
import React from "react";
import PropTypes from "prop-types";
/**
 * Message component
 *
 * Displays a message in an alert box if a message is provided.
 * If no message is provided, renders nothing (null).
 *
 * @component
 * @param {{ message: string }} props - The message to display.
 * @returns {JSX.Element|null} - An alert box with the message or null if no message.
 */
export default function Message({ message }) {
  if (!message) return null;
  return (
    <div className="alert" role="alert" aria-live="assertive">
    {message}
    </div>
  );
}

Message.propTypes = {
  message: PropTypes.string,
};