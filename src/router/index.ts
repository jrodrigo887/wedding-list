import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Views
import HomePage from '@/views/HomePage.vue'
import RsvpPage from '@/views/RsvpPage.vue'
import ChaCasaNovaPage from '@/views/ChaCasaNovaPage.vue'
import CheckinPage from '@/views/CheckinPage.vue'

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
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
