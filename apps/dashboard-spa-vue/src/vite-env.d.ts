/// <reference types="vite/client" />

interface Window {
    USER: import("lib/apiClients/authApiClient").User | null;
}
