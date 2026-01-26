/**
 * Entity: Photo
 * Representa uma foto enviada por um convidado
 */
export interface Photo {
  id?: number;
  codigo_convidado: string;
  nome_convidado: string;
  storage_path: string;
  thumbnail_path?: string;
  original_filename?: string;
  file_size?: number;
  mime_type?: string;
  caption?: string;
  aprovado: boolean;
  created_at?: string;
  updated_at?: string;
  // Campos computados/junções
  public_url?: string;
  thumbnail_url?: string;
  likes_count?: number;
  comments_count?: number;
  user_liked?: boolean;
}

/**
 * Dados para upload de foto
 */
export interface PhotoUploadData {
  codigo_convidado: string;
  nome_convidado: string;
  file: File;
  caption?: string;
}

/**
 * Resposta de upload de foto
 */
export interface PhotoUploadResponse {
  success: boolean;
  message: string;
  photo?: Photo;
}

/**
 * Estatísticas de fotos
 */
export interface PhotoStats {
  total: number;
  approved: number;
  pending: number;
  totalLikes: number;
  totalComments: number;
}

/**
 * Factory para criar estatísticas vazias
 */
export const createEmptyPhotoStats = (): PhotoStats => ({
  total: 0,
  approved: 0,
  pending: 0,
  totalLikes: 0,
  totalComments: 0,
});
