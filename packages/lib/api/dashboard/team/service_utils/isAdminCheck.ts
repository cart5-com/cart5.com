import { TEAM_PERMISSIONS } from "../../../../db/schema/team.schema";
import { hasTeamPermission_Service } from "./hasTeamPermission_Service";

export const isAdminCheck = async (
    userId: string,
    ownerTeamId: string,
    supportTeamId: string | null,
) => {
    if (
        supportTeamId &&
        await hasTeamPermission_Service(
            userId,
            supportTeamId, [
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ])
    ) {
        return true;
    }
    if (
        await hasTeamPermission_Service(userId, ownerTeamId, [
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ])
    ) {
        return true;
    }
    return false;
}