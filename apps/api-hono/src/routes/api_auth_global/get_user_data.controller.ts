import { type Context } from 'hono'
import { type ErrorType } from '@lib/types/errors';
import type { User } from '@lib/types/UserType';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectUserDataSchema } from "@db/schema/userData.schema";
import { getUserData_Service } from "@db/services/user_data.service";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";

export const getUserData_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectUserDataSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    ).optional()
}));

export const getUserDataRoute = async (c: Context<
    HonoVariables,
    "get_user_data",
    ValidatorContext<typeof getUserData_SchemaValidator>
>) => {
    const user = c.get("USER");
    if (!user) {
        return c.json({
            // data: {
            //     user: null,
            //     userData: null,
            // },
            data: null,
            error: null as ErrorType
        }, 200);
    }
    const columns = c.req.valid('json')?.columns || {};
    return c.json({
        // data: {
        //     user: user,
        //     userData: await getUserData_Service(user.id, columns)
        // },
        data: await getUserData_Service(user.id, columns),
        error: null as ErrorType
    }, 200);
}