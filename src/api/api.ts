import type { FlightInstance, FlightBooking, FlightSeatCount, SeatLayout, ReservationBookResponse, EnqueueResponse, ReservationSessionResponse, ReservationWaitResponse } from "./types";

const STORAGE_KEY = 'reservation-api-base-url';
const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getApiBaseUrl = (): string => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_BASE_URL;
}

export const setApiBaseUrl = (url: string): void => {
    localStorage.setItem(STORAGE_KEY, url.trim());
}

export interface ApiResult<T> {
    ok: boolean;
    data: T | null;
}

// params to body
export const postData = async<T> (endpoint: string, body: any): Promise<ApiResult<T>> => {
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        });

        if (!response) {
            return {
                ok: false,
                data: null
            }
        }

        const data = JSON.parse(await response.text());

        return {
            ok: response.ok,
            data: data
        }
};

// params to url
export const getData = async<T> (endpoint: string, params?: Record<string, string>): Promise<ApiResult<T>> => {
    let url = `${getApiBaseUrl()}${endpoint}`;
    
    if (params) {
        Object.entries(params).forEach(([key, val]) => {
            url = url.replace(`{${key}}`, encodeURIComponent(String(val)));
        });
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response) {
        return {
            ok: false,
            data: null
        }
    }

    const data = JSON.parse(await response.text());

    return {
        ok: response.ok,
        data: data
    }
};

export const api = {
    getFlights: () => getData<FlightInstance[]>('/api/flights'),
    getSeatLayout: (flightNumber: string) => getData<SeatLayout[]>('/api/flights/{flightNumber}/seats', { flightNumber : flightNumber }),
    getSeatCount: (flightId: string) => getData<FlightSeatCount[]>('/api/flights/{flightId}/seats/count', { flightId: flightId }),
    getFlightBookings: (flightId: string) => getData<FlightBooking[]>('/api/flights/{flightId}/bookings', { flightId: flightId }),
    getQueueStatus: (userId: string) => getData<ReservationWaitResponse>(`/api/queue/{id}`, { id: userId }),
    getSessionStatus: (userId: string) => getData<ReservationSessionResponse>(`/api/sessions/{id}`, { id: userId }),
    reserveSeat: (flightId: string, seatNumber: string, userId: string) => postData<ReservationBookResponse>('/api/bookings', { flightId: flightId, seatNumber: seatNumber, userId: userId  }),
    enqueue: (userId: string, requestTime: string, idempotencyKey: string) => postData<EnqueueResponse>('/api/queue', { userId: userId, requestTime: requestTime, idempotencyKey: idempotencyKey  })
}  

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const enqueueToActiveSession = async (userId: string, requestTime: string, idempotencyKey: string, onTick?: (waited: number) => void): Promise<EnqueueResponse> => {
    const timeoutMs = 10000;
    const pollMs = 1000;

    await api.enqueue(userId, requestTime, idempotencyKey);

    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        var status = await api.getSessionStatus(userId);
        if (status.ok && status.data!.timeExpiry !== -1) return {
            success: true
        };
        onTick?.(timeoutMs - (deadline - Date.now()));
        await sleep(pollMs);
    }


    return {
        success: false
    };
}