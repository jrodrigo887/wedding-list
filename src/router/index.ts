import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Views públicas
import HomePage from '@/views/HomePage.vue'
import RsvpPage from '@/views/RsvpPage.vue'
import ChaCasaNovaPage from '@/views/ChaCasaNovaPage.vue'
import CheckinPage from '@/views/CheckinPage.vue'

// Modules
import { LoginPage, authGuard } from '@/modules/auth'
import {
  AdminLayout,
  DashboardView,
  GuestsView,
  ContractsView,
} from '@/modules/admin'

const routes: RouteRecordRaw[] = [
  // Rotas públicas
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

  // Rotas administrativas (protegidas)
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: authGuard,
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: DashboardView,
      },
      {
        path: 'convidados',
        name: 'admin-guests',
        component: GuestsView,
      },
      {
        path: 'contratos',
        name: 'admin-contracts',
        component: ContractsView,
      },
    ],
  },

  // Fallback
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
