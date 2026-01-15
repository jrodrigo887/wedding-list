import { createRouter, createWebHistory } from 'vue-router'

// Views
import HomePage from '@/views/HomePage.vue'
import RsvpPage from '@/views/RsvpPage.vue'

const routes = [
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
  // Redirect para pagina inicial se rota nao existir
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
