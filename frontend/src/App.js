// src/App.js
import React, { useEffect, useState } from "react";
import EventList from "./components/EventList";
import Message from "./components/Message";
import LLMPanel from "./components/llmPanel";
import LoginPopUp from "./components/login";
import LogoutButton from "./components/logout";

/**
 * Main application component for TigerTix.
 * Handles fetching event data and managing ticket purchases.
 *
 * @component
 * @returns {JSX.Element} The rendered TigerTix application interface.
 */
export default function App() {

  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [showPopUp, setShowPopUp] = useState(true);

  /**
   * List of all events fetched from the backend.
   * @type {Array<Object>}
   */
  const [events, setEvents] = useState([]);

  /**
   * Temporary user message (In this state only purchase confirmation).
   * @type {string}
   */
  const [message, setMessage] = useState("");

  const [chatMessages, setChatMessages] = useState([]);
  // Fetch events on initial mount
  useEffect(() => {
    fetch("https://tigertix-user-auth.up.railway.app/api/client/events")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch((e) => console.error("GET /api/events failed", e));
  }, []);

  const toggleTTS = () => {
    setSpeechEnabled(prev => !prev);
    if (speechEnabled) {
      window.speechSynthesis.cancel(); // stop speech immediately
    }
  };
  function speakMessage(message) {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech Synthesis not supported in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1;   // Speed (0.1 - 10)
    utterance.pitch = 1;  // Pitch (0 - 2)
    utterance.volume = 1; // Volume (0 - 1)

    // Optional: cancel any previous speech
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
  /**
 * Sends a POST request to purchase a ticket for a specific event.
 * Updates the local event list and shows a confirmation message.
 *
 * @async
 * @function buy
 * @param {number|string} id - The unique ID of the event being purchased.
 * @returns {Promise<void>} Resolves when the purchase and UI update complete.
 */
  async function buy(id) {
    try {
      const res = await fetch(`https://tigertix-user-auth.up.railway.app/api/client/events/${id}/purchase`, {
        method: "POST",
        credentials: "include" // sends the cookie automatically
      });
      if (!res.ok) throw new Error("purchase failed");

      const { event, message: serverMessage } = await res.json();
      setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));

      const confirmation =
        serverMessage || `Successfully purchased a ticket for "${event.name}"!`;
      setMessage(confirmation);
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("Purchase request failed:", err);
    }
  }
  async function sendMessage(text) {
    if (text !== "") {
      const newMessage = {
        text,
        time: new Date().toLocaleTimeString(),
        id: chatMessages.length + 1,
        user: true
      };
      setChatMessages((prevMessages) => [...prevMessages, newMessage]);

      // This is kindof a simple work around since it doesn't "remember" I'm just resending the entire chat
      const fullConversation = [...chatMessages, newMessage]
        .map(msg => `${msg.user ? 'User' : 'Bot'}: ${msg.text}`)
        .join('\n');

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: fullConversation,
        })
      };
      try {
        const res = await fetch(`https://tigertix-user-auth.up.railway.app/api/llm/chat`, requestOptions);
        if (!res.ok) throw new Error("Message failed to send");
        const data = await res.json();
        const newResponse = {
          text: data.reply,
          time: new Date().toLocaleTimeString(),
          id: chatMessages.length + 1,
          user: false
        };

        if (speechEnabled === true) {
          speakMessage(newResponse.text);
        }
        setChatMessages((prevMessages) => [...prevMessages, newResponse]);
      } catch (err) {

        console.error("Message failed to send", err);
      }
    }

  }

  const [ loginEmail, setLoginEmail]=useState("");
  async function sendLogin(email, password) {


    try {
      const res = await fetch(`https://tigertix-user-auth.up.railway.app/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include" // important!
        });
      console.log(res);
      if (!res.ok) throw new Error("Message failed to send");
      if (res.ok) {
        setShowPopUp(false);
        setLoginEmail(email);
      }

    } catch (err) {
      console.error("Message failed to send", err);
    }

  }

  async function sendSignUp(name, email, password) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password,
        name: name,
      })
    };

    try {
      const res = await fetch(`https://tigertix-user-auth.up.railway.app/api/auth/register`, requestOptions);
      console.log(res);
      if (!res.ok) throw new Error("Message failed to send");
      
    } catch (err) {
      console.error("Message failed to send", err);
    }


  }


  //Render the main app interface
  return (
    <main
      role="main"
      aria-label="Event ticket purchasing system"
    >
      <LoginPopUp showPopUp={showPopUp} onSubmitLogin={sendLogin} onSubmitSignUp={sendSignUp} />
      <header>
        <h1
          tabIndex="0"
        >TigerTix</h1>
      </header>

      {loginEmail!=="" &&
        <LogoutButton emailLoggedIn={loginEmail} renableLogin={() => {
          setShowPopUp(true);
          setLoginEmail("");}} />
      }
      <Message message={message} />
      <EventList events={events} onBuy={buy} />

      <LLMPanel chatMessages={chatMessages} onSend={sendMessage} toggleTTS={toggleTTS} speechEnabled={speechEnabled} />

    </main>
  );
}

