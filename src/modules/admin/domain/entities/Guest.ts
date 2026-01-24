/**
 * Entity: Guest
 * Representa um convidado do evento
 */
export interface Guest {
  id?: number;
  codigo: string;
  nome: string;
  parceiro?: string;
  email?: string;
  telefone?: string;
  acompanhantes: number;
  confirmado: boolean;
  data_confirmacao?: string;
  checkin?: boolean;
  entrada_confirmada?: boolean;
  horario_entrada?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  checkedIn: number;
}

export const createEmptyGuestStats = (): GuestStats => ({
  total: 0,
  confirmed: 0,
  pending: 0,
  checkedIn: 0,
});
