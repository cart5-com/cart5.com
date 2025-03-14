import "@/index.css";
import { createApp } from 'vue'
import { getLoginUrl } from "lib/clientUtils/getAuthOrigin";
import App from './App.vue'
import { createAuthGlobalApiClient } from 'lib/hono/apiClients/authApiClient';
import router from './router'

export const getUser = async function () {
    const { data, error } = await (await createAuthGlobalApiClient().api_auth_global.whoami.$post()).json();
    if (error) {
        console.error(error);
    }
    if (data === null) {
        window.location.href = getLoginUrl(import.meta.env.VITE_PUBLIC_DOMAIN_NAME);
        return null;
    } else {
        return data;
    }
};

getUser()
    .then((user) => {
        if (user) {
            window.USER = user;
            const app = createApp(App);
            app.use(router);
            app.mount('#app');
        }
    });
