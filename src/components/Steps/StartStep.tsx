import { useEffect } from "react";
import { getData } from "../../services/api";
import type { FlightInstance } from "../../services/types";
import { formatFlightName } from "../../core/format";

interface StartStepProps {
    flightInstances: FlightInstance[];
    setFlightInstances: (flightInstance: FlightInstance[]) => void;
    onComplete: (flightNumber: string, departureTime: string, flightId: string) => void;
}

function StartStep({ flightInstances, setFlightInstances, onComplete }: StartStepProps) {

    useEffect(() => {
        const intervalId = setInterval(() => {
            try {
                getData<FlightInstance[]>("api/flightInstances").then((response) => {
                    setFlightInstances(response);
                });

            } catch (error) {
                clearInterval(intervalId);
            }
        }); // Poll every 1s
    }, []);

    return (
        <div>
          <h2>Find a Seat</h2>
          <p>Available Flight Numbers: </p>
          <div className="button-flex-row">
            { flightInstances.map(instance => (
                <button key={instance.FlightId} onClick={() => onComplete(instance.FlightNumber, instance.DepartureTime, instance.FlightId)}>
                    {formatFlightName(instance.FlightNumber, instance.DepartureTime)}
                </button>
            ))}
           </div>
        </div>
    );
}

export default StartStep;