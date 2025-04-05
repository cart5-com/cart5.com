import { z } from 'zod';

export const ItemSchema = z.object({
    id: z.string().optional(),
    lbl: z.string().optional(), // label, title, name
    dsc: z.string().optional(), // description
    prc: z.number().optional(), // price
    pickupPrc: z.number().optional(), // pickup price

    cIds: z.array(z.string()).optional(), // children ids

    opPrc: z.number().optional(), // option price

    chrgAbvQ: z.number().optional(), // charge above quantity

    defQ: z.number().optional(), // pre selected/default quantity

    maxQ: z.number().optional(), // max quantity
    minQ: z.number().optional(), // min quantity

    // type
    // item, category, customization, option
    // item:i, category:ct, customization:c, option:o
    // i, ct, c, o
    t: z.enum(['i', 'ct', 'c', 'o']).optional(), // type

    // tax settings
    taxCatId: z.string().optional(), // tax category id

    // imgUrl?: string;
});

export const MenuRootSchema = z.object({
    children: z.array(z.string()).optional(),
    allItems: z.record(z.string(), ItemSchema).optional(),
});

export type Item = z.infer<typeof ItemSchema>;
export type MenuRoot = z.infer<typeof MenuRootSchema>;
export type ItemId = string;
export type ParentItemId = ItemId;
