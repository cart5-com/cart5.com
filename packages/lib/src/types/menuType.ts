
export type ItemId = string;

export type ParentItemId = ItemId;

export type Item = {
    id?: ItemId;
    lbl?: string; // label, title, name
    dsc?: string; // description
    prc?: number; // price

    cIds?: ItemId[]; // children ids

    opPrc?: number; // option price

    chrgAbvQ?: number; // charge above quantity

    defQ?: number; // pre selected/default quantity

    maxQ?: number; // max quantity
    minQ?: number; // min quantity

    // type
    // item, category, customization, option
    // item:i, category:ct, customization:c, option:o
    // i, ct, c, o
    t?: 'i' | 'ct' | 'c' | 'o';

    // imgUrl?: string;
}

export type CartChildrenItemState = {
    itemId?: ItemId;
    childrenState?: ({
        itemId?: ItemId;
        quantity?: number;
        childrenState?: (CartChildrenItemState[])[];
    } | null)[];
}

export type CartItem = {
    itemId?: ItemId;
    quantity?: number;
    childrenState?: CartChildrenItemState[];
}

export type MenuRoot = {
    children?: ItemId[];
    allItems?: Record<string, Item>;
}
