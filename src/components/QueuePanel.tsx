import { useState } from "react";
import { api } from "../api/api";

interface Props {

}

export default function QueuePanel({  }: Props) {
    const [userId, setUserId] = useState<string>(crypto.randomUUID());
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const generate = async () => {
        setLoading(true);
        setMessage(null);
        setUserId(crypto.randomUUID());
        setLoading(false);
    }

    const enqueue = async () => {
        setLoading(true);
        var response = await api.enqueue(userId, new Date().toISOString(), crypto.randomUUID());
        setMessage(response.ok? 'Enqueued.' : 'Failed to connect to server');
        setLoading(false);
    }

    const checkQueue = async () => {
        setLoading(true);
        var response = await api.getQueueStatus(userId);
        if (response.ok) {
            setMessage(response.data!.position === -1? 'Not in queue.' : `Position in queue: ${response.data!.position}`);
        }
        setLoading(false);
    }
    
    const checkSession = async () => {
        setLoading(true);
        var response = await api.getSessionStatus(userId);
        if (response.ok) {
            setMessage(response.data!.timeExpiry === -1? 'No active session.' : `Session active until ${new Date(response.data!.timeExpiry * 1000).toLocaleString()}`);
        }
        setLoading(false);
    }


    return (
        <section className="panel">
            <h2> Queue & Session Lookup </h2>
            <p className="hint"> Utility panel for the wait-queue and Redis session endpoints. </p>
            <div className="row">
                <label>
                    User ID
                    <input
                        value={userId}
                        placeholder={`${userId}`}
                        type="text"
                        onChange={(e) => setUserId(e.target.value)}
                    />
                </label>
                <button
                    disabled={loading}
                    onClick={generate}>
                    New ID
                </button>
                <button
                    disabled={loading}
                    onClick={enqueue}>
                    Enqueue
                </button>
                <button
                    disabled={loading}
                    onClick={checkQueue}>
                    Check Queue
                </button>
                <button
                    disabled={loading}
                    onClick={checkSession}>
                    Check Session
                </button>
            </div>
            {message && <p className="hint">{message}</p>}
        </section>
    );
}