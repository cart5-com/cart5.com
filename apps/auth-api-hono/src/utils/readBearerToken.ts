export const readBearerToken = (authorizationHeader: string | null): string | null => {
    if (!authorizationHeader) {
        return null;
    }
    const [authScheme, token] = authorizationHeader.split(" ") as [string, string | undefined];
    if (authScheme !== "Bearer") {
        return null;
    }
    return token ?? null;
}