// ========================================
// SERVICO DE QR CODE
// ========================================

import QRCode from 'qrcode'

/**
 * Servico para gerar QR Codes para check-in
 */
export const qrcodeService = {
  /**
   * Gera um QR Code como Data URL (base64)
   * @param {string} code - Codigo do convidado (ex: RE01)
   * @param {Object} options - Opcoes de customizacao
   * @returns {Promise<string>} - Data URL do QR Code
   */
  async generateQRCode(code, options = {}) {
    const defaultOptions = {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H', // Alto nivel de correcao de erro
      ...options,
    }

    try {
      const dataUrl = await QRCode.toDataURL(code, defaultOptions)
      return dataUrl
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
      throw new Error('Erro ao gerar QR Code')
    }
  },

  /**
   * Gera um QR Code e retorna como canvas element
   * @param {string} code - Codigo do convidado
   * @param {HTMLCanvasElement} canvas - Elemento canvas
   * @param {Object} options - Opcoes de customizacao
   * @returns {Promise<void>}
   */
  async generateToCanvas(code, canvas, options = {}) {
    const defaultOptions = {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
      ...options,
    }

    try {
      await QRCode.toCanvas(canvas, code, defaultOptions)
    } catch (error) {
      console.error('Erro ao gerar QR Code no canvas:', error)
      throw new Error('Erro ao gerar QR Code')
    }
  },

  /**
   * Gera QR Code com estilo customizado para o casamento
   * @param {string} code - Codigo do convidado
   * @returns {Promise<string>} - Data URL do QR Code
   */
  async generateWeddingQRCode(code) {
    return this.generateQRCode(code, {
      width: 400,
      margin: 3,
      color: {
        dark: '#3d2b1f', // Cor marrom do tema
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
  },

  /**
   * Faz download do QR Code como imagem
   * @param {string} dataUrl - Data URL do QR Code
   * @param {string} filename - Nome do arquivo
   */
  downloadQRCode(dataUrl, filename = 'qrcode-checkin.png') {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },
}

export default qrcodeService
