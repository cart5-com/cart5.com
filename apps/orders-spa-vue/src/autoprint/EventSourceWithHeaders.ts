// I need a custom EventSource with fetch to add headers.

// make sure to have onmessage, onerror, close. other methods should throw error

export class EventSourceWithHeaders implements EventTarget {
    private url: string;
    private headers: Record<string, string>;
    private abortController: AbortController | null = null;
    private eventTarget: EventTarget = new EventTarget();

    public readyState: number = 0; // CONNECTING
    public onmessage: ((ev: MessageEvent) => any) | null = null;
    public onerror: ((ev: Event) => any) | null = null;
    public onopen: ((ev: Event) => any) | null = null;

    public static readonly CONNECTING: number = 0;
    public static readonly OPEN: number = 1;
    public static readonly CLOSED: number = 2;

    constructor(url: string, headers: Record<string, string> = {}) {
        this.url = url;
        this.headers = headers;
        this.connect();
    }

    private async connect() {
        this.abortController = new AbortController();
        try {
            const response = await fetch(this.url, {
                headers: this.headers,
                signal: this.abortController.signal
            });

            if (!response.ok) {
                this.dispatchErrorEvent(`HTTP error: ${response.status}`);
                return;
            }

            if (!response.body) {
                this.dispatchErrorEvent('Response body is null');
                return;
            }

            // Connection established
            this.readyState = 1; // OPEN
            this.dispatchOpenEvent();

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process complete events in the buffer
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const eventData of lines) {
                    if (eventData.trim() === '') continue;

                    const messageEvent = new MessageEvent('message', {
                        data: eventData.replace(/^data: /, '').trim()
                    });

                    this.dispatchEvent(messageEvent);
                    if (this.onmessage) this.onmessage(messageEvent);
                }
            }
        } catch (error) {
            if (this.readyState !== 2) { // If not already closed
                this.dispatchErrorEvent(error instanceof Error ? error.message : String(error));
            }
        }
    }

    private dispatchOpenEvent() {
        const event = new Event('open');
        this.dispatchEvent(event);
        if (this.onopen) this.onopen(event);
    }

    private dispatchErrorEvent(message: string) {
        const event = new Event('error');
        console.error('EventSourceWithHeaders error:', message);
        this.dispatchEvent(event);
        if (this.onerror) this.onerror(event);
    }

    public close() {
        if (this.readyState === 2) return; // Already closed

        this.readyState = 2; // CLOSED
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    public addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
        this.eventTarget.addEventListener(type, listener, options);
    }

    public removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
        this.eventTarget.removeEventListener(type, listener, options);
    }

    public dispatchEvent(event: Event): boolean {
        return this.eventTarget.dispatchEvent(event);
    }
}