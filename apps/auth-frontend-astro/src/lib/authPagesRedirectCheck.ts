import { ROUTES } from "@root/const";
import { $isUserReady, $userStore, getUserData } from "@root/stores/userStore";

async function authPagesRedirectCheck() {
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

const unsubscribe = $isUserReady.subscribe(function (ready) {
    if (ready) {
        authPagesRedirectCheck();
        setTimeout(function () {
            document.body.classList.remove("hidden");
            unsubscribe();
        });
    }
});

getUserData();