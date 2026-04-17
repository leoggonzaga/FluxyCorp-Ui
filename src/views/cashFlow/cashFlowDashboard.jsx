import { useState, useMemo } from 'react'
import {
    HiOutlineChartBar,
    HiOutlineCash,
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
    HiOutlinePlus,
    HiOutlineDocumentText,
    HiOutlineExclamation,
    HiOutlineArrowUp,
    HiOutlineArrowDown,
    HiOutlineCurrencyDollar,
    HiOutlineX,
    HiOutlineCheckCircle,
} from 'react-icons/hi'

// ─── helpers ───────────────────────────────────────────────────────────────
const fmt = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const fmtDate = (iso) => {
    if (!iso) return '—'
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

const diffDays = (iso) => {
    const today = new Date('2026-04-17')
    const target = new Date(iso)
    return Math.ceil((target - today) / 86400000)
}

// ─── mock data ─────────────────────────────────────────────────────────────
const MONTHLY_SERIES = [
    { key: 'Nov/25', receitas: 38200, despesas: 24100 },
    { key: 'Dez/25', receitas: 42500, despesas: 31200 },
    { key: 'Jan/26', receitas: 35800, despesas: 26400 },
    { key: 'Fev/26', receitas: 41200, despesas: 27800 },
    { key: 'Mar/26', receitas: 39600, despesas: 29100 },
    { key: 'Abr/26', receitas: 45200, despesas: 28700 },
]

const UPCOMING = [
    { id: 1, descricao: 'Aluguel do Consultório', fornecedor: 'Imobiliária Central', valor: 3800, venc: '2026-04-18', cat: 'Aluguel' },
    { id: 2, descricao: 'Material Odontológico', fornecedor: 'Dental Supplies Ltda', valor: 2150, venc: '2026-04-20', cat: 'Material' },
    { id: 3, descricao: 'Folha de Pagamento', fornecedor: 'Depto RH', valor: 12400, venc: '2026-04-20', cat: 'Salários' },
    { id: 4, descricao: 'Energia Elétrica', fornecedor: 'CPFL Energia', valor: 480, venc: '2026-04-23', cat: 'Utilidades' },
    { id: 5, descricao: 'Licença FluxyCorp', fornecedor: 'FluxyCorp', valor: 290, venc: '2026-04-25', cat: 'Tecnologia' },
]

const TRANSACTIONS = [
    { id: 1, data: '2026-04-17', descricao: 'Consulta - Maria Silva', tipo: 'E', valor: 350, cat: 'Consultas', forma: 'Pix' },
    { id: 2, data: '2026-04-17', descricao: 'Material - Resina Composta', tipo: 'S', valor: 180, cat: 'Material', forma: 'Débito' },
    { id: 3, data: '2026-04-17', descricao: 'Ortodontia - João Oliveira', tipo: 'E', valor: 800, cat: 'Ortodontia', forma: 'Crédito' },
    { id: 4, data: '2026-04-16', descricao: 'Clareamento - Ana Santos', tipo: 'E', valor: 1200, cat: 'Estética', forma: 'Dinheiro' },
    { id: 5, data: '2026-04-16', descricao: 'Manutenção Ar-condicionado', tipo: 'S', valor: 420, cat: 'Manutenção', forma: 'Pix' },
    { id: 6, data: '2026-04-16', descricao: 'Implante - Carlos Ferreira', tipo: 'E', valor: 2800, cat: 'Implantes', forma: 'Crédito' },
    { id: 7, data: '2026-04-15', descricao: 'Conta de Água', tipo: 'S', valor: 95, cat: 'Utilidades', forma: 'Débito' },
    { id: 8, data: '2026-04-15', descricao: 'Prótese Total - Luiza Mendes', tipo: 'E', valor: 1850, cat: 'Prótese', forma: 'Pix' },
    { id: 9, data: '2026-04-15', descricao: 'Reposição de EPIs', tipo: 'S', valor: 230, cat: 'Material', forma: 'Pix' },
    { id: 10, data: '2026-04-14', descricao: 'Convênio SulAmérica - Lote 04', tipo: 'E', valor: 3240, cat: 'Convênio', forma: 'Transferência' },
]

const CAT_COLORS = {
    Consultas: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Ortodontia: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    Estética: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    Implantes: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    Prótese: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    Convênio: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    Material: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Manutenção: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    Utilidades: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

const CAT_UPCOMING = {
    Aluguel: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    Material: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Salários: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Utilidades: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    Tecnologia: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
}

// ─── KpiCard ───────────────────────────────────────────────────────────────
const KPI_COLORS = {
    emerald: {
        icon: 'text-emerald-500 dark:text-emerald-400',
        bar: 'from-emerald-400 via-emerald-200 to-transparent',
        badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        value: 'text-emerald-700 dark:text-emerald-300',
    },
    rose: {
        icon: 'text-rose-500 dark:text-rose-400',
        bar: 'from-rose-400 via-rose-200 to-transparent',
        badge: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
        value: 'text-rose-700 dark:text-rose-300',
    },
    indigo: {
        icon: 'text-indigo-500 dark:text-indigo-400',
        bar: 'from-indigo-400 via-indigo-200 to-transparent',
        badge: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
        value: 'text-indigo-700 dark:text-indigo-300',
    },
    violet: {
        icon: 'text-violet-500 dark:text-violet-400',
        bar: 'from-violet-400 via-violet-200 to-transparent',
        badge: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
        value: 'text-violet-700 dark:text-violet-300',
    },
}

function KpiCard({ label, value, sub, positive, color, icon }) {
    const c = KPI_COLORS[color]
    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <span className={c.icon}>{icon}</span>
                <span className={`flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
                    {positive
                        ? <HiOutlineArrowUp className="w-2.5 h-2.5" />
                        : <HiOutlineArrowDown className="w-2.5 h-2.5" />}
                    {positive ? 'positivo' : 'negativo'}
                </span>
            </div>
            <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                <p className={`text-2xl font-bold tabular-nums ${c.value}`}>{value}</p>
            </div>
            <div className={`h-[1.5px] bg-gradient-to-r ${c.bar}`} />
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</p>
        </div>
    )
}

// ─── NovoLancamentoModal ────────────────────────────────────────────────────
function NovoLancamentoModal({ onClose }) {
    const [form, setForm] = useState({ tipo: 'E', descricao: '', cat: '', valor: '', data: '2026-04-17', forma: '', obs: '' })
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

    const CATS_E = ['Consultas', 'Ortodontia', 'Estética', 'Implantes', 'Prótese', 'Convênio', 'Outros']
    const CATS_S = ['Material', 'Salários', 'Aluguel', 'Manutenção', 'Utilidades', 'Tecnologia', 'Impostos', 'Outros']
    const FORMAS = ['Dinheiro', 'Pix', 'Débito', 'Crédito à Vista', 'Crédito Parcelado', 'Transferência', 'Boleto']

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Novo Lançamento</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Registre uma entrada ou saída manual</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                        <HiOutlineX className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {/* Tipo */}
                    <div className="grid grid-cols-2 gap-2">
                        {[{ k: 'E', label: 'Entrada', cls: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' },
                          { k: 'S', label: 'Saída', cls: 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300' }].map(t => (
                            <button key={t.k} onClick={() => set('tipo', t.k)}
                                className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.tipo === t.k ? t.cls : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Descrição</label>
                        <input value={form.descricao} onChange={e => set('descricao', e.target.value)}
                            placeholder="Ex: Consulta Dr. Paulo"
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Categoria</label>
                            <select value={form.cat} onChange={e => set('cat', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                <option value="">Selecione</option>
                                {(form.tipo === 'E' ? CATS_E : CATS_S).map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Valor (R$)</label>
                            <input type="number" value={form.valor} onChange={e => set('valor', e.target.value)}
                                placeholder="0,00"
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Data</label>
                            <input type="date" value={form.data} onChange={e => set('data', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Forma de Pagamento</label>
                            <select value={form.forma} onChange={e => set('forma', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                <option value="">Selecione</option>
                                {FORMAS.map(f => <option key={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Observações</label>
                        <textarea value={form.obs} onChange={e => set('obs', e.target.value)} rows={2}
                            placeholder="Informações adicionais..."
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700/50">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Cancelar
                    </button>
                    <button onClick={onClose}
                        className={`px-5 py-2 text-sm font-medium rounded-xl text-white transition-colors ${form.tipo === 'E' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                        Registrar
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function CashFlowDashboard() {
    const [txFilter, setTxFilter] = useState('todos')
    const [showModal, setShowModal] = useState(false)

    const current = MONTHLY_SERIES[MONTHLY_SERIES.length - 1]
    const prev = MONTHLY_SERIES[MONTHLY_SERIES.length - 2]

    const kpis = useMemo(() => {
        const rec = current.receitas
        const desp = current.despesas
        const res = rec - desp
        const saldo = 22340
        const recVar = ((rec - prev.receitas) / prev.receitas) * 100
        const despVar = ((desp - prev.despesas) / prev.despesas) * 100
        return { rec, desp, res, saldo, recVar, despVar }
    }, [])

    const filteredTx = useMemo(() => {
        if (txFilter === 'entradas') return TRANSACTIONS.filter(t => t.tipo === 'E')
        if (txFilter === 'saidas') return TRANSACTIONS.filter(t => t.tipo === 'S')
        return TRANSACTIONS
    }, [txFilter])

    const maxVal = useMemo(() => Math.max(...MONTHLY_SERIES.flatMap(m => [m.receitas, m.despesas])), [])

    return (
        <div className="p-4 md:p-6 space-y-5">
            {showModal && <NovoLancamentoModal onClose={() => setShowModal(false)} />}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Dashboard Financeiro</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Visão geral · Abril 2026</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <HiOutlineDocumentText className="w-4 h-4" />
                        Relatório
                    </button>
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm">
                        <HiOutlinePlus className="w-4 h-4" />
                        Novo Lançamento
                    </button>
                </div>
            </div>

            {/* Alert strip */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                <HiOutlineExclamation className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300 flex-1">
                    <span className="font-semibold">3 contas a pagar vencidas</span>
                    <span className="text-amber-500 dark:text-amber-400"> · Total de {fmt(7430)} em aberto</span>
                </p>
                <button className="ml-auto text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline whitespace-nowrap">
                    Ver agora →
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Receitas do Mês"
                    value={fmt(kpis.rec)}
                    sub={`${kpis.recVar > 0 ? '+' : ''}${kpis.recVar.toFixed(1)}% vs março`}
                    positive={kpis.recVar > 0}
                    color="emerald"
                    icon={<HiOutlineTrendingUp className="w-5 h-5" />}
                />
                <KpiCard
                    label="Despesas do Mês"
                    value={fmt(kpis.desp)}
                    sub={`${kpis.despVar > 0 ? '+' : ''}${kpis.despVar.toFixed(1)}% vs março`}
                    positive={kpis.despVar < 0}
                    color="rose"
                    icon={<HiOutlineTrendingDown className="w-5 h-5" />}
                />
                <KpiCard
                    label="Resultado Líquido"
                    value={fmt(kpis.res)}
                    sub="Receitas menos despesas"
                    positive={kpis.res > 0}
                    color="indigo"
                    icon={<HiOutlineChartBar className="w-5 h-5" />}
                />
                <KpiCard
                    label="Saldo em Caixa"
                    value={fmt(kpis.saldo)}
                    sub="Saldo atual disponível"
                    positive={true}
                    color="violet"
                    icon={<HiOutlineCash className="w-5 h-5" />}
                />
            </div>

            {/* Chart + Upcoming */}
            <div className="grid lg:grid-cols-5 gap-4">
                {/* Bar chart */}
                <div className="lg:col-span-3 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Evolução Mensal</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Últimos 6 meses</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
                                Receitas
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block" />
                                Despesas
                            </span>
                        </div>
                    </div>
                    <div className="h-[2px] bg-gradient-to-r from-indigo-400 via-indigo-200 to-transparent mb-5 -mx-5 px-5" />

                    {/* Valor labels */}
                    <div className="flex items-end gap-2 h-40 px-1">
                        {MONTHLY_SERIES.map((m, i) => {
                            const isLast = i === MONTHLY_SERIES.length - 1
                            const recH = Math.round((m.receitas / maxVal) * 100)
                            const despH = Math.round((m.despesas / maxVal) * 100)
                            return (
                                <div key={m.key} className="flex-1 flex flex-col items-center gap-1.5">
                                    <div className="w-full flex items-end justify-center gap-0.5 h-32">
                                        <div
                                            className={`w-[45%] rounded-t-md transition-all duration-500 ${isLast ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-emerald-100 dark:bg-emerald-900/40'}`}
                                            style={{ height: `${recH}%` }}
                                            title={`Receitas: ${fmt(m.receitas)}`}
                                        />
                                        <div
                                            className={`w-[45%] rounded-t-md transition-all duration-500 ${isLast ? 'bg-rose-500 dark:bg-rose-400' : 'bg-rose-100 dark:bg-rose-900/40'}`}
                                            style={{ height: `${despH}%` }}
                                            title={`Despesas: ${fmt(m.despesas)}`}
                                        />
                                    </div>
                                    <span className={`text-[9px] font-medium ${isLast ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                        {m.key}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Bottom summary */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-[10px] text-gray-400 mb-0.5">Maior receita</p>
                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmt(45200)}</p>
                            <p className="text-[9px] text-gray-400">Abr/26</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 mb-0.5">Média de resultado</p>
                            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                                {fmt(Math.round(MONTHLY_SERIES.reduce((acc, m) => acc + (m.receitas - m.despesas), 0) / MONTHLY_SERIES.length))}
                            </p>
                            <p className="text-[9px] text-gray-400">últimos 6 meses</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 mb-0.5">Crescimento</p>
                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+18,3%</p>
                            <p className="text-[9px] text-gray-400">Nov→Abr</p>
                        </div>
                    </div>
                </div>

                {/* Upcoming bills */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Próximos Vencimentos</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Contas a pagar · 7 dias</p>
                        </div>
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full">
                            {fmt(UPCOMING.reduce((a, b) => a + b.valor, 0))}
                        </span>
                    </div>
                    <div className="h-[2px] bg-gradient-to-r from-rose-400 via-rose-200 to-transparent mb-4 -mx-5 px-5" />

                    <div className="flex-1 space-y-2">
                        {UPCOMING.map((b) => {
                            const days = diffDays(b.venc)
                            const urgent = days <= 2
                            return (
                                <div key={b.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${urgent ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-gray-50/80 dark:bg-gray-700/20'}`}>
                                    <div className={`w-1 self-stretch rounded-full shrink-0 ${urgent ? 'bg-rose-400' : 'bg-gray-200 dark:bg-gray-600'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{b.descricao}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${CAT_UPCOMING[b.cat] || 'bg-gray-100 text-gray-500'}`}>
                                                {b.cat}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{fmtDate(b.venc)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-sm font-bold tabular-nums ${urgent ? 'text-rose-600 dark:text-rose-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {fmt(b.valor)}
                                        </p>
                                        <p className={`text-[10px] font-medium ${urgent ? 'text-rose-500' : 'text-gray-400'}`}>
                                            {days === 0 ? 'Hoje!' : days === 1 ? 'Amanhã' : `${days}d`}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <a href="/accounts-payable"
                        className="mt-4 block text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-3 border-t border-gray-100 dark:border-gray-700/50">
                        Ver todas as contas a pagar →
                    </a>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <div>
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Últimas Transações</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Movimentações recentes do caixa</p>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 p-0.5 rounded-xl">
                        {[
                            { key: 'todos', label: 'Todos' },
                            { key: 'entradas', label: 'Entradas' },
                            { key: 'saidas', label: 'Saídas' },
                        ].map((f) => (
                            <button key={f.key} onClick={() => setTxFilter(f.key)}
                                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                                    txFilter === f.key
                                        ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-[2px] bg-gradient-to-r from-violet-400 via-violet-200 to-transparent mb-4 -mx-5 px-5" />

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[11px] text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700/50">
                                <th className="pb-2.5 text-left font-medium pr-4">Data</th>
                                <th className="pb-2.5 text-left font-medium pr-4">Descrição</th>
                                <th className="pb-2.5 text-left font-medium pr-4 hidden sm:table-cell">Categoria</th>
                                <th className="pb-2.5 text-left font-medium pr-4 hidden md:table-cell">Forma</th>
                                <th className="pb-2.5 text-right font-medium">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/20">
                            {filteredTx.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors group">
                                    <td className="py-3 pr-4 text-gray-400 dark:text-gray-500 whitespace-nowrap text-xs tabular-nums">
                                        {fmtDate(t.data)}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.tipo === 'E' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                            <span className="text-gray-700 dark:text-gray-200 truncate max-w-[200px] group-hover:max-w-none">
                                                {t.descricao}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 pr-4 hidden sm:table-cell">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[t.cat] || 'bg-gray-100 text-gray-500'}`}>
                                            {t.cat}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-gray-400 dark:text-gray-500 text-xs hidden md:table-cell">{t.forma}</td>
                                    <td className={`py-3 text-right font-bold tabular-nums text-sm ${t.tipo === 'E' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {t.tipo === 'E' ? '+' : '−'}{fmt(t.valor)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals footer */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                    <p className="text-xs text-gray-400">{filteredTx.length} transações exibidas</p>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400 text-xs">
                            Entradas: <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {fmt(filteredTx.filter(t => t.tipo === 'E').reduce((a, t) => a + t.valor, 0))}
                            </span>
                        </span>
                        <span className="text-gray-400 text-xs">
                            Saídas: <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                                {fmt(filteredTx.filter(t => t.tipo === 'S').reduce((a, t) => a + t.valor, 0))}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
