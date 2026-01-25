/**
 * Entity: RsvpGuest
 * Representa um convidado no contexto de RSVP (confirmação de presença)
 */
export interface RsvpGuest {
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
}

/**
 * Response: ConfirmPresenceResponse
 * Resposta da confirmação de presença
 */
export interface ConfirmPresenceResponse {
  success: boolean;
  message: string;
  guest: Omit<RsvpGuest, 'id'>;
}

/**
 * Response: CheckinResponse
 * Resposta do registro de check-in
 */
export interface CheckinResponse {
  success: boolean;
  message: string;
  horario: string;
}

/**
 * Stats: RsvpStats
 * Estatísticas de RSVP e check-in
 */
export interface RsvpStats {
  total: number;
  confirmed: number;
  pending: number;
  checkedIn: number;
}

/**
 * Params: SendQRCodeEmailParams
 * Parâmetros para envio de QR Code por email
 */
export interface SendQRCodeEmailParams {
  code: string;
  email: string;
  name: string;
}

/**
 * Factory: createEmptyRsvpStats
 * Cria um objeto de estatísticas vazio
 */
export const createEmptyRsvpStats = (): RsvpStats => ({
  total: 0,
  confirmed: 0,
  pending: 0,
  checkedIn: 0,
});
