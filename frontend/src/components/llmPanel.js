
import React, { useState } from "react";
import PropTypes from "prop-types";
import MessageList from "./ChatMessageList";
import {chatMessageShape} from "./ChatMessage";
import VoiceInput from "./VoiceInput";

/**
  TO ADD
*/
export default function LLMPanel({chatMessages, onSend}) {
  const [isVisible, setIsVisible] = useState(true);
  const [text, setText] = useState("");
  
  function handleClick(){
    onSend(text);
    setText("");
  }
  function handleKeyDown(e){
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); 
      handleClick();
    }
  }
  return(

    

  <aside className={isVisible?'chat-panel':"chat-panel-hidden"} aria-label="Chat panel" id="chatPanel">
    <div className="chat-header">
      <div>
        <div className="chat-title">Chat</div>
        <div className="chat-sub" id="statusText">Chat with our assistant</div>
      </div>

      <div className="controls" role="toolbar" aria-label="Chat controls">
        <button className="icon-btn" title="Minimize" id="minimizeBtn" aria-pressed="false" aria-label="Minimize chat" onClick={()=>setIsVisible(!isVisible)}>—</button>
        <button className="icon-btn" id="closeBtn" title="Close" aria-label="Close chat">✕</button>
      </div>
    </div>

    <main className="chat-body" id="chatBody" role="log" aria-live="polite" aria-relevant="additions">
      <MessageList chatMessages={chatMessages}/>

      <div className="chat-body-end" id="chatBodyEnd"></div>
    </main>

    <form className="chat-input" id="chatForm" aria-label="Send a message">
      <div className="input-wrap" role="group" aria-label="Message input">
        <textarea value={text} onKeyDown={handleKeyDown} onChange={(e)=> setText(e.target.value)} className="message-input"  rows="1"
                  placeholder="Type a message (Enter to send, Shift+Enter for newline)" aria-label="Message text"></textarea>
      </div>
      <VoiceInput onRecognized={(text)=>setText(text)}/>
      <button type="button" className="send-btn" id="sendBtn" onClick={()=>handleClick()}>Send</button>
    </form>
    
  </aside>
  );

}

LLMPanel.propTypes = {
  chatMessages: PropTypes.arrayOf(chatMessageShape).isRequired, 
  onSend: PropTypes.func.isRequired,
};