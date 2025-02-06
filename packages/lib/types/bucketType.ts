export type BucketItemOptionGroup = {
    optionGroupId?: string;
    selections?: {
        optionId?: string;
        quantity?: number;
        // optionGroups?: BucketItemOptionGroup[];
    }[];
}

export type BucketItem = {
    quantity?: number;
    selectedItemId?: string;
    selectedSizeId?: string;
    sizeOptionGroups?: BucketItemOptionGroup[];
    optionGroups?: BucketItemOptionGroup[];
}

export type Bucket = BucketItem[];
