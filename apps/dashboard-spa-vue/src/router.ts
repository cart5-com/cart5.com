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
      component: () => import('@src/pages/HomeView.vue'),
    },
    // RESTAURANT ROUTES
    {
      path: '/my-restaurants',
      name: 'my-restaurants',
      component: () => import('@src/pages/MyRestaurantsView.vue'),
    },
    {
      path: '/restaurant/:restaurantId',
      name: 'restaurant',
      component: () => import('@src/layouts/restaurant/_Layout.vue'),
      children: [
        {
          path: '',
          name: 'restaurant-home',
          component: () => import('@src/pages/restaurant/HomeView.vue'),
        },
        {
          path: 'name-phone',
          name: 'restaurant-name',
          component: () => import('@src/pages/restaurant/NamePhoneView.vue'),
        },
        {
          path: 'address',
          name: 'restaurant-address',
          component: () => import('@src/pages/restaurant/AddressView.vue'),
        },
        {
          path: 'cuisine',
          name: 'restaurant-cuisine',
          component: () => import('@src/pages/restaurant/CuisineView.vue'),
        },
        {
          path: 'pickup',
          name: 'restaurant-pickup',
          component: () => import('@src/pages/restaurant/PickupView.vue'),
        },
        {
          path: 'delivery-options',
          name: 'restaurant-delivery-options',
          component: () => import('@src/pages/restaurant/DeliveryZonesView.vue'),
        },
      ],
    },
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
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: { name: 'home' }
    }
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
