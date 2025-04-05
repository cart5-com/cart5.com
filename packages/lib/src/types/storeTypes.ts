

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





