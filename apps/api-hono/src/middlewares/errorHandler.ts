import type { ErrorHandler } from 'hono';
import { KNOWN_ERROR } from '@lib/types/errors';
import { sendDiscordMessage } from '../utils/logging';
import type { HonoVariables } from '../types/HonoVariables';

export const errorHandler: ErrorHandler<HonoVariables> = async (err, c) => {
    if (err instanceof KNOWN_ERROR) {
        console.log("KNOWN_ERROR err:");
        console.log(err);
        c.error = undefined;
        return c.json({
            error: {
                message: err.message,
                code: err.code
            },
        }, 500);
    } else {
        sendDiscordMessage(`Index.ts onError: ${err}`);
        // this is same with hono's own error handler. 
        // but i like JSON response, not text
        if ("getResponse" in err) {
            return err.getResponse();
        }
        return c.json({
            error: {
                message: "Internal Server Error"
            },
        }, 503);
    }
}; 