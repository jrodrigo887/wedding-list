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
  SHEET_PAYMENTS: 'Pagamentos', 
  SHEET_GUESTS: 'Convidados',
  COLUNA_ENTRADA: 'Checkin',
  COLUNA_HORARIO: 'Horário'
}

/**
 * Endpoint GET - Buscar presentes ou verificar convidado
 */
function doGet(e) {
  try {
    const action = e.parameter.action
    // Passa e.parameter para as funcoes (elas esperam { code: 'xxx' })
    const params = e.parameter

    switch(action) {
      case 'getGifts':
        return getGiftsResponse()
      case 'checkGuest':
        return checkGuestCode(params.code)
      case 'confirmPresence':
        return confirmGuestPresence(params)
      case 'cancelPresence':
        return cancelGuestPresence(params)
      case 'registerCheckin':
        return registerCheckin(params)
      case 'sendQRCodeEmail':
        return sendQRCodeEmail(params)
      default:
        return createJsonResponse({ success: false, error: 'Acao nao reconhecida: ' + action })
    }
  } catch (error) {
    return createJsonResponse({ success: false, error: error.message })
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

    // RSVP: Confirmar presenca
    if (action === 'confirmPresence') {
      return confirmGuestPresence(data)
    }

    if (action === "registerCheckin") {
      return registerCheckin(data);
    }

    if (action === "cancelPresence") {
      return cancelGuestPresence(data);
    }

    return createJsonResponse({ error: 'Acao nao reconhecida' })
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
 * Cria resposta JSON com CORS headers
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  )
}


// ========================================
// FUNCOES DE RSVP - CONFIRMACAO DE PRESENCA
// ========================================

/**
 * Verifica se o codigo do convidado existe
 * @param {string} code - Codigo do convidado
 */
function checkGuestCode(code) {
  if (!code) {
    return createJsonResponse({
      success: false,
      error: 'Codigo nao informado',
    })
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_GUESTS)

  if (!sheet) {
    return createJsonResponse({
      success: false,
      error: 'Planilha de convidados nao encontrada. Execute setupGuestsSheet() primeiro.',
    })
  }

  const data = sheet.getDataRange().getValues()

  const headers = data[0];

  // Encontra os indices das colunas de check-in
  let checkinColIndex = -1;
  let horarioColIndex = -1;

  for (let j = 0; j < headers.length; j++) {
    const header = String(headers[j]).toLowerCase();
    if (header === 'checkin' || header === 'entrada' || header === 'entrada_confirmada') {
      checkinColIndex = j;
    }
    if (header === 'horário' || header === 'horario' || header === 'horario_entrada') {
      horarioColIndex = j;
    }
  }

  // Se nao encontrou as colunas, usa indices fixos
  if (checkinColIndex === -1) checkinColIndex = 6; // Coluna G (0-indexed)
  if (horarioColIndex === -1) horarioColIndex = 7; // Coluna H (0-indexed)

  // Procura o codigo na primeira coluna (A)
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toUpperCase() === String(code).toUpperCase()) {
      const entradaConfirmada = data[i][checkinColIndex] === true ||
                                data[i][checkinColIndex] === 'TRUE' ||
                                data[i][checkinColIndex] === 'Sim';

      const guest = {
        codigo: data[i][0],
        nome: data[i][1],
        parceiro: data[i][2] || '',
        acompanhantes: data[i][3] || 0,
        confirmado: data[i][4] === true || data[i][4] === 'TRUE' || data[i][4] === 'Sim',
        entrada_confirmada: entradaConfirmada,
        horario_entrada: entradaConfirmada ? (data[i][horarioColIndex] || '') : '',
      }

      return createJsonResponse({
        success: true,
        guest: guest,
      })
    }
  }

  return createJsonResponse({
    success: false,
    error: 'Codigo nao encontrado na lista de convidados. Por favor, verifique com os noivos.',
  })
}

/**
 * Confirma presenca do convidado
 * @param {object} data - Dados da confirmacao
 */
function confirmGuestPresence(data) {
  const code = data.code

  if (!code) {
    return createJsonResponse({
      success: false,
      error: 'Codigo nao informado',
    })
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_GUESTS)

  if (!sheet) {
    return createJsonResponse({
      success: false,
      error: 'Planilha de convidados nao encontrada',
    })
  }

  const dataRange = sheet.getDataRange().getValues()
  let rowIndex = -1

  // Procura o codigo na primeira coluna (A)
  for (let i = 1; i < dataRange.length; i++) {
    if (String(dataRange[i][0]).toUpperCase() === String(code).toUpperCase()) {
      rowIndex = i + 1 // +1 porque getValues e 0-indexed mas sheet e 1-indexed
      break
    }
  }

  if (rowIndex === -1) {
    return createJsonResponse({
      success: false,
      error: 'Codigo nao encontrado na lista de convidados. Por favor, verifique com os noivos.',
    })
  }

  // Atualiza a confirmacao na coluna E (5)
  sheet.getRange(rowIndex, 5).setValue(true)

  // Registra a data/hora da confirmacao na coluna F (6)
  sheet.getRange(rowIndex, 6).setValue(new Date().toLocaleString('pt-BR'))

  const guestName = dataRange[rowIndex - 1][1]
  const partnerName = dataRange[rowIndex - 1][2]

  let message = `Presenca confirmada com sucesso, ${guestName}!`
  if (partnerName) {
    message = `Presenca confirmada com sucesso, ${guestName} e ${partnerName}!`
  }

  return createJsonResponse({
    success: true,
    message: message,
    guest: {
      codigo: dataRange[rowIndex - 1][0],
      nome: guestName,
      parceiro: partnerName,
      acompanhantes: dataRange[rowIndex - 1][3] || 0,
      confirmado: true,
    },
  })
}

function cancelGuestPresence(data) {
  const code = data.code;

  if (!code) {
    return createJsonResponse({
      success: false,
      error: "Codigo nao informado",
    });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    CONFIG.SHEET_GUESTS,
  );

  if (!sheet) {
    return createJsonResponse({
      success: false,
      error: "Planilha de convidados nao encontrada",
    });
  }

  const dataRange = sheet.getDataRange().getValues();
  let rowIndex = -1;

  // Procura o codigo na primeira coluna (A)
  for (let i = 1; i < dataRange.length; i++) {
    if (String(dataRange[i][0]).toUpperCase() === String(code).toUpperCase()) {
      rowIndex = i + 1; // +1 porque getValues e 0-indexed mas sheet e 1-indexed
      break;
    }
  }

  if (rowIndex === -1) {
    return createJsonResponse({
      success: false,
      error:
        "Codigo nao encontrado na lista de convidados. Por favor, verifique com os noivos.",
    });
  }

  // Atualiza a confirmacao na coluna E (5)
  sheet.getRange(rowIndex, 5).setValue(false);

  // Registra a data/hora da confirmacao na coluna F (6)
  sheet.getRange(rowIndex, 6).setValue(new Date().toLocaleString("pt-BR"));

  const guestName = dataRange[rowIndex - 1][1];
  const partnerName = dataRange[rowIndex - 1][2];

  let message = `Presenca cancelada com sucesso, ${guestName}!`;
  if (partnerName) {
    message = `Presenca cancelada com sucesso, ${guestName} e ${partnerName}!`;
  }

  return createJsonResponse({
    success: true,
    message: message,
    guest: {
      codigo: dataRange[rowIndex - 1][0],
      nome: guestName,
      parceiro: partnerName,
      acompanhantes: dataRange[rowIndex - 1][3] || 0,
      confirmado: true,
    },
  });
}

/**
 * Registra check-in (entrada) do convidado no dia do evento
 * @param {object} data - Dados do check-in (data.code)
 */
function registerCheckin(data) {
  const code = data.code;

  if (!code) {
    return createJsonResponse({
      success: false,
      error: "Codigo nao informado",
    });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_GUESTS);

  if (!sheet) {
    return createJsonResponse({
      success: false,
      error: "Planilha de convidados nao encontrada",
    });
  }

  const dataRange = sheet.getDataRange().getValues();
  const headers = dataRange[0];

  // Encontra os indices das colunas de check-in
  let checkinColIndex = -1;
  let horarioColIndex = -1;

  for (let j = 0; j < headers.length; j++) {
    const header = String(headers[j]).toLowerCase();
    if (header === 'checkin' || header === 'entrada' || header === 'entrada_confirmada') {
      checkinColIndex = j;
    }
    if (header === 'horário' || header === 'horario' || header === 'horario_entrada') {
      horarioColIndex = j;
    }
  }

  // Se nao encontrou as colunas, usa indices fixos (G e H, ou seja, 7 e 8)
  if (checkinColIndex === -1) checkinColIndex = 6; // Coluna G (0-indexed)
  if (horarioColIndex === -1) horarioColIndex = 7; // Coluna H (0-indexed)

  let rowIndex = -1;

  // Procura o codigo na primeira coluna (A)
  for (let i = 1; i < dataRange.length; i++) {
    if (String(dataRange[i][0]).toUpperCase() === String(code).toUpperCase()) {
      rowIndex = i + 1; // +1 porque getValues e 0-indexed mas sheet e 1-indexed
      break;
    }
  }

  if (rowIndex === -1) {
    return createJsonResponse({
      success: false,
      error: "Codigo nao encontrado na lista de convidados",
    });
  }

  // Verifica se ja fez check-in
  const jaFezCheckin = dataRange[rowIndex - 1][checkinColIndex] === true ||
                       dataRange[rowIndex - 1][checkinColIndex] === 'TRUE' ||
                       dataRange[rowIndex - 1][checkinColIndex] === 'Sim';

  if (jaFezCheckin) {
    const horarioAnterior = dataRange[rowIndex - 1][horarioColIndex] || '';
    return createJsonResponse({
      success: false,
      error: `Check-in ja realizado${horarioAnterior ? ' as ' + horarioAnterior : ''}`,
    });
  }

  // Registra o check-in
  const now = new Date();
  const hora = Utilities.formatDate(now, "America/Sao_Paulo", "HH:mm");

  sheet.getRange(rowIndex, checkinColIndex + 1).setValue("Sim"); // +1 porque sheet e 1-indexed
  sheet.getRange(rowIndex, horarioColIndex + 1).setValue(hora);

  const guestName = dataRange[rowIndex - 1][1];
  const partnerName = dataRange[rowIndex - 1][2];

  let message = `Check-in realizado para ${guestName}!`;
  if (partnerName) {
    message = `Check-in realizado para ${guestName} e ${partnerName}!`;
  }

  return createJsonResponse({
    success: true,
    message: message,
    horario: hora,
  });
}

/**
 * Envia email com QR Code para o convidado
 * O QR Code e gerado usando a API do Google Charts
 */
function sendQRCodeEmail(data) {
  try {
    const code = data.code;
    const email = data.email;
    const name = data.name;

    if (!code || !email) {
      return createJsonResponse({
        success: false,
        error: 'Parametros obrigatorios nao fornecidos (code e email)'
      });
    }

    // Valida o email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createJsonResponse({
        success: false,
        error: 'Email invalido'
      });
    }

    // Gera URL do QR Code usando Google Charts API
    const qrCodeUrl = 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=' + encodeURIComponent(code);

    // Baixa a imagem do QR Code
    const qrCodeBlob = UrlFetchApp.fetch(qrCodeUrl).getBlob().setName('qrcode.png');

    // Configuracoes do casamento (ajuste conforme necessario)
    const BRIDE_NAME = 'Elisa';
    const GROOM_NAME = 'Rodrigo';
    const WEDDING_DATE = '12 de Abril de 2026';
    const WEDDING_LOCATION = 'Local do Evento';
    const WEDDING_TIME = '15:00';

    // Template do email em HTML
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Georgia', serif; background-color: #FFF9F0; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #8B3A3A 0%, #C45C5C 100%); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: normal; }
        .header p { margin: 10px 0 0; font-style: italic; opacity: 0.9; }
        .content { padding: 30px; text-align: center; }
        .greeting { font-size: 20px; color: #3d2b1f; margin-bottom: 20px; }
        .message { color: #5a4a3a; line-height: 1.6; margin-bottom: 25px; }
        .qrcode-section { background: #FFF9F0; border-radius: 12px; padding: 25px; margin: 20px 0; border: 2px dashed #E8DCC8; }
        .qrcode-title { font-size: 18px; color: #3d2b1f; margin: 0 0 10px; }
        .qrcode-subtitle { font-size: 14px; color: #8B7355; margin: 0 0 20px; }
        .qrcode-code { font-size: 24px; font-weight: bold; color: #3d2b1f; font-family: monospace; letter-spacing: 0.1em; margin-top: 15px; }
        .event-details { background: #f8f5f0; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .event-details h3 { color: #3d2b1f; margin: 0 0 15px; font-size: 16px; }
        .event-details p { color: #5a4a3a; margin: 8px 0; font-size: 14px; }
        .footer { background: #3d2b1f; padding: 20px; text-align: center; color: #E8DCC8; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${BRIDE_NAME} & ${GROOM_NAME}</h1>
          <p>Confirmacao de Presenca</p>
        </div>
        <div class="content">
          <p class="greeting">Ola, ${name || 'Convidado'}!</p>
          <p class="message">
            Estamos muito felizes em saber que voce confirmou presenca no nosso casamento!
            Abaixo esta o seu QR Code exclusivo para fazer o check-in no dia do evento.
          </p>
          <div class="qrcode-section">
            <h3 class="qrcode-title">Seu QR Code para Check-in</h3>
            <p class="qrcode-subtitle">Apresente este codigo na entrada do evento</p>
            <img src="cid:qrcode" alt="QR Code" style="width:200px;height:200px;border-radius:8px;" />
            <p class="qrcode-code">${code}</p>
          </div>
          <div class="event-details">
            <h3>Detalhes do Evento</h3>
            <p><strong>Data:</strong> ${WEDDING_DATE}</p>
            <p><strong>Horario:</strong> ${WEDDING_TIME}</p>
            <p><strong>Local:</strong> ${WEDDING_LOCATION}</p>
          </div>
          <p class="message">
            Guarde este email ou salve o QR Code no seu celular.
            Estamos ansiosos para celebrar esse momento especial com voce!
          </p>
        </div>
        <div class="footer">
          <p>Com carinho, ${BRIDE_NAME} & ${GROOM_NAME}</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Envia o email com QR Code como imagem inline
    MailApp.sendEmail({
      to: email,
      subject: 'Seu QR Code para o Casamento de ' + BRIDE_NAME + ' & ' + GROOM_NAME,
      htmlBody: htmlBody,
      inlineImages: {
        qrcode: qrCodeBlob
      }
    });

    return createJsonResponse({
      success: true,
      message: 'Email enviado com sucesso para ' + email
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: 'Erro ao enviar email: ' + error.message
    });
  }
}

