// ========================================
// 🚀 ENTRY POINT
// ========================================

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/styles/global.css'

// ========================================
// Create App
// ========================================
const app = createApp(App)

// ========================================
// Pinia (State Management)
// ========================================
const pinia = createPinia()
app.use(pinia)

// ========================================
// Mount App
// ========================================
app.mount('#app')

// ========================================
// Error Handling
// ========================================
app.config.errorHandler = (err, instance, info) => {
  console.error('Global Error Handler:', err, info)
}

// ========================================
// Console Info
// ========================================
console.log('🎉 App iniciada com sucesso!')
console.log('📦 Vue.js 3 + Pinia + Vite')
