
// src/coponents/EventList.js
import React from "react";
import PropTypes from "prop-types";
import ChatMessage, {chatMessageShape} from "./ChatMessage";

/**
  TO ADD
*/
export default function MessageList({chatMessages}) {
  if (!chatMessages || chatMessages.length === 0) {
    return (
      <p
        role="status"
        aria-live="polite"
      >
        No chatMessages available yet.
      </p>
    );
  }

  return (
    <ul className="event-list" aria-label="List of chatMessages">
      {chatMessages.map((chatMessage) => (
        <ChatMessage key={chatMessage.id} chatMessage={chatMessage}/>
      ))}
    </ul>
  );



}

MessageList.propTypes = {
  chatMessages: PropTypes.arrayOf(chatMessageShape).isRequired, 
};