
import React from "react";
import PropTypes from "prop-types";

/**
 * ChatMessageItem component
 *
 * Renders a single chat message, styled differently depending on whether it's from the user or the assistant.
 * @component
 * @param {{ chatMessage: chatMessageShape }} props - The chat message object to display.
 * @returns {JSX.Element} A div element representing a single chat message.
 */
export default function ChatMessageItem({chatMessage}) {
  return (
    <div className={chatMessage.user?"msg msg-me":"msg msg-other"}>
      {chatMessage.text}
      <span className="meta">{chatMessage.time}</span>
    </div>
      
    );


}
/**
 * Defines the prop types for a single chat message object.
 * This shape is used for validating chat message props in components.
 * @typedef {Object} chatMessageShape
 * @property {number} id - The unique identifier for the message.
 * @property {string} text - The content of the message.
 * @property {string} time - The timestamp of when the message was sent.
 * @property {boolean} user - True if the message is from the user, false otherwise.
 */
export const chatMessageShape=PropTypes.shape({
  id: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  user: PropTypes.bool.isRequired,
});

ChatMessageItem.propTypes = {
  chatMessage: chatMessageShape.isRequired,
};
