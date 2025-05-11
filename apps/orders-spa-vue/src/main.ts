import "@/index.css";
import * as Sentry from "@sentry/vue";
import { createApp } from 'vue'
import { getLoginUrl } from "@lib/clientUtils/getAuthOrigin";
import App from './App.vue'
import { authGlobalApiClient } from '@api-client/auth_global';
import router from './router'

export const getUser = async function () {
    const { data, error } = await (await authGlobalApiClient.whoami.$post()).json();
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
            if (import.meta.env.PROD) {
                Sentry.init({
                    app,
                    dsn: "https://777dc381fa51711fceabc8ad5ff3ab18@o4509024863518720.ingest.us.sentry.io/4509266332876800",
                    sendDefaultPii: true
                });
            }
            app.use(router);
            app.mount('#app');
        }
    });
