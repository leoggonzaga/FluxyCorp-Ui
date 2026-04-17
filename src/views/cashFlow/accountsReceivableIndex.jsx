import { useState, useMemo } from 'react'
import {
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineClock,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineArrowDown,
    HiOutlineFilter,
    HiOutlineDotsVertical,
    HiOutlineEye,
    HiOutlineRefresh,
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
    if (!iso) return 0
    const today = new Date('2026-04-17')
    const target = new Date(iso)
    return Math.ceil((today - target) / 86400000)
}

// ─── mock data ─────────────────────────────────────────────────────────────
const INITIAL_RECEIVABLES = [
    { id: 1, paciente: 'Maria Aparecida Silva', procedimento: 'Tratamento de Canal - 36', valor: 1800.00, venc: '2026-04-10', recebido: null, status: 'vencido', tipo: 'Particular', forma: null, parcelas: '1/1' },
    { id: 2, paciente: 'João Carlos Oliveira', procedimento: 'Aparelho Ortodôntico - Manutenção', valor: 800.00, venc: '2026-04-15', recebido: null, status: 'vencido', tipo: 'Particular', forma: null, parcelas: '1/1' },
    { id: 3, paciente: 'Sandra Nunes Barbosa', procedimento: 'Periodontia - Raspagem Total', valor: 650.00, venc: '2026-04-08', recebido: null, status: 'vencido', tipo: 'Particular', forma: null, parcelas: '1/1' },
    { id: 4, paciente: 'Felipe Araújo Campos', procedimento: 'Endodontia Birradicular - 26', valor: 1400.00, venc: '2026-04-12', recebido: null, status: 'vencido', tipo: 'Particular', forma: null, parcelas: '1/1' },
    { id: 5, paciente: 'Ana Paula Santos', procedimento: 'Clareamento Dental Combinado', valor: 1200.00, venc: '2026-04-20', recebido: null, status: 'pendente', tipo: 'Particular', forma: null, parcelas: '1/1' },
    { id: 6, paciente: 'Carlos Eduardo Ferreira', procedimento: 'Implante Unitário - 16', valor: 2800.00, venc: '2026-04-22', recebido: null, status: 'pendente', tipo: 'Particular', forma: null, parcelas: '1/3' },
    { id: 7, paciente: 'Luiza Helena Mendes', procedimento: 'Prótese Total Superior', valor: 3500.00, venc: '2026-04-25', recebido: null, status: 'pendente', tipo: 'Particular', forma: null, parcelas: '2/3' },
    { id: 8, paciente: 'Daniela Cristina Rocha', procedimento: 'Restauração Composta - 24, 25', valor: 380.00, venc: '2026-04-18', recebido: null, status: 'pendente', tipo: 'Particular', forma: null, parcelas: '1/1' },
    { id: 9, paciente: 'Rafael Henrique Souza', procedimento: 'Documentação Ortodôntica Completa', valor: 750.00, venc: '2026-04-19', recebido: null, status: 'pendente', tipo: 'Particular', forma: null, parcelas: '1/1' },
    { id: 10, paciente: 'Marcos Vinícius Pereira', procedimento: 'Lote Convênio Unimed - Março', valor: 1850.00, venc: '2026-04-30', recebido: null, status: 'pendente', tipo: 'Convênio', forma: null, parcelas: '—' },
    { id: 11, paciente: 'Convênio SulAmérica', procedimento: 'Lote de Procedimentos - Março', valor: 3240.00, venc: '2026-04-14', recebido: '2026-04-14', status: 'recebido', tipo: 'Convênio', forma: 'Transferência', parcelas: '—' },
    { id: 12, paciente: 'Fernanda Lima Assunção', procedimento: 'Consulta Inicial + Radiografia', valor: 450.00, venc: '2026-04-16', recebido: '2026-04-17', status: 'recebido', tipo: 'Particular', forma: 'Pix', parcelas: '1/1' },
    { id: 13, paciente: 'Paulo Sérgio Costa', procedimento: 'Extração Simples - 38', valor: 280.00, venc: '2026-04-17', recebido: '2026-04-17', status: 'recebido', tipo: 'Particular', forma: 'Dinheiro', parcelas: '1/1' },
    { id: 14, paciente: 'Bianca Cristina Vieira', procedimento: 'Facetas em Resina - 11, 12, 21, 22', valor: 2200.00, venc: '2026-03-28', recebido: '2026-04-01', status: 'recebido', tipo: 'Particular', forma: 'Crédito 3x', parcelas: '3/3' },
    { id: 15, paciente: 'Gustavo Almeida Ramos', procedimento: 'Gengivoplastia Estética', valor: 920.00, venc: '2026-04-28', recebido: null, status: 'pendente', tipo: 'Particular', forma: null, parcelas: '1/2' },
    { id: 16, paciente: 'Cristiane Moura Lopes', procedimento: 'Aparelho Ortodôntico - Manutenção', valor: 800.00, venc: '2026-04-28', recebido: null, status: 'pendente', tipo: 'Particular', forma: null, parcelas: '4/12' },
]

const STATUS_CFG = {
    pendente: {
        label: 'Pendente',
        cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        dot: 'bg-amber-400',
    },
    vencido: {
        label: 'Vencido',
        cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        dot: 'bg-rose-500',
    },
    recebido: {
        label: 'Recebido',
        cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        dot: 'bg-emerald-500',
    },
}

const FORMAS_PAG = ['Dinheiro', 'Pix', 'Débito', 'Crédito à Vista', 'Crédito Parcelado', 'Transferência', 'Boleto', 'Convênio']

const PAGE_SIZE = 8

// ─── StatusBadge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status]
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status !== 'recebido' ? 'animate-pulse' : ''}`} />
            {cfg.label}
        </span>
    )
}

// ─── ReceberModal ───────────────────────────────────────────────────────────
function ReceberModal({ item, onClose, onConfirm }) {
    const [form, setForm] = useState({ valor: item.valor, data: '2026-04-17', forma: '', obs: '' })
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-start gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Registrar Recebimento</h3>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{item.paciente} · {item.procedimento}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                        <HiOutlineX className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Valor Recebido (R$)</label>
                            <input type="number" value={form.valor} onChange={e => set('valor', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 font-semibold tabular-nums" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Data do Recebimento</label>
                            <input type="date" value={form.data} onChange={e => set('data', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Forma de Pagamento</label>
                        <select value={form.forma} onChange={e => set('forma', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                            <option value="">Selecione a forma de pagamento</option>
                            {FORMAS_PAG.map(f => <option key={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Observações</label>
                        <textarea value={form.obs} onChange={e => set('obs', e.target.value)} rows={2}
                            placeholder="Informações adicionais sobre o recebimento..."
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">
                            O título será marcado como <strong>Recebido</strong> e o saldo do caixa será atualizado.
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700/50">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Cancelar
                    </button>
                    <button onClick={() => onConfirm(item.id, form)}
                        disabled={!form.forma}
                        className="px-5 py-2 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors">
                        Confirmar Recebimento
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function AccountsReceivableIndex() {
    const [data, setData] = useState(INITIAL_RECEIVABLES)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('todos')
    const [tipoFilter, setTipoFilter] = useState('todos')
    const [page, setPage] = useState(1)
    const [receberItem, setReceberItem] = useState(null)

    const filtered = useMemo(() => {
        return data.filter(r => {
            const matchSearch = !search || r.paciente.toLowerCase().includes(search.toLowerCase()) || r.procedimento.toLowerCase().includes(search.toLowerCase())
            const matchStatus = statusFilter === 'todos' || r.status === statusFilter
            const matchTipo = tipoFilter === 'todos' || r.tipo === tipoFilter
            return matchSearch && matchStatus && matchTipo
        })
    }, [data, search, statusFilter, tipoFilter])

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return filtered.slice(start, start + PAGE_SIZE)
    }, [filtered, page])

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

    const summary = useMemo(() => ({
        pendente: { total: data.filter(r => r.status === 'pendente').reduce((a, r) => a + r.valor, 0), count: data.filter(r => r.status === 'pendente').length },
        vencido: { total: data.filter(r => r.status === 'vencido').reduce((a, r) => a + r.valor, 0), count: data.filter(r => r.status === 'vencido').length },
        recebido: { total: data.filter(r => r.status === 'recebido').reduce((a, r) => a + r.valor, 0), count: data.filter(r => r.status === 'recebido').length },
    }), [data])

    const handleReceber = (id, form) => {
        setData(prev => prev.map(r => r.id === id ? { ...r, status: 'recebido', recebido: form.data, forma: form.forma } : r))
        setReceberItem(null)
    }

    const handleChangeFilter = (filter) => {
        setStatusFilter(filter)
        setPage(1)
    }

    return (
        <div className="p-4 md:p-6 space-y-5">
            {receberItem && <ReceberModal item={receberItem} onClose={() => setReceberItem(null)} onConfirm={handleReceber} />}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Contas a Receber</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                        Controle de recebimentos de pacientes e convênios
                    </p>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm self-start">
                    <HiOutlinePlus className="w-4 h-4" />
                    Nova Conta a Receber
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Pendente */}
                <button onClick={() => handleChangeFilter('pendente')}
                    className={`text-left p-5 rounded-2xl border transition-all shadow-sm ${statusFilter === 'pendente' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600' : 'border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 hover:border-amber-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <HiOutlineClock className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Pendente</span>
                        </div>
                        <span className="text-xs text-gray-400">{summary.pendente.count} títulos</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">{fmt(summary.pendente.total)}</p>
                    <div className="h-[1.5px] bg-gradient-to-r from-amber-400 via-amber-200 to-transparent mt-3" />
                    <p className="text-[11px] text-gray-400 mt-2">Aguardando pagamento</p>
                </button>

                {/* Vencido */}
                <button onClick={() => handleChangeFilter('vencido')}
                    className={`text-left p-5 rounded-2xl border transition-all shadow-sm ${statusFilter === 'vencido' ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-600' : 'border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 hover:border-rose-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <HiOutlineExclamationCircle className="w-4 h-4 text-rose-500" />
                            <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Vencido</span>
                        </div>
                        <span className="text-xs text-gray-400">{summary.vencido.count} títulos</span>
                    </div>
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">{fmt(summary.vencido.total)}</p>
                    <div className="h-[1.5px] bg-gradient-to-r from-rose-400 via-rose-200 to-transparent mt-3" />
                    <p className="text-[11px] text-gray-400 mt-2">Inadimplência · Cobrar agora</p>
                </button>

                {/* Recebido */}
                <button onClick={() => handleChangeFilter('recebido')}
                    className={`text-left p-5 rounded-2xl border transition-all shadow-sm ${statusFilter === 'recebido' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600' : 'border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 hover:border-emerald-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Recebido</span>
                        </div>
                        <span className="text-xs text-gray-400">{summary.recebido.count} títulos</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmt(summary.recebido.total)}</p>
                    <div className="h-[1.5px] bg-gradient-to-r from-emerald-400 via-emerald-200 to-transparent mt-3" />
                    <p className="text-[11px] text-gray-400 mt-2">Recebido neste mês</p>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1) }}
                            placeholder="Buscar paciente ou procedimento..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                        />
                    </div>
                    {/* Status pills */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 p-0.5 rounded-xl">
                        {[
                            { k: 'todos', l: 'Todos' },
                            { k: 'pendente', l: 'Pendentes' },
                            { k: 'vencido', l: 'Vencidos' },
                            { k: 'recebido', l: 'Recebidos' },
                        ].map(f => (
                            <button key={f.k} onClick={() => handleChangeFilter(f.k)}
                                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all whitespace-nowrap ${
                                    statusFilter === f.k
                                        ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}>
                                {f.l}
                            </button>
                        ))}
                    </div>
                    {/* Tipo filter */}
                    <select value={tipoFilter} onChange={e => { setTipoFilter(e.target.value); setPage(1) }}
                        className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                        <option value="todos">Todos os tipos</option>
                        <option value="Particular">Particular</option>
                        <option value="Convênio">Convênio</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {filtered.length} {filtered.length === 1 ? 'título' : 'títulos'} encontrados
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <HiOutlineArrowDown className="w-3.5 h-3.5" />
                        <span>Ordenado por vencimento</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[11px] text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
                                <th className="px-5 py-3 text-left font-medium">Paciente / Procedimento</th>
                                <th className="px-4 py-3 text-right font-medium">Valor</th>
                                <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">Vencimento</th>
                                <th className="px-4 py-3 text-center font-medium hidden md:table-cell">Atraso</th>
                                <th className="px-4 py-3 text-center font-medium hidden lg:table-cell">Tipo</th>
                                <th className="px-4 py-3 text-center font-medium hidden lg:table-cell">Parcela</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-5 py-3 text-center font-medium">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/20">
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                                        Nenhum título encontrado para os filtros selecionados.
                                    </td>
                                </tr>
                            )}
                            {paginated.map((r) => {
                                const atrasoDias = r.status === 'vencido' ? diffDays(r.venc) : 0
                                return (
                                    <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors group">
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">{r.paciente}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[220px]">{r.procedimento}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <span className="font-bold tabular-nums text-gray-800 dark:text-gray-100">{fmt(r.valor)}</span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                                            <span className={`text-xs tabular-nums ${r.status === 'vencido' ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {fmtDate(r.venc)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center hidden md:table-cell">
                                            {r.status === 'vencido' ? (
                                                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full">
                                                    {atrasoDias}d
                                                </span>
                                            ) : r.status === 'recebido' ? (
                                                <span className="text-xs text-gray-400">—</span>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.tipo === 'Convênio' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                {r.tipo}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-xs text-gray-400 hidden lg:table-cell tabular-nums">
                                            {r.parcelas}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <StatusBadge status={r.status} />
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            {r.status !== 'recebido' ? (
                                                <button
                                                    onClick={() => setReceberItem(r)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                                                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                                    Receber
                                                </button>
                                            ) : (
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="text-xs text-gray-400 tabular-nums">{fmtDate(r.recebido)}</span>
                                                    <span className="text-[10px] text-gray-400">· {r.forma}</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            Página {page} de {totalPages} · {filtered.length} registros
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-500 dark:text-gray-400 transition-colors">
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button key={n} onClick={() => setPage(n)}
                                    className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${n === page ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    {n}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-500 dark:text-gray-400 transition-colors">
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
