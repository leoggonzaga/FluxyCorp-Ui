import { useState, useRef, useCallback } from 'react'
import { Dialog, Button, Select } from '@/components/ui'
import {
    HiOutlinePrinter,
    HiOutlineX,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineDocumentText,
    HiOutlineCheck,
} from 'react-icons/hi'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

const today = () => {
    const d = new Date()
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

const contractNumber = (id) => `CTR-${String(id).padStart(5, '0')}`

// ─── Catálogo de procedimentos (mock) ──────────────────────────────��──────────
export const PROCEDURES = [
    { id: 'rest_resina',   label: 'Restauração (Resina)',        value: 350  },
    { id: 'rest_amalgama', label: 'Restauração (Amálgama)',      value: 220  },
    { id: 'extracao',      label: 'Extração Simples',            value: 280  },
    { id: 'extracao_cir',  label: 'Extração Cirúrgica',          value: 680  },
    { id: 'canal',         label: 'Tratamento de Canal',         value: 1200 },
    { id: 'implante',      label: 'Implante Osseointegrado',     value: 3800 },
    { id: 'coroa_porc',    label: 'Coroa de Porcelana',          value: 1600 },
    { id: 'protese_tot',   label: 'Prótese Total Removível',     value: 2800 },
    { id: 'clareamento',   label: 'Clareamento a Laser',         value: 1200 },
    { id: 'faceta',        label: 'Faceta de Porcelana',         value: 1400 },
    { id: 'ortodontia',    label: 'Aparelho Autoligado',         value: 3200 },
    { id: 'profilaxia',    label: 'Limpeza / Profilaxia',        value: 180  },
    { id: 'gengivoplast',  label: 'Gengivoplastia',              value: 900  },
    { id: 'enxerto',       label: 'Enxerto Ósseo',               value: 2200 },
]

const PROC_OPTS = PROCEDURES.map((p) => ({ value: p.id, label: `${p.label} — ${fmt(p.value)}` }))

// ─── Estrutura dos dentes FDI ─────────────────────────────────────────────────
//  Quadrante 1: 18→11 (sup. dir.)   Quadrante 2: 21→28 (sup. esq.)
//  Quadrante 4: 48→41 (inf. dir.)   Quadrante 3: 31→38 (inf. esq.)
const UPPER_ROW = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_ROW = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

const TOOTH_TYPES = {
    // incisivos/caninos
    11: 'ic', 12: 'il', 13: 'c', 21: 'ic', 22: 'il', 23: 'c',
    31: 'ic', 32: 'il', 33: 'c', 41: 'ic', 42: 'il', 43: 'c',
    // pré-molares
    14: 'pm', 15: 'pm', 24: 'pm', 25: 'pm',
    34: 'pm', 35: 'pm', 44: 'pm', 45: 'pm',
    // molares / sisos
    16: 'm', 17: 'm', 18: 's',
    26: 'm', 27: 'm', 28: 's',
    36: 'm', 37: 'm', 38: 's',
    46: 'm', 47: 'm', 48: 's',
}

const TOOTH_W = { ic: 24, il: 22, c: 22, pm: 22, m: 28, s: 26 }
const toothW = (n) => TOOTH_W[TOOTH_TYPES[n]] ?? 24

// ─── Dente SVG ────────────────────────────────────────────────────────────────
const ToothSVG = ({ number, upper, selected, procedure, onClick }) => {
    const w = toothW(number)
    const h = upper ? 38 : 38
    const proc = procedure ? PROCEDURES.find((p) => p.id === procedure) : null
    const color = selected
        ? (proc ? '#f97316' : '#6366f1')
        : '#e2e8f0'
    const textColor = selected ? '#fff' : '#64748b'

    return (
        <button
            onClick={() => onClick(number)}
            title={`Dente ${number}${proc ? ` — ${proc.label}` : ''}`}
            className='flex flex-col items-center group focus:outline-none'
            style={{ width: w + 6 }}
        >
            {upper && (
                <span className='text-[9px] text-gray-400 mb-0.5 leading-none group-hover:text-indigo-400 transition-colors'>
                    {number}
                </span>
            )}
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
                {/* raiz */}
                {upper ? (
                    <path
                        d={`M${w * 0.3} ${h * 0.55} Q${w * 0.3} ${h} ${w * 0.5} ${h} Q${w * 0.7} ${h} ${w * 0.7} ${h * 0.55}`}
                        fill='none'
                        stroke={selected ? color : '#cbd5e1'}
                        strokeWidth='1.5'
                    />
                ) : (
                    <path
                        d={`M${w * 0.3} ${h * 0.45} Q${w * 0.3} 0 ${w * 0.5} 0 Q${w * 0.7} 0 ${w * 0.7} ${h * 0.45}`}
                        fill='none'
                        stroke={selected ? color : '#cbd5e1'}
                        strokeWidth='1.5'
                    />
                )}
                {/* coroa */}
                <rect
                    x='2' y={upper ? 2 : h * 0.5}
                    width={w - 4} height={h * 0.48}
                    rx='4'
                    fill={color}
                    stroke={selected ? color : '#cbd5e1'}
                    strokeWidth='1.5'
                    className='transition-all duration-150 group-hover:opacity-80'
                />
                {/* número inferior */}
                {!upper && (
                    <text
                        x={w / 2} y={h * 0.78}
                        textAnchor='middle'
                        fontSize='8'
                        fill={textColor}
                        fontWeight={selected ? '700' : '400'}
                    >
                        {number}
                    </text>
                )}
                {/* check */}
                {selected && (
                    <text
                        x={w / 2}
                        y={upper ? h * 0.32 : h * 0.76}
                        textAnchor='middle'
                        fontSize='9'
                        fill='#fff'
                        fontWeight='700'
                    >
                        ✓
                    </text>
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

// ─── Odontograma ──────────────────────────────────────────────────────────────
const Odontogram = ({ teeth, onToggle }) => (
    <div className='flex flex-col items-center gap-1 select-none'>
        {/* Superior */}
        <div className='flex items-end gap-0.5'>
            {UPPER_ROW.map((n) => (
                <ToothSVG
                    key={n} number={n} upper
                    selected={!!teeth[n]}
                    procedure={teeth[n]}
                    onClick={onToggle}
                />
            ))}
        </div>

        {/* Divisor */}
        <div className='w-full flex items-center gap-2 my-1'>
            <div className='flex-1 h-px bg-gray-200 dark:bg-gray-600' />
            <span className='text-[10px] text-gray-400 uppercase tracking-widest'>Linha da Gengiva</span>
            <div className='flex-1 h-px bg-gray-200 dark:bg-gray-600' />
        </div>

        {/* Inferior */}
        <div className='flex items-start gap-0.5'>
            {LOWER_ROW.map((n) => (
                <ToothSVG
                    key={n} number={n} upper={false}
                    selected={!!teeth[n]}
                    procedure={teeth[n]}
                    onClick={onToggle}
                />
            ))}
        </div>

        <p className='text-xs text-gray-400 mt-2'>
            Clique em um dente para selecionar · Dentes laranja têm procedimento vinculado
        </p>
    </div>
)

// ─── Conteúdo imprimível ──────────────────────────────────────────────────────
const PrintContent = ({ lead, items, teeth, discount, installments }) => {
    const subtotal = items.reduce((a, i) => a + i.value * i.qty, 0)
    const total    = Math.max(subtotal - (discount || 0), 0)
    const perInstallment = installments > 1 ? total / installments : total
    const markedTeeth = Object.entries(teeth).filter(([, v]) => v)

    return (
        <div id='print-contract' className='font-serif text-black bg-white p-8 text-[13px] leading-relaxed' style={{ position: 'absolute', left: '-9999px', top: 0, width: '21cm' }}>
            {/* Cabeçalho */}
            <div className='flex items-start justify-between border-b-2 border-gray-800 pb-4 mb-6'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight'>CLÍNICA FLUXYCORP</h1>
                    <p className='text-sm text-gray-600'>Odontologia &amp; Saúde Integrada</p>
                </div>
                <div className='text-right'>
                    <p className='text-lg font-bold'>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</p>
                    <p className='text-sm text-gray-500'>{contractNumber(lead.id)}</p>
                    <p className='text-sm text-gray-500'>{today()}</p>
                </div>
            </div>

            {/* Dados do paciente */}
            <section className='mb-6'>
                <h2 className='text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3'>
                    I — Dados do Paciente
                </h2>
                <div className='grid grid-cols-2 gap-x-8 gap-y-1'>
                    <p><strong>Nome:</strong> {lead.patient}</p>
                    <p><strong>Responsável pelo atendimento:</strong> {lead.receivedByName || '—'}</p>
                    <p><strong>Responsável pelo orçamento:</strong> {lead.quotedByName || '—'}</p>
                    <p><strong>Data de abertura:</strong> {lead.createdAt?.split('-').reverse().join('/') || '—'}</p>
                </div>
            </section>

            {/* Odontograma */}
            {markedTeeth.length > 0 && (
                <section className='mb-6'>
                    <h2 className='text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3'>
                        II — Odontograma
                    </h2>
                    <div className='grid grid-cols-4 gap-1'>
                        {markedTeeth.map(([tooth, procId]) => {
                            const p = PROCEDURES.find((x) => x.id === procId)
                            return (
                                <p key={tooth} className='text-xs'>
                                    Dente <strong>{tooth}</strong>: {p?.label ?? '—'}
                                </p>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Procedimentos */}
            <section className='mb-6'>
                <h2 className='text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3'>
                    III — Procedimentos
                </h2>
                <table className='w-full text-sm'>
                    <thead>
                        <tr className='border-b border-gray-300'>
                            <th className='text-left py-1'>Procedimento</th>
                            <th className='text-center py-1 w-16'>Qtd.</th>
                            <th className='text-right py-1 w-28'>Unit.</th>
                            <th className='text-right py-1 w-28'>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} className='border-b border-gray-100'>
                                <td className='py-1'>{item.label}</td>
                                <td className='py-1 text-center'>{item.qty}</td>
                                <td className='py-1 text-right'>{fmt(item.value)}</td>
                                <td className='py-1 text-right'>{fmt(item.value * item.qty)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Valores */}
            <section className='mb-8'>
                <h2 className='text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3'>
                    IV — Valores
                </h2>
                <div className='flex justify-end'>
                    <div className='w-64 space-y-1 text-sm'>
                        <div className='flex justify-between'><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                        {discount > 0 && <div className='flex justify-between text-green-700'><span>Desconto</span><span>− {fmt(discount)}</span></div>}
                        <div className='flex justify-between font-bold text-base border-t border-gray-300 pt-1'>
                            <span>Total</span><span>{fmt(total)}</span>
                        </div>
                        {installments > 1 && (
                            <div className='flex justify-between text-gray-500'>
                                <span>Parcelamento</span>
                                <span>{installments}× de {fmt(perInstallment)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Assinaturas */}
            <section className='mt-12'>
                <div className='grid grid-cols-2 gap-16'>
                    <div className='text-center'>
                        <div className='border-t border-gray-800 pt-2'>
                            <p className='font-semibold'>{lead.patient}</p>
                            <p className='text-xs text-gray-500'>Paciente / Responsável</p>
                        </div>
                    </div>
                    <div className='text-center'>
                        <div className='border-t border-gray-800 pt-2'>
                            <p className='font-semibold'>Clínica FluxyCorp</p>
                            <p className='text-xs text-gray-500'>Responsável Técnico</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

// ─── Modal principal ──────────────────────────────────────────────────────────
const ContractModal = ({ isOpen, onClose, lead }) => {
    const [activeTab, setActiveTab]       = useState('procedures')
    const [items, setItems]               = useState([])
    const [teeth, setTeeth]               = useState({})          // { toothNumber: procedureId }
    const [pendingTooth, setPendingTooth] = useState(null)        // dente aguardando proc
    const [discount, setDiscount]         = useState('')
    const [installments, setInstallments] = useState(1)

    const subtotal = items.reduce((a, i) => a + i.value * i.qty, 0)
    const total    = Math.max(subtotal - (Number(discount) || 0), 0)
    const perInstallment = installments > 1 ? total / installments : total

    // ── Odontograma: clique no dente ──────────────────────────────────────────
    const handleToothClick = useCallback((number) => {
        if (teeth[number]) {
            // já tem procedimento: remove
            setTeeth((prev) => { const n = { ...prev }; delete n[number]; return n })
        } else {
            // abre seletor de procedimento
            setPendingTooth(number)
        }
    }, [teeth])

    const assignProcedure = (toothNumber, procId) => {
        setTeeth((prev) => ({ ...prev, [toothNumber]: procId }))
        const proc = PROCEDURES.find((p) => p.id === procId)
        if (proc) addItem(proc)
        setPendingTooth(null)
    }

    // ── Procedimentos ─────────────────────────────────────────────────────────
    const addItem = (proc) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === proc.id)
            if (existing) return prev.map((i) => i.id === proc.id ? { ...i, qty: i.qty + 1 } : i)
            return [...prev, { ...proc, qty: 1 }]
        })
    }

    const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

    const changeQty = (id, delta) => {
        setItems((prev) =>
            prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
        )
    }

    // ── Impressão ─────────────────────────────────────────────────────────────
    const handlePrint = () => window.print()

    if (!lead) return null

    const tabs = [
        { id: 'procedures', label: 'Procedimentos' },
        { id: 'odontogram', label: 'Odontograma'   },
        { id: 'financial',  label: 'Financeiro'    },
        { id: 'preview',    label: 'Contrato'      },
    ]

    const enrichedLead = {
        ...lead,
        receivedByName: lead.receivedByName,
        quotedByName:   lead.quotedByName,
    }

    return (
        <>
            {/* Print-only content */}
            <PrintContent
                lead={enrichedLead}
                items={items}
                teeth={teeth}
                discount={Number(discount) || 0}
                installments={installments}
            />

            <Dialog
                isOpen={isOpen}
                onClose={onClose}
                onRequestClose={onClose}
                width={860}
                className='print:hidden'
            >
                {/* ── Cabeçalho ────────────────────────────────���────────────── */}
                <div className='flex items-start justify-between mb-5'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0'>
                            <HiOutlineDocumentText className='text-indigo-500 text-xl' />
                        </div>
                        <div>
                            <h4 className='text-base font-bold text-gray-800 dark:text-gray-100 leading-tight'>
                                Contrato — {lead.patient}
                            </h4>
                            <p className='text-xs text-gray-400 mt-0.5'>
                                {contractNumber(lead.id)} · {today()}
                            </p>
                        </div>
                    </div>
                    <Button
                        size='sm'
                        variant='solid'
                        icon={<HiOutlinePrinter />}
                        onClick={handlePrint}
                    >
                        Imprimir
                    </Button>
                </div>

                {/* ── Tabs ──────────────────────────────────────────────────── */}
                <div className='flex gap-1 border-b border-gray-100 dark:border-gray-700 mb-5'>
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                                activeTab === t.id
                                    ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {t.label}
                            {t.id === 'procedures' && items.length > 0 && (
                                <span className='ml-1.5 text-xs bg-indigo-100 text-indigo-600 rounded-full px-1.5 py-0.5'>
                                    {items.reduce((a, i) => a + i.qty, 0)}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Tab: Procedimentos ────────────────────────────────���───── */}
                {activeTab === 'procedures' && (
                    <div className='space-y-4'>
                        {/* Dados do paciente */}
                        <div className='rounded-xl bg-indigo-50/60 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 p-4 grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm'>
                            <div>
                                <span className='text-xs text-gray-400 block'>Paciente</span>
                                <span className='font-semibold text-gray-800 dark:text-gray-100'>{lead.patient}</span>
                            </div>
                            <div>
                                <span className='text-xs text-gray-400 block'>Serviço descrito</span>
                                <span className='text-gray-700 dark:text-gray-300'>{lead.description || '—'}</span>
                            </div>
                            <div>
                                <span className='text-xs text-gray-400 block'>Recebeu o prospect</span>
                                <span className='text-gray-700 dark:text-gray-300'>{lead.receivedByName || '—'}</span>
                            </div>
                            <div>
                                <span className='text-xs text-gray-400 block'>Responsável pelo orçamento</span>
                                <span className='text-gray-700 dark:text-gray-300'>{lead.quotedByName || '—'}</span>
                            </div>
                        </div>

                        {/* Adicionar procedimento */}
                        <div className='flex gap-3 items-end'>
                            <div className='flex-1'>
                                <p className='text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide'>
                                    Adicionar Procedimento
                                </p>
                                <Select
                                    placeholder='Selecione um procedimento…'
                                    options={PROC_OPTS}
                                    value={null}
                                    onChange={(opt) => {
                                        if (opt) addItem(PROCEDURES.find((p) => p.id === opt.value))
                                    }}
                                />
                            </div>
                        </div>

                        {/* Lista de procedimentos */}
                        {items.length === 0 ? (
                            <div className='flex flex-col items-center justify-center py-10 text-gray-300 dark:text-gray-600'>
                                <HiOutlineDocumentText className='text-4xl mb-2' />
                                <p className='text-sm'>Nenhum procedimento adicionado</p>
                            </div>
                        ) : (
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr className='border-b border-gray-100 dark:border-gray-700'>
                                        <th className='text-left text-xs font-semibold text-gray-400 uppercase pb-2'>Procedimento</th>
                                        <th className='text-center text-xs font-semibold text-gray-400 uppercase pb-2 w-28'>Qtd.</th>
                                        <th className='text-right text-xs font-semibold text-gray-400 uppercase pb-2 w-28'>Unitário</th>
                                        <th className='text-right text-xs font-semibold text-gray-400 uppercase pb-2 w-28'>Subtotal</th>
                                        <th className='w-8' />
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className='border-b border-gray-50 dark:border-gray-700/40'>
                                            <td className='py-2.5 font-medium text-gray-800 dark:text-gray-100'>
                                                {item.label}
                                            </td>
                                            <td className='py-2.5'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <button
                                                        onClick={() => changeQty(item.id, -1)}
                                                        className='w-6 h-6 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-100 text-xs font-bold'
                                                    >−</button>
                                                    <span className='w-6 text-center font-semibold'>{item.qty}</span>
                                                    <button
                                                        onClick={() => changeQty(item.id, +1)}
                                                        className='w-6 h-6 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-100 text-xs font-bold'
                                                    >+</button>
                                                </div>
                                            </td>
                                            <td className='py-2.5 text-right text-gray-600 dark:text-gray-300'>
                                                {fmt(item.value)}
                                            </td>
                                            <td className='py-2.5 text-right font-semibold text-gray-800 dark:text-gray-100'>
                                                {fmt(item.value * item.qty)}
                                            </td>
                                            <td className='py-2.5 pl-2'>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className='p-1 text-gray-300 hover:text-red-400 transition-colors'
                                                >
                                                    <HiOutlineTrash className='text-sm' />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {items.length > 0 && (
                            <div className='flex justify-end'>
                                <div className='text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-xl px-5 py-2'>
                                    Subtotal: <span className='text-indigo-600 ml-2'>{fmt(subtotal)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab: Odontograma ──────────────────────────────────────── */}
                {activeTab === 'odontogram' && (
                    <div className='space-y-4'>
                        <Odontogram teeth={teeth} onToggle={handleToothClick} />

                        {/* Seletor de procedimento para dente pendente */}
                        {pendingTooth && (
                            <div className='rounded-xl border-2 border-indigo-300 bg-indigo-50/60 dark:bg-indigo-900/10 p-4'>
                                <p className='text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-3'>
                                    Dente <strong>{pendingTooth}</strong> — selecione o procedimento:
                                </p>
                                <div className='flex gap-3 items-center'>
                                    <div className='flex-1'>
                                        <Select
                                            autoFocus
                                            placeholder='Procedimento para este dente…'
                                            options={PROC_OPTS}
                                            onChange={(opt) => {
                                                if (opt) assignProcedure(pendingTooth, opt.value)
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setPendingTooth(null)}
                                        className='p-2 text-gray-400 hover:text-gray-600'
                                    >
                                        <HiOutlineX />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Legenda */}
                        {Object.keys(teeth).length > 0 && (
                            <div className='rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden'>
                                <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2 border-b border-gray-100 dark:border-gray-700'>
                                    Dentes marcados
                                </p>
                                <div className='divide-y divide-gray-50 dark:divide-gray-700/50'>
                                    {Object.entries(teeth).map(([tooth, procId]) => {
                                        const proc = PROCEDURES.find((p) => p.id === procId)
                                        return (
                                            <div key={tooth} className='flex items-center justify-between px-4 py-2 text-sm'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold'>
                                                        {tooth}
                                                    </span>
                                                    <span className='text-gray-700 dark:text-gray-200'>{proc?.label ?? '—'}</span>
                                                </div>
                                                <div className='flex items-center gap-3'>
                                                    <span className='font-semibold text-gray-800 dark:text-gray-100'>{fmt(proc?.value)}</span>
                                                    <button
                                                        onClick={() => {
                                                            setTeeth((prev) => { const n = { ...prev }; delete n[tooth]; return n })
                                                        }}
                                                        className='text-gray-300 hover:text-red-400 transition-colors'
                                                    >
                                                        <HiOutlineTrash className='text-sm' />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab: Financeiro ───────────────────────────────────────── */}
                {activeTab === 'financial' && (
                    <div className='space-y-5 max-w-md mx-auto'>
                        <div className='rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden'>
                            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700'>
                                Resumo
                            </p>
                            <div className='divide-y divide-gray-50 dark:divide-gray-700/50'>
                                {items.map((item) => (
                                    <div key={item.id} className='flex justify-between px-4 py-2 text-sm'>
                                        <span className='text-gray-600 dark:text-gray-300'>{item.label} ×{item.qty}</span>
                                        <span className='font-medium'>{fmt(item.value * item.qty)}</span>
                                    </div>
                                ))}
                                {items.length === 0 && (
                                    <p className='px-4 py-4 text-sm text-gray-300 dark:text-gray-600 text-center'>
                                        Adicione procedimentos na aba anterior
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className='space-y-3'>
                            <div>
                                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5'>
                                    Desconto (R$)
                                </label>
                                <input
                                    type='number'
                                    min='0'
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    placeholder='0,00'
                                    className='w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200'
                                />
                            </div>
                            <div>
                                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5'>
                                    Parcelamento
                                </label>
                                <Select
                                    value={{ value: installments, label: installments === 1 ? 'À vista' : `${installments}× de ${fmt(perInstallment)}` }}
                                    options={[1,2,3,4,6,8,10,12,18,24].map((n) => ({
                                        value: n,
                                        label: n === 1
                                            ? `À vista — ${fmt(total)}`
                                            : `${n}× de ${fmt(total / n)}`,
                                    }))}
                                    onChange={(opt) => setInstallments(opt.value)}
                                />
                            </div>
                        </div>

                        {/* Total */}
                        <div className='rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-5 text-white'>
                            <div className='flex justify-between text-sm mb-1'>
                                <span className='opacity-80'>Subtotal</span>
                                <span>{fmt(subtotal)}</span>
                            </div>
                            {Number(discount) > 0 && (
                                <div className='flex justify-between text-sm mb-1'>
                                    <span className='opacity-80'>Desconto</span>
                                    <span>− {fmt(Number(discount))}</span>
                                </div>
                            )}
                            <div className='flex justify-between font-bold text-xl border-t border-white/30 pt-2 mt-2'>
                                <span>Total</span>
                                <span>{fmt(total)}</span>
                            </div>
                            {installments > 1 && (
                                <p className='text-sm opacity-75 text-right mt-0.5'>
                                    {installments}× de {fmt(perInstallment)}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Tab: Preview do Contrato ───────────────────────────��──── */}
                {activeTab === 'preview' && (
                    <div className='rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30 p-6 space-y-5 text-sm max-h-[55vh] overflow-y-auto font-serif'>
                        {/* Cabeçalho */}
                        <div className='flex justify-between border-b border-gray-300 pb-4'>
                            <div>
                                <p className='text-lg font-bold'>CLÍNICA FLUXYCORP</p>
                                <p className='text-xs text-gray-500'>Odontologia &amp; Saúde Integrada</p>
                            </div>
                            <div className='text-right text-xs text-gray-500'>
                                <p className='font-bold text-base text-gray-700'>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</p>
                                <p>{contractNumber(lead.id)} · {today()}</p>
                            </div>
                        </div>

                        <section>
                            <p className='font-bold uppercase text-xs tracking-widest text-gray-500 mb-2'>I — Dados do Paciente</p>
                            <div className='grid grid-cols-2 gap-x-6 gap-y-1 text-gray-700 dark:text-gray-300'>
                                <p><strong>Nome:</strong> {lead.patient}</p>
                                <p><strong>Recebeu:</strong> {lead.receivedByName || '—'}</p>
                                <p><strong>Orçamento:</strong> {lead.quotedByName || '—'}</p>
                                <p><strong>Abertura:</strong> {lead.createdAt?.split('-').reverse().join('/') || '—'}</p>
                            </div>
                        </section>

                        {Object.keys(teeth).length > 0 && (
                            <section>
                                <p className='font-bold uppercase text-xs tracking-widest text-gray-500 mb-2'>II — Odontograma</p>
                                <div className='grid grid-cols-3 gap-1 text-xs text-gray-700 dark:text-gray-300'>
                                    {Object.entries(teeth).map(([tooth, procId]) => {
                                        const p = PROCEDURES.find((x) => x.id === procId)
                                        return <p key={tooth}>Dente <strong>{tooth}</strong>: {p?.label ?? '—'}</p>
                                    })}
                                </div>
                            </section>
                        )}

                        <section>
                            <p className='font-bold uppercase text-xs tracking-widest text-gray-500 mb-2'>III — Procedimentos</p>
                            {items.length === 0 ? (
                                <p className='text-gray-400 italic'>Nenhum procedimento selecionado.</p>
                            ) : (
                                <table className='w-full text-xs'>
                                    <thead>
                                        <tr className='border-b border-gray-200'>
                                            <th className='text-left py-1'>Procedimento</th>
                                            <th className='text-center py-1 w-12'>Qtd</th>
                                            <th className='text-right py-1 w-24'>Unit.</th>
                                            <th className='text-right py-1 w-24'>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.id} className='border-b border-gray-100'>
                                                <td className='py-1'>{item.label}</td>
                                                <td className='py-1 text-center'>{item.qty}</td>
                                                <td className='py-1 text-right'>{fmt(item.value)}</td>
                                                <td className='py-1 text-right'>{fmt(item.value * item.qty)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </section>

                        <section>
                            <p className='font-bold uppercase text-xs tracking-widest text-gray-500 mb-2'>IV — Valores</p>
                            <div className='flex justify-end'>
                                <div className='w-56 space-y-1 text-xs text-gray-700 dark:text-gray-300'>
                                    <div className='flex justify-between'><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                                    {Number(discount) > 0 && <div className='flex justify-between text-green-600'><span>Desconto</span><span>− {fmt(Number(discount))}</span></div>}
                                    <div className='flex justify-between font-bold text-sm border-t border-gray-300 pt-1'><span>Total</span><span>{fmt(total)}</span></div>
                                    {installments > 1 && <div className='flex justify-between text-gray-500'><span>Parcelas</span><span>{installments}× {fmt(perInstallment)}</span></div>}
                                </div>
                            </div>
                        </section>

                        <section className='pt-6'>
                            <div className='grid grid-cols-2 gap-16 text-center text-xs text-gray-500'>
                                <div className='border-t border-gray-400 pt-1'><p className='font-semibold text-gray-700'>{lead.patient}</p><p>Paciente / Responsável</p></div>
                                <div className='border-t border-gray-400 pt-1'><p className='font-semibold text-gray-700'>Clínica FluxyCorp</p><p>Responsável Técnico</p></div>
                            </div>
                        </section>
                    </div>
                )}

                {/* ── Rodapé ────────────────────────────────────────────────── */}
                <div className='flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700'>
                    <span className='text-xs text-gray-400'>
                        {items.reduce((a, i) => a + i.qty, 0)} procedimento(s) · Total: <strong className='text-indigo-600'>{fmt(total)}</strong>
                    </span>
                    <div className='flex gap-3'>
                        <Button onClick={onClose}>Fechar</Button>
                        <Button
                            variant='solid'
                            icon={<HiOutlinePrinter />}
                            onClick={handlePrint}
                        >
                            Imprimir Contrato
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default ContractModal
