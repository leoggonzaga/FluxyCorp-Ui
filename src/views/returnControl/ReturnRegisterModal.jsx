import { useState, useEffect } from 'react'
import { Notification, toast } from '@/components/ui'
import {
    HiOutlineRefresh,
    HiOutlineX,
    HiOutlineCalendar,
    HiOutlineCheck,
    HiOutlineBell,
} from 'react-icons/hi'
import { enterpriseApiGetEmployees } from '@/api/enterprise/EnterpriseService'
import { patientReturnCreate } from '@/api/consultation/consultationService'

const RETURN_TYPES = [
    { value: 'pos_cirurgico',       label: 'Pós-operatório',     int: 0 },
    { value: 'canal',               label: 'Canal (continuação)', int: 1 },
    { value: 'revisao_aparelho',    label: 'Revisão de Aparelho', int: 2 },
    { value: 'profilaxia',          label: 'Profilaxia',          int: 3 },
    { value: 'implante',            label: 'Avaliação Implante',  int: 4 },
    { value: 'clareamento',         label: 'Clareamento',         int: 5 },
    { value: 'tratamento_pendente', label: 'Trat. Pendente',      int: 6 },
    { value: 'manutencao',          label: 'Manutenção',          int: 7 },
]

const PRIORITY_INT = { alta: 2, media: 1, baixa: 0 }

const addDays = (n) => {
    const d = new Date()
    d.setDate(d.getDate() + n)
    return d.toISOString().split('T')[0]
}

const today = new Date().toISOString().split('T')[0]

const PRIORITY_DEFAULTS = {
    pos_cirurgico:       { priority: 'alta',  days: 7   },
    canal:               { priority: 'alta',  days: 14  },
    revisao_aparelho:    { priority: 'alta',  days: 30  },
    profilaxia:          { priority: 'baixa', days: 180 },
    implante:            { priority: 'media', days: 30  },
    clareamento:         { priority: 'baixa', days: 14  },
    tratamento_pendente: { priority: 'media', days: 7   },
    manutencao:          { priority: 'baixa', days: 90  },
}

const ReturnRegisterModal = ({
    isOpen,
    onClose,
    patientId    = null,
    patientName  = '',
    patientPhone = '',
    lastProcedure = '',
    dentist      = '',
}) => {
    const [type, setType]         = useState('manutencao')
    const [date, setDate]         = useState(addDays(7))
    const [priority, setPriority] = useState('media')
    const [notes, setNotes]       = useState('')
    const [saving, setSaving]     = useState(false)
    const [dentistId, setDentistId]   = useState('')
    const [dentists, setDentists]     = useState([])
    const [loadingDentists, setLoadingDentists] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setType('manutencao')
        setDate(addDays(90))
        setPriority('baixa')
        setNotes('')
        setSaving(false)
        setDentistId('')
        fetchDentists()
    }, [isOpen])

    const fetchDentists = async () => {
        setLoadingDentists(true)
        try {
            const result = await enterpriseApiGetEmployees()
            const list = result?.data ?? result ?? []
            setDentists(Array.isArray(list) ? list : [])
        } finally {
            setLoadingDentists(false)
        }
    }

    useEffect(() => {
        const meta = PRIORITY_DEFAULTS[type]
        if (meta) {
            setDate(addDays(meta.days))
            setPriority(meta.priority)
        }
    }, [type])

    if (!isOpen) return null

    const selectedDentist = dentists.find(d => d.publicId === dentistId)

    const handleConfirm = async () => {
        setSaving(true)
        try {
            await patientReturnCreate({
                patientId:       patientId,
                patientName:     patientName,
                patientPhone:    patientPhone || null,
                professionalId:  dentistId || null,
                professionalName: dentist || selectedDentist?.fullName || null,
                type:            RETURN_TYPES.find(t => t.value === type)?.int ?? 7,
                priority:        PRIORITY_INT[priority] ?? 1,
                returnDate:      new Date(date + 'T12:00:00').toISOString(),
                lastProcedure:   lastProcedure || null,
                notes:           notes || null,
            })
            toast.push(
                <Notification type='success' title='Retorno registrado'>
                    {patientName} · {RETURN_TYPES.find(t => t.value === type)?.label} · {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </Notification>,
                { placement: 'top-center' }
            )
            onClose()
        } catch {
            toast.push(
                <Notification type='danger' title='Erro ao registrar'>
                    Não foi possível registrar o retorno. Verifique os dados e tente novamente.
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setSaving(false)
        }
    }

    const inp = 'w-full py-2.5 px-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all'

    return (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden'>

                {/* Header */}
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className='w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0'>
                        <HiOutlineRefresh className='w-5 h-5 text-violet-600 dark:text-violet-400' />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100'>Registrar Retorno</h3>
                        <p className='text-xs text-gray-400 mt-0.5 truncate'>{patientName}</p>
                    </div>
                    <button
                        onClick={() => !saving && onClose()}
                        className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition flex-shrink-0'
                    >
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>

                <div className='px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto'>

                    {/* Último procedimento (readonly) */}
                    {lastProcedure && (
                        <div className='px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50'>
                            <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide'>Procedimento realizado</p>
                            <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5'>{lastProcedure}</p>
                        </div>
                    )}

                    {/* Tipo */}
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                            Motivo do Retorno
                        </label>
                        <div className='grid grid-cols-2 gap-2'>
                            {RETURN_TYPES.map(t => (
                                <button
                                    key={t.value}
                                    type='button'
                                    onClick={() => setType(t.value)}
                                    className={[
                                        'text-left px-3 py-2 rounded-xl border text-xs font-medium transition-all',
                                        type === t.value
                                            ? 'border-violet-400 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:border-violet-600 dark:text-violet-300'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600',
                                    ].join(' ')}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dentista responsável */}
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                            Profissional Responsável
                        </label>
                        {dentist ? (
                            <div className={`${inp} text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 cursor-not-allowed`}>
                                {dentist}
                            </div>
                        ) : (
                            <select
                                value={dentistId}
                                onChange={e => setDentistId(e.target.value)}
                                disabled={loadingDentists}
                                className={`${inp} ${loadingDentists ? 'opacity-60' : ''}`}
                            >
                                <option value=''>
                                    {loadingDentists ? 'Carregando…' : 'Selecionar profissional (opcional)'}
                                </option>
                                {dentists.map(d => (
                                    <option key={d.publicId} value={d.publicId}>
                                        {d.fullName}{d.jobTitle ? ` — ${d.jobTitle}` : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Data + prioridade */}
                    <div className='grid grid-cols-2 gap-3'>
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                                Data Prevista
                            </label>
                            <input
                                type='date'
                                value={date}
                                min={today}
                                onChange={e => setDate(e.target.value)}
                                className={inp}
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                                Prioridade
                            </label>
                            <select value={priority} onChange={e => setPriority(e.target.value)} className={inp}>
                                <option value='alta'>Alta</option>
                                <option value='media'>Média</option>
                                <option value='baixa'>Baixa</option>
                            </select>
                        </div>
                    </div>

                    {/* Observação */}
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                            Observação
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder='Instruções para o retorno, cuidados especiais…'
                            rows={2}
                            className={`${inp} resize-none`}
                        />
                    </div>

                    {/* Aviso lembrete */}
                    <div className='flex items-center gap-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40'>
                        <HiOutlineBell className='w-4 h-4 text-violet-500 flex-shrink-0' />
                        <p className='text-xs text-violet-700 dark:text-violet-300'>
                            O paciente receberá um lembrete automático 2 dias antes.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button
                        onClick={() => !saving && onClose()}
                        disabled={saving}
                        className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition'
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={saving || !patientId}
                        title={!patientId ? 'Paciente não identificado' : undefined}
                        className='flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white transition shadow-sm'
                    >
                        {saving
                            ? <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' /> Salvando…</>
                            : <><HiOutlineCheck className='w-4 h-4' /> Registrar Retorno</>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReturnRegisterModal
