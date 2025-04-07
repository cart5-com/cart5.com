import { getEnvVariable } from "@lib/utils/getEnvVariable";
import { deleteExpiredSessionsService } from "@db/services/session.service";
import { cfPurgeAllEdgeCache } from "@lib/upload/r2actions";

const runCron = getEnvVariable("RUN_CRON");

export const startCrons = () => {
    if (runCron !== "1") {
        console.log("Cron is not running 💤");
        return;
    }
    console.log("Cron is running ⏰");
    const runEveryMinute = async () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Daily task: Delete expired sessions (run once per day at 1 AM)
        if (currentHour === 1 && currentMinute === 0) {
            try {
                const result = await deleteExpiredSessionsService();
                console.log(`Cron deleted ${result} expired sessions at ${new Date().toISOString()}`);
            } catch (error) {
                console.error("Error running session cleanup:", error);
            }
        }

        // Run every 5 minutes: Purge edge cache
        if (currentMinute % 5 === 0) {
            try {
                await cfPurgeAllEdgeCache();
                console.log(`Purged edge cache at ${new Date().toISOString()}`);
            } catch (error) {
                console.error("Error purging cache:", error);
            }
        }

    };
    runEveryMinute();
    setInterval(runEveryMinute, 60_000);
}
