import "@/index.css";
import * as Sentry from "@sentry/vue";
import { createApp } from 'vue'
import AlwaysTopOnView from './AlwaysTopOnView.vue'

const app = createApp(AlwaysTopOnView);
if (import.meta.env.PROD) {
    console.error("Sentry is not initialized for orders-spa-vue");
    Sentry.init({
        app,
        dsn: "https://777dc381fa51711fceabc8ad5ff3ab18@o4509024863518720.ingest.us.sentry.io/4509266332876800",
        sendDefaultPii: true
    });
}
app.mount('#app');
