<template>
  <div class="contracts-page">
    <div class="contracts-container">
      <!-- Dashboard -->
      <div class="contracts-dashboard">
        <header class="contracts-header">
          <h1 class="contracts-header__title">Contratos</h1>
          <div class="contracts-header__actions">
            <button class="contracts-header__add" @click="openModal()">
              + Novo
            </button>

            <button class="contracts-header__logout">
              <router-link to="/admin">Convidados</router-link>
            </button>
            <button class="contracts-header__logout" @click="handleLogout">
              Sair
            </button>
          </div>
        </header>

        <!-- Stats Cards -->
        <div class="contracts-stats">
          <div class="contracts-stats__card">
            <span class="contracts-stats__label">Total Valor</span>
            <span class="contracts-stats__number">
              {{ formatCurrency(stats.totalValor) }}
            </span>
          </div>
          <div class="contracts-stats__card contracts-stats__card--success">
            <span class="contracts-stats__label">Total Pago</span>
            <span class="contracts-stats__number">
              {{ formatCurrency(stats.totalPago) }}
            </span>
          </div>
          <div class="contracts-stats__card contracts-stats__card--warning">
            <span class="contracts-stats__label">Restante</span>
            <span class="contracts-stats__number">
              {{ formatCurrency(stats.totalRestante) }}
            </span>
          </div>
        </div>

        <!-- Table -->
        <div class="contracts-table-wrapper">
          <div v-if="loadingContracts" class="contracts-loading">
            Carregando...
          </div>
          <div v-else-if="contracts.length === 0" class="contracts-empty">
            Nenhum contrato cadastrado.
          </div>
          <table v-else class="contracts-table">
            <thead>
              <tr>
                <th>Responsável</th>
                <th>Empresa</th>
                <th>Contato</th>
                <th class="text-right">Valor</th>
                <th class="text-right">Pago</th>
                <th class="text-right">Restante</th>
                <th class="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contract in contracts" :key="contract.id">
                <td>{{ contract.responsavel || '-' }}</td>
                <td>{{ contract.empresa || '-' }}</td>
                <td>{{ contract.contato || '-' }}</td>
                <td class="text-right">
                  {{ formatCurrency(contract.valor || 0) }}
                </td>
                <td class="text-right">
                  {{ formatCurrency(contract.pago || 0) }}
                </td>
                <td class="text-right">
                  <span :class="getRestanteClass(contract)">
                    {{ formatCurrency(getRestante(contract)) }}
                  </span>
                </td>
                <td class="text-center">
                  <button
                    class="contracts-table__btn contracts-table__btn--edit"
                    @click="openModal(contract)"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    class="contracts-table__btn contracts-table__btn--delete"
                    @click="confirmDelete(contract)"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Refresh -->
        <button
          class="contracts-refresh"
          @click="loadContracts"
          :disabled="loadingContracts"
        >
          {{ loadingContracts ? 'Atualizando...' : 'Atualizar dados' }}
        </button>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="contracts-modal" @click.self="closeModal">
        <div class="contracts-modal__content">
          <div class="contracts-modal__header">
            <h2 class="contracts-modal__title">
              {{ editingContract ? 'Editar Contrato' : 'Novo Contrato' }}
            </h2>
            <button class="contracts-modal__close" @click="closeModal">
              ✕
            </button>
          </div>

          <form class="contracts-form" @submit.prevent="saveContract">
            <div class="contracts-form__group">
              <label class="contracts-form__label">Responsável</label>
              <input
                v-model="form.responsavel"
                type="text"
                class="contracts-form__input"
                placeholder="Nome do responsável"
              />
            </div>

            <div class="contracts-form__group">
              <label class="contracts-form__label">Empresa</label>
              <input
                v-model="form.empresa"
                type="text"
                class="contracts-form__input"
                placeholder="Nome da empresa"
              />
            </div>

            <div class="contracts-form__group">
              <label class="contracts-form__label">Contato</label>
              <input
                v-model="form.contato"
                type="text"
                class="contracts-form__input"
                placeholder="Telefone ou email"
              />
            </div>

            <div class="contracts-form__row">
              <div class="contracts-form__group">
                <label class="contracts-form__label">Valor (R$)</label>
                <input
                  v-model="form.valor"
                  type="number"
                  step="0.01"
                  min="0"
                  class="contracts-form__input"
                  placeholder="0,00"
                />
              </div>

              <div class="contracts-form__group">
                <label class="contracts-form__label">Pago (R$)</label>
                <input
                  v-model="form.pago"
                  type="number"
                  step="0.01"
                  min="0"
                  class="contracts-form__input"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div class="contracts-form__actions">
              <button
                type="button"
                class="contracts-form__btn contracts-form__btn--cancel"
                @click="closeModal"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="contracts-form__btn contracts-form__btn--save"
                :disabled="saving"
              >
                {{ saving ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>

          <p v-if="formError" class="contracts-form__error">{{ formError }}</p>
        </div>
      </div>

      <!-- Delete Confirmation -->
      <div
        v-if="showDeleteConfirm"
        class="contracts-modal"
        @click.self="showDeleteConfirm = false"
      >
        <div class="contracts-modal__content contracts-modal__content--small">
          <h3 class="contracts-modal__title">Confirmar exclusão</h3>
          <p class="contracts-modal__message">
            Deseja realmente excluir o contrato de
            <strong>{{
              deletingContract?.empresa ||
              deletingContract?.responsavel ||
              'sem nome'
            }}</strong
            >?
          </p>
          <div class="contracts-form__actions">
            <button
              class="contracts-form__btn contracts-form__btn--cancel"
              @click="showDeleteConfirm = false"
            >
              Cancelar
            </button>
            <button
              class="contracts-form__btn contracts-form__btn--delete"
              :disabled="deleting"
              @click="deleteContract"
            >
              {{ deleting ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/modules/auth';
import contractsService from '../services/contracts.service';
import type { Contract, ContractForm, ContractStats } from '../types';

const router = useRouter();
const { logout } = useAuth();

// Data state
const contracts = ref<Contract[]>([]);
const loadingContracts = ref(false);

// Modal state
const showModal = ref(false);
const editingContract = ref<Contract | null>(null);
const saving = ref(false);
const formError = ref('');
const form = ref<ContractForm>({
  responsavel: '',
  empresa: '',
  contato: '',
  valor: '',
  pago: '',
});

// Delete state
const showDeleteConfirm = ref(false);
const deletingContract = ref<Contract | null>(null);
const deleting = ref(false);

// Computed
const stats = computed<ContractStats>(() => {
  return contractsService.calculateStats(contracts.value);
});

// Methods
const handleLogout = async () => {
  await logout();
  router.push('/login');
};

const loadContracts = async () => {
  loadingContracts.value = true;
  try {
    contracts.value = await contractsService.getAll();
  } catch (err) {
    console.error('Erro ao carregar contratos:', err);
  } finally {
    loadingContracts.value = false;
  }
};

const openModal = (contract?: Contract) => {
  if (contract) {
    editingContract.value = contract;
    form.value = {
      responsavel: contract.responsavel || '',
      empresa: contract.empresa || '',
      contato: contract.contato || '',
      valor: contract.valor ?? '',
      pago: contract.pago ?? '',
    };
  } else {
    editingContract.value = null;
    form.value = {
      responsavel: '',
      empresa: '',
      contato: '',
      valor: '',
      pago: '',
    };
  }
  formError.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingContract.value = null;
  formError.value = '';
};

const saveContract = async () => {
  saving.value = true;
  formError.value = '';

  try {
    if (editingContract.value?.id) {
      await contractsService.update(editingContract.value.id, form.value);
    } else {
      await contractsService.create(form.value);
    }
    closeModal();
    await loadContracts();
  } catch (err) {
    formError.value =
      err instanceof Error ? err.message : 'Erro ao salvar contrato';
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (contract: Contract) => {
  deletingContract.value = contract;
  showDeleteConfirm.value = true;
};

const deleteContract = async () => {
  if (!deletingContract.value?.id) return;

  deleting.value = true;
  try {
    await contractsService.delete(deletingContract.value.id);
    showDeleteConfirm.value = false;
    deletingContract.value = null;
    await loadContracts();
  } catch (err) {
    console.error('Erro ao excluir contrato:', err);
  } finally {
    deleting.value = false;
  }
};

const getRestante = (contract: Contract): number => {
  return (contract.valor || 0) - (contract.pago || 0);
};

const getRestanteClass = (contract: Contract): string => {
  const restante = getRestante(contract);
  if (restante === 0) return 'text-success';
  if (restante < 0) return 'text-info';
  return 'text-warning';
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Load data on mount
onMounted(() => {
  loadContracts();
});
</script>

<style scoped>
.contracts-page {
  min-height: 100vh;
  background: #0f0f1a;
  padding: 1rem;
}

.contracts-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* Header */
.contracts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.contracts-header__title {
  color: #fff;
  font-size: 1.5rem;
  margin: 0;
}

.contracts-header__actions {
  display: flex;
  gap: 0.5rem;
}

.contracts-header__add {
  padding: 0.5rem 1rem;
  background: #10b981;
  border: none;
  border-radius: 0.375rem;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.contracts-header__add:hover {
  background: #059669;
}

.contracts-header__logout {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #475569;
  border-radius: 0.375rem;
  color: #94a3b8;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.contracts-header__logout:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

/* Stats */
.contracts-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.contracts-stats__card {
  background: #1a1a2e;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  border-left: 3px solid #64748b;
}

.contracts-stats__card--success {
  border-left-color: #10b981;
}

.contracts-stats__card--warning {
  border-left-color: #f59e0b;
}

.contracts-stats__label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.contracts-stats__number {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

/* Table */
.contracts-table-wrapper {
  background: #1a1a2e;
  border-radius: 0.75rem;
  overflow: hidden;
}

.contracts-loading,
.contracts-empty {
  color: #64748b;
  text-align: center;
  padding: 3rem;
}

.contracts-table {
  width: 100%;
  border-collapse: collapse;
}

.contracts-table th,
.contracts-table td {
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 1px solid #2d2d44;
}

.contracts-table th {
  background: #0f0f1a;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.contracts-table td {
  color: #fff;
  font-size: 0.875rem;
}

.contracts-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.contracts-table tbody tr:last-child td {
  border-bottom: none;
}

.text-right {
  text-align: right !important;
}

.text-center {
  text-align: center !important;
}

.text-success {
  color: #10b981;
}

.text-warning {
  color: #f59e0b;
}

.text-info {
  color: #3b82f6;
}

.contracts-table__btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.contracts-table__btn:hover {
  opacity: 1;
}

/* Modal */
.contracts-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.contracts-modal__content {
  background: #1a1a2e;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.contracts-modal__content--small {
  max-width: 400px;
  padding: 1.5rem;
}

.contracts-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #2d2d44;
}

.contracts-modal__title {
  color: #fff;
  font-size: 1.125rem;
  margin: 0;
}

.contracts-modal__message {
  color: #94a3b8;
  margin: 1rem 0 1.5rem;
  line-height: 1.5;
}

.contracts-modal__message strong {
  color: #fff;
}

.contracts-modal__close {
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
}

.contracts-modal__close:hover {
  color: #fff;
}

/* Form */
.contracts-form {
  padding: 1.5rem;
}

.contracts-form__group {
  margin-bottom: 1rem;
}

.contracts-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.contracts-form__label {
  display: block;
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.contracts-form__input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #0f0f1a;
  border: 1px solid #2d2d44;
  border-radius: 0.5rem;
  color: #fff;
  font-size: 0.9375rem;
  box-sizing: border-box;
}

.contracts-form__input:focus {
  outline: none;
  border-color: #3b82f6;
}

.contracts-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.contracts-form__btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.contracts-form__btn--cancel {
  background: #2d2d44;
  color: #94a3b8;
}

.contracts-form__btn--cancel:hover {
  background: #3d3d5c;
  color: #fff;
}

.contracts-form__btn--save {
  background: #3b82f6;
  color: #fff;
}

.contracts-form__btn--save:hover:not(:disabled) {
  background: #2563eb;
}

.contracts-form__btn--save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.contracts-form__btn--delete {
  background: #ef4444;
  color: #fff;
}

.contracts-form__btn--delete:hover:not(:disabled) {
  background: #dc2626;
}

.contracts-form__btn--delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.contracts-form__error {
  color: #ef4444;
  text-align: center;
  padding: 0 1.5rem 1.5rem;
  margin: 0;
  font-size: 0.875rem;
}

/* Refresh */
.contracts-refresh {
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

.contracts-refresh:hover:not(:disabled) {
  background: #1a1a2e;
  color: #fff;
}

.contracts-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .contracts-stats {
    grid-template-columns: 1fr;
  }

  .contracts-table-wrapper {
    overflow-x: auto;
  }

  .contracts-table {
    min-width: 600px;
  }

  .contracts-form__row {
    grid-template-columns: 1fr;
  }
}
</style>
