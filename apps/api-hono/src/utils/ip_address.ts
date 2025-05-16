import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";

export const getIpAddress = (c: Context<HonoVariables>) => {
    const headers = c.req.header();
    const cfConnectingIp = headers['cf-connecting-ip'];
    if (cfConnectingIp) return cfConnectingIp;

    // Fall back to other methods if not coming through Cloudflare
    const xForwardedFor = headers['x-forwarded-for'];
    const xRealIp = headers['x-real-ip'];

    return xRealIp ||
        (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) ||
        c.env.incoming?.socket?.remoteAddress ||
        '';
}