import { getEnvVariable, IS_PROD } from '@lib/utils/getEnvVariable';

export async function sendDiscordMessage(message: string) {
    console.log('[DISCORD]', message);
    if (IS_PROD) {
        const webhookUrl = getEnvVariable("DISCORD_WEBHOOK_URL");
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: message,
                }),
            });
        } catch (error) {
            console.error('Failed to send Discord message:', error);
        }
    }
} 