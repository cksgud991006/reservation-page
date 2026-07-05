import { useEffect, useState } from "react"
import { api } from "../api/api"
import type { FlightInstance } from "../api/types";

interface Props {
    reloadToken: string;
    selectedFlight: FlightInstance | null;
    onSelect: (flight: FlightInstance) => void;
}

export default function FlightList({ reloadToken, selectedFlight, onSelect }: Props) {
    const [flights, setFlights] = useState<FlightInstance[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        const result = await api.getFlights();
        if (result.ok) {
            setFlights(result.data?? []);
        } else {
            setError('Failed to connect to server');
        }
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, [reloadToken]);


    return (
        <section>
            <div>
                <h2> Flights </h2>
                <button onClick={load} disabled={loading}> 
                    {loading ? 'Loading…' : 'Refresh' }
                </button>
            </div>
            {error && (<p> {error} </p>)}
            {}
            {flights.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th> Flight # </th>
                            <th> Departure </th>
                            <th> Flight ID </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            flights.map((f) => (
                                <tr>
                                    <td> {f.flightId} </td>
                                    <td> {f.departureTime} </td>
                                    <td> {f.flightNumber} </td>
                                    <td>
                                        <button onClick={() => {onSelect(f)}}>
                                            {f.flightId === selectedFlight?.flightId ? 'Selected' : 'Select'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            )}
        </section>
    )
}