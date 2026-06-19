import { FLIGHT_CLASSES, FLIGHT_STATUS } from "../../../constants/flight";
import type { SeatInfo } from "../../services/types";

interface SeatProps {
    seat: SeatInfo;
    status: typeof FLIGHT_STATUS[keyof typeof FLIGHT_STATUS];
    isSelected: boolean;
    onSelect: (seat: SeatInfo) => void;
}

export default function Seat({ seat, status, isSelected, onSelect }: SeatProps) {
    const { seatClass, seatNumber } = seat;

    const getBackgroundColor = () => {
        if (status === FLIGHT_STATUS.RESERVED) return '#cbd5e1'; // Modern light grey-slate
        if (isSelected) return '#4caf50';                      // Emerald green

        switch (seatClass) {
            case FLIGHT_CLASSES.ECONOMY: return '#3b82f6';     // Modern vivid blue
            case FLIGHT_CLASSES.BUSINESS: return '#eab308';    // Premium gold/amber
            default: return '#94a3b8';
        }
    };

    const seatStyle: React.CSSProperties = {
        width: '48px',
        height: '48px',
        borderRadius: '8px',
        border: 'none',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        fontSize: '0.9rem',
        fontWeight: '600',
        backgroundColor: getBackgroundColor(),
        cursor: status === FLIGHT_STATUS.RESERVED ? 'not-allowed' : 'pointer',
        color: (isSelected || status !== FLIGHT_STATUS.AVAILABLE) ? 'white' : '#1e293b',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease-in-out',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
    };

    const isReserved = status === FLIGHT_STATUS.RESERVED;

    return (
        <button
            disabled={isReserved}
            style={seatStyle}
            onClick={() => !isReserved && onSelect(seat)}
            onMouseEnter={(e) => {
                if (!isReserved && !isSelected) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isReserved && !isSelected) {
                    e.currentTarget.style.transform = 'scale(1)';
                }
            }}
        >
            {seatNumber}
        </button>
    );
}