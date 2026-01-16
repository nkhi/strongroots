import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../config';

export interface UseCapServiceOptions {
    keepAlive?: boolean;
}

export function useCapService({ keepAlive = false }: UseCapServiceOptions = {}) {
    const [isRunning, setIsRunning] = useState(false);

    const checkStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/services/cap/status`);
            const data = await response.json();
            return !!data.running;
        } catch (err) {
            return false;
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        let pollInterval: NodeJS.Timeout;

        const runCheck = async () => {
            const running = await checkStatus();
            if (running && mounted) {
                setIsRunning(true);
                return true;
            }
            return false;
        };

        const startPolling = async () => {
            // Check immediately
            if (await runCheck()) return;

            // Poll every 1 second until running
            pollInterval = setInterval(async () => {
                const running = await runCheck();
                if (running && pollInterval) {
                    clearInterval(pollInterval);
                }
            }, 1000);
        };

        startPolling();

        return () => {
            mounted = false;
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [checkStatus]);

    // Activity heartbeats to keep service alive
    useEffect(() => {
        if (!isRunning || !keepAlive) return;

        const sendPing = () => {
            fetch(`${API_BASE_URL}/api/services/cap/activity`, { method: 'POST' }).catch(() => { });
        };

        // Initial ping
        sendPing();

        // Ping every 30 seconds
        const heartbeat = setInterval(sendPing, 30000);

        return () => clearInterval(heartbeat);
    }, [isRunning, keepAlive]);

    return { isRunning };
}
