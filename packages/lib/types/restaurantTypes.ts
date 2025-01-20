export type Point = { lat: number, lng: number };

export type Circle = {
    center: Point;
    radius: number;
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
    shapeType: 'polygon' | 'circle';
    polygonArea?: Point[];
    circleArea?: Circle;
    isActive: boolean;
    // estimatedDeliveryTime?: EstimatedDeliveryTime;
};
