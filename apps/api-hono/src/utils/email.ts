import { getEnvVariable, IS_PROD } from "@lib/utils/getEnvVariable";

export const sendEmail = async function (
    options: { from: string, to: string[], subject: string, html: string }
) {
    if (IS_PROD) {
        options.html = options.html.replace(/\n/g, "<br>");
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
    } else {
        console.log(`from: ${options.from}`);
        console.log(`to: ${options.to}`);
        console.log(`subject: ${options.subject}`);
        console.log(`html: ${options.html}`);
        return true;
    }
}

export const sendInvitationEmail = (
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

    sendEmail({
        from,
        to: [to],
        subject,
        html
    });
};

export const sendUserOtpEmail = (
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

    sendEmail({
        from,
        to: [to],
        subject,
        html
    });

};