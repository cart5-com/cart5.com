import { _isChromeIOS, _isFirefox, _isIOSStandalone, getUA } from "./browser";

const BASE_POPUP_OPTIONS = {
    location: 'yes',
    resizable: 'yes',
    statusbar: 'yes',
    toolbar: 'no'
};

const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 600;
// const TARGET_BLANK = '_blank';

const FIREFOX_EMPTY_URL = 'http://localhost';

export const showTurnstilePopup = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const width = DEFAULT_WIDTH;
        const height = DEFAULT_HEIGHT;

        const top = Math.max((window.screen.availHeight - height) / 2, 0).toString();
        const left = Math.max((window.screen.availWidth - width) / 2, 0).toString();


        const options: { [key: string]: string } = {
            ...BASE_POPUP_OPTIONS,
            width: width.toString(),
            height: height.toString(),
            top,
            left
        };

        // Chrome iOS 7 and 8 is returning an undefined popup win when target is
        // specified, even though the popup is not necessarily blocked.
        const ua = getUA().toLowerCase();
        let target = '';
        // if (name) {
        //     target = _isChromeIOS(ua) ? TARGET_BLANK : name;
        // }

        if (_isFirefox(ua)) {
            // Firefox complains when invalid URLs are popped out. Hacky way to bypass.
            url = url || FIREFOX_EMPTY_URL;
            // Firefox disables by default scrolling on popup windows, which can create
            // issues when the user has many Google accounts, for instance.
            options.scrollbars = 'yes';
        }

        const optionsString = Object.entries(options).reduce(
            (accum, [key, value]) => `${accum}${key}=${value},`,
            ''
        );

        // if (_isIOSStandalone(ua) && target !== '_self') {
        //     openAsNewWindowIOS(url || '', target);
        //     return new AuthPopup(null);
        // }

        const origin = new URL(url).origin;
        const state = crypto.randomUUID();
        const urlWithState = new URL(url);
        urlWithState.searchParams.append('state', state);
        const popup = window.open(urlWithState.toString(), target, optionsString);

        if (!popup) {
            reject(new Error('Popup blocked. Please allow popups and try again.'));
            return;
        }

        // Flaky on IE edge, encapsulate with a try and catch.
        try {
            popup.focus();
        } catch (e) { }

        // Listen for message from popup
        const messageHandler = (event: MessageEvent) => {
            // Add state verification
            if (!popup || event.source !== popup) {
                return;
            }

            // Verify origin
            if (event.origin !== origin) {
                return;
            }

            // Handle verification result
            if (event.data?.type === 'turnstile-verification') {
                window.removeEventListener('message', messageHandler);
                // Verify state matches
                if (event.data.state !== state) {
                    reject(new Error('Invalid state parameter'));
                    return;
                }
                if (event.data.error) {
                    reject(new Error(event.data.error));
                } else {
                    resolve(event.data.data);
                }
                popup.close();
            }
        };

        window.addEventListener('message', messageHandler);

        // Handle popup close
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                window.removeEventListener('message', messageHandler);
                reject(new Error('Verification cancelled'));
            }
        }, 1000);
    });
};


// function openAsNewWindowIOS(url: string, target: string): void {
//     const el = document.createElement('a');
//     el.href = url;
//     el.target = target;
//     const click = document.createEvent('MouseEvent');
//     click.initMouseEvent(
//         'click',
//         true,
//         true,
//         window,
//         1,
//         0,
//         0,
//         0,
//         0,
//         false,
//         false,
//         false,
//         false,
//         1,
//         null
//     );
//     el.dispatchEvent(click);
// }
