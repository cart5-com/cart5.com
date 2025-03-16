import { getEnvVariable, IS_PROD } from "@lib/utils/getEnvVariable";

export const sendEmail = async function (
    options: { from: string, to: string[], subject: string, html: string }
) {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getEnvVariable('RESEND_API_KEY')}`,
        },
        body: JSON.stringify(options),
    });

    return res.ok;
    // if (res.ok) {
    //     const data = await res.json();
    //     return Response.json(data);
    // }
}

export const sendInvitationEmail = async (
    email: string,
    invitationLink: string,
    teamName: string
) => {
    if (IS_PROD) {
        invitationLink = `<a href="${invitationLink}">${invitationLink}</a>`;
    }
    const from = `no-reply-invitation <no-reply-invitation@${getEnvVariable('PUBLIC_DOMAIN_NAME')}>`;
    const to = email;
    const subject = `Invitation to join '${teamName}' team`;
    const html = `
Please use the link below to join the team:'${teamName}'

----------------
${invitationLink}
----------------

This link will expire in 7 days.
If you do not want to join the team, please ignore this email.

`;

    if (IS_PROD) {
        // const send =
        sendEmail({
            from,
            to: [to],
            subject,
            html: html.replace(/\n/g, "<br>")
        });
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

export const sendUserOtpEmail = async (
    email: string,
    code: string
) => {
    const from = `no-reply-otp <no-reply-otp@${getEnvVariable('PUBLIC_DOMAIN_NAME')}>`;
    const to = email;
    const subject = `One-Time-Password: ${code}`;
    const html = `
Please use the code below to access

----------------
${code}
----------------

This code will expire in 10 minutes.`;

    if (IS_PROD) {
        // const send =
        sendEmail({
            from,
            to: [to],
            subject,
            html: html.replace(/\n/g, "<br>")
        });
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