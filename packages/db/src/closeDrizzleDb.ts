import db from "./drizzle";
export const closeDrizzleDb = async () => {
    await db.$client.close();
}