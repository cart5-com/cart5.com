import { ROUTES } from "@root/const";
import { waitUntilUserReady, $userStore } from "@root/stores/userStore";

async function userRedirectCheck() {
    await waitUntilUserReady();
    const user = $userStore.get();
    if (!user) {
        const url = new URL(window.location.href);
        const pathname = url.searchParams.get("pathname");
        if (!pathname) {
            url.searchParams.set("pathname", url.pathname);
        }
        url.pathname = ROUTES.LOGIN;
        window.location.href = url.toString();
    }
}

userRedirectCheck();
