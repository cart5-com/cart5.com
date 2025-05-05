import { createRouter, createWebHistory } from 'vue-router'

// TODO: do i need vue-router?
const router = createRouter({
  scrollBehavior(_to, _from, _savedPosition) {
    if (_savedPosition) {
      return _savedPosition
    } else {
      return { top: 0 }
    }
  },
  history: createWebHistory("/orders/"),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@orders-spa-vue/pages/OrdersHomeView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: { name: 'home' }
    }
  ],
  strict: true,
})

export default router
