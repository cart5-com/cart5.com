/// DELIVERY ZONES START
export type Point = {
    lat?: number,
    lng?: number
};

export type Circle = {
    center?: Point;
    radius?: number;
};

export type Rectangle = {
    topLeft?: Point;
    bottomRight?: Point;
};

export type DeliveryZone = {
    id?: string;
    name?: string;
    minCart?: number;
    deliveryFee?: number;
    deliveryFeePerKm?: number;
    shapeType?: 'polygon' | 'circle' | 'rectangle';
    polygonArea?: Point[];
    circleArea?: Circle;
    rectangleArea?: Rectangle;
    isActive?: boolean;
};
/// DELIVERY ZONES END



/// OPEN HOURS START
export type OpenHours = {
    open?: string;
    close?: string;
};

export type hoursDay = {
    isOpen24?: boolean;
    hours?: OpenHours[];
};

export type WeeklyHours = {
    isActive?: boolean;
    days?: {
        "0"?: hoursDay | undefined; // sunday
        "1"?: hoursDay | undefined; // monday
        "2"?: hoursDay | undefined; // tuesday
        "3"?: hoursDay | undefined; // wednesday
        "4"?: hoursDay | undefined; // thursday
        "5"?: hoursDay | undefined; // friday
        "6"?: hoursDay | undefined; // saturday
    };
};
/// OPEN HOURS END


/// PAYMENT METHODS START

// Payments that happen in-person with physical presence
// cash or (Card+Terminal/Card Reader)
// (at pickup counter) /(at delivery address with delivery person's device or cash)/(at restaurant)
export type CustomPaymentMethod = {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
}

export type PhysicalPaymentMethods = {
    isActive: boolean; // if not active will use defaultPaymentMethods
    cash: boolean;
    cardTerminal: boolean;
    customMethods: CustomPaymentMethod[];
};
/// PAYMENT METHODS END



/// TAX SETTINGS START
export type TaxDetails = {
    salesTaxType: 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES' | 'APPLY_TAX_ON_TOP_OF_PRICES';
    taxName: string; // VAT, HST, GST, etc
    taxCategories: {
        id: string;
        name: string;
        deliveryRate: number;
        pickupRate: number;
        onPremiseRate: number;
    }[];
    taxRateForDelivery: number; // 13, 5, etc,
}
/// TAX SETTINGS END




/// SCHEDULED ORDERS SETTINGS START
export type timeForm = {
    timeValue: number;
    timeUnit: 'minutes' | 'hours' | 'days';
}
export type ScheduledOrdersSettings = {
    min: timeForm;
    max: timeForm;
    slot_interval: timeForm;
};
/// SCHEDULED ORDERS SETTINGS END

