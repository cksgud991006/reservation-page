import { useEffect, useState } from "react"
import { api } from "../api/api"
import type { FlightInstance } from "../api/types";

interface Props {
    reloadToken: string;
    selectedFlight: FlightInstance | null;
    onSelect: (flight: FlightInstance) => void;
}

export function FlightList({ reloadToken, selectedFlight, onSelect }: Props) {

    const [flights, setFlights] = useState<FlightInstance[]>([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        
    }

    useEffect(() => {
        load();
    }, [reloadToken]);


    return (
        <section>
            <h2> Flights </h2>
            <button>  </button>
        </section>
    )
}