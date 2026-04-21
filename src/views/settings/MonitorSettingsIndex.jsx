import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Card, Input, Button, Notification, toast } from '@/components/ui'
import { monitorGetSettings, monitorUpdateSettings } from '@/api/enterprise/EnterpriseService'
import { callPatientOnMonitor } from '@/utils/monitorBroadcast'
import { useAppSelector } from '@/store/hook'
import { ConfirmDialog } from '@/components/shared'
import { Pattern1 } from '@/components/shared/listPatterns'
import {
    HiOutlineClipboardCopy,
    HiOutlineExternalLink,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlinePlay,
    HiOutlineX,
    HiOutlineFilm,
    HiOutlineLink,
    HiOutlineDesktopComputer,
    HiOutlineRefresh,
    HiOutlineVolumeUp,
    HiOutlineVolumeOff,
    HiOutlineColorSwatch,
    HiOutlinePhotograph,
    HiOutlineLockClosed,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineAdjustments,
    HiOutlineClock,
} from 'react-icons/hi'
import { THEMES } from '@/views/monitor/MonitorDisplay'

const CHANNEL = 'fluxy_monitor'
const LS_VIDEOS = 'fluxy_monitor_videos'
const LS_PHOTOS = 'fluxy_monitor_photos'
const LS_SETTINGS = 'fluxy_monitor_settings'
const LS_QUEUE = 'fluxy_monitor_queue'

const genId = () => Math.random().toString(36).slice(2, 10)

const SEED_VIDEOS = [
    { id: genId(), url: 'https://www.youtube.com/watch?v=5qap5aO4i9A', title: 'Lofi Hip Hop - Relaxing Music' },
]

const DURATION_OPTIONS = [
    { value: 3, label: '3 min' },
    { value: 5, label: '5 min' },
    { value: 10, label: '10 min' },
    { value: 15, label: '15 min' },
    { value: 20, label: '20 min' },
    { value: 30, label: '30 min' },
]

const REPEAT_OPTIONS = [
    { value: 0,  label: 'Desativado' },
    { value: 5,  label: '5 seg' },
    { value: 10, label: '10 seg' },
    { value: 15, label: '15 seg' },
    { value: 20, label: '20 seg' },
    { value: 30, label: '30 seg' },
]

const DISPLAY_OPTIONS = [
    { value: 5,  label: '5 seg' },
    { value: 10, label: '10 seg' },
    { value: 15, label: '15 seg' },
    { value: 20, label: '20 seg' },
    { value: 30, label: '30 seg' },
    { value: 60, label: '60 seg' },
]

const QUEUE_HIDE_OPTIONS = [
    { value: 0,   label: 'Sempre visível' },
    { value: 15,  label: '15 seg' },
    { value: 30,  label: '30 seg' },
    { value: 60,  label: '1 min' },
    { value: 120, label: '2 min' },
    { value: 300, label: '5 min' },
]

function broadcast(type, payload) {
    try {
        const bc = new BroadcastChannel(CHANNEL)
        bc.postMessage({ type, payload })
        bc.close()
    } catch {}
}

function ytId(url) {
    if (!url) return null
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)
    return m?.[1] ?? null
}

const EmptyState = ({ icon, message, sub, action }) => (
    <div className="flex flex-col items-center justify-center py-8 gap-2.5 select-none">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600">
            <span className="text-2xl">{icon}</span>
        </div>
        <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{message}</p>
            {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
        </div>
        {action && <div className="mt-1">{action}</div>}
    </div>
)

function VideoDialog({ open, video, onClose, onSave }) {
    const [form, setForm] = useState({ url: '', title: '' })
    const [error, setError] = useState('')

    useEffect(() => {
        if (open) setForm(video ? { url: video.url, title: video.title } : { url: '', title: '' })
        setError('')
    }, [open, video])

    const isEdit = !!video
    const preview = ytId(form.url)

    const handleSave = () => {
        if (!form.url.trim()) { setError('URL é obrigatória'); return }
        if (!preview) { setError('URL inválida. Use youtube.com/watch?v=... ou youtu.be/...'); return }
        onSave({ url: form.url.trim(), title: form.title.trim() || 'Sem título' })
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-violet-50 dark:bg-violet-900/20'}`}>
                            <HiOutlineFilm className={`w-5 h-5 ${isEdit ? 'text-amber-500' : 'text-violet-500'}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {isEdit ? 'Editar Vídeo' : 'Adicionar Vídeo'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <HiOutlineX className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">URL do YouTube</label>
                        <Input
                            value={form.url}
                            onChange={e => { setForm(p => ({ ...p, url: e.target.value })); setError('') }}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                            Título <span className="normal-case text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <Input
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="Ex: Música ambiente para recepção"
                        />
                    </div>
                    {preview && (
                        <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
                            <img src={`https://img.youtube.com/vi/${preview}/hqdefault.jpg`} alt="thumb" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <HiOutlinePlay className="w-6 h-6 text-white ml-0.5" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 p-5 pt-0">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${isEdit ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-600 hover:bg-violet-700'}`}
                    >
                        {isEdit ? 'Salvar alterações' : 'Adicionar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function TestCallDialog({ open, onClose, onCall }) {
    const [form, setForm] = useState({ patientName: '', room: '' })

    useEffect(() => { if (open) setForm({ patientName: '', room: '' }) }, [open])

    const handleCall = () => {
        if (!form.patientName.trim() || !form.room.trim()) return
        onCall(form.patientName.trim(), form.room.trim())
        onClose()
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <HiOutlinePlay className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Testar Chamada</h3>
                            <p className="text-xs text-gray-400">Envia ao monitor sem registrar</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <HiOutlineX className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
                <div className="p-5 space-y-3">
                    <Input value={form.patientName} onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))} placeholder="Nome do paciente" onKeyDown={e => e.key === 'Enter' && handleCall()} />
                    <Input value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} placeholder="Sala / Consultório" onKeyDown={e => e.key === 'Enter' && handleCall()} />
                </div>
                <div className="flex justify-end gap-2 p-5 pt-0">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
                    <button
                        disabled={!form.patientName.trim() || !form.room.trim()}
                        onClick={handleCall}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Chamar no monitor
                    </button>
                </div>
            </div>
        </div>
    )
}

function fromApi(dto, existingVideos, existingPhotos) {
    return {
        cfg: {
            clinicName:            dto.clinicName            ?? '',
            theme:                 dto.theme                 ?? 'dark',
            volume:                dto.volume                ?? 50,
            videoDurationMin:      dto.videoDurationMin      ?? 10,
            callRepeatIntervalSec: dto.callRepeatIntervalSec ?? 0,
            queueHideSec:          dto.queueHideSec          ?? 0,
            callDisplaySec:        dto.callDisplaySec         ?? 15,
            monitorPassword:       '',
            hasPassword:           dto.hasPassword           ?? false,
            logoBase64:            dto.logoBase64            ?? null,
            showPhotoCarousel:     dto.showPhotoCarousel     ?? false,
            photoDisplaySec:       dto.photoDisplaySec       ?? 8,
            carouselIntervalMin:   dto.carouselIntervalMin   ?? 10,
        },
        videos: dto.videos?.length ? dto.videos : existingVideos,
        photos: dto.photos?.length ? dto.photos : existingPhotos,
    }
}

function toApi(cfg, videos, photos) {
    return {
        clinicName:            cfg.clinicName,
        theme:                 cfg.theme,
        volume:                cfg.volume,
        videoDurationMin:      cfg.videoDurationMin,
        callRepeatIntervalSec: cfg.callRepeatIntervalSec ?? 0,
        queueHideSec:          cfg.queueHideSec          ?? 0,
        callDisplaySec:        cfg.callDisplaySec         ?? 15,
        monitorPassword:       cfg.monitorPassword || null,
        logoBase64:            cfg.logoBase64 ?? null,
        showPhotoCarousel:     cfg.showPhotoCarousel      ?? false,
        photoDisplaySec:       cfg.photoDisplaySec        ?? 8,
        carouselIntervalMin:   cfg.carouselIntervalMin    ?? 10,
        videos,
        photos,
    }
}

export default function MonitorSettingsIndex() {
    const companyPublicId = useAppSelector(state => state.auth.user.companyPublicId)
    const monitorUrl = `${window.location.origin}/monitor/display?cid=${companyPublicId ?? ''}`

    const [videos, setVideos] = useState(SEED_VIDEOS)
    const [photos, setPhotos] = useState([])
    const [cfg, setCfg] = useState({ clinicName: '', videoDurationMin: 10, volume: 50, theme: 'dark', callRepeatIntervalSec: 0, queueHideSec: 0, callDisplaySec: 15, monitorPassword: '', hasPassword: false, showPhotoCarousel: false, photoDisplaySec: 8, carouselIntervalMin: 10 })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const cfgRef = useRef(cfg)
    const videosRef = useRef(videos)
    const photosRef = useRef(photos)
    cfgRef.current = cfg
    videosRef.current = videos
    photosRef.current = photos

    useEffect(() => {
        const cachedPhotos = JSON.parse(localStorage.getItem(LS_PHOTOS) || '[]')
        monitorGetSettings()
            .then(res => {
                const { cfg: c, videos: v, photos: p } = fromApi(res, SEED_VIDEOS, cachedPhotos)
                setCfg(c)
                setVideos(v)
                setPhotos(p)
                try { localStorage.setItem(LS_SETTINGS, JSON.stringify(c)) } catch {}
                try { localStorage.setItem(LS_VIDEOS, JSON.stringify(v)) } catch {}
                try { localStorage.setItem(LS_PHOTOS, JSON.stringify(p)) } catch {}
            })
            .catch(() => {
                const cached = JSON.parse(localStorage.getItem(LS_SETTINGS) || 'null')
                if (cached) setCfg(cached)
                const cachedV = JSON.parse(localStorage.getItem(LS_VIDEOS) || 'null')
                if (cachedV?.length) setVideos(cachedV)
                if (cachedPhotos?.length) setPhotos(cachedPhotos)
            })
            .finally(() => setLoading(false))
    }, [])

    const persist = useCallback(async (newCfg, newVideos, newPhotos) => {
        const payload = toApi(newCfg ?? cfgRef.current, newVideos ?? videosRef.current, newPhotos ?? photosRef.current)
        // Broadcast imediato — monitor atualiza antes da API responder
        broadcast('UPDATE_SETTINGS', payload)
        broadcast('UPDATE_VIDEOS', payload.videos)
        broadcast('UPDATE_PHOTOS', payload.photos)
        setSaving(true)
        try {
            await monitorUpdateSettings(payload)
            // Salva apenas config (sem arrays de mídia) para evitar estourar o localStorage com base64
            const { videos: _v, photos: _p, ...cfgOnly } = payload
            try { localStorage.setItem(LS_SETTINGS, JSON.stringify(cfgOnly)) } catch {}
            try { localStorage.setItem(LS_VIDEOS, JSON.stringify(payload.videos)) } catch {}
            try { localStorage.setItem(LS_PHOTOS, JSON.stringify(payload.photos)) } catch {}
        } finally {
            setSaving(false)
        }
    }, [])

    const [videoDialog, setVideoDialog] = useState({ open: false, video: null })
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
    const [testDialog, setTestDialog] = useState(false)

    const saveVideos = useCallback(async (next) => {
        setVideos(next)
        await persist(null, next)
    }, [persist])

    const handleVideoSave = useCallback(({ url, title }) => {
        const updated = videoDialog.video
            ? videos.map(v => v.id === videoDialog.video.id ? { ...v, url, title } : v)
            : [...videos, { id: genId(), url, title }]
        saveVideos(updated)
        setVideoDialog({ open: false, video: null })
    }, [videoDialog, videos, saveVideos])

    const handleDelete = useCallback(() => {
        saveVideos(videos.filter(v => v.id !== deleteDialog.id))
        setDeleteDialog({ open: false, id: null })
    }, [deleteDialog, videos, saveVideos])

    const handleTestCall = async (patientName, room) => {
        await callPatientOnMonitor(patientName, room)
        toast.push(<Notification type="success" title="Chamada enviada ao monitor" />, { placement: 'top-center' })
    }

    const copyUrl = () => {
        navigator.clipboard.writeText(monitorUrl)
        toast.push(<Notification type="success" title="URL copiada" />, { placement: 'top-center' })
    }

    const clearQueue = () => {
        localStorage.removeItem(LS_QUEUE)
        broadcast('CLEAR_QUEUE', null)
        toast.push(<Notification type="info" title="Fila do monitor foi limpa" />, { placement: 'top-center' })
    }

    const videoItems = useMemo(() => videos.map((v, i) => ({
        id: v.id,
        name: v.title || 'Sem título',
        email: v.url,
        emailIcon: HiOutlineLink,
        badge: `#${i + 1}`,
        badgeColor: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
        _raw: v,
    })), [videos])

    const photoItems = useMemo(() => photos.map((p, i) => ({
        id: p.id,
        name: p.title || `Foto ${i + 1}`,
        badge: `#${i + 1}`,
        badgeColor: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        avatarName: p.title || `F${i + 1}`,
        avatarColor: 'bg-orange-100 dark:bg-orange-900/30',
        _raw: p,
    })), [photos])

    const photoActions = [
        {
            key: 'delete',
            icon: <HiOutlineTrash />,
            tooltip: 'Remover',
            className: 'p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors',
            onClick: (item) => {
                const updated = photos.filter(p => p.id !== item._raw.id)
                setPhotos(updated)
                persist(null, null, updated)
            },
        },
    ]

    const videoActions = [
        {
            key: 'edit', label: 'Editar', tooltip: 'Editar',
            onClick: (item) => setVideoDialog({ open: true, video: item._raw }),
        },
        {
            key: 'delete', icon: <HiOutlineTrash />, tooltip: 'Remover',
            className: 'p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors',
            onClick: (item) => setDeleteDialog({ open: true, id: item._raw.id }),
        },
    ]

    const volumeVal = cfg.volume ?? 50

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Monitor de Chamadas</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Painel exibido na TV da sala de espera</p>
                </div>
                <div className="flex items-center gap-2">
                    {saving && <span className="text-xs text-gray-400 animate-pulse">Salvando…</span>}
                    <button
                        onClick={() => setTestDialog(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                    >
                        <HiOutlinePlay className="w-4 h-4" />
                        Testar chamada
                    </button>
                </div>
            </div>

            {/* ── Linha 1: Acesso + Segurança ─────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
                {/* URL */}
                <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                        <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <HiOutlineDesktopComputer className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">URL do Monitor</p>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 mb-3">
                            <span className="flex-1 font-mono text-xs text-gray-500 dark:text-gray-400 truncate">{monitorUrl}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={copyUrl}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                            >
                                <HiOutlineClipboardCopy className="w-3.5 h-3.5" /> Copiar
                            </button>
                            <button
                                onClick={() => window.open('/monitor/display', '_blank')}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <HiOutlineExternalLink className="w-3.5 h-3.5" /> Abrir
                            </button>
                            <button
                                onClick={clearQueue}
                                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 transition-colors"
                                title="Limpar fila do monitor"
                            >
                                <HiOutlineRefresh className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Senha */}
                <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <HiOutlineLockClosed className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Senha do Monitor</p>
                            {cfg.hasPassword && (
                                <span className="text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">Configurada</span>
                            )}
                        </div>
                    </div>
                    <div className="p-5">
                        <p className="text-xs text-gray-400 mb-3">
                            Protege o monitor até que a senha seja digitada na tela de bloqueio.
                        </p>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={cfg.monitorPassword}
                                    onChange={e => setCfg(p => ({ ...p, monitorPassword: e.target.value }))}
                                    onKeyDown={e => e.key === 'Enter' && persist(cfg, null)}
                                    placeholder={cfg.hasPassword ? '••••••• (alterar)' : 'Nova senha'}
                                    className="w-full h-9 px-3 pr-9 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                                />
                                <button tabIndex={-1} onClick={() => setShowPass(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPass ? <HiOutlineEyeOff className="w-3.5 h-3.5" /> : <HiOutlineEye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                            <button
                                onClick={() => persist(cfg, null).then(() => {
                                    setCfg(p => ({ ...p, monitorPassword: '', hasPassword: true }))
                                    toast.push(<Notification type="success" title="Senha salva" />, { placement: 'top-center' })
                                })}
                                disabled={!cfg.monitorPassword.trim()}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* ── Aparência ─────────────────────────────────────────────────── */}
            <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <HiOutlineAdjustments className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Aparência</p>
                </div>
                <div className="p-5">

                    {/* Logo + Nome + Duração */}
                    <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start mb-5">
                        {/* Logo */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1.5">Logo</p>
                            {cfg.logoBase64 ? (
                                <div className="group relative w-20 h-14 rounded-xl bg-gray-900 flex items-center justify-center border border-gray-700 overflow-hidden">
                                    <img src={cfg.logoBase64} alt="logo" className="h-10 w-auto max-w-[70px] object-contain" />
                                    <button
                                        onClick={() => { const next = { ...cfg, logoBase64: null }; setCfg(next); persist(next, null) }}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    >
                                        <HiOutlineTrash className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer block w-20 h-14 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-500 transition-colors flex items-center justify-center group">
                                    <HiOutlinePhotograph className="w-5 h-5 text-gray-300 group-hover:text-violet-400 transition-colors" />
                                    <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden"
                                        onChange={e => {
                                            const file = e.target.files?.[0]; if (!file) return
                                            const reader = new FileReader()
                                            reader.onload = ev => { const next = { ...cfg, logoBase64: ev.target.result }; setCfg(next); persist(next, null) }
                                            reader.readAsDataURL(file); e.target.value = ''
                                        }}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Nome */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1.5">Nome da clínica</p>
                            <Input
                                value={cfg.clinicName}
                                onChange={e => setCfg(p => ({ ...p, clinicName: e.target.value }))}
                                onBlur={() => persist(cfg, null)}
                                onKeyDown={e => e.key === 'Enter' && persist(cfg, null)}
                                placeholder="Exibido no topo do painel"
                            />
                        </div>

                        {/* Duração */}
                        <div className="w-28">
                            <p className="text-xs font-medium text-gray-500 mb-1.5">Duração/vídeo</p>
                            <select
                                value={cfg.videoDurationMin}
                                onChange={e => {
                                    const next = { ...cfg, videoDurationMin: Number(e.target.value) }
                                    setCfg(next); persist(next, null)
                                }}
                                className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                            >
                                {DURATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Temas */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <HiOutlineColorSwatch className="w-4 h-4 text-gray-400" />
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tema de cores</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {THEMES.map(th => {
                                const selected = (cfg.theme ?? 'dark') === th.id
                                return (
                                    <button
                                        key={th.id}
                                        onClick={() => { const next = { ...cfg, theme: th.id }; setCfg(next); persist(next, null) }}
                                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${selected ? 'border-violet-500' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'}`}
                                        title={th.label}
                                    >
                                        <div className="w-12 h-8 rounded-lg relative overflow-hidden shadow-sm" style={{ background: th.bg }}>
                                            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 60% 50%, ${th.accent}55 0%, transparent 70%)` }} />
                                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded px-1 py-0.5" style={{ background: th.accentDim, border: `1px solid ${th.accentBorder}` }}>
                                                <div className="w-3 h-0.5 rounded-full" style={{ background: th.accent }} />
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-medium ${selected ? 'text-violet-500' : 'text-gray-400'}`}>{th.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Volume */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${volumeVal === 0 ? 'bg-gray-100 dark:bg-gray-700' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                                {volumeVal === 0
                                    ? <HiOutlineVolumeOff className="w-4 h-4 text-gray-400" />
                                    : <HiOutlineVolumeUp className="w-4 h-4 text-emerald-500" />
                                }
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Volume dos vídeos</p>
                                    <span className={`text-sm font-bold tabular-nums w-10 text-right ${volumeVal === 0 ? 'text-gray-400' : 'text-emerald-500'}`}>
                                        {volumeVal === 0 ? 'Mudo' : `${volumeVal}%`}
                                    </span>
                                </div>
                                <input
                                    type="range" min={0} max={100} step={5}
                                    value={volumeVal}
                                    onChange={e => setCfg(p => ({ ...p, volume: Number(e.target.value) }))}
                                    onMouseUp={() => persist(null, null)}
                                    onTouchEnd={() => persist(null, null)}
                                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                    style={{ background: `linear-gradient(to right, ${volumeVal === 0 ? '#d1d5db' : '#10b981'} ${volumeVal}%, #e5e7eb ${volumeVal}%)` }}
                                />
                                <p className="text-xs text-gray-400 mt-1.5">
                                    {volumeVal === 0 ? 'Sem som — autoplay garantido em qualquer navegador' : 'O vídeo inicia mudo e ajusta o volume automaticamente após carregar'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* ── Comportamento ─────────────────────────────────────────────── */}
            <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                    <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <HiOutlineClock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Comportamento</p>
                </div>
                <div className="p-5 grid grid-cols-3 gap-6">
                    {/* Tempo de exibição */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tempo de exibição</p>
                        <p className="text-xs text-gray-400 mb-2.5">
                            Por quanto tempo o nome do paciente fica em destaque antes do vídeo retomar.
                        </p>
                        <select
                            value={cfg.callDisplaySec ?? 15}
                            onChange={e => {
                                const next = { ...cfg, callDisplaySec: Number(e.target.value) }
                                setCfg(next); persist(next, null)
                                broadcast('UPDATE_SETTINGS', toApi(next, videosRef.current))
                            }}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                        >
                            {DISPLAY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>

                    {/* Repetir chamada */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Repetir última chamada</p>
                        <p className="text-xs text-gray-400 mb-2.5">
                            Após o banner fechar, re-exibe automaticamente e toca o chime neste intervalo (máx. 2×).
                        </p>
                        <select
                            value={cfg.callRepeatIntervalSec ?? 0}
                            onChange={e => {
                                const next = { ...cfg, callRepeatIntervalSec: Number(e.target.value) }
                                setCfg(next); persist(next, null)
                                broadcast('UPDATE_SETTINGS', toApi(next, videosRef.current))
                            }}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                        >
                            {REPEAT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>

                    {/* Ocultar histórico */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Histórico de chamados</p>
                        <p className="text-xs text-gray-400 mb-2.5">
                            Tempo que a lista de chamadas anteriores fica visível antes de desaparecer automaticamente.
                        </p>
                        <select
                            value={cfg.queueHideSec ?? 0}
                            onChange={e => {
                                const next = { ...cfg, queueHideSec: Number(e.target.value) }
                                setCfg(next); persist(next, null)
                                broadcast('UPDATE_SETTINGS', toApi(next, videosRef.current))
                            }}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                        >
                            {QUEUE_HIDE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            {/* ── Espaço Publicitário ───────────────────────────────────────── */}
            <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <HiOutlinePhotograph className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Espaço Publicitário</p>
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {cfg.showPhotoCarousel && (
                            <>
                                <select
                                    value={cfg.carouselIntervalMin ?? 10}
                                    onChange={e => {
                                        const next = { ...cfg, carouselIntervalMin: Number(e.target.value) }
                                        setCfg(next); persist(next, null, null)
                                    }}
                                    className="h-8 px-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 focus:outline-none"
                                    title="A cada quanto tempo o carrossel aparece"
                                >
                                    {[1, 3, 5, 10, 15, 20, 30].map(v => (
                                        <option key={v} value={v}>a cada {v} min</option>
                                    ))}
                                </select>
                                <select
                                    value={cfg.photoDisplaySec ?? 8}
                                    onChange={e => {
                                        const next = { ...cfg, photoDisplaySec: Number(e.target.value) }
                                        setCfg(next); persist(next, null, null)
                                    }}
                                    className="h-8 px-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 focus:outline-none"
                                    title="Tempo de exibição por foto"
                                >
                                    {[3, 5, 8, 10, 15, 20, 30].map(v => (
                                        <option key={v} value={v}>{v}s por foto</option>
                                    ))}
                                </select>
                            </>
                        )}
                        <button
                            onClick={() => {
                                const next = { ...cfg, showPhotoCarousel: !cfg.showPhotoCarousel }
                                setCfg(next); persist(next, null, null)
                            }}
                            className={`relative w-10 h-5 rounded-full transition-colors ${cfg.showPhotoCarousel ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            title={cfg.showPhotoCarousel ? 'Desativar carrossel' : 'Ativar carrossel'}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${cfg.showPhotoCarousel ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 transition-colors mb-4 group">
                        <HiOutlinePlus className="w-4 h-4 text-gray-400 group-hover:text-orange-400 transition-colors" />
                        <span className="text-sm text-gray-400 group-hover:text-orange-400 transition-colors">Adicionar foto / banner publicitário</span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e => {
                                const files = Array.from(e.target.files ?? [])
                                if (!files.length) return
                                Promise.all(
                                    files.map(f => new Promise(res => {
                                        const r = new FileReader()
                                        r.onload = ev => res({ id: genId(), imageBase64: ev.target.result, title: f.name.replace(/\.[^.]+$/, '') })
                                        r.readAsDataURL(f)
                                    }))
                                ).then(newPhotos => {
                                    const updated = [...photos, ...newPhotos]
                                    setPhotos(updated)
                                    persist(null, null, updated)
                                })
                                e.target.value = ''
                            }}
                        />
                    </label>

                    {photos.length === 0 ? (
                        <EmptyState
                            icon={<HiOutlinePhotograph />}
                            message="Nenhuma foto cadastrada"
                            sub="Adicione imagens para exibir no espaço publicitário do monitor"
                        />
                    ) : (
                        <Pattern1
                            items={photoItems}
                            actions={photoActions}
                            onItemClick={() => {}}
                        />
                    )}
                </div>
            </Card>

            {/* ── Playlist ──────────────────────────────────────────────────── */}
            <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                            <HiOutlineFilm className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Playlist</p>
                        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}
                        </span>
                    </div>
                    <button
                        onClick={() => setVideoDialog({ open: true, video: null })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors"
                    >
                        <HiOutlinePlus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                </div>

                {videos.length === 0 ? (
                    <div className="px-5 pb-5">
                        <EmptyState icon={<HiOutlineFilm />} message="Nenhum vídeo na playlist" sub="Adicione vídeos do YouTube para exibir no monitor" />
                    </div>
                ) : (
                    <Pattern1 items={videoItems} actions={videoActions} onItemClick={item => setVideoDialog({ open: true, video: item._raw })} />
                )}
            </Card>

            <VideoDialog open={videoDialog.open} video={videoDialog.video} onClose={() => setVideoDialog({ open: false, video: null })} onSave={handleVideoSave} />
            <TestCallDialog open={testDialog} onClose={() => setTestDialog(false)} onCall={handleTestCall} />
            <ConfirmDialog isOpen={deleteDialog.open} type="danger" title="Remover vídeo" onClose={() => setDeleteDialog({ open: false, id: null })} onConfirm={handleDelete}>
                <p>Tem certeza que deseja remover este vídeo da playlist?</p>
            </ConfirmDialog>
        </div>
    )
}
