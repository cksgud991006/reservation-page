import { useEffect } from "react";
import { getData } from "../../services/api";
import type { FlightInstance } from "../../services/types";
import { formatFlightName } from "../../core/format";

interface StartStepProps {
    flightInstances: FlightInstance[];
    setFlightInstances: (flightInstance: FlightInstance[]) => void;
    onComplete: (flightNumber: string, flightId: string) => void;
}

function StartStep({ flightInstances, setFlightInstances, onComplete }: StartStepProps) {

    useEffect(() => {
        // Fetch the available flight instances exactly once when the component mounts
        const fetchFlights = async () => {
            try {
                const response = await getData<FlightInstance[]>("api/flightInstances");
                setFlightInstances(response);
            } catch (error) {
                console.error("Failed to fetch flight instances", error);
            }
        };

        fetchFlights();
    }, [setFlightInstances]); // Empty or only dependent on stable dispatch/setter

    return (
        <div>
          <h2>Find a Seat</h2>
          <p>Available Flight Numbers: </p>
          <div className="button-flex-row">
            {flightInstances.map(instance => (
                <button 
                    key={instance.flightId} 
                    onClick={() => onComplete(instance.flightNumber, instance.flightId)}
                >
                    {formatFlightName(instance.flightNumber, instance.departureTime)}
                </button>
            ))}
           </div>
        </div>
    );
}

export default StartStep;