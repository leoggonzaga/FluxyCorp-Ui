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
    HiOutlineArrowUp,
    HiOutlineDocumentText,
    HiOutlineCalendar,
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

const diffDaysFromNow = (iso) => {
    if (!iso) return 0
    const today = new Date('2026-04-17')
    const target = new Date(iso)
    return Math.ceil((target - today) / 86400000)
}

const diffDaysOverdue = (iso) => {
    if (!iso) return 0
    const today = new Date('2026-04-17')
    const target = new Date(iso)
    return Math.ceil((today - target) / 86400000)
}

// ─── mock data ─────────────────────────────────────────────────────────────
const CATS = ['Aluguel', 'Salários', 'Material', 'Utilidades', 'Tecnologia', 'Manutenção', 'Impostos', 'Seguros', 'Administrativo', 'Outros']

const INITIAL_PAYABLES = [
    { id: 1, descricao: 'Aluguel do Consultório', fornecedor: 'Imobiliária Central Ltda', cat: 'Aluguel', valor: 3800.00, venc: '2026-04-18', pago: null, status: 'pendente', nf: 'NF-2026/041', recorrente: true },
    { id: 2, descricao: 'Folha de Pagamento - Abril/2026', fornecedor: 'Depto de Recursos Humanos', cat: 'Salários', valor: 12400.00, venc: '2026-04-20', pago: null, status: 'pendente', nf: null, recorrente: true },
    { id: 3, descricao: 'Material Odontológico - Pedido #4892', fornecedor: 'Dental Supplies Ltda', cat: 'Material', valor: 2150.00, venc: '2026-04-22', pago: null, status: 'pendente', nf: 'NF-2026/089', recorrente: false },
    { id: 4, descricao: 'Energia Elétrica - Abril/2026', fornecedor: 'CPFL Energia', cat: 'Utilidades', valor: 480.00, venc: '2026-04-23', pago: null, status: 'pendente', nf: null, recorrente: true },
    { id: 5, descricao: 'Licença Software de Gestão', fornecedor: 'FluxyCorp Sistemas', cat: 'Tecnologia', valor: 290.00, venc: '2026-04-25', pago: null, status: 'pendente', nf: 'NF-2026/102', recorrente: true },
    { id: 6, descricao: 'Internet Empresarial + Telefonia', fornecedor: 'Vivo Empresas', cat: 'Utilidades', valor: 350.00, venc: '2026-04-26', pago: null, status: 'pendente', nf: null, recorrente: true },
    { id: 7, descricao: 'Limpeza e Higienização Mensal', fornecedor: 'Clean Pro Serviços', cat: 'Manutenção', valor: 680.00, venc: '2026-04-30', pago: null, status: 'pendente', nf: 'NF-2026/110', recorrente: true },
    { id: 8, descricao: 'Seguro do Equipamento Radiológico', fornecedor: 'Porto Seguro S/A', cat: 'Seguros', valor: 180.00, venc: '2026-04-10', pago: null, status: 'vencido', nf: 'NF-2026/033', recorrente: true },
    { id: 9, descricao: 'IPTU - 4ª Parcela (Abr/12)', fornecedor: 'Prefeitura Municipal', cat: 'Impostos', valor: 620.00, venc: '2026-04-12', pago: null, status: 'vencido', nf: null, recorrente: false },
    { id: 10, descricao: 'Manutenção Preventiva - Ar-condicionado', fornecedor: 'CoolAr Serviços Técnicos', cat: 'Manutenção', valor: 420.00, venc: '2026-04-08', pago: null, status: 'vencido', nf: 'NF-2026/021', recorrente: false },
    { id: 11, descricao: 'Compra de Luvas e EPIs', fornecedor: 'Safe Medical Distribuidora', cat: 'Material', valor: 230.00, venc: '2026-04-15', pago: '2026-04-15', status: 'pago', nf: 'NF-2026/055', recorrente: false },
    { id: 12, descricao: 'Assinatura Adobe Creative Cloud', fornecedor: 'Adobe Inc.', cat: 'Tecnologia', valor: 120.00, venc: '2026-04-01', pago: '2026-04-01', status: 'pago', nf: null, recorrente: true },
    { id: 13, descricao: 'Material de Escritório - Abril', fornecedor: 'Papelaria Brasil', cat: 'Administrativo', valor: 145.00, venc: '2026-04-10', pago: '2026-04-09', status: 'pago', nf: 'NF-2026/038', recorrente: false },
    { id: 14, descricao: 'Água Mineral - Recarga Mensal', fornecedor: 'Água Purá Distribuidora', cat: 'Utilidades', valor: 85.00, venc: '2026-04-05', pago: '2026-04-05', status: 'pago', nf: null, recorrente: true },
    { id: 15, descricao: 'Sterilização e Descarte de Resíduos', fornecedor: 'Eco Saúde Ambiental', cat: 'Manutenção', valor: 310.00, venc: '2026-04-14', pago: '2026-04-14', status: 'pago', nf: 'NF-2026/062', recorrente: true },
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
    pago: {
        label: 'Pago',
        cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        dot: 'bg-emerald-500',
    },
}

const CAT_COLORS = {
    Aluguel: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    Salários: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Material: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Utilidades: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    Tecnologia: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    Manutenção: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    Impostos: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    Seguros: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    Administrativo: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    Outros: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}

const FORMAS_PAG = ['Dinheiro', 'Pix', 'Débito', 'Crédito', 'Transferência', 'Boleto', 'Cheque']

const PAGE_SIZE = 8

// ─── StatusBadge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status]
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status !== 'pago' ? 'animate-pulse' : ''}`} />
            {cfg.label}
        </span>
    )
}

// ─── PagarModal ─────────────────────────────────────────────────────────────
function PagarModal({ item, onClose, onConfirm }) {
    const [form, setForm] = useState({ valor: item.valor, data: '2026-04-17', forma: '', obs: '' })
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-start gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <HiOutlineCheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Registrar Pagamento</h3>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{item.descricao}</p>
                        <p className="text-xs text-gray-400 truncate">{item.fornecedor}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                        <HiOutlineX className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Valor Pago (R$)</label>
                            <input type="number" value={form.valor} onChange={e => set('valor', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 font-semibold tabular-nums" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Data do Pagamento</label>
                            <input type="date" value={form.data} onChange={e => set('data', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Forma de Pagamento</label>
                        <select value={form.forma} onChange={e => set('forma', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                            <option value="">Selecione a forma de pagamento</option>
                            {FORMAS_PAG.map(f => <option key={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Observações</label>
                        <textarea value={form.obs} onChange={e => set('obs', e.target.value)} rows={2}
                            placeholder="Comprovante, número do boleto, etc..."
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>
                    {item.nf && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/50">
                            <HiOutlineDocumentText className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Nota Fiscal: <span className="font-medium text-gray-700 dark:text-gray-300">{item.nf}</span></span>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700/50">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Cancelar
                    </button>
                    <button onClick={() => onConfirm(item.id, form)}
                        disabled={!form.forma}
                        className="px-5 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors">
                        Confirmar Pagamento
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── NovaContaModal ─────────────────────────────────────────────────────────
function NovaContaModal({ onClose }) {
    const [form, setForm] = useState({ descricao: '', fornecedor: '', cat: '', valor: '', venc: '', nf: '', obs: '', recorrente: false })
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 shrink-0">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Nova Conta a Pagar</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Cadastre uma despesa ou obrigação financeira</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                        <HiOutlineX className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Descrição <span className="text-rose-400">*</span></label>
                        <input value={form.descricao} onChange={e => set('descricao', e.target.value)}
                            placeholder="Ex: Aluguel do consultório"
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Fornecedor / Responsável</label>
                        <input value={form.fornecedor} onChange={e => set('fornecedor', e.target.value)}
                            placeholder="Ex: Imobiliária Central Ltda"
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Categoria <span className="text-rose-400">*</span></label>
                            <select value={form.cat} onChange={e => set('cat', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                <option value="">Selecione</option>
                                {CATS.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Valor (R$) <span className="text-rose-400">*</span></label>
                            <input type="number" value={form.valor} onChange={e => set('valor', e.target.value)}
                                placeholder="0,00"
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Vencimento <span className="text-rose-400">*</span></label>
                            <input type="date" value={form.venc} onChange={e => set('venc', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Nota Fiscal</label>
                            <input value={form.nf} onChange={e => set('nf', e.target.value)}
                                placeholder="Ex: NF-2026/150"
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Observações</label>
                        <textarea value={form.obs} onChange={e => set('obs', e.target.value)} rows={2}
                            placeholder="Informações adicionais..."
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div className={`w-9 h-5 rounded-full relative transition-colors ${form.recorrente ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                            onClick={() => set('recorrente', !form.recorrente)}>
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.recorrente ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Conta recorrente (mensal)</span>
                    </label>
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700/50 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                        Cancelar
                    </button>
                    <button onClick={onClose}
                        disabled={!form.descricao || !form.cat || !form.valor || !form.venc}
                        className="px-5 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors">
                        Cadastrar Conta
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function AccountsPayableIndex() {
    const [data, setData] = useState(INITIAL_PAYABLES)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('todos')
    const [catFilter, setCatFilter] = useState('todas')
    const [page, setPage] = useState(1)
    const [pagarItem, setPagarItem] = useState(null)
    const [showNovaConta, setShowNovaConta] = useState(false)

    const filtered = useMemo(() => {
        return data.filter(p => {
            const matchSearch = !search ||
                p.descricao.toLowerCase().includes(search.toLowerCase()) ||
                p.fornecedor.toLowerCase().includes(search.toLowerCase())
            const matchStatus = statusFilter === 'todos' || p.status === statusFilter
            const matchCat = catFilter === 'todas' || p.cat === catFilter
            return matchSearch && matchStatus && matchCat
        })
    }, [data, search, statusFilter, catFilter])

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return filtered.slice(start, start + PAGE_SIZE)
    }, [filtered, page])

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

    const summary = useMemo(() => ({
        pendente: {
            total: data.filter(p => p.status === 'pendente').reduce((a, p) => a + p.valor, 0),
            count: data.filter(p => p.status === 'pendente').length,
        },
        vencido: {
            total: data.filter(p => p.status === 'vencido').reduce((a, p) => a + p.valor, 0),
            count: data.filter(p => p.status === 'vencido').length,
        },
        pago: {
            total: data.filter(p => p.status === 'pago').reduce((a, p) => a + p.valor, 0),
            count: data.filter(p => p.status === 'pago').length,
        },
    }), [data])

    const handlePagar = (id, form) => {
        setData(prev => prev.map(p => p.id === id ? { ...p, status: 'pago', pago: form.data } : p))
        setPagarItem(null)
    }

    const handleChangeFilter = (filter) => {
        setStatusFilter(filter)
        setPage(1)
    }

    // unique cats present in data
    const availableCats = useMemo(() => [...new Set(data.map(p => p.cat))].sort(), [data])

    return (
        <div className="p-4 md:p-6 space-y-5">
            {pagarItem && <PagarModal item={pagarItem} onClose={() => setPagarItem(null)} onConfirm={handlePagar} />}
            {showNovaConta && <NovaContaModal onClose={() => setShowNovaConta(false)} />}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Contas a Pagar</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                        Controle de despesas, fornecedores e obrigações financeiras
                    </p>
                </div>
                <button onClick={() => setShowNovaConta(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm self-start">
                    <HiOutlinePlus className="w-4 h-4" />
                    Nova Conta a Pagar
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* A pagar */}
                <button onClick={() => handleChangeFilter('pendente')}
                    className={`text-left p-5 rounded-2xl border transition-all shadow-sm ${statusFilter === 'pendente' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600' : 'border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 hover:border-amber-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <HiOutlineClock className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">A Pagar</span>
                        </div>
                        <span className="text-xs text-gray-400">{summary.pendente.count} contas</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 tabular-nums">{fmt(summary.pendente.total)}</p>
                    <div className="h-[1.5px] bg-gradient-to-r from-amber-400 via-amber-200 to-transparent mt-3" />
                    <p className="text-[11px] text-gray-400 mt-2">Vencimentos futuros</p>
                </button>

                {/* Vencidas */}
                <button onClick={() => handleChangeFilter('vencido')}
                    className={`text-left p-5 rounded-2xl border transition-all shadow-sm ${statusFilter === 'vencido' ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-600' : 'border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 hover:border-rose-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <HiOutlineExclamationCircle className="w-4 h-4 text-rose-500" />
                            <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Vencidas</span>
                        </div>
                        <span className="text-xs text-gray-400">{summary.vencido.count} contas</span>
                    </div>
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">{fmt(summary.vencido.total)}</p>
                    <div className="h-[1.5px] bg-gradient-to-r from-rose-400 via-rose-200 to-transparent mt-3" />
                    <p className="text-[11px] text-gray-400 mt-2">Pagar imediatamente</p>
                </button>

                {/* Pagas este mês */}
                <button onClick={() => handleChangeFilter('pago')}
                    className={`text-left p-5 rounded-2xl border transition-all shadow-sm ${statusFilter === 'pago' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600' : 'border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 hover:border-emerald-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Pagas</span>
                        </div>
                        <span className="text-xs text-gray-400">{summary.pago.count} contas</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmt(summary.pago.total)}</p>
                    <div className="h-[1.5px] bg-gradient-to-r from-emerald-400 via-emerald-200 to-transparent mt-3" />
                    <p className="text-[11px] text-gray-400 mt-2">Pagas neste mês</p>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1) }}
                            placeholder="Buscar por descrição ou fornecedor..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                        />
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 p-0.5 rounded-xl">
                        {[
                            { k: 'todos', l: 'Todos' },
                            { k: 'pendente', l: 'Pendentes' },
                            { k: 'vencido', l: 'Vencidas' },
                            { k: 'pago', l: 'Pagas' },
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
                    <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}
                        className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                        <option value="todas">Todas as categorias</option>
                        {availableCats.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {filtered.length} {filtered.length === 1 ? 'conta' : 'contas'} encontradas
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <HiOutlineCalendar className="w-3.5 h-3.5" />
                        <span>Ordenado por vencimento</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[11px] text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
                                <th className="px-5 py-3 text-left font-medium">Descrição / Fornecedor</th>
                                <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">Categoria</th>
                                <th className="px-4 py-3 text-right font-medium">Valor</th>
                                <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">Vencimento</th>
                                <th className="px-4 py-3 text-center font-medium hidden md:table-cell">Atraso / Prazo</th>
                                <th className="px-4 py-3 text-center font-medium hidden lg:table-cell">NF</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-5 py-3 text-center font-medium">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/20">
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                                        Nenhuma conta encontrada para os filtros selecionados.
                                    </td>
                                </tr>
                            )}
                            {paginated.map((p) => {
                                const overdueDays = p.status === 'vencido' ? diffDaysOverdue(p.venc) : 0
                                const futureDays = p.status === 'pendente' ? diffDaysFromNow(p.venc) : 0
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors group">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                {p.recorrente && (
                                                    <span className="text-indigo-400 dark:text-indigo-500 shrink-0" title="Recorrente">
                                                        <HiOutlineRefresh className="w-3.5 h-3.5" />
                                                    </span>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">{p.descricao}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">{p.fornecedor}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[p.cat] || 'bg-gray-100 text-gray-500'}`}>
                                                {p.cat}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <span className="font-bold tabular-nums text-gray-800 dark:text-gray-100">{fmt(p.valor)}</span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                                            <span className={`text-xs tabular-nums ${p.status === 'vencido' ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {fmtDate(p.venc)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center hidden md:table-cell">
                                            {p.status === 'vencido' && (
                                                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full">
                                                    {overdueDays}d atrasado
                                                </span>
                                            )}
                                            {p.status === 'pendente' && (
                                                <span className={`text-xs tabular-nums ${futureDays <= 3 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-400'}`}>
                                                    {futureDays === 0 ? 'Hoje' : `em ${futureDays}d`}
                                                </span>
                                            )}
                                            {p.status === 'pago' && (
                                                <span className="text-xs text-gray-400">Pago em {fmtDate(p.pago)}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                                            {p.nf ? (
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{p.nf}</span>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 dark:text-gray-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            {p.status !== 'pago' ? (
                                                <button
                                                    onClick={() => setPagarItem(p)}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors ${p.status === 'vencido' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                                    <HiOutlineArrowUp className="w-3.5 h-3.5" />
                                                    Pagar
                                                </button>
                                            ) : (
                                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Quitado</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer totals + pagination */}
                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/50 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>A pagar: <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums">{fmt(summary.pendente.total + summary.vencido.total)}</span></span>
                        <span>Pago este mês: <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmt(summary.pago.total)}</span></span>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-500 dark:text-gray-400">
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button key={n} onClick={() => setPage(n)}
                                    className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${n === page ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    {n}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-500 dark:text-gray-400">
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

