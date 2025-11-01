import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
/**
 * VoiceInput component
 * - Plays a beep
 * - Captures speech from the user's microphone
 * - Converts it to text via the Web Speech API
 * - Displays recognized text before sending it onward
 *
 * @param {Object} props
 * @param {(text: string) => void} props.onRecognized 
 */
export default function VoiceInput({ onRecognized }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Beep sound before recording starts
  const playBeep = () => {
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    setListening(true);
    onRecognized("");
    playBeep();

    recognition.start();

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      onRecognized(text);
    };

    recognition.onend = () => {
      setListening(false);
      
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setListening(false);
    };
  };

  return (
    <div className="voice-input">
      <button
        onClick={startListening}
        disabled={listening}
        aria-label="Start voice input"
        className="mic-button"
      >
        {listening ? "Listening..." : "Speak"}
      </button>

 
    </div>
  );
}

VoiceInput.propTypes = {
  onRecognized: PropTypes.func.isRequired,
};