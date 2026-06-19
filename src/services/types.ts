import type { FLIGHT_CLASSES } from "../../constants/flight";

export interface TicketWaitResponse {
  id: string;      // Matches your C# property
  position: number; // Matches your C# property
}

export interface TicketSessionResponse {
  id: string;      // Matches your C# property
  timeExpiry: number; // Matches your C# property
}

export interface SeatInfo {
  flightNumber: string;
  seatClass: typeof FLIGHT_CLASSES[keyof typeof FLIGHT_CLASSES]; // Matches your C# property
  seatNumber: string; // Matches your C# property
}

export interface FlightBookingResponse {
  flightId: string;
  seatNumber: string; 
  userId: string;
}

export interface FlightIdResponse {
  flightNumber: string;
  departureTime: string;
  flightId: string;
}

export interface FlightInstance {
  flightNumber: string;
  departureTime: string;
  flightId: string;
}

export interface FlightSeatCountResponse {
  flightId: string;
  totalSeatCount: Number;
}

export interface FlightIdResponse {
  flightNumber: string;
  seatNumber: string;
  seatClass: typeof FLIGHT_CLASSES[keyof typeof FLIGHT_CLASSES];
}

export interface FlightIdResponse {
  flightId: string;
  seatNumber: string;
  userId: string;
}