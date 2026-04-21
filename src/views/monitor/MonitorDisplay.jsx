import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineLockClosed } from 'react-icons/hi'
import { monitorGetSettings, monitorGetSettingsPublic, monitorVerifyPasswordPublic } from '@/api/enterprise/EnterpriseService'
import { useAppSelector } from '@/store/hook'
import { useMonitorSignalR } from '@/utils/useMonitorSignalR'
import { useLocation } from 'react-router-dom'

function hasAuthToken() {
    try {
        const token = JSON.parse(JSON.parse(localStorage.getItem('admin') ?? '{}').auth).session.token
        return !!token
    } catch { return false }
}

const CHANNEL = 'fluxy_monitor'
const LS_QUEUE = 'fluxy_monitor_queue'
const LS_VIDEOS = 'fluxy_monitor_videos'
const LS_PHOTOS = 'fluxy_monitor_photos'
const LS_SETTINGS = 'fluxy_monitor_settings'
const LS_COMPANY = 'fluxy_monitor_company'
const SS_UNLOCKED = 'fluxy_monitor_unlocked'
const EVENT_CALL = 'CALL_TO_ROOM'
const EVENT_HISTORY_VIDEO = 'HISTORY_WITH_VIDEO'
const EVENT_HISTORY_ADS = 'HISTORY_WITH_ADS'

// Fotos base64 podem ser grandes — nunca deixar um QuotaExceededError travar o monitor
function safeSave(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

const SEED_VIDEOS = [
    { id: '1', url: 'https://www.youtube.com/watch?v=5qap5aO4i9A', title: 'Lofi Hip Hop - Relaxing Music' },
]

export const THEMES = [
    {
        id: 'dark',
        label: 'Escuro',
        bg: '#080810',
        panelBg: '#0d0d18',
        topBarBorder: 'rgba(255,255,255,0.04)',
        divider: 'rgba(255,255,255,0.035)',
        accent: '#a78bfa',
        accentDim: 'rgba(124,58,237,0.12)',
        accentBorder: 'rgba(167,139,250,0.22)',
        accentLabel: 'rgba(167,139,250,0.5)',
        glow: 'rgba(124,58,237,0.08)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.75)',
        textMuted: 'rgba(255,255,255,0.35)',
        textVeryMuted: 'rgba(255,255,255,0.18)',
        queueBg: 'rgba(255,255,255,0.025)',
        queueBorder: 'rgba(255,255,255,0.04)',
    },
    {
        id: 'midnight',
        label: 'Meia-noite',
        bg: '#0c1220',
        panelBg: '#111827',
        topBarBorder: 'rgba(255,255,255,0.05)',
        divider: 'rgba(255,255,255,0.04)',
        accent: '#60a5fa',
        accentDim: 'rgba(59,130,246,0.12)',
        accentBorder: 'rgba(96,165,250,0.22)',
        accentLabel: 'rgba(96,165,250,0.5)',
        glow: 'rgba(59,130,246,0.08)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.75)',
        textMuted: 'rgba(255,255,255,0.35)',
        textVeryMuted: 'rgba(255,255,255,0.18)',
        queueBg: 'rgba(255,255,255,0.025)',
        queueBorder: 'rgba(255,255,255,0.05)',
    },
    {
        id: 'forest',
        label: 'Floresta',
        bg: '#091409',
        panelBg: '#0f200f',
        topBarBorder: 'rgba(255,255,255,0.04)',
        divider: 'rgba(255,255,255,0.035)',
        accent: '#4ade80',
        accentDim: 'rgba(16,185,129,0.12)',
        accentBorder: 'rgba(74,222,128,0.22)',
        accentLabel: 'rgba(74,222,128,0.5)',
        glow: 'rgba(16,185,129,0.08)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.75)',
        textMuted: 'rgba(255,255,255,0.35)',
        textVeryMuted: 'rgba(255,255,255,0.18)',
        queueBg: 'rgba(255,255,255,0.025)',
        queueBorder: 'rgba(255,255,255,0.04)',
    },
    {
        id: 'crimson',
        label: 'Carmesim',
        bg: '#120808',
        panelBg: '#1f0f0f',
        topBarBorder: 'rgba(255,255,255,0.04)',
        divider: 'rgba(255,255,255,0.035)',
        accent: '#fb7185',
        accentDim: 'rgba(244,63,94,0.12)',
        accentBorder: 'rgba(251,113,133,0.22)',
        accentLabel: 'rgba(251,113,133,0.5)',
        glow: 'rgba(244,63,94,0.08)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.75)',
        textMuted: 'rgba(255,255,255,0.35)',
        textVeryMuted: 'rgba(255,255,255,0.18)',
        queueBg: 'rgba(255,255,255,0.025)',
        queueBorder: 'rgba(255,255,255,0.04)',
    },
    {
        id: 'ocean',
        label: 'Oceano',
        bg: '#07101a',
        panelBg: '#0c1a2e',
        topBarBorder: 'rgba(255,255,255,0.04)',
        divider: 'rgba(255,255,255,0.035)',
        accent: '#22d3ee',
        accentDim: 'rgba(6,182,212,0.12)',
        accentBorder: 'rgba(34,211,238,0.22)',
        accentLabel: 'rgba(34,211,238,0.5)',
        glow: 'rgba(6,182,212,0.08)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.75)',
        textMuted: 'rgba(255,255,255,0.35)',
        textVeryMuted: 'rgba(255,255,255,0.18)',
        queueBg: 'rgba(255,255,255,0.025)',
        queueBorder: 'rgba(255,255,255,0.04)',
    },
    {
        id: 'light',
        label: 'Claro',
        bg: '#f1f5f9',
        panelBg: '#e2e8f0',
        topBarBorder: 'rgba(0,0,0,0.08)',
        divider: 'rgba(0,0,0,0.07)',
        accent: '#7c3aed',
        accentDim: 'rgba(124,58,237,0.07)',
        accentBorder: 'rgba(124,58,237,0.18)',
        accentLabel: 'rgba(109,40,217,0.55)',
        glow: 'rgba(124,58,237,0.04)',
        textPrimary: '#0f172a',
        textSecondary: 'rgba(15,23,42,0.7)',
        textMuted: 'rgba(15,23,42,0.4)',
        textVeryMuted: 'rgba(15,23,42,0.22)',
        queueBg: 'rgba(0,0,0,0.03)',
        queueBorder: 'rgba(0,0,0,0.07)',
    },
]

function ytId(url) {
    if (!url) return null
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)
    return m?.[1] ?? null
}

function playChime() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) return
        const ctx = new AudioCtx()
        const doPlay = () => {
            const notes = [
                { freq: 392.00, delay: 0.00, vol: 0.20, decay: 1.6 },
                { freq: 493.88, delay: 0.20, vol: 0.18, decay: 1.5 },
                { freq: 587.33, delay: 0.40, vol: 0.16, decay: 1.4 },
                { freq: 783.99, delay: 0.60, vol: 0.22, decay: 2.0 },
            ]
            notes.forEach(({ freq, delay, vol, decay }) => {
                const t = ctx.currentTime + delay
                const osc = ctx.createOscillator(); const gain = ctx.createGain()
                osc.type = 'sine'; osc.frequency.value = freq
                gain.gain.setValueAtTime(0, t)
                gain.gain.linearRampToValueAtTime(vol, t + 0.012)
                gain.gain.exponentialRampToValueAtTime(0.0001, t + decay)
                osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + decay)
                const osc2 = ctx.createOscillator(); const gain2 = ctx.createGain()
                osc2.type = 'sine'; osc2.frequency.value = freq * 2
                gain2.gain.setValueAtTime(0, t)
                gain2.gain.linearRampToValueAtTime(vol * 0.25, t + 0.012)
                gain2.gain.exponentialRampToValueAtTime(0.0001, t + decay * 0.6)
                osc2.connect(gain2); gain2.connect(ctx.destination); osc2.start(t); osc2.stop(t + decay * 0.6)
                const osc3 = ctx.createOscillator(); const gain3 = ctx.createGain()
                osc3.type = 'sine'; osc3.frequency.value = freq * 3.5
                gain3.gain.setValueAtTime(0, t)
                gain3.gain.linearRampToValueAtTime(vol * 0.07, t + 0.012)
                gain3.gain.exponentialRampToValueAtTime(0.0001, t + decay * 0.3)
                osc3.connect(gain3); gain3.connect(ctx.destination); osc3.start(t); osc3.stop(t + decay * 0.3)
            })
            setTimeout(() => ctx.close().catch(() => {}), 6000)
        }
        ctx.resume().then(doPlay).catch(doPlay)
    } catch {}
}

// ─── Carousel slide ───────────────────────────────────────────────────────────

function CarouselSlide({ photo, fade, total, current, theme: t }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-10 py-8">
            {/* Fundo desfocado da imagem */}
            <div
                className="absolute inset-0 scale-110 blur-2xl opacity-20 pointer-events-none"
                style={{ backgroundImage: `url(${photo.imageBase64})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />

            {/* Badge */}
            <div
                className="absolute top-5 right-5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.25em] font-semibold z-10"
                style={{ background: 'rgba(255,255,255,0.06)', color: t.textVeryMuted, border: `1px solid ${t.topBarBorder}` }}
            >
                Publicidade
            </div>

            {/* Foto centralizada */}
            <div
                className="relative z-10 flex items-center justify-center w-full h-full"
                style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease' }}
            >
                <img
                    src={photo.imageBase64}
                    alt={photo.title || 'Publicidade'}
                    className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
                    style={{ boxShadow: `0 24px 80px rgba(0,0,0,0.5)` }}
                />
            </div>

            {/* Título */}
            {photo.title && (
                <p
                    className="absolute bottom-10 left-0 right-0 z-10 text-sm font-medium tracking-wide text-center"
                    style={{ color: t.textMuted, opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease' }}
                >
                    {photo.title}
                </p>
            )}

            {/* Progress dots */}
            {total > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                    {Array.from({ length: total }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-full transition-all duration-500"
                            style={{
                                width: i === current ? '20px' : '5px',
                                height: '5px',
                                background: i === current ? t.accent : t.textVeryMuted,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Lock Screen ──────────────────────────────────────────────────────────────

function MonitorLockScreen({ onUnlock, companyPublicId: cid }) {
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [error, setError] = useState(false)
    const [shake, setShake] = useState(false)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef(null)

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100)
    }, [])

    const handleSubmit = async () => {
        if (!password.trim() || loading) return
        setLoading(true)
        try {
            const { valid } = await monitorVerifyPasswordPublic(password.trim(), cid)
            if (valid) {
                const data = await monitorGetSettingsPublic(cid)
                const merged = {
                    clinicName:            data.clinicName            ?? '',
                    theme:                 data.theme                 ?? 'dark',
                    volume:                data.volume                ?? 50,
                    videoDurationMin:      data.videoDurationMin      ?? 10,
                    callRepeatIntervalSec: data.callRepeatIntervalSec ?? 0,
                    queueHideSec:          data.queueHideSec          ?? 0,
                    callDisplaySec:        data.callDisplaySec        ?? 15,
                    logoBase64:            data.logoBase64            ?? null,
                    showPhotoCarousel:     data.showPhotoCarousel     ?? false,
                    photoDisplaySec:       data.photoDisplaySec       ?? 8,
                    carouselIntervalMin:   data.carouselIntervalMin   ?? 10,
                }
                const vids = data.videos?.length ? data.videos : SEED_VIDEOS
                const photos = data.photos ?? []
                safeSave(LS_SETTINGS, merged)
                safeSave(LS_VIDEOS, vids)
                safeSave(LS_PHOTOS, photos)
                sessionStorage.setItem(SS_UNLOCKED, '1')
                onUnlock(merged)
            } else {
                setError(true)
                setShake(true)
                setPassword('')
                setTimeout(() => { setError(false); setShake(false) }, 1800)
                setTimeout(() => inputRef.current?.focus(), 50)
            }
        } catch {
            setError(true)
            setShake(true)
            setPassword('')
            setTimeout(() => { setError(false); setShake(false) }, 1800)
            setTimeout(() => inputRef.current?.focus(), 50)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center overflow-hidden" style={{ background: '#07070f' }}>
            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                }}
            />

            <div
                className="absolute w-[520px] h-[520px] rounded-full blur-[100px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}
            />

            <div className="relative z-10 flex flex-col items-center w-full max-w-xs px-6 gap-10">
                <div className="flex flex-col items-center gap-5">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-2xl blur-xl" style={{ background: 'rgba(139,92,246,0.2)' }} />
                        <div className="relative w-16 h-16 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-sm">
                            <HiOutlineLockClosed className="w-7 h-7 text-white/40" />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-white/70 tracking-wide">Monitor de Chamadas</p>
                        <p className="text-xs text-white/25 mt-1 tracking-wide">Digite a senha para identificar a clínica</p>
                    </div>
                </div>

                <div className={`w-full space-y-3 transition-transform ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type={showPass ? 'text' : 'password'}
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(false) }}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            placeholder="••••••••"
                            className="w-full rounded-xl px-4 py-3.5 pr-11 text-center text-base tracking-[0.25em] text-white/80 placeholder-white/15 focus:outline-none transition-all"
                            style={{
                                background: error ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                            }}
                        />
                        <button
                            tabIndex={-1}
                            onClick={() => setShowPass(p => !p)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                        >
                            {showPass ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-center text-xs text-red-400/80">Senha incorreta</p>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!password.trim() || loading}
                        className="w-full py-3.5 rounded-xl font-medium text-sm tracking-wide transition-all disabled:opacity-25"
                        style={{ background: 'rgba(139,92,246,0.2)', color: 'rgba(196,181,253,0.9)', border: '1px solid rgba(139,92,246,0.25)' }}
                    >
                        {loading ? '···' : 'Entrar'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%,100% { transform: translateX(0) }
                    20%      { transform: translateX(-8px) }
                    40%      { transform: translateX(8px) }
                    60%      { transform: translateX(-5px) }
                    80%      { transform: translateX(5px) }
                }
            `}</style>
        </div>
    )
}

// ─── Main Monitor ─────────────────────────────────────────────────────────────

export default function MonitorDisplay() {
    const [unlocked, setUnlocked] = useState(false)
    const [fadeIn, setFadeIn] = useState(false)
    const [booting, setBooting] = useState(true)

    const [queue, setQueue] = useState([])
    const [videos, setVideos] = useState(SEED_VIDEOS)
    const [photos, setPhotos] = useState([])
    const [vidIdx, setVidIdx] = useState(0)
    const [cfg, setCfg] = useState({
        clinicName: '', videoDurationMin: 10, volume: 50, theme: 'dark',
        callRepeatIntervalSec: 0, queueHideSec: 0, callDisplaySec: 15,
        showPhotoCarousel: false, photoDisplaySec: 8, carouselIntervalMin: 10,
    })
    const [activeCall, setActiveCall] = useState(null)
    const [lastCall, setLastCall] = useState(null)
    const [callVisible, setCallVisible] = useState(false)
    const [queueVisible, setQueueVisible] = useState(true)
    const [videoExpanded, setVideoExpanded] = useState(false)
    const [eventQueue, setEventQueue] = useState([])
    const [eventCursor, setEventCursor] = useState(0)

    // Carousel state
    const [carouselActive, setCarouselActive] = useState(false)
    const [carouselPhotoIdx, setCarouselPhotoIdx] = useState(0)
    const [carouselFade, setCarouselFade] = useState(true)

    const dismissRef = useRef(null)
    const expandRef = useRef(null)
    const repeatRef = useRef(null)
    const eventDoneRef = useRef(null)
    const currentEventRef = useRef(null)
    const lastCallRef = useRef(null)
    const cfgRef = useRef(cfg)
    cfgRef.current = cfg
    const photosRef = useRef(photos)
    photosRef.current = photos
    const callVisibleRef = useRef(false)
    callVisibleRef.current = callVisible
    const carouselActiveRef = useRef(false)
    carouselActiveRef.current = carouselActive
    const bootedRef = useRef(false)
    const carouselSequenceRef = useRef(null)
    const eventSchedulerRef = useRef(null)
    const adsSchedulerRef = useRef(null)

    const [time, setTime] = useState(new Date())
    const iframeRef = useRef(null)

    const companyPublicId = useAppSelector(state => state.auth.user.companyPublicId)
    const { search } = useLocation()

    const resolvedCid = useMemo(() => {
        const fromUrl = new URLSearchParams(search).get('cid')
        if (fromUrl) return fromUrl
        if (companyPublicId) return companyPublicId
        return localStorage.getItem(LS_COMPANY) || ''
    }, [search, companyPublicId])

    useEffect(() => {
        if (resolvedCid) localStorage.setItem(LS_COMPANY, resolvedCid)
    }, [resolvedCid])

    // ── Volume via YouTube IFrame API ──────────────────────────────────────────
    useEffect(() => {
        if (!unlocked) return
        const volume = cfg.volume ?? 50
        const send = () => {
            const win = iframeRef.current?.contentWindow
            if (!win) return
            if (volume === 0) {
                win.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*')
            } else {
                win.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*')
                win.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [volume] }), '*')
            }
        }
        const t = setTimeout(send, 1200)
        return () => clearTimeout(t)
    }, [cfg.volume, unlocked, vidIdx])

    // ── Boot ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (bootedRef.current) return
        bootedRef.current = true

        const applySettings = (data) => {
            const merged = {
                clinicName:            data.clinicName            ?? '',
                theme:                 data.theme                 ?? 'dark',
                volume:                data.volume                ?? 50,
                videoDurationMin:      data.videoDurationMin      ?? 10,
                callRepeatIntervalSec: data.callRepeatIntervalSec ?? 0,
                queueHideSec:          data.queueHideSec          ?? 0,
                callDisplaySec:        data.callDisplaySec        ?? 15,
                logoBase64:            data.logoBase64            ?? null,
                showPhotoCarousel:     data.showPhotoCarousel     ?? false,
                photoDisplaySec:       data.photoDisplaySec       ?? 8,
                carouselIntervalMin:   data.carouselIntervalMin   ?? 10,
            }
            const vids = data.videos?.length ? data.videos : SEED_VIDEOS
            const ph = data.photos ?? []
            safeSave(LS_SETTINGS, merged)
            safeSave(LS_VIDEOS, vids)
            safeSave(LS_PHOTOS, ph)
            return merged
        }

        if (hasAuthToken()) {
            monitorGetSettings()
                .then(res => {
                    const m = res ? applySettings(res) : JSON.parse(localStorage.getItem(LS_SETTINGS) || 'null')
                    loadConfig(m ?? {})
                })
                .catch(() => loadConfig(JSON.parse(localStorage.getItem(LS_SETTINGS) || 'null') ?? {}))
                .finally(() => setBooting(false))
            return
        }

        const finishPublic = () => {
            if (sessionStorage.getItem(SS_UNLOCKED) === '1') {
                const saved = JSON.parse(localStorage.getItem(LS_SETTINGS) || 'null')
                if (saved) { loadConfig(saved); setBooting(false); return }
                sessionStorage.removeItem(SS_UNLOCKED)
            }
            setBooting(false)
        }

        if (!resolvedCid) { finishPublic(); return }
        monitorGetSettingsPublic(resolvedCid)
            .then(res => { if (res) applySettings(res) })
            .catch(() => {})
            .finally(finishPublic)
    }, [resolvedCid]) // eslint-disable-line react-hooks/exhaustive-deps

    const loadConfig = (saved) => {
        setCfg(saved)
        const v = JSON.parse(localStorage.getItem(LS_VIDEOS) || 'null')
        if (v?.length) setVideos(v)
        const p = JSON.parse(localStorage.getItem(LS_PHOTOS) || '[]')
        setPhotos(p)
        // Descarta fila do boot anterior — monitor sempre abre com vídeo expandido
        setUnlocked(true)
        setTimeout(() => setFadeIn(true), 30)
    }

    const handleUnlock = (saved) => { loadConfig(saved) }

    // ── Carousel logic ─────────────────────────────────────────────────────────

    // stopCarousel — abortable from any context
    const stopCarousel = useCallback(() => {
        if (carouselSequenceRef.current) { clearTimeout(carouselSequenceRef.current); carouselSequenceRef.current = null }
        carouselIdxRef.current = 0
        setCarouselActive(false)
        setCarouselPhotoIdx(0)
        setCarouselFade(true)
    }, [])

    // Índice atual do carrossel em ref — evita closure stale no advance
    const carouselIdxRef = useRef(0)

    const advanceCarouselRef = useRef(null)
    advanceCarouselRef.current = () => {
        const FADE_MS = 400
        const displayMs = Math.max(3000, (cfgRef.current.photoDisplaySec ?? 8) * 1000)
        const nextIdx = carouselIdxRef.current + 1

        if (nextIdx >= photosRef.current.length) {
            setCarouselFade(false)
            setTimeout(() => {
                setCarouselActive(false)
                carouselIdxRef.current = 0
                setCarouselPhotoIdx(0)
                setCarouselFade(true)
            }, FADE_MS)
            return
        }

        carouselIdxRef.current = nextIdx
        setCarouselFade(false)
        setTimeout(() => {
            setCarouselPhotoIdx(nextIdx)
            setCarouselFade(true)
        }, FADE_MS)
        carouselSequenceRef.current = setTimeout(() => advanceCarouselRef.current?.(), displayMs)
    }

    const startCarouselRef = useRef(null)
    startCarouselRef.current = () => {
        if (callVisibleRef.current) return
        if (!photosRef.current.length || !cfgRef.current.showPhotoCarousel) return

        if (carouselSequenceRef.current) { clearTimeout(carouselSequenceRef.current); carouselSequenceRef.current = null }

        const displayMs = Math.max(3000, (cfgRef.current.photoDisplaySec ?? 8) * 1000)

        carouselIdxRef.current = 0
        setCarouselActive(true)
        setCarouselPhotoIdx(0)
        setCarouselFade(true)

        carouselSequenceRef.current = setTimeout(() => advanceCarouselRef.current?.(), displayMs)
    }

    const enqueueEvent = useCallback((event, options = {}) => {
        const { priority = false } = options
        setEventQueue(prev => {
            const queueSnapshot = priority ? [event, ...prev] : [...prev, event]
            const normalized = queueSnapshot.filter((item, idx, arr) => idx === 0 || item.type !== arr[idx - 1].type)
            return normalized
        })
    }, [])

    // Schedulers de eventos vindos das frequencias da API
    useEffect(() => {
        if (!unlocked) return
        if (eventSchedulerRef.current) clearInterval(eventSchedulerRef.current)
        if (adsSchedulerRef.current) clearInterval(adsSchedulerRef.current)

        const historySec = Math.max(5, cfg.queueHideSec ?? 5)
        eventSchedulerRef.current = setInterval(() => {
            enqueueEvent({ type: EVENT_HISTORY_VIDEO })
        }, historySec * 1000)
        enqueueEvent({ type: EVENT_HISTORY_VIDEO })

        if (cfg.showPhotoCarousel && photos.length > 0) {
            const adsMs = Math.max(1, cfg.carouselIntervalMin ?? 10) * 60 * 1000
            adsSchedulerRef.current = setInterval(() => {
                enqueueEvent({ type: EVENT_HISTORY_ADS })
            }, adsMs)
        }

        return () => {
            if (eventSchedulerRef.current) clearInterval(eventSchedulerRef.current)
            if (adsSchedulerRef.current) clearInterval(adsSchedulerRef.current)
        }
    }, [unlocked, cfg.queueHideSec, cfg.showPhotoCarousel, cfg.carouselIntervalMin, photos.length, enqueueEvent])

    const enterIdleVideoMode = useCallback(() => {
        setCallVisible(false)
        setQueueVisible(false)
        setVideoExpanded(true)
        stopCarousel()
    }, [stopCarousel])

    const finishCurrentEvent = useCallback(() => {
        if (eventDoneRef.current) {
            clearTimeout(eventDoneRef.current)
            eventDoneRef.current = null
        }
        currentEventRef.current = null
        setEventCursor(prev => prev + 1)
    }, [])

    const processCallSequence = useCallback((call, runNumber = 1) => {
        const displayMs = Math.max(5, cfgRef.current.callDisplaySec ?? 5) * 1000
        const expandMs = Math.max(displayMs - 500, 0)
        setActiveCall(call)
        setCallVisible(true)
        setQueueVisible(true)
        setVideoExpanded(false)
        stopCarousel()
        playChime()
        if (dismissRef.current) clearTimeout(dismissRef.current)
        if (expandRef.current) clearTimeout(expandRef.current)
        if (repeatRef.current) clearTimeout(repeatRef.current)
        expandRef.current = setTimeout(() => setVideoExpanded(true), expandMs)
        dismissRef.current = setTimeout(() => {
            setCallVisible(false)
            setVideoExpanded(false)
            const interval = Math.max(0, cfgRef.current.callRepeatIntervalSec ?? 0)
            if (runNumber < 2 && interval > 0) {
                repeatRef.current = setTimeout(() => processCallSequence(call, runNumber + 1), interval * 1000)
                return
            }
            finishCurrentEvent()
        }, displayMs)
    }, [finishCurrentEvent, stopCarousel])

    const runEventRef = useRef(null)
    runEventRef.current = (event) => {
        if (!event) return
        currentEventRef.current = event

        if (event.type === EVENT_CALL) {
            processCallSequence(event.payload, 1)
            return
        }

        if (eventDoneRef.current) clearTimeout(eventDoneRef.current)
        setActiveCall(null)
        setCallVisible(false)
        setQueueVisible(true)
        setVideoExpanded(false)

        if (event.type === EVENT_HISTORY_ADS) {
            startCarouselRef.current?.()
            const adsMs = Math.max(6, cfgRef.current.photoDisplaySec ?? 8) * 1000 * Math.max(1, photosRef.current.length || 1)
            eventDoneRef.current = setTimeout(() => {
                stopCarousel()
                finishCurrentEvent()
            }, adsMs)
            return
        }

        stopCarousel()
        const historyMs = 5000
        eventDoneRef.current = setTimeout(() => finishCurrentEvent(), historyMs)
    }

    useEffect(() => {
        if (!unlocked) return
        if (currentEventRef.current || !eventQueue.length) return
        const [next, ...rest] = eventQueue
        setEventQueue(rest)
        runEventRef.current?.(next)
    }, [eventQueue, unlocked, eventCursor])

    useEffect(() => {
        if (!unlocked) return
        if (currentEventRef.current) return
        if (eventQueue.length > 0) return
        enterIdleVideoMode()
    }, [unlocked, eventQueue, eventCursor, enterIdleVideoMode])

    const handleIncomingCall = useCallback((patientName, room) => {
        const call = { patientName, room, ts: Date.now() }
        lastCallRef.current = call
        setLastCall(call)
        setQueue(prev => {
            const q = [call, ...prev].slice(0, 5)
            localStorage.setItem(LS_QUEUE, JSON.stringify(q))
            return q
        })

        if (dismissRef.current) clearTimeout(dismissRef.current)
        if (expandRef.current) clearTimeout(expandRef.current)
        if (repeatRef.current) clearTimeout(repeatRef.current)
        if (eventDoneRef.current) clearTimeout(eventDoneRef.current)
        stopCarousel()

        finishCurrentEvent()
        enqueueEvent({ type: EVENT_CALL, payload: call }, { priority: true })
    }, [enqueueEvent, finishCurrentEvent, stopCarousel])

    const handleRemoteSettings = useCallback((data) => {
        if (!data) return
        const merged = {
            clinicName:            data.clinicName            ?? '',
            theme:                 data.theme                 ?? 'dark',
            volume:                data.volume                ?? 50,
            videoDurationMin:      data.videoDurationMin      ?? 10,
            callRepeatIntervalSec: data.callRepeatIntervalSec ?? 0,
            queueHideSec:          data.queueHideSec          ?? 0,
            callDisplaySec:        data.callDisplaySec        ?? 15,
            logoBase64:            data.logoBase64            ?? null,
            showPhotoCarousel:     data.showPhotoCarousel     ?? false,
            photoDisplaySec:       data.photoDisplaySec       ?? 8,
            carouselIntervalMin:   data.carouselIntervalMin   ?? 10,
        }
        setCfg(merged)
        safeSave(LS_SETTINGS, merged)
        if (data.videos?.length) {
            setVideos(data.videos)
            setVidIdx(0)
            safeSave(LS_VIDEOS, data.videos)
        }
        if (data.photos !== undefined) {
            const ph = data.photos ?? []
            setPhotos(ph)
            safeSave(LS_PHOTOS, ph)
        }
    }, [])

    // SignalR
    useMonitorSignalR({
        companyPublicId: resolvedCid,
        onCallPatient: handleIncomingCall,
        onUpdateSettings: handleRemoteSettings,
        enabled: unlocked,
    })

    // BroadcastChannel
    useEffect(() => {
        if (!unlocked) return
        const bc = new BroadcastChannel(CHANNEL)
        bc.onmessage = ({ data }) => {
            if (data.type === 'CALL_PATIENT') handleIncomingCall(data.payload.patientName, data.payload.room)
            if (data.type === 'UPDATE_VIDEOS') { setVideos(data.payload); setVidIdx(0); safeSave(LS_VIDEOS, data.payload) }
            if (data.type === 'UPDATE_PHOTOS') { setPhotos(data.payload); safeSave(LS_PHOTOS, data.payload) }
            if (data.type === 'UPDATE_SETTINGS') {
                const s = data.payload
                setCfg(s)
                if (s.photos !== undefined) { setPhotos(s.photos ?? []); safeSave(LS_PHOTOS, s.photos ?? []) }
            }
            if (data.type === 'CLEAR_QUEUE') {
                setQueue([]); setActiveCall(null); setLastCall(null); lastCallRef.current = null
                setEventQueue([])
                setCallVisible(false); setQueueVisible(false); setVideoExpanded(true)
                if (repeatRef.current) clearTimeout(repeatRef.current)
                if (dismissRef.current) clearTimeout(dismissRef.current)
                if (expandRef.current) clearTimeout(expandRef.current)
                if (eventDoneRef.current) clearTimeout(eventDoneRef.current)
                stopCarousel()
                finishCurrentEvent()
                localStorage.removeItem(LS_QUEUE)
            }
        }
        return () => {
            bc.close()
            if (dismissRef.current) clearTimeout(dismissRef.current)
            if (expandRef.current) clearTimeout(expandRef.current)
            if (repeatRef.current) clearTimeout(repeatRef.current)
            if (eventDoneRef.current) clearTimeout(eventDoneRef.current)
            if (carouselSequenceRef.current) clearTimeout(carouselSequenceRef.current)
            if (eventSchedulerRef.current) clearInterval(eventSchedulerRef.current)
            if (adsSchedulerRef.current) clearInterval(adsSchedulerRef.current)
        }
    }, [unlocked, handleIncomingCall, finishCurrentEvent, stopCarousel])

    // Video cycling
    useEffect(() => {
        if (!unlocked || videos.length < 2) return
        const ms = (cfg.videoDurationMin || 10) * 60 * 1000
        const t = setInterval(() => setVidIdx(i => (i + 1) % videos.length), ms)
        return () => clearInterval(t)
    }, [videos, cfg.videoDurationMin, unlocked])

    // Clock
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(t)
    }, [])

    // Autoplay policy unlock on first interaction
    useEffect(() => {
        const unlock = () => {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext
                if (!AudioCtx) return
                const ctx = new AudioCtx()
                ctx.resume().then(() => {
                    const buf = ctx.createBuffer(1, 1, 22050)
                    const src = ctx.createBufferSource()
                    src.buffer = buf; src.connect(ctx.destination); src.start(0)
                    setTimeout(() => ctx.close().catch(() => {}), 300)
                }).catch(() => {})
            } catch {}
            document.removeEventListener('click', unlock)
            document.removeEventListener('touchstart', unlock)
            document.removeEventListener('keydown', unlock)
        }
        document.addEventListener('click', unlock)
        document.addEventListener('touchstart', unlock)
        document.addEventListener('keydown', unlock)
        return () => {
            document.removeEventListener('click', unlock)
            document.removeEventListener('touchstart', unlock)
            document.removeEventListener('keydown', unlock)
        }
    }, [])

    if (booting) return (
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#07070f' }}>
            <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
        </div>
    )

    if (!unlocked) return <MonitorLockScreen onUnlock={handleUnlock} companyPublicId={resolvedCid} />

    const t = THEMES.find(th => th.id === cfg.theme) ?? THEMES[0]

    const nameSize = (name = '') => {
        const l = name.length
        if (l <= 14) return '5.5rem'
        if (l <= 20) return '4.2rem'
        if (l <= 28) return '3.2rem'
        if (l <= 38) return '2.4rem'
        return '1.8rem'
    }
    const vid = videos[vidIdx]
    const videoId = ytId(vid?.url)

    const carouselShowing = carouselActive && photos.length > 0 && !callVisible
    const hasLeftContent = (callVisible && activeCall) || (queueVisible && queue.length > 0) || carouselShowing
    const effectiveExpanded = videoExpanded || !hasLeftContent

    return (
        <div
            className="fixed inset-0 flex flex-col overflow-hidden select-none transition-colors duration-700"
            style={{ background: t.bg, color: t.textPrimary, opacity: fadeIn ? 1 : 0, transition: 'opacity 0.6s ease, background-color 0.7s' }}
        >
            {callVisible && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div
                        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]"
                        style={{ background: t.glow }}
                    />
                </div>
            )}

            {/* Top bar */}
            <div
                className="relative z-10 flex items-center justify-between px-12 py-5 border-b"
                style={{ borderColor: t.topBarBorder }}
            >
                <div className="flex items-center gap-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse shrink-0" />
                    {cfg.logoBase64 && (
                        <div
                            className="h-10 px-3 py-1.5 rounded-xl flex items-center"
                            style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}
                        >
                            <img
                                src={cfg.logoBase64}
                                alt="logo"
                                className="h-full w-auto max-w-[160px] object-contain"
                                style={{ filter: t.id === 'light' ? 'none' : 'brightness(0) invert(1) opacity(0.85)' }}
                            />
                        </div>
                    )}
                    {cfg.clinicName && (
                        <span className="text-xl font-semibold tracking-wide" style={{ color: t.textSecondary }}>
                            {cfg.clinicName}
                        </span>
                    )}
                </div>
                <div
                    className="font-mono text-[2.8rem] font-extralight tracking-[0.1em] leading-none"
                    style={{ color: t.textVeryMuted }}
                >
                    {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
            </div>

            {/* Body */}
            <div className="relative z-10 flex flex-1 overflow-hidden">

                {/* Painel esquerdo */}
                <div
                    className="flex flex-col overflow-hidden"
                    style={{
                        flex: effectiveExpanded ? '0 0 0%' : '1 1 0%',
                        opacity: effectiveExpanded ? 0 : 1,
                        transition: 'flex 1.4s cubic-bezier(0.4,0,0.2,1), opacity 0.8s ease',
                    }}
                >
                    <div className="flex flex-col flex-1 gap-8 overflow-hidden">

                        {/* Chamada ativa — prioridade máxima */}
                        {callVisible && activeCall && (
                            <div className="flex-1 flex items-center justify-center px-14 py-10">
                                <div className="text-center w-full max-w-2xl">
                                    <div
                                        className="inline-flex items-center gap-2.5 rounded-full px-6 py-2 mb-10 border"
                                        style={{ background: t.accentDim, borderColor: t.accentBorder }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: t.accent }} />
                                        <span className="text-[11px] uppercase tracking-[0.35em] font-medium" style={{ color: t.accent }}>
                                            Chamando agora
                                        </span>
                                    </div>
                                    <p
                                        className="font-bold leading-[1.05] mb-10 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis w-full"
                                        style={{ fontSize: nameSize(activeCall.patientName), color: t.textPrimary }}
                                    >
                                        {activeCall.patientName}
                                    </p>
                                    <div className="inline-flex items-center gap-5 rounded-2xl px-8 py-4 backdrop-blur-sm border"
                                        style={{
                                            background: `linear-gradient(135deg, ${t.accentDim} 0%, rgba(0,0,0,0) 100%)`,
                                            borderColor: t.accentBorder,
                                            boxShadow: `0 0 40px ${t.glow}, inset 0 1px 0 ${t.accentBorder}`,
                                        }}
                                    >
                                        <span className="text-[16px] uppercase tracking-[0.45em] font-medium shrink-0" style={{ color: t.accentLabel }}>
                                            Sala
                                        </span>
                                        <span className="w-px self-stretch" style={{ background: t.accentBorder }} />
                                        <span className="text-5xl font-bold tracking-widest leading-none" style={{ color: t.accent }}>
                                            {activeCall.room}
                                        </span>
                                    </div>
                                    <p className="mt-9 text-sm tracking-[0.2em] uppercase" style={{ color: t.textVeryMuted }}>
                                        Por favor, dirija-se à sala indicada
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Histórico de chamadas — visível em idle e durante o carrossel */}
                        {!callVisible && (queueVisible || carouselShowing) && queue.length > 0 && (
                            <div className="px-10 py-10">
                                <p className="text-[9px] uppercase tracking-[0.3em] mb-3 pl-0.5" style={{ color: t.textMuted }}>
                                    Chamadas anteriores
                                </p>
                                <div className="space-y-1.5">
                                    {queue.map((c, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-xl px-4 py-2.5 border text-[12px]"
                                            style={{ background: t.queueBg, borderColor: t.queueBorder }}
                                        >
                                            <span className="text-sm" style={{ color: t.textSecondary }}>{c.patientName}</span>
                                            <span
                                                className="text-xs font-semibold w-24 h-7 flex items-center justify-center rounded-lg shrink-0"
                                                style={{ color: t.textSecondary, background: t.queueBorder }}
                                            >
                                                {c.room}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!callVisible && <div className="flex-1" />}
                    </div>
                </div>

                {/* Divisor */}
                <div
                    className="my-10 shrink-0 transition-all duration-700"
                    style={{
                        width: effectiveExpanded ? '0px' : '1px',
                        background: t.divider,
                        opacity: effectiveExpanded ? 0 : 1,
                    }}
                />

                {/* Painel direito — vídeo (sempre montado) + carrossel sobreposto */}
                <div
                    className="flex flex-col shrink-0"
                    style={{
                        width: effectiveExpanded ? '100%' : carouselShowing ? '70%' : '43%',
                        padding: effectiveExpanded ? '0' : '1.5rem',
                        transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1), padding 1.4s cubic-bezier(0.4,0,0.2,1)',
                    }}
                >
                    {/* Banner compacto da chamada — persiste no rodapé enquanto o vídeo estiver expandido */}
                    {effectiveExpanded && lastCall && (
                        <div
                            className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-12 py-5"
                            style={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 65%, transparent 100%)',
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{
                                        background: callVisible ? t.accent : 'rgba(255,255,255,0.4)',
                                        boxShadow: callVisible ? `0 0 10px ${t.accent}` : 'none',
                                        animation: callVisible ? 'pulse 1.5s infinite' : 'none',
                                    }}
                                />
                                <div className="flex items-baseline gap-3">
                                    <span className="text-xl font-bold tracking-wide" style={{ color: '#ffffff' }}>{lastCall.patientName}</span>
                                    {!callVisible && (
                                        <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.35)' }}>último chamado</span>
                                    )}
                                </div>
                            </div>
                            <div
                                className="flex items-center gap-3 rounded-2xl px-7 py-3 border"
                                style={{
                                    background: callVisible ? t.accentDim : 'rgba(255,255,255,0.07)',
                                    borderColor: callVisible ? t.accentBorder : 'rgba(255,255,255,0.15)',
                                }}
                            >
                                <span className="text-[10px] uppercase tracking-[0.35em] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Sala</span>
                                <span className="text-2xl font-bold" style={{ color: callVisible ? t.accent : '#ffffff' }}>{lastCall.room}</span>
                            </div>
                        </div>
                    )}

                    <div
                        className="relative overflow-hidden shadow-2xl shadow-black/40"
                        style={{
                            flex: 1,
                            borderRadius: effectiveExpanded ? '0' : '1rem',
                            background: t.panelBg,
                            transition: 'border-radius 1.4s cubic-bezier(0.4,0,0.2,1)',   
                        }}
                    >
                        {/* Iframe sempre montado — música não para durante o carrossel */}
                        {videoId ? (
                            <iframe
                                ref={iframeRef}
                                key={videoId}
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&enablejsapi=1`}
                                className="absolute inset-0 w-full h-full"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                style={{
                                    opacity: carouselShowing ? 0 : 1,
                                    pointerEvents: carouselShowing ? 'none' : 'auto',
                                    transition: 'opacity 0.8s ease',
                                }}
                            />
                        ) : (
                            !carouselShowing && (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-sm" style={{ color: t.textVeryMuted }}>Nenhum vídeo configurado</p>
                                </div>
                            )
                        )}

                        {/* Carrossel sobreposto — iframe invisível mas tocando */}
                        {carouselShowing && photos[carouselPhotoIdx] && (
                            <div className="absolute inset-0 z-10">
                                <CarouselSlide
                                    photo={photos[carouselPhotoIdx]}
                                    fade={carouselFade}
                                    total={photos.length}
                                    current={carouselPhotoIdx}
                                    theme={t}
                                />
                            </div>
                        )}

                        {videos.length > 1 && !carouselShowing && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {videos.map((_, i) => (
                                    <button key={i} onClick={() => setVidIdx(i)} className="rounded-full transition-all duration-500"
                                        style={{ width: i === vidIdx ? '20px' : '6px', height: '6px', background: i === vidIdx ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {vid?.title && !effectiveExpanded && !carouselShowing && (
                        <p className="text-center text-xs mt-3 truncate px-2" style={{ color: t.textVeryMuted }}>{vid.title}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
