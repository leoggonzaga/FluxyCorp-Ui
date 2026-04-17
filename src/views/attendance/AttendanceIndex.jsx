import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import classNames from 'classnames'
import { Notification, toast, Button, Dialog } from '@/components/ui'
import Odontogram from './components/Odontogram'
import {
    HiOutlineCheck,
    HiOutlineCheckCircle,
    HiOutlineChevronLeft,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineDocumentText,
    HiOutlineLightningBolt,
    HiOutlineMinus,
    HiOutlinePause,
    HiOutlinePlay,
    HiOutlinePlus,
    HiOutlineRefresh,
    HiOutlinePhotograph,
    HiOutlineSearch,
    HiOutlineTrash,
    HiOutlineX,
} from 'react-icons/hi'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PATIENTS = [
    { id: 1, name: 'João Silva',     birthDate: '1985-03-15', insurance: 'Unimed',          bloodType: 'A+',  allergies: ['Penicilina'] },
    { id: 2, name: 'Maria Santos',   birthDate: '1992-07-22', insurance: 'Bradesco Saúde',  bloodType: 'O-',  allergies: [] },
    { id: 3, name: 'Pedro Oliveira', birthDate: '1978-11-08', insurance: 'SulAmérica',      bloodType: 'B+',  allergies: ['Dipirona'] },
    { id: 4, name: 'Ana Costa',      birthDate: '1995-01-12', insurance: 'SulAmérica',      bloodType: 'AB-', allergies: [] },
    { id: 5, name: 'Carlos Mendes',  birthDate: '1980-09-30', insurance: 'Unimed',          bloodType: 'O+',  allergies: ['Penicilina'] },
    { id: 6, name: 'Fernanda Lima',  birthDate: '1988-05-18', insurance: 'Bradesco Saúde',  bloodType: 'A-',  allergies: ['Ibuprofeno'] },
]

const PROCEDURE_CATALOG = [
    { category: 'Consulta', items: [
        { id: 'c1', name: 'Consulta Clínica',       code: 'C001', value: 150.00 },
        { id: 'c2', name: 'Consulta de Retorno',    code: 'C002', value:  80.00 },
        { id: 'c3', name: 'Avaliação Inicial',      code: 'C003', value: 100.00 },
    ]},
    { category: 'Prevenção', items: [
        { id: 'p1', name: 'Profilaxia Dental',      code: 'P001', value: 120.00 },
        { id: 'p2', name: 'Aplicação de Flúor',     code: 'P002', value:  50.00 },
        { id: 'p3', name: 'Selante Dental',         code: 'P003', value:  80.00 },
    ]},
    { category: 'Restauração', items: [
        { id: 'r1', name: 'Restauração Resina (1 face)',   code: 'R001', value: 200.00 },
        { id: 'r2', name: 'Restauração Resina (2 faces)',  code: 'R002', value: 280.00 },
        { id: 'r3', name: 'Restauração Amálgama',          code: 'R003', value: 180.00 },
        { id: 'r4', name: 'Incrustação (Inlay/Onlay)',     code: 'R004', value: 850.00 },
    ]},
    { category: 'Cirurgia', items: [
        { id: 'e1', name: 'Extração Simples',       code: 'E001', value: 250.00 },
        { id: 'e2', name: 'Extração de Siso',       code: 'E002', value: 450.00 },
        { id: 'e3', name: 'Biópsia Tecido Mole',    code: 'E003', value: 350.00 },
    ]},
    { category: 'Endodontia', items: [
        { id: 'ca1', name: 'Canal Radicular (1 canal)',    code: 'CA001', value:  600.00 },
        { id: 'ca2', name: 'Canal Radicular (2 canais)',   code: 'CA002', value:  800.00 },
        { id: 'ca3', name: 'Canal Radicular (3+ canais)',  code: 'CA003', value:  950.00 },
        { id: 'ca4', name: 'Retratamento de Canal',        code: 'CA004', value: 1100.00 },
    ]},
    { category: 'Radiologia', items: [
        { id: 'x1', name: 'Raio-X Periapical',      code: 'X001', value:  60.00 },
        { id: 'x2', name: 'Raio-X Panorâmico',      code: 'X002', value: 150.00 },
        { id: 'x3', name: 'Raio-X Interproximal',   code: 'X003', value:  45.00 },
    ]},
    { category: 'Anestesia', items: [
        { id: 'an1', name: 'Anestesia Local (tubete)', code: 'AN001', value: 30.00 },
        { id: 'an2', name: 'Bloqueio Regional',        code: 'AN002', value: 80.00 },
    ]},
    { category: 'Implante', items: [
        { id: 'im1', name: 'Implante Dentário',        code: 'IM001', value: 2500.00 },
        { id: 'im2', name: 'Prótese sobre Implante',   code: 'IM002', value: 1800.00 },
        { id: 'im3', name: 'Pilar de Cicatrização',    code: 'IM003', value:  400.00 },
    ]},
    { category: 'Ortodontia', items: [
        { id: 'or1', name: 'Instalação de Aparelho',  code: 'OR001', value: 1200.00 },
        { id: 'or2', name: 'Manutenção de Aparelho',  code: 'OR002', value:  150.00 },
        { id: 'or3', name: 'Contenção Fixa',          code: 'OR003', value:  300.00 },
    ]},
    { category: 'Estética', items: [
        { id: 'cl1', name: 'Clareamento Dental',    code: 'CL001', value:  800.00 },
        { id: 'cl2', name: 'Faceta de Porcelana',   code: 'CL002', value: 1500.00 },
    ]},
    { category: 'Outros', items: [
        { id: 'cu1', name: 'Curativo Simples', code: 'CU001', value:  40.00 },
        { id: 'cu2', name: 'Sutura',           code: 'CU002', value: 120.00 },
        { id: 'pr1', name: 'Placa de Bruxismo',code: 'PR001', value: 650.00 },
    ]},
]

const QUICK_PHRASES = [
    'Queixa principal: ',
    'Procedimento realizado sem intercorrências. ',
    'Anestesia local aplicada sem reações adversas. ',
    'Paciente em bom estado geral, colaborativo. ',
    'Orientações pós-operatórias fornecidas ao paciente. ',
    'Retorno agendado para 7 dias. ',
    'Retorno agendado para 30 dias. ',
    'Encaminhamento solicitado para especialista. ',
    'Medicação prescrita conforme receituário. ',
    'Exames solicitados para diagnóstico complementar. ',
]

const PATIENT_HISTORY = {
    1: [
        { id: 1, date: '2026-04-01', service: 'Consulta Geral',   professional: 'Dr. Carlos', notes: 'Paciente relatou dores nas costas. Eletrocardiograma solicitado.', proceduresCount: 3 },
        { id: 2, date: '2026-03-15', service: 'Limpeza Dental',   professional: 'Dra. Ana',   notes: 'Procedimento sem intercorrências. Flúor aplicado.', proceduresCount: 3 },
        { id: 3, date: '2026-02-10', service: 'Avaliação Inicial', professional: 'Dr. Bruno', notes: 'Exame de sangue solicitado para acompanhamento.', proceduresCount: 1 },
    ],
    2: [
        { id: 1, date: '2026-03-20', service: 'Consulta',         professional: 'Dr. Carlos', notes: 'Sem queixas relevantes. Paciente em bom estado geral.', proceduresCount: 1 },
    ],
    3: [
        { id: 1, date: '2026-04-05', service: 'Avaliação',        professional: 'Dr. Bruno',  notes: 'Tratamento iniciado. Curativo realizado.', proceduresCount: 2 },
    ],
    5: [
        { id: 1, date: '2026-02-20', service: 'Cirurgia',         professional: 'Dr. Bruno',  notes: 'Extração de dente do siso. Pós-operatório tranquilo.', proceduresCount: 1 },
    ],
    6: [
        { id: 1, date: '2026-03-01', service: 'Consulta Geral',   professional: 'Dr. Carlos', notes: 'Paciente com dores de dente. Canal indicado para dente 14.', proceduresCount: 1 },
    ],
}

const PATIENT_MEDIA = {
    1: {
        images: [
            { id: 'i1', name: 'Raio-X Panorâmico',    url: '/img/thumbs/layouts/modern.jpg',     createdAt: '2026-03-15' },
            { id: 'i2', name: 'Foto Intraoral',        url: '/img/thumbs/layouts/classic.jpg',    createdAt: '2026-04-01' },
            { id: 'i3', name: 'Foto Frontal',          url: '/img/thumbs/layouts/simple.jpg',     createdAt: '2026-04-01' },
            { id: 'i4', name: 'Raio-X Periapical',     url: '/img/thumbs/layouts/decked.jpg',     createdAt: '2026-02-10' },
        ],
        documents: [
            { id: 'd1', name: 'Anamnese Inicial.pdf',       createdAt: '2026-01-10' },
            { id: 'd2', name: 'Exame de Sangue.pdf',         createdAt: '2026-02-10' },
            { id: 'd3', name: 'Receita Amoxicilina.pdf',     createdAt: '2026-04-01' },
            { id: 'd4', name: 'Contrato de Tratamento.pdf',  createdAt: '2026-01-10' },
        ],
    },
    2: {
        images: [{ id: 'i1', name: 'Foto Clínica', url: '/img/thumbs/layouts/simple.jpg', createdAt: '2026-03-20' }],
        documents: [{ id: 'd1', name: 'Comprovante Atendimento.pdf', createdAt: '2026-03-20' }],
    },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}

const formatTimer = (s) =>
    [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
        .map((v) => String(v).padStart(2, '0'))
        .join(':')

const fmt = (v) => `R$ ${v.toFixed(2).replace('.', ',')}`

const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

// ─── Main Component ───────────────────────────────────────────────────────────

const AttendanceIndex = () => {
    const navigate               = useNavigate()
    const [searchParams]         = useSearchParams()
    const patientId              = Number(searchParams.get('patientId'))
    const patient                = MOCK_PATIENTS.find((p) => p.id === patientId) ?? MOCK_PATIENTS[0]

    const [elapsed, setElapsed]               = useState(0)
    const [timerPaused, setTimerPaused]       = useState(false)
    const [evolutionText, setEvolutionText]   = useState('')
    const [searchQuery, setSearchQuery]       = useState('')
    const [addedProcedures, setAddedProcedures] = useState([])
    const [proceduresByTooth, setProceduresByTooth] = useState({})
    const [selectedTeeth, setSelectedTeeth] = useState([])
    const [currentTooth, setCurrentTooth] = useState(null)
    const [selectedToothProcedureId, setSelectedToothProcedureId] = useState(null)
    const [toothModalOpen, setToothModalOpen] = useState(false)
    const [saveStatus, setSaveStatus]         = useState('saved')
    const [showFinish, setShowFinish]         = useState(false)
    const [finished, setFinished]             = useState(false)
    const [rightTab, setRightTab]             = useState('procedures')

    const saveTimeoutRef = useRef(null)
    const textareaRef    = useRef(null)

    // Timer
    useEffect(() => {
        if (timerPaused || finished) return
        const id = setInterval(() => setElapsed((e) => e + 1), 1000)
        return () => clearInterval(id)
    }, [timerPaused, finished])

    useEffect(() => () => clearTimeout(saveTimeoutRef.current), [])

    const triggerSave = useCallback(() => {
        setSaveStatus('saving')
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(() => setSaveStatus('saved'), 1200)
    }, [])

    // Catalog filter
    const filteredCatalog = useMemo(() => {
        const q = searchQuery.toLowerCase().trim()
        if (!q) return PROCEDURE_CATALOG
        return PROCEDURE_CATALOG.map((cat) => ({
            ...cat,
            items: cat.items.filter(
                (item) =>
                    item.name.toLowerCase().includes(q) ||
                    item.code.toLowerCase().includes(q),
            ),
        })).filter((cat) => cat.items.length > 0)
    }, [searchQuery])

    const addedIds = useMemo(() => new Set(addedProcedures.map((p) => p.id)), [addedProcedures])
    const total    = useMemo(() => addedProcedures.reduce((s, p) => s + p.value * p.qty, 0), [addedProcedures])

    // Handlers
    const handleAddProcedure = (proc) => {
        setAddedProcedures((prev) => {
            const existing = prev.find((p) => p.id === proc.id)
            return existing
                ? prev.map((p) => (p.id === proc.id ? { ...p, qty: p.qty + 1 } : p))
                : [...prev, { ...proc, qty: 1 }]
        })
        triggerSave()
    }

    const handleToggleTooth = (tooth) => {
        setCurrentTooth(tooth)
        setToothModalOpen(true)
        setSelectedTeeth((prev) =>
            prev.includes(tooth) ? prev : [...prev, tooth]
        )
    }

    const handleAssignToothProcedure = () => {
        if (!currentTooth || !selectedToothProcedureId) return
        const procedure = PROCEDURE_CATALOG.flatMap((cat) => cat.items).find((item) => item.id === selectedToothProcedureId)
        if (!procedure) return

        setProceduresByTooth((prev) => ({
            ...prev,
            [currentTooth]: [
                ...(prev[currentTooth] || []),
                { id: procedure.id, name: procedure.name },
            ],
        }))

        handleAddProcedure(procedure)
        setToothModalOpen(false)
        setSelectedToothProcedureId(null)
    }

    const handleRemoveProcedure = (id) => {
        setAddedProcedures((prev) => prev.filter((p) => p.id !== id))
        triggerSave()
    }

    const handleQty = (id, delta) => {
        setAddedProcedures((prev) =>
            prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p)),
        )
        triggerSave()
    }

    const appendPhrase = (phrase) => {
        const ta = textareaRef.current
        if (!ta) return
        const start = ta.selectionStart
        const end   = ta.selectionEnd
        setEvolutionText((prev) => prev.slice(0, start) + phrase + prev.slice(end))
        triggerSave()
        setTimeout(() => {
            ta.focus()
            ta.setSelectionRange(start + phrase.length, start + phrase.length)
        }, 0)
    }

    const handleEvolutionChange = (e) => {
        setEvolutionText(e.target.value)
        triggerSave()
    }

    const handleFinishConfirm = () => {
        setTimerPaused(true)
        setFinished(true)
        setShowFinish(false)
        toast.push(
            <Notification type='success' title='Atendimento Finalizado'>
                Registrado com sucesso · Duração: {formatTimer(elapsed)}
            </Notification>,
        )
    }

    const age = calcAge(patient.birthDate)

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900/50 flex flex-col'>

            {/* ── Header fixo ── */}
            <div className='sticky top-0 z-40 shadow-lg shadow-black/40' style={{ background: 'linear-gradient(160deg, #0f0b2e 0%, #0a0820 55%, #07050f 100%)' }}>

                <div className='px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3'>

                    {/* Voltar + paciente */}
                    <div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
                        <button
                            onClick={() => navigate(`/patients?id=${patient.id}`)}
                            className='w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition flex-shrink-0'
                            title='Voltar ao prontuário'
                        >
                            <HiOutlineChevronLeft className='w-4 h-4 sm:w-5 sm:h-5' />
                        </button>

                        <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white text-base sm:text-lg flex-shrink-0 border border-white/30'>
                            {patient.name.charAt(0)}
                        </div>

                        <div className='min-w-0'>
                            <p className='font-bold text-white text-xs sm:text-sm leading-tight truncate'>{patient.name}</p>
                            <p className='hidden sm:block text-indigo-200 text-xs mt-0.5'>{age} anos · {patient.insurance}</p>
                        </div>

                        {patient.allergies.length > 0 && (
                            <span className='hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/25 text-rose-100 border border-rose-300/30 flex-shrink-0'>
                                ⚠ {patient.allergies.join(', ')}
                            </span>
                        )}
                    </div>

                    {/* Timer */}
                    <div className='flex items-center gap-1 sm:gap-2 flex-shrink-0'>
                        <div className='flex items-center gap-1.5 sm:gap-2.5 bg-black/15 border border-white/20 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2'>
                            <div className={classNames(
                                'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0',
                                finished    ? 'bg-white/40' :
                                timerPaused ? 'bg-amber-300' :
                                              'bg-emerald-300 animate-pulse',
                            )} />
                            <span className='font-mono font-bold text-white text-sm sm:text-lg tracking-widest leading-none tabular-nums'>
                                {formatTimer(elapsed)}
                            </span>
                        </div>

                        {!finished && (
                            <button
                                onClick={() => setTimerPaused((v) => !v)}
                                title={timerPaused ? 'Retomar' : 'Pausar'}
                                className='hidden sm:flex w-9 h-9 rounded-xl items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition'
                            >
                                {timerPaused
                                    ? <HiOutlinePlay  className='w-4 h-4' />
                                    : <HiOutlinePause className='w-4 h-4' />}
                            </button>
                        )}
                    </div>

                    {/* Save + Finalizar */}
                    <div className='flex items-center gap-1.5 sm:gap-3 flex-shrink-0'>
                        <div className={classNames(
                            'hidden md:flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-all',
                            saveStatus === 'saving' ? 'text-amber-200' : 'text-emerald-200',
                        )}>
                            {saveStatus === 'saving'
                                ? <><HiOutlineRefresh className='w-3.5 h-3.5 animate-spin' /> Salvando...</>
                                : <><HiOutlineCheck   className='w-3.5 h-3.5' /> Salvo</>}
                        </div>

                        {!finished ? (
                            <button
                                onClick={() => setShowFinish(true)}
                                className='flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 active:scale-95 text-white font-bold text-xs sm:text-sm transition backdrop-blur-sm'
                            >
                                <HiOutlineCheckCircle className='w-4 h-4 flex-shrink-0' />
                                <span className='hidden sm:inline'>Finalizar</span>
                            </button>
                        ) : (
                            <span className='inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-400/20 text-emerald-100 text-xs sm:text-sm font-bold border border-emerald-300/30'>
                                <HiOutlineCheck className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
                                <span className='hidden sm:inline'>Concluído</span>
                            </span>
                        )}
                    </div>
                </div>

                <div className='h-px bg-white/10' />
            </div>

            {/* ── Corpo ── */}
            <div className='flex-1 p-4 grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4 items-start max-w-[1600px] mx-auto w-full'>

                {/* ── Coluna esquerda: Evolução ── */}
                <div className='flex flex-col gap-4'>

                    {/* Editor de evolução */}
                    <div className='section-card border-blue-200 dark:border-blue-900/60 flex flex-col'>
                        <div className='section-card-header-between bg-white dark:bg-gray-800/20'>
                            <div className='flex items-center gap-3'>
                                <span className='w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0'>
                                    <HiOutlineDocumentText />
                                </span>
                                <div>
                                    <p className='section-card-title'>Evolução Clínica</p>
                                    <p className='section-card-subtitle text-blue-600/60 dark:text-blue-400/50'>
                                        Registro em tempo real do atendimento
                                    </p>
                                </div>
                            </div>
                            <span className='text-[11px] text-gray-400 tabular-nums'>
                                {evolutionText.length} caracteres
                            </span>
                        </div>
                        <div className='h-[2px] bg-gradient-to-r from-blue-400 via-blue-300/50 to-transparent' />
                        <div className='p-5'>
                            <textarea
                                ref={textareaRef}
                                value={evolutionText}
                                onChange={handleEvolutionChange}
                                disabled={finished}
                                placeholder={
                                    'Descreva a evolução do atendimento...\n\n' +
                                    'Ex: Paciente compareceu relatando dor na região inferior esquerda. ' +
                                    'Ao exame clínico observou-se...'
                                }
                                className='w-full min-h-[320px] resize-none bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed'
                            />
                        </div>
                    </div>

                    {/* Frases rápidas */}
                    <div className='section-card border-violet-200 dark:border-violet-900/60'>
                        <div className='section-card-header bg-white dark:bg-gray-800/20'>
                            <span className='w-5 h-5 text-violet-500 dark:text-violet-400 flex-shrink-0'>
                                <HiOutlineLightningBolt />
                            </span>
                            <p className='section-card-title'>Frases Rápidas</p>
                        </div>
                        <div className='h-[2px] bg-gradient-to-r from-violet-400 via-violet-300/50 to-transparent' />
                        <div className='p-5'>
                            <div className='flex flex-wrap gap-2'>
                                {QUICK_PHRASES.map((phrase) => (
                                    <button
                                        key={phrase}
                                        onClick={() => appendPhrase(phrase)}
                                        disabled={finished}
                                        className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700/50 hover:bg-violet-100 dark:hover:bg-violet-900/40 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed'
                                    >
                                        <HiOutlinePlus className='w-3 h-3 flex-shrink-0' />
                                        {phrase.replace(': ', '').replace('. ', '').trim()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Coluna direita: Procedimentos ── */}
                <div className='flex flex-col gap-4'>

                    {/* Painel com abas */}
                    <div className='section-card border-teal-200 dark:border-teal-900/60'>

                        {/* Barra de abas */}
                        <div className='bg-white dark:bg-gray-800/20'>
                            <div className='flex border-b border-gray-100 dark:border-gray-700/60'>
                                {[
                                    { id: 'procedures', label: 'Procedimentos', icon: <HiOutlineSearch className='w-3.5 h-3.5' /> },
                                    { id: 'history',    label: 'Histórico',     icon: <HiOutlineClock className='w-3.5 h-3.5' /> },
                                    { id: 'media',      label: 'Mídia',         icon: <HiOutlinePhotograph className='w-3.5 h-3.5' /> },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setRightTab(tab.id)}
                                        className={classNames(
                                            'flex-1 flex items-center justify-center gap-1.5 py-3 px-2 text-xs font-semibold border-b-2 -mb-px transition',
                                            rightTab === tab.id
                                                ? 'text-teal-600 dark:text-teal-400 border-teal-500'
                                                : 'text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300',
                                        )}
                                    >
                                        {tab.icon}
                                        <span className='hidden sm:inline'>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className='h-[2px] bg-gradient-to-r from-teal-400 via-teal-300/50 to-transparent' />

                        <div className='p-4'>

                            {/* ── Aba Procedimentos ── */}
                            {rightTab === 'procedures' && (
                                <div className='flex flex-col gap-3'>
                                    <div className='relative'>
                                        <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                                        <input
                                            type='text'
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder='Nome ou código do procedimento...'
                                            className='w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition'
                                        />
                                        {searchQuery && (
                                            <button onClick={() => setSearchQuery('')} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition'>
                                                <HiOutlineX className='w-4 h-4' />
                                            </button>
                                        )}
                                    </div>
                                    <div className='max-h-80 overflow-y-auto space-y-3 pr-0.5'>
                                        {filteredCatalog.length === 0 ? (
                                            <p className='text-sm text-gray-400 text-center py-6'>Nenhum procedimento encontrado.</p>
                                        ) : filteredCatalog.map((cat) => (
                                            <div key={cat.category}>
                                                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-1.5'>{cat.category}</p>
                                                <div className='space-y-1'>
                                                    {cat.items.map((proc) => {
                                                        const isAdded = addedIds.has(proc.id)
                                                        return (
                                                            <div key={proc.id} className={classNames(
                                                                'flex items-center gap-3 px-3 py-2.5 rounded-xl border transition',
                                                                isAdded
                                                                    ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700/50'
                                                                    : 'bg-white dark:bg-gray-800/30 border-gray-100 dark:border-gray-700/50 hover:border-teal-200 dark:hover:border-teal-700/40 hover:bg-teal-50/50 dark:hover:bg-teal-900/10',
                                                            )}>
                                                                <div className='flex-1 min-w-0'>
                                                                    <p className='text-sm font-medium text-gray-800 dark:text-gray-200 truncate'>{proc.name}</p>
                                                                    <p className='text-[10px] text-gray-400 mt-0.5'>{proc.code} · {fmt(proc.value)}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleAddProcedure(proc)}
                                                                    disabled={finished}
                                                                    className={classNames(
                                                                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed',
                                                                        isAdded
                                                                            ? 'bg-teal-500 text-white hover:bg-teal-400'
                                                                            : 'bg-gray-100 dark:bg-gray-700/60 text-gray-500 hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:text-teal-700',
                                                                    )}
                                                                >
                                                                    <HiOutlinePlus className='w-4 h-4' />
                                                                </button>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Aba Histórico ── */}
                            {rightTab === 'history' && (() => {
                                const history = (PATIENT_HISTORY[patient.id] || []).slice(0, 3)
                                return history.length === 0 ? (
                                    <p className='text-sm text-gray-400 text-center py-8'>Sem histórico de atendimentos.</p>
                                ) : (
                                    <div className='space-y-3'>
                                        {history.map((apt, idx) => (
                                            <div key={apt.id} className='relative pl-4'>
                                                {/* Linha do timeline */}
                                                {idx < history.length - 1 && (
                                                    <div className='absolute left-[7px] top-6 bottom-0 w-px bg-gray-200 dark:bg-gray-700' />
                                                )}
                                                <div className='absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-teal-400 bg-white dark:bg-gray-900' />

                                                <div className='bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 rounded-xl p-3 ml-2'>
                                                    <div className='flex items-start justify-between gap-2 mb-1'>
                                                        <p className='text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight'>{apt.service}</p>
                                                        <span className='text-[10px] text-gray-400 flex-shrink-0 tabular-nums'>{formatDate(apt.date)}</span>
                                                    </div>
                                                    <p className='text-[11px] text-teal-600 dark:text-teal-400 font-medium mb-1.5'>
                                                        {apt.professional} · {apt.proceduresCount} procedimento(s)
                                                    </p>
                                                    <p className='text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 italic'>
                                                        "{apt.notes}"
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })()}

                            {/* ── Aba Mídia ── */}
                            {rightTab === 'media' && (() => {
                                const media = PATIENT_MEDIA[patient.id]
                                if (!media) return (
                                    <p className='text-sm text-gray-400 text-center py-8'>Sem arquivos cadastrados.</p>
                                )
                                return (
                                    <div className='space-y-4 max-h-80 overflow-y-auto pr-0.5'>
                                        {/* Imagens */}
                                        {media.images.length > 0 && (
                                            <div>
                                                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
                                                    Imagens ({media.images.length})
                                                </p>
                                                <div className='grid grid-cols-3 gap-2'>
                                                    {media.images.map((img) => (
                                                        <div key={img.id} title={img.name} className='group relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50 aspect-square bg-gray-100 dark:bg-gray-800 cursor-pointer'>
                                                            <img src={img.url} alt={img.name} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200' />
                                                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition' />
                                                            <p className='absolute bottom-0 inset-x-0 text-[9px] text-white font-medium px-1.5 py-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition truncate'>
                                                                {img.name}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Documentos */}
                                        {media.documents.length > 0 && (
                                            <div>
                                                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
                                                    Documentos ({media.documents.length})
                                                </p>
                                                <div className='space-y-1.5'>
                                                    {media.documents.map((doc) => (
                                                        <div key={doc.id} className='flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/40 hover:border-indigo-200 dark:hover:border-indigo-700/40 transition cursor-pointer'>
                                                            <HiOutlineDocumentText className='w-4 h-4 text-indigo-400 flex-shrink-0' />
                                                            <div className='flex-1 min-w-0'>
                                                                <p className='text-xs font-medium text-gray-800 dark:text-gray-200 truncate'>{doc.name}</p>
                                                                <p className='text-[10px] text-gray-400'>{formatDate(doc.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}

                        </div>
                    </div>

                    {/* Procedimentos incluídos */}
                    <div className='section-card border-indigo-200 dark:border-indigo-900/60'>
                        <div className='section-card-header-between bg-white dark:bg-gray-800/20'>
                            <div className='flex items-center gap-3'>
                                <span className='w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0'>
                                    <HiOutlinePhotograph />
                                </span>
                                <p className='section-card-title'>Odontograma</p>
                            </div>
                        </div>
                        <div className='h-[2px] bg-gradient-to-r from-indigo-400 via-indigo-300/50 to-transparent' />
                        <div className='p-4'>
                            <p className='mb-4 text-sm text-gray-500'>Clique no dente danificado para registrar o procedimento.</p>
                            <Odontogram
                                selectedTeeth={selectedTeeth}
                                onToggleTooth={handleToggleTooth}
                                proceduresByTooth={proceduresByTooth}
                            />
                        </div>
                    </div>

                    <div className='section-card border-emerald-200 dark:border-emerald-900/60'>
                        <div className='section-card-header-between bg-white dark:bg-gray-800/20'>
                            <div className='flex items-center gap-3'>
                                <span className='w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0'>
                                    <HiOutlineClipboardList />
                                </span>
                                <p className='section-card-title'>Incluídos no Atendimento</p>
                            </div>
                            {addedProcedures.length > 0 && (
                                <span className='flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold'>
                                    {addedProcedures.length}
                                </span>
                            )}
                        </div>
                        <div className='h-[2px] bg-gradient-to-r from-emerald-400 via-emerald-300/50 to-transparent' />

                        <div className='p-4'>
                            {addedProcedures.length === 0 ? (
                                <div className='text-center py-8'>
                                    <div className='w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3'>
                                        <HiOutlineClipboardList className='w-6 h-6 text-gray-300 dark:text-gray-600' />
                                    </div>
                                    <p className='text-sm text-gray-400'>Nenhum procedimento incluído ainda.</p>
                                    <p className='text-xs text-gray-400 mt-1'>Use o catálogo acima para adicionar.</p>
                                </div>
                            ) : (
                                <>
                                    <div className='space-y-2 mb-4'>
                                        {addedProcedures.map((proc) => (
                                            <div
                                                key={proc.id}
                                                className='flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-gray-800/40 border border-emerald-100 dark:border-emerald-800/30 shadow-sm'
                                            >
                                                <div className='flex-1 min-w-0'>
                                                    <p className='text-sm font-semibold text-gray-800 dark:text-gray-200 truncate'>
                                                        {proc.name}
                                                    </p>
                                                    <p className='text-[11px] text-gray-500 mt-0.5'>
                                                        {fmt(proc.value)} × {proc.qty}
                                                        {' · '}
                                                        <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                                                            {fmt(proc.value * proc.qty)}
                                                        </span>
                                                    </p>
                                                </div>

                                                {/* Controle de quantidade */}
                                                <div className='flex items-center gap-1 flex-shrink-0'>
                                                    <button
                                                        onClick={() => handleQty(proc.id, -1)}
                                                        disabled={finished}
                                                        className='w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700/60 text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed'
                                                    >
                                                        <HiOutlineMinus className='w-3.5 h-3.5' />
                                                    </button>
                                                    <span className='w-7 text-center text-sm font-bold text-gray-800 dark:text-gray-200 tabular-nums'>
                                                        {proc.qty}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQty(proc.id, 1)}
                                                        disabled={finished}
                                                        className='w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700/60 text-gray-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 transition active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed'
                                                    >
                                                        <HiOutlinePlus className='w-3.5 h-3.5' />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleRemoveProcedure(proc.id)}
                                                    disabled={finished}
                                                    className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition active:scale-90 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed'
                                                >
                                                    <HiOutlineTrash className='w-3.5 h-3.5' />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div className='flex items-center justify-between px-3 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/40'>
                                        <p className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                                            Total do Atendimento
                                        </p>
                                        <p className='text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums'>
                                            {fmt(total)}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                isOpen={toothModalOpen}
                onRequestClose={() => setToothModalOpen(false)}
                onClose={() => setToothModalOpen(false)}
                width={500}
                title={currentTooth ? `Procedimento - Dente ${currentTooth}` : 'Procedimento por Dente'}
            >
                <div className='space-y-4'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Selecione o procedimento</label>
                        <select
                            value={selectedToothProcedureId || ''}
                            onChange={(event) => setSelectedToothProcedureId(event.target.value)}
                            className='w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/25'
                        >
                            <option value='' disabled>Selecione um procedimento</option>
                            {PROCEDURE_CATALOG.flatMap((category) => category.items).map((proc) => (
                                <option key={proc.id} value={proc.id}>{proc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className='flex justify-end gap-2'>
                        <Button variant='plain' onClick={() => setToothModalOpen(false)}>Cancelar</Button>
                        <Button
                            variant='solid'
                            onClick={handleAssignToothProcedure}
                            disabled={!selectedToothProcedureId}
                        >
                            Adicionar ao dente
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* ── Modal de Finalização ── */}
            {showFinish && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
                    <div
                        className='w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden'
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Topo do modal */}
                        <div className='bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <HiOutlineCheckCircle className='w-6 h-6 text-white' />
                                <p className='font-bold text-white'>Finalizar Atendimento</p>
                            </div>
                            <button
                                onClick={() => setShowFinish(false)}
                                className='text-white/60 hover:text-white transition'
                            >
                                <HiOutlineX className='w-5 h-5' />
                            </button>
                        </div>

                        <div className='p-6 space-y-4'>
                            {/* Grid de resumo */}
                            <div className='grid grid-cols-2 gap-3'>
                                {[
                                    { label: 'Paciente',      value: patient.name },
                                    { label: 'Duração',       value: formatTimer(elapsed) },
                                    { label: 'Data',          value: new Date().toLocaleDateString('pt-BR') },
                                    { label: 'Procedimentos', value: `${addedProcedures.length} item(s)` },
                                ].map(({ label, value }) => (
                                    <div key={label} className='bg-gray-50 dark:bg-gray-700/40 rounded-xl px-4 py-3'>
                                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>{label}</p>
                                        <p className='text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5'>{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Tabela de procedimentos */}
                            {addedProcedures.length > 0 && (
                                <div className='rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden'>
                                    <div className='bg-gray-50 dark:bg-gray-700/40 px-4 py-2'>
                                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Procedimentos realizados</p>
                                    </div>
                                    <div className='max-h-44 overflow-y-auto'>
                                        {addedProcedures.map((proc, i) => (
                                            <div
                                                key={proc.id}
                                                className={classNames(
                                                    'flex items-center justify-between px-4 py-2.5 text-sm',
                                                    i % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-gray-50 dark:bg-gray-800/20',
                                                )}
                                            >
                                                <span className='text-gray-700 dark:text-gray-300'>
                                                    {proc.name}
                                                    <span className='text-gray-400 ml-1'>×{proc.qty}</span>
                                                </span>
                                                <span className='font-bold text-gray-800 dark:text-gray-200 tabular-nums'>
                                                    {fmt(proc.value * proc.qty)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='flex items-center justify-between px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-t border-gray-200 dark:border-gray-700'>
                                        <span className='text-sm font-bold text-gray-500'>Total</span>
                                        <span className='text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums'>{fmt(total)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Preview da evolução */}
                            <div className='bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 border border-blue-100 dark:border-blue-800/40'>
                                <p className='text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1'>
                                    Evolução clínica · {evolutionText.length} caracteres
                                </p>
                                <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed'>
                                    {evolutionText.trim() || <em className='text-gray-400'>Sem evolução registrada.</em>}
                                </p>
                            </div>

                            {/* Botões */}
                            <div className='flex gap-3 pt-1'>
                                <button
                                    onClick={() => setShowFinish(false)}
                                    className='flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition'
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleFinishConfirm}
                                    className='flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white font-bold text-sm transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2'
                                >
                                    <HiOutlineCheckCircle className='w-5 h-5' />
                                    Confirmar Finalização
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AttendanceIndex
