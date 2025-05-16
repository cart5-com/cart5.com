import { getEnvVariable, IS_PROD } from "@lib/utils/getEnvVariable";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
    region: getEnvVariable("SMS_AWS_REGION"),
    credentials: {
        accessKeyId: getEnvVariable("SMS_AWS_ACCESS_KEY"),
        secretAccessKey: getEnvVariable("SMS_AWS_SECRET_KEY"),
    },
});

// AWS IAM Policy to allow sns:Publish
// {
//     "Version": "2012-10-17",
//         "Statement": [
//             {
//                 "Effect": "Allow",
//                 "Action": "sns:Publish",
//                 "Resource": "*"
//             }
//         ]
// }

export const sendUserOtpSms = async (
    number: string,
    code: string
) => {
    const to = number;
    const textMessage = `${code}`;
    console.log(`✉️📞☎️to: ${to}`);
    console.log(`${textMessage}`);
    if (IS_PROD) {
        const command = new PublishCommand({
            Message: textMessage,
            PhoneNumber: to,
        });
        // const result = await
        snsClient.send(command);
        // TODO: SEND SMS
        // console.log(`to: ${to}`);
        // console.log(`textMessage: ${textMessage}`);
        // throw new Error('SMS not implemented');
    }
    return 200;
};