import { z } from "zod";

// Define interface for CartChildrenItemState for better type safety
interface CartChildrenItemStateType {
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
    childrenState: z.array(cartChildrenItemStateSchema).optional(),
});

// Collection of cart items
// export const cartItemsSchema = z.array(cartItemSchema);
// export type CartItems = z.infer<typeof cartItemsSchema>;

export type CartChildrenItemState = z.infer<typeof cartChildrenItemStateSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
