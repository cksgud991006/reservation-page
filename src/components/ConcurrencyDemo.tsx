import { useEffect, useState } from "react";
import { api, enqueueToActiveSession, getApiBaseUrl } from "../api/api";

interface Props {
    defaultFlightId: string;
    onFire: (url: string) => void;
}

interface RunSummary {
  total: number;
  successCount: number;
  failureCount: number;
  durationMs: number;
  details: { message: string, count: number }[];
}

export default function ConcurrencyDemo({ defaultFlightId, onFire }: Props) {
    const [flightId, setFlightId] = useState<string>(defaultFlightId);
    const [seatNumber, setSeatNumber] = useState<string>('');
    const [concurrency, setConcurrency] = useState<number>(20);
    const [running, setRunning] = useState<boolean>(false);
    const [phase, setPhase] = useState<string | null>(null);
    const [summary, setSummary] = useState<RunSummary | null>(null);

    const run = async () => {
        setRunning(true);

        const userId = crypto.randomUUID();

        setPhase(`Enqueuing user to the active queue…`);

        const enqueued = await enqueueToActiveSession(userId, new Date().toISOString(), crypto.randomUUID(),
        (waitedMs) => setPhase(`Waiting for queue admission… (${Math.round(waitedMs / 1000)}s)`));

        if (!enqueued.success) {
            setRunning(false);
            setPhase(null);
            setSummary({
                total: 0,
                successCount: 0,
                failureCount: 0,
                durationMs: 0,
                details: [{
                    message: 'Timed out waiting for queue admission.',
                    count: 1
                }]
            });
            return;
        }

        setPhase(`Firing ${concurrency} simultaneous booking requests…`);
        const start = performance.now();
        const booked = await Promise.all(Array.from({ length: concurrency }, () => api.reserveSeat(flightId, seatNumber, userId)));
        const durationMs = performance.now() - start;

        const successCount = booked.filter((b) => b.ok).length;
        const failureCount = booked.length - successCount;

        const details = new Map<string, number>();
        for (const b of booked) {
            var message = b.data?.details ?? 'Server did not respond';
            var size = details.get(message);
            details.set(message, (size ?? 0) + 1);
        }
        
        onFire(getApiBaseUrl());
        setSummary({
            total: booked.length,
            successCount: successCount,
            failureCount: failureCount,
            durationMs: durationMs,
            details: Array.from(details).map(([message, count]) => ({
                message: message,
                count: count
            }))
        });
        setPhase(null);
        setRunning(false);
    }

    useEffect(() => {
        setFlightId(defaultFlightId);
    }, [defaultFlightId])

 
    return (
        <section className="panel">
            <h2> Concurrency Demo </h2>
            <p className="hint"> Fires N booking requests at the same seat simultaneously to demonstrate that Redis + Lua locking allows exactly one to win, regardless of how many arrive at once. </p>
            <div className="row">
                <label>
                    Flight ID
                    <input value={flightId} onChange={(e) => setFlightId(e.target.value)} placeholder={`e.g.${defaultFlightId}`}/>
                </label>
                <label>
                    Seat #
                    <input value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} placeholder={`e.g.1A`}/>
                </label>
                <label>
                    Concurrent requests
                    <input type="number" min={2} max={500} value={concurrency} onChange={(e) => setConcurrency(Number(e.target.value))}/>
                </label>
                <button onClick={run} disabled={running || !flightId || !seatNumber}>
                    {running ? 'Running…' : 'Fire'}
                </button>
            </div>
            {phase && <p className="hint"> {phase} </p>}
            {summary && 
                <div>
                    <p>  
                        <strong> {summary.successCount} </strong> 
                            succeeded, 
                        <strong> {summary.failureCount} </strong>
                            failed out of {summary.total} requests, in {summary.durationMs} ms. 
                    </p>
                    {summary!.details.length > 0 && (
                        <ul>
                            {summary!.details.map((s, i) => (
                                <li key={i}>
                                    {s.count}x - {s.message}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            }
        </section>
    );
}