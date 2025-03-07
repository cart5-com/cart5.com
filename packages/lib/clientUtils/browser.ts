export function getUA(): string {
    if (
        typeof navigator !== 'undefined' &&
        typeof navigator['userAgent'] === 'string'
    ) {
        return navigator['userAgent'];
    } else {
        return '';
    }
}

export function _isFirefox(ua = getUA()): boolean {
    return /firefox\//i.test(ua);
}

export function _isChromeIOS(ua = getUA()): boolean {
    return /crios\//i.test(ua);
}

interface NavigatorStandalone extends Navigator {
    standalone?: unknown;
}

export function _isIOSStandalone(ua = getUA()): boolean {
    return _isIOS(ua) && !!(window.navigator as NavigatorStandalone)?.standalone;
}

export function _isIOS(ua = getUA()): boolean {
    return (
        /iphone|ipad|ipod/i.test(ua) ||
        (/macintosh/i.test(ua) && /mobile/i.test(ua))
    );
}
