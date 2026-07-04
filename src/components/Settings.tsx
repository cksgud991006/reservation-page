import { useState } from "react"
import { getApiBaseUrl, setApiBaseUrl } from "../api/api"
import { api } from "../api/api";

interface Props {
    onSaved: (url: string) => void;
}

export function Settings({ onSaved }: Props) {
    const [url, setUrl] = useState(getApiBaseUrl());
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const connect = async () => {
        setLoading(true);
        setApiBaseUrl(url);

        const result = await api.getFlights();
        if (result.ok) {
            setMessage(`Connected. ${result.data?.length ?? 0} flight(s) found.`);
        } else {
            setMessage(`Failed. Server did not respond.`)
        }
        
        onSaved(getApiBaseUrl());
        setLoading(false);
    };

    return (
        <section>
            <h2> API Connection </h2>
            <p>
                This calls pointed API server. By default it points at Reservation API.
                This could be pointed to locally running backend from <code> docker-compose up </code>.
            </p>
            <div>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={getApiBaseUrl()}
                />
                <button onClick={connect}> {loading? 'Connecting...' : 'Connect'} </button>
            </div>
            <div>
                {message !== '' && (
                    <p>
                    {message}
                    </p>
                )}
            </div>
        </section>
    ) ;
}