import { useState } from 'react'
import { HiOutlineX, HiOutlinePlus } from 'react-icons/hi'

const UPPER_ROW = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_ROW = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

const TOOTH_TYPES = {
    11: 'ic', 12: 'il', 13: 'c', 21: 'ic', 22: 'il', 23: 'c',
    31: 'ic', 32: 'il', 33: 'c', 41: 'ic', 42: 'il', 43: 'c',
    14: 'pm', 15: 'pm', 24: 'pm', 25: 'pm',
    34: 'pm', 35: 'pm', 44: 'pm', 45: 'pm',
    16: 'm', 17: 'm', 18: 's',
    26: 'm', 27: 'm', 28: 's',
    36: 'm', 37: 'm', 38: 's',
    46: 'm', 47: 'm', 48: 's',
}
const TOOTH_W = { ic: 24, il: 22, c: 22, pm: 22, m: 28, s: 26 }
const toothW = (n) => TOOTH_W[TOOTH_TYPES[n]] ?? 24

const FINDINGS = [
    { id: 'carie',       name: 'Cárie',        color: '#f59e0b' },
    { id: 'restauracao', name: 'Restauração',   color: '#3b82f6' },
    { id: 'canal',       name: 'Canal',         color: '#8b5cf6' },
    { id: 'extracao',    name: 'Extração',      color: '#ef4444' },
    { id: 'implante',    name: 'Implante',      color: '#10b981' },
    { id: 'coroa',       name: 'Coroa',         color: '#f97316' },
    { id: 'clareamento', name: 'Clareamento',   color: '#06b6d4' },
    { id: 'selante',     name: 'Selante',       color: '#a78bfa' },
]

const findingColor = (id) => FINDINGS.find((f) => f.id === id)?.color ?? '#6366f1'

const archScale = (idx, total) => {
    const center = (total - 1) / 2
    const dist = Math.abs(idx - center)
    return 1 - (dist / center) * 0.28
}

// ── Dente SVG ─────────────────────────────────────────────────────────────────
const ToothSVG = ({ number, upper, selected, finding, onClick, scale = 1 }) => {
    const w = toothW(number)
    const h = 38
    const color = selected ? (finding ? findingColor(finding) : '#6366f1') : '#e2e8f0'
    const rootStroke = selected ? color : '#cbd5e1'

    return (
        <button
            onClick={() => onClick(number)}
            title={`Dente ${number}${finding ? ` — ${FINDINGS.find((f) => f.id === finding)?.name}` : ''}`}
            className='flex flex-col items-center group focus:outline-none'
            style={{ width: w + 6 }}
        >
            {upper && (
                <span className='text-[9px] text-gray-400 mb-0.5 leading-none group-hover:text-indigo-400 transition-colors'>
                    {number}
                </span>
            )}
            <svg
                width={w} height={h} viewBox={`0 0 ${w} ${h}`}
                style={{ transform: `scaleY(${scale})`, transformOrigin: upper ? 'bottom' : 'top', display: 'block' }}
            >
                {upper ? (
                    <path d={`M${w*0.3} ${h*0.55} Q${w*0.3} ${h} ${w*0.5} ${h} Q${w*0.7} ${h} ${w*0.7} ${h*0.55}`}
                        fill='none' stroke={rootStroke} strokeWidth='1.5' />
                ) : (
                    <path d={`M${w*0.3} ${h*0.45} Q${w*0.3} 0 ${w*0.5} 0 Q${w*0.7} 0 ${w*0.7} ${h*0.45}`}
                        fill='none' stroke={rootStroke} strokeWidth='1.5' />
                )}
                <rect x='2' y={upper ? 2 : h * 0.5} width={w - 4} height={h * 0.48} rx='4'
                    fill={color} stroke={selected ? color : '#cbd5e1'} strokeWidth='1.5'
                    className='transition-all duration-150 group-hover:opacity-80' />
                {selected && (
                    <text x={w / 2} y={upper ? h * 0.32 : h * 0.76}
                        textAnchor='middle' fontSize='9' fill='#fff' fontWeight='700'>✓</text>
                )}
            </svg>
            {!upper && (
                <span className='text-[9px] text-gray-400 mt-0.5 leading-none group-hover:text-indigo-400 transition-colors'>
                    {number}
                </span>
            )}
        </button>
    )
}

// ── Corpo do odontograma ───────────────────────────────────────────────────────
const OdontogramBody = ({ teeth, onTeethChange, onPendingTooth }) => {
    const markedCount = Object.keys(teeth).length

    const handleClick = (number) => {
        if (teeth[number]) {
            const updated = { ...teeth }
            delete updated[number]
            onTeethChange(updated)
        } else {
            onPendingTooth(number)
        }
    }

    return (
        <div className='flex flex-col items-center gap-1 select-none w-full'>
            <div className='flex items-end gap-0.5'>
                {UPPER_ROW.map((n, i) => (
                    <ToothSVG key={n} number={n} upper selected={!!teeth[n]} finding={teeth[n]}
                        onClick={handleClick} scale={archScale(i, UPPER_ROW.length)} />
                ))}
            </div>

            <div className='w-full flex items-center gap-2 my-1'>
                <div className='flex-1 h-px bg-gray-200 dark:bg-gray-600' />
                <span className='text-[10px] text-gray-400 uppercase tracking-widest whitespace-nowrap'>Linha da Gengiva</span>
                <div className='flex-1 h-px bg-gray-200 dark:bg-gray-600' />
            </div>

            <div className='flex items-start gap-0.5'>
                {LOWER_ROW.map((n, i) => (
                    <ToothSVG key={n} number={n} upper={false} selected={!!teeth[n]} finding={teeth[n]}
                        onClick={handleClick} scale={archScale(i, LOWER_ROW.length)} />
                ))}
            </div>

            <div className='grid grid-cols-4 gap-x-4 gap-y-1.5 mt-3 w-full'>
                {FINDINGS.map((f) => (
                    <div key={f.id} className='flex items-center gap-1.5'>
                        <div className='w-2.5 h-2.5 rounded-sm flex-shrink-0' style={{ backgroundColor: f.color }} />
                        <span className='text-[10px] text-gray-500'>{f.name}</span>
                    </div>
                ))}
            </div>

            {markedCount > 0 && (
                <div className='mt-2 w-full rounded-xl border border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30 p-3'>
                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
                        Dentes marcados ({markedCount})
                    </p>
                    <div className='flex flex-wrap gap-1.5'>
                        {Object.entries(teeth).map(([tooth, findingId]) => {
                            const f = FINDINGS.find((x) => x.id === findingId)
                            return (
                                <span key={tooth}
                                    className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white'
                                    style={{ backgroundColor: f?.color ?? '#6366f1' }}>
                                    #{tooth} · {f?.name}
                                    <button className='ml-0.5 hover:opacity-70 transition leading-none'
                                        onClick={() => {
                                            const updated = { ...teeth }
                                            delete updated[tooth]
                                            onTeethChange(updated)
                                        }}>×</button>
                                </span>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

// ── Modal de dente: achado + procedimento ─────────────────────────────────────
const ToothModal = ({ tooth, onAssign, onClose, procedureCategories = [], onAddProcedure }) => {
    const [selectedCatIdx, setSelectedCatIdx] = useState(0)
    const [added, setAdded] = useState([])

    const handleAddProc = (proc) => {
        onAddProcedure(proc)
        setAdded((prev) => [...prev, proc.id])
    }

    const currentItems = procedureCategories[selectedCatIdx]?.items ?? []

    return (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onClose} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl'>

                {/* Header */}
                <div className='flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700/50'>
                    <div>
                        <p className='text-base font-bold text-gray-800 dark:text-gray-100'>Dente #{tooth}</p>
                        <p className='text-xs text-gray-400 mt-0.5'>Registre o achado e/ou adicione procedimentos ao atendimento</p>
                    </div>
                    <button onClick={onClose}
                        className='p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition'>
                        <HiOutlineX className='w-5 h-5' />
                    </button>
                </div>

                {/* Corpo: 2 colunas */}
                <div className='grid grid-cols-[1fr_1px_1fr] gap-0'>

                    {/* Coluna esquerda: Achado clínico */}
                    <div className='p-5'>
                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3'>
                            Achado clínico
                        </p>
                        <div className='grid grid-cols-2 gap-2'>
                            {FINDINGS.map((f) => (
                                <button key={f.id}
                                    onClick={() => { onAssign(f.id); onClose() }}
                                    className='flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800/60 text-sm font-medium text-gray-700 dark:text-gray-300 transition active:scale-95 text-left'>
                                    <div className='w-3 h-3 rounded flex-shrink-0' style={{ backgroundColor: f.color }} />
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divisor vertical */}
                    <div className='bg-gray-100 dark:bg-gray-700/50 self-stretch' />

                    {/* Coluna direita: Procedimentos */}
                    <div className='p-5 flex flex-col'>
                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3'>
                            Adicionar ao Atendimento
                        </p>

                        {/* Tabs de categoria */}
                        <div className='flex gap-1 flex-wrap mb-3'>
                            {procedureCategories.map((cat, idx) => (
                                <button key={cat.category}
                                    onClick={() => setSelectedCatIdx(idx)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                                        selectedCatIdx === idx
                                            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}>
                                    {cat.category}
                                </button>
                            ))}
                        </div>

                        {/* Lista de procedimentos */}
                        <div className='space-y-1.5 overflow-y-auto max-h-52 pr-0.5'>
                            {currentItems.map((proc) => {
                                const isAdded = added.includes(proc.id)
                                return (
                                    <div key={proc.id}
                                        className='flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/40 hover:border-gray-200 dark:hover:border-gray-600 transition'>
                                        <div className='min-w-0 flex-1'>
                                            <p className='text-sm font-medium text-gray-700 dark:text-gray-300 truncate'>{proc.name}</p>
                                            <p className='text-[11px] text-gray-400 mt-0.5'>{proc.code} · {fmt(proc.value)}</p>
                                        </div>
                                        <button
                                            onClick={() => !isAdded && handleAddProc(proc)}
                                            disabled={isAdded}
                                            className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition active:scale-90 ${
                                                isAdded
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 cursor-default'
                                                    : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50'
                                            }`}>
                                            {isAdded ? '✓' : <HiOutlinePlus className='w-4 h-4' />}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Componente principal ───────────────────────────────────────────────────────
const Odontogram = ({ teeth = {}, onTeethChange, expanded = false, onExpandClose, procedureCategories = [], onAddProcedure }) => {
    const [pendingTooth, setPendingTooth] = useState(null)

    const handleAssign = (findingId) => {
        onTeethChange({ ...teeth, [pendingTooth]: findingId })
        setPendingTooth(null)
    }

    return (
        <>
            <OdontogramBody teeth={teeth} onTeethChange={onTeethChange} onPendingTooth={setPendingTooth} />

            {/* Modal expandido */}
            {expanded && (
                <div className='fixed inset-0 z-50 flex items-center justify-center'>
                    <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onExpandClose} />
                    <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 p-6'>
                        <div className='flex items-center justify-between mb-5'>
                            <div>
                                <p className='text-base font-bold text-gray-800 dark:text-gray-100'>Odontograma</p>
                                <p className='text-xs text-gray-400 mt-0.5'>Clique no dente para registrar achado ou adicionar procedimento</p>
                            </div>
                            <button onClick={onExpandClose}
                                className='p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition'>
                                <HiOutlineX className='w-5 h-5' />
                            </button>
                        </div>
                        <OdontogramBody teeth={teeth} onTeethChange={onTeethChange} onPendingTooth={setPendingTooth} />
                    </div>
                </div>
            )}

            {/* Modal de dente */}
            {pendingTooth && (
                <ToothModal
                    tooth={pendingTooth}
                    onAssign={handleAssign}
                    onClose={() => setPendingTooth(null)}
                    procedureCategories={procedureCategories}
                    onAddProcedure={onAddProcedure}
                />
            )}
        </>
    )
}

export default Odontogram
