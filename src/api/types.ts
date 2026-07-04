export interface FlightInstance {
  flightNumber: string;
  departureTime: string;
  flightId: string;
}

export type SeatClass = 'Economy' | 'Business' | 'First';

export interface SeatLayout {
  flightNumber: string;
  seatNumber: string;
  seatClass: SeatClass;
}

export interface FlightSeatCount {
  flightId: string;
  totalSeatCount: number;
}

export interface FlightBooking {
  flightId: string;
  seatNumber: string;
  userId: string;
  bookingId: string;
}

export interface ReservationBookResponse {
  flightId: string;
  seatNumber: string;
  userId: string;
  bookingId: string;
  details: string;
}

export interface ReservationBookFailureResponse {
  details: string;
}

export interface EnqueueResponse {
  success: boolean;
}

export interface ReservationWaitResponse {
  userId: string;
  position: number;
}

export interface ReservationSessionResponse {
  userId: string;
  timeExpiry: number;
}