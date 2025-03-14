import { createRouter, createWebHistory } from 'vue-router'
import { pageTitle } from './stores/layout.store'
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
      component: () => import('@src/pages/my-restaurants/MyRestaurantsView.vue'),
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
          component: () => import('@src/pages/restaurant/name/NamePhoneView.vue'),
        },
        {
          path: 'address',
          name: 'restaurant-address',
          component: () => import('@src/pages/restaurant/address/AddressView.vue'),
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
          path: 'on-premise',
          name: 'restaurant-on-premise',
          component: () => import('@src/pages/restaurant/OnPremiseView.vue'),
        },
        {
          path: 'table-reservation-settings',
          name: 'restaurant-table-reservation-settings',
          component: () => import('@src/pages/restaurant/TableReservationSettingsView.vue')
        },
        {
          path: 'delivery-options',
          name: 'restaurant-delivery-options',
          component: () => import('@src/pages/restaurant/deliveryZones/DeliveryZonesView.vue'),
        },
        {
          path: 'open-hours',
          name: 'restaurant-open-hours',
          component: () => import('@src/pages/restaurant/openHours/OpenHoursView.vue')
        },
        {
          path: 'payment-methods',
          name: 'restaurant-payment-methods',
          component: () => import('@src/pages/restaurant/paymentMethods/PaymentMethodsView.vue')
        },
        {
          path: 'scheduled-orders',
          name: 'restaurant-scheduled-orders',
          component: () => import('@src/pages/restaurant/ScheduledOrdersView.vue')
        },
        {
          path: 'tax-settings',
          name: 'restaurant-tax-settings',
          component: () => import('@src/pages/restaurant/tax/TaxSettingsView.vue')
        },
        {
          path: 'menu-editor',
          name: 'restaurant-menu-editor',
          component: () => import('@src/pages/restaurant/menu/MenuEditorView.vue'),
        },
      ],
    },

    // WEBSITE ROUTES
    {
      path: '/my-websites',
      name: 'my-websites',
      component: () => import('@src/pages/my-websites/MyWebsitesView.vue'),
    },
    {
      path: '/new-website',
      name: 'new-website',
      component: () => import('@src/pages/my-websites/WebsiteNewForm.vue'),
    },
    {
      path: '/website/:websiteId',
      name: 'website',
      component: () => import('@src/layouts/website/WebsiteLayout.vue'),
      children: [
        {
          path: '',
          name: 'website-home',
          component: () => import('@src/pages/website/HomeView.vue'),
        },
        {
          path: 'name-domain',
          name: 'website-name',
          component: () => import('@src/pages/website/name/NameView.vue'),
        },
        {
          path: 'domains',
          name: 'website-domains',
          component: () => import('@src/pages/website/domains/DomainManagement.vue'),
        },
        {
          path: 'domains/add',
          name: 'website-domains-add',
          component: () => import('@src/pages/website/domains/AddNewDomain.vue'),
        },
        {
          path: 'team',
          name: 'website-team',
          component: () => import('@src/pages/website/team/TeamView.vue'),
        }
      ],
    },
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

router.beforeEach((_to, _from, next) => {
  pageTitle.value = '';
  next()
})

export default router
