import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import classNames from 'classnames'
import { Notification, toast, Button, Dialog } from '@/components/ui'
import Odontogram from './components/Odontogram'
import ToothFaceSelector from './components/ToothFaceSelector'
import {
    HiOutlineCamera,
    HiOutlineCheck,
    HiOutlineCheckCircle,
    HiOutlineChevronLeft,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineDocumentText,
    HiOutlineExclamation,
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
import { getConsumerById } from '@/api/consumer/consumerService'
import {
    sessionCreate,
    sessionUpdate,
    sessionUpdateEvolution,
    sessionGetByPatient,
    sessionStart,
    sessionFinish,
    sessionCancel,
} from '@/api/consultation/consultationService'

// ─── Catalog ──────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calcAge = (birthDate) => {
    if (!birthDate) return '—'
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
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR')
}

const statusLabel = (s) => {
    const map = { Registered: 'Agendado', InProgress: 'Em andamento', Completed: 'Concluído', Cancelled: 'Cancelado' }
    return map[s] ?? s
}

// ─── Camera Modal ─────────────────────────────────────────────────────────────

const CameraModal = ({ open, onClose, onSave }) => {
    const videoRef    = useRef(null)
    const canvasRef   = useRef(null)
    const streamRef   = useRef(null)
    const [flash, setFlash]           = useState(false)
    const [captures, setCaptures]     = useState([])
    const [cameraError, setCameraError] = useState(null)
    const [mirrored, setMirrored]     = useState(true)

    const startCamera = useCallback(async () => {
        setCameraError(null)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play()
            }
        } catch {
            setCameraError('Não foi possível acessar a câmera. Verifique as permissões do navegador.')
        }
    }, [])

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
    }, [])

    const capture = useCallback(() => {
        const video  = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return
        canvas.width  = video.videoWidth  || 1280
        canvas.height = video.videoHeight || 720
        const ctx = canvas.getContext('2d')
        if (mirrored) {
            ctx.translate(canvas.width, 0)
            ctx.scale(-1, 1)
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
        const id = `cam_${Date.now()}`
        const newCapture = { id, dataUrl, name: `Foto ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` }
        setCaptures((prev) => [...prev, newCapture])
        setFlash(true)
        setTimeout(() => setFlash(false), 180)
    }, [mirrored])

    useEffect(() => {
        if (open) {
            setCaptures([])
            startCamera()
        } else {
            stopCamera()
        }
        return stopCamera
    }, [open, startCamera, stopCamera])

    useEffect(() => {
        if (!open) return
        const onKey = (e) => {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault()
                capture()
            }
            if (e.code === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, capture, onClose])

    const handleSave = () => {
        onSave(captures)
        onClose()
    }

    if (!open) return null

    return (
        <div className='fixed inset-0 z-[200] flex items-center justify-center' style={{ background: 'rgba(0,0,0,0.88)' }}>
            <div className={`pointer-events-none fixed inset-0 z-[201] bg-white transition-opacity duration-100 ${flash ? 'opacity-80' : 'opacity-0'}`} />

            <div className='relative w-full max-w-2xl mx-4 flex flex-col gap-3'>
                <button
                    onClick={onClose}
                    className='absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition'
                >
                    <HiOutlineX className='w-4 h-4' />
                </button>

                <div className='relative bg-black rounded-2xl overflow-hidden aspect-video border border-white/10 shadow-2xl'>
                    {cameraError ? (
                        <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/60'>
                            <HiOutlineCamera className='w-10 h-10' />
                            <p className='text-sm text-center px-8'>{cameraError}</p>
                        </div>
                    ) : (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className='w-full h-full object-cover'
                            style={{ transform: mirrored ? 'scaleX(-1)' : 'none' }}
                        />
                    )}

                    {['top-2 left-2', 'top-2 right-2 rotate-90', 'bottom-2 right-2 rotate-180', 'bottom-2 left-2 -rotate-90'].map((cls) => (
                        <div key={cls} className={`absolute ${cls} w-6 h-6 border-t-2 border-l-2 border-white/40 rounded-tl pointer-events-none`} />
                    ))}

                    <div className='absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-2.5 bg-gradient-to-t from-black/70 to-transparent'>
                        <button
                            onClick={() => setMirrored((v) => !v)}
                            title='Espelhar'
                            className='text-white/60 hover:text-white text-xs flex items-center gap-1 transition'
                        >
                            <HiOutlineRefresh className='w-3.5 h-3.5' />
                            <span>Espelhar</span>
                        </button>
                        <p className='text-white/40 text-[11px]'>
                            Pressione <kbd className='font-mono text-white/60 bg-white/10 px-1.5 py-0.5 rounded'>Espaço</kbd> para capturar
                        </p>
                    </div>
                </div>

                <canvas ref={canvasRef} className='hidden' />

                <div className='flex items-center gap-3'>
                    <button
                        onClick={capture}
                        disabled={!!cameraError}
                        title='Capturar (Espaço)'
                        className='w-14 h-14 rounded-full bg-white hover:bg-gray-100 active:scale-90 transition-all shadow-xl flex-shrink-0 flex items-center justify-center disabled:opacity-30'
                    >
                        <div className='w-10 h-10 rounded-full border-4 border-gray-300' />
                    </button>

                    <div className='flex-1 flex gap-2 overflow-x-auto pb-0.5' style={{ scrollbarWidth: 'none' }}>
                        {captures.length === 0 ? (
                            <p className='text-white/30 text-xs self-center'>Nenhuma foto capturada ainda</p>
                        ) : (
                            captures.map((cap, i) => (
                                <div key={cap.id} className='relative flex-shrink-0'>
                                    <img
                                        src={cap.dataUrl}
                                        alt={cap.name}
                                        className='w-14 h-14 object-cover rounded-xl border-2 border-white/20 shadow-md'
                                    />
                                    <span className='absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow'>
                                        {i + 1}
                                    </span>
                                    <button
                                        onClick={() => setCaptures((prev) => prev.filter((c) => c.id !== cap.id))}
                                        className='absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-rose-500 hover:bg-rose-400 text-white rounded-full flex items-center justify-center transition shadow'
                                    >
                                        <HiOutlineX className='w-2.5 h-2.5' />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={captures.length === 0}
                        className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white text-sm font-bold transition shadow-lg shadow-indigo-500/30 disabled:opacity-30 disabled:pointer-events-none flex-shrink-0'
                    >
                        <HiOutlineCheck className='w-4 h-4' />
                        Salvar {captures.length > 0 ? `(${captures.length})` : ''}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const AttendanceIndex = () => {
    const navigate               = useNavigate()
    const [searchParams]         = useSearchParams()
    const patientPublicId        = searchParams.get('patientPublicId')

    // Patient + session state
    const [patient, setPatient]           = useState(null)
    const [loadingPatient, setLoadingPatient] = useState(true)
    const [sessionId, setSessionId]       = useState(null)
    const [sessionStarted, setSessionStarted] = useState(false)

    // History
    const [history, setHistory]           = useState([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    // Editor state
    const [elapsed, setElapsed]               = useState(0)
    const [timerPaused, setTimerPaused]       = useState(false)
    const [evolutionText, setEvolutionText]   = useState('')
    const [searchQuery, setSearchQuery]       = useState('')
    const [addedProcedures, setAddedProcedures] = useState([])
    const [proceduresByTooth, setProceduresByTooth] = useState({})
    const [selectedTeeth, setSelectedTeeth] = useState([])
    const [currentTooth, setCurrentTooth] = useState(null)
    const [selectedToothProcedureId, setSelectedToothProcedureId] = useState(null)
    const [selectedToothFaces, setSelectedToothFaces] = useState([])
    const [toothModalOpen, setToothModalOpen] = useState(false)
    const [saveStatus, setSaveStatus]         = useState('saved')
    const [showFinish, setShowFinish]         = useState(false)
    const [finished, setFinished]             = useState(false)
    const [rightTab, setRightTab]             = useState('procedures')
    const [cameraOpen, setCameraOpen]         = useState(false)
    const [sessionPhotos, setSessionPhotos]   = useState([])
    const [finishing, setFinishing]           = useState(false)
    const [showStartDialog, setShowStartDialog] = useState(false)

    const saveTimeoutRef = useRef(null)
    const textareaRef    = useRef(null)
    const autosaveRef    = useRef(null)

    // ── Load patient + create session on mount ─────────────────────────────────
    useEffect(() => {
        if (!patientPublicId) {
            setLoadingPatient(false)
            return
        }

        const init = async () => {
            setLoadingPatient(true)
            const consumer = await getConsumerById(patientPublicId)
            if (consumer?.data) {
                setPatient(consumer.data)
            } else if (consumer && !consumer.data) {
                setPatient(consumer)
            }
            setLoadingPatient(false)

            const sessionRes = await sessionCreate({
                patientId: patientPublicId,
                patientName: consumer?.data?.fullName ?? consumer?.fullName ?? '',
                professionalName: '',
            })
            if (sessionRes?.data?.id) {
                setSessionId(sessionRes.data.id)
            } else if (sessionRes?.id) {
                setSessionId(sessionRes.id)
            }
        }

        init()
    }, [patientPublicId])

    // ── Load history when history tab is opened ────────────────────────────────
    useEffect(() => {
        if (rightTab !== 'history' || !patientPublicId || history.length > 0) return
        setLoadingHistory(true)
        sessionGetByPatient(patientPublicId)
            .then((data) => setHistory(Array.isArray(data) ? data : (data?.data ?? [])))
            .finally(() => setLoadingHistory(false))
    }, [rightTab, patientPublicId, history.length])

    // ── Timer ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (timerPaused || finished || !sessionStarted) return
        const id = setInterval(() => setElapsed((e) => e + 1), 1000)
        return () => clearInterval(id)
    }, [timerPaused, finished, sessionStarted])

    useEffect(() => () => {
        clearTimeout(saveTimeoutRef.current)
        clearTimeout(autosaveRef.current)
    }, [])

    // ── Autosave clinical evolution ───────────────────────────────────────────
    const scheduleAutosave = useCallback((text, procedures) => {
        if (!sessionId) return
        clearTimeout(autosaveRef.current)
        autosaveRef.current = setTimeout(async () => {
            // Salva apenas a evolução clínica sem alterar tempo ou outros campos
            await sessionUpdateEvolution(sessionId, text)
        }, 1500)
    }, [sessionId])

    const triggerSave = useCallback(() => {
        setSaveStatus('saving')
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(() => setSaveStatus('saved'), 1200)
    }, [])

    // ── Start session ─────────────────────────────────────────────────────────
    const handleStartSession = async () => {
        if (!sessionId) return
        await sessionStart(sessionId)
        setSessionStarted(true)
        triggerSave()
    }

    // Handle start from dialog
    const handleStartFromDialog = async () => {
        await handleStartSession()
        setShowStartDialog(false)
        // Focar no textarea após iniciar
        setTimeout(() => {
            textareaRef.current?.focus()
        }, 100)
    }

    // ── Catalog filter ────────────────────────────────────────────────────────
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

    // ── Procedure handlers ────────────────────────────────────────────────────
    const handleAddProcedure = (proc) => {
        const updated = addedProcedures.find((p) => p.id === proc.id)
            ? addedProcedures.map((p) => (p.id === proc.id ? { ...p, qty: p.qty + 1 } : p))
            : [...addedProcedures, { ...proc, qty: 1 }]
        setAddedProcedures(updated)
        triggerSave()
        scheduleAutosave(evolutionText, updated)
    }

    const handleToggleTooth = (tooth) => {
        setCurrentTooth(tooth)
        setSelectedToothFaces([])
        setToothModalOpen(true)
        setSelectedTeeth((prev) =>
            prev.includes(tooth) ? prev : [...prev, tooth]
        )
    }

    const handleAssignToothProcedure = () => {
        if (!currentTooth || !selectedToothProcedureId || selectedToothFaces.length === 0) return
        const procedure = PROCEDURE_CATALOG.flatMap((cat) => cat.items).find((item) => item.id === selectedToothProcedureId)
        if (!procedure) return

        setProceduresByTooth((prev) => ({
            ...prev,
            [currentTooth]: [
                ...(prev[currentTooth] || []),
                { id: procedure.id, name: procedure.name, faces: selectedToothFaces },
            ],
        }))

        handleAddProcedure(procedure)
        setToothModalOpen(false)
        setSelectedToothProcedureId(null)
        setSelectedToothFaces([])
    }

    const handleRemoveProcedure = (id) => {
        const updated = addedProcedures.filter((p) => p.id !== id)
        setAddedProcedures(updated)
        triggerSave()
        scheduleAutosave(evolutionText, updated)
    }

    const handleQty = (id, delta) => {
        const updated = addedProcedures.map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p))
        setAddedProcedures(updated)
        triggerSave()
        scheduleAutosave(evolutionText, updated)
    }

    const appendPhrase = (phrase) => {
        const ta = textareaRef.current
        if (!ta) return
        const start = ta.selectionStart
        const end   = ta.selectionEnd
        const newText = evolutionText.slice(0, start) + phrase + evolutionText.slice(end)
        setEvolutionText(newText)
        triggerSave()
        scheduleAutosave(newText, addedProcedures)
        setTimeout(() => {
            ta.focus()
            ta.setSelectionRange(start + phrase.length, start + phrase.length)
        }, 0)
    }

    const handleEvolutionChange = (e) => {
        // Se o atendimento não foi iniciado e o usuário começou a digitar, mostrar diálogo
        if (!sessionStarted && !finished && e.target.value.trim().length > 0 && evolutionText.trim().length === 0) {
            setShowStartDialog(true)
            return
        }
        
        // Se o diálogo foi fechado sem iniciar atendimento, não permitir digitação
        if (!sessionStarted && !finished && evolutionText.trim().length === 0) {
            return
        }
        
        setEvolutionText(e.target.value)
        triggerSave()
        scheduleAutosave(e.target.value, addedProcedures)
    }

    // ── Finish session ────────────────────────────────────────────────────────
    const handleFinishConfirm = async () => {
        if (!sessionId) {
            setTimerPaused(true)
            setFinished(true)
            setShowFinish(false)
            return
        }

        setFinishing(true)
        const result = await sessionFinish(sessionId, {
            mainComplaint: evolutionText,
            procedures: JSON.stringify(addedProcedures),
        })
        setFinishing(false)

        if (result !== null) {
            setTimerPaused(true)
            setFinished(true)
            setShowFinish(false)
            toast.push(
                <Notification type='success' title='Atendimento Finalizado'>
                    Registrado com sucesso · Duração: {formatTimer(elapsed)}
                </Notification>,
            )
        }
    }

    const handleCameraSave = useCallback((captures) => {
        const newPhotos = captures.map((cap) => ({
            id: cap.id,
            name: cap.name,
            url: cap.dataUrl,
            createdAt: new Date().toISOString().split('T')[0],
        }))
        setSessionPhotos((prev) => [...prev, ...newPhotos])
        toast.push(
            <Notification type='success' title='Fotos salvas'>
                {captures.length} foto{captures.length > 1 ? 's' : ''} adicionada{captures.length > 1 ? 's' : ''} à galeria do paciente.
            </Notification>,
        )
    }, [])

    const patientName = patient?.fullName ?? patient?.name ?? '...'
    const age = calcAge(patient?.birthDate ?? patient?.dateOfBirth)
    const insurance = patient?.convenios?.[0]?.name ?? patient?.insurance ?? '—'
    const allergies = patient?.allergies ?? []

    const goBack = () => navigate(-1)

    if (loadingPatient) {
        return (
            <div className='min-h-screen bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center'>
                <div className='flex flex-col items-center gap-3 text-gray-400'>
                    <HiOutlineRefresh className='w-8 h-8 animate-spin' />
                    <p className='text-sm'>Carregando dados do paciente...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900/50 flex flex-col'>

            {/* ── Header fixo ── */}
            <div className='sticky top-0 z-40 shadow-lg shadow-black/40' style={{ background: 'linear-gradient(160deg, #0f0b2e 0%, #0a0820 55%, #07050f 100%)' }}>

                <div className='px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3'>

                    {/* Voltar + paciente */}
                    <div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
                        <button
                            onClick={goBack}
                            className='w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition flex-shrink-0'
                            title='Voltar ao prontuário'
                        >
                            <HiOutlineChevronLeft className='w-4 h-4 sm:w-5 sm:h-5' />
                        </button>

                        <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white text-base sm:text-lg flex-shrink-0 border border-white/30'>
                            {patientName.charAt(0)}
                        </div>

                        <div className='min-w-0'>
                            <p className='font-bold text-white text-xs sm:text-sm leading-tight truncate'>{patientName}</p>
                            <p className='hidden sm:block text-indigo-200 text-xs mt-0.5'>
                                {age !== '—' ? `${age} anos · ` : ''}{insurance}
                            </p>
                        </div>

                        {allergies.length > 0 && (
                            <span className='hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/25 text-rose-100 border border-rose-300/30 flex-shrink-0'>
                                <HiOutlineExclamation className='w-3 h-3' />
                                {Array.isArray(allergies) ? allergies.join(', ') : allergies}
                            </span>
                        )}

                        {/* Iniciar Atendimento */}
                        {!sessionStarted && !finished && sessionId && (
                            <button
                                onClick={handleStartSession}
                                className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 border border-emerald-400/50 text-white text-sm font-bold transition-all duration-200 active:scale-95 flex-shrink-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                            >
                                <HiOutlinePlay className='w-4 h-4' />
                                <span className='hidden xs:inline'>Iniciar Atendimento</span>
                                <span className='xs:hidden'>Iniciar</span>
                            </button>
                        )}
                        {sessionStarted && !finished && (
                            <span className='hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-400/20 border border-emerald-400/30 text-emerald-200 text-[10px] font-semibold flex-shrink-0'>
                                <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
                                Em Andamento
                            </span>
                        )}
                    </div>

                    {/* Timer */}
                    <div className='flex items-center gap-1 sm:gap-2 flex-shrink-0'>
                        <div className='flex items-center gap-1.5 sm:gap-2.5 bg-black/15 border border-white/20 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2'>
                            <div className={classNames(
                                'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0',
                                finished        ? 'bg-white/40' :
                                timerPaused     ? 'bg-amber-300' :
                                sessionStarted  ? 'bg-emerald-300 animate-pulse' :
                                                  'bg-white/30',
                            )} />
                            <span className='font-mono font-bold text-white text-sm sm:text-lg tracking-widest leading-none tabular-nums'>
                                {formatTimer(elapsed)}
                            </span>
                        </div>

                        {!finished && sessionStarted && (
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

                    {/* Camera */}
                    <button
                        onClick={() => setCameraOpen(true)}
                        title='Abrir câmera'
                        className='relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95 flex-shrink-0'
                        style={{
                            background: sessionPhotos.length > 0 ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.13)',
                            border: sessionPhotos.length > 0 ? '1px solid rgba(129,140,248,0.6)' : '1px solid rgba(255,255,255,0.22)',
                        }}
                    >
                        <HiOutlineCamera
                            className='w-4 h-4 flex-shrink-0'
                            style={{ color: sessionPhotos.length > 0 ? '#c7d2fe' : 'rgba(255,255,255,0.9)' }}
                        />
                        <span
                            className='hidden sm:inline text-xs font-semibold'
                            style={{ color: sessionPhotos.length > 0 ? '#c7d2fe' : 'rgba(255,255,255,0.85)' }}
                        >
                            {sessionPhotos.length > 0 ? `Câmera (${sessionPhotos.length})` : 'Câmera'}
                        </span>
                        {sessionPhotos.length > 0 && (
                            <span className='absolute -top-1.5 -right-1.5 sm:hidden w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shadow'>
                                {sessionPhotos.length}
                            </span>
                        )}
                    </button>

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
                            {rightTab === 'history' && (
                                loadingHistory ? (
                                    <div className='flex items-center justify-center py-10 gap-2 text-gray-400'>
                                        <HiOutlineRefresh className='w-4 h-4 animate-spin' />
                                        <span className='text-sm'>Carregando histórico...</span>
                                    </div>
                                ) : history.length === 0 ? (
                                    <p className='text-sm text-gray-400 text-center py-8'>Sem histórico de atendimentos.</p>
                                ) : (
                                    <div className='space-y-3 max-h-80 overflow-y-auto pr-0.5'>
                                        {history.slice(0, 10).map((apt, idx) => (
                                            <div key={apt.id} className='relative pl-4'>
                                                {idx < Math.min(history.length, 10) - 1 && (
                                                    <div className='absolute left-[7px] top-6 bottom-0 w-px bg-gray-200 dark:bg-gray-700' />
                                                )}
                                                <div className='absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-teal-400 bg-white dark:bg-gray-900' />

                                                <div className='bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 rounded-xl p-3 ml-2'>
                                                    <div className='flex items-start justify-between gap-2 mb-1'>
                                                        <p className='text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight'>
                                                            {apt.status ? statusLabel(apt.status) : 'Atendimento'}
                                                        </p>
                                                        <span className='text-[10px] text-gray-400 flex-shrink-0 tabular-nums'>
                                                            {formatDate(apt.scheduledAt ?? apt.startedAt)}
                                                        </span>
                                                    </div>
                                                    <p className='text-[11px] text-teal-600 dark:text-teal-400 font-medium mb-1.5'>
                                                        {apt.professionalName}
                                                        {apt.status && (
                                                            <span className={classNames(
                                                                'ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase',
                                                                apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                                apt.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                                            )}>
                                                                {statusLabel(apt.status)}
                                                            </span>
                                                        )}
                                                    </p>
                                                    {apt.mainComplaint && (
                                                        <p className='text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 italic'>
                                                            "{apt.mainComplaint}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}

                            {/* ── Aba Mídia ── */}
                            {rightTab === 'media' && (() => {
                                const allImages = [...sessionPhotos]
                                return (
                                    <div className='space-y-4 max-h-80 overflow-y-auto pr-0.5'>
                                        {allImages.length > 0 ? (
                                            <div>
                                                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
                                                    Imagens desta sessão ({allImages.length})
                                                </p>
                                                <div className='grid grid-cols-3 gap-2'>
                                                    {allImages.map((img) => (
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
                                        ) : (
                                            <div className='flex flex-col items-center gap-2 py-8 text-gray-400'>
                                                <HiOutlineCamera className='w-8 h-8' />
                                                <p className='text-sm'>Nenhuma foto capturada.</p>
                                                <p className='text-xs text-center'>Use o botão Câmera no cabeçalho para registrar imagens.</p>
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
                                                        <HiOutlinePlus className='w-4 h-4' />
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

            {/* ── Dialog dente ── */}
            <Dialog
                isOpen={toothModalOpen}
                onRequestClose={() => setToothModalOpen(false)}
                onClose={() => setToothModalOpen(false)}
                width={500}
                title={currentTooth ? `Procedimento - Dente ${currentTooth}` : 'Procedimento por Dente'}
            >
                <div className='space-y-6'>
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

                    {selectedToothProcedureId && (
                        <div className='border-t pt-6'>
                            <ToothFaceSelector
                                selectedFaces={selectedToothFaces}
                                onFaceToggle={setSelectedToothFaces}
                            />
                        </div>
                    )}

                    <div className='flex justify-end gap-2 pt-4 border-t'>
                        <Button variant='plain' onClick={() => setToothModalOpen(false)}>Cancelar</Button>
                        <Button
                            variant='solid'
                            onClick={handleAssignToothProcedure}
                            disabled={!selectedToothProcedureId || selectedToothFaces.length === 0}
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
                            <div className='grid grid-cols-2 gap-3'>
                                {[
                                    { label: 'Paciente',      value: patientName },
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

                            <div className='bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 border border-blue-100 dark:border-blue-800/40'>
                                <p className='text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1'>
                                    Evolução clínica · {evolutionText.length} caracteres
                                </p>
                                <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed'>
                                    {evolutionText.trim() || <em className='text-gray-400'>Sem evolução registrada.</em>}
                                </p>
                            </div>

                            <div className='flex gap-3 pt-1'>
                                <button
                                    onClick={() => setShowFinish(false)}
                                    disabled={finishing}
                                    className='flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition disabled:opacity-50'
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleFinishConfirm}
                                    disabled={finishing}
                                    className='flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white font-bold text-sm transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-60'
                                >
                                    {finishing
                                        ? <><HiOutlineRefresh className='w-4 h-4 animate-spin' /> Finalizando...</>
                                        : <><HiOutlineCheckCircle className='w-5 h-5' /> Confirmar Finalização</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <CameraModal
                open={cameraOpen}
                onClose={() => setCameraOpen(false)}
                onSave={handleCameraSave}
            />

            {/* Dialog para iniciar atendimento */}
            <Dialog
                isOpen={showStartDialog}
                onClose={() => setShowStartDialog(false)}
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <HiOutlinePlay className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            Iniciar Atendimento
                        </h3>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Você começou a digitar a evolução clínica, mas o atendimento ainda não foi iniciado. 
                        Deseja iniciar o atendimento agora para registrar o tempo e habilitar todas as funcionalidades?
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowStartDialog(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleStartFromDialog}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white font-bold text-sm transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                        >
                            <HiOutlinePlay className="w-4 h-4" />
                            Iniciar Atendimento
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default AttendanceIndex
