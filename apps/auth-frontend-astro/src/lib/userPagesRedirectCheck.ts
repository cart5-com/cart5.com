import { ROUTES } from "@root/const";
import { $isUserReady, $userStore } from "@root/stores/userStore";

async function userPagesRedirectCheck() {
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


const unsubscribe = $isUserReady.subscribe(function (ready) {
    if (ready) {
        userPagesRedirectCheck();
        setTimeout(function () {
            document.body.classList.remove("hidden");
            unsubscribe();
        });
    }
});