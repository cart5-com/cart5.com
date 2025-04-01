export type HelperBtns = {
    label?: string;
    lat?: number;
    lng?: number;
    type: 'geocode' | 'openstreetmap' | 'ipwhois' | 'GPS';
}


export type GeoLocation = {
    lat?: number;
    lng?: number;
    address?: string;
    country?: string;
};
