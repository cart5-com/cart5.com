import { createRouter, createWebHistory } from 'vue-router'
import { pageTitle } from './stores/LayoutStore'
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
    // STORE ROUTES
    {
      path: '/my-stores',
      name: 'my-stores',
      component: () => import('@dashboard-spa-vue/pages/my-stores/MyStoresView.vue'),
    },
    {
      path: '/store/:storeId',
      name: 'store',
      component: () => import('@dashboard-spa-vue/layouts/store/StoreLayout.vue'),
      children: [
        {
          path: '',
          name: 'store-home',
          component: () => import('@dashboard-spa-vue/pages/store/HomeView.vue'),
        },
        {
          path: 'name-phone',
          name: 'store-name',
          component: () => import('@dashboard-spa-vue/pages/store/name/NamePhoneView.vue'),
        },
        {
          path: 'address',
          name: 'store-address',
          component: () => import('@dashboard-spa-vue/pages/store/address/AddressView.vue'),
        },
        {
          path: 'cuisine',
          name: 'store-cuisine',
          component: () => import('@dashboard-spa-vue/pages/store/CuisineView.vue'),
        },
        {
          path: 'pickup',
          name: 'store-pickup',
          component: () => import('@dashboard-spa-vue/pages/store/PickupView.vue'),
        },
        {
          path: 'delivery-options',
          name: 'store-delivery-options',
          component: () => import('@dashboard-spa-vue/pages/store/deliveryZones/DeliveryZonesView.vue'),
        },
        {
          path: 'open-hours',
          name: 'store-open-hours',
          component: () => import('@dashboard-spa-vue/pages/store/openHours/OpenHoursView.vue')
        },
        {
          path: 'payment-methods',
          name: 'store-payment-methods',
          component: () => import('@dashboard-spa-vue/pages/store/paymentMethods/PaymentMethodsView.vue')
        },
        {
          path: 'tax-settings',
          name: 'store-tax-settings',
          component: () => import('@dashboard-spa-vue/pages/store/tax/TaxSettingsView.vue')
        },
        {
          path: 'menu-editor',
          name: 'store-menu-editor',
          component: () => import('@dashboard-spa-vue/pages/store/menu/MenuEditorView.vue'),
        },
        {
          path: 'service-fees',
          name: 'store-service-fees',
          component: () => import('@dashboard-spa-vue/pages/store/serviceFees/ServiceFeesView.vue'),
        },
        {
          path: 'team',
          name: 'store-team',
          component: () => import('@dashboard-spa-vue/pages/store/team/TeamView.vue'),
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
          path: 'stores',
          name: 'website-stores',
          component: () => import('@dashboard-spa-vue/pages/website/stores/WebsiteStoresListView.vue'),
        },
        {
          path: 'partner',
          name: 'website-partner',
          component: () => import('@dashboard-spa-vue/pages/website/partner/PartnerView.vue'),
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
