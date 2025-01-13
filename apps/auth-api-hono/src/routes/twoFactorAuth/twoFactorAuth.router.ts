import { Hono } from 'hono'
import type { HonoVariables } from "../../index";
import {
    newTwoFactorAuthRoute,
    saveTwoFactorAuthRoute,
    verifyTwoFactorAuthRoute,
    removeTwoFactorAuthRoute,
    generateNewRecoveryCodeRoute,
    getRecoveryCodeRoute,
    remove2FARoute,
    remove2FASchemaValidator,
    saveTwoFactorAuthSchemaValidator,
    verifyTwoFactorAuthSchemaValidator,
    removeTwoFactorAuthSchemaValidator,
    generateNewRecoveryCodeSchemaValidator,
    getRecoveryCodeSchemaValidator,
} from './twoFactorAuth.controller';

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