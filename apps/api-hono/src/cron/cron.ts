import { getEnvVariable } from "@lib/utils/getEnvVariable";
import { deleteExpiredSessionsService } from "@db/services/session.service";
import { cfPurgeAllEdgeCache } from "@lib/upload/r2actions";
import { listAndUploadAllUpdatedStores } from "@db/cache_json/store.cache_json";
import {
    checkAndComplete_AcceptedOrders_after24Hours
} from "@api-hono/utils/orders/checkAndComplete_AcceptedOrders_after24Hours";

const runCron = getEnvVariable("RUN_CRON");
// This is not scalable, but it is ok for now
export const startCrons = async () => {
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

        // Run every 15 minutes: Check and complete orders
        if ((currentMinute - 9) % 15 === 0) {
            try {
                await checkAndComplete_AcceptedOrders_after24Hours();
                console.log(`Checked and completed orders at ${new Date().toISOString()}`);
            } catch (error) {
                console.error("Error checking and completing orders:", error);
            }
        }

        // Run every 5 minutes: Update store data if changed
        if ((currentMinute - 2) % 5 === 0) {
            try {
                await listAndUploadAllUpdatedStores();
                console.log(`Updated store data at ${new Date().toISOString()}`);
            } catch (error) {
                console.error("Error updating store data:", error);
            }
        }

    };
    runEveryMinute();
    setInterval(runEveryMinute, 60_000);

}

// TODO: do I need to run this manually at start?
checkAndComplete_AcceptedOrders_after24Hours();