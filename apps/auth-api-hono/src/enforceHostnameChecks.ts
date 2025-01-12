import { IS_PROD, getEnvVariable } from "lib/utils/getEnvVariable";

const IS_CADDY_DEV = getEnvVariable('npm_lifecycle_event') === 'dev:caddy';

export const ENFORCE_HOSTNAME_CHECKS = IS_CADDY_DEV || IS_PROD;
