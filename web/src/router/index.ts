import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import { resolveAccess } from './guards'

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
      path: '/accedi',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/registrati',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/offerte/nuova',
      name: 'jobs.create',
      component: () => import('@/views/PostJobView.vue'),
      meta: { role: 'company' },
    },
    {
      path: '/offerte/:id(\\d+)',
      name: 'jobs.show',
      component: () => import('@/views/JobDetailView.vue'),
      props: (route) => ({ id: Number(route.params.id) }),
    },
    {
      path: '/aziende/:id(\\d+)',
      name: 'company.show',
      component: () => import('@/views/CompanyView.vue'),
      props: (route) => ({ id: Number(route.params.id) }),
    },
    {
      path: '/azienda/profilo',
      name: 'company.profile',
      component: () => import('@/views/CompanyProfileView.vue'),
      meta: { role: 'company' },
    },
    {
      path: '/profilo',
      name: 'candidate.profile',
      component: () => import('@/views/CandidateProfileView.vue'),
      meta: { role: 'candidate' },
    },
    {
      path: '/:path(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { top: 0 },
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  await auth.ensureLoaded()

  return resolveAccess(to, {
    isAuthenticated: auth.isAuthenticated,
    role: auth.user?.role ?? null,
  })
})

export default router
