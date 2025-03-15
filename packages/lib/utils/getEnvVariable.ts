
export const getEnvVariable = function (
    environmentVariable: string
): string {
    const validEnvironmentVariable = process.env[environmentVariable];
    if (!validEnvironmentVariable) {
        throw new Error(`Couldn't find environment variable: ${environmentVariable}`);
    }
    return validEnvironmentVariable;
}
// export const getOptionalEnvVariable = function (
//     environmentVariable: string
// ): string | undefined {
//     const enVar = process.env[environmentVariable];
//     if (!enVar) {
//         console.warn(`Couldn't find environment variable: ${environmentVariable}`);
//     }
//     return enVar;
// }

export const IS_PROD = getEnvVariable("NODE_ENV") === "production"