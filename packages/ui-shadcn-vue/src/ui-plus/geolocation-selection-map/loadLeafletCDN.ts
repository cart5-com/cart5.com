import { toast } from '@/ui-plus/sonner';

export const loadLeafletCDN = async () => {
    const script = document.querySelector('#leaflet-script')
    if (!script) {
        try {
            // Load Leaflet CSS
            const css = document.createElement('link');
            css.href = `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`;
            css.rel = 'stylesheet';
            document.head.appendChild(css);
            // Load Leaflet JS with a Promise
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`;
                script.id = 'leaflet-script';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
            // Verify Leaflet loaded correctly
            if (!window.L) {
                throw new Error('Leaflet failed to load properly');
            }
        } catch (error) {
            console.error('Error loading Leaflet dependencies:', error);
            toast.error('Failed to load map. Please refresh the page.');
            return false;
        }
    }
    return true;
}