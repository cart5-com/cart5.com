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
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });

    // Now load the draw CSS
    const drawCss = document.createElement('link');
    drawCss.href = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css`;
    drawCss.rel = 'stylesheet';
    document.head.appendChild(drawCss);

    // Load fullscreen CSS
    const fullScreenCss = document.createElement('link');
    fullScreenCss.href = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.fullscreen/3.0.2/Control.FullScreen.min.css`;
    fullScreenCss.rel = 'stylesheet';
    document.head.appendChild(fullScreenCss);

    // Load fullscreen JS with a Promise
    await new Promise((resolve, reject) => {
        const fullScreenScript = document.createElement('script');
        fullScreenScript.src = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.fullscreen/3.0.2/Control.FullScreen.min.js`;
        fullScreenScript.onload = resolve;
        fullScreenScript.onerror = reject;
        document.head.appendChild(fullScreenScript);
    });

    // Load draw JS with a Promise
    await new Promise((resolve, reject) => {
        const drawScript = document.createElement('script');
        drawScript.src = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js`;
        drawScript.onload = resolve;
        drawScript.onerror = reject;
        document.head.appendChild(drawScript);
    });

}

export const loadLeafletDrawCDN = async () => {
    let checkAttempts = 0;
    while (!window.L || !window.L.drawVersion) {
        loadCDNs()
        checkAttempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (checkAttempts > 6) {
            console.error('Failed to load Leaflet after multiple attempts');
            toast.error('After multiple attempts, map failed! Please refresh the page.');
            return false;
        } else if (!window.L) {
            toast.error('Could not load map, retrying...');
        }
    }
    window.L.drawLocal.edit.handlers.edit.tooltip.text = 'Drag handles 🔲 to edit/resize active shape';
    window.L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Click done to save changes or close to discard';
    return true;
}