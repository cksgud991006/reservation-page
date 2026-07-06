import { type FlightInstance, type SeatLayout, } from '../api/types';
import { useEffect, useState } from 'react';
import { api, enqueueToActiveSession } from '../api/api';

interface Props {
    reloadToken: string;
    flight: FlightInstance;
}

interface BookResult {
  seatNumber: string;
  ok: boolean;
  message: string;
}

export default function SeastMap({ reloadToken, flight }: Props) {
    const [seats, setSeats] = useState<SeatLayout[]>([]);
    const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState<boolean>(false);
    const [userId, setUserId] = useState<string>(crypto.randomUUID());
    const [pendingPhase, setPendingPhase] = useState<string | null>(null);
    const [pendingSeats, setPendingSeats] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [latestResult, setLatestResult] = useState<BookResult | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);

        const [layoutResult, bookingResult] = await Promise.all([
            api.getSeatLayout(flight.flightNumber),
            api.getFlightBookings(flight.flightId)
        ]);

        setLoading(false);

        if (!layoutResult.ok || !bookingResult.ok) {
            setError('Failed to load seat layout');
            return;
        }

        setSeats((layoutResult.data ?? []).sort((a, b) => a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true })));
        setBookedSeats(new Set((bookingResult.data ?? []).map((b) => b.seatNumber)));
    }


    useEffect(() => {
        load();
        setUserId(crypto.randomUUID());
    }, [flight, reloadToken]);

    const bookSeat = async (flightId: string, seatNumber: string, userId: string) => {
        setPendingPhase('Joining queue…');
        setPendingSeats((s) => [...s, seatNumber]);
        const queueResponse = await enqueueToActiveSession(userId, new Date().toISOString(), crypto.randomUUID(),
        (waitedMS: number) => setPendingPhase(`Waiting for queue… (${Math.round(waitedMS / 1000)}s)`));

        if (!queueResponse.success) {
            setPendingSeats(pendingSeats.filter((s) => s !== seatNumber));
            setPendingPhase(null);
            setLatestResult({
                seatNumber: seatNumber,
                ok: false,
                message: 'Timed out waiting for queue admission.'
            });
            return ;
        }

        setPendingPhase('Booking…');
        const result = await api.reserveSeat(flightId, seatNumber, userId);
        setPendingSeats(pendingSeats.filter((s) => s !== seatNumber));
        setPendingPhase(null);

        if (result.ok) {
            setLatestResult({
                seatNumber: seatNumber,
                ok: result.ok,
                message: `Booked as ${userId.slice(0, 8)}… (booking ${result.data?.bookingId ?? '?'})`
            });
            setBookedSeats((prev) => new Set(prev).add(seatNumber));
        } else {
            setLatestResult({
                seatNumber: seatNumber,
                ok: false,
                message: `Failed booking ${result.data?.bookingId ?? '?'}`
            })
        }
    };

    return (
        <section className="panel">
            <div className="panel-header">
                <h2>Seat Map - {flight.flightNumber} ({flight.departureTime})</h2>
                <button onClick={load} disabled={loading}>
                    { loading? 'Loading…' : 'Refresh' }
                </button>
            </div>
            {error && <p className="status-fail">{error}</p>}
            { pendingPhase && <p> {pendingPhase} </p> }
            { latestResult && <p className={latestResult.ok ? 'status-ok' : 'status-fail'}> Seat {latestResult.seatNumber}: {latestResult.message} </p> } 
            <div className="seat-grid">
                {seats.map((seat) => {
                    const booked = bookedSeats.has(seat.seatNumber);
                    const pending = pendingSeats.includes(seat.seatNumber);
                    return (
                        <button
                            className={booked? 'seat seat-booked' : 'seat'}
                            key={seat.seatNumber}
                            disabled={booked || pending}
                            onClick={() => {bookSeat(flight.flightId, seat.seatNumber, userId)}}
                        >
                            { pending? '…' : seat.seatNumber } 
                        </button>
                    );
                })}
            </div>
        </section>
    );
}