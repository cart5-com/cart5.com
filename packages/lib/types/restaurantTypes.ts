import type { WeeklySchedule } from "./dateTimeType";
/// OPEN HOURS START
export type WeeklyHours = {
    isActive?: boolean;
    days?: WeeklySchedule;
};
/// OPEN HOURS END





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






/// PAYMENT METHODS START

// Payments that happen in-person with physical presence
// cash or (Card+Terminal/Card Reader)
// (at pickup counter) /(at delivery address with delivery person's device or cash)/(at restaurant)
export type CustomPaymentMethod = {
    id?: string;
    name?: string;
    description?: string;
    isActive?: boolean;
}

export type PhysicalPaymentMethods = {
    isActive?: boolean; // if not active will use defaultPaymentMethods
    cash?: boolean;
    cardTerminal?: boolean;
    customMethods?: CustomPaymentMethod[];
};
/// PAYMENT METHODS END





/// TAX SETTINGS START
export type TaxCategory = {
    id?: string;
    name?: string;
    deliveryRate?: number;
    pickupRate?: number;
    onPremiseRate?: number;
    tableReservationRate?: number;
}
/// TAX SETTINGS END







/// SCHEDULED ORDERS SETTINGS START
export type TimeForm = {
    timeValue?: number;
    timeUnit?: 'minutes' | 'hours' | 'days';
}
export type ScheduledOrdersSettings = {
    min?: TimeForm;
    max?: TimeForm;
    slot_interval?: TimeForm;
};
/// SCHEDULED ORDERS SETTINGS END

