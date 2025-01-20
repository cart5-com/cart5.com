export type Point = { lat: number, lng: number };

export type Circle = {
    center: Point;
    radius: number;
};

export type Rectangle = {
    topLeft: Point;
    bottomRight: Point;
};

// export type EstimatedDeliveryTime = {
//     min: number;
//     max: number;
// };

export type DeliveryZone = {
    id: string;
    name?: string;
    hexColor?: string;
    minCart?: number;
    deliveryFee?: number;
    deliveryFeePerKm?: number;
    shapeType: 'polygon' | 'circle' | 'rectangle';
    polygonArea?: Point[];
    circleArea?: Circle;
    rectangleArea?: Rectangle;
    isActive: boolean;
    // estimatedDeliveryTime?: EstimatedDeliveryTime;
};
