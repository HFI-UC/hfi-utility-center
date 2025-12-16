import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/reservation/create',
      name: 'reservation-create',
      component: () => import('@/views/reservation/CreateView.vue')
    },
    {
      path: '/reservation/search',
      name: 'reservation-search',
      component: () => import('@/views/reservation/SearchView.vue')
    },
    {
      path: '/reservation/analytics',
      name: 'reservation-analytics',
      component: () => import('@/views/reservation/AnalyticsView.vue')
    },
    {
      path: '/reservation/analytics/raw/overview',
      name: 'reservation-analytics-raw-overview',
      component: () => import('@/views/reservation/analytics/raw/OverviewView.vue'),
      meta: { hideNavbar: true }
    },
    {
      path: '/reservation/analytics/raw/weekly',
      name: 'reservation-analytics-raw-weekly',
      component: () => import('@/views/reservation/analytics/raw/WeeklyView.vue'),
      meta: { hideNavbar: true }
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/LoginView.vue')
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('@/views/admin/AdminView.vue')
    },
    {
      path: '/admin/facility',
      name: 'admin-facility',
      component: () => import('@/views/admin/FacilityView.vue')
    },
    {
      path: '/admin/reservation',
      name: 'admin-reservation',
      component: () => import('@/views/admin/ReservationView.vue')
    },
    {
      path: '/utiverse',
      name: 'utiverse',
      component: () => import('@/views/UtiverseView.vue')
    }
  ]
})

export default router
