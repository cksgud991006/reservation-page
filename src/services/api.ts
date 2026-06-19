const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const postData = async (endpoint: string, data: any) => {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('API Error');

        return response.json();
};

export const getData = async<T> (endpoint: string, params?: Record<string, string>): Promise<T> => {
    let url = `${BASE_URL}/${endpoint}`;
    
    if (params) {
        Object.entries(params).forEach(([key, val]) => {
            url = url.replace(`{${key}}`, encodeURIComponent(String(val)));
        });
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response) throw new Error('API Error');

    return response.json();
};