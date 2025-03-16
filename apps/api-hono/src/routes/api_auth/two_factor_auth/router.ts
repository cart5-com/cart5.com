import { Hono } from 'hono'
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { newTwoFactorAuthRoute } from './new';
import { saveTwoFactorAuthRoute, saveTwoFactorAuthSchemaValidator } from './save';
import { verifyTwoFactorAuthRoute, verifyTwoFactorAuthSchemaValidator } from './verify';
import { removeTwoFactorAuthRoute, removeTwoFactorAuthSchemaValidator } from './remove-2fa-with-recovery-code';
import { generateNewRecoveryCodeRoute, generateNewRecoveryCodeSchemaValidator } from './generate-new-recovery-code';
import { getRecoveryCodeRoute, getRecoveryCodeSchemaValidator } from './get-recovery-code';
import { remove2FARoute, remove2FASchemaValidator } from './remove-2fa';

export const twoFactorAuthRoute = new Hono<HonoVariables>()
    .post(
        '/new',
        newTwoFactorAuthRoute
    )
    .post(
        '/save',
        saveTwoFactorAuthSchemaValidator,
        saveTwoFactorAuthRoute
    )
    .post(
        '/verify',
        verifyTwoFactorAuthSchemaValidator,
        verifyTwoFactorAuthRoute
    )
    .post(
        '/remove-2fa-with-recovery-code',
        removeTwoFactorAuthSchemaValidator,
        removeTwoFactorAuthRoute
    )
    .post(
        '/generate-new-recovery-code',
        generateNewRecoveryCodeSchemaValidator,
        generateNewRecoveryCodeRoute
    )
    .post(
        '/get-recovery-code',
        getRecoveryCodeSchemaValidator,
        getRecoveryCodeRoute
    )
    .post(
        '/remove-2fa',
        remove2FASchemaValidator,
        remove2FARoute
    )