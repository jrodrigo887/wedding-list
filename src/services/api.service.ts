// ========================================
// SERVICO DE API
// ========================================

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { APP_CONFIG, API_ENDPOINTS } from '@/utils/constants'
import type { Gift, Customer } from '@/types'

// ========================================
// Configuracao do Axios
// ========================================
const apiClient: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ========================================
// Request Interceptor
// ========================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API] Request Error:', error)
    return Promise.reject(error)
  }
)

// ========================================
// Response Interceptor
// ========================================
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status}:`, response.data)
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          console.error('[API] Bad Request:', data)
          break
        case 401:
          console.error('[API] Unauthorized')
          break
        case 403:
          console.error('[API] Forbidden')
          break
        case 404:
          console.error('[API] Not Found')
          break
        case 500:
          console.error('[API] Server Error')
          break
        default:
          console.error('[API] Error:', status, data)
      }
    } else if (error.request) {
      console.error('[API] Network Error:', error.request)
    } else {
      console.error('[API] Error:', error.message)
    }

    return Promise.reject(error)
  }
)

// ========================================
// Interface para servicos de presentes
// ========================================
export interface GiftServiceInterface {
  getGifts(): Promise<Gift[]>
  reserveGift(giftId: string | number, guestData: Customer): Promise<{ success: boolean; message?: string; error?: string }>
}

// ========================================
// Google Sheets Service
// ========================================
interface GoogleSheetGift {
  id: string | number
  nome: string
  categoria: string
  descricao?: string
  preco?: number
  reservado: boolean
  reservadoPor?: string
  tipo?: string
}

export const googleSheetsService: GiftServiceInterface = {
  async getGifts(): Promise<Gift[]> {
    const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      throw new Error('URL do Google Apps Script não configurada')
    }

    const response = await axios.get(`${googleScriptUrl}?action=getGifts`)
    const data = response.data

    if (data.error) {
      throw new Error(data.error)
    }

    return data.gifts.map((gift: GoogleSheetGift) => ({
      id: gift.id,
      name: gift.nome,
      category: gift.categoria,
      description: gift.descricao,
      price: gift.preco || 0,
      status: gift.reservado ? 'reserved' : 'available',
      reservedBy: gift.reservadoPor,
      type: gift.tipo || 'Casamento',
    }))
  },

  async reserveGift(giftId: string | number, guestData: Customer) {
    const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL

    if (!googleScriptUrl) {
      throw new Error('URL do Google Apps Script não configurada')
    }

    const payload: Record<string, string> = {
      action: 'reserveGift',
      giftId: String(giftId),
      nome: guestData.name || '',
      email: guestData.email || '',
      telefone: guestData.phone || '',
      mensagem: guestData.message || '',
    }

    const formData = new FormData()
    Object.keys(payload).forEach((key) => formData.append(key, payload[key]))

    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Erro ao reservar presente')
    }

    return data
  },
}

// ========================================
// Gift Service (API REST tradicional)
// ========================================
export const giftService: GiftServiceInterface = {
  async getGifts(): Promise<Gift[]> {
    const response = await apiClient.get(API_ENDPOINTS.GIFTS)
    return response.data
  },

  async reserveGift(giftId: string | number, guestData: Customer) {
    const endpoint = API_ENDPOINTS.RESERVE.replace(':id', String(giftId))
    const response = await apiClient.post(endpoint, guestData)
    return response.data
  },
}

// ========================================
// Mock Service (para desenvolvimento)
// ========================================
export const mockGiftService: GiftServiceInterface = {
  async getGifts(): Promise<Gift[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return [
      {
        id: 1,
        name: 'Jogo de Panelas Tramontina',
        description: 'Jogo de panelas antiaderente com 5 peças',
        category: 'Cozinha',
        price: 450.0,
        image: 'https://via.placeholder.com/400x300/FF6B9D/FFF?text=Panelas',
        status: 'available',
      },
      {
        id: 2,
        name: 'Edredom King Size',
        description: 'Edredom de casal king size 100% algodão',
        category: 'Quarto',
        price: 380.0,
        image: 'https://via.placeholder.com/400x300/C44569/FFF?text=Edredom',
        status: 'available',
      },
      {
        id: 3,
        name: 'Cafeteira Nespresso',
        description: 'Cafeteira Nespresso com sistema de cápsulas',
        category: 'Eletrodomésticos',
        price: 699.0,
        image: 'https://via.placeholder.com/400x300/FF6B9D/FFF?text=Cafeteira',
        status: 'reserved',
      },
      {
        id: 4,
        name: 'Jogo de Toalhas',
        description: 'Jogo de toalhas de banho 100% algodão - 5 peças',
        category: 'Banheiro',
        price: 180.0,
        image: 'https://via.placeholder.com/400x300/C44569/FFF?text=Toalhas',
        status: 'available',
      },
      {
        id: 5,
        name: 'Liquidificador Philips',
        description: 'Liquidificador Philips Walita 1000W',
        category: 'Eletrodomésticos',
        price: 280.0,
        image: 'https://via.placeholder.com/400x300/FF6B9D/FFF?text=Liquidificador',
        status: 'available',
      },
      {
        id: 6,
        name: 'Conjunto de Sofá',
        description: 'Sofá 3 lugares com chaise retrátil',
        category: 'Sala',
        price: 2500.0,
        image: 'https://via.placeholder.com/400x300/C44569/FFF?text=Sofá',
        status: 'available',
      },
      {
        id: 7,
        name: 'Aspirador de Pó',
        description: 'Aspirador de pó robô inteligente',
        category: 'Eletrodomésticos',
        price: 1200.0,
        image: 'https://via.placeholder.com/400x300/FF6B9D/FFF?text=Aspirador',
        status: 'available',
      },
      {
        id: 8,
        name: 'Mesa de Jantar',
        description: 'Mesa de jantar 6 lugares com cadeiras',
        category: 'Sala',
        price: 1800.0,
        image: 'https://via.placeholder.com/400x300/C44569/FFF?text=Mesa',
        status: 'reserved',
      },
      {
        id: 9,
        name: 'Micro-ondas',
        description: 'Micro-ondas Electrolux 30L',
        category: 'Eletrodomésticos',
        price: 550.0,
        image: 'https://via.placeholder.com/400x300/FF6B9D/FFF?text=Micro-ondas',
        status: 'available',
      },
    ]
  },

  async reserveGift(_giftId: string | number, _guestData: Customer) {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return {
      success: true,
      message: 'Presente reservado com sucesso!',
    }
  },
}

// ========================================
// Exportar o servico apropriado
// ========================================
const getActiveService = (): GiftServiceInterface => {
  const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL
  const useGoogleSheets = import.meta.env.VITE_USE_GOOGLE_SHEETS === 'true'

  if (googleScriptUrl && useGoogleSheets) {
    console.log('[API] Usando Google Sheets Service')
    return googleSheetsService
  }

  if (import.meta.env.MODE === 'development') {
    console.log('[API] Usando Mock Service')
    return mockGiftService
  }

  console.log('[API] Usando API REST Service')
  return giftService
}

export default getActiveService()
