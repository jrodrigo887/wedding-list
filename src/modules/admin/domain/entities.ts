// Admin Module - Entities
// Todas as entidades do módulo administrativo

/**
 * Entity: Guest
 * Representa um convidado do evento
 */
export interface Guest {
  id?: number
  codigo: string
  nome: string
  parceiro?: string
  email?: string
  telefone?: string
  acompanhantes: number
  confirmado: boolean
  data_confirmacao?: string
  checkin?: boolean
  entrada_confirmada?: boolean
  horario_entrada?: string
  observacoes?: string
  created_at?: string
  updated_at?: string
}

export interface GuestStats {
  total: number
  confirmed: number
  pending: number
  checkedIn: number
}

export const createEmptyGuestStats = (): GuestStats => ({
  total: 0,
  confirmed: 0,
  pending: 0,
  checkedIn: 0,
})

/**
 * Entity: Contract
 * Representa um contrato de fornecedor
 */
export interface Contract {
  id?: number
  responsavel: string | null
  empresa: string | null
  contato: string | null
  valor: number | null
  pago: number | null
  created_at?: string
  updated_at?: string
}

export interface ContractForm {
  responsavel: string
  empresa: string
  contato: string
  valor: number | string
  pago: number | string
}

export interface ContractStats {
  totalValor: number
  totalPago: number
  totalRestante: number
}

export const createEmptyContract = (): ContractForm => ({
  responsavel: '',
  empresa: '',
  contato: '',
  valor: '',
  pago: '',
})

export const createEmptyContractStats = (): ContractStats => ({
  totalValor: 0,
  totalPago: 0,
  totalRestante: 0,
})
