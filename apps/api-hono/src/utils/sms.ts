import { getEnvVariable, IS_PROD } from "@lib/utils/getEnvVariable";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { KNOWN_ERROR } from '@lib/types/errors';

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

// In-memory storage for rate limiting
interface SmsRecord {
    timestamps: number[];
}

const smsMemoryStore: Record<string, SmsRecord> = {};
const MAX_SMS_PER_PERIOD = 3; // Maximum SMS allowed per period
const RATE_LIMIT_PERIOD_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

// Periodically clean up old records to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const number in smsMemoryStore) {
        // Filter out timestamps older than the rate limit period
        smsMemoryStore[number].timestamps = smsMemoryStore[number].timestamps.filter(
            timestamp => now - timestamp < RATE_LIMIT_PERIOD_MS
        );

        // Remove entry if no timestamps remain
        if (smsMemoryStore[number].timestamps.length === 0) {
            delete smsMemoryStore[number];
        }
    }
}, 60 * 60 * 1000); // Clean up every hour

// Check if a number has exceeded rate limits
const hasExceededRateLimit = (number: string): boolean => {
    const now = Date.now();

    // If number doesn't exist in store, create it
    if (!smsMemoryStore[number]) {
        smsMemoryStore[number] = { timestamps: [] };
        return false;
    }

    // Filter timestamps to only include those within the rate limit period
    const recentTimestamps = smsMemoryStore[number].timestamps.filter(
        timestamp => now - timestamp < RATE_LIMIT_PERIOD_MS
    );

    // Update the store with filtered timestamps
    smsMemoryStore[number].timestamps = recentTimestamps;

    // Check if user has exceeded the max SMS allowed
    return recentTimestamps.length >= MAX_SMS_PER_PERIOD;
};

// Record a new SMS send attempt
const recordSmsSend = (number: string): void => {
    if (!smsMemoryStore[number]) {
        smsMemoryStore[number] = { timestamps: [] };
    }

    smsMemoryStore[number].timestamps.push(Date.now());
};

export const sendUserOtpSms = async (
    number: string,
    code: string
) => {
    // Check for rate limiting
    if (hasExceededRateLimit(number)) {
        throw new KNOWN_ERROR("you sent too many sms, please wait 15 minutes before sending again", "WAIT_15_MINUTES_BEFORE_SENDING_AGAIN");
    }

    const to = number;
    const textMessage = `${code}`;
    console.log(`✉️📞☎️to: ${to}`);
    console.log(`${textMessage}`);

    // Record this attempt
    recordSmsSend(number);

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