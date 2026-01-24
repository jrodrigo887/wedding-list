import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Views
import HomePage from '@/views/HomePage.vue'
import RsvpPage from '@/views/RsvpPage.vue'
import ChaCasaNovaPage from '@/views/ChaCasaNovaPage.vue'
import CheckinPage from '@/views/CheckinPage.vue'
import AdminPage from '@/views/AdminPage.vue'

// Modules
import { ContractsPage } from '@/modules/contracts'
import { LoginPage, authGuard } from '@/modules/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/confirmar-presenca',
    name: 'rsvp',
    component: RsvpPage,
  },
  {
    path: '/cha-de-casa-nova',
    name: 'cha-casa-nova',
    component: ChaCasaNovaPage,
  },
  {
    path: '/checkin',
    name: 'checkin',
    component: CheckinPage,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminPage,
    beforeEnter: authGuard,
  },
  {
    path: '/contratos',
    name: 'contracts',
    component: ContractsPage,
    beforeEnter: authGuard,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
