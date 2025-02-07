
export type ItemId = string;

export type ParentItemId = ItemId;

export type Item = {
    itemId?: ItemId;
    itemLabel?: string;
    price?: number;
    priceOverrides?: Record<ParentItemId, number>;
    children?: ItemId[];
}

export type BucketChildrenState = {
    itemId?: ItemId;
    childrenState?: Record<ItemId, {
        quantity?: number;
        childrenState?: (BucketChildrenState[])[];
    }>;
}

export type BucketItem = {
    itemId?: ItemId;
    quantity?: number;
    childrenState?: BucketChildrenState[];
}

export type RootState = {
    children?: ItemId[];
    allItems?: Record<string, Item>;
}