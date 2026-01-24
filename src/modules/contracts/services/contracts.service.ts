import { supabase } from '@/services/supabase';
import type { Contract, ContractForm, ContractStats } from '../types';

export const contractsService = {
  /**
   * Lista todos os contratos
   */
  async getAll(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contratos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Erro ao buscar contratos:', error);
      throw new Error(error.message);
    }

    return data || [];
  },

  /**
   * Busca um contrato pelo ID
   */
  async getById(id: number): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contratos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('[Supabase] Erro ao buscar contrato:', error);
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Cria um novo contrato
   */
  async create(contract: ContractForm): Promise<Contract> {
    const { data, error } = await supabase
      .from('contratos')
      .insert({
        responsavel: contract.responsavel || null,
        empresa: contract.empresa || null,
        contato: contract.contato || null,
        valor: contract.valor ? Number(contract.valor) : null,
        pago: contract.pago ? Number(contract.pago) : null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Erro ao criar contrato:', error);
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Atualiza um contrato existente
   */
  async update(id: number, contract: ContractForm): Promise<Contract> {
    const { data, error } = await supabase
      .from('contratos')
      .update({
        responsavel: contract.responsavel || null,
        empresa: contract.empresa || null,
        contato: contract.contato || null,
        valor: contract.valor ? Number(contract.valor) : null,
        pago: contract.pago ? Number(contract.pago) : null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Erro ao atualizar contrato:', error);
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Remove um contrato
   */
  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('contratos').delete().eq('id', id);

    if (error) {
      console.error('[Supabase] Erro ao remover contrato:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Calcula estatísticas dos contratos
   */
  calculateStats(contracts: Contract[]): ContractStats {
    const totalValor = contracts.reduce(
      (sum, c) => sum + (c.valor || 0),
      0
    );
    const totalPago = contracts.reduce(
      (sum, c) => sum + (c.pago || 0),
      0
    );

    return {
      totalValor,
      totalPago,
      totalRestante: totalValor - totalPago,
    };
  },
};

export default contractsService;
