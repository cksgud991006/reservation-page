import SeatGrid from "../SeatGrid/SeatGrid";
import { type SeatInfo } from "../../api/types";

interface SelectionStepProps {
    seats: SeatInfo[];
    reservedSeats: SeatInfo[];
    selectedSeats: SeatInfo[];
    maxSelections?: number;
    onComplete: () => void;
    onCancel: () => void;
    onSeatToggle: (seatInfo: SeatInfo) => void;
}

function SelectionStep({ seats, reservedSeats, selectedSeats, maxSelections,onComplete, onCancel, onSeatToggle }: SelectionStepProps) {
    return (
        <div style={{ textAlign: 'center'}}>
          <p> Select up to {maxSelections} seats for your flight.</p>
          <SeatGrid seats={seats} reservedSeats={reservedSeats} selectedSeats={selectedSeats} onSeatToggle={onSeatToggle} />
          <div className="button-flex-row">
            <button onClick={onComplete} style={{ marginTop: '20px' }}>Complete</button>
            <button onClick={onCancel} style={{ marginTop: '20px' }}>Cancel</button>
          </div>
        </div>
    );
}

export default SelectionStep;