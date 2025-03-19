import { teamUserMapTable } from "@db/schema/team.schema";
import db from "../drizzle";

export const addToTeamSeed = async (teamId: string, userId: string, permissions: string[]) => {
    return await db.insert(teamUserMapTable)
        .values({
            teamId: teamId,
            userId: userId,
            permissions: permissions
        });
}