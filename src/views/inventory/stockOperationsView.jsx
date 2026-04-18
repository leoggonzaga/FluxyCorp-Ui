import { useEffect, useMemo, useState } from 'react'
import {
    HiOutlineCube, HiOutlineClipboardList, HiOutlineSearch,
    HiOutlineUser, HiOutlineClock, HiOutlineArrowDown, HiOutlineArrowUp,
    HiOutlineAdjustments, HiOutlineX, HiOutlineTag,
} from 'react-icons/hi'
import { Card, Input, Notification, toast } from '@/components/ui'
import { ConfirmDialog } from '@/components/shared'
import { Pattern5 } from '@/components/shared/listPatterns'
import {
    getStockRequestsPaged, cancelStockRequest,
    getMovementsPaged,
} from '@/api/inventory/inventoryService'
import FulfillRequestDialog from './components/FulfillRequestDialog'

/* ── Configurações ─────────────────────────────────────────────── */

const STATUS_CFG = {
    AguardandoRetirada: { label: 'Aguardando retirada', badgeColor: 'bg-orange-50 border border-orange-200 text-orange-600', badgeIcon: HiOutlineClock,   barColor: 'bg-orange-400' },
    Retirado:           { label: 'Retirado',            badgeColor: 'bg-emerald-50 border border-emerald-200 text-emerald-600', badgeIcon: HiOutlineArrowDown, barColor: 'bg-emerald-400' },
    Cancelado:          { label: 'Cancelado',           badgeColor: 'bg-gray-100 border border-gray-200 text-gray-400',       badgeIcon: HiOutlineX,        barColor: 'bg-gray-300' },
}

const TYPE_CFG = {
    Entrada:  { label: 'Entrada', badgeColor: 'bg-emerald-50 border border-emerald-200 text-emerald-700', badgeIcon: HiOutlineArrowDown, barColor: 'bg-emerald-400', sign: '+', metricColor: 'text-emerald-600' },
    'Saída':  { label: 'Saída',   badgeColor: 'bg-red-50 border border-red-200 text-red-600',             badgeIcon: HiOutlineArrowUp,   barColor: 'bg-red-400',     sign: '−', metricColor: 'text-red-600'     },
    Ajuste:   { label: 'Ajuste',  badgeColor: 'bg-indigo-50 border border-indigo-200 text-indigo-600',    badgeIcon: HiOutlineAdjustments, barColor: 'bg-indigo-400', sign: '',  metricColor: 'text-indigo-600'  },
    Perda:    { label: 'Perda',   badgeColor: 'bg-amber-50 border border-amber-200 text-amber-700',       badgeIcon: HiOutlineX,         barColor: 'bg-amber-400',   sign: '−', metricColor: 'text-amber-600'   },
}

const STATUS_FILTERS = [
    { value: '', label: 'Todos' },
    { value: 'AguardandoRetirada', label: 'Aguardando' },
    { value: 'Retirado', label: 'Retirados' },
    { value: 'Cancelado', label: 'Cancelados' },
]

const TYPE_FILTERS = [
    { value: '', label: 'Todos' },
    { value: 'Entrada', label: 'Entradas' },
    { value: 'Saída', label: 'Saídas' },
    { value: 'Ajuste', label: 'Ajustes' },
    { value: 'Perda', label: 'Perdas' },
]

const PAGE_SIZE = 15

const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

/* ── Chips de filtro ───────────────────────────────────────────── */

const FilterChips = ({ value, onChange, options }) => (
    <div className='flex gap-1.5 flex-wrap'>
        {options.map(f => (
            <button
                key={f.value}
                onClick={() => onChange(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    value === f.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
            >
                {f.label}
            </button>
        ))}
    </div>
)

/* ── Paginação ─────────────────────────────────────────────────── */

const Pager = ({ page, pageSize, total, onChange }) => {
    const pages = Math.ceil(total / pageSize)
    if (pages <= 1) return null
    return (
        <div className='flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/40 mt-2 text-xs text-gray-400'>
            <span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}</span>
            <div className='flex gap-1'>
                <button disabled={page === 1}     onClick={() => onChange(page - 1)} className='px-3 py-1 rounded-lg border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'>← Ant.</button>
                <button disabled={page === pages} onClick={() => onChange(page + 1)} className='px-3 py-1 rounded-lg border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'>Próx. →</button>
            </div>
        </div>
    )
}

/* ── Tab: Solicitações ─────────────────────────────────────────── */

const RequestsTab = () => {
    const [requests, setRequests]   = useState([])
    const [loading, setLoading]     = useState(true)
    const [page, setPage]           = useState(1)
    const [total, setTotal]         = useState(0)
    const [filterStatus, setFilter] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch]       = useState('')
    const [fulfillTarget, setFulfillTarget] = useState(null)
    const [cancelTarget, setCancelTarget]   = useState(null)

    const load = async (p = page) => {
        setLoading(true)
        const result = await getStockRequestsPaged({ pageNumber: p, pageSize: PAGE_SIZE, status: filterStatus || undefined })
        if (result) { setRequests(result.items ?? []); setTotal(result.totalItemCount) }
        setLoading(false)
    }

    useEffect(() => { setPage(1); load(1) }, [filterStatus])

    const handleSearch = (v) => {
        setSearchInput(v)
        if (v.length === 0 || v.length >= 3) setSearch(v)
    }

    const handleCancel = async () => {
        const ok = await cancelStockRequest(cancelTarget._raw.publicId)
        if (ok !== null) {
            toast.push(<Notification type='success' title='Cancelada'>Solicitação cancelada.</Notification>)
            setCancelTarget(null); load()
        }
    }

    const filtered = search
        ? requests.filter(r =>
            r.productName?.toLowerCase().includes(search.toLowerCase()) ||
            r.requestedByEmployeeName?.toLowerCase().includes(search.toLowerCase()))
        : requests

    const items = useMemo(() => filtered.map(req => {
        const st = STATUS_CFG[req.status] ?? STATUS_CFG.Cancelado
        return {
            id:          req.publicId,
            name:        req.productName,
            sub1:        req.requestedByEmployeeName || '—',
            sub1Icon:    HiOutlineUser,
            sub2:        req.reason || undefined,
            badge:       st.label,
            badgeColor:  st.badgeColor,
            badgeIcon:   st.badgeIcon,
            barColor:    st.barColor,
            metric:      req.quantity,
            metricColor: req.status === 'AguardandoRetirada' ? 'text-orange-600' : 'text-gray-500 dark:text-gray-400',
            metricSub:   req.productUnit,
            avatarName:  req.requestedByEmployeeName || req.productName,
            _raw:        req,
        }
    }), [filtered])

    const actions = useMemo(() => [
        {
            key:       'fulfill',
            label:     'Retirar',
            tooltip:   'Confirmar retirada',
            visible:   (item) => item._raw.status === 'AguardandoRetirada',
            onClick:   (item) => setFulfillTarget(item._raw),
            className: 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm',
        },
        {
            key:       'cancel',
            label:     'Cancelar',
            tooltip:   'Cancelar solicitação',
            visible:   (item) => item._raw.status === 'AguardandoRetirada',
            onClick:   (item) => setCancelTarget(item),
            className: 'px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-200 transition-colors',
        },
    ], [])

    return (
        <div className='space-y-4'>
            <Card className='bg-white/70 backdrop-blur-sm border border-gray-100'>
                <div className='flex flex-wrap items-center gap-3'>
                    <div className='flex flex-1 min-w-48'>
                        <Input
                            placeholder='Buscar produto ou funcionário…'
                            prefix={<HiOutlineSearch className='text-gray-400' />}
                            value={searchInput}
                            onChange={e => handleSearch(e.target.value)}
                        />
                    </div>
                    <FilterChips value={filterStatus} onChange={setFilter} options={STATUS_FILTERS} />
                </div>
            </Card>

            <Card className='border border-gray-100'>
                <Pattern5
                    items={items}
                    loading={loading}
                    actions={actions}
                    emptyMessage='Nenhuma solicitação encontrada'
                />
                <Pager page={page} pageSize={PAGE_SIZE} total={total} onChange={(p) => { setPage(p); load(p) }} />
            </Card>

            <FulfillRequestDialog
                isOpen={!!fulfillTarget}
                request={fulfillTarget}
                onClose={() => setFulfillTarget(null)}
                onSuccess={() => { setFulfillTarget(null); load() }}
            />

            <ConfirmDialog
                isOpen={!!cancelTarget}
                onClose={() => setCancelTarget(null)}
                onRequestClose={() => setCancelTarget(null)}
                onCancel={() => setCancelTarget(null)}
                onConfirm={handleCancel}
                type='danger'
                confirmText='Cancelar solicitação'
                cancelText='Voltar'
            >
                Cancelar solicitação de <strong>{cancelTarget?._raw?.quantity} {cancelTarget?._raw?.productUnit}</strong> de{' '}
                <strong>{cancelTarget?._raw?.productName}</strong> para <strong>{cancelTarget?._raw?.requestedByEmployeeName}</strong>?
            </ConfirmDialog>
        </div>
    )
}

/* ── Tab: Movimentações ────────────────────────────────────────── */

const MovementsTab = () => {
    const [movements, setMovements] = useState([])
    const [loading, setLoading]     = useState(true)
    const [page, setPage]           = useState(1)
    const [total, setTotal]         = useState(0)
    const [filterType, setFilter]   = useState('')

    const load = async (p = page) => {
        setLoading(true)
        const result = await getMovementsPaged({ pageNumber: p, pageSize: PAGE_SIZE, type: filterType || undefined })
        if (result) { setMovements(result.items ?? []); setTotal(result.totalItemCount) }
        setLoading(false)
    }

    useEffect(() => { setPage(1); load(1) }, [filterType])

    const items = useMemo(() => movements.map(mov => {
        const tc = TYPE_CFG[mov.type] ?? TYPE_CFG.Ajuste
        return {
            id:          mov.publicId,
            name:        mov.productName,
            sub1:        mov.movedByName ? `Por: ${mov.movedByName}` : undefined,
            sub1Icon:    HiOutlineUser,
            sub2:        mov.requestedByEmployeeName ? `Para: ${mov.requestedByEmployeeName}` : fmtDate(mov.movedAt),
            sub2Icon:    mov.requestedByEmployeeName ? HiOutlineTag : HiOutlineClock,
            badge:       tc.label,
            badgeColor:  tc.badgeColor,
            badgeIcon:   tc.badgeIcon,
            barColor:    tc.barColor,
            metric:      `${tc.sign}${mov.quantity}`,
            metricColor: tc.metricColor,
            metricSub:   `${mov.productUnit}  ·  ${mov.previousStock}→${mov.newStock}`,
            avatarName:  mov.productName,
            _raw:        mov,
        }
    }), [movements])

    return (
        <div className='space-y-4'>
            <Card className='bg-white/70 backdrop-blur-sm border border-gray-100'>
                <FilterChips value={filterType} onChange={setFilter} options={TYPE_FILTERS} />
            </Card>

            <Card className='border border-gray-100'>
                <Pattern5
                    items={items}
                    loading={loading}
                    emptyMessage='Nenhuma movimentação encontrada'
                />
                <Pager page={page} pageSize={PAGE_SIZE} total={total} onChange={(p) => { setPage(p); load(p) }} />
            </Card>
        </div>
    )
}

/* ── View principal ────────────────────────────────────────────── */

const StockOperationsView = () => {
    const [tab, setTab] = useState('requests')

    return (
        <div className='flex flex-col gap-6'>
            <div>
                <h2 className='text-2xl font-bold text-gray-800'>Operações de Estoque</h2>
                <p className='text-sm text-gray-500 mt-1'>Solicitações de retirada e histórico de movimentações</p>
            </div>

            <div className='flex gap-1 bg-gray-100/80 p-1 rounded-xl w-fit'>
                <button
                    onClick={() => setTab('requests')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'requests' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <HiOutlineClipboardList className='w-4 h-4' />
                    Solicitações
                </button>
                <button
                    onClick={() => setTab('movements')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'movements' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <HiOutlineAdjustments className='w-4 h-4' />
                    Movimentações
                </button>
            </div>

            {tab === 'requests' ? <RequestsTab /> : <MovementsTab />}
        </div>
    )
}

export default StockOperationsView
