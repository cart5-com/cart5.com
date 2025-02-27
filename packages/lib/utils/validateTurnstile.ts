import { KNOWN_ERROR } from '../errors';

export const validateTurnstile = async function (TURNSTILE_SECRET: string, token: string, remoteip?: string) {
    console.log("validateTurnstile: remoteip:", remoteip);
    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const body: { secret: string; response: string; remoteip?: string } = {
        secret: TURNSTILE_SECRET,
        response: token
    }
    if (remoteip) {
        body.remoteip = remoteip;
    }
    const result = await fetch(url, {
        body: JSON.stringify(body),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const outcome = await result.json() as { success: boolean };
    if (!outcome.success) {
        throw new KNOWN_ERROR("Invalid verification", "INVALID_TURNSTILE_TOKEN");
    }
}