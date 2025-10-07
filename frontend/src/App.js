
import React, { useState } from 'react';
import './App.css';
import EventList from './components/EventList';
import TicketSelection from './components/TicketSelection';
import PurchaseConfirmation from './components/PurchaseConfirmation';

function App() {
  const [currentView, setCurrentView] = useState('events'); // 'events', 'tickets', 'confirmation'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setCurrentView('tickets');
  };

  const handleBackToEvents = () => {
    setCurrentView('events');
    setSelectedEvent(null);
    setPurchaseData(null);
  };

  const handlePurchaseComplete = (data) => {
    setPurchaseData(data);
    setCurrentView('confirmation');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🐅 TigerTix - Princeton Event Tickets</h1>
        <p>Your gateway to Princeton University events</p>
      </header>

      <main className="app-content">
        {currentView === 'events' && (
          <EventList onEventSelect={handleEventSelect} />
        )}
        
        {currentView === 'tickets' && (
          <TicketSelection 
            event={selectedEvent}
            onBack={handleBackToEvents}
            onPurchaseComplete={handlePurchaseComplete}
          />
        )}
        
        {currentView === 'confirmation' && (
          <PurchaseConfirmation 
            purchaseData={purchaseData}
            onBackToEvents={handleBackToEvents}
          />
        )}
      </main>
    </div>
  );
}

export default App;