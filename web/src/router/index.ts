import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

// Paths are user-facing, so they are in Italian; route names stay in English.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/offerte/nuova',
      name: 'jobs.create',
      component: () => import('@/views/PostJobView.vue'),
    },
    {
      path: '/offerte/:id(\\d+)',
      name: 'jobs.show',
      component: () => import('@/views/JobDetailView.vue'),
      props: (route) => ({ id: Number(route.params.id) }),
    },
    {
      path: '/:path(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { top: 0 },
})

export default router
