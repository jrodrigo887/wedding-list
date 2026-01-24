<template>
  <div class="admin-page">
    <div class="admin-container">
      <!-- Dashboard -->
      <div class="admin-dashboard">
        <header class="admin-header">
          <h1 class="admin-header__title">Dashboard</h1>
          <router-link to="/contratos" class="admin-header__contratos"
            >Contratos</router-link
          >
          <button class="admin-header__logout" @click="handleLogout">
            Sair
          </button>
        </header>

        <!-- Stats Cards -->
        <div class="admin-stats">
          <div class="admin-stats__card">
            <span class="admin-stats__number">{{ stats.total }}</span>
            <span class="admin-stats__label">Total de Convidados</span>
          </div>
          <div class="admin-stats__card admin-stats__card--success">
            <span class="admin-stats__number">{{ stats.confirmed }}</span>
            <span class="admin-stats__label">Confirmados</span>
          </div>
          <div class="admin-stats__card admin-stats__card--warning">
            <span class="admin-stats__number">{{ stats.pending }}</span>
            <span class="admin-stats__label">Pendentes</span>
          </div>
          <div class="admin-stats__card admin-stats__card--info">
            <span class="admin-stats__number">{{ stats.checkedIn }}</span>
            <span class="admin-stats__label">Check-ins</span>
          </div>
        </div>

        <!-- Tabs -->
        <div class="admin-tabs">
          <button
            class="admin-tabs__tab"
            :class="{ 'admin-tabs__tab--active': activeTab === 'overview' }"
            @click="activeTab = 'overview'"
          >
            Visão Geral
          </button>
          <button
            class="admin-tabs__tab"
            :class="{ 'admin-tabs__tab--active': activeTab === 'checkins' }"
            @click="activeTab = 'checkins'"
          >
            Check-ins ({{ stats.checkedIn }})
          </button>
        </div>

        <!-- Tab Content -->
        <div class="admin-content">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="admin-overview">
            <div class="admin-overview__progress">
              <div class="admin-overview__progress-header">
                <span>Confirmações</span>
                <span>{{ confirmationRate }}%</span>
              </div>
              <div class="admin-overview__progress-bar">
                <div
                  class="admin-overview__progress-fill"
                  :style="{ width: confirmationRate + '%' }"
                ></div>
              </div>
            </div>

            <div class="admin-overview__progress">
              <div class="admin-overview__progress-header">
                <span>Check-ins</span>
                <span>{{ checkinRate }}%</span>
              </div>
              <div
                class="admin-overview__progress-bar admin-overview__progress-bar--info"
              >
                <div
                  class="admin-overview__progress-fill admin-overview__progress-fill--info"
                  :style="{ width: checkinRate + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Checkins Tab -->
          <div v-if="activeTab === 'checkins'" class="admin-checkins">
            <div v-if="loadingCheckins" class="admin-checkins__loading">
              Carregando...
            </div>
            <div
              v-else-if="checkedInGuests.length === 0"
              class="admin-checkins__empty"
            >
              Nenhum check-in realizado ainda.
            </div>
            <div v-else class="admin-checkins__list">
              <div
                v-for="guest in checkedInGuests"
                :key="guest.codigo"
                class="admin-checkins__item"
              >
                <div class="admin-checkins__info">
                  <span class="admin-checkins__name">
                    {{ guest.nome
                    }}{{ guest.parceiro ? ` e ${guest.parceiro}` : '' }}
                  </span>
                  <span class="admin-checkins__code">{{ guest.codigo }}</span>
                </div>
                <span class="admin-checkins__time">
                  {{ formatTime(guest.horario_entrada ?? '') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Refresh -->
        <button
          class="admin-refresh"
          @click="loadData"
          :disabled="loadingStats"
        >
          {{ loadingStats ? 'Atualizando...' : 'Atualizar dados' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/modules/auth';
import rsvpService from '@/services/rsvp.service';
import type { Guest } from '@/types';

const router = useRouter();
const { logout } = useAuth();

// Dashboard state
const activeTab = ref<'overview' | 'checkins'>('overview');
const stats = ref({ total: 0, confirmed: 0, pending: 0, checkedIn: 0 });
const checkedInGuests = ref<Guest[]>([]);
const loadingStats = ref(false);
const loadingCheckins = ref(false);

// Computed
const confirmationRate = computed(() => {
  if (stats.value.total === 0) return 0;
  return Math.round((stats.value.confirmed / stats.value.total) * 100);
});

const checkinRate = computed(() => {
  if (stats.value.confirmed === 0) return 0;
  return Math.round((stats.value.checkedIn / stats.value.confirmed) * 100);
});

// Methods
const handleLogout = async () => {
  await logout();
  router.push('/login');
};

const loadStats = async () => {
  loadingStats.value = true;
  try {
    stats.value = await rsvpService.getGuestStats();
  } catch (err) {
    console.error('Erro ao carregar estatísticas:', err);
  } finally {
    loadingStats.value = false;
  }
};

const loadCheckins = async () => {
  loadingCheckins.value = true;
  try {
    checkedInGuests.value = await rsvpService.getCheckedInGuests();
  } catch (err) {
    console.error('Erro ao carregar check-ins:', err);
  } finally {
    loadingCheckins.value = false;
  }
};

const loadData = async () => {
  await Promise.all([loadStats(), loadCheckins()]);
};

const formatTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Load data on mount
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #0f0f1a;
  padding: 1rem;
}

.admin-container {
  max-width: 600px;
  margin: 0 auto;
}

/* Header */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.admin-header__title {
  color: #fff;
  font-size: 1.5rem;
  margin: 0;
}

.admin-header__logout {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #475569;
  border-radius: 0.375rem;
  color: #94a3b8;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-header__contratos {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #475569;
  border-radius: 0.375rem;
  color: #94a3b8;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-header__logout:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.admin-header__contratos:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

/* Stats */
.admin-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.admin-stats__card {
  background: #1a1a2e;
  border-radius: 0.75rem;
  padding: 1.25rem;
  text-align: center;
  border-left: 3px solid #64748b;
}

.admin-stats__card--success {
  border-left-color: #10b981;
}

.admin-stats__card--warning {
  border-left-color: #f59e0b;
}

.admin-stats__card--info {
  border-left-color: #3b82f6;
}

.admin-stats__number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.admin-stats__label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Tabs */
.admin-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.admin-tabs__tab {
  flex: 1;
  padding: 0.75rem;
  background: #1a1a2e;
  border: none;
  border-radius: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-tabs__tab:hover {
  color: #fff;
}

.admin-tabs__tab--active {
  background: #3b82f6;
  color: #fff;
}

/* Content */
.admin-content {
  background: #1a1a2e;
  border-radius: 0.75rem;
  padding: 1.25rem;
  min-height: 200px;
}

/* Overview */
.admin-overview__progress {
  margin-bottom: 1.5rem;
}

.admin-overview__progress:last-child {
  margin-bottom: 0;
}

.admin-overview__progress-header {
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.admin-overview__progress-bar {
  height: 8px;
  background: #2d2d44;
  border-radius: 4px;
  overflow: hidden;
}

.admin-overview__progress-fill {
  height: 100%;
  background: #10b981;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.admin-overview__progress-bar--info .admin-overview__progress-fill,
.admin-overview__progress-fill--info {
  background: #3b82f6;
}

/* Checkins */
.admin-checkins__loading,
.admin-checkins__empty {
  color: #64748b;
  text-align: center;
  padding: 2rem;
}

.admin-checkins__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.admin-checkins__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #0f0f1a;
  border-radius: 0.5rem;
}

.admin-checkins__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.admin-checkins__name {
  color: #fff;
  font-size: 0.9rem;
}

.admin-checkins__code {
  color: #64748b;
  font-size: 0.75rem;
  font-family: monospace;
}

.admin-checkins__time {
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Refresh */
.admin-refresh {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid #2d2d44;
  border-radius: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-refresh:hover:not(:disabled) {
  background: #1a1a2e;
  color: #fff;
}

.admin-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 480px) {
  .admin-stats {
    grid-template-columns: 1fr 1fr;
  }

  .admin-stats__number {
    font-size: 1.5rem;
  }
}
</style>
