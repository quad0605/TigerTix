
// src/components/ChatMessageList.js
import React from "react";
import PropTypes from "prop-types";
import ChatMessage, {chatMessageShape} from "./ChatMessage";

/**
 * MessageList component
 *
 * Renders a list of ChatMessage components.
 * If the list is empty, it displays a "No messages" status.
 * @component
 * @param {{ chatMessages: Array<chatMessageShape> }} props - The list of chat messages to display.
 * @returns {JSX.Element} A list of chat messages or a placeholder paragraph.
 */
export default function MessageList({chatMessages}) {
  if (!chatMessages || chatMessages.length === 0) {
    return (
      <p
        role="status"
        aria-live="polite"
      >
        No messages yet.
      </p>
    );
  }

  return (
    <ul className="message-list" aria-label="List of chatMessages">
      {chatMessages.map((chatMessage) => (
        <ChatMessage key={chatMessage.id} chatMessage={chatMessage}/>
      ))}
    </ul>
  );



}

MessageList.propTypes = {
  chatMessages: PropTypes.arrayOf(chatMessageShape).isRequired, 
};