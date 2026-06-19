import { useEffect, useState } from "react";
import { getData } from "../../services/api";
import type { TicketWaitResponse } from "../../services/types";

interface LoadingStepProps {
    guid: string;
    onComplete: () => void;
    onFailure: () => void;
}

function LoadingStep({ guid, onComplete, onFailure }: LoadingStepProps) {

    const [position, setPosition] = useState<number>(0);
    const [dots, setDots] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            try {
                getData<TicketWaitResponse>("queue/status/{id}", { id: guid }).then((response) => {
                    if (response.position < 0) {
                        onComplete();
                        clearInterval(intervalId);
                    }

                    else {
                        setPosition(response.position);
                    }
                });

            } catch (error) {
                onFailure();
                clearInterval(intervalId);
            }
        }, 1000); // Poll every 1s
    }, [guid]);

    useEffect(() => {
        const dotIntervalId = setInterval(() => {
            setDots((prev) => (prev + 1) % 4); // Cycle through 0, 1, 2, 3
        }, 500);
        return () => clearInterval(dotIntervalId);
    }, []);

    return (
        <div>
          <h2>Processing...</h2>
          <p>Our server is currently "sleeping" to save costs. It takes up to 20-30 seconds to wake up.</p>
          <p>Thanks for your patience while we get things running{'.'.repeat(dots)}</p>
          {
            position > 0 && <p>Your current position in the queue: {position}</p>
          }
        </div>
    );
}

export default LoadingStep;