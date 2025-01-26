/// DELIVERY ZONES START
export type Point = { lat: number, lng: number };

export type Circle = {
    center: Point;
    radius: number;
};

export type Rectangle = {
    topLeft: Point;
    bottomRight: Point;
};

export type DeliveryZone = {
    id: string;
    name?: string;
    minCart?: number;
    deliveryFee?: number;
    deliveryFeePerKm?: number;
    shapeType: 'polygon' | 'circle' | 'rectangle';
    polygonArea?: Point[];
    circleArea?: Circle;
    rectangleArea?: Rectangle;
    isActive: boolean;
};
/// DELIVERY ZONES END



/// OPEN HOURS START
export type OpenHours = {
    open: string;
    close: string;
};

export type hoursDay = {
    isOpen24: boolean;
    hours: OpenHours[];
};

export type WeeklyHours = {
    isActive: boolean; // if not active will use defaultOpenHours
    days: {
        "0": hoursDay; // sunday
        "1": hoursDay; // monday
        "2": hoursDay; // tuesday
        "3": hoursDay; // wednesday
        "4": hoursDay; // thursday
        "5": hoursDay; // friday
        "6": hoursDay; // saturday
    };
};
/// OPEN HOURS END


/// PAYMENT METHODS START
export type PaymentMethodSettings = {
    cash: {
        pickup: boolean;
        delivery: boolean;
        onPremise: boolean;
    }
}
/// PAYMENT METHODS END


/// TABLE RESERVATION SETTINGS START
export type TableReservationSettings = {
    minGuests: number;
    maxGuests: number;
    minTimeInAdvanceMinutes: number;
    maxTimeInAdvanceDays: number;
    lateHoldTimeMinutes: number;
    allowPreOrder: boolean;
}
/// TABLE RESERVATION SETTINGS END


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

