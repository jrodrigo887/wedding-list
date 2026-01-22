/**
 * ========================================
 * GOOGLE APPS SCRIPT - ENVIO DE EMAIL COM QR CODE
 * ========================================
 *
 * IMPORTANTE: Use doGet em vez de doPost para evitar redirect 302
 * O QR Code e gerado usando a API do Google Charts
 */

/**
 * Handler principal - use doGet para evitar problemas de CORS/redirect
 * Adicione os cases no seu doGet existente
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    switch(action) {
      case 'checkGuest':
        return checkGuest(e);
      case 'confirmPresence':
        return confirmPresence(e);
      case 'cancelPresence':
        return cancelPresence(e);
      case 'registerCheckin':
        return registerCheckin(e);
      case 'sendQRCodeEmail':
        return sendQRCodeEmail(e);
      default:
        return jsonResponse({ success: false, error: 'Acao desconhecida: ' + action });
    }
  } catch (error) {
    return jsonResponse({ success: false, error: 'Erro interno: ' + error.message });
  }
}

/**
 * Envia email com QR Code para o convidado
 * O QR Code e gerado usando a API do Google Charts
 */
function sendQRCodeEmail(e) {
  try {
    const code = e.parameter.code;
    const email = e.parameter.email;
    const name = e.parameter.name;

    if (!code || !email) {
      return jsonResponse({
        success: false,
        error: 'Parametros obrigatorios nao fornecidos'
      });
    }

    // Valida o email
    if (!isValidEmail(email)) {
      return jsonResponse({
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
        body {
          font-family: 'Georgia', serif;
          background-color: #FFF9F0;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #8B3A3A 0%, #C45C5C 100%);
          padding: 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: normal;
        }
        .header p {
          margin: 10px 0 0;
          font-style: italic;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
          text-align: center;
        }
        .greeting {
          font-size: 20px;
          color: #3d2b1f;
          margin-bottom: 20px;
        }
        .message {
          color: #5a4a3a;
          line-height: 1.6;
          margin-bottom: 25px;
        }
        .qrcode-section {
          background: #FFF9F0;
          border-radius: 12px;
          padding: 25px;
          margin: 20px 0;
          border: 2px dashed #E8DCC8;
        }
        .qrcode-title {
          font-size: 18px;
          color: #3d2b1f;
          margin: 0 0 10px;
        }
        .qrcode-subtitle {
          font-size: 14px;
          color: #8B7355;
          margin: 0 0 20px;
        }
        .qrcode-image {
          width: 200px;
          height: 200px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .qrcode-code {
          font-size: 24px;
          font-weight: bold;
          color: #3d2b1f;
          font-family: monospace;
          letter-spacing: 0.1em;
          margin-top: 15px;
        }
        .event-details {
          background: #f8f5f0;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        .event-details h3 {
          color: #3d2b1f;
          margin: 0 0 15px;
          font-size: 16px;
        }
        .event-details p {
          color: #5a4a3a;
          margin: 8px 0;
          font-size: 14px;
        }
        .footer {
          background: #3d2b1f;
          padding: 20px;
          text-align: center;
          color: #E8DCC8;
          font-size: 12px;
        }
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
            <img src="cid:qrcode" alt="QR Code" class="qrcode-image" />
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

    return jsonResponse({
      success: true,
      message: 'Email enviado com sucesso para ' + email
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      error: 'Erro ao enviar email: ' + error.message
    });
  }
}

/**
 * Cria resposta JSON
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Valida formato de email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * ========================================
 * INSTRUCOES DE INTEGRACAO
 * ========================================
 *
 * 1. No seu Google Apps Script, certifique-se de que TODAS as acoes
 *    estao no doGet() em vez de doPost()
 *
 * 2. Adicione a funcao sendQRCodeEmail() acima
 *
 * 3. O QR Code e gerado usando a API do Google Charts:
 *    https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=CODIGO
 *
 * 4. Faca uma NOVA implantacao:
 *    - Implantar > Nova implantacao > App da Web
 *    - Executar como: Eu
 *    - Quem tem acesso: Qualquer pessoa
 *
 * 5. Atualize a URL no .env
 *
 * ========================================
 * EXEMPLO COMPLETO DO doGet
 * ========================================
 *
 * function doGet(e) {
 *   try {
 *     const action = e.parameter.action;
 *
 *     switch(action) {
 *       case 'checkGuest':
 *         return checkGuest(e);
 *       case 'confirmPresence':
 *         return confirmPresence(e);
 *       case 'cancelPresence':
 *         return cancelPresence(e);
 *       case 'registerCheckin':
 *         return registerCheckin(e);
 *       case 'sendQRCodeEmail':
 *         return sendQRCodeEmail(e);
 *       default:
 *         return jsonResponse({ success: false, error: 'Acao desconhecida' });
 *     }
 *   } catch (error) {
 *     return jsonResponse({ success: false, error: error.message });
 *   }
 * }
 */
