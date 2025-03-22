import { getEnvVariable } from "@lib/utils/getEnvVariable";
import { deleteExpiredSessionsService } from "@db/services/session.service";

const runCron = getEnvVariable("RUN_CRON");

export const startCrons = () => {
    if (runCron === "1") {
        setInterval(async () => {
            const result = await deleteExpiredSessionsService();
            console.log(`Cron deleted ${result} expired sessions`);
        }, 21_600_000) // 6 hours
        console.log("Cron is running ⏰");
    } else {
        console.log("Cron is not running 💤");
    }
}

