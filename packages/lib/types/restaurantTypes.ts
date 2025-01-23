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


/// SCHEDULED ORDERS SETTINGS START
export type timeForm = {
    timeValue: number;
    timeUnit: 'minutes' | 'hours' | 'days';
}
export type ScheduledOrdersSettings = {
    pickup_min: timeForm;
    pickup_max: timeForm;
    pickup_slot_interval: timeForm;
    delivery_min: timeForm;
    delivery_max: timeForm;
    delivery_slot_interval: timeForm;
};
/// SCHEDULED ORDERS SETTINGS END

