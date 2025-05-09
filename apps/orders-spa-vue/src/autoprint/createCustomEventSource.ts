export function createCustomEventSource(url: string, headers: HeadersInit) {
    let abortController = new AbortController();
    let listeners = {
        open: [] as Array<() => void>,
        message: [] as Array<(data: any) => void>,
        error: [] as Array<(error: any) => void>
    };

    // Start the connection
    (async function connect() {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers,
                signal: abortController.signal,
                cache: 'no-store'
            });

            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            if (!response.body) throw new Error('Response body is null');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            // Fire open event
            listeners.open.forEach(listener => listener());

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    if (line === 'data: ping') continue;

                    const event = line.replace(/^data: /, '');
                    try {
                        const data = JSON.parse(event);
                        listeners.message.forEach(listener => listener(data));
                    } catch (e) {
                        listeners.message.forEach(listener => listener(event));
                    }
                }
            }
        } catch (error) {
            listeners.error.forEach(listener => listener(error));

            // Reconnect logic
            setTimeout(connect, import.meta.env.DEV ? 3000 : 30000);
        }
    })();

    return {
        onopen: (callback: () => void) => listeners.open.push(callback),
        onmessage: (callback: (data: any) => void) => listeners.message.push(callback),
        onerror: (callback: (error: any) => void) => listeners.error.push(callback),
        close: () => abortController.abort()
    };
}