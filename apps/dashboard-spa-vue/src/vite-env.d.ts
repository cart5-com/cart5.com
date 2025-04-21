/// <reference types="vite/client" />
/// <reference types="@types/leaflet-draw" />

interface Window {
    USER: import("@lib/types/UserType").User | undefined;
    // L: typeof import('@types/leaflet-draw');
}
