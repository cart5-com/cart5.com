export const calcDiamondShapePolygon = (lat: number, lng: number, radius: number) => {
    return [
        {
            lat: lat - radius,
            lng: lng,
        },
        {
            lat: lat,
            lng: lng - radius,
        },
        {
            lat: lat + radius,
            lng: lng,
        },
        {
            lat: lat,
            lng: lng + radius,
        },
    ];
}