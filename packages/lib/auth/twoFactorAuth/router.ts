import { Hono } from 'hono'
import type { HonoVariables } from "../../hono/HonoVariables";
import { newTwoFactorAuthRoute } from './new';
import { saveTwoFactorAuthRoute, saveTwoFactorAuthSchemaValidator } from './save';
import { verifyTwoFactorAuthRoute, verifyTwoFactorAuthSchemaValidator } from './verify';
import { removeTwoFactorAuthRoute, removeTwoFactorAuthSchemaValidator } from './remove-2fa-with-recovery-code';
import { generateNewRecoveryCodeRoute, generateNewRecoveryCodeSchemaValidator } from './generate-new-recovery-code';
import { getRecoveryCodeRoute, getRecoveryCodeSchemaValidator } from './get-recovery-code';
import { remove2FARoute, remove2FASchemaValidator } from './remove-2fa';
import { authHostnameCheck } from '../authHostnameCheck';
export const twoFactorAuthRoute = new Hono<HonoVariables>()
    .post(
        '/new',
        authHostnameCheck,
        newTwoFactorAuthRoute
    )
    .post(
        '/save',
        authHostnameCheck,
        saveTwoFactorAuthSchemaValidator,
        saveTwoFactorAuthRoute
    )
    .post(
        '/verify',
        authHostnameCheck,
        verifyTwoFactorAuthSchemaValidator,
        verifyTwoFactorAuthRoute
    )
    .post(
        '/remove-2fa-with-recovery-code',
        authHostnameCheck,
        removeTwoFactorAuthSchemaValidator,
        removeTwoFactorAuthRoute
    )
    .post(
        '/generate-new-recovery-code',
        authHostnameCheck,
        generateNewRecoveryCodeSchemaValidator,
        generateNewRecoveryCodeRoute
    )
    .post(
        '/get-recovery-code',
        authHostnameCheck,
        getRecoveryCodeSchemaValidator,
        getRecoveryCodeRoute
    )
    .post(
        '/remove-2fa',
        authHostnameCheck,
        remove2FASchemaValidator,
        remove2FARoute
    )