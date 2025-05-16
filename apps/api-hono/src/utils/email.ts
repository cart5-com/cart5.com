import { STORE_FRONT_LINKS } from "@lib/storefrontLinks";
import { getEnvVariable, IS_PROD } from "@lib/utils/getEnvVariable";

export const sendEmail = async function (
    options: { from: string, to: string[], subject: string, html: string }
) {
    if (IS_PROD) {
        options.html = options.html.replace(/\n/g, "<br>");
        options.html = options.html.replace(/https?:\/\/\S+/g, (url) => `<a target="_blank" href="${url}">${url}</a>`);
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

export const orderOnlinePaymentNotVerifiedEmail = (
    email: string,
    storeName: string,
    orderId: string,
    websiteDefaultHostname: string,
) => {
    const from = `no-reply-order-online-payment-not-verified <no-reply-order-online-payment-not-verified@${getEnvVariable('PUBLIC_DOMAIN_NAME')}>`;
    const to = email;
    const subject = `Your online payment not verified for '${storeName}' order`;
    const html = `
Your order payment has not been verified yet. To complete your order:

Click the link below to check and complete your order:
----------------
https://${websiteDefaultHostname}${STORE_FRONT_LINKS.SHOW_ORDER(orderId)}
----------------

Important notes:
- The store cannot process unverified orders
- All payment links expire after 1 hour
- Please complete the payment process to confirm your order`;

    sendEmail({
        from,
        to: [to],
        subject,
        html
    });
};

export const orderAcceptedEmail = (
    email: string,
    storeName: string,
    orderId: string,
    websiteDefaultHostname: string,
) => {
    const from = `no-reply-order-accepted <no-reply-order-accepted@${getEnvVariable('PUBLIC_DOMAIN_NAME')}>`;
    const to = email;
    const subject = `Your order has been accepted by '${storeName}'`;
    const html = `
Your order has been accepted by '${storeName}'.

Click the link below to see your order:
----------------
https://${websiteDefaultHostname}${STORE_FRONT_LINKS.SHOW_ORDER(orderId)}
----------------

`;
    sendEmail({
        from,
        to: [to],
        subject,
        html
    });
}

export const orderCancelledEmail = (
    email: string,
    storeName: string,
    orderId: string,
    websiteDefaultHostname: string,
) => {
    const from = `no-reply-order-cancelled <no-reply-order-cancelled@${getEnvVariable('PUBLIC_DOMAIN_NAME')}>`;
    const to = email;
    const subject = `Your order has been cancelled by '${storeName}'`;
    const html = `
Your order has been cancelled by '${storeName}'.

Click the link below to see your order:
----------------
https://${websiteDefaultHostname}${STORE_FRONT_LINKS.SHOW_ORDER(orderId)}
----------------

`;
    sendEmail({
        from,
        to: [to],
        subject,
        html
    });
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