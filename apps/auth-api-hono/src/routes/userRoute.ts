import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { deleteSession, deleteAllUserSessions } from '../db/db-actions/deleteSession';
import { SESSION_COOKIE_NAME } from "lib/auth-consts";
import { deleteCookie } from 'hono/cookie';
import { KNOWN_ERROR, type ErrorType } from 'lib/errors';
import { z } from 'zod';
import { hashPassword, verifyPasswordStrength } from '../utils/password';
import { validateTurnstile } from 'lib/utils/validateTurnstile';
import { getUserByEmail, updateUserName, updateUserPassword } from '../db/db-actions/userActions';
import { getEnvVariable } from 'lib/utils/getEnvVariable';
import type { HonoVariables } from "../index";

export const userRoute = new Hono<HonoVariables>()
    .post(
        '/logout',
        async (c) => {
            const session = c.get('SESSION');
            if (session) {
                await deleteSession(session.id);
                deleteCookie(c, SESSION_COOKIE_NAME);
            }
            return c.json({
                data: "success",
                error: null as ErrorType
            }, 200);
        }
    )
    .post(
        '/logout-all',
        async (c) => {
            const session = c.get('SESSION');
            if (session) {
                await deleteAllUserSessions(session.userId);
                deleteCookie(c, SESSION_COOKIE_NAME);
            }
            return c.json({
                data: "success",
                error: null as ErrorType
            }, 200);
        }
    )
    .post(
        '/whoami',
        async (c) => {
            const user = c.get("USER");
            return c.json({
                data: user,
                error: null as ErrorType
            }, 200);
        }
    )
    .post(
        '/update-password',
        zValidator('form', z.object({
            password: z.string()
                .min(8, { message: "Password must be at least 8 characters" })
                .max(255, { message: "Password must be at most 255 characters" })
                .refine(
                    async (password) => {
                        return await verifyPasswordStrength(password);
                    },
                    { message: "Password is too weak or has been compromised" }
                ),
            turnstile: z.string().min(1, { message: "Verification required" })
        })),
        async (c) => {
            const { turnstile, password } = c.req.valid('form');
            await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
            const user = c.get("USER");
            if (!user || !user.id) {
                throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
            }
            if (!user.hasNewSession) {
                throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
            }
            const savedUser = await getUserByEmail(user.email);
            if (!savedUser) {
                throw new KNOWN_ERROR("Invalid request 1", "INVALID_REQUEST_1");
            }
            await updateUserPassword(user.id, await hashPassword(password));
            return c.json({
                data: "success",
                error: null as ErrorType
            }, 200);
        }
    )
    .post(
        '/update-name',
        zValidator('form', z.object({
            newName: z.string().min(1, { message: "Name is required" }),
            turnstile: z.string().min(1, { message: "Verification required" })
        })),
        async (c) => {
            const { newName, turnstile } = c.req.valid('form');
            await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
            const user = c.get("USER");
            if (!user || !user.id) {
                throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
            }
            if (!user.hasNewSession) {
                throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
            }
            const savedUser = await getUserByEmail(user.email);
            if (!savedUser) {
                throw new KNOWN_ERROR("Invalid request 1", "INVALID_REQUEST_1");
            }
            await updateUserName(user.id, newName);
            return c.json({
                data: "success",
                error: null as ErrorType
            }, 200);
        }
    )