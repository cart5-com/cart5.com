import "@/index.css";
import { createApp } from 'vue'
import { getLoginUrl } from "lib/clientUtils/getAuthOrigin";
import App from './App.vue'
import { createAuthApiClient } from 'lib/apiClients/authApiClient';

export const getUser = async function () {
    window.USER = (await (await createAuthApiClient().api.user.whoami.$post()).json()).data;
    if (!window.USER) {
        window.location.href = getLoginUrl(import.meta.env.VITE_PUBLIC_DOMAIN_NAME);
    }
    return window.USER;
};

getUser().then(() => {
    const app = createApp(App);
    app.mount('#app');
});
