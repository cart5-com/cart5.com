import "@/index.css";
import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { getUserData } from '@src/stores/userStore';

getUserData().then(() => {
    const app = createApp(App);
    app.use(router);
    app.mount('#app');
})

