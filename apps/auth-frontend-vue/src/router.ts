import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from './const'
import { $userStore } from './stores/userStore'
import LoginView from './views/auth/LoginView.vue'
import SignupView from './views/auth/SignupView.vue'
import OtpView from './views/auth/OtpView.vue'
import SettingsView from './views/user/SettingsView.vue'
import AskView from './views/user/AskView.vue'

const router = createRouter({
    scrollBehavior(_to, _from, _savedPosition) {
        if (_savedPosition) {
            return _savedPosition
        } else {
            return { top: 0 }
        }
    },
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/signup',
            name: 'signup',
            component: SignupView
        },
        {
            path: '/otp',
            name: 'otp',
            component: OtpView
        },
        {
            path: '/user/settings',
            name: 'user-settings',
            component: SettingsView
        },
        {
            path: '/user/ask',
            name: 'user-ask',
            component: AskView
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: to => {
                return {
                    path: '/login',
                    query: {
                        ...to.query,
                        pathname: '/user/settings'
                    }
                }
            }
        }
    ]
})

router.beforeEach((to, _from) => {
    const user = $userStore.get()
    const isAuthRoute = [
        ROUTES.LOGIN,
        ROUTES.SIGNUP,
        ROUTES.OTP
    ].includes(to.path)

    // Non-authenticated users trying to access protected routes
    if (!user && !isAuthRoute) {
        console.log('to.fullPath:', to.fullPath);
        console.log('to.path:', to.path);
        const query = {
            ...to.query,
            pathname: to.path === '/' ? '/user/settings' : to.path
        } // Save the intended destination
        return {
            path: ROUTES.LOGIN,
            query
        }
    }

    // Authenticated users trying to access auth routes
    if (user && isAuthRoute) {
        // Redirect to saved pathname or default to settings
        const pathname = to.query.pathname?.toString()
        if (pathname) {
            const { pathname: _, ...query } = to.query // Remove pathname from query
            return {
                path: pathname,
                query
            }
        }
        return {
            path: ROUTES.USER.SETTINGS,
            query: to.query
        }
    }
})

export default router