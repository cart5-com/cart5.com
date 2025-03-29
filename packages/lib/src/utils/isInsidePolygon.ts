import type { Point } from "@lib/types/storeTypes";

export function isInsidePolygon(point: Point, path: Point[]) {
    // ray-casting algorithm
    const x = point.lat!;
    const y = point.lng!;
    const pathArray = path.map(function (point) {
        return [point.lat, point.lng]
    });
    let inside = false;
    for (var i = 0, j = path.length - 1; i < path.length; j = i++) {
        const xi = pathArray[i]![0]!;
        const yi = pathArray[i]![1]!;
        const xj = pathArray[j]![0]!;
        const yj = pathArray[j]![1]!;
        const intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}