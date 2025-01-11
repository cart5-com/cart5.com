import type { Context } from "hono";
import { env } from "hono/adapter";

export const sendEmail = async function (
    options: { from: string, to: string[], subject: string, html: string },
    c: Context<AuthApiHonoEnv>
) {
    const { RESEND_API_KEY } = env(c);
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(options),
    });

    return res.ok;
    // if (res.ok) {
    //     const data = await res.json();
    //     return Response.json(data);
    // }
}

export const sendUserOtpEmail = async (
    email: string,
    code: string,
    c: Context<AuthApiHonoEnv>
) => {
    const from = "no-reply-otp <no-reply-otp@cart5.com>";
    const to = email;
    const subject = `One-Time-Password: ${code}`;
    const html = `
Please use the code below to access

----------------
${code}
----------------

This code will expire in 10 minutes.`;

    if (c.get('IS_PROD')) {
        // const send =
        sendEmail({
            from,
            to: [to],
            subject,
            html: html.replace(/\n/g, "<br>")
        }, c);
        // return send.data;
        return 200;
    } else {
        console.log(`from: ${from}`);
        console.log(`to: ${to}`);
        console.log(`subject: ${subject}`);
        console.log(`html: ${html}`);
        return 200;
    }

};