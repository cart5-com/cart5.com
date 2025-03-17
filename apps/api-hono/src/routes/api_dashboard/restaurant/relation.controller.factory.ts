import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { restaurantRelationService } from "@db/services/restaurant.relation.service";


// import { selectRestaurantMenuSchema } from "@db/schema/restaurant.schema";
// import { createRestaurantRelationController } from "./relation.controller.factory";

// // Create controller for getting restaurant menu details using the factory
// const { schemaValidator: getRestaurantMenu_SchemaValidator, handler: getRestaurantMenu_Handler } =
//     createRestaurantRelationController('menu', selectRestaurantMenuSchema, "/:restaurantId/menu");

// // Export the generated schema validator and handler
// export { getRestaurantMenu_SchemaValidator, getRestaurantMenu_Handler };

/**
 * Factory function to create schema validators and handlers for restaurant relations
 * 
 * @param relationName The name of the relation (must match a key in restaurantRelationService)
 * @param selectSchema The schema used for validation
 * @param routePath The route path parameter (e.g., "/:restaurantId/menu")
 * @returns An object containing the schema validator and handler
 */
export function createRestaurantRelationController<T extends Record<string, any>>(
    relationName: keyof typeof restaurantRelationService,
    selectSchema: T,
    routePath: string
) {
    // Create schema validator
    const schemaValidator = zValidator('json', z.object({
        columns: z.object(
            Object.fromEntries(
                Object.keys(selectSchema.shape)
                    .map(key => [key, z.boolean().optional()])
            )
        )
    }));

    // Create handler
    const handler = async (c: Context<
        HonoVariables,
        typeof routePath,
        ValidatorContext<typeof schemaValidator>
    >) => {
        const restaurantId = c.req.param('restaurantId');
        if (!restaurantId) {
            return c.json({
                data: null,
                error: { message: 'Restaurant ID is required' } as ErrorType
            }, 400);
        }

        return c.json({
            data: await restaurantRelationService[relationName].get(
                restaurantId,
                c.req.valid('json').columns
            ),
            error: null as ErrorType
        }, 200);
    };

    return {
        schemaValidator,
        handler
    };
}




// import { updateRestaurantMenuSchema } from "@db/schema/restaurant.schema";
// import { createRestaurantRelationUpdateController } from "./relation.controller.factory";

// // Create controller for updating restaurant menu using the factory
// const { schemaValidator: updateRestaurantMenu_SchemaValidator, handler: updateRestaurantMenu_Handler } =
//     createRestaurantRelationUpdateController(
//         'menu',
//         updateRestaurantMenuSchema.omit({
//             // unallowed fields for admins
//             restaurantId: true
//         }).partial(),
//         "/:restaurantId/menu"
//     );

// // Export the generated schema validator and handler
// export { updateRestaurantMenu_SchemaValidator, updateRestaurantMenu_Handler };

/**
 * Factory function to create schema validators and handlers for updating restaurant relations
 * 
 * @param relationName The name of the relation (must match a key in restaurantRelationService)
 * @param updateSchema The schema used for validation
 * @param routePath The route path parameter (e.g., "/:restaurantId/menu")
 * @returns An object containing the schema validator and handler
 */
export function createRestaurantRelationUpdateController<T extends z.ZodType>(
    relationName: keyof typeof restaurantRelationService,
    updateSchema: T,
    routePath: string
) {
    // Create schema validator
    const schemaValidator = zValidator('json', updateSchema);

    // Create handler
    const handler = async (c: Context<
        HonoVariables,
        typeof routePath,
        ValidatorContext<typeof schemaValidator>
    >) => {
        const restaurantId = c.req.param('restaurantId');
        if (!restaurantId) {
            return c.json({
                data: null,
                error: { message: 'Restaurant ID is required' } as ErrorType
            }, 400);
        }

        const {
            // Prevent restaurantId from being overridden
            // @ts-ignore
            restaurantId: _restaurantId,

            // Other fields are allowed
            ...data
        } = c.req.valid('json');

        return c.json({
            data: await restaurantRelationService[relationName].update(restaurantId, data),
            error: null as ErrorType
        }, 200);
    };

    return {
        schemaValidator,
        handler
    };
} 