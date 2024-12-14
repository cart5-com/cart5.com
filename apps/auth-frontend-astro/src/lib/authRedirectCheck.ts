import { ROUTES } from "@root/const";
import { waitUntilUserReady, $userStore } from "@root/stores/userStore";

async function authRedirectCheck() {
    await waitUntilUserReady();
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

authRedirectCheck();


