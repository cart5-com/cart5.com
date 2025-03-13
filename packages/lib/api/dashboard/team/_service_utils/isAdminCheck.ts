import { hasTeamPermission_Service } from "./hasTeamPermission_Service";

export const isAdminCheck = async (
    userId: string,
    ownerTeamId: string,
    supportTeamId: string | null,
    permissions: string[]
) => {
    if (
        supportTeamId &&
        await hasTeamPermission_Service(
            userId,
            supportTeamId,
            permissions
        )
    ) {
        return true;
    }
    if (
        await hasTeamPermission_Service(
            userId,
            ownerTeamId,
            permissions
        )
    ) {
        return true;
    }
    return false;
}