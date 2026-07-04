import Seat from './Seat';
import { type SeatInfo } from '../../api/types';
import { FLIGHT_STATUS } from '../../../constants/flight';

interface SeatGridProps {
    seats: SeatInfo[];
    reservedSeats: SeatInfo[];
    selectedSeats: SeatInfo[];
    onSeatToggle: (seatInfo: SeatInfo) => void;
}

export default function SeatGrid({ seats, reservedSeats, selectedSeats, onSeatToggle }: SeatGridProps) {
    const gridContainerStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(8, minmax(40px, 50px))',
        gap: '12px',
        justifyContent: 'center',
        padding: '20px 0',
    };

    const containerStyle: React.CSSProperties = {
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        maxWidth: '550px',
        margin: '0 auto',
    };

    const titleStyle: React.CSSProperties = {
        color: '#1e293b',
        fontSize: '1.5rem',
        fontWeight: 700,
        margin: '0 0 16px 0',
        textAlign: 'center',
    };

    const legendStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #f1f5f9',
        fontSize: '0.85rem',
        color: '#64748b',
    };

    const legendItemStyle = (color: string): React.CSSProperties => ({
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: color, // Applies the dynamic color to the text
    });

    const legendDotStyle = (color: string): React.CSSProperties => ({
        width: '12px',
        height: '12px',
        borderRadius: '4px',
        backgroundColor: color,
    });

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>Select Your Seat</h2>

            {/* The Grid Container */}
            <div style={gridContainerStyle}>
                {seats.map((seat) => {
                    const isReserved = reservedSeats.some(
                        (reservedSeat) =>
                            seat.seatNumber === reservedSeat.seatNumber &&
                            seat.seatClass === reservedSeat.seatClass
                    );
                    const isSelected = selectedSeats.some(
                        (selectedSeat) =>
                            seat.seatNumber === selectedSeat.seatNumber &&
                            seat.seatClass === selectedSeat.seatClass
                    );

                    return (
                        <Seat
                            key={`${seat.seatClass}-${seat.seatNumber}`}
                            seat={seat}
                            status={isReserved ? FLIGHT_STATUS.RESERVED : FLIGHT_STATUS.AVAILABLE}
                            isSelected={isSelected}
                            onSelect={() => onSeatToggle(seat)}
                        />
                    );
                })}
            </div>

            {/* Visual Legend */}
            <div style={legendStyle}>
                <div style={legendItemStyle('#1a73e8')}>
                    <span style={legendDotStyle('#1a73e8')}></span> Economy
                </div>
                <div style={legendItemStyle('#ffbb00')}>
                    <span style={legendDotStyle('#ffbb00')}></span> Business
                </div>
                <div style={legendItemStyle('#4caf50')}>
                    <span style={legendDotStyle('#4caf50')}></span> Selected
                </div>
                <div style={legendItemStyle('#cbd5e1')}>
                    <span style={legendDotStyle('#cbd5e1')}></span> Reserved
                </div>
            </div>
        </div>
    );
}