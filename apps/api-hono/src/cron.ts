import { getEnvVariable } from "@lib/utils/getEnvVariable";
import { deleteExpiredSessionsService } from "@db/services/session.service";
import { cfPurgeAllEdgeCache } from "@lib/upload/r2actions";

const runCron = getEnvVariable("RUN_CRON");

// Function to check if it's time to run a daily task
const shouldRunDailyTask = (lastRunTime: number, targetHour = 0) => {
    const now = new Date();
    const lastRun = new Date(lastRunTime);

    // Check if it's a different day or if we're past the target hour and haven't run today
    return (
        now.getDate() !== lastRun.getDate() ||
        now.getMonth() !== lastRun.getMonth() ||
        now.getFullYear() !== lastRun.getFullYear()
    ) && now.getHours() >= targetHour;
};

// // Function to check if it's time to run an hourly task
// const shouldRunHourlyTask = (lastRunTime: number) => {
//     const now = new Date();
//     const lastRun = new Date(lastRunTime);

//     // Run once per hour
//     return (
//         now.getHours() !== lastRun.getHours() ||
//         now.getDate() !== lastRun.getDate() ||
//         now.getMonth() !== lastRun.getMonth() ||
//         now.getFullYear() !== lastRun.getFullYear()
//     );
// };

// Function to check if it's time to run a task every 5 minutes
const shouldRunEveryFiveMinutes = (lastRunTime: number) => {
    const now = Date.now();
    // Run every 5 minutes (300000 milliseconds)
    return now - lastRunTime >= 300000;
};

export const startCrons = () => {
    if (runCron !== "1") {
        console.log("Cron is not running 💤");
        return;
    }

    console.log("Cron is running ⏰");

    // Track last run times
    let lastSessionCleanupTime = 0;
    let lastCachePurgeTime = 0;

    // Check tasks every minute
    const checkInterval = 60000; // 1 minute

    const runTasks = async () => {
        const now = Date.now();

        // Daily task: Delete expired sessions (run once per day at 1 AM)
        if (shouldRunDailyTask(lastSessionCleanupTime, 1)) {
            try {
                const result = await deleteExpiredSessionsService();
                console.log(`Cron deleted ${result} expired sessions at ${new Date().toISOString()}`);
                lastSessionCleanupTime = now;
            } catch (error) {
                console.error("Error running session cleanup:", error);
            }
        }

        // Run every 5 minutes: Purge edge cache
        if (shouldRunEveryFiveMinutes(lastCachePurgeTime)) {
            try {
                await cfPurgeAllEdgeCache();
                console.log(`Purged edge cache at ${new Date().toISOString()}`);
                lastCachePurgeTime = now;
            } catch (error) {
                console.error("Error purging cache:", error);
            }
        }
    };

    // Run immediately on startup
    runTasks();

    // Then check regularly
    setInterval(runTasks, checkInterval);
}
