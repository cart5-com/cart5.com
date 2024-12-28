import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from './const'
import { $userStore } from './stores/userStore'

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
            path: '/',
            name: 'home',
            component: () => import('./views/HomeView.vue'),
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('./views/auth/LoginView.vue'),
        },
        {
            path: '/signup',
            name: 'signup',
            component: () => import('./views/auth/SignupView.vue'),
        },
        {
            path: '/otp',
            name: 'otp',
            component: () => import('./views/auth/OtpView.vue'),
        },
        {
            path: '/user/settings',
            name: 'user-settings',
            component: () => import('./views/user/SettingsView.vue'),
        },
        {
            path: '/user/ask',
            name: 'user-ask',
            component: () => import('./views/user/AskView.vue'),
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
        const query = { ...to.query, pathname: to.fullPath } // Save the intended destination
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