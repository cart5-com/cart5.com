import { createAuthGlobalApiClient } from "lib/hono/apiClients/authApiClient";
import { getLoginUrl, getSettingsUrl, getSignupUrl } from "lib/clientUtils/getAuthOrigin";
// this only provides the hono/client with typing
// https://hono.dev/docs/guides/rpc
// it does not include any server code, 
// run pnpm build to see the generated codes, (astro.config.vite.build.minify=false)

const clientGlobal = createAuthGlobalApiClient();
const whoAmI = async () => {
    const { data, error } = await (await clientGlobal.api_auth_global.whoami.$post()).json();
    console.log(data, error);
    const whoamiResult = document.getElementById("whoami-result") as HTMLPreElement;
    whoamiResult.textContent = JSON.stringify(data, null, 2);
    if (data) {
        logoutButton.classList.remove("hidden");
        manageAccountButton.classList.remove("hidden");
        loginButton.classList.add("hidden");
        registerButton.classList.add("hidden");
    } else {
        logoutButton.classList.add("hidden");
        manageAccountButton.classList.add("hidden");
        loginButton.classList.remove("hidden");
        registerButton.classList.remove("hidden");
    }
}

whoAmI();

const whoamiButton = document.getElementById("whoami-button") as HTMLButtonElement;
whoamiButton.addEventListener("click", whoAmI);

const registerButton = document.getElementById("register-button") as HTMLButtonElement;
registerButton.addEventListener("click", async () => {
    window.location.href = getSignupUrl(import.meta.env.PUBLIC_DOMAIN_NAME);
});

const loginButton = document.getElementById("login-button") as HTMLButtonElement;
loginButton.addEventListener("click", async () => {
    window.location.href = getLoginUrl(import.meta.env.PUBLIC_DOMAIN_NAME);
});

const logoutButton = document.getElementById("logout-button") as HTMLButtonElement;
logoutButton.addEventListener("click", async () => {
    const { data, error } = await (await clientGlobal.api_auth_global['logout-all'].$post()).json();
    console.log(data, error);
    window.location.reload();
});

const manageAccountButton = document.getElementById("manage-account-button") as HTMLButtonElement;
manageAccountButton.addEventListener("click", async () => {
    window.location.href = getSettingsUrl(import.meta.env.PUBLIC_DOMAIN_NAME);
});

