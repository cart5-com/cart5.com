export type Item = {
    itemId?: string;
    itemLabel?: string;
    price?: number;
    children?: Item[];
}

export type BucketItem = {
    itemId?: string;
    quantity?: number;
    // selection.length should reflect the quantity
    // because it's an array of array:'BucketItem[]'
    childrenState?: (BucketItem[])[];
}

export type RootState = {
    children?: Item[];
    allItems?: Record<string, Item>;
}