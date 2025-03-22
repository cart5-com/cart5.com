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
  history: createWebHistory("/dashboard/"),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@dashboard-spa-vue/pages/HomeView.vue'),
    },
    // TEAM INVITE ROUTE
    {
      path: '/team_invite_handler',
      name: 'team-invite-handler',
      component: () => import('@dashboard-spa-vue/pages/TeamInviteHandlerView.vue'),
    },
    // RESTAURANT ROUTES
    {
      path: '/my-restaurants',
      name: 'my-restaurants',
      component: () => import('@dashboard-spa-vue/pages/my-restaurants/MyRestaurantsView.vue'),
    },
    {
      path: '/restaurant/:restaurantId',
      name: 'restaurant',
      component: () => import('@dashboard-spa-vue/layouts/restaurant/RestaurantLayout.vue'),
      children: [
        {
          path: '',
          name: 'restaurant-home',
          component: () => import('@dashboard-spa-vue/pages/restaurant/HomeView.vue'),
        },
        {
          path: 'name-phone',
          name: 'restaurant-name',
          component: () => import('@dashboard-spa-vue/pages/restaurant/name/NamePhoneView.vue'),
        },
        {
          path: 'address',
          name: 'restaurant-address',
          component: () => import('@dashboard-spa-vue/pages/restaurant/address/AddressView.vue'),
        },
        {
          path: 'cuisine',
          name: 'restaurant-cuisine',
          component: () => import('@dashboard-spa-vue/pages/restaurant/CuisineView.vue'),
        },
        {
          path: 'pickup',
          name: 'restaurant-pickup',
          component: () => import('@dashboard-spa-vue/pages/restaurant/PickupView.vue'),
        },
        {
          path: 'delivery-options',
          name: 'restaurant-delivery-options',
          component: () => import('@dashboard-spa-vue/pages/restaurant/deliveryZones/DeliveryZonesView.vue'),
        },
        {
          path: 'open-hours',
          name: 'restaurant-open-hours',
          component: () => import('@dashboard-spa-vue/pages/restaurant/openHours/OpenHoursView.vue')
        },
        {
          path: 'payment-methods',
          name: 'restaurant-payment-methods',
          component: () => import('@dashboard-spa-vue/pages/restaurant/paymentMethods/PaymentMethodsView.vue')
        },
        {
          path: 'tax-settings',
          name: 'restaurant-tax-settings',
          component: () => import('@dashboard-spa-vue/pages/restaurant/tax/TaxSettingsView.vue')
        },
        {
          path: 'menu-editor',
          name: 'restaurant-menu-editor',
          component: () => import('@dashboard-spa-vue/pages/restaurant/menu/MenuEditorView.vue'),
        },
        {
          path: 'team',
          name: 'restaurant-team',
          component: () => import('@dashboard-spa-vue/pages/restaurant/team/TeamView.vue'),
        }
      ],
    },

    // WEBSITE ROUTES
    {
      path: '/my-websites',
      name: 'my-websites',
      component: () => import('@dashboard-spa-vue/pages/my-websites/MyWebsitesView.vue'),
    },
    {
      path: '/new-website',
      name: 'new-website',
      component: () => import('@dashboard-spa-vue/pages/my-websites/WebsiteNewForm.vue'),
    },
    {
      path: '/website/:websiteId',
      name: 'website',
      component: () => import('@dashboard-spa-vue/layouts/website/WebsiteLayout.vue'),
      children: [
        {
          path: '',
          name: 'website-home',
          component: () => import('@dashboard-spa-vue/pages/website/HomeView.vue'),
        },
        {
          path: 'name-domain',
          name: 'website-name',
          component: () => import('@dashboard-spa-vue/pages/website/name/NameView.vue'),
        },
        {
          path: 'domains',
          name: 'website-domains',
          component: () => import('@dashboard-spa-vue/pages/website/domains/DomainManagement.vue'),
        },
        {
          path: 'domains/add',
          name: 'website-domains-add',
          component: () => import('@dashboard-spa-vue/pages/website/domains/AddNewDomain.vue'),
        },
        {
          path: 'team',
          name: 'website-team',
          component: () => import('@dashboard-spa-vue/pages/website/team/TeamView.vue'),
        },
        {
          path: 'restaurants',
          name: 'website-restaurants',
          component: () => import('@dashboard-spa-vue/pages/website/restaurants/WebsiteRestaurantsListView.vue'),
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
