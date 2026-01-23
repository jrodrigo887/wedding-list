import { supabase } from "./supabase";

/**
 * Envia dados para o Google Apps Script (apenas como demonstrativo/backup)
 * Executado somente após sucesso no Supabase
 */
const syncToGoogleScript = async (action, data) => {
  const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  if (!googleScriptUrl) {
    console.log("[Google Script] URL não configurada, sincronização ignorada");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("action", action);
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    await fetch(googleScriptUrl, {
      method: "POST",
      body: formData,
    });
    console.log(`[Google Script] Dados sincronizados: ${action}`);
  } catch (error) {
    // Apenas loga o erro, não interrompe o fluxo
    console.warn("[Google Script] Erro ao sincronizar:", error.message);
  }
};

/**
 * Servico para gerenciar confirmacao de presenca dos convidados
 * Fonte de dados principal: Supabase
 * Google Apps Script: apenas backup/demonstrativo após sucesso
 */
export const rsvpService = {
  /**
   * Verifica se o codigo do convidado existe
   * @param {string} code - Codigo do convidado
   * @returns {Promise<Object>}
   */
  async checkGuestCode(code) {
    if (!code) {
      throw new Error("Código não informado");
    }

    const { data, error } = await supabase
      .from("convidados")
      .select("*")
      .ilike("codigo", code)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error(
          "Código não encontrado na lista de convidados. Por favor, verifique com os noivos.",
        );
      }
      console.error("[Supabase] Erro ao verificar convidado:", error);
      throw new Error(error.message);
    }

    return {
      codigo: data.codigo,
      nome: data.nome,
      parceiro: data.parceiro || "",
      acompanhantes: data.acompanhantes || 0,
      confirmado: data.confirmado || false,
      entrada_confirmada: data.checkin || false,
      horario_entrada: data.horario_entrada || "",
    };
  },

  /**
   * Confirma presenca do convidado
   * @param {string} code - Codigo do convidado
   * @returns {Promise<Object>}
   */
  async confirmPresence(code) {
    if (!code) {
      throw new Error("Código não informado");
    }

    // Busca o convidado
    const { data: guest, error: fetchError } = await supabase
      .from("convidados")
      .select("*")
      .ilike("codigo", code)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new Error(
          "Código não encontrado na lista de convidados. Por favor, verifique com os noivos.",
        );
      }
      throw new Error(fetchError.message);
    }

    // Atualiza confirmação
    const { error: updateError } = await supabase
      .from("convidados")
      .update({
        confirmado: true,
        data_confirmacao: new Date().toISOString(),
      })
      .eq("id", guest.id);

    if (updateError) {
      console.error("[Supabase] Erro ao confirmar presença:", updateError);
      throw new Error(updateError.message);
    }

    let message = `Presença confirmada com sucesso, ${guest.nome}!`;
    if (guest.parceiro) {
      message = `Presença confirmada com sucesso, ${guest.nome} e ${guest.parceiro}!`;
    }

    // Sincroniza com Google Script após sucesso
    syncToGoogleScript("confirmPresence", { code: guest.codigo });

    return {
      success: true,
      message,
      guest: {
        codigo: guest.codigo,
        nome: guest.nome,
        parceiro: guest.parceiro,
        acompanhantes: guest.acompanhantes || 0,
        confirmado: true,
      },
    };
  },

  /**
   * Cancela presenca do convidado
   * @param {string} code - Codigo do convidado
   * @returns {Promise<Object>}
   */
  async cancelPresence(code) {
    if (!code) {
      throw new Error("Código não informado");
    }

    // Busca o convidado
    const { data: guest, error: fetchError } = await supabase
      .from("convidados")
      .select("*")
      .ilike("codigo", code)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new Error(
          "Código não encontrado na lista de convidados. Por favor, verifique com os noivos.",
        );
      }
      throw new Error(fetchError.message);
    }

    // Atualiza confirmação para false
    const { error: updateError } = await supabase
      .from("convidados")
      .update({
        confirmado: false,
        data_confirmacao: new Date().toISOString(),
      })
      .eq("id", guest.id);

    if (updateError) {
      console.error("[Supabase] Erro ao cancelar presença:", updateError);
      throw new Error(updateError.message);
    }

    let message = `Presença cancelada com sucesso, ${guest.nome}!`;
    if (guest.parceiro) {
      message = `Presença cancelada com sucesso, ${guest.nome} e ${guest.parceiro}!`;
    }

    // Sincroniza com Google Script após sucesso
    syncToGoogleScript("cancelPresence", { code: guest.codigo });

    return {
      success: true,
      message,
      guest: {
        codigo: guest.codigo,
        nome: guest.nome,
        parceiro: guest.parceiro,
        acompanhantes: guest.acompanhantes || 0,
        confirmado: false,
      },
    };
  },

  /**
   * Registra check-in (entrada) do convidado no dia do evento
   * @param {string} code - Codigo do convidado
   * @returns {Promise<Object>}
   */
  async registerCheckin(code) {
    if (!code) {
      throw new Error("Código não informado");
    }

    // Busca o convidado
    const { data: guest, error: fetchError } = await supabase
      .from("convidados")
      .select("*")
      .ilike("codigo", code)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new Error("Código não encontrado na lista de convidados");
      }
      throw new Error(fetchError.message);
    }

    // Verifica se já fez check-in
    if (guest.checkin) {
      const horarioAnterior = guest.horario_entrada
        ? new Date(guest.horario_entrada).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      throw new Error(
        `Check-in já realizado${horarioAnterior ? " às " + horarioAnterior : ""}`,
      );
    }

    const now = new Date();
    const hora = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Registra o check-in
    const { error: updateError } = await supabase
      .from("convidados")
      .update({
        checkin: true,
        horario_entrada: now.toISOString(),
      })
      .eq("id", guest.id);

    if (updateError) {
      console.error("[Supabase] Erro ao registrar check-in:", updateError);
      throw new Error(updateError.message);
    }

    let message = `Check-in realizado para ${guest.nome}!`;
    if (guest.parceiro) {
      message = `Check-in realizado para ${guest.nome} e ${guest.parceiro}!`;
    }

    // Sincroniza com Google Script após sucesso
    syncToGoogleScript("registerCheckin", { code: guest.codigo });

    return {
      success: true,
      message,
      horario: hora,
    };
  },

  /**
   * Envia QR Code por email para o convidado
   * @param {Object} params - Parametros do email
   * @param {string} params.code - Codigo do convidado
   * @param {string} params.email - Email do destinatario
   * @param {string} params.name - Nome do convidado
   * @returns {Promise<Object>}
   */
  async sendQRCodeEmail({ code, email, name }) {
    const emailApiUrl = import.meta.env.VITE_EMAIL_API_URL;

    if (!emailApiUrl) {
      console.error("[Email] URL da API de email não configurada");
      throw new Error("Serviço de email não configurado");
    }

    try {
      const response = await fetch(emailApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, email, name }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao enviar email");
      }

      return data;
    } catch (error) {
      console.error("[Email] Erro ao enviar email:", error);
      throw new Error(error.message || "Erro ao enviar email");
    }
  },
};

export default rsvpService;
