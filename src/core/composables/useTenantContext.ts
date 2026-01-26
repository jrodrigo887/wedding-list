// Tenant Context - Vue Provide/Inject para contexto de tenant
import { ref, provide, inject, readonly, type Ref, type DeepReadonly } from 'vue'
import type { TenantConfig } from '@/config/tenant'
import { clearRepositoryCache } from '@/core/factories/repositoryFactory'

// Símbolo único para injeção de dependência
const TENANT_CONTEXT_KEY = Symbol('TenantContext')

// Interface do contexto
interface TenantContext {
  tenant: DeepReadonly<Ref<TenantConfig>>
  updateTenant: (config: Partial<TenantConfig>) => void
  hasFeature: (feature: keyof TenantConfig['features']) => boolean
  isWithinLimit: (limit: keyof TenantConfig['limits'], current: number) => boolean
}

/**
 * Provedor do contexto de tenant
 * Deve ser chamado no componente raiz (App.vue ou layout)
 */
export function provideTenant(initialConfig: TenantConfig): TenantContext {
  const tenant = ref<TenantConfig>(initialConfig)

  /**
   * Atualiza parcialmente a configuração do tenant
   */
  const updateTenant = (config: Partial<TenantConfig>) => {
    tenant.value = { ...tenant.value, ...config }

    // Limpa cache de repositories quando o tenant muda
    if (config.id || config.backend) {
      clearRepositoryCache()
    }
  }

  /**
   * Verifica se uma feature está habilitada
   */
  const hasFeature = (feature: keyof TenantConfig['features']): boolean => {
    return tenant.value.features[feature] ?? false
  }

  /**
   * Verifica se um valor está dentro do limite do plano
   */
  const isWithinLimit = (limit: keyof TenantConfig['limits'], current: number): boolean => {
    const maxValue = tenant.value.limits[limit]
    return current < maxValue
  }

  const context: TenantContext = {
    tenant: readonly(tenant),
    updateTenant,
    hasFeature,
    isWithinLimit,
  }

  provide(TENANT_CONTEXT_KEY, context)

  return context
}

/**
 * Hook para consumir o contexto de tenant
 * Deve ser usado apenas em componentes filhos do provider
 */
export function useTenantContext(): TenantContext {
  const context = inject<TenantContext>(TENANT_CONTEXT_KEY)

  if (!context) {
    throw new Error(
      '[useTenantContext] Contexto de tenant não encontrado. ' +
        'Certifique-se de que provideTenant() foi chamado em um componente pai.'
    )
  }

  return context
}

/**
 * Hook simplificado que retorna apenas o tenant (readonly)
 */
export function useTenantConfig(): DeepReadonly<Ref<TenantConfig>> {
  const { tenant } = useTenantContext()
  return tenant
}
