import { type FlightInstance, type SeatLayout, } from '../api/types';
import { useEffect, useState } from 'react';
import { api, enqueueToActiveSession } from '../api/api';

interface Props {
    flight: FlightInstance;
}

interface BookResult {
  seatNumber: string;
  ok: boolean;
  message: string;
}

export default function SeastMap({ flight }: Props) {
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
        setLatestResult(null);

        const [layoutResult, bookingResult] = await Promise.all([
            api.getSeatLayout(flight.flightNumber),
            api.getFlightBookings(flight.flightId)
        ]);

        setLoading(false);

        if (!layoutResult.ok || !bookingResult.ok) {
            setError('Failed to load seat layout');
            return;
        }

        setSeats((layoutResult.data ?? []).sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber)));
        setBookedSeats(new Set((bookingResult.data ?? []).map((b) => b.seatNumber)));
    }


    useEffect(() => {
        load();
        setUserId(crypto.randomUUID());
    }, [flight]);

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
            await load();
        } else {
            setLatestResult({
                seatNumber: seatNumber,
                ok: false,
                message: `Failed booking ${result.data?.bookingId ?? '?'}`
            })
        }
    };

    return (
        <section>
            <div>
                <h2>Seat Map - {flight.flightNumber} ({flight.departureTime})</h2>
                <button onClick={load} disabled={loading}>
                    { loading? 'Loading…' : 'Refresh' }
                </button>
            </div>
            { error && <p> {error} </p> }
            { !error && seats.length === 0 && !loading && <p> No seats defined for this flight. </p> }
            { pendingPhase && <p> {pendingPhase} </p> }
            { latestResult && <p> Seat {latestResult.seatNumber}: {latestResult.message} </p> } 
            <div>
                {seats.map((seat) => {
                    const booked = bookedSeats.has(seat.seatNumber);
                    const pending = pendingSeats.includes(seat.seatNumber);
                    return (
                        <button
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