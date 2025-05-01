import { z } from "zod";

// Define interface for CartChildrenItemState for better type safety
export interface CartChildrenItemStateType {
    itemId?: string;
    childrenState?: (ChildStateItem | null)[];
}

interface ChildStateItem {
    itemId?: string;
    quantity?: number;
    childrenState?: CartChildrenItemStateType[][];
}

// CartChildrenItemState schema with recursive type handling
export const cartChildrenItemStateSchema: z.ZodType<CartChildrenItemStateType> = z.lazy(() =>
    z.object({
        itemId: z.string().optional(),
        childrenState: z.array(
            z.union([
                z.object({
                    itemId: z.string().optional(),
                    quantity: z.number().optional(),
                    childrenState: z.array(z.array(cartChildrenItemStateSchema)).optional(),
                }),
                z.null()
            ])
        ).optional(),
    })
);

// CartItem schema
export const cartItemSchema = z.object({
    itemId: z.string().optional(),
    quantity: z.number().optional(),
    childrenState: z.array(
        z.union([
            cartChildrenItemStateSchema,
            z.null()
        ])
    ).optional(),
});

export type CartChildrenItemState = z.infer<typeof cartChildrenItemStateSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;

// Cart schema
export const cartSchema = z.object({
    storeId: z.string().optional(),
    host: z.string().optional(),
    lastUpdatedTS: z.number().optional(),
    storeName: z.string().optional(),
    storeAddress1: z.string().optional(),
    orderNote: z.string().max(510).optional(),
    // items: z.array(cartItemSchema).optional() // causes circular deep shit
    // items: z.custom<CartItem[]>((val) => { // same issue: causes circular deep shit
    items: z.custom<any[]>((val) => {
        // Check if it's an array first
        if (!Array.isArray(val)) {
            return false;
        }

        // Validate each item against cartItemSchema
        return val.every(item => cartItemSchema.safeParse(item).success);
    }).optional(),
});
// Carts schema (a record of Cart objects)
export const cartsSchema = z.record(z.string(), cartSchema).nullable();
export type Cart = z.infer<typeof cartSchema>;
export type Carts = z.infer<typeof cartsSchema>;

// type Cart = {
//     storeId?: string;
//     host?: string;
//     lastUpdatedTS?: number;
//     storeName?: string;
//     orderNote?: string;
//     items?: CartItem[];
// }
// export type Carts = Record<string, Cart>;

// const cartItem: CartItem = {
//     "itemId": "item-2",
//     "quantity": 1,
//     "childrenState": [
//         {
//             "itemId": "customization-3",
//             "childrenState": [
//                 {
//                     "itemId": "option-4",
//                     "quantity": 33,
//                     "childrenState": [
//                         [
//                             {
//                                 "itemId": "customization-2",
//                                 "childrenState": [
//                                     null
//                                 ]
//                             }
//                         ]
//                     ]
//                 }
//             ]
//         },
//         {
//             "itemId": "customization-5",
//             "childrenState": [
//                 {
//                     "itemId": "option-8",
//                     "quantity": 1,
//                     "childrenState": [
//                         [
//                             {
//                                 "itemId": "customization-6",
//                                 "childrenState": [
//                                     {
//                                         "itemId": "option-9",
//                                         "quantity": 1,
//                                         "childrenState": [
//                                             [
//                                                 {
//                                                     "itemId": "customization-7",
//                                                     "childrenState": [
//                                                         {
//                                                             "itemId": "option-10",
//                                                             "quantity": 2
//                                                         }
//                                                     ]
//                                                 }
//                                             ]
//                                         ]
//                                     }
//                                 ]
//                             }
//                         ]
//                     ]
//                 }
//             ]
//         },
//         {
//             "itemId": "customization-56",
//             "childrenState": [
//                 {
//                     "itemId": "option-211",
//                     "quantity": 1
//                 },
//                 {
//                     "itemId": "option-212",
//                     "quantity": 1
//                 },
//                 {
//                     "itemId": "option-213",
//                     "quantity": 1
//                 },
//                 {
//                     "itemId": "option-214",
//                     "quantity": 1
//                 },
//                 {
//                     "itemId": "option-215",
//                     "quantity": 1
//                 },
//                 {
//                     "itemId": "option-216",
//                     "quantity": 2
//                 },
//                 {
//                     "itemId": "option-217",
//                     "quantity": 1
//                 }
//             ]
//         }
//     ]
// }

// const item2: CartItem = {
//     "itemId": "item-1",
//     "quantity": 1,
//     "childrenState": [
//         {
//             "itemId": "customization-1",
//             "childrenState": [
//                 null,
//                 {
//                     "itemId": "option-3",
//                     "quantity": 1,
//                     "childrenState": [
//                         [
//                             {
//                                 "itemId": "customization-2",
//                                 "childrenState": [
//                                     {
//                                         "itemId": "option-2",
//                                         "quantity": 1
//                                     }
//                                 ]
//                             }
//                         ]
//                     ]
//                 }
//             ]
//         }
//     ]
// }

// console.log("cartItemSchema.safeParse(cartItem)");
// console.log(cartItemSchema.safeParse(cartItem));
// console.log("cartItemSchema.safeParse(item2)");
// console.log(cartItemSchema.safeParse(item2));