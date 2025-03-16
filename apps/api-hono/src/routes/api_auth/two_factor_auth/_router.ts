import { Hono } from 'hono'
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { newTwoFactorAuthRoute } from './new.controller';
import { saveTwoFactorAuthRoute, saveTwoFactorAuthSchemaValidator } from './save.controller';
import { verifyTwoFactorAuthRoute, verifyTwoFactorAuthSchemaValidator } from './verify.controller';
import { removeTwoFactorAuthRoute, removeTwoFactorAuthSchemaValidator } from './remove-2fa-with-recovery-code.controller';
import { generateNewRecoveryCodeRoute, generateNewRecoveryCodeSchemaValidator } from './generate-new-recovery-code.controller';
import { getRecoveryCodeRoute, getRecoveryCodeSchemaValidator } from './get-recovery-code.controller';
import { remove2FARoute, remove2FASchemaValidator } from './remove-2fa.controller';

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