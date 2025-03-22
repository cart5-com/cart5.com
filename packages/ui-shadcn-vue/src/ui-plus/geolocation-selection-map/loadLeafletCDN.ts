import { toast } from '@/ui-plus/sonner';

const loadCDNs = async () => {
    // Load Leaflet CSS
    const css = document.createElement('link');
    css.href = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css`;
    css.rel = 'stylesheet';
    document.head.appendChild(css);

    // Load Leaflet JS with a Promise
    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js`;
        script.id = 'leaflet-script';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export const loadLeafletCDN = async (isSilent = false) => {
    let checkAttempts = 0;
    while (!window.L) {
        loadCDNs();
        checkAttempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (checkAttempts > 6) {
            console.error('Failed to load Leaflet after multiple attempts');
            if (isSilent === false) {
                toast.error('After multiple attempts, map failed! Please refresh the page.');
            }
            return false;
        } else if (!window.L) {
            if (isSilent === false) {
                toast.error('Could not load map, retrying...');
            }
        }
    }
    return true;
}