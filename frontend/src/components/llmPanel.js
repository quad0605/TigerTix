
import React, { useState } from "react";
import PropTypes from "prop-types";
import MessageList from "./ChatMessageList";
import { chatMessageShape } from "./ChatMessage";
import VoiceInput from "./VoiceInput";

/**
 * LLMPanel component
 *
 * Renders a chat interface for interacting with the AI assistant.
 * It includes the message list, text input, voice input, and controls for TTS and visibility.
 * @component
 * @param {{ chatMessages: Array<chatMessageShape>, onSend: (text: string) => void, toggleTTS: () => void, speechEnabled: boolean }} props
 * @returns {JSX.Element} A chat panel component.
 */
export default function LLMPanel({ chatMessages, onSend, toggleTTS, speechEnabled }) {
  const [isVisible, setIsVisible] = useState(true);
  const [text, setText] = useState("");

  function handleClick() {
    onSend(text);
    setText("");
  }
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleClick();
    }
  }
  return (



    <aside className={isVisible ? 'chat-panel' : "chat-panel-hidden"} aria-label="Chat panel" id="chatPanel">
      <div className="chat-header">
        <div>
          <div className="chat-title">Chat</div>
          <div className="chat-sub" id="statusText">Chat with our assistant</div>
        </div>

        <div className="controls" role="toolbar" aria-label="Chat controls">
          <button className="icon-btn" id="Volume" title="Toggle Volume" aria-label="Close chat" onClick={() => toggleTTS()}>
            {speechEnabled ?
              (
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" />
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03z" fill="currentColor" />
                </svg>)
              : (
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" />
                  <line x1="16" y1="8" x2="22" y2="16" stroke="currentColor" strokeWidth="2" />
                  <line x1="16" y1="16" x2="22" y2="8" stroke="currentColor" strokeWidth="2" />
                </svg>)
            }</button>
          <button className="icon-btn" title="Minimize" id="minimizeBtn" aria-pressed="false" aria-label="Minimize chat" onClick={() => setIsVisible(!isVisible)}>—</button>
          <button className="icon-btn" id="closeBtn" title="Close" aria-label="Close chat">✕</button>

        </div>
      </div>

      <main className="chat-body" id="chatBody" role="log" aria-live="polite" aria-relevant="additions">
        <MessageList chatMessages={chatMessages} />

        <div className="chat-body-end" id="chatBodyEnd"></div>
      </main>

      <form className="chat-input" id="chatForm" aria-label="Send a message">
        <div className="input-wrap" role="group" aria-label="Message input">
          <textarea value={text} onKeyDown={handleKeyDown} onChange={(e) => setText(e.target.value)} className="message-input" rows="1"
            placeholder="Type a message (Enter to send, Shift+Enter for newline)" aria-label="Message text"></textarea>
        </div>
        <VoiceInput onRecognized={(text) => setText(text)} />
        <button type="button" className="send-btn" id="sendBtn" onClick={() => handleClick()}>Send</button>
      </form>

    </aside>
  );

}

LLMPanel.propTypes = {
  chatMessages: PropTypes.arrayOf(chatMessageShape).isRequired,
  onSend: PropTypes.func.isRequired,
  toggleTTS: PropTypes.func.isRequired,
  speechEnabled: PropTypes.bool.isRequired
};