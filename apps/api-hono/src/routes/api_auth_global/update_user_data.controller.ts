import { type Context } from 'hono'
import { type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { zValidator } from "@hono/zod-validator";
import { updateUserDataSchema } from "@db/schema/userData.schema";
import { updateUserData_Service } from "@db/services/user_data.service";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { UserAddress } from "@lib/types/UserAddressType";
import { z } from "zod";

export const updateUserDataSchemaValidator = zValidator('json',
    updateUserDataSchema
        .omit({
            // unallowed fields for direct update
            userId: true
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
    ValidatorContext<typeof updateUserDataSchemaValidator>
>) => {
    const user = c.get("USER");
    if (!user) {
        return c.json({
            data: null,
            error: null as ErrorType
        }, 401);
    }

    const {
        // unallowed fields for direct update // double check after validator
        // @ts-ignore
        userId: _userId,

        // other fields are allowed
        ...data
    } = c.req.valid('json');

    return c.json({
        data: await updateUserData_Service(user.id, data),
        error: null as ErrorType
    }, 200);
} 