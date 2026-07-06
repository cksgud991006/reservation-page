import './App.css';
import { useState } from 'react';
import type { FlightInstance } from './api/types'; 
import Settings from './components/Settings';
import FlightList from './components/FlightList';
import SeatMap from './components/SeatMap';
import ConcurrencyDemo from './components/ConcurrencyDemo';
import QueuePanel from './components/QueuePanel';

export default function App() {

  // Signal for base api url change 
  const [reloadToken, setReloadToken] = useState<string>('');
  const [selectedFlight, setSelectedFlight] = useState<FlightInstance | null>(null);

  return (
    <div>
      <header>
        <h1>Reservation API</h1>
        <p className="hint">
          A dashboard for the{' '}
            <a href="https://github.com/cksgud991006/reservation-page">
              Reservation Server
            </a>
          , a high-concurrency seat reservation API backed by PostgreSQL + Redis.
        </p>
      </header>

      <Settings onSaved={setReloadToken}/>

      <FlightList 
        reloadToken={reloadToken}
        selectedFlight={selectedFlight}
        onSelect={setSelectedFlight}
      />

      {selectedFlight && <SeatMap reloadToken={reloadToken} flight={selectedFlight}/>}

      <ConcurrencyDemo 
        defaultFlightId={selectedFlight?.flightId ?? ''}
        onFire={setReloadToken}/>

      <QueuePanel />

    </div>
  );
}