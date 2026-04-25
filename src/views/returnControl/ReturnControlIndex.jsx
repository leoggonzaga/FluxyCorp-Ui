import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Card } from '@/components/ui'
import { Notification, toast } from '@/components/ui'
import {
    patientReturnList,
    patientReturnSchedule,
    patientReturnComplete,
    patientReturnCancel,
    patientReturnCreate,
} from '@/api/consultation/consultationService'
import { enterpriseApiGetEmployees } from '@/api/enterprise/EnterpriseService'
import ConsumerSearchInput from '@/components/shared/ConsumerSearchInput'
import { Pattern5 } from '@/components/shared/listPatterns'
import {
    HiOutlineRefresh,
    HiOutlineSearch,
    HiOutlineCalendar,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineClock,
    HiOutlineUser,
    HiOutlinePhone,
    HiOutlineChevronDown,
    HiOutlineBell,
    HiOutlineExclamation,
    HiOutlineClipboardList,
    HiOutlineFilter,
    HiOutlinePlus,
    HiOutlineChevronRight,
    HiOutlineBeaker,
} from 'react-icons/hi'

// ─── Helpers de data ──────────────────────────────────────────────────────────

const today = new Date()
today.setHours(0, 0, 0, 0)

const diffDays = (dateStr) => {
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    return Math.round((d - today) / (1000 * 60 * 60 * 24))
}

const fmtDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

const addDays = (n) => {
    const d = new Date(today)
    d.setDate(d.getDate() + n)
    return d.toISOString().split('T')[0]
}

// ─── Configurações de tipo de retorno ────────────────────────────────────────

const RETURN_TYPES = {
    pos_cirurgico:       { label: 'Pós-operatório',       color: 'bg-rose-50 text-rose-600 border border-rose-100',       bar: 'bg-rose-400',    desc: 'Verificação pós-procedimento cirúrgico' },
    canal:               { label: 'Canal (continuação)',   color: 'bg-orange-50 text-orange-600 border border-orange-100', bar: 'bg-orange-400',  desc: 'Continuação de tratamento de canal' },
    revisao_aparelho:    { label: 'Revisão de Aparelho',   color: 'bg-blue-50 text-blue-600 border border-blue-100',       bar: 'bg-blue-400',    desc: 'Ajuste e controle de aparelho ortodôntico' },
    profilaxia:          { label: 'Profilaxia',            color: 'bg-emerald-50 text-emerald-600 border border-emerald-100', bar: 'bg-emerald-400', desc: 'Limpeza e profilaxia de rotina' },
    implante:            { label: 'Avaliação Implante',    color: 'bg-violet-50 text-violet-600 border border-violet-100', bar: 'bg-violet-400',  desc: 'Acompanhamento de implante osseointegrado' },
    clareamento:         { label: 'Clareamento',           color: 'bg-cyan-50 text-cyan-600 border border-cyan-100',       bar: 'bg-cyan-400',    desc: 'Retorno para avaliação de clareamento' },
    tratamento_pendente: { label: 'Trat. Pendente',        color: 'bg-amber-50 text-amber-600 border border-amber-100',    bar: 'bg-amber-400',   desc: 'Paciente orçado mas não iniciou tratamento' },
    manutencao:          { label: 'Manutenção',            color: 'bg-gray-100 text-gray-600 border border-gray-200',      bar: 'bg-gray-400',    desc: 'Manutenção geral e revisão' },
}

const PRIORITY = {
    alta:  { label: 'Alta',  color: 'text-rose-500',    dot: 'bg-rose-400' },
    media: { label: 'Média', color: 'text-amber-500',   dot: 'bg-amber-400' },
    baixa: { label: 'Baixa', color: 'text-emerald-500', dot: 'bg-emerald-400' },
}

// ─── API mapping ─────────────────────────────────────────────────────────────

const TYPE_INT_TO_KEY = {
    0: 'pos_cirurgico', 1: 'canal', 2: 'revisao_aparelho', 3: 'profilaxia',
    4: 'implante',      5: 'clareamento', 6: 'tratamento_pendente', 7: 'manutencao',
}
const TYPE_KEY_TO_INT = {
    pos_cirurgico: 0, canal: 1, revisao_aparelho: 2, profilaxia: 3,
    implante: 4, clareamento: 5, tratamento_pendente: 6, manutencao: 7,
}
const STATUS_INT_TO_KEY = { 0: 'pendente', 1: 'agendado', 2: 'realizado', 3: 'cancelado' }
const PRIORITY_INT_TO_KEY = { 0: 'baixa', 1: 'media', 2: 'alta' }
const PRIORITY_KEY_TO_INT = { baixa: 0, media: 1, alta: 2 }

const apiToLocal = (r) => ({
    id:         r.publicId,
    publicId:   r.publicId,
    name:       r.patientName,
    phone:      r.patientPhone || '',
    type:       TYPE_INT_TO_KEY[r.type]     ?? 'manutencao',
    returnDate: r.returnDate.split('T')[0],
    status:     STATUS_INT_TO_KEY[r.status] ?? 'pendente',
    priority:   PRIORITY_INT_TO_KEY[r.priority] ?? 'media',
    dentist:    r.professionalName || '',
    lastProc:   r.lastProcedure || '',
    notes:      r.notes || '',
    _fromApi:   true,
})

// ─── Mock Data (fallback inicial) ────────────────────────────────────────────

const MOCK = [
    { id: '1',  name: 'Maria Santos',       phone: '(11) 98765-4321', type: 'pos_cirurgico',    returnDate: addDays(-15), status: 'vencido',  priority: 'alta',  dentist: 'Drª Ana Lima',    lastProc: 'Extração do siso (38)',       notes: 'Verificar cicatrização e ponto.' },
    { id: '2',  name: 'João Pereira',        phone: '(11) 91234-5678', type: 'canal',            returnDate: addDays(-8),  status: 'vencido',  priority: 'alta',  dentist: 'Dr. Carlos Melo',  lastProc: 'Canal radicular molar 46',    notes: 'Aguardando 2ª sessão para obturar.' },
    { id: '3',  name: 'Fernanda Costa',      phone: '(11) 99876-5432', type: 'revisao_aparelho', returnDate: addDays(-12), status: 'vencido',  priority: 'alta',  dentist: 'Drª Ana Lima',    lastProc: 'Ativação do aparelho fixo',  notes: 'Arco superior solto, urgente.' },
    { id: '4',  name: 'Roberto Albuquerque', phone: '(11) 97654-3210', type: 'clareamento',      returnDate: addDays(-3),  status: 'vencido',  priority: 'baixa', dentist: 'Dr. Carlos Melo',  lastProc: 'Clareamento caseiro kit',    notes: '' },
    { id: '5',  name: 'Claudia Mendes',      phone: '(21) 98888-7777', type: 'profilaxia',       returnDate: addDays(0),   status: 'pendente', priority: 'media', dentist: 'Drª Beatriz Ramos', lastProc: 'Profilaxia semestral',       notes: 'Paciente com histórico de gengivite.' },
    { id: '6',  name: 'Lucas Oliveira',      phone: '(21) 97777-6666', type: 'implante',         returnDate: addDays(0),   status: 'pendente', priority: 'alta',  dentist: 'Dr. Carlos Melo',  lastProc: 'Instalação implante #36',    notes: 'Controle de osseointegração.' },
    { id: '7',  name: 'Patricia Souza',      phone: '(11) 96666-5555', type: 'revisao_aparelho', returnDate: addDays(2),   status: 'pendente', priority: 'alta',  dentist: 'Drª Ana Lima',    lastProc: 'Ativação bimestral',         notes: '' },
    { id: '8',  name: 'Eduardo Rodrigues',   phone: '(11) 95555-4444', type: 'manutencao',       returnDate: addDays(3),   status: 'pendente', priority: 'baixa', dentist: 'Drª Beatriz Ramos', lastProc: 'Restauração classe II #14',  notes: 'Verificar oclusão.' },
    { id: '9',  name: 'Amanda Lima',         phone: '(31) 94444-3333', type: 'canal',            returnDate: addDays(5),   status: 'pendente', priority: 'alta',  dentist: 'Dr. Carlos Melo',  lastProc: 'Canal 1ª sessão #26',        notes: 'Retorno para curativo e obturação.' },
    { id: '10', name: 'Bruno Santos',        phone: '(11) 93333-2222', type: 'profilaxia',       returnDate: addDays(12),  status: 'pendente', priority: 'baixa', dentist: 'Drª Ana Lima',    lastProc: 'Profilaxia + raspagem',      notes: '' },
    { id: '11', name: 'Carla Pereira',       phone: '(11) 92222-1111', type: 'implante',         returnDate: addDays(18),  status: 'pendente', priority: 'media', dentist: 'Dr. Carlos Melo',  lastProc: 'Molde para prótese sobre implante', notes: 'Aguardar laboratório.' },
    { id: '12', name: 'Fábio Costa',         phone: '(51) 98000-1234', type: 'tratamento_pendente', returnDate: addDays(25), status: 'pendente', priority: 'media', dentist: 'Drª Beatriz Ramos', lastProc: 'Orçamento: 3 canais + prótese', notes: 'Cliente recebeu orçamento R$ 4.200 em 10/mar.' },
    { id: '13', name: 'Helena Martins',      phone: '(11) 91111-0000', type: 'revisao_aparelho', returnDate: addDays(7),   status: 'agendado', priority: 'alta',  dentist: 'Drª Ana Lima',    lastProc: 'Ativação + mola aberta',     notes: '' },
    { id: '14', name: 'Sandro Alves',        phone: '(21) 90000-9999', type: 'pos_cirurgico',    returnDate: addDays(1),   status: 'agendado', priority: 'alta',  dentist: 'Dr. Carlos Melo',  lastProc: 'Extração cirúrgica múltipla', notes: 'Agendar remoção de pontos.' },
    { id: '15', name: 'Gustavo Ferreira',    phone: '(11) 99999-8888', type: 'profilaxia',       returnDate: addDays(-5),  status: 'realizado', priority: 'baixa', dentist: 'Drª Beatriz Ramos', lastProc: 'Profilaxia + flúor',        notes: '' },
    { id: '16', name: 'Isabela Costa',       phone: '(11) 88888-7777', type: 'revisao_aparelho', returnDate: addDays(-2),  status: 'realizado', priority: 'media', dentist: 'Drª Ana Lima',   lastProc: 'Ativação + elásticos',       notes: '' },
    { id: '17', name: 'Rafael Cunha',        phone: '(21) 77777-6666', type: 'clareamento',      returnDate: addDays(-6),  status: 'cancelado', priority: 'baixa', dentist: 'Dr. Carlos Melo',  lastProc: 'Clareamento em consultório', notes: 'Paciente desmarcou, não retornou.' },
    { id: '18', name: 'Mariana Gomes',       phone: '(41) 66666-5555', type: 'manutencao',       returnDate: addDays(22),  status: 'pendente', priority: 'baixa', dentist: 'Drª Beatriz Ramos', lastProc: 'Revisão geral bianual',      notes: '' },
]

// ─── Urgency helpers ──────────────────────────────────────────────────────────

const getUrgency = (item) => {
    if (item.status === 'realizado' || item.status === 'cancelado') return 'done'
    if (item.status === 'agendado') return 'agendado'
    const d = diffDays(item.returnDate)
    if (d < 0)  return 'vencido'
    if (d === 0) return 'hoje'
    if (d <= 7)  return 'semana'
    return 'futuro'
}

const URGENCY_META = {
    vencido:  { bar: 'bg-rose-400',    metricColor: 'text-rose-500',    badgeColor: 'bg-rose-50 text-rose-600 border border-rose-100' },
    hoje:     { bar: 'bg-amber-400',   metricColor: 'text-amber-500',   badgeColor: 'bg-amber-50 text-amber-600 border border-amber-100' },
    semana:   { bar: 'bg-blue-400',    metricColor: 'text-blue-500',    badgeColor: 'bg-blue-50 text-blue-600 border border-blue-100' },
    agendado: { bar: 'bg-violet-400',  metricColor: 'text-violet-600',  badgeColor: 'bg-violet-50 text-violet-600 border border-violet-100' },
    futuro:   { bar: 'bg-emerald-400', metricColor: 'text-emerald-600', badgeColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
    done:     { bar: 'bg-gray-300',    metricColor: 'text-gray-400',    badgeColor: 'bg-gray-100 text-gray-500 border border-gray-200' },
}

const metricLabel = (item, urgency) => {
    const d = diffDays(item.returnDate)
    if (urgency === 'realizado' || urgency === 'cancelado') return '—'
    if (urgency === 'done') return item.status === 'realizado' ? '✓' : '✕'
    if (urgency === 'agendado') return d === 0 ? '0d' : d > 0 ? `+${d}d` : `${d}d`
    if (urgency === 'vencido') return `${d}d`
    if (urgency === 'hoje') return '0d'
    return `+${d}d`
}

const metricSub = (item, urgency) => {
    if (urgency === 'done') return item.status === 'realizado' ? 'realizado' : 'cancelado'
    if (urgency === 'vencido') return 'em atraso'
    if (urgency === 'hoje') return 'hoje'
    if (urgency === 'agendado') return 'agendado'
    return fmtDate(item.returnDate)
}

// ─── Mapa status para badge ────────────────────────────────────────────────────

const STATUS_BADGE = {
    pendente:  'bg-amber-50 text-amber-600 border border-amber-100',
    agendado:  'bg-violet-50 text-violet-600 border border-violet-100',
    vencido:   'bg-rose-50 text-rose-600 border border-rose-100',
    realizado: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    cancelado: 'bg-gray-100 text-gray-500 border border-gray-200',
}

const STATUS_LABEL = {
    pendente: 'Pendente', agendado: 'Agendado', vencido: 'Vencido',
    realizado: 'Realizado', cancelado: 'Cancelado',
}

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ icon, message, sub }) => (
    <div className='flex flex-col items-center justify-center py-10 gap-2.5 select-none'>
        <div className='w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600'>
            <span className='text-2xl'>{icon}</span>
        </div>
        <div className='text-center'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{message}</p>
            {sub && <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>{sub}</p>}
        </div>
    </div>
)

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color, bg, icon: Icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 ${
            active
                ? `${bg} border-current shadow-sm ring-2 ring-current/20`
                : 'bg-white dark:bg-gray-800/60 border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600'
        }`}
    >
        <div className='flex items-start justify-between gap-2'>
            <div>
                <p className={`text-2xl font-bold leading-none ${color}`}>{value}</p>
                <p className='text-xs font-medium text-gray-500 dark:text-gray-400 mt-1.5'>{label}</p>
                {sub && <p className='text-[10px] text-gray-400 dark:text-gray-500 mt-0.5'>{sub}</p>}
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
        </div>
    </button>
)

// ─── Schedule Modal ───────────────────────────────────────────────────────────

const ScheduleModal = ({ item, onClose, onConfirm }) => {
    const [date, setDate] = useState(addDays(1))
    const [notes, setNotes] = useState(item?.notes ?? '')

    if (!item) return null

    const typeInfo = RETURN_TYPES[item.type]
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onClose} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden'>
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className='w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center'>
                        <HiOutlineCalendar className='w-5 h-5 text-violet-600 dark:text-violet-400' />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100'>Agendar Retorno</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>{item.name} · {typeInfo.label}</p>
                    </div>
                    <button onClick={onClose} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>
                <div className='px-6 py-5 space-y-4'>
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                            Data do Retorno
                        </label>
                        <input
                            type='date'
                            value={date}
                            min={addDays(0)}
                            onChange={(e) => setDate(e.target.value)}
                            className='w-full py-2.5 px-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all'
                        />
                    </div>
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                            Observação
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder='Instruções ou observações para o retorno…'
                            rows={3}
                            className='w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all resize-none'
                        />
                    </div>
                    <div className='flex items-center gap-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40'>
                        <HiOutlineBell className='w-4 h-4 text-violet-500 flex-shrink-0' />
                        <p className='text-xs text-violet-700 dark:text-violet-300'>
                            O paciente receberá um lembrete automático 2 dias antes.
                        </p>
                    </div>
                </div>
                <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button onClick={onClose} className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition'>
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(item.id, date, notes)}
                        className='flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm'
                    >
                        <HiOutlineCalendar className='w-4 h-4' /> Confirmar Agendamento
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── New Return Modal ─────────────────────────────────────────────────────────

const RETURN_DATE_DEFAULTS = {
    pos_cirurgico: 7, canal: 14, revisao_aparelho: 30, profilaxia: 180,
    implante: 30, clareamento: 14, tratamento_pendente: 7, manutencao: 90,
}

const NewReturnModal = ({ onClose, onSaved }) => {
    const [patientTerm, setPatientTerm]     = useState('')
    const [patientId, setPatientId]         = useState(null)
    const [patientName, setPatientName]     = useState('')
    const [patientPhone, setPatientPhone]   = useState('')
    const [type, setType]                   = useState('manutencao')
    const [returnDate, setReturnDate]       = useState(addDays(90))
    const [priority, setPriority]           = useState('media')
    const [professionalId, setProfessionalId] = useState('')
    const [lastProc, setLastProc]           = useState('')
    const [notes, setNotes]                 = useState('')
    const [employees, setEmployees]         = useState([])
    const [loadingEmp, setLoadingEmp]       = useState(false)
    const [saving, setSaving]               = useState(false)

    useEffect(() => {
        setLoadingEmp(true)
        enterpriseApiGetEmployees()
            .then(r => setEmployees(Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : []))
            .finally(() => setLoadingEmp(false))
    }, [])

    useEffect(() => {
        const days = RETURN_DATE_DEFAULTS[type] ?? 30
        setReturnDate(addDays(days))
    }, [type])

    const handleSelectPatient = (consumer) => {
        setPatientId(consumer.publicId ?? null)
        const name = consumer.socialName || consumer.name || consumer.fullName || ''
        setPatientName(name)
        setPatientTerm(name)
        setPatientPhone(consumer.phoneNumber ?? consumer.phone ?? '')
    }

    const handleConfirm = async () => {
        if (!patientId || !returnDate) return
        setSaving(true)
        try {
            await patientReturnCreate({
                patientId,
                patientName,
                patientPhone:    patientPhone || null,
                professionalId:  professionalId || null,
                professionalName: employees.find(e => e.publicId === professionalId)?.fullName || null,
                type:            TYPE_KEY_TO_INT[type] ?? 7,
                priority:        PRIORITY_KEY_TO_INT[priority] ?? 1,
                returnDate:      new Date(returnDate + 'T12:00:00').toISOString(),
                lastProcedure:   lastProc || null,
                notes:           notes || null,
            })
            toast.push(
                <Notification type='success' title='Retorno criado'>
                    {patientName} · {RETURN_TYPES[type]?.label} · {new Date(returnDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                </Notification>,
                { placement: 'top-center' }
            )
            onSaved()
        } catch {
            toast.push(
                <Notification type='danger' title='Erro'>Não foi possível criar o retorno.</Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setSaving(false)
        }
    }

    const inp = 'w-full py-2.5 px-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all'

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden'>
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className='w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center'>
                        <HiOutlineRefresh className='w-5 h-5 text-violet-600 dark:text-violet-400' />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100'>Novo Retorno</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>Registre manualmente um retorno pendente</p>
                    </div>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>

                <div className='px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto'>

                    {/* Busca de paciente */}
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                            Paciente *
                        </label>
                        <ConsumerSearchInput
                            value={patientTerm}
                            onChange={(v) => { setPatientTerm(v); setPatientId(null); setPatientName(''); setPatientPhone('') }}
                            onSelect={handleSelectPatient}
                            placeholder='Buscar paciente por nome ou CPF…'
                            inputClass='rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-violet-400/30 focus:border-violet-400'
                        />
                        {patientId && (
                            <div className='mt-1.5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40'>
                                <HiOutlineCheck className='w-3.5 h-3.5 text-violet-500 flex-shrink-0' />
                                <span className='text-xs font-medium text-violet-700 dark:text-violet-300 truncate'>{patientName}</span>
                                {patientPhone && <span className='text-xs text-violet-400 ml-auto flex-shrink-0'>{patientPhone}</span>}
                            </div>
                        )}
                    </div>

                    {/* Profissional */}
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                            Profissional Responsável
                        </label>
                        <select
                            value={professionalId}
                            onChange={e => setProfessionalId(e.target.value)}
                            disabled={loadingEmp}
                            className={`${inp} ${loadingEmp ? 'opacity-60' : ''}`}
                        >
                            <option value=''>{loadingEmp ? 'Carregando…' : 'Selecionar profissional (opcional)'}</option>
                            {employees.map(e => (
                                <option key={e.publicId} value={e.publicId}>
                                    {e.fullName}{e.jobTitle ? ` — ${e.jobTitle}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tipo de retorno */}
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                            Tipo de Retorno *
                        </label>
                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                            {Object.entries(RETURN_TYPES).map(([k, v]) => (
                                <button key={k} type='button' onClick={() => setType(k)}
                                    className={`text-left px-2.5 py-2 rounded-xl border text-xs font-medium transition-all ${type === k ? 'border-violet-400 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:border-violet-600 dark:text-violet-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}>
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Data + Prioridade */}
                    <div className='grid grid-cols-2 gap-3'>
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>Data Prevista *</label>
                            <input type='date' value={returnDate} onChange={e => setReturnDate(e.target.value)} className={inp} />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>Prioridade</label>
                            <select value={priority} onChange={e => setPriority(e.target.value)} className={inp}>
                                <option value='alta'>Alta</option>
                                <option value='media'>Média</option>
                                <option value='baixa'>Baixa</option>
                            </select>
                        </div>
                    </div>

                    {/* Último procedimento */}
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>Último Procedimento</label>
                        <input value={lastProc} onChange={e => setLastProc(e.target.value)} placeholder='Ex: Extração do siso + sutura' className={inp} />
                    </div>

                    {/* Observações */}
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>Observações</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder='Instrução pré/pós, cuidados especiais…' className={`${inp} resize-none`} />
                    </div>
                </div>

                <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button onClick={() => !saving && onClose()} disabled={saving} className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition'>
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={saving || !patientId || !returnDate}
                        title={!patientId ? 'Selecione um paciente da lista' : undefined}
                        className='flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white transition shadow-sm'
                    >
                        {saving
                            ? <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' /> Salvando…</>
                            : <><HiOutlinePlus className='w-4 h-4' /> Criar Retorno</>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

const DetailDrawer = ({ item, onClose, onSchedule, onDone, onCancel }) => {
    if (!item) return null
    const typeInfo = RETURN_TYPES[item.type]
    const priority = PRIORITY[item.priority]
    const d = diffDays(item.returnDate)
    const urgency = getUrgency(item)
    const urgencyMeta = URGENCY_META[urgency]

    return (
        <div className='fixed inset-0 z-50 flex justify-end'>
            <div className='absolute inset-0 bg-black/30 backdrop-blur-sm' onClick={onClose} />
            <div className='relative bg-white dark:bg-gray-900 w-full max-w-sm h-full flex flex-col shadow-2xl overflow-hidden'>
                {/* Header */}
                <div className={`h-1.5 w-full ${urgencyMeta.bar}`} />
                <div className='flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800'>
                    <div className='flex items-center gap-3'>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${urgencyMeta.bar}`}>
                            {item.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className='font-bold text-gray-800 dark:text-gray-100 text-sm'>{item.name}</h3>
                            <p className='text-xs text-gray-400 flex items-center gap-1'>
                                <HiOutlinePhone className='w-3 h-3' /> {item.phone}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>

                <div className='flex-1 overflow-y-auto px-5 py-4 space-y-4'>
                    {/* Status banner */}
                    <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${urgencyMeta.badgeColor}`}>
                        {urgency === 'vencido' && <HiOutlineExclamation className='w-4 h-4 flex-shrink-0' />}
                        {urgency === 'hoje'    && <HiOutlineClock className='w-4 h-4 flex-shrink-0' />}
                        {urgency === 'agendado' && <HiOutlineCalendar className='w-4 h-4 flex-shrink-0' />}
                        {(urgency === 'semana' || urgency === 'futuro') && <HiOutlineCalendar className='w-4 h-4 flex-shrink-0' />}
                        <div>
                            <p className='text-xs font-semibold'>
                                {urgency === 'vencido' && `Vencido há ${Math.abs(d)} dia${Math.abs(d) !== 1 ? 's' : ''}`}
                                {urgency === 'hoje'    && 'Retorno previsto para hoje'}
                                {urgency === 'agendado' && `Retorno agendado — ${fmtDate(item.returnDate)}`}
                                {urgency === 'semana'   && `Retorno em ${d} dia${d !== 1 ? 's' : ''} — ${fmtDate(item.returnDate)}`}
                                {urgency === 'futuro'   && `Previsto para ${fmtDate(item.returnDate)}`}
                                {urgency === 'done'     && (item.status === 'realizado' ? 'Retorno realizado' : 'Retorno cancelado')}
                            </p>
                            <p className='text-[11px] mt-0.5 opacity-70'>Data prevista: {fmtDate(item.returnDate)}</p>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className='grid grid-cols-2 gap-3'>
                        {[
                            { label: 'Tipo de Retorno',   value: typeInfo.label },
                            { label: 'Prioridade',         value: priority.label },
                            { label: 'Profissional',       value: item.dentist || '—' },
                            { label: 'Status',             value: STATUS_LABEL[item.status] },
                        ].map(({ label, value }) => (
                            <div key={label} className='p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50'>
                                <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide'>{label}</p>
                                <p className='text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5'>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Last procedure */}
                    {item.lastProc && (
                        <div className='p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50'>
                            <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1'>Último Procedimento</p>
                            <p className='text-sm text-gray-700 dark:text-gray-200 flex items-start gap-1.5'>
                                <HiOutlineBeaker className='w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5' />
                                {item.lastProc}
                            </p>
                        </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                        <div className='p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40'>
                            <p className='text-[10px] font-semibold text-amber-600 uppercase tracking-wide mb-1'>Observação</p>
                            <p className='text-sm text-amber-800 dark:text-amber-200'>{item.notes}</p>
                        </div>
                    )}

                    {/* WhatsApp contact */}
                    <a
                        href={`https://wa.me/55${item.phone.replace(/\D/g, '')}`}
                        target='_blank'
                        rel='noreferrer'
                        className='flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition group'
                    >
                        <div className='w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0'>
                            <svg className='w-5 h-5 text-white' viewBox='0 0 24 24' fill='currentColor'>
                                <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'/>
                            </svg>
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-semibold text-emerald-700 dark:text-emerald-300'>Contatar via WhatsApp</p>
                            <p className='text-xs text-emerald-600 dark:text-emerald-400'>{item.phone}</p>
                        </div>
                        <HiOutlineChevronRight className='w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform' />
                    </a>
                </div>

                {/* Actions */}
                {item.status !== 'realizado' && item.status !== 'cancelado' && (
                    <div className='px-5 py-4 border-t border-gray-100 dark:border-gray-800 space-y-2'>
                        {item.status !== 'agendado' && (
                            <button
                                onClick={() => { onSchedule(item); onClose() }}
                                className='w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm'
                            >
                                <HiOutlineCalendar className='w-4 h-4' /> Agendar Retorno
                            </button>
                        )}
                        <button
                            onClick={() => { onDone(item.id); onClose() }}
                            className='w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition'
                        >
                            <HiOutlineCheck className='w-4 h-4' /> Marcar como Realizado
                        </button>
                        <button
                            onClick={() => { onCancel(item.id); onClose() }}
                            className='w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition'
                        >
                            <HiOutlineX className='w-4 h-4' /> Cancelar Retorno
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
    { key: 'todos',    label: 'Todos' },
    { key: 'vencido',  label: 'Vencidos',       color: 'text-rose-500',    active: 'border-rose-400 text-rose-600' },
    { key: 'hoje',     label: 'Hoje',            color: 'text-amber-500',   active: 'border-amber-400 text-amber-600' },
    { key: 'semana',   label: 'Esta Semana',     color: 'text-blue-500',    active: 'border-blue-400 text-blue-600' },
    { key: 'futuro',   label: 'Próx. 30 dias',   color: 'text-emerald-600', active: 'border-emerald-400 text-emerald-600' },
    { key: 'agendado', label: 'Agendados',        color: 'text-violet-500',  active: 'border-violet-400 text-violet-600' },
    { key: 'done',     label: 'Encerrados',       color: 'text-gray-400',    active: 'border-gray-400 text-gray-600' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

const ReturnControlIndex = () => {
    const [data, setData]           = useState([])
    const [loading, setLoading]     = useState(true)
    const [tab, setTab]             = useState('todos')
    const [search, setSearch]       = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [dentistFilter, setDentistFilter] = useState('')
    const [scheduleItem, setScheduleItem] = useState(null)
    const [detailItem, setDetailItem]   = useState(null)
    const [newModal, setNewModal]       = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    const loadReturns = useCallback(async () => {
        setLoading(true)
        try {
            const res = await patientReturnList()
            setData((res ?? []).map(apiToLocal))
        } catch {
            toast.push(
                <Notification type='danger' title='Erro'>Não foi possível carregar os retornos.</Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadReturns() }, [loadReturns])

    const dentists = useMemo(() => [...new Set(data.map(d => d.dentist).filter(Boolean))], [data])

    const enriched = useMemo(() => data.map(item => {
        const urgency = getUrgency(item)
        const uMeta   = URGENCY_META[urgency]
        const tInfo   = RETURN_TYPES[item.type]
        return {
            ...item,
            _urgency: urgency,
            _diff:    diffDays(item.returnDate),
        }
    }), [data])

    const counts = useMemo(() => ({
        vencido:  enriched.filter(i => i._urgency === 'vencido').length,
        hoje:     enriched.filter(i => i._urgency === 'hoje').length,
        semana:   enriched.filter(i => i._urgency === 'semana').length,
        futuro:   enriched.filter(i => i._urgency === 'futuro').length,
        agendado: enriched.filter(i => i._urgency === 'agendado').length,
        done:     enriched.filter(i => i._urgency === 'done').length,
    }), [enriched])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return enriched.filter(item => {
            if (tab !== 'todos' && item._urgency !== tab) return false
            if (typeFilter && item.type !== typeFilter) return false
            if (dentistFilter && item.dentist !== dentistFilter) return false
            if (q && !item.name.toLowerCase().includes(q) && !item.lastProc.toLowerCase().includes(q)) return false
            return true
        }).sort((a, b) => {
            const order = { vencido: 0, hoje: 1, semana: 2, agendado: 3, futuro: 4, done: 5 }
            const diff = (order[a._urgency] ?? 9) - (order[b._urgency] ?? 9)
            if (diff !== 0) return diff
            return a._diff - b._diff
        })
    }, [enriched, tab, search, typeFilter, dentistFilter])

    const toPattern5 = (item) => {
        const urgency = item._urgency
        const uMeta   = URGENCY_META[urgency]
        const tInfo   = RETURN_TYPES[item.type]
        return {
            id:          item.id,
            name:        item.name,
            avatarName:  item.name,
            sub1:        tInfo.label,
            sub1Icon:    HiOutlineBeaker,
            sub2:        `${item.dentist}${item.lastProc ? '  ·  ' + item.lastProc : ''}`,
            sub2Icon:    HiOutlineUser,
            badge:       STATUS_LABEL[item.status],
            badgeColor:  STATUS_BADGE[item.status],
            barColor:    uMeta.bar,
            metric:      metricLabel(item, urgency),
            metricColor: uMeta.metricColor,
            metricSub:   metricSub(item, urgency),
            _raw:        item,
        }
    }

    const handleScheduleConfirm = async (id, date, notes) => {
        const item = data.find(i => i.id === id)
        if (item?._fromApi) {
            try {
                await patientReturnSchedule(id, { returnDate: new Date(date + 'T12:00:00').toISOString(), notes: notes || null })
                setData(prev => prev.map(i => i.id === id ? { ...i, returnDate: date, status: 'agendado', notes } : i))
            } catch {
                toast.push(<Notification type='danger' title='Erro'>Falha ao agendar retorno.</Notification>, { placement: 'top-center' })
            }
        } else {
            setData(prev => prev.map(i => i.id === id ? { ...i, returnDate: date, status: 'agendado', notes } : i))
        }
        setScheduleItem(null)
    }

    const handleDone = async (id) => {
        const item = data.find(i => i.id === id)
        if (item?._fromApi) {
            try {
                await patientReturnComplete(id)
                setData(prev => prev.map(i => i.id === id ? { ...i, status: 'realizado' } : i))
            } catch {
                toast.push(<Notification type='danger' title='Erro'>Falha ao concluir retorno.</Notification>, { placement: 'top-center' })
            }
        } else {
            setData(prev => prev.map(i => i.id === id ? { ...i, status: 'realizado' } : i))
        }
    }

    const handleCancel = async (id) => {
        const item = data.find(i => i.id === id)
        if (item?._fromApi) {
            try {
                await patientReturnCancel(id)
                setData(prev => prev.map(i => i.id === id ? { ...i, status: 'cancelado' } : i))
            } catch {
                toast.push(<Notification type='danger' title='Erro'>Falha ao cancelar retorno.</Notification>, { placement: 'top-center' })
            }
        } else {
            setData(prev => prev.map(i => i.id === id ? { ...i, status: 'cancelado' } : i))
        }
    }

    const handleNewSaved = () => {
        setNewModal(false)
        loadReturns()
    }

    const actions = [
        {
            key: 'schedule',
            icon: <HiOutlineCalendar className='w-4 h-4' />,
            tooltip: 'Agendar retorno',
            visible: (item) => item._raw.status !== 'realizado' && item._raw.status !== 'cancelado' && item._raw.status !== 'agendado',
            onClick: (item) => setScheduleItem(item._raw),
            className: 'p-1.5 rounded-lg text-violet-500 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition',
        },
        {
            key: 'done',
            icon: <HiOutlineCheck className='w-4 h-4' />,
            tooltip: 'Marcar como realizado',
            visible: (item) => item._raw.status !== 'realizado' && item._raw.status !== 'cancelado',
            onClick: (item) => handleDone(item._raw.id),
            className: 'p-1.5 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition',
        },
        {
            key: 'cancel',
            icon: <HiOutlineX className='w-4 h-4' />,
            tooltip: 'Cancelar retorno',
            visible: (item) => item._raw.status !== 'realizado' && item._raw.status !== 'cancelado',
            onClick: (item) => handleCancel(item._raw.id),
            className: 'p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition',
        },
    ]

    const realizados = data.filter(i => i.status === 'realizado').length
    const totalAtivos = counts.vencido + counts.hoje + counts.semana + counts.futuro + counts.agendado
    const taxaRetorno = data.length > 0 ? Math.round((realizados / data.length) * 100) : 0

    return (
        <div className='w-full p-4 space-y-5'>

            {/* Modais */}
            {scheduleItem && (
                <ScheduleModal item={scheduleItem} onClose={() => setScheduleItem(null)} onConfirm={handleScheduleConfirm} />
            )}
            {newModal && (
                <NewReturnModal onClose={() => setNewModal(false)} onSaved={handleNewSaved} />
            )}
            {detailItem && (
                <DetailDrawer
                    item={detailItem}
                    onClose={() => setDetailItem(null)}
                    onSchedule={setScheduleItem}
                    onDone={handleDone}
                    onCancel={handleCancel}
                />
            )}

            {/* ── Header ── */}
            <div className='flex items-start justify-between gap-3 flex-wrap'>
                <div>
                    <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
                        <HiOutlineRefresh className='w-6 h-6 text-violet-500' />
                        Controle de Retorno
                    </h2>
                    <p className='text-sm text-gray-400 mt-0.5'>
                        Monitore e gerencie os retornos pendentes dos pacientes
                    </p>
                </div>
                <button
                    onClick={() => setNewModal(true)}
                    className='flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm'
                >
                    <HiOutlinePlus className='w-4 h-4' /> Novo Retorno
                </button>
            </div>

            {/* ── Stats ── */}
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
                <StatCard label='Vencidos'      value={counts.vencido}  color='text-rose-500'    bg='bg-rose-50 dark:bg-rose-900/20'     icon={HiOutlineExclamation} active={tab === 'vencido'}  onClick={() => setTab(t => t === 'vencido' ? 'todos' : 'vencido')} />
                <StatCard label='Hoje'           value={counts.hoje}     color='text-amber-500'   bg='bg-amber-50 dark:bg-amber-900/20'   icon={HiOutlineClock}       active={tab === 'hoje'}    onClick={() => setTab(t => t === 'hoje' ? 'todos' : 'hoje')} />
                <StatCard label='Esta Semana'    value={counts.semana}   color='text-blue-500'    bg='bg-blue-50 dark:bg-blue-900/20'     icon={HiOutlineCalendar}    active={tab === 'semana'}  onClick={() => setTab(t => t === 'semana' ? 'todos' : 'semana')} />
                <StatCard label='Agendados'      value={counts.agendado} color='text-violet-500'  bg='bg-violet-50 dark:bg-violet-900/20' icon={HiOutlineClipboardList} active={tab === 'agendado'} onClick={() => setTab(t => t === 'agendado' ? 'todos' : 'agendado')} />
                <StatCard label='Taxa de Retorno' value={`${taxaRetorno}%`} color='text-emerald-600' bg='bg-emerald-50 dark:bg-emerald-900/20' icon={HiOutlineCheck} sub={`${realizados} realizados`} active={false} onClick={() => {}} />
            </div>

            {/* ── Filtros ── */}
            <Card className='border border-gray-100 dark:border-gray-700/50'>
                <div className='flex items-center gap-3 flex-wrap'>
                    <div className='relative flex-1 min-w-[180px]'>
                        <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4' />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Buscar paciente ou procedimento…'
                            className='w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 placeholder-gray-400 transition-all'
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(p => !p)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-xl border transition-all ${showFilters ? 'border-violet-400 bg-violet-50 text-violet-700 dark:bg-violet-900/20' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <HiOutlineFilter className='w-4 h-4' />
                        Filtros
                        <HiOutlineChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                    {(search || typeFilter || dentistFilter || tab !== 'todos') && (
                        <button onClick={() => { setSearch(''); setTypeFilter(''); setDentistFilter(''); setTab('todos') }} className='text-xs font-medium text-violet-600 hover:text-violet-700 transition'>
                            Limpar
                        </button>
                    )}
                </div>
                {showFilters && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50'>
                        <div>
                            <label className='block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5'>Tipo de Retorno</label>
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className='w-full py-2.5 px-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition-all'>
                                <option value=''>Todos os tipos</option>
                                {Object.entries(RETURN_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5'>Profissional</label>
                            <select value={dentistFilter} onChange={e => setDentistFilter(e.target.value)} className='w-full py-2.5 px-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition-all'>
                                <option value=''>Todos os profissionais</option>
                                {dentists.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </Card>

            {/* ── Tabs ── */}
            <div className='flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5'>
                {TABS.map(t => {
                    const count = counts[t.key]
                    const isActive = tab === t.key
                    return (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                                isActive
                                    ? `bg-white dark:bg-gray-800 shadow-sm ${t.active ?? 'border-violet-400 text-violet-600 dark:text-violet-400'}`
                                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            {t.label}
                            {count != null && count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-current/15' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* ── Lista ── */}
            <Card className='border border-gray-100 dark:border-gray-700/50'>
                {loading ? (
                    <div className='flex items-center justify-center py-10'>
                        <div className='w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin' />
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={<HiOutlineRefresh />}
                        message='Nenhum retorno encontrado'
                        sub={search || typeFilter || dentistFilter ? 'Tente ajustar os filtros' : 'Todos os pacientes estão em dia!'}
                    />
                ) : (
                    <Pattern5
                        items={filtered.map(toPattern5)}
                        actions={actions}
                        onItemClick={(item) => setDetailItem(item._raw)}
                    />
                )}
            </Card>

            {/* ── Legenda ── */}
            <Card className='border border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30'>
                <div className='flex flex-wrap items-center gap-x-5 gap-y-1.5'>
                    <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Legenda</span>
                    {[
                        { bar: 'bg-rose-400',    label: 'Vencido' },
                        { bar: 'bg-amber-400',   label: 'Hoje' },
                        { bar: 'bg-blue-400',    label: 'Esta semana' },
                        { bar: 'bg-emerald-400', label: 'Próximos 30 dias' },
                        { bar: 'bg-violet-400',  label: 'Agendado' },
                    ].map(({ bar, label }) => (
                        <span key={label} className='flex items-center gap-1.5 text-xs text-gray-400'>
                            <span className={`w-2.5 h-2.5 rounded-full ${bar}`} /> {label}
                        </span>
                    ))}
                    <span className='text-xs text-gray-400 ml-auto'>Clique na linha para ver detalhes · Métrica = dias até/desde o retorno</span>
                </div>
            </Card>
        </div>
    )
}

export default ReturnControlIndex
