/// <reference types="vite/client" />
/// <reference types="@types/leaflet-draw" />

interface Window {
    USER: import("lib/apiClients/authApiClient").User | null;
    // L: typeof import('@types/leaflet-draw');
}
