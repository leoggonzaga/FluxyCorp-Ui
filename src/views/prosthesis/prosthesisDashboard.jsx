import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlinePlus, HiOutlineBeaker, HiOutlineClipboardList, HiOutlineTruck, HiOutlineCurrencyDollar, HiOutlineCalendar } from 'react-icons/hi'
import { Button, Card, Dialog, Notification, toast } from '@/components/ui'
import { Loading } from '@/components/shared'
import { getProsthesisRequestsPaged } from '@/api/prosthesis/prosthesisService'
import ProsthesisRequestUpsert from './components/ProsthesisRequestUpsert'
import ProsthesisStatusBadge from './components/ProsthesisStatusBadge'

const DATE_PRESETS = [
    { label: '7 dias', days: 7 },
    { label: '1 mês', days: 30 },
    { label: '2 meses', days: 60 },
    { label: '3 meses', days: 90 },
    { label: '6 meses', days: 180 },
]

const toInputDate = (date) => date.toISOString().split('T')[0]
const today = () => new Date()
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d }

const KpiCard = ({ icon, label, value, color, sub }) => (
    <Card className={`border-l-4 ${color} backdrop-blur-sm bg-white/80`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
            <div className={`p-3 rounded-xl bg-opacity-10`}>
                {icon}
            </div>
        </div>
    </Card>
)

const ProsthesisDashboard = () => {
    const navigate = useNavigate()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [isUpsertOpen, setIsUpsertOpen] = useState(false)
    const [paging, setPaging] = useState({ pageNumber: 1, pageSize: 20, total: 0 })
    const [filterStatus, setFilterStatus] = useState('')
    const [activePreset, setActivePreset] = useState(60)
    const [dateFrom, setDateFrom] = useState(toInputDate(daysAgo(60)))
    const [dateTo, setDateTo] = useState(toInputDate(today()))

    const statuses = [
        'Solicitado',
        'Em produção',
        'Em prova',
        'Ajuste solicitado',
        'Finalizado no laboratório',
        'Recebido na clínica',
        'Instalado no paciente',
        'Entregue',
        'Garantia / manutenção',
    ]

    const applyPreset = (days) => {
        setActivePreset(days)
        setDateFrom(toInputDate(daysAgo(days)))
        setDateTo(toInputDate(today()))
        setPaging(prev => ({ ...prev, pageNumber: 1 }))
    }

    const handleDateChange = (field, value) => {
        setActivePreset(null)
        if (field === 'from') setDateFrom(value)
        else setDateTo(value)
        setPaging(prev => ({ ...prev, pageNumber: 1 }))
    }

    const load = async () => {
        setLoading(true)
        const result = await getProsthesisRequestsPaged({
            pageNumber: paging.pageNumber,
            pageSize: paging.pageSize,
            status: filterStatus || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
        })
        if (result?.items) {
            setRequests(result.items)
            setPaging(prev => ({ ...prev, total: result.totalItemCount }))
        }
        setLoading(false)
    }

    useEffect(() => {
        load()
    }, [paging.pageNumber, filterStatus, dateFrom, dateTo])

    const kpis = {
        total: paging.total,
        inProduction: requests.filter(r => r.status === 'Em produção').length,
        pending: requests.filter(r => r.status === 'Solicitado').length,
        delivered: requests.filter(r => r.status === 'Entregue').length,
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Controle de Próteses</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Gerencie solicitações, laboratórios e status de próteses
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="plain" onClick={() => navigate('/prosthesis/types')}>
                        Tipos
                    </Button>
                    <Button size="sm" variant="plain" onClick={() => navigate('/prosthesis/laboratories')}>
                        Laboratórios
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        icon={<HiOutlinePlus />}
                        onClick={() => setIsUpsertOpen(true)}
                    >
                        Nova Solicitação
                    </Button>
                </div>
            </div>

            {/* Date Filter */}
            <Card className="bg-white/70 backdrop-blur-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <HiOutlineCalendar className="w-4 h-4" />
                        <span className="text-xs font-medium">Período</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {DATE_PRESETS.map(p => (
                            <button
                                key={p.days}
                                onClick={() => applyPreset(p.days)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                    activePreset === p.days
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => handleDateChange('from', e.target.value)}
                            className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                        />
                        <span className="text-xs text-gray-400">até</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => handleDateChange('to', e.target.value)}
                            className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                        />
                    </div>
                </div>
            </Card>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard
                    icon={<HiOutlineClipboardList className="w-7 h-7 text-blue-600" />}
                    label="Total este mês"
                    value={kpis.total}
                    color="border-blue-500"
                />
                <KpiCard
                    icon={<HiOutlineBeaker className="w-7 h-7 text-amber-600" />}
                    label="Em produção"
                    value={kpis.inProduction}
                    color="border-amber-500"
                />
                <KpiCard
                    icon={<HiOutlineTruck className="w-7 h-7 text-teal-600" />}
                    label="Solicitadas"
                    value={kpis.pending}
                    color="border-teal-500"
                />
                <KpiCard
                    icon={<HiOutlineCurrencyDollar className="w-7 h-7 text-emerald-600" />}
                    label="Entregues"
                    value={kpis.delivered}
                    color="border-emerald-500"
                />
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilterStatus('')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        !filterStatus
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Todos
                </button>
                {statuses.map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s === filterStatus ? '' : s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            filterStatus === s
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            <Loading loading={loading}>
                {requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <HiOutlineClipboardList className="w-16 h-16 mb-3 opacity-30" />
                        <p className="text-sm font-medium">Nenhuma solicitação encontrada</p>
                        <p className="text-xs mt-1">Crie a primeira solicitação de prótese</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {requests.map(req => (
                            <Card
                                key={req.publicId}
                                className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-indigo-200"
                                onClick={() => navigate(`/prosthesis/requests/${req.publicId}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-800">{req.patientName}</span>
                                            <ProsthesisStatusBadge status={req.status} />
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span>{req.prosthesisTypeName}</span>
                                            {req.tooth && <span>· {req.tooth}</span>}
                                            {req.arch && <span>· {req.arch}</span>}
                                            {req.material && <span>· {req.material}</span>}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                            <span>Dr(a). {req.dentistName}</span>
                                            <span>·</span>
                                            <span>
                                                Moldagem:{' '}
                                                {new Date(req.moldingDate).toLocaleDateString('pt-BR')}
                                            </span>
                                            {req.vitaColor && <span>· Vita: {req.vitaColor}</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {req.patientPrice && (
                                            <span className="text-sm font-semibold text-emerald-600">
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                }).format(req.patientPrice)}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-400">
                                            {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Loading>

            <Dialog
                isOpen={isUpsertOpen}
                onClose={() => setIsUpsertOpen(false)}
                onRequestClose={() => setIsUpsertOpen(false)}
                width={700}
            >
                <ProsthesisRequestUpsert
                    onClose={() => setIsUpsertOpen(false)}
                    load={load}
                />
            </Dialog>
        </div>
    )
}

export default ProsthesisDashboard
