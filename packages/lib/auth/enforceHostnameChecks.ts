import { IS_PROD, getEnvVariable } from "../utils/getEnvVariable";

export const IS_CADDY_DEV = getEnvVariable('npm_lifecycle_event') === 'dev:caddy';

export const ENFORCE_HOSTNAME_CHECKS = IS_CADDY_DEV || IS_PROD;
