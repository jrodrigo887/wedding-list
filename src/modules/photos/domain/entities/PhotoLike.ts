/**
 * Entity: PhotoLike
 * Representa uma curtida em uma foto
 */
export interface PhotoLike {
  id?: number;
  foto_id: number;
  codigo_convidado: string;
  created_at?: string;
}
