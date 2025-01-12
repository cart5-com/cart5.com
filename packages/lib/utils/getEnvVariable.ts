
export const getEnvVariable = function (
    environmentVariable: string
): string {
    const validEnvironmentVariable = process.env[environmentVariable];
    if (!validEnvironmentVariable) {
        throw new Error(`Couldn't find environment variable: ${environmentVariable}`);
    }
    return validEnvironmentVariable;
}
export const getOptionalEnvVariable = function (
    environmentVariable: string
): string | undefined {
    return process.env[environmentVariable];
}

export const IS_PROD = getOptionalEnvVariable("NODE_ENV") === "production"