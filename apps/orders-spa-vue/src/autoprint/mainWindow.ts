

export const getMainWindow = function () {
    return nw.Window.get();
}

export const getHostname = function () {
    try {
        return `${require('os').hostname()}-${Date.now()}`;
    } catch (error) {
        // Fallback to browser API if running in browser environment
        const name = navigator.userAgent.substring(navigator.userAgent.indexOf('(') + 1, navigator.userAgent.indexOf(')')) || window.location.hostname || 'unknown-device';
        return `${name}-${Date.now()}`;
    }
}

