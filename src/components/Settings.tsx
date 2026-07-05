import { useState } from "react"
import { getApiBaseUrl, setApiBaseUrl } from "../api/api"
import { api } from "../api/api";

interface Props {
    onSaved: (url: string) => void;
}

export default function Settings({ onSaved }: Props) {
    const [url, setUrl] = useState<string>(getApiBaseUrl());
    const [message, setMessage] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
    const [loading, setLoading] = useState<boolean>(false);

    const connect = async () => {
        setLoading(true);
        setApiBaseUrl(url);
        setStatus('testing');
        const result = await api.getFlights();
        if (result.ok) {
            setStatus('ok');
            setMessage(`Connected. ${result.data?.length ?? 0} flight(s) found.`);
        } else {
            setStatus('fail');
            setMessage(`Failed. Server did not respond.`)
        }
        
        onSaved(getApiBaseUrl());
        setLoading(false);
    };

    return (
        <section className="panel">
            <h2> API Connection </h2>
            <p className="hint">
                This calls pointed API server. By default it points at Reservation API.
                This could be pointed to locally running backend from <code> docker-compose up </code>.
            </p>
            <div className="row">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={getApiBaseUrl()}
                />
                <button onClick={connect}> {loading? 'Connecting…' : 'Connect'} </button>
            </div>
            <div>
                {status !== 'idle' && message && (
                    <p className={status === 'ok' ? 'status-ok' : status === 'fail' ? 'status-fail' : ''}>
                    {message}
                    </p>
                )}
            </div>
        </section>
    ) ;
}