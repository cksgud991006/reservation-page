import { FlightInstance } from "./types";

const STORAGE_KEY = 'reservation-api-base-url';
export const DEFAULT_BASE_URL = import.meta.env.API_BASE_URL;

export const getApiBaseUrl = (): string => {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_BASE_URL;
}

export const setApiBaseUrl = (url: string): void => {
    localStorage.setItem(STORAGE_KEY, url.trim());
}

export interface ApiResult<T> {
    ok: boolean;
    data: T | null;
}

// params to body
export const postData = async (endpoint: string, data: any) => {
    const response = await fetch(`${getApiBaseUrl()}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('API Error');

        return response.json();
};

// params to url
export const getData = async<T> (endpoint: string, params?: Record<string, string>): Promise<ApiResult<T>> => {
    let url = `${getApiBaseUrl()}/${endpoint}`;
    
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
    getFlights: () => getData<FlightInstance[]>('/api/flights') 
}  