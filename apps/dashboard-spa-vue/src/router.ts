import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from './views/HomeView.vue'
// import { useDialog } from '@/ui-plus/dialog/use-dialog'

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
      component: () => import('@src/views/HomeView.vue'),
    },
    // BUSINESS ROUTES
    // {
    //   path: '/business-new',
    //   name: 'business-new',
    //   component: () => import('@src/pages/business/BusinessNewView.vue'),
    // },
    // {
    //   path: '/business',
    //   name: 'business',
    //   component: () => import('@src/pages/business/BusinessListView.vue'),
    // },
    // {
    //   path: '/business/:businessId',
    //   component: () => import('@src/pages/BusinessLayout.vue'),
    //   children: [
    //     {
    //       path: '',
    //       name: 'business-home',
    //       component: () => import('@src/pages/business/BusinessHomeView.vue'),
    //     },
    //     {
    //       path: 'address-form',
    //       name: 'business-address-form',
    //       component: () => import('@src/pages/business/BusinessNameAddress.vue'),
    //     },
    //     {
    //       path: 'menu',
    //       name: 'business-menu',
    //       component: () => import('@src/pages/business/MenuView.vue'),
    //     },
    //   ],
    // },

    // // WEBSITE ROUTES
    // {
    //   path: '/website',
    //   name: 'website',
    //   redirect: { name: 'website-home', params: { websiteId: '1111' } },
    // },
    // {
    //   path: '/website/:websiteId',
    //   name: 'website-id',
    //   component: () => import('@src/pages/WebsiteLayout.vue'),
    //   children: [
    //     {
    //       path: '',
    //       name: 'website-home',
    //       component: () => import('@src/pages/website/WebsiteHomeView.vue'),
    //     },
    //     {
    //       path: 'colors',
    //       name: 'website-colors',
    //       component: () => import('@src/pages/website/ColorsView.vue'),
    //     },
    //   ],
    // },
  ],
  strict: true,
})

// let loadingId: string | null = null
// Add navigation guards
// router.beforeEach((_to, _from, next) => {
//   const { showBlockingLoadingModal } = useDialog()
//   loadingId = showBlockingLoadingModal()
//   next()
// })

// router.afterEach(() => {
//   const { close } = useDialog()
//   setTimeout(() => {
//     if (loadingId) {
//       close(loadingId)
//       loadingId = null
//     }
//     window.focusActiveLink();
//   }, 100)
// })

export default router
