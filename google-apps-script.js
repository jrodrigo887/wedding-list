// ========================================
// GOOGLE APPS SCRIPT - LISTA DE PRESENTES
// Com integração Infinity Pay
// ========================================
// Este código deve ser copiado para o Google Apps Script
// vinculado à sua planilha do Google Sheets.

/**
 * Configurações da planilha
 */
const CONFIG = {
  SHEET_GIFTS: 'Presentes',
  SHEET_RESERVATIONS: 'Reservas',
  SHEET_PAYMENTS: 'Pagamentos', // Nova aba para pagamentos
}

/**
 * Endpoint GET - Buscar presentes
 */
function doGet(e) {
  try {
    const action = e.parameter.action

    if (action === 'getGifts') {
      return getGiftsResponse()
    }

    return createJsonResponse({ error: 'Ação não reconhecida' })
  } catch (error) {
    return createJsonResponse({ error: error.message })
  }
}

/**
 * Endpoint POST - Reservar presente ou receber webhook
 */
function doPost(e) {
  try {
    // Tenta parsear como JSON primeiro (webhook do Infinity Pay)
    let data
    try {
      data = JSON.parse(e.postData.contents)
    } catch {
      // Se não for JSON, é FormData (reserva normal)
      data = e.parameter
    }

    const action = data.action

    // Webhook do Infinity Pay
    if (data.invoice_slug || data.transaction_nsu) {
      return handleInfinityPayWebhook(data)
    }

    // Reserva normal
    if (action === 'reserveGift') {
      return reserveGiftResponse(data)
    }

    return createJsonResponse({ error: 'Ação não reconhecida' })
  } catch (error) {
    Logger.log('Erro no doPost: ' + error.message)
    return createJsonResponse({ error: error.message })
  }
}

/**
 * Busca todos os presentes
 */
function getGiftsResponse() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_GIFTS)

  if (!sheet) {
    return createJsonResponse({ error: 'Planilha não encontrada' })
  }

  const data = sheet.getDataRange().getValues()
  const headers = data[0]
  const gifts = []

  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (row[0]) {
      // Se tem ID
      gifts.push({
        id: row[0],
        nome: row[1],
        categoria: row[2],
        descricao: row[3],
        preco: row[4] || 0,
        icone: row[5],
        reservado: row[6] === true || row[6] === 'TRUE' || row[6] === 'Sim',
        reservadoPor: row[7] || '',
        tipo: row[8] || 'Casamento',
        pago: row[9] === true || row[9] === 'TRUE' || row[9] === 'Sim', // Nova coluna
      })
    }
  }

  return createJsonResponse({ gifts })
}

/**
 * Reserva um presente
 */
function reserveGiftResponse(data) {
  const giftId = data.giftId
  const nome = data.nome || ''
  const email = data.email || ''
  const telefone = data.telefone || ''
  const mensagem = data.mensagem || ''
  const pago = data.pago === true || data.pago === 'true'
  const transactionId = data.transactionId || ''

  if (!giftId) {
    return createJsonResponse({ success: false, error: 'ID do presente não informado' })
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_GIFTS)

  if (!sheet) {
    return createJsonResponse({ success: false, error: 'Planilha não encontrada' })
  }

  const data_range = sheet.getDataRange().getValues()
  let rowIndex = -1

  for (let i = 1; i < data_range.length; i++) {
    if (String(data_range[i][0]) === String(giftId)) {
      rowIndex = i + 1 // +1 porque getValues é 0-indexed mas sheet é 1-indexed
      break
    }
  }

  if (rowIndex === -1) {
    return createJsonResponse({ success: false, error: 'Presente não encontrado' })
  }

  // Verifica se já está reservado
  if (data_range[rowIndex - 1][6] === true || data_range[rowIndex - 1][6] === 'TRUE') {
    return createJsonResponse({ success: false, error: 'Presente já foi reservado' })
  }

  // Atualiza a planilha
  sheet.getRange(rowIndex, 7).setValue(true) // Coluna G - Reservado
  sheet.getRange(rowIndex, 8).setValue(nome) // Coluna H - Reservado Por

  // Se foi pago, marca como pago
  if (pago) {
    // Garante que a coluna J existe
    if (sheet.getLastColumn() < 10) {
      sheet.getRange(1, 10).setValue('Pago')
    }
    sheet.getRange(rowIndex, 10).setValue(true) // Coluna J - Pago
  }

  // Registra na aba de reservas
  logReservation(giftId, data_range[rowIndex - 1][1], nome, email, telefone, mensagem, pago, transactionId)

  return createJsonResponse({
    success: true,
    message: pago ? 'Pagamento confirmado e presente reservado!' : 'Presente reservado com sucesso!',
  })
}

/**
 * Processa webhook do Infinity Pay
 */
function handleInfinityPayWebhook(data) {
  Logger.log('Webhook Infinity Pay recebido: ' + JSON.stringify(data))

  try {
    // Extrai informações do webhook
    const orderNsu = data.order_nsu || ''
    const transactionNsu = data.transaction_nsu || ''
    const amount = data.amount || 0
    const paid = data.paid || data.success || false
    const captureMethod = data.capture_method || ''
    const receiptUrl = data.receipt_url || ''

    // Extrai giftId do order_nsu (formato: gift_123_timestamp)
    const giftIdMatch = orderNsu.match(/gift_(\d+)_/)
    if (!giftIdMatch) {
      Logger.log('Formato de order_nsu inválido: ' + orderNsu)
      return createJsonResponse({ success: false, error: 'Formato de order_nsu inválido' })
    }

    const giftId = giftIdMatch[1]

    // Registra o pagamento
    logPayment({
      transactionNsu,
      orderNsu,
      giftId,
      amount,
      captureMethod,
      receiptUrl,
      rawData: JSON.stringify(data),
    })

    // Se pagamento confirmado, reserva automaticamente
    if (paid) {
      // Busca dados do cliente da transação pendente (se salvos)
      // Como não temos esses dados no webhook, deixamos vazio
      const reserveData = {
        giftId: giftId,
        nome: data.customer?.name || 'Pagamento Infinity Pay',
        email: data.customer?.email || '',
        telefone: '',
        mensagem: 'Pago via Infinity Pay - ' + captureMethod,
        pago: true,
        transactionId: transactionNsu,
      }

      return reserveGiftResponse(reserveData)
    }

    return createJsonResponse({ success: true, message: 'Webhook processado' })
  } catch (error) {
    Logger.log('Erro ao processar webhook: ' + error.message)
    return createJsonResponse({ success: false, error: error.message })
  }
}

/**
 * Registra a reserva na aba de reservas
 */
function logReservation(giftId, giftName, nome, email, telefone, mensagem, pago, transactionId) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_RESERVATIONS)

  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(CONFIG.SHEET_RESERVATIONS)
    sheet.appendRow([
      'Data/Hora',
      'ID Presente',
      'Nome Presente',
      'Nome Convidado',
      'E-mail',
      'Telefone',
      'Mensagem',
      'Pago',
      'Transaction ID',
    ])
  }

  sheet.appendRow([
    new Date().toLocaleString('pt-BR'),
    giftId,
    giftName,
    nome,
    email,
    telefone,
    mensagem,
    pago ? 'Sim' : 'Não',
    transactionId,
  ])
}

/**
 * Registra pagamento na aba de pagamentos
 */
function logPayment(paymentData) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_PAYMENTS)

  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(CONFIG.SHEET_PAYMENTS)
    sheet.appendRow([
      'Data/Hora',
      'Transaction NSU',
      'Order NSU',
      'Gift ID',
      'Valor (centavos)',
      'Método',
      'Receipt URL',
      'Raw Data',
    ])
  }

  sheet.appendRow([
    new Date().toLocaleString('pt-BR'),
    paymentData.transactionNsu,
    paymentData.orderNsu,
    paymentData.giftId,
    paymentData.amount,
    paymentData.captureMethod,
    paymentData.receiptUrl,
    paymentData.rawData,
  ])
}

/**
 * Cria resposta JSON com CORS headers
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  )
}

/**
 * Configura a planilha inicial
 * Execute esta função uma vez para criar a estrutura
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()

  // Aba de Presentes
  let giftsSheet = ss.getSheetByName(CONFIG.SHEET_GIFTS)
  if (!giftsSheet) {
    giftsSheet = ss.insertSheet(CONFIG.SHEET_GIFTS)
    giftsSheet.appendRow([
      'ID',
      'Nome',
      'Categoria',
      'Descrição',
      'Preço',
      'Ícone',
      'Reservado',
      'Reservado Por',
      'Tipo',
      'Pago',
    ])

    // Exemplo de presentes
    giftsSheet.appendRow([
      1,
      'Jogo de Panelas',
      'Cozinha',
      'Jogo de panelas antiaderente',
      450,
      '',
      false,
      '',
      'Casamento',
      false,
    ])
    giftsSheet.appendRow([
      2,
      'Edredom King',
      'Quarto',
      'Edredom king size 100% algodão',
      380,
      '',
      false,
      '',
      'Casamento',
      false,
    ])
  }

  // Aba de Reservas
  let reservationsSheet = ss.getSheetByName(CONFIG.SHEET_RESERVATIONS)
  if (!reservationsSheet) {
    reservationsSheet = ss.insertSheet(CONFIG.SHEET_RESERVATIONS)
    reservationsSheet.appendRow([
      'Data/Hora',
      'ID Presente',
      'Nome Presente',
      'Nome Convidado',
      'E-mail',
      'Telefone',
      'Mensagem',
      'Pago',
      'Transaction ID',
    ])
  }

  // Aba de Pagamentos
  let paymentsSheet = ss.getSheetByName(CONFIG.SHEET_PAYMENTS)
  if (!paymentsSheet) {
    paymentsSheet = ss.insertSheet(CONFIG.SHEET_PAYMENTS)
    paymentsSheet.appendRow([
      'Data/Hora',
      'Transaction NSU',
      'Order NSU',
      'Gift ID',
      'Valor (centavos)',
      'Método',
      'Receipt URL',
      'Raw Data',
    ])
  }

  Logger.log('Planilhas configuradas com sucesso!')
}
