import { supabase } from "./supabase";
import type { Guest, ConfirmPresenceResponse, CheckinResponse } from "@/types";

const syncToGoogleScript = async (
  action: string,
  data: Record<string, string>,
): Promise<void> => {
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
    console.warn(
      "[Google Script] Erro ao sincronizar:",
      error instanceof Error ? error.message : error,
    );
  }
};

/**
 * Servico para gerenciar confirmacao de presenca dos convidados
 * Fonte de dados principal: Supabase
 * Google Apps Script: apenas backup/demonstrativo apos sucesso
 */
export const rsvpService = {
  /**
   * Verifica se o codigo do convidado existe
   */
  async checkGuestCode(code: string): Promise<Guest> {
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
   */
  async confirmPresence(code: string): Promise<ConfirmPresenceResponse> {
    if (!code) {
      throw new Error("Código não informado");
    }

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
   */
  async cancelPresence(code: string): Promise<ConfirmPresenceResponse> {
    if (!code) {
      throw new Error("Código não informado");
    }

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
   */
  async registerCheckin(code: string): Promise<CheckinResponse> {
    if (!code) {
      throw new Error("Código não informado");
    }

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

    syncToGoogleScript("registerCheckin", { code: guest.codigo });

    return {
      success: true,
      message,
      horario: hora,
    };
  },

/**
   * Busca a quantidade de check-ins realizados
   */
  async getCheckinCount(): Promise<number> {
    const { count, error } = await supabase
      .from("convidados")
      .select("*", { count: "exact", head: true })
      .eq("checkin", true);

    if (error) {
      console.error("[Supabase] Erro ao buscar contagem de check-ins:", error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Busca estatísticas gerais dos convidados
   */
  async getGuestStats(): Promise<{
    total: number;
    confirmed: number;
    pending: number;
    checkedIn: number;
  }> {
    const [totalResult, confirmedResult, checkedInResult] = await Promise.all([
      supabase.from("convidados").select("*", { count: "exact", head: true }),
      supabase
        .from("convidados")
        .select("*", { count: "exact", head: true })
        .eq("confirmado", true),
      supabase
        .from("convidados")
        .select("*", { count: "exact", head: true })
        .eq("checkin", true),
    ]);

    const total = totalResult.count || 0;
    const confirmed = confirmedResult.count || 0;
    const checkedIn = checkedInResult.count || 0;

    return {
      total,
      confirmed,
      pending: total - confirmed,
      checkedIn,
    };
  },

  /**
   * Busca lista de convidados com check-in realizado
   */
  async getCheckedInGuests(): Promise<Guest[]> {
    const { data, error } = await supabase
      .from("convidados")
      .select("*")
      .eq("checkin", true)
      .order("horario_entrada", { ascending: false });

    if (error) {
      console.error("[Supabase] Erro ao buscar check-ins:", error);
      return [];
    }

    return (data || []).map((item) => ({
      codigo: item.codigo,
      nome: item.nome,
      parceiro: item.parceiro || "",
      acompanhantes: item.acompanhantes || 0,
      confirmado: item.confirmado || false,
      entrada_confirmada: item.checkin || false,
      horario_entrada: item.horario_entrada || "",
    }));
  },

  async sendQRCodeEmail(params: {
    code: string;
    email: string;
    name: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { code, email, name } = params;
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
      throw new Error(
        error instanceof Error ? error.message : "Erro ao enviar email",
      );
    }
  },
};

export default rsvpService;
