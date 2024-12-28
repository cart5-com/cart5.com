import { createAuthApiClient } from "lib/apiClients/authApiClient";
// this only provides the hono/client with typing
// https://hono.dev/docs/guides/rpc
// it does not include any server code, 
// run pnpm build to see the generated codes, (astro.config.vite.build.minify=false)

const client = createAuthApiClient();

const whoAmI = async () => {
    const { data, error } = await (await client.api.user.whoami.$post()).json();
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
    window.location.href = `https://auth.${import.meta.env.PUBLIC_DOMAIN_NAME}/signup?next=${encodeURIComponent(
        window.location.href
    )}`;
});

const loginButton = document.getElementById("login-button") as HTMLButtonElement;
loginButton.addEventListener("click", async () => {
    window.location.href = `https://auth.${import.meta.env.PUBLIC_DOMAIN_NAME}/user/ask?next=${encodeURIComponent(
        window.location.href
    )}`;
});

const logoutButton = document.getElementById("logout-button") as HTMLButtonElement;
logoutButton.addEventListener("click", async () => {
    const { data, error } = await (await client.api.user.logout.$post()).json();
    console.log(data, error);
    window.location.reload();
});

const manageAccountButton = document.getElementById("manage-account-button") as HTMLButtonElement;
manageAccountButton.addEventListener("click", async () => {
    window.location.href = `https://auth.${import.meta.env.PUBLIC_DOMAIN_NAME}/user/settings?next=${encodeURIComponent(
        window.location.href
    )}`;
});
