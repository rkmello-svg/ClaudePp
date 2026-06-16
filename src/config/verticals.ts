import { BusinessSegment } from '@/types'

export interface VerticalConfig {
  segment: BusinessSegment
  name: string
  icon: string
  accentColor: string
  recommendedModules: string[] // marketplace module slugs
  kpis: { key: string; label: string; format: 'currency' | 'number' | 'percent' }[]
  quickActions: { label: string; route: string }[]
}

// Business DNA: each vertical adapts modules, KPIs and quick actions.
export const VERTICALS: Record<string, VerticalConfig> = {
  [BusinessSegment.PADARIA]: {
    segment: BusinessSegment.PADARIA,
    name: 'Padaria',
    icon: '🥖',
    accentColor: '#d97706',
    recommendedModules: ['pos', 'catalog', 'bi'],
    kpis: [
      { key: 'daily_revenue', label: 'Faturamento do dia', format: 'currency' },
      { key: 'avg_ticket', label: 'Ticket médio', format: 'currency' },
      { key: 'production_waste', label: 'Perda de produção', format: 'percent' },
      { key: 'top_products', label: 'Itens mais vendidos', format: 'number' },
    ],
    quickActions: [
      { label: 'Abrir caixa', route: '/pos' },
      { label: 'Cadastrar produto', route: '/products' },
    ],
  },
  [BusinessSegment.RESTAURANTE]: {
    segment: BusinessSegment.RESTAURANTE,
    name: 'Restaurante',
    icon: '🍽️',
    accentColor: '#dc2626',
    recommendedModules: ['pos', 'tables', 'catalog'],
    kpis: [
      { key: 'daily_revenue', label: 'Faturamento do dia', format: 'currency' },
      { key: 'tables_occupied', label: 'Mesas ocupadas', format: 'number' },
      { key: 'avg_ticket', label: 'Ticket médio', format: 'currency' },
      { key: 'avg_time', label: 'Tempo médio de mesa', format: 'number' },
    ],
    quickActions: [
      { label: 'Abrir comanda', route: '/tables' },
      { label: 'Ver cardápio', route: '/catalog' },
    ],
  },
  [BusinessSegment.FARMACIA]: {
    segment: BusinessSegment.FARMACIA,
    name: 'Farmácia',
    icon: '💊',
    accentColor: '#0891b2',
    recommendedModules: ['pos', 'bi'],
    kpis: [
      { key: 'daily_revenue', label: 'Faturamento do dia', format: 'currency' },
      { key: 'controlled_sales', label: 'Vendas controladas', format: 'number' },
      { key: 'stock_value', label: 'Valor em estoque', format: 'currency' },
      { key: 'expiring_soon', label: 'Próx. ao vencimento', format: 'number' },
    ],
    quickActions: [
      { label: 'Nova venda', route: '/pos' },
      { label: 'Conferir estoque', route: '/products' },
    ],
  },
  [BusinessSegment.OFICINA]: {
    segment: BusinessSegment.OFICINA,
    name: 'Oficina',
    icon: '🔧',
    accentColor: '#4338ca',
    recommendedModules: ['scheduling', 'catalog'],
    kpis: [
      { key: 'open_orders', label: 'Ordens abertas', format: 'number' },
      { key: 'monthly_revenue', label: 'Faturamento do mês', format: 'currency' },
      { key: 'avg_repair', label: 'Ticket médio de serviço', format: 'currency' },
      { key: 'pending_quotes', label: 'Orçamentos pendentes', format: 'number' },
    ],
    quickActions: [
      { label: 'Nova ordem de serviço', route: '/invoices' },
      { label: 'Agendar atendimento', route: '/scheduling' },
    ],
  },
  [BusinessSegment.HOTEL]: {
    segment: BusinessSegment.HOTEL,
    name: 'Hotel',
    icon: '🏨',
    accentColor: '#7c3aed',
    recommendedModules: ['scheduling', 'bi', 'comms-hub'],
    kpis: [
      { key: 'occupancy', label: 'Taxa de ocupação', format: 'percent' },
      { key: 'daily_revenue', label: 'Faturamento do dia', format: 'currency' },
      { key: 'avg_daily_rate', label: 'Diária média', format: 'currency' },
      { key: 'checkins_today', label: 'Check-ins hoje', format: 'number' },
    ],
    quickActions: [
      { label: 'Nova reserva', route: '/scheduling' },
      { label: 'Ver hóspedes', route: '/crm/customers' },
    ],
  },
  [BusinessSegment.SALAO]: {
    segment: BusinessSegment.SALAO,
    name: 'Salão / Barbearia',
    icon: '💈',
    accentColor: '#db2777',
    recommendedModules: ['scheduling', 'catalog', 'comms-hub'],
    kpis: [
      { key: 'appointments_today', label: 'Agendamentos hoje', format: 'number' },
      { key: 'daily_revenue', label: 'Faturamento do dia', format: 'currency' },
      { key: 'avg_ticket', label: 'Ticket médio', format: 'currency' },
      { key: 'no_shows', label: 'Faltas', format: 'number' },
    ],
    quickActions: [
      { label: 'Agendar', route: '/scheduling' },
      { label: 'Registrar atendimento', route: '/invoices' },
    ],
  },
  [BusinessSegment.MERCEARIA]: {
    segment: BusinessSegment.MERCEARIA,
    name: 'Mercearia',
    icon: '🏪',
    accentColor: '#16a34a',
    recommendedModules: ['pos', 'catalog', 'bi'],
    kpis: [
      { key: 'daily_revenue', label: 'Faturamento do dia', format: 'currency' },
      { key: 'avg_ticket', label: 'Ticket médio', format: 'currency' },
      { key: 'stock_value', label: 'Valor em estoque', format: 'currency' },
      { key: 'low_stock', label: 'Itens em falta', format: 'number' },
    ],
    quickActions: [
      { label: 'Abrir caixa', route: '/pos' },
      { label: 'Repor estoque', route: '/products' },
    ],
  },
  [BusinessSegment.CONSTRUCAO]: {
    segment: BusinessSegment.CONSTRUCAO,
    name: 'Material de Construção',
    icon: '🧱',
    accentColor: '#ea580c',
    recommendedModules: ['pos', 'catalog', 'bi'],
    kpis: [
      { key: 'monthly_revenue', label: 'Faturamento do mês', format: 'currency' },
      { key: 'avg_ticket', label: 'Ticket médio', format: 'currency' },
      { key: 'stock_value', label: 'Valor em estoque', format: 'currency' },
      { key: 'pending_deliveries', label: 'Entregas pendentes', format: 'number' },
    ],
    quickActions: [
      { label: 'Novo pedido', route: '/invoices' },
      { label: 'Conferir estoque', route: '/products' },
    ],
  },
  [BusinessSegment.OUTROS]: {
    segment: BusinessSegment.OUTROS,
    name: 'Negócio',
    icon: '🏢',
    accentColor: '#0284c7',
    recommendedModules: ['catalog', 'bi'],
    kpis: [
      { key: 'monthly_revenue', label: 'Faturamento do mês', format: 'currency' },
      { key: 'active_customers', label: 'Clientes ativos', format: 'number' },
      { key: 'avg_ticket', label: 'Ticket médio', format: 'currency' },
      { key: 'overdue', label: 'Contas vencidas', format: 'number' },
    ],
    quickActions: [
      { label: 'Novo cliente', route: '/crm/customers' },
      { label: 'Nova fatura', route: '/invoices' },
    ],
  },
}

export function getVertical(segment?: string): VerticalConfig {
  if (segment && VERTICALS[segment]) return VERTICALS[segment]
  return VERTICALS[BusinessSegment.OUTROS]
}
