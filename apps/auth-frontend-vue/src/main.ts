import "@/index.css";
import { createApp } from 'vue'
import App from './App.vue'
import { refreshUserData } from '@src/stores/userStore';
import { refreshQueryParams } from "./stores/queryParamsStore";
refreshQueryParams();
refreshUserData().then(() => {
    const app = createApp(App);
    app.mount('#app');
})

