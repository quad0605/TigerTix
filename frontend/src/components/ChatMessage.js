
import React from "react";
import PropTypes from "prop-types";


export default function ChatMessageItem({chatMessage}) {
  return (
    <div className={chatMessage.user?"msg msg-me":"msg msg-other"}>
      {chatMessage.text}
      <span className="meta">{chatMessage.time}</span>
    </div>
      
    );


}
/**
 * @typedef {Object} MessageShape
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
