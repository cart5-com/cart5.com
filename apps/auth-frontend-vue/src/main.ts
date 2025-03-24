import "@/index.css";
import * as Sentry from "@sentry/vue";
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import { refreshUserData } from '@auth-frontend-vue/stores/userStore';
import { getQueryParams, queryParamsStore } from "./stores/queryParamsStore";


const queryParams = getQueryParams();
queryParamsStore.value = queryParams;
const i18n = createI18n({
    legacy: false,
    locale: queryParams.lang || 'en',
    fallbackLocale: 'en',
    messages: {
        en: {
            logout: 'Logout',
            login: 'Login',
            signup: 'Sign Up',
            otp: 'OTP',
            settings: 'Settings',
            goBackTo: 'Go back to {hostname}',
            continueWithGoogle: 'Continue with Google',
            passwordsMustMatch: "Passwords must match",
            freshSessionRequired: "Fresh session required",
            pleaseLogoutAndLoginAgain: "Please logout and login again",
            passwordUpdated: "Password updated",
            yourEmail: "Your email",
            newPassword: "New password",
            confirmPassword: "Confirm password",
            update: "Update",
            cancel: "Cancel",
            security: "Security",
        },
        tr: {
            logout: 'Çıkış Yap',
            login: 'Giriş Yap',
            signup: 'Kayıt Ol',
            otp: 'OTP',
            settings: 'Ayarlar',
            goBackTo: '{hostname}\'e geri dön',
            continueWithGoogle: 'Google ile devam et',
            passwordsMustMatch: "Şifreler eşleşmelidir",
            freshSessionRequired: "yeni oturum gerekli",
            pleaseLogoutAndLoginAgain: "Lütfen çıkış yapın ve tekrar giriş yapın",
            passwordUpdated: "Şifre güncellendi",
            yourEmail: "E-posta adresiniz",
            newPassword: "Yeni şifre",
            confirmPassword: "Şifreyi tekrar girin",
            update: "Güncelle",
            cancel: "İptal",
            security: "Güvenlik",
        },
        es: {
            logout: 'Cerrar sesión',
            login: 'Iniciar sesión',
            signup: 'Registrarse',
            otp: 'OTP',
            settings: 'Configuración',
            goBackTo: 'Volver a {hostname}',
            continueWithGoogle: 'Continuar con Google',
            passwordsMustMatch: "Las contraseñas deben coincidir",
            freshSessionRequired: "Nueva sesión requerida",
            pleaseLogoutAndLoginAgain: "Por favor cierre la sesión y vuelva a iniciar sesión",
            passwordUpdated: "Contraseña actualizada",
            yourEmail: "Su correo electrónico",
            newPassword: "Nueva contraseña",
            confirmPassword: "Confirmar contraseña",
            update: "Actualizar",
            cancel: "Cancelar",
            security: "Seguridad",
        }
    }
});

refreshUserData().then(() => {
    const app = createApp(App);
    Sentry.init({
        app,
        dsn: "https://ebdb35d9ab81ac229ec1c04dc67518d0@o4509024863518720.ingest.us.sentry.io/4509025435189248"
    });
    app.use(i18n)
    app.mount('#app');
})

