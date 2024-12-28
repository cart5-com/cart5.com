import { ROUTES } from "@src/const";
import { $userStore } from "@src/stores/userStore";

export async function authPagesRedirectCheck() {
    const user = $userStore.get();
    if (user) {
        const url = new URL(window.location.href);
        const pathname = url.searchParams.get("pathname")
        if (pathname) {
            url.pathname = pathname;
        } else {
            url.pathname = ROUTES.USER.SETTINGS;
        }
        url.searchParams.delete("pathname");
        window.location.href = url.toString();
    }
}
