import { IS_PROD } from "@lib/utils/getEnvVariable";


export const sendUserOtpSms = async (
    number: string,
    code: string
) => {
    const to = number;
    const textMessage = `${code}`;
    if (IS_PROD) {
        // TODO: send sms
        console.log(`to: ${to}`);
        console.log(`textMessage: ${textMessage}`);
        throw new Error('SMS not implemented');
    } else {
        console.log(`✉️📞☎️to: ${to}`);
        console.log(`✉️📞☎️ SMS: ${textMessage}`);
    }
    return 200;

};