import { type Context } from 'hono'
import { type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { zValidator } from "@hono/zod-validator";
import { updateUserDataSchema } from "@db/schema/userData.schema";
import { updateUserData_Service } from "@db/services/user_data.service";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";

export const updateUserData_SchemaValidator = zValidator('json',
    updateUserDataSchema
        .omit({
            // unallowed fields for direct update
            userId: true,
            created_at_ts: true,
            updated_at_ts: true,
        })
        // .extend({
        //     // Define proper type for addresses field
        //     addresses: z.array(z.custom<UserAddress>()).optional()
        // })
        .partial()
);

export const updateUserDataRoute = async (c: Context<
    HonoVariables,
    "update_user_data",
    ValidatorContext<typeof updateUserData_SchemaValidator>
>) => {
    const {
        // unallowed fields for direct update // double check after validator
        // @ts-ignore
        userId: _userId, created_at_ts: _created_at_ts, updated_at_ts: _updated_at_ts,
        // other fields are allowed
        ...data
    } = c.req.valid('json');
    const user = c.get("USER");
    return c.json({
        data: await updateUserData_Service(user!.id, data),
        error: null as ErrorType
    }, 200);
} 