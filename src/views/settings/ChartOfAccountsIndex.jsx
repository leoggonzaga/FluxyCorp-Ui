import { useEffect, useMemo, useState } from 'react'
import { Card, Notification, toast } from '@/components/ui'
import { ConfirmDialog } from '@/components/shared'
import PillTabs from '@/components/shared/PillTabs'
import {
    HiOutlineBookOpen,
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineX,
    HiOutlineCheck,
    HiOutlineChevronRight,
    HiOutlineChevronDown,
    HiOutlineCash,
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
    HiOutlineLibrary,
    HiOutlineClipboardList,
    HiOutlineSearch,
    HiOutlineFilter,
    HiOutlineTag,
    HiOutlineCollection,
    HiOutlineLightningBolt,
    HiOutlineRefresh,
    HiOutlineDocumentDuplicate,
} from 'react-icons/hi'

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPES = [
    {
        value: 'receita',
        label: 'Receitas',
        labelSingular: 'Receita',
        icon: HiOutlineTrendingUp,
        iconBg: 'bg-emerald-500',
        color: 'emerald',
        badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        border: 'border-l-emerald-400',
        dot: 'bg-emerald-400',
        header: 'bg-emerald-50 dark:bg-emerald-900/20',
        line: 'from-emerald-200 dark:from-emerald-700',
        ring: 'focus:ring-emerald-400/30 focus:border-emerald-400',
        pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        code: '1',
    },
    {
        value: 'despesa',
        label: 'Despesas',
        labelSingular: 'Despesa',
        icon: HiOutlineTrendingDown,
        iconBg: 'bg-rose-500',
        color: 'rose',
        badge: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        border: 'border-l-rose-400',
        dot: 'bg-rose-400',
        header: 'bg-rose-50 dark:bg-rose-900/20',
        line: 'from-rose-200 dark:from-rose-700',
        ring: 'focus:ring-rose-400/30 focus:border-rose-400',
        pill: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        code: '2',
    },
    {
        value: 'ativo',
        label: 'Ativos',
        labelSingular: 'Ativo',
        icon: HiOutlineLibrary,
        iconBg: 'bg-blue-500',
        color: 'blue',
        badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        border: 'border-l-blue-400',
        dot: 'bg-blue-400',
        header: 'bg-blue-50 dark:bg-blue-900/20',
        line: 'from-blue-200 dark:from-blue-700',
        ring: 'focus:ring-blue-400/30 focus:border-blue-400',
        pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        code: '3',
    },
    {
        value: 'passivo',
        label: 'Passivos',
        labelSingular: 'Passivo',
        icon: HiOutlineClipboardList,
        iconBg: 'bg-amber-500',
        color: 'amber',
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        border: 'border-l-amber-400',
        dot: 'bg-amber-400',
        header: 'bg-amber-50 dark:bg-amber-900/20',
        line: 'from-amber-200 dark:from-amber-700',
        ring: 'focus:ring-amber-400/30 focus:border-amber-400',
        pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        code: '4',
    },
]

const NATURES = [
    { value: 'sintetica', label: 'Sintética', sub: 'Grupo / Agrupador' },
    { value: 'analitica', label: 'Analítica', sub: 'Conta de lançamento' },
]

const typeMeta = (v) => TYPES.find((t) => t.value === v) ?? TYPES[0]

const STORAGE_KEY = 'fluxy_chart_of_accounts'

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED = [
    // ── Receitas ──────────────────────────────────────────────────────────────
    { id: 'r1',   code: '1',       name: 'Receitas',                            type: 'receita', nature: 'sintetica', parentId: null,  description: 'Grupo raiz de receitas' },
    { id: 'r1.1', code: '1.1',     name: 'Receitas Operacionais',               type: 'receita', nature: 'sintetica', parentId: 'r1',  description: '' },
    { id: 'r1.1.1', code: '1.1.1', name: 'Consultas Médicas / Odontológicas',   type: 'receita', nature: 'analitica', parentId: 'r1.1', description: 'Receitas provenientes de consultas' },
    { id: 'r1.1.2', code: '1.1.2', name: 'Procedimentos e Tratamentos',         type: 'receita', nature: 'analitica', parentId: 'r1.1', description: 'Cirurgias, extrações, implantes etc.' },
    { id: 'r1.1.3', code: '1.1.3', name: 'Exames e Laudos',                     type: 'receita', nature: 'analitica', parentId: 'r1.1', description: 'Radiografias, moldes, laudos periciais' },
    { id: 'r1.1.4', code: '1.1.4', name: 'Urgências e Emergências',             type: 'receita', nature: 'analitica', parentId: 'r1.1', description: 'Atendimentos fora do horário regular' },
    { id: 'r1.2', code: '1.2',     name: 'Convênios e Planos de Saúde',         type: 'receita', nature: 'sintetica', parentId: 'r1',  description: '' },
    { id: 'r1.2.1', code: '1.2.1', name: 'Planos Odontológicos',                type: 'receita', nature: 'analitica', parentId: 'r1.2', description: 'Repasses de planos odontológicos' },
    { id: 'r1.2.2', code: '1.2.2', name: 'Planos de Saúde Médicos',             type: 'receita', nature: 'analitica', parentId: 'r1.2', description: 'Repasses de planos de saúde' },
    { id: 'r1.2.3', code: '1.2.3', name: 'Glosas e Deduções',                   type: 'receita', nature: 'analitica', parentId: 'r1.2', description: 'Estornos e glosas de convênios (redutora)' },
    { id: 'r1.3', code: '1.3',     name: 'Venda de Produtos',                   type: 'receita', nature: 'sintetica', parentId: 'r1',  description: '' },
    { id: 'r1.3.1', code: '1.3.1', name: 'Próteses e Aparelhos',                type: 'receita', nature: 'analitica', parentId: 'r1.3', description: 'Próteses dentárias, aparelhos ortodônticos' },
    { id: 'r1.3.2', code: '1.3.2', name: 'Produtos de Higiene e Cuidado',       type: 'receita', nature: 'analitica', parentId: 'r1.3', description: 'Kits de higiene, enxaguantes etc.' },
    { id: 'r1.4', code: '1.4',     name: 'Outras Receitas',                     type: 'receita', nature: 'sintetica', parentId: 'r1',  description: '' },
    { id: 'r1.4.1', code: '1.4.1', name: 'Multas e Juros Recebidos',            type: 'receita', nature: 'analitica', parentId: 'r1.4', description: 'Cobranças de inadimplência' },
    { id: 'r1.4.2', code: '1.4.2', name: 'Receitas Financeiras',                type: 'receita', nature: 'analitica', parentId: 'r1.4', description: 'Rendimentos de aplicações' },

    // ── Despesas ──────────────────────────────────────────────────────────────
    { id: 'd1',   code: '2',       name: 'Despesas',                            type: 'despesa', nature: 'sintetica', parentId: null,  description: 'Grupo raiz de despesas' },
    { id: 'd1.1', code: '2.1',     name: 'Pessoal e Encargos',                  type: 'despesa', nature: 'sintetica', parentId: 'd1',  description: '' },
    { id: 'd1.1.1', code: '2.1.1', name: 'Salários e Ordenados',                type: 'despesa', nature: 'analitica', parentId: 'd1.1', description: 'Folha de pagamento de funcionários' },
    { id: 'd1.1.2', code: '2.1.2', name: 'Pró-labore dos Sócios',               type: 'despesa', nature: 'analitica', parentId: 'd1.1', description: 'Remuneração dos proprietários' },
    { id: 'd1.1.3', code: '2.1.3', name: 'Encargos Trabalhistas (FGTS/INSS)',   type: 'despesa', nature: 'analitica', parentId: 'd1.1', description: 'Contribuições previdenciárias e FGTS' },
    { id: 'd1.1.4', code: '2.1.4', name: 'Benefícios (VT, VA, Plano de Saúde)', type: 'despesa', nature: 'analitica', parentId: 'd1.1', description: 'Vale transporte, alimentação, saúde' },
    { id: 'd1.1.5', code: '2.1.5', name: 'Rescisões e Verbas Trabalhistas',     type: 'despesa', nature: 'analitica', parentId: 'd1.1', description: '13º, férias, rescisões' },
    { id: 'd1.2', code: '2.2',     name: 'Instalações e Imóvel',                type: 'despesa', nature: 'sintetica', parentId: 'd1',  description: '' },
    { id: 'd1.2.1', code: '2.2.1', name: 'Aluguel do Consultório',              type: 'despesa', nature: 'analitica', parentId: 'd1.2', description: '' },
    { id: 'd1.2.2', code: '2.2.2', name: 'Condomínio e IPTU',                   type: 'despesa', nature: 'analitica', parentId: 'd1.2', description: '' },
    { id: 'd1.2.3', code: '2.2.3', name: 'Energia Elétrica',                    type: 'despesa', nature: 'analitica', parentId: 'd1.2', description: '' },
    { id: 'd1.2.4', code: '2.2.4', name: 'Água e Saneamento',                   type: 'despesa', nature: 'analitica', parentId: 'd1.2', description: '' },
    { id: 'd1.2.5', code: '2.2.5', name: 'Internet e Telefone',                 type: 'despesa', nature: 'analitica', parentId: 'd1.2', description: '' },
    { id: 'd1.3', code: '2.3',     name: 'Materiais e Insumos Clínicos',        type: 'despesa', nature: 'sintetica', parentId: 'd1',  description: '' },
    { id: 'd1.3.1', code: '2.3.1', name: 'Material de Consumo Odontológico',    type: 'despesa', nature: 'analitica', parentId: 'd1.3', description: 'Resinas, anestésicos, brocas etc.' },
    { id: 'd1.3.2', code: '2.3.2', name: 'EPIs e Descartáveis',                 type: 'despesa', nature: 'analitica', parentId: 'd1.3', description: 'Luvas, máscaras, aventais' },
    { id: 'd1.3.3', code: '2.3.3', name: 'Próteses e Laboratório',              type: 'despesa', nature: 'analitica', parentId: 'd1.3', description: 'Custo de laboratórios protéticos' },
    { id: 'd1.3.4', code: '2.3.4', name: 'Medicamentos e Fármacos',             type: 'despesa', nature: 'analitica', parentId: 'd1.3', description: '' },
    { id: 'd1.4', code: '2.4',     name: 'Equipamentos',                        type: 'despesa', nature: 'sintetica', parentId: 'd1',  description: '' },
    { id: 'd1.4.1', code: '2.4.1', name: 'Manutenção de Equipamentos',          type: 'despesa', nature: 'analitica', parentId: 'd1.4', description: 'Cadeiras, aparelhos de RX, autoclaves' },
    { id: 'd1.4.2', code: '2.4.2', name: 'Depreciação de Equipamentos',         type: 'despesa', nature: 'analitica', parentId: 'd1.4', description: 'Depreciação contábil' },
    { id: 'd1.4.3', code: '2.4.3', name: 'Locação de Equipamentos',             type: 'despesa', nature: 'analitica', parentId: 'd1.4', description: 'Leasing / aluguel de equipamentos' },
    { id: 'd1.5', code: '2.5',     name: 'Serviços de Terceiros',               type: 'despesa', nature: 'sintetica', parentId: 'd1',  description: '' },
    { id: 'd1.5.1', code: '2.5.1', name: 'Contabilidade e Escritório',          type: 'despesa', nature: 'analitica', parentId: 'd1.5', description: '' },
    { id: 'd1.5.2', code: '2.5.2', name: 'Assessoria Jurídica',                 type: 'despesa', nature: 'analitica', parentId: 'd1.5', description: '' },
    { id: 'd1.5.3', code: '2.5.3', name: 'TI e Sistemas de Gestão',             type: 'despesa', nature: 'analitica', parentId: 'd1.5', description: 'Software, suporte técnico' },
    { id: 'd1.5.4', code: '2.5.4', name: 'Esterilização e Gestão de Resíduos',  type: 'despesa', nature: 'analitica', parentId: 'd1.5', description: 'PGRSS, coleta de resíduo hospitalar' },
    { id: 'd1.6', code: '2.6',     name: 'Marketing e Comunicação',             type: 'despesa', nature: 'sintetica', parentId: 'd1',  description: '' },
    { id: 'd1.6.1', code: '2.6.1', name: 'Publicidade e Anúncios',              type: 'despesa', nature: 'analitica', parentId: 'd1.6', description: 'Google Ads, redes sociais etc.' },
    { id: 'd1.6.2', code: '2.6.2', name: 'Material Gráfico e Branding',         type: 'despesa', nature: 'analitica', parentId: 'd1.6', description: '' },
    { id: 'd1.7', code: '2.7',     name: 'Impostos e Tributos',                 type: 'despesa', nature: 'sintetica', parentId: 'd1',  description: '' },
    { id: 'd1.7.1', code: '2.7.1', name: 'ISS',                                 type: 'despesa', nature: 'analitica', parentId: 'd1.7', description: 'Imposto Sobre Serviços' },
    { id: 'd1.7.2', code: '2.7.2', name: 'Simples Nacional / Outros Tributos',  type: 'despesa', nature: 'analitica', parentId: 'd1.7', description: '' },
    { id: 'd1.7.3', code: '2.7.3', name: 'COFINS / PIS',                        type: 'despesa', nature: 'analitica', parentId: 'd1.7', description: '' },
    { id: 'd1.8', code: '2.8',     name: 'Despesas Financeiras',                type: 'despesa', nature: 'sintetica', parentId: 'd1',  description: '' },
    { id: 'd1.8.1', code: '2.8.1', name: 'Tarifas Bancárias e IOF',             type: 'despesa', nature: 'analitica', parentId: 'd1.8', description: '' },
    { id: 'd1.8.2', code: '2.8.2', name: 'Juros de Financiamentos',             type: 'despesa', nature: 'analitica', parentId: 'd1.8', description: '' },
    { id: 'd1.8.3', code: '2.8.3', name: 'Taxas de Cartão e Gateway',           type: 'despesa', nature: 'analitica', parentId: 'd1.8', description: 'MDR e taxa de antecipação' },

    // ── Ativos ────────────────────────────────────────────────────────────────
    { id: 'a1',   code: '3',       name: 'Ativos',                              type: 'ativo',   nature: 'sintetica', parentId: null,  description: 'Grupo raiz de ativos' },
    { id: 'a1.1', code: '3.1',     name: 'Ativo Circulante',                    type: 'ativo',   nature: 'sintetica', parentId: 'a1',  description: '' },
    { id: 'a1.1.1', code: '3.1.1', name: 'Caixa Geral',                         type: 'ativo',   nature: 'analitica', parentId: 'a1.1', description: 'Dinheiro em espécie no consultório' },
    { id: 'a1.1.2', code: '3.1.2', name: 'Conta Corrente',                      type: 'ativo',   nature: 'analitica', parentId: 'a1.1', description: 'Saldo em conta bancária' },
    { id: 'a1.1.3', code: '3.1.3', name: 'Conta Poupança / Aplicação',          type: 'ativo',   nature: 'analitica', parentId: 'a1.1', description: '' },
    { id: 'a1.1.4', code: '3.1.4', name: 'Contas a Receber — Pacientes',        type: 'ativo',   nature: 'analitica', parentId: 'a1.1', description: 'Créditos de pacientes em aberto' },
    { id: 'a1.1.5', code: '3.1.5', name: 'Contas a Receber — Convênios',        type: 'ativo',   nature: 'analitica', parentId: 'a1.1', description: 'Repasses a receber de planos' },
    { id: 'a1.1.6', code: '3.1.6', name: 'Estoques de Materiais',               type: 'ativo',   nature: 'analitica', parentId: 'a1.1', description: 'Inventário de materiais clínicos' },
    { id: 'a1.2', code: '3.2',     name: 'Ativo Não Circulante',                type: 'ativo',   nature: 'sintetica', parentId: 'a1',  description: '' },
    { id: 'a1.2.1', code: '3.2.1', name: 'Equipamentos Odontológicos',          type: 'ativo',   nature: 'analitica', parentId: 'a1.2', description: 'Cadeiras, compressores, autoclaves' },
    { id: 'a1.2.2', code: '3.2.2', name: 'Mobiliário e Decoração',              type: 'ativo',   nature: 'analitica', parentId: 'a1.2', description: '' },
    { id: 'a1.2.3', code: '3.2.3', name: 'Computadores e Sistemas',             type: 'ativo',   nature: 'analitica', parentId: 'a1.2', description: '' },
    { id: 'a1.2.4', code: '3.2.4', name: '(-) Depreciação Acumulada',           type: 'ativo',   nature: 'analitica', parentId: 'a1.2', description: 'Conta redutora do imobilizado' },

    // ── Passivos ──────────────────────────────────────────────────────────────
    { id: 'p1',   code: '4',       name: 'Passivos',                            type: 'passivo', nature: 'sintetica', parentId: null,  description: 'Grupo raiz de passivos' },
    { id: 'p1.1', code: '4.1',     name: 'Passivo Circulante',                  type: 'passivo', nature: 'sintetica', parentId: 'p1',  description: '' },
    { id: 'p1.1.1', code: '4.1.1', name: 'Fornecedores a Pagar',                type: 'passivo', nature: 'analitica', parentId: 'p1.1', description: 'Compras a prazo de materiais' },
    { id: 'p1.1.2', code: '4.1.2', name: 'Salários a Pagar',                    type: 'passivo', nature: 'analitica', parentId: 'p1.1', description: '' },
    { id: 'p1.1.3', code: '4.1.3', name: 'Impostos a Recolher',                 type: 'passivo', nature: 'analitica', parentId: 'p1.1', description: 'ISS, Simples, FGTS, INSS' },
    { id: 'p1.1.4', code: '4.1.4', name: 'Adiantamentos de Pacientes',          type: 'passivo', nature: 'analitica', parentId: 'p1.1', description: 'Valores recebidos antecipadamente' },
    { id: 'p1.1.5', code: '4.1.5', name: 'Financiamentos de Curto Prazo',       type: 'passivo', nature: 'analitica', parentId: 'p1.1', description: 'Parcelas do ano corrente' },
    { id: 'p1.2', code: '4.2',     name: 'Passivo Não Circulante',              type: 'passivo', nature: 'sintetica', parentId: 'p1',  description: '' },
    { id: 'p1.2.1', code: '4.2.1', name: 'Financiamentos de Longo Prazo',       type: 'passivo', nature: 'analitica', parentId: 'p1.2', description: 'Leasing de equipamentos, CDC' },
    { id: 'p1.2.2', code: '4.2.2', name: 'Provisão para Contingências',         type: 'passivo', nature: 'analitica', parentId: 'p1.2', description: 'Provisões trabalhistas ou fiscais' },
    { id: 'p1.3', code: '4.3',     name: 'Patrimônio Líquido',                  type: 'passivo', nature: 'sintetica', parentId: 'p1',  description: '' },
    { id: 'p1.3.1', code: '4.3.1', name: 'Capital Social',                      type: 'passivo', nature: 'analitica', parentId: 'p1.3', description: '' },
    { id: 'p1.3.2', code: '4.3.2', name: 'Reservas e Lucros Acumulados',        type: 'passivo', nature: 'analitica', parentId: 'p1.3', description: '' },
]

const withDefaults = (acc) => ({ isActive: true, description: '', ...acc })

// ─── Storage ──────────────────────────────────────────────────────────────────

const loadFromStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw)
    } catch (_) {}
    return SEED.map(withDefaults)
}

const saveToStorage = (data) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch (_) {}
}

const genId = () => `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ icon, message, sub, action }) => (
    <div className='flex flex-col items-center justify-center py-10 gap-2.5 select-none'>
        <div className='w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600'>
            <span className='text-2xl'>{icon}</span>
        </div>
        <div className='text-center'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{message}</p>
            {sub && <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>{sub}</p>}
        </div>
        {action && <div className='mt-1'>{action}</div>}
    </div>
)

// ─── Field ────────────────────────────────────────────────────────────────────

const Field = ({ label, error, children, hint }) => (
    <div>
        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide'>
            {label}
        </label>
        {children}
        {hint && !error && <p className='text-xs text-gray-400 mt-1'>{hint}</p>}
        {error && <p className='text-xs text-rose-500 mt-1'>{error}</p>}
    </div>
)

const TopKpiCard = ({ icon, label, value, color, shadowColor, sub, onClick, active }) => (
    <Card
        className={`border-l-4 ${color} backdrop-blur-sm bg-white/80 dark:bg-gray-900/60 ${
            onClick
                ? `!cursor-pointer transition-shadow ${active && shadowColor ? `hover:${shadowColor}` : 'hover:shadow-sm'}`
                : ''
        } ${active && shadowColor ? shadowColor : ''}`}
        style={{
            ...(onClick ? { cursor: 'pointer' } : {}),
        }}
        onClick={onClick}
        title={onClick ? 'Clique para filtrar' : undefined}
    >
        <div className={onClick ? '!cursor-pointer relative flex items-center justify-between' : 'relative flex items-center justify-between'}>
            <div>
                <p className='text-sm text-gray-500 dark:text-gray-400 font-medium'>{label}</p>
                <p className='text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1 tabular-nums'>{value}</p>
                {sub && <p className='text-xs text-gray-400 mt-1'>{sub}</p>}
                {active && (
                    <div className='mt-1.5 inline-flex items-center gap-1.5'>
                        <span className='w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse' />
                        <span className='text-[10px] font-semibold text-violet-600 dark:text-violet-300'>ativo</span>
                    </div>
                )}
            </div>
            <div className='p-3 rounded-xl bg-gray-100 dark:bg-gray-800'>
                {icon}
            </div>
        </div>
    </Card>
)

// ─── Suggest next code ────────────────────────────────────────────────────────

const suggestCode = (allAccounts, parentId, type) => {
    if (!parentId) {
        const root = TYPES.find((t) => t.value === type)
        return root?.code ?? ''
    }
    const parent = allAccounts.find((a) => a.id === parentId)
    if (!parent) return ''
    const siblings = allAccounts.filter((a) => a.parentId === parentId)
    const lastNum = siblings.reduce((max, s) => {
        const parts = s.code.split('.')
        const last = parseInt(parts[parts.length - 1], 10)
        return isNaN(last) ? max : Math.max(max, last)
    }, 0)
    return `${parent.code}.${lastNum + 1}`
}

// ─── Account Upsert Dialog ────────────────────────────────────────────────────

const EMPTY_FORM = { name: '', type: 'receita', nature: 'analitica', parentId: '', code: '', description: '', isActive: true }

const AccountDialog = ({ isOpen, onClose, onSuccess, initial, allAccounts }) => {
    const isEdit = !!initial
    const [form, setForm]     = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setErrors({})
        if (initial) {
            setForm({
                name:        initial.name,
                type:        initial.type,
                nature:      initial.nature,
                parentId:    initial.parentId ?? '',
                code:        initial.code,
                description: initial.description ?? '',
                isActive:    initial.isActive ?? true,
            })
        } else {
            setForm(EMPTY_FORM)
        }
    }, [isOpen, initial])

    if (!isOpen) return null

    const set = (k, v) => {
        setForm((p) => {
            const next = { ...p, [k]: v }
            if (k === 'parentId' || k === 'type') {
                next.code = suggestCode(allAccounts, next.parentId || null, next.type)
            }
            return next
        })
        if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }))
    }

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Nome é obrigatório'
        if (!form.code.trim()) e.code = 'Código é obrigatório'
        const codeExists = allAccounts.some((a) => a.code === form.code.trim() && a.id !== initial?.id)
        if (codeExists) e.code = 'Código já existe no plano de contas'
        return e
    }

    const handleSubmit = () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setSaving(true)
        setTimeout(() => {
            const account = {
                id:          initial?.id ?? genId(),
                code:        form.code.trim(),
                name:        form.name.trim(),
                type:        form.type,
                nature:      form.nature,
                parentId:    form.parentId || null,
                description: form.description.trim() || '',
                isActive:    form.isActive,
            }
            setSaving(false)
            onSuccess(account, isEdit)
        }, 300)
    }

    const meta = typeMeta(form.type)
    const accent = isEdit
        ? 'focus:ring-amber-400/30 focus:border-amber-400'
        : 'focus:ring-violet-400/30 focus:border-violet-400'

    const inputCls = (err) => [
        'w-full py-2.5 px-3 text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100',
        'focus:outline-none focus:ring-2 transition-all',
        err
            ? 'border-rose-400 focus:ring-rose-400/30'
            : `border-gray-200 dark:border-gray-700 ${accent}`,
    ].join(' ')

    const parentOptions = allAccounts
        .filter((a) => a.id !== initial?.id && a.type === form.type && a.nature === 'sintetica')
        .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden'>

                {/* Header */}
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                        <HiOutlineBookOpen className={`w-5 h-5 ${isEdit ? 'text-amber-600 dark:text-amber-400' : 'text-violet-600 dark:text-violet-400'}`} />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100 text-base'>
                            {isEdit ? 'Editar Conta' : 'Nova Conta'}
                        </h3>
                        <p className='text-xs text-gray-400 mt-0.5'>
                            {isEdit ? `Editando: ${initial.code} — ${initial.name}` : 'Adicione uma conta ao plano de contas'}
                        </p>
                    </div>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>

                <div className='px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]'>

                    {/* Tipo */}
                    <Field label='Tipo *'>
                        <div className='grid grid-cols-4 gap-1.5'>
                            {TYPES.map((t) => {
                                const Icon = t.icon
                                const selected = form.type === t.value
                                return (
                                    <button
                                        key={t.value}
                                        type='button'
                                        onClick={() => set('type', t.value)}
                                        className={[
                                            'flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-xs font-medium transition-all',
                                            selected
                                                ? `${t.badge} border-current`
                                                : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                                        ].join(' ')}
                                    >
                                        <Icon className='w-4 h-4' />
                                        {t.labelSingular}
                                    </button>
                                )
                            })}
                        </div>
                    </Field>

                    {/* Natureza */}
                    <Field label='Natureza *' hint='Sintética = agrupador · Analítica = recebe lançamentos'>
                        <div className='grid grid-cols-2 gap-2'>
                            {NATURES.map((n) => (
                                <button
                                    key={n.value}
                                    type='button'
                                    onClick={() => set('nature', n.value)}
                                    className={[
                                        'flex flex-col items-start px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left',
                                        form.nature === n.value
                                            ? 'bg-violet-50 border-violet-300 text-violet-700 dark:bg-violet-900/20 dark:border-violet-600 dark:text-violet-300'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600',
                                    ].join(' ')}
                                >
                                    <span>{n.label}</span>
                                    <span className='text-gray-400 font-normal text-xs mt-0.5'>{n.sub}</span>
                                </button>
                            ))}
                        </div>
                    </Field>

                    {/* Conta Pai */}
                    <Field label='Conta Pai (opcional)' hint='Selecione um grupo para criar uma subconta'>
                        <select
                            value={form.parentId}
                            onChange={(e) => set('parentId', e.target.value)}
                            className={inputCls(false)}
                        >
                            <option value=''>Nenhuma (conta raiz)</option>
                            {parentOptions.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.code} — {a.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    {/* Código e Nome */}
                    <div className='grid grid-cols-3 gap-3'>
                        <Field label='Código *' error={errors.code}>
                            <input
                                placeholder='Ex: 1.1.3'
                                value={form.code}
                                onChange={(e) => set('code', e.target.value)}
                                className={inputCls(errors.code)}
                            />
                        </Field>
                        <div className='col-span-2'>
                            <Field label='Nome da Conta *' error={errors.name}>
                                <input
                                    placeholder='Ex: Consultas Odontológicas'
                                    value={form.name}
                                    onChange={(e) => set('name', e.target.value)}
                                    className={inputCls(errors.name)}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Descrição */}
                    <Field label='Descrição / Orientação'>
                        <textarea
                            placeholder='Orientação sobre o uso desta conta…'
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            rows={2}
                            className='w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all resize-none'
                        />
                    </Field>

                    {/* Status */}
                    {isEdit && (
                        <div className='flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'>
                            <div>
                                <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>Conta ativa</p>
                                <p className='text-xs text-gray-400'>Contas inativas não aparecem nas movimentações</p>
                            </div>
                            <button
                                type='button'
                                onClick={() => set('isActive', !form.isActive)}
                                className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${form.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.isActive ? 'translate-x-4.5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className='flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button
                        onClick={() => !saving && onClose()}
                        disabled={saving}
                        className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition'
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 text-white transition shadow-sm ${
                            isEdit
                                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                                : 'bg-violet-600 hover:bg-violet-700 shadow-violet-200'
                        }`}
                    >
                        {saving ? (
                            <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' /> Salvando…</>
                        ) : (
                            <><HiOutlineCheck className='w-4 h-4' /> {isEdit ? 'Salvar' : 'Criar Conta'}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Tree Node ────────────────────────────────────────────────────────────────

const AccountNode = ({ account, depth, allAccounts, expanded, onToggle, onEdit, onDelete, onAddChild }) => {
    const meta    = typeMeta(account.type)
    const TypeIcon = meta.icon
    const children = allAccounts.filter((a) => a.parentId === account.id)
        .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
    const hasChildren = children.length > 0
    const isExpanded  = expanded[account.id]
    const isSynth     = account.nature === 'sintetica'

    const depthPad = depth === 0 ? 'pl-0' : depth === 1 ? 'pl-5' : depth === 2 ? 'pl-10' : 'pl-14'
    const lineColor = depth > 0 ? `border-l-2 border-gray-100 dark:border-gray-700/50 ml-${depth === 1 ? 2 : depth === 2 ? 7 : 12}` : ''

    return (
        <div>
            <div
                className={[
                    'group flex items-center gap-2 py-2 px-3 rounded-xl transition-colors cursor-pointer',
                    'hover:bg-gray-50 dark:hover:bg-gray-800/60',
                    !account.isActive ? 'opacity-50' : '',
                    depthPad,
                ].join(' ')}
            >
                {/* Expand toggle */}
                <button
                    onClick={() => hasChildren && onToggle(account.id)}
                    className={`w-5 h-5 flex items-center justify-center rounded flex-shrink-0 transition-colors ${hasChildren ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' : 'text-transparent cursor-default'}`}
                >
                    {hasChildren
                        ? (isExpanded ? <HiOutlineChevronDown className='w-3.5 h-3.5' /> : <HiOutlineChevronRight className='w-3.5 h-3.5' />)
                        : <span className='w-3.5 h-3.5' />}
                </button>

                {/* Code badge */}
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg flex-shrink-0 tabular-nums ${meta.pill}`}>
                    {account.code}
                </span>

                {/* Nature dot */}
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSynth ? 'bg-gray-300 dark:bg-gray-600' : meta.dot}`} title={isSynth ? 'Sintética' : 'Analítica'} />

                {/* Name */}
                <span className={`text-sm flex-1 truncate ${isSynth ? 'font-semibold text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-300'}`}>
                    {account.name}
                </span>

                {/* Nature tag */}
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isSynth ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : `${meta.badge}`}`}>
                    {isSynth ? 'Sintética' : 'Analítica'}
                </span>

                {/* Children count */}
                {hasChildren && (
                    <span className='text-xs text-gray-400 flex-shrink-0 tabular-nums'>
                        {children.length}
                    </span>
                )}

                {/* Actions */}
                <div className='flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0'>
                    {isSynth && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddChild(account) }}
                            className='p-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 text-gray-400 hover:text-violet-500 transition'
                            title='Adicionar subconta'
                        >
                            <HiOutlinePlus className='w-3.5 h-3.5' />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(account) }}
                        className='p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-500 transition'
                        title='Editar'
                    >
                        <HiOutlinePencil className='w-3.5 h-3.5' />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(account) }}
                        className='p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition'
                        title='Excluir'
                    >
                        <HiOutlineTrash className='w-3.5 h-3.5' />
                    </button>
                </div>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div className={`ml-4 border-l border-gray-100 dark:border-gray-700/50 pl-1`}>
                    {children.map((child) => (
                        <AccountNode
                            key={child.id}
                            account={child}
                            depth={depth + 1}
                            allAccounts={allAccounts}
                            expanded={expanded}
                            onToggle={onToggle}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const ChartOfAccountsIndex = () => {
    const [accounts, setAccounts]     = useState(() => loadFromStorage())
    const [search, setSearch]         = useState('')
    const [filterType, setFilterType] = useState('')
    const [filterNature, setFilterNature] = useState('')
    const [expanded, setExpanded]     = useState({})
    const [dialog, setDialog]         = useState(false)
    const [editing, setEditing]       = useState(null)
    const [preParent, setPreParent]   = useState(null)
    const [deleting, setDeleting]     = useState(null)
    const [confirmOpen, setConfirmOpen] = useState(false)

    const persist = (data) => {
        setAccounts(data)
        saveToStorage(data)
    }

    const expandAll = () => {
        const map = {}
        accounts.forEach((a) => { map[a.id] = true })
        setExpanded(map)
    }

    const collapseAll = () => setExpanded({})

    const onToggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }))

    const openNew = (parentAccount = null) => {
        setEditing(null)
        setPreParent(parentAccount)
        setDialog(true)
    }

    const openEdit = (account) => {
        setEditing(account)
        setPreParent(null)
        setDialog(true)
    }

    const openDelete = (account) => {
        setDeleting(account)
        setConfirmOpen(true)
    }

    const handleSuccess = (account, isEdit) => {
        setDialog(false)
        if (isEdit) {
            persist(accounts.map((a) => a.id === account.id ? account : a))
            toast.push(<Notification type='success' title='Conta atualizada' />, { placement: 'top-center' })
        } else {
            persist([...accounts, account])
            setExpanded((p) => ({ ...p, [account.parentId]: true }))
            toast.push(<Notification type='success' title='Conta criada' />, { placement: 'top-center' })
        }
    }

    const handleDelete = () => {
        if (!deleting) return
        const hasChildren = accounts.some((a) => a.parentId === deleting.id)
        if (hasChildren) {
            toast.push(
                <Notification type='warning' title='Não é possível excluir' customIcon={<HiOutlineCollection className='text-amber-500' />}>
                    Esta conta possui subcontas. Remova-as antes de excluir o grupo.
                </Notification>,
                { placement: 'top-center' }
            )
            setConfirmOpen(false)
            setDeleting(null)
            return
        }
        persist(accounts.filter((a) => a.id !== deleting.id))
        toast.push(<Notification type='success' title='Conta removida' />, { placement: 'top-center' })
        setConfirmOpen(false)
        setDeleting(null)
    }

    const resetToDefault = () => {
        const data = SEED.map(withDefaults)
        persist(data)
        setExpanded({})
        toast.push(<Notification type='success' title='Plano de contas restaurado para o padrão' />, { placement: 'top-center' })
    }

    // Filtered flat list for search mode
    const flatFiltered = useMemo(() => {
        if (!search && !filterType && !filterNature) return null
        const q = search.toLowerCase()
        return accounts.filter((a) => {
            if (filterType && a.type !== filterType) return false
            if (filterNature && a.nature !== filterNature) return false
            if (q) return (
                a.name.toLowerCase().includes(q) ||
                a.code.toLowerCase().includes(q) ||
                (a.description ?? '').toLowerCase().includes(q)
            )
            return true
        }).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
    }, [accounts, search, filterType, filterNature])

    // Stats
    const stats = useMemo(() => {
        const total      = accounts.length
        const analiticas = accounts.filter((a) => a.nature === 'analitica').length
        const inativas   = accounts.filter((a) => !a.isActive).length
        const byType     = TYPES.map((t) => ({ ...t, count: accounts.filter((a) => a.type === t.value).length }))
        return { total, analiticas, inativas, byType }
    }, [accounts])

    // Root accounts per type (for tree mode)
    const rootsByType = useMemo(() => {
        const map = {}
        TYPES.forEach((t) => {
            map[t.value] = accounts
                .filter((a) => a.type === t.value && !a.parentId)
                .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
        })
        return map
    }, [accounts])

    const initialForDialog = useMemo(() => {
        if (editing) return editing
        if (preParent) return {
            ...EMPTY_FORM,
            type: preParent.type,
            parentId: preParent.id,
            code: suggestCode(accounts, preParent.id, preParent.type),
        }
        return null
    }, [editing, preParent, accounts])

    return (
        <div className='w-full p-4 space-y-4'>
            <AccountDialog
                isOpen={dialog}
                onClose={() => setDialog(false)}
                onSuccess={handleSuccess}
                initial={initialForDialog}
                allAccounts={accounts}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                type='danger'
                title='Excluir Conta'
                onClose={() => { setConfirmOpen(false); setDeleting(null) }}
                onConfirm={handleDelete}
            >
                <p>Deseja excluir a conta <strong>{deleting?.code} — {deleting?.name}</strong>?</p>
            </ConfirmDialog>

            {/* ── Header ── */}
            <div className='flex items-start justify-between gap-3 flex-wrap'>
                <div>
                    <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
                        <HiOutlineBookOpen className='w-6 h-6 text-violet-500' />
                        Plano de Contas
                    </h2>
                    <p className='text-sm text-gray-400 mt-0.5'>
                        Estrutura hierárquica de contas para classificação financeira da clínica
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={resetToDefault}
                        className='flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition'
                        title='Restaurar plano padrão de clínica'
                    >
                        <HiOutlineRefresh className='w-3.5 h-3.5' />
                        Restaurar Padrão
                    </button>
                    <button
                        onClick={() => openNew()}
                        className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm shadow-violet-200 whitespace-nowrap'
                    >
                        <HiOutlinePlus className='w-4 h-4' />
                        Nova Conta
                    </button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                {stats.byType.map((t) => {
                    const Icon = t.icon
                    return (
                        <TopKpiCard
                            key={t.value}
                            icon={<Icon className='w-7 h-7 text-gray-600 dark:text-gray-300' />}
                            label={t.label}
                            value={t.count}
                            color={t.value === 'receita'
                                ? 'border-emerald-500'
                                : t.value === 'despesa'
                                    ? 'border-rose-500'
                                    : t.value === 'ativo'
                                        ? 'border-blue-500'
                                        : 'border-amber-500'}
                            sub={filterType === t.value ? '' : 'Clique para filtrar'}
                            active={filterType === t.value}
                            shadowColor={t.value === 'receita'
                                ? 'shadow-[0_0_0_1px_rgba(16,185,129,0.18),0_10px_24px_-14px_rgba(16,185,129,0.45)]'
                                : t.value === 'despesa'
                                    ? 'shadow-[0_0_0_1px_rgba(244,63,94,0.18),0_10px_24px_-14px_rgba(244,63,94,0.45)]'
                                    : t.value === 'Ativo'
                                        ? 'shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_10px_24px_-14px_rgba(59,130,246,0.45)]'
                                        : 'shadow-[0_0_0_1px_rgba(245,158,11,0.18),0_10px_24px_-14px_rgba(245,158,11,0.45)]'}
                            onClick={() => setFilterType(filterType === t.value ? '' : t.value)}
                        />
                    )
                })}
            </div>

            {/* ── Filtros ── */}
            <Card className='border border-gray-100 dark:border-gray-700/50'>
                <div className='flex items-center gap-3 flex-wrap'>
                    <div className='relative flex-1 min-w-[200px]'>
                        <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4' />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Buscar por código ou nome…'
                            className='w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 placeholder-gray-400 transition-all'
                        />
                    </div>
                    <PillTabs
                        items={[
                            { value: '', label: 'Todos os tipos' },
                            ...TYPES.map((t) => ({ value: t.value, label: t.label })),
                        ]}
                        value={filterType}
                        onChange={setFilterType}
                    />
                    <select
                        value={filterNature}
                        onChange={(e) => setFilterNature(e.target.value)}
                        className='py-2.5 px-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition-all'
                    >
                        <option value=''>Sintéticas + Analíticas</option>
                        <option value='sintetica'>Somente Sintéticas</option>
                        <option value='analitica'>Somente Analíticas</option>
                    </select>
                    {!flatFiltered && (
                        <div className='flex items-center gap-1.5 ml-auto'>
                            <button onClick={expandAll} className='px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition'>
                                Expandir tudo
                            </button>
                            <button onClick={collapseAll} className='px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition'>
                                Recolher tudo
                            </button>
                        </div>
                    )}
                </div>
            </Card>

            {/* ── Content ── */}
            {flatFiltered ? (
                /* ── Search / filter results (flat list) ── */
                <Card className='border border-gray-100 dark:border-gray-700/50'>
                    <div className='flex items-center justify-between mb-3'>
                        <span className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                            {flatFiltered.length} resultado{flatFiltered.length !== 1 ? 's' : ''}
                        </span>
                        <button
                            onClick={() => { setSearch(''); setFilterType(''); setFilterNature('') }}
                            className='text-xs text-violet-600 hover:text-violet-700 transition font-medium'
                        >
                            Limpar filtros
                        </button>
                    </div>
                    {flatFiltered.length === 0 ? (
                        <EmptyState
                            icon={<HiOutlineSearch />}
                            message='Nenhuma conta encontrada'
                            sub='Tente ajustar os filtros ou criar uma nova conta'
                        />
                    ) : (
                        <div className='space-y-0.5'>
                            {flatFiltered.map((account) => {
                                const meta = typeMeta(account.type)
                                const Icon = meta.icon
                                return (
                                    <div key={account.id} className='group flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors'>
                                        <div className={`w-7 h-7 rounded-lg ${meta.iconBg} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className='w-3.5 h-3.5 text-white' />
                                        </div>
                                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg tabular-nums flex-shrink-0 ${meta.pill}`}>{account.code}</span>
                                        <span className={`text-sm flex-1 truncate ${account.nature === 'sintetica' ? 'font-semibold text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {account.name}
                                        </span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${account.nature === 'sintetica' ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : meta.badge}`}>
                                            {account.nature === 'sintetica' ? 'Sintética' : 'Analítica'}
                                        </span>
                                        {!account.isActive && (
                                            <span className='text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'>inativa</span>
                                        )}
                                        <div className='flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                                            <button onClick={() => openEdit(account)} className='p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-500 transition'>
                                                <HiOutlinePencil className='w-3.5 h-3.5' />
                                            </button>
                                            <button onClick={() => openDelete(account)} className='p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition'>
                                                <HiOutlineTrash className='w-3.5 h-3.5' />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Card>
            ) : (
                /* ── Tree view grouped by type ── */
                <div className='space-y-4'>
                    {TYPES.map((t) => {
                        const roots = rootsByType[t.value] ?? []
                        const Icon  = t.icon
                        const typeAccounts = accounts.filter((a) => a.type === t.value)
                        if (typeAccounts.length === 0 && filterType && filterType !== t.value) return null

                        return (
                            <Card key={t.value} className='border border-gray-100 dark:border-gray-700/50 overflow-hidden'>
                                {/* Section header */}
                                <div className={`flex items-center gap-3 -mx-5 -mt-5 mb-4 px-5 py-3.5 ${t.header} border-b border-gray-100 dark:border-gray-700/50`}>
                                    <div className={`w-8 h-8 rounded-xl ${t.iconBg} flex items-center justify-center shadow-sm`}>
                                        <Icon className='w-4 h-4 text-white' />
                                    </div>
                                    <div className='flex-1'>
                                        <span className='text-sm font-bold text-gray-700 dark:text-gray-200'>{t.label}</span>
                                        <span className='ml-2 text-xs text-gray-400 tabular-nums'>
                                            {typeAccounts.length} conta{typeAccounts.length !== 1 ? 's' : ''}
                                            {' · '}
                                            {typeAccounts.filter((a) => a.nature === 'analitica').length} analíticas
                                        </span>
                                    </div>
                                    <div className={`flex-1 h-px bg-gradient-to-r ${t.line} to-transparent`} />
                                    <button
                                        onClick={() => openNew({ type: t.value, id: null, nature: 'sintetica', code: t.code })}
                                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-dashed ${t.badge} border-current hover:opacity-80 transition`}
                                    >
                                        <HiOutlinePlus className='w-3 h-3' />
                                        Adicionar
                                    </button>
                                </div>

                                {roots.length === 0 ? (
                                    <EmptyState
                                        icon={<Icon />}
                                        message={`Nenhuma conta de ${t.labelSingular.toLowerCase()} cadastrada`}
                                        sub='Clique em "Adicionar" para criar a primeira conta deste grupo'
                                    />
                                ) : (
                                    <div className='space-y-0.5'>
                                        {roots.map((root) => (
                                            <AccountNode
                                                key={root.id}
                                                account={root}
                                                depth={0}
                                                allAccounts={accounts}
                                                expanded={expanded}
                                                onToggle={onToggle}
                                                onEdit={openEdit}
                                                onDelete={openDelete}
                                                onAddChild={(parent) => openNew(parent)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* ── Legend ── */}
            <Card className='border border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30'>
                <div className='flex flex-wrap items-center gap-x-6 gap-y-2'>
                    <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Legenda</span>
                    <div className='flex items-center gap-1.5'>
                        <span className='w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600' />
                        <span className='text-xs text-gray-500'>Sintética — grupo agrupador</span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                        <span className='w-2 h-2 rounded-full bg-violet-400' />
                        <span className='text-xs text-gray-500'>Analítica — recebe lançamentos</span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                        <HiOutlinePlus className='w-3 h-3 text-gray-400' />
                        <span className='text-xs text-gray-500'>Adicionar subconta (hover)</span>
                    </div>
                    <div className='flex items-center gap-1.5 ml-auto'>
                        <span className='text-xs text-gray-400'>Total: <strong className='text-gray-600 dark:text-gray-300'>{accounts.length}</strong> contas</span>
                        <span className='text-xs text-gray-300 dark:text-gray-600'>·</span>
                        <span className='text-xs text-gray-400'>Analíticas: <strong className='text-gray-600 dark:text-gray-300'>{stats.analiticas}</strong></span>
                        {stats.inativas > 0 && (
                            <>
                                <span className='text-xs text-gray-300 dark:text-gray-600'>·</span>
                                <span className='text-xs text-amber-500'>Inativas: <strong>{stats.inativas}</strong></span>
                            </>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default ChartOfAccountsIndex
