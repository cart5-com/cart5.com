import { z } from 'zod';

export const PointSchema = z.object({
    lat: z.number().optional(),
    lng: z.number().optional()
});

export const CircleSchema = z.object({
    center: PointSchema.optional(),
    radius: z.number().optional()
});

export const RectangleSchema = z.object({
    topLeft: PointSchema.optional(),
    bottomRight: PointSchema.optional()
});

export const DeliveryZoneSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    minCart: z.number().optional(),
    deliveryFee: z.number().optional(),
    deliveryFeePerKm: z.number().optional(),
    shapeType: z.enum(['polygon', 'circle', 'rectangle']).optional(),
    polygonArea: z.array(PointSchema).optional(),
    circleArea: CircleSchema.optional(),
    rectangleArea: RectangleSchema.optional(),
    isActive: z.boolean().optional()
});

export type Point = z.infer<typeof PointSchema>;
export type Circle = z.infer<typeof CircleSchema>;
export type Rectangle = z.infer<typeof RectangleSchema>;
export type DeliveryZone = z.infer<typeof DeliveryZoneSchema>;