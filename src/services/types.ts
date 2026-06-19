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
  FlightNumber: string;
  seatClass: typeof FLIGHT_CLASSES[keyof typeof FLIGHT_CLASSES]; // Matches your C# property
  seatNumber: string; // Matches your C# property
}

export interface FlightIdResponse {
  FlightNumber: string;
  DepartureTime: string;
  FlightId: string;
}

export interface FlightInstance {
  FlightNumber: string;
  DepartureTime: string;
  FlightId: string;
}

export interface FlightSeatCountResponse {
  FlightId: string;
  TotalSeatCount: Number;
}

export interface FlightIdResponse {
  FlightNumber: string;
  SeatNumber: string;
  SeatClass: typeof FLIGHT_CLASSES[keyof typeof FLIGHT_CLASSES];
}

export interface FlightIdResponse {
  FlightId: string;
  SeatNumber: string;
  UserId: string;
}