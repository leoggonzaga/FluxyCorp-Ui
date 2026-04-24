import { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineClock,
    HiOutlineArrowUp,
    HiOutlineDocumentText,
    HiOutlineCalendar,
    HiOutlineRefresh,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
} from 'react-icons/hi'
import { Notification, toast } from '@/components/ui'
import { DateRangeFilter } from '@/components/shared'
import {
    getPayables,
    createPayable,
    recordPayablePayment,
    getAccountCategories,
    getFinancialAccounts,
} from '@/api/billing/billingService'

// ─── Mapeamentos API ────────────────────────────────────────────────────────

const KIND_LABELS = {
    0: 'Fornecedor', 1: 'Aluguel', 2: 'Utilidades', 3: 'Impostos',
    4: 'Salários', 5: 'Próteses', 6: 'Equipamentos', 7: 'Marketing',
    8: 'Manutenção', 99: 'Outros',
}

const KIND_COLORS = {
    0: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    1: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    2: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    3: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    4: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    5: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    6: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    7: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    8: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    99: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}

// API status (enum) → UI status
const API_STATUS_MAP = { 0: 'pendente', 1: 'pendente', 2: 'pendente', 3: 'pago', 4: 'vencido', 5: 'cancelado' }

// forma de pagamento UI → PayablePaymentMethod enum
const FORMA_TO_METHOD = {
    'Dinheiro': 4, 'Pix': 1, 'Débito': 6, 'Crédito': 5,
    'Transferência': 0, 'Boleto': 2, 'Cheque': 3,
}
const FORMAS_PAG = Object.keys(FORMA_TO_METHOD)

const KIND_OPTIONS = Object.entries(KIND_LABELS).map(([v, l]) => ({ value: Number(v), label: l }))

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

const toDateStr = (iso) => {
    if (!iso) return null
    return iso.split('T')[0]
}

const fmtDate = (iso) => {
    if (!iso) return '—'
    const s = toDateStr(iso)
    const [y, m, d] = s.split('-')
    return `${d}/${m}/${y}`
}

const diffDays = (iso, fromDate) => {
    if (!iso) return 0
    const a = new Date(fromDate)
    const b = new Date(toDateStr(iso))
    return Math.ceil((b - a) / 86400000)
}

// Normaliza item da API para o formato interno da view
const normalize = (p) => ({
    id:          p.publicId,
    publicId:    p.publicId,
    descricao:   p.description,
    fornecedor:  p.supplierName ?? '—',
    kind:        p.kind,
    cat:         p.accountCategoryName ?? KIND_LABELS[p.kind] ?? 'Outros',
    valor:       p.totalAmount,
    amountPaid:  p.amountPaid,
    venc:        toDateStr(p.dueDateUtc),
    status:      API_STATUS_MAP[p.status] ?? 'pendente',
    recorrente:  p.isRecurring,
    costCenter:  p.costCenterName ?? null,
})

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
    cancelado: {
        label: 'Cancelado',
        cls: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
        dot: 'bg-gray-400',
    },
}

const PAGE_SIZE = 8

// ─── StatusBadge ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] ?? STATUS_CFG.pendente
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status !== 'pago' && status !== 'cancelado' ? 'animate-pulse' : ''}`} />
            {cfg.label}
        </span>
    )
}

// ─── PagarModal ─────────────────────────────────────────────────────────────

function PagarModal({ item, onClose, onConfirm, financialAccounts }) {
    const today = new Date().toISOString().split('T')[0]
    const [form, setForm]   = useState({ valor: item.valor, data: today, forma: '', financialAccountPublicId: '', obs: '' })
    const [saving, setSaving] = useState(false)
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

    const canConfirm = form.forma && form.financialAccountPublicId

    const handleConfirm = async () => {
        if (!canConfirm) return
        setSaving(true)
        try {
            await onConfirm(item.publicId, form)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && onClose()} />
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
                    <button onClick={() => !saving && onClose()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
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
                    {/* Conta que saiu o dinheiro — obrigatório para conciliação bancária */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                            Conta de Saída <span className="text-rose-400">*</span>
                        </label>
                        <select value={form.financialAccountPublicId} onChange={e => set('financialAccountPublicId', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                            <option value="">Selecione a conta…</option>
                            {(financialAccounts ?? []).map(a => (
                                <option key={a.publicId} value={a.publicId}>
                                    {a.name}{a.bankName ? ` — ${a.bankName}` : ''}
                                </option>
                            ))}
                        </select>
                        {!(financialAccounts?.length) && (
                            <p className="text-xs text-amber-500 mt-1">Cadastre uma conta financeira para registrar pagamentos.</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Forma de Pagamento <span className="text-rose-400">*</span></label>
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
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700/50">
                    <button onClick={() => !saving && onClose()} disabled={saving}
                        className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={handleConfirm} disabled={!canConfirm || saving}
                        className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors">
                        {saving
                            ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Salvando…</>
                            : 'Confirmar Pagamento'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── NovaContaModal ──────────────────────────────────────────────────────────

function NovaContaModal({ onClose, onSave, accountCategories }) {
    const [form, setForm]   = useState({ descricao: '', fornecedor: '', kind: 0, accountCategoryPublicId: '', valor: '', venc: '', nf: '', obs: '', recorrente: false })
    const [saving, setSaving] = useState(false)
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

    const canSubmit = form.descricao.trim() && form.valor && form.venc

    const handleSubmit = async () => {
        if (!canSubmit) return
        setSaving(true)
        try {
            await onSave({
                kind:                    Number(form.kind),
                description:             form.descricao.trim(),
                supplierName:            form.fornecedor.trim() || null,
                documentNumber:          form.nf.trim() || null,
                totalAmount:             Number(form.valor),
                dueDateUtc:              new Date(form.venc).toISOString(),
                isRecurring:             form.recorrente,
                recurrenceIntervalMonths: form.recorrente ? 1 : null,
                accountCategoryPublicId: form.accountCategoryPublicId || null,
                notes:                   form.obs.trim() || null,
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && onClose()} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 shrink-0">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Nova Conta a Pagar</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Cadastre uma despesa ou obrigação financeira</p>
                    </div>
                    <button onClick={() => !saving && onClose()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                        <HiOutlineX className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Descrição <span className="text-rose-400">*</span></label>
                        <input value={form.descricao} onChange={e => set('descricao', e.target.value)}
                            placeholder="Ex: Aluguel do consultório"
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Fornecedor / Responsável</label>
                        <input value={form.fornecedor} onChange={e => set('fornecedor', e.target.value)}
                            placeholder="Ex: Imobiliária Central Ltda"
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Tipo <span className="text-rose-400">*</span></label>
                            <select value={form.kind} onChange={e => set('kind', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                                {KIND_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Valor (R$) <span className="text-rose-400">*</span></label>
                            <input type="number" value={form.valor} onChange={e => set('valor', e.target.value)}
                                placeholder="0,00"
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                        </div>
                    </div>
                    {accountCategories.length > 0 && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Plano de Contas</label>
                            <select value={form.accountCategoryPublicId} onChange={e => set('accountCategoryPublicId', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                                <option value="">Sem categoria</option>
                                {accountCategories.map(c => (
                                    <option key={c.publicId} value={c.publicId}>{c.code} — {c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Vencimento <span className="text-rose-400">*</span></label>
                            <input type="date" value={form.venc} onChange={e => set('venc', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Nota Fiscal</label>
                            <input value={form.nf} onChange={e => set('nf', e.target.value)}
                                placeholder="Ex: NF-2026/150"
                                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Observações</label>
                        <textarea value={form.obs} onChange={e => set('obs', e.target.value)} rows={2}
                            placeholder="Informações adicionais..."
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                        <div className={`w-9 h-5 rounded-full relative transition-colors ${form.recorrente ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                            onClick={() => set('recorrente', !form.recorrente)}>
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.recorrente ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Conta recorrente (mensal)</span>
                    </label>
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700/50 shrink-0">
                    <button onClick={() => !saving && onClose()} disabled={saving}
                        className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} disabled={!canSubmit || saving}
                        className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors">
                        {saving
                            ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Salvando…</>
                            : 'Cadastrar Conta'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function AccountsPayableIndex() {
    const companyPublicId = useSelector((s) => s.auth.user.companyPublicId)
    const today           = new Date().toISOString().split('T')[0]

    const [data, setData]               = useState([])
    const [loading, setLoading]         = useState(false)
    const [accountCategories, setAcats]     = useState([])
    const [financialAccounts, setFinAccounts] = useState([])
    const [search, setSearch]           = useState('')
    const [statusFilter, setStatusFilter] = useState('todos')
    const [kindFilter, setKindFilter]   = useState('todos')
    const [page, setPage]               = useState(1)
    const [pagarItem, setPagarItem]     = useState(null)
    const [showNovaConta, setShowNovaConta] = useState(false)

    const [dateRange, setDateRange] = useState(null)

    const load = async () => {
        if (!companyPublicId) return
        setLoading(true)
        try {
            const [payables, cats, accounts] = await Promise.all([
                getPayables(companyPublicId),
                getAccountCategories(companyPublicId).catch(() => []),
                getFinancialAccounts(companyPublicId, true).catch(() => []),
            ])
            setData((payables ?? []).map(normalize))
            // aplana árvore de categorias em lista plana para o select
            const flat = []
            const flatten = (nodes) => nodes.forEach(n => { flat.push(n); if (n.children?.length) flatten(n.children) })
            flatten(cats ?? [])
            setAcats(flat.filter(c => c.acceptsEntries))
            setFinAccounts(accounts ?? [])
        } catch {
            toast.push(<Notification type="danger" title="Erro ao carregar contas a pagar" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [companyPublicId])

    const filtered = useMemo(() => {
        return data.filter(p => {
            const matchSearch = !search ||
                p.descricao.toLowerCase().includes(search.toLowerCase()) ||
                p.fornecedor.toLowerCase().includes(search.toLowerCase())
            const matchStatus = statusFilter === 'todos' || p.status === statusFilter
            const matchKind   = kindFilter === 'todos' || String(p.kind) === kindFilter
            const matchDate   = !dateRange || (p.venc && p.venc >= dateRange.from && p.venc <= dateRange.to)
            return matchSearch && matchStatus && matchKind && matchDate
        })
    }, [data, search, statusFilter, kindFilter, dateRange])

    const paginated  = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])
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

    const availableKinds = useMemo(() =>
        [...new Set(data.map(p => p.kind))].sort((a, b) => a - b), [data])

    const handleChangeFilter = (filter) => { setStatusFilter(filter); setPage(1) }

    const handlePagar = async (publicId, form) => {
        try {
            await recordPayablePayment(publicId, {
                companyPublicId,
                amount:                  Number(form.valor),
                paidAtUtc:               new Date(form.data).toISOString(),
                paymentMethod:           FORMA_TO_METHOD[form.forma] ?? 99,
                externalReference:       form.obs.trim() || null,
                financialAccountPublicId: form.financialAccountPublicId || null,
            })
            toast.push(<Notification type="success" title="Pagamento registrado" />, { placement: 'top-center' })
            setPagarItem(null)
            load()
        } catch (err) {
            const msg = err?.response?.data
            toast.push(<Notification type="danger" title={typeof msg === 'string' ? msg : 'Erro ao registrar pagamento'} />, { placement: 'top-center' })
            throw err
        }
    }

    const handleNovaConta = async (payload) => {
        try {
            await createPayable({ ...payload, companyPublicId })
            toast.push(<Notification type="success" title="Conta cadastrada" />, { placement: 'top-center' })
            setShowNovaConta(false)
            load()
        } catch (err) {
            const msg = err?.response?.data
            toast.push(<Notification type="danger" title={typeof msg === 'string' ? msg : 'Erro ao cadastrar conta'} />, { placement: 'top-center' })
            throw err
        }
    }

    return (
        <div className="p-4 md:p-6 space-y-5">
            {pagarItem && (
                <PagarModal item={pagarItem} onClose={() => setPagarItem(null)} onConfirm={handlePagar} financialAccounts={financialAccounts} />
            )}
            {showNovaConta && (
                <NovaContaModal
                    onClose={() => setShowNovaConta(false)}
                    onSave={handleNovaConta}
                    accountCategories={accountCategories}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Contas a Pagar</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                        Controle de despesas, fornecedores e obrigações financeiras
                    </p>
                </div>
                <button onClick={() => setShowNovaConta(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-sm self-start">
                    <HiOutlinePlus className="w-4 h-4" />
                    Nova Conta a Pagar
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            {/* ── Date filter ──────────────────────────────────────────── */}
            <DateRangeFilter
                data={data}
                onChange={setDateRange}
                onPageReset={() => setPage(1)}
            />

            {/* ── Filters ──────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                            placeholder="Buscar por descrição ou fornecedor..."
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 p-0.5 rounded-xl">
                        {[
                            { k: 'todos', l: 'Todos' },
                            { k: 'pendente', l: 'Pendentes' },
                            { k: 'vencido', l: 'Vencidas' },
                            { k: 'pago', l: 'Pagas' },
                        ].map(f => (
                            <button key={f.k} onClick={() => handleChangeFilter(f.k)}
                                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all whitespace-nowrap ${statusFilter === f.k ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                {f.l}
                            </button>
                        ))}
                    </div>
                    <select value={kindFilter} onChange={e => { setKindFilter(e.target.value); setPage(1) }}
                        className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                        <option value="todos">Todos os tipos</option>
                        {availableKinds.map(k => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {loading ? 'Carregando…' : `${filtered.length} ${filtered.length === 1 ? 'conta' : 'contas'} encontradas`}
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
                                <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">Tipo / Categoria</th>
                                <th className="px-4 py-3 text-right font-medium">Valor</th>
                                <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">Vencimento</th>
                                <th className="px-4 py-3 text-center font-medium hidden md:table-cell">Atraso / Prazo</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-5 py-3 text-center font-medium">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/20">
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center">
                                        <div className="flex items-center justify-center gap-3 text-gray-400">
                                            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-sm">Carregando contas…</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!loading && paginated.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                                        Nenhuma conta encontrada para os filtros selecionados.
                                    </td>
                                </tr>
                            )}
                            {!loading && paginated.map((p) => {
                                const overdueDays = p.status === 'vencido' ? Math.abs(diffDays(p.venc, today)) : 0
                                const futureDays  = p.status === 'pendente' ? diffDays(p.venc, today) : 0
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
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${KIND_COLORS[p.kind] ?? KIND_COLORS[99]}`}>
                                                    {KIND_LABELS[p.kind] ?? 'Outros'}
                                                </span>
                                                {p.cat !== KIND_LABELS[p.kind] && (
                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[120px]">{p.cat}</span>
                                                )}
                                            </div>
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
                                                    {futureDays === 0 ? 'Hoje' : futureDays < 0 ? `${Math.abs(futureDays)}d atraso` : `em ${futureDays}d`}
                                                </span>
                                            )}
                                            {p.status === 'pago' && (
                                                <span className="text-xs text-gray-400">
                                                    {p.amountPaid > 0 ? fmt(p.amountPaid) : '✓'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            {(p.status === 'pendente' || p.status === 'vencido') ? (
                                                <button onClick={() => setPagarItem(p)}
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
