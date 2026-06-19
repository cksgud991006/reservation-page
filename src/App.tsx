import './App.css';
import { useEffect, useState } from 'react';
import SelectionStep from './components/Steps/SelectionStep';
import CompleteStep from './components/Steps/CompleteStep';
import LoadingStep from './components/Steps/LoadingStep';
import StartStep from './components/Steps/StartStep';
import FailureStep from './components/Steps/FailureStep';
import { postData, getData } from './services/api';
import { type StepType, START_STEP } from '../constants/page';
import { type FlightInstance, type FlightBookingResponse, type SeatInfo } from './services/types';

const MAX_SELECTIONS = 5;

// Helper function to sort seats naturally
const sortSeats = (seats: SeatInfo[]): SeatInfo[] => {
  return [...seats].sort((a, b) =>
    a.seatNumber.localeCompare(b.seatNumber, undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  );
};

export default function App() {
  // Session/Navigation State
  const [guid, setGuid] = useState('');
  const [step, setStep] = useState<StepType>(START_STEP);

  // Flight & Selection State
  const [flightNumber, setFlightNumber] = useState('');
  const [flightId, setFlightId] = useState('');
  const [seats, setSeats] = useState<SeatInfo[]>([]);
  const [flightInstances, setFlightInstances] = useState<FlightInstance[]>([]);
  const [reservedSeats, setReservedSeats] = useState<SeatInfo[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SeatInfo[]>([]);

  // Initialize GUID on mount
  useEffect(() => {
    setGuid(crypto.randomUUID());
  }, []);

  // Reset selected seats when returning to START
  useEffect(() => {
    if (step === 'START') {
      setSelectedSeats([]);
    }
  }, [step]);

  const handleStartComplete = (selectedFlightNumber: string, selectedFlightId: string) => {
    setFlightNumber(selectedFlightNumber);
    setFlightId(selectedFlightId);

    postData("queue", {
      UserId: guid,
      RequestTime: new Date().toISOString(),
      IdempotencyKey: guid,
    })
      .then(() => setStep('LOADING'))
      .catch(() => setStep('FAILURE'));
  };

  const handleLoadingComplete = async () => {
    try {
      // Fetch layout and bookings in parallel
      const [seatsResponse, bookingsResponse] = await Promise.all([
        getData<SeatInfo[]>("api/seatLayout/{flightNumber}", { flightNumber }),
        getData<FlightBookingResponse[]>("api/flightBooking/{flightId}", { flightId }),
      ]);

      const sortedSeats = sortSeats(seatsResponse);
      setSeats(sortedSeats);

      // Match reserved seats using the newly fetched seats array
      const matchedReservedSeats = sortedSeats.filter(seat =>
        bookingsResponse.some(booking => booking.seatNumber === seat.seatNumber)
      );
      setReservedSeats(matchedReservedSeats);

      setStep('SELECTION');
    } catch (error) {
      setStep('FAILURE');
    }
  };

  const handleLoadingFailure = () => {
    setStep('FAILURE');
  };

  const handleSelectionComplete = async () => {
    const seatRequests = selectedSeats.map((seat) =>
      postData("seat", {
        FlightId: flightId,
        SeatNumber: seat.seatNumber,
        UserId: guid,
      })
    );

    try {
      await Promise.all(seatRequests);
      setStep('COMPLETE');
    } catch (error) {
      setStep('FAILURE');
    }
  };

  const handleSeatToggle = (seat: SeatInfo) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seat)) {
        return prev.filter((s) => s !== seat);
      }
      if (prev.length < MAX_SELECTIONS) {
        return [...prev, seat];
      }
      return prev;
    });
  };

  const resetToStart = () => setStep('START');

  return (
    <div style={{ padding: '20px' }}>
      {step === 'START' && (
        <StartStep
          flightInstances={flightInstances}
          setFlightInstances={setFlightInstances}
          onComplete={handleStartComplete}
        />
      )}

      {step === 'LOADING' && (
        <LoadingStep
          guid={guid}
          onComplete={handleLoadingComplete}
          onFailure={handleLoadingFailure}
        />
      )}

      {step === 'SELECTION' && (
        <SelectionStep
          seats={seats}
          reservedSeats={reservedSeats}
          selectedSeats={selectedSeats}
          maxSelections={MAX_SELECTIONS}
          onSeatToggle={handleSeatToggle}
          onComplete={handleSelectionComplete}
          onCancel={resetToStart}
        />
      )}

      {step === 'COMPLETE' && <CompleteStep onReload={resetToStart} />}

      {step === 'FAILURE' && <FailureStep onRetry={resetToStart} />}
    </div>
  );
}