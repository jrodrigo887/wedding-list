/**
 * ========================================
 * GOOGLE APPS SCRIPT - FIX PARA CORS
 * ========================================
 *
 * O erro de CORS acontece quando o Google Apps Script retorna uma pagina de erro
 * em vez de JSON. Para evitar isso, TODAS as funcoes precisam estar dentro de
 * try/catch e retornar JSON.
 *
 * SUBSTITUA seu doPost() atual por este:
 */

function doPost(e) {
  try {
    const action = e.parameter.action;

    switch(action) {
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
    // IMPORTANTE: Sempre retornar JSON, mesmo em caso de erro
    return jsonResponse({ success: false, error: 'Erro interno: ' + error.message });
  }
}

/**
 * Funcao auxiliar para criar respostas JSON
 * Use esta funcao em TODAS as suas funcoes para garantir que sempre retorne JSON
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ========================================
 * EXEMPLO DE COMO DEVE SER A FUNCAO confirmPresence
 * ========================================
 */
function confirmPresence(e) {
  try {
    const code = e.parameter.code;

    if (!code) {
      return jsonResponse({ success: false, error: 'Codigo nao fornecido' });
    }

    // Sua logica aqui para atualizar a planilha...
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Convidados');
    const data = sheet.getDataRange().getValues();

    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === code) { // Assumindo que codigo esta na coluna A
        // Atualiza a coluna de confirmacao (ajuste o indice conforme sua planilha)
        sheet.getRange(i + 1, 5).setValue(true); // Coluna E = confirmado
        sheet.getRange(i + 1, 6).setValue(new Date()); // Coluna F = data confirmacao
        found = true;
        break;
      }
    }

    if (!found) {
      return jsonResponse({ success: false, error: 'Codigo nao encontrado' });
    }

    return jsonResponse({
      success: true,
      message: 'Presenca confirmada com sucesso!'
    });

  } catch (error) {
    return jsonResponse({ success: false, error: 'Erro ao confirmar: ' + error.message });
  }
}

/**
 * ========================================
 * CHECKLIST PARA RESOLVER CORS
 * ========================================
 *
 * 1. [ ] Todas as funcoes usam try/catch
 * 2. [ ] Todas as funcoes retornam jsonResponse()
 * 3. [ ] O doPost() tem try/catch global
 * 4. [ ] Faca uma NOVA implantacao (nao apenas atualizar)
 *        - Implantar > Nova implantacao > App da Web
 *        - Executar como: Eu
 *        - Quem tem acesso: Qualquer pessoa
 * 5. [ ] Atualize a URL no .env com a NOVA URL
 *
 * ========================================
 * DICA DE DEBUG
 * ========================================
 *
 * Se ainda tiver problemas, adicione logs:
 *
 * function doPost(e) {
 *   Logger.log('Requisicao recebida: ' + JSON.stringify(e.parameter));
 *   // ...resto do codigo
 * }
 *
 * E verifique os logs em: Ver > Logs de execucao
 */
