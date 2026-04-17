import { useState, useMemo } from 'react'
import {
    HiOutlineCalendar,
    HiOutlineCheck,
    HiOutlineCheckCircle,
    HiOutlineChevronDown,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineClock,
    HiOutlineClipboardList,
    HiOutlineExclamation,
    HiOutlineLockClosed,
    HiOutlineMinus,
    HiOutlinePlus,
    HiOutlineCurrencyDollar,
    HiOutlineRefresh,
    HiOutlineUser,
    HiOutlineX,
    HiOutlineDocumentText,
    HiOutlineArrowUp,
    HiOutlineArrowDown,
} from 'react-icons/hi'

// ─── Configs ──────────────────────────────────────────────────────────────────

const FORMAS = {
    dinheiro:          { label: 'Dinheiro',          accent: '#10b981', pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    pix:               { label: 'PIX',               accent: '#06b6d4', pill: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
    debito:            { label: 'Débito',            accent: '#6366f1', pill: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
    credito_vista:     { label: 'Crédito à Vista',   accent: '#8b5cf6', pill: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
    credito_parcelado: { label: 'Créd. Parcelado',   accent: '#a855f7', pill: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    convenio:          { label: 'Convênio',           accent: '#f59e0b', pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    boleto:            { label: 'Boleto',             accent: '#64748b', pill: 'bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400' },
}

const CATS_SAIDA = {
    material:       'Material Odontológico',
    consumo:        'Material de Consumo',
    servicos:       'Serviços de Terceiros',
    administrativo: 'Despesas Administrativas',
    imposto:        'Impostos e Taxas',
    salario:        'Salários / Pró-labore',
    manutencao:     'Manutenção e Infraestrutura',
    outro:          'Outros',
}

const STATUS_CFG = {
    aberto:  { label: 'Aberto',   pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',     dot: 'bg-amber-400 animate-pulse' },
    fechado: { label: 'Fechado',  pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', dot: 'bg-emerald-500' },
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_BASE = [
    {
        id: 'fc_20260417', date: '2026-04-17', status: 'aberto', responsavel: 'Carla Fernandes', saldoInicial: 300.00,
        entradas: [
            { id: 'e1', horario: '09:15', descricao: 'Consulta Clínica',     paciente: 'João Silva',     profissional: 'Dr. Carlos',  formaPagamento: 'pix',               valor: 280.00 },
            { id: 'e2', horario: '09:45', descricao: 'Limpeza Dental',       paciente: 'Carla Mendes',   profissional: 'Dra. Ana',    formaPagamento: 'debito',            valor: 200.00 },
            { id: 'e3', horario: '10:20', descricao: 'Avaliação Inicial',    paciente: 'Ricardo Bastos', profissional: 'Dr. Bruno',   formaPagamento: 'dinheiro',          valor: 150.00 },
            { id: 'e4', horario: '11:00', descricao: 'Canal Radicular',      paciente: 'Maria Santos',   profissional: 'Dra. Ana',    formaPagamento: 'credito_parcelado', valor: 1200.00 },
            { id: 'e5', horario: '11:30', descricao: 'Extração Simples',     paciente: 'Pedro Oliveira', profissional: 'Dr. Bruno',   formaPagamento: 'convenio',          valor: 180.00 },
            { id: 'e6', horario: '14:00', descricao: 'Profilaxia Dental',    paciente: 'Fernanda Lima',  profissional: 'Dra. Ana',    formaPagamento: 'pix',               valor: 160.00 },
            { id: 'e7', horario: '14:30', descricao: 'Restauração Resina',   paciente: 'Roberto Gomes',  profissional: 'Dr. Carlos',  formaPagamento: 'credito_vista',     valor: 350.00 },
        ],
        saidas: [
            { id: 's1', horario: '08:30', descricao: 'Luvas de procedimento (cx)',   categoria: 'consumo',        formaPagamento: 'dinheiro', valor: 48.00 },
            { id: 's2', horario: '10:00', descricao: 'Resina composta Fotoativada',  categoria: 'material',       formaPagamento: 'pix',      valor: 185.00 },
            { id: 's3', horario: '13:00', descricao: 'Internet e Telefone — Abril',  categoria: 'administrativo', formaPagamento: 'debito',   valor: 320.00 },
        ],
        sangrias:     [{ id: 'sg1', horario: '12:00', valor: 200.00, motivo: 'Depósito bancário rotina', responsavel: 'Carla Fernandes' }],
        suprimentos:  [],
        fechamento:   null,
        // saldo esperado caixa: 300 + 150(dinheiro) - 48(dinheiro) - 200(sangria) = 202
    },
    {
        id: 'fc_20260416', date: '2026-04-16', status: 'fechado', responsavel: 'Carla Fernandes', saldoInicial: 250.00,
        entradas: [
            { id: 'e1', horario: '08:30', descricao: 'Aplicação de Flúor',   paciente: 'Ana Lima',          profissional: 'Dra. Ana',   formaPagamento: 'dinheiro',          valor: 120.00 },
            { id: 'e2', horario: '09:00', descricao: 'Avaliação Inicial',    paciente: 'Felipe Alves',      profissional: 'Dr. Bruno',  formaPagamento: 'pix',               valor: 150.00 },
            { id: 'e3', horario: '09:30', descricao: 'Limpeza Dental',       paciente: 'Juliana Ferreira',  profissional: 'Dra. Ana',   formaPagamento: 'convenio',          valor: 200.00 },
            { id: 'e4', horario: '10:30', descricao: 'Clareamento Dental',   paciente: 'Lucas Costa',       profissional: 'Dr. Carlos', formaPagamento: 'credito_parcelado', valor: 1500.00 },
            { id: 'e5', horario: '11:00', descricao: 'Restauração Resina',   paciente: 'Bianca Torres',     profissional: 'Dr. Carlos', formaPagamento: 'debito',            valor: 380.00 },
            { id: 'e6', horario: '14:30', descricao: 'Implante (entrada)',   paciente: 'Eduardo Melo',      profissional: 'Dr. Bruno',  formaPagamento: 'pix',               valor: 800.00 },
            { id: 'e7', horario: '15:00', descricao: 'Kit Branqueamento',    paciente: 'Roberta Silva',     profissional: 'Dra. Ana',   formaPagamento: 'dinheiro',          valor: 95.00 },
        ],
        saidas: [
            { id: 's1', horario: '09:00', descricao: 'Anestésico Lidocaína (cx)',   categoria: 'material',  formaPagamento: 'pix',      valor: 220.00 },
            { id: 's2', horario: '13:30', descricao: 'Serviço de limpeza',           categoria: 'servicos',  formaPagamento: 'dinheiro', valor: 150.00 },
            { id: 's3', horario: '17:00', descricao: 'Contador — honorários Abr',   categoria: 'servicos',  formaPagamento: 'pix',      valor: 450.00 },
        ],
        sangrias:    [{ id: 'sg1', horario: '12:30', valor: 250.00, motivo: 'Depósito bancário', responsavel: 'Carla Fernandes' }],
        suprimentos: [],
        fechamento:  { horario: '18:30', saldoFisico: 62.00, responsavel: 'Carla Fernandes', observacoes: 'Diferença de R$ 3,00 registrada em outros.' },
        // saldo esperado: 250 + (120+95) - 150 - 250 = 65 → físico: 62 → falta: -3
    },
    {
        id: 'fc_20260415', date: '2026-04-15', status: 'fechado', responsavel: 'Marcos Admin', saldoInicial: 200.00,
        entradas: [
            { id: 'e1', horario: '08:00', descricao: 'Consulta Geral',       paciente: 'Rafael Lima',   profissional: 'Dr. Carlos', formaPagamento: 'pix',           valor: 250.00 },
            { id: 'e2', horario: '09:30', descricao: 'Limpeza Dental',       paciente: 'Sandra Reis',   profissional: 'Dra. Ana',   formaPagamento: 'dinheiro',      valor: 200.00 },
            { id: 'e3', horario: '10:00', descricao: 'Prótese Total',        paciente: 'Gilberto Cruz', profissional: 'Dr. Carlos', formaPagamento: 'credito_vista', valor: 2800.00 },
            { id: 'e4', horario: '11:30', descricao: 'Restauração Amálgama', paciente: 'Vera Santos',   profissional: 'Dr. Bruno',  formaPagamento: 'convenio',      valor: 220.00 },
            { id: 'e5', horario: '14:00', descricao: 'Raio-X Panorâmico',    paciente: 'Carlos Nobre',  profissional: 'Dra. Ana',   formaPagamento: 'debito',        valor: 180.00 },
        ],
        saidas: [
            { id: 's1', horario: '09:00', descricao: 'Aluguel sala — Abr',   categoria: 'manutencao', formaPagamento: 'debito',   valor: 800.00 },
            { id: 's2', horario: '16:00', descricao: 'Máscaras cirúrgicas',   categoria: 'consumo',    formaPagamento: 'dinheiro', valor: 38.00 },
        ],
        sangrias:    [{ id: 'sg1', horario: '13:00', valor: 300.00, motivo: 'Depósito bancário', responsavel: 'Marcos Admin' }],
        suprimentos: [],
        fechamento:  { horario: '18:00', saldoFisico: 62.00, responsavel: 'Marcos Admin', observacoes: '' },
        // saldo esperado: 200 + 200 - 38 - 300 = 62 → perfeito
    },
    {
        id: 'fc_20260414', date: '2026-04-14', status: 'fechado', responsavel: 'Carla Fernandes', saldoInicial: 150.00,
        entradas: [
            { id: 'e1', horario: '09:00', descricao: 'Implante (parcela 2)',    paciente: 'Mário Fonseca',  profissional: 'Dr. Bruno',  formaPagamento: 'credito_parcelado', valor: 900.00 },
            { id: 'e2', horario: '10:00', descricao: 'Faceta Porcelana',        paciente: 'Lívia Castro',   profissional: 'Dr. Carlos', formaPagamento: 'pix',               valor: 850.00 },
            { id: 'e3', horario: '11:00', descricao: 'Ortodontia mensalidade',  paciente: 'Thomas Pereira', profissional: 'Dra. Ana',   formaPagamento: 'pix',               valor: 350.00 },
            { id: 'e4', horario: '14:00', descricao: 'Consulta Geral',          paciente: 'Helena Dias',    profissional: 'Dr. Carlos', formaPagamento: 'dinheiro',          valor: 180.00 },
        ],
        saidas: [
            { id: 's1', horario: '10:00', descricao: 'ISS — competência Março',  categoria: 'imposto',   formaPagamento: 'debito',   valor: 380.00 },
            { id: 's2', horario: '14:30', descricao: 'Desinf. Glutaraldeído',    categoria: 'consumo',   formaPagamento: 'dinheiro', valor: 62.00 },
            { id: 's3', horario: '15:00', descricao: 'Gás para esterilização',   categoria: 'material',  formaPagamento: 'dinheiro', valor: 95.00 },
        ],
        sangrias:    [],
        suprimentos: [{ id: 'su1', horario: '08:30', valor: 100.00, motivo: 'Complemento de troco', responsavel: 'Carla Fernandes' }],
        fechamento:  { horario: '17:30', saldoFisico: 273.00, responsavel: 'Carla Fernandes', observacoes: '' },
        // saldo esperado: 150 + 180 - (62+95) + 100 = 273 → perfeito
    },
    {
        id: 'fc_20260411', date: '2026-04-11', status: 'fechado', responsavel: 'Carla Fernandes', saldoInicial: 300.00,
        entradas: [
            { id: 'e1', horario: '08:30', descricao: 'Limpeza Dental',        paciente: 'Paulo Ramos',   profissional: 'Dra. Ana',   formaPagamento: 'convenio',     valor: 200.00 },
            { id: 'e2', horario: '09:00', descricao: 'Consulta Geral',        paciente: 'Simone Barros', profissional: 'Dr. Carlos', formaPagamento: 'pix',          valor: 250.00 },
            { id: 'e3', horario: '10:30', descricao: 'Prótese Parcial',       paciente: 'Antônio Góes',  profissional: 'Dr. Carlos', formaPagamento: 'credito_vista',valor: 1600.00 },
            { id: 'e4', horario: '11:00', descricao: 'Restauração Composta',  paciente: 'Carine Moura',  profissional: 'Dra. Ana',   formaPagamento: 'debito',       valor: 320.00 },
            { id: 'e5', horario: '14:30', descricao: 'Aplicação Botox Dental',paciente: 'Renata Souza',  profissional: 'Dr. Carlos', formaPagamento: 'pix',          valor: 750.00 },
            { id: 'e6', horario: '15:00', descricao: 'Pino e Núcleo',         paciente: 'Davi Esteves',  profissional: 'Dr. Bruno',  formaPagamento: 'dinheiro',     valor: 420.00 },
        ],
        saidas: [
            { id: 's1', horario: '09:00', descricao: 'Fio Dental Profissional (cx)', categoria: 'consumo',        formaPagamento: 'dinheiro', valor: 78.00 },
            { id: 's2', horario: '12:00', descricao: 'Software gestão — mensal',      categoria: 'administrativo', formaPagamento: 'debito',   valor: 290.00 },
        ],
        sangrias:    [{ id: 'sg1', horario: '13:00', valor: 500.00, motivo: 'Depósito bancário', responsavel: 'Carla Fernandes' }],
        suprimentos: [],
        fechamento:  { horario: '18:30', saldoFisico: 142.00, responsavel: 'Carla Fernandes', observacoes: '' },
        // saldo esperado: 300 + 420 - 78 - 500 = 142 → perfeito
    },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const fmtShort = (dateStr) => {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

const fmtFull = (dateStr) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).replace(/^\w/, (c) => c.toUpperCase())

const sumBy = (arr, key) => arr.reduce((s, x) => s + x[key], 0)

const calcTotals = (fc) => {
    const totalEntradas    = sumBy(fc.entradas, 'valor')
    const totalSaidas      = sumBy(fc.saidas, 'valor')
    const totalSangrias    = sumBy(fc.sangrias, 'valor')
    const totalSuprimentos = sumBy(fc.suprimentos, 'valor')
    const entradasDinheiro = fc.entradas.filter((e) => e.formaPagamento === 'dinheiro').reduce((s, e) => s + e.valor, 0)
    const saidasDinheiro   = fc.saidas.filter((s) => s.formaPagamento === 'dinheiro').reduce((s, e) => s + e.valor, 0)
    const saldoEsperado    = fc.saldoInicial + entradasDinheiro - saidasDinheiro - totalSangrias + totalSuprimentos
    const resultado        = totalEntradas - totalSaidas
    return { totalEntradas, totalSaidas, totalSangrias, totalSuprimentos, entradasDinheiro, saidasDinheiro, saldoEsperado, resultado }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CFG[status] ?? STATUS_CFG.aberto
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}

const FormaTag = ({ forma }) => {
    const cfg = FORMAS[forma]
    if (!cfg) return null
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.pill}`}>
            {cfg.label}
        </span>
    )
}

const SectionTitle = ({ children, count }) => (
    <div className='flex items-center gap-2 mb-3'>
        <span className='text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest'>{children}</span>
        {count != null && (
            <span className='px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-500 dark:text-gray-400'>
                {count}
            </span>
        )}
        <div className='flex-1 h-px bg-gray-100 dark:bg-gray-700/60' />
    </div>
)

// ─── Closing Detail Modal ─────────────────────────────────────────────────────

const ClosingDetail = ({ fechamento, onClose, onFechar }) => {
    const [saldoFisicoInput, setSaldoFisicoInput] = useState('')
    const [obs, setObs]                           = useState('')
    const [showCloseForm, setShowCloseForm]        = useState(false)

    const t = useMemo(() => calcTotals(fechamento), [fechamento])

    const saldoFisicoNum = parseFloat(saldoFisicoInput.replace(',', '.')) || 0
    const diferenca      = fechamento.fechamento
        ? fechamento.fechamento.saldoFisico - t.saldoEsperado
        : saldoFisicoNum - t.saldoEsperado

    const porForma = useMemo(() => {
        const map = {}
        fechamento.entradas.forEach((e) => {
            map[e.formaPagamento] = (map[e.formaPagamento] ?? 0) + e.valor
        })
        return Object.entries(map).sort((a, b) => b[1] - a[1])
    }, [fechamento])

    const porCategoria = useMemo(() => {
        const map = {}
        fechamento.saidas.forEach((s) => {
            map[s.categoria] = (map[s.categoria] ?? 0) + s.valor
        })
        return Object.entries(map).sort((a, b) => b[1] - a[1])
    }, [fechamento])

    const isAberto = fechamento.status === 'aberto'
    const diferencaColor = Math.abs(diferenca) < 0.01
        ? 'text-emerald-600 dark:text-emerald-400'
        : diferenca > 0
            ? 'text-sky-600 dark:text-sky-400'
            : 'text-rose-600 dark:text-rose-400'
    const diferencaLabel = Math.abs(diferenca) < 0.01
        ? 'Caixa conferido — sem divergências'
        : diferenca > 0
            ? `Sobra de ${fmt(Math.abs(diferenca))}`
            : `Falta de ${fmt(Math.abs(diferenca))}`

    return (
        <div className='fixed inset-0 z-50 flex items-stretch justify-end' style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose}>
            <div
                className='relative w-full max-w-2xl bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl flex flex-col'
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className='sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800'>
                    <div className='flex items-start gap-3 px-6 py-4'>
                        <div className='flex-1 min-w-0'>
                            <p className='text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-semibold mb-0.5'>
                                Fechamento de Caixa
                            </p>
                            <h2 className='text-base font-bold text-gray-800 dark:text-gray-100 leading-snug'>
                                {fmtFull(fechamento.date)}
                            </h2>
                            <div className='flex items-center gap-2 mt-1.5 flex-wrap'>
                                <StatusBadge status={fechamento.status} />
                                <span className='text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1'>
                                    <HiOutlineUser className='w-3 h-3' />
                                    {fechamento.responsavel}
                                </span>
                                {fechamento.fechamento && (
                                    <span className='text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1'>
                                        <HiOutlineClock className='w-3 h-3' />
                                        Fechado às {fechamento.fechamento.horario}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className='w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex-shrink-0'
                        >
                            <HiOutlineX className='w-4 h-4' />
                        </button>
                    </div>

                    {/* KPI strip */}
                    <div className='grid grid-cols-4 border-t border-gray-100 dark:border-gray-800'>
                        {[
                            { label: 'Total Entradas',  value: fmt(t.totalEntradas), color: 'text-emerald-600 dark:text-emerald-400' },
                            { label: 'Total Saídas',    value: fmt(t.totalSaidas),   color: 'text-rose-500 dark:text-rose-400' },
                            { label: 'Resultado',       value: fmt(t.resultado),     color: t.resultado >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500' },
                            { label: 'Saldo Esperado',  value: fmt(t.saldoEsperado), color: 'text-indigo-600 dark:text-indigo-400' },
                        ].map((k) => (
                            <div key={k.label} className='px-4 py-3 border-r border-gray-100 dark:border-gray-800 last:border-r-0'>
                                <p className='text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide truncate'>{k.label}</p>
                                <p className={`text-sm font-bold mt-0.5 ${k.color}`}>{k.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Content ── */}
                <div className='flex-1 px-6 py-5 space-y-6'>

                    {/* Receita por Forma de Pagamento */}
                    <div>
                        <SectionTitle count={porForma.length}>Receita por Forma de Pagamento</SectionTitle>
                        <div className='grid grid-cols-2 gap-2'>
                            {porForma.map(([forma, valor]) => {
                                const cfg = FORMAS[forma]
                                if (!cfg) return null
                                const pct = t.totalEntradas > 0 ? (valor / t.totalEntradas) * 100 : 0
                                return (
                                    <div
                                        key={forma}
                                        className='flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/40'
                                    >
                                        <div className='w-2.5 h-2.5 rounded-full flex-shrink-0' style={{ background: cfg.accent }} />
                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-center justify-between mb-1'>
                                                <span className='text-xs font-semibold text-gray-700 dark:text-gray-300 truncate'>{cfg.label}</span>
                                                <span className='text-xs font-bold text-gray-800 dark:text-gray-200 tabular-nums ml-2'>{fmt(valor)}</span>
                                            </div>
                                            <div className='h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                                                <div className='h-full rounded-full transition-all' style={{ width: `${pct}%`, background: cfg.accent }} />
                                            </div>
                                        </div>
                                        <span className='text-[10px] text-gray-400 font-semibold w-8 text-right tabular-nums flex-shrink-0'>
                                            {pct.toFixed(0)}%
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Entradas */}
                    <div>
                        <SectionTitle count={fechamento.entradas.length}>Atendimentos e Receitas</SectionTitle>
                        <div className='rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden'>
                            <div className='grid grid-cols-[1fr_auto_auto] gap-0'>
                                {fechamento.entradas.map((e, i) => (
                                    <div
                                        key={e.id}
                                        className={`contents ${i % 2 === 0 ? '' : 'bg-gray-50/70 dark:bg-gray-800/20'}`}
                                    >
                                        <div className={`px-4 py-2.5 ${i % 2 === 0 ? '' : 'bg-gray-50/70 dark:bg-gray-800/20'}`}>
                                            <p className='text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug'>{e.descricao}</p>
                                            <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>
                                                <span className='tabular-nums'>{e.horario}</span>
                                                {e.paciente && <> · {e.paciente}</>}
                                                {e.profissional && <> · {e.profissional}</>}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-2.5 flex items-center ${i % 2 === 0 ? '' : 'bg-gray-50/70 dark:bg-gray-800/20'}`}>
                                            <FormaTag forma={e.formaPagamento} />
                                        </div>
                                        <div className={`px-4 py-2.5 flex items-center justify-end ${i % 2 === 0 ? '' : 'bg-gray-50/70 dark:bg-gray-800/20'}`}>
                                            <span className='text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums'>{fmt(e.valor)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className='flex items-center justify-between px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border-t border-gray-100 dark:border-gray-700/50'>
                                <span className='text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide'>Total Entradas</span>
                                <span className='text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums'>{fmt(t.totalEntradas)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Saídas */}
                    {fechamento.saidas.length > 0 && (
                        <div>
                            <SectionTitle count={fechamento.saidas.length}>Despesas e Saídas</SectionTitle>
                            <div className='rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden'>
                                {fechamento.saidas.map((s, i) => (
                                    <div
                                        key={s.id}
                                        className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 dark:border-gray-700/30 last:border-b-0 ${i % 2 === 0 ? '' : 'bg-gray-50/70 dark:bg-gray-800/20'}`}
                                    >
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug'>{s.descricao}</p>
                                            <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>
                                                <span className='tabular-nums'>{s.horario}</span>
                                                {' · '}{CATS_SAIDA[s.categoria] ?? s.categoria}
                                            </p>
                                        </div>
                                        <FormaTag forma={s.formaPagamento} />
                                        <span className='text-xs font-bold text-rose-500 dark:text-rose-400 tabular-nums whitespace-nowrap'>
                                            − {fmt(s.valor)}
                                        </span>
                                    </div>
                                ))}
                                <div className='flex items-center justify-between px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 border-t border-gray-100 dark:border-gray-700/50'>
                                    <span className='text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide'>Total Saídas</span>
                                    <span className='text-sm font-bold text-rose-500 dark:text-rose-400 tabular-nums'>{fmt(t.totalSaidas)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Categorias de saída */}
                    {porCategoria.length > 1 && (
                        <div>
                            <SectionTitle>Saídas por Categoria</SectionTitle>
                            <div className='grid grid-cols-2 gap-2'>
                                {porCategoria.map(([cat, valor]) => (
                                    <div key={cat} className='flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/40'>
                                        <span className='text-[11px] text-gray-500 dark:text-gray-400 truncate'>{CATS_SAIDA[cat] ?? cat}</span>
                                        <span className='text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums ml-2'>{fmt(valor)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sangrias e Suprimentos */}
                    {(fechamento.sangrias.length > 0 || fechamento.suprimentos.length > 0) && (
                        <div>
                            <SectionTitle>Movimentações de Caixa</SectionTitle>
                            <div className='space-y-1.5'>
                                {fechamento.suprimentos.map((su) => (
                                    <div key={su.id} className='flex items-center gap-3 px-4 py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-900/10'>
                                        <div className='w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0'>
                                            <HiOutlinePlus className='w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400' />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-xs font-semibold text-gray-700 dark:text-gray-300'>{su.motivo}</p>
                                            <p className='text-[11px] text-gray-400'>{su.horario} · Suprimento · {su.responsavel}</p>
                                        </div>
                                        <span className='text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums'>+ {fmt(su.valor)}</span>
                                    </div>
                                ))}
                                {fechamento.sangrias.map((sg) => (
                                    <div key={sg.id} className='flex items-center gap-3 px-4 py-2.5 rounded-xl border border-rose-100 dark:border-rose-800/30 bg-rose-50/50 dark:bg-rose-900/10'>
                                        <div className='w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center flex-shrink-0'>
                                            <HiOutlineMinus className='w-3.5 h-3.5 text-rose-500 dark:text-rose-400' />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-xs font-semibold text-gray-700 dark:text-gray-300'>{sg.motivo}</p>
                                            <p className='text-[11px] text-gray-400'>{sg.horario} · Sangria · {sg.responsavel}</p>
                                        </div>
                                        <span className='text-xs font-bold text-rose-500 dark:text-rose-400 tabular-nums'>− {fmt(sg.valor)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Conferência de Fechamento */}
                    <div>
                        <SectionTitle>Conferência de Fechamento (Caixa Físico)</SectionTitle>
                        <div className='rounded-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden'>
                            {/* Cálculo linha a linha */}
                            <div className='px-5 py-4 space-y-2 bg-gray-50/60 dark:bg-gray-800/30'>
                                {[
                                    { label: 'Saldo Inicial',           value: t.saldoEsperado !== null ? fechamento.saldoInicial : 0, op: null,  bold: false },
                                    { label: 'Entradas em Dinheiro',    value: t.entradasDinheiro,   op: '+', bold: false },
                                    { label: 'Saídas em Dinheiro',      value: t.saidasDinheiro,     op: '−', bold: false },
                                    { label: 'Sangrias',                value: t.totalSangrias,      op: '−', bold: false },
                                    { label: 'Suprimentos',             value: t.totalSuprimentos,   op: '+', bold: false },
                                ].map((row) => (
                                    <div key={row.label} className='flex items-center justify-between gap-4'>
                                        <div className='flex items-center gap-2'>
                                            {row.op && (
                                                <span className={`text-xs font-bold w-4 text-center ${row.op === '+' ? 'text-emerald-500' : 'text-rose-400'}`}>
                                                    {row.op}
                                                </span>
                                            )}
                                            {!row.op && <span className='w-4' />}
                                            <span className='text-xs text-gray-500 dark:text-gray-400'>{row.label}</span>
                                        </div>
                                        <span className='text-xs tabular-nums text-gray-700 dark:text-gray-300'>{fmt(row.value)}</span>
                                    </div>
                                ))}
                                <div className='pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between'>
                                    <span className='text-xs font-bold text-gray-700 dark:text-gray-200'>= Saldo Esperado em Caixa</span>
                                    <span className='text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums'>{fmt(t.saldoEsperado)}</span>
                                </div>
                            </div>

                            {/* Resultado da conferência */}
                            {fechamento.fechamento ? (
                                <div className='px-5 py-4 border-t border-gray-200 dark:border-gray-700/60 space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-xs text-gray-500 dark:text-gray-400'>Saldo Físico Contado</span>
                                        <span className='text-sm font-bold text-gray-800 dark:text-gray-200 tabular-nums'>{fmt(fechamento.fechamento.saldoFisico)}</span>
                                    </div>
                                    <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${Math.abs(diferenca) < 0.01 ? 'bg-emerald-50 dark:bg-emerald-900/20' : diferenca > 0 ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
                                        <span className={`text-xs font-bold ${diferencaColor}`}>Diferença</span>
                                        <div className='text-right'>
                                            <span className={`text-sm font-bold tabular-nums ${diferencaColor}`}>{fmt(Math.abs(diferenca))}</span>
                                            <p className={`text-[10px] font-semibold ${diferencaColor}`}>{diferencaLabel}</p>
                                        </div>
                                    </div>
                                    {fechamento.fechamento.observacoes && (
                                        <p className='text-[11px] text-gray-400 italic px-1'>{fechamento.fechamento.observacoes}</p>
                                    )}
                                    <p className='text-[11px] text-gray-400 dark:text-gray-500'>
                                        Fechado às {fechamento.fechamento.horario} por {fechamento.fechamento.responsavel}
                                    </p>
                                </div>
                            ) : (
                                /* Formulário de fechamento */
                                <div className='px-5 py-4 border-t border-gray-200 dark:border-gray-700/60 space-y-3'>
                                    {!showCloseForm ? (
                                        <button
                                            onClick={() => setShowCloseForm(true)}
                                            className='w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold border border-indigo-200 dark:border-indigo-800/40 transition flex items-center justify-center gap-2'
                                        >
                                            <HiOutlineLockClosed className='w-4 h-4' />
                                            Realizar Fechamento de Caixa
                                        </button>
                                    ) : (
                                        <>
                                            <div>
                                                <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>
                                                    Saldo Físico Contado (R$) *
                                                </label>
                                                <input
                                                    type='number'
                                                    min='0'
                                                    step='0.01'
                                                    placeholder='0,00'
                                                    value={saldoFisicoInput}
                                                    onChange={(e) => setSaldoFisicoInput(e.target.value)}
                                                    className='w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 tabular-nums'
                                                />
                                            </div>
                                            {saldoFisicoInput && (
                                                <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${Math.abs(diferenca) < 0.01 ? 'bg-emerald-50 dark:bg-emerald-900/20' : diferenca > 0 ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
                                                    <span className={`text-xs font-bold ${diferencaColor}`}>Diferença</span>
                                                    <div className='text-right'>
                                                        <span className={`text-sm font-bold tabular-nums ${diferencaColor}`}>{fmt(Math.abs(diferenca))}</span>
                                                        <p className={`text-[10px] font-semibold ${diferencaColor}`}>{diferencaLabel}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>
                                                    Observações
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    placeholder='Justificativa de diferença, ocorrências, etc.'
                                                    value={obs}
                                                    onChange={(e) => setObs(e.target.value)}
                                                    className='w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 resize-none'
                                                />
                                            </div>
                                            <div className='flex gap-2'>
                                                <button
                                                    onClick={() => setShowCloseForm(false)}
                                                    className='flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition'
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    disabled={!saldoFisicoInput}
                                                    onClick={() => {
                                                        onFechar(fechamento.id, parseFloat(saldoFisicoInput.replace(',', '.')), obs)
                                                        onClose()
                                                    }}
                                                    className='flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-sm font-bold transition shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2'
                                                >
                                                    <HiOutlineLockClosed className='w-4 h-4' />
                                                    Fechar Caixa
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const CashClosingIndex = () => {
    const [data, setData]             = useState(MOCK_BASE)
    const [selected, setSelected]     = useState(null)
    const [monthOffset, setMonthOffset] = useState(0)   // 0 = current month (Apr 2026)

    const today = '2026-04-17'
    const baseDate = new Date('2026-04-01')
    const displayDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + monthOffset, 1)
    const displayYear  = displayDate.getFullYear()
    const displayMonth = displayDate.getMonth()
    const monthLabel   = `${MONTH_NAMES[displayMonth]} ${displayYear}`

    const filtered = useMemo(
        () => data
            .filter((fc) => {
                const [y, m] = fc.date.split('-').map(Number)
                return y === displayYear && m - 1 === displayMonth
            })
            .sort((a, b) => b.date.localeCompare(a.date)),
        [data, displayYear, displayMonth],
    )

    // Month KPIs
    const monthKpis = useMemo(() => {
        const entradas = filtered.reduce((s, fc) => s + sumBy(fc.entradas, 'valor'), 0)
        const saidas   = filtered.reduce((s, fc) => s + sumBy(fc.saidas, 'valor'), 0)
        const sangrias = filtered.reduce((s, fc) => s + sumBy(fc.sangrias, 'valor'), 0)
        const abertos  = filtered.filter((fc) => fc.status === 'aberto').length
        return { entradas, saidas, resultado: entradas - saidas, sangrias, abertos, dias: filtered.length }
    }, [filtered])

    const todayExists = data.some((fc) => fc.date === today)

    const handleFechar = (id, saldoFisico, observacoes) => {
        setData((prev) =>
            prev.map((fc) =>
                fc.id === id
                    ? {
                          ...fc,
                          status: 'fechado',
                          fechamento: {
                              horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                              saldoFisico,
                              responsavel: 'Usuário Atual',
                              observacoes,
                          },
                      }
                    : fc,
            ),
        )
    }

    const handleAbrirHoje = () => {
        if (todayExists) return
        const novo = {
            id: `fc_${today.replace(/-/g, '')}`,
            date: today,
            status: 'aberto',
            responsavel: 'Usuário Atual',
            saldoInicial: 0,
            entradas: [], saidas: [], sangrias: [], suprimentos: [],
            fechamento: null,
        }
        setData((prev) => [novo, ...prev])
    }

    const selectedFc = data.find((fc) => fc.id === selected)

    return (
        <div className='space-y-5'>

            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div>
                    <h3 className='text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight'>Fechamento de Caixa</h3>
                    <p className='text-sm text-gray-400 dark:text-gray-500 mt-0.5'>Controle diário de entradas, saídas e conferência</p>
                </div>

                <div className='flex items-center gap-2'>
                    {/* Month nav */}
                    <div className='flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-1 py-1'>
                        <button onClick={() => setMonthOffset((v) => v - 1)} className='w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition'>
                            <HiOutlineChevronLeft className='w-4 h-4' />
                        </button>
                        <span className='text-sm font-semibold text-gray-700 dark:text-gray-200 px-2 min-w-[130px] text-center'>{monthLabel}</span>
                        <button onClick={() => setMonthOffset((v) => v + 1)} className='w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition'>
                            <HiOutlineChevronRight className='w-4 h-4' />
                        </button>
                    </div>

                    {!todayExists && monthOffset === 0 && (
                        <button
                            onClick={handleAbrirHoje}
                            className='flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-bold transition shadow-lg shadow-indigo-500/20'
                        >
                            <HiOutlinePlus className='w-4 h-4' />
                            Abrir Caixa Hoje
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                {[
                    {
                        label: 'Receita do Período', value: fmt(monthKpis.entradas),
                        sub: `${monthKpis.dias} dia${monthKpis.dias !== 1 ? 's' : ''} com movimento`,
                        Icon: HiOutlineArrowUp, color: '#10b981',
                    },
                    {
                        label: 'Despesas do Período', value: fmt(monthKpis.saidas),
                        sub: `Sangrias: ${fmt(monthKpis.sangrias)}`,
                        Icon: HiOutlineArrowDown, color: '#f43f5e',
                    },
                    {
                        label: 'Resultado Líquido', value: fmt(monthKpis.resultado),
                        sub: monthKpis.resultado >= 0 ? 'Superávit no período' : 'Déficit no período',
                        Icon: HiOutlineCurrencyDollar, color: monthKpis.resultado >= 0 ? '#6366f1' : '#f43f5e',
                    },
                    {
                        label: 'Caixas Pendentes', value: monthKpis.abertos,
                        sub: monthKpis.abertos > 0 ? 'Aguardando fechamento' : 'Tudo conferido',
                        Icon: monthKpis.abertos > 0 ? HiOutlineExclamation : HiOutlineCheckCircle,
                        color: monthKpis.abertos > 0 ? '#f59e0b' : '#10b981',
                    },
                ].map((k) => (
                    <div key={k.label} className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm px-4 py-4 flex items-start gap-3'>
                        <div className='w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0' style={{ background: k.color + '18' }}>
                            <k.Icon className='w-5 h-5' style={{ color: k.color }} />
                        </div>
                        <div className='min-w-0'>
                            <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-1'>{k.label}</p>
                            <p className='text-lg font-bold text-gray-800 dark:text-gray-100 leading-none'>{k.value}</p>
                            <p className='text-[11px] text-gray-400 mt-1'>{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden'>
                {/* List header */}
                <div className='px-5 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/60 dark:bg-gray-800/60 grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center'>
                    {['Data', 'Status', 'Entradas', 'Saídas', 'Resultado', ''].map((h) => (
                        <span key={h} className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>{h}</span>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-16 gap-3 text-gray-300 dark:text-gray-600'>
                        <HiOutlineDocumentText className='w-10 h-10' />
                        <p className='text-sm font-medium'>Nenhum fechamento em {monthLabel}</p>
                    </div>
                ) : (
                    <div className='divide-y divide-gray-50 dark:divide-gray-700/30'>
                        {filtered.map((fc) => {
                            const t = calcTotals(fc)
                            const isToday = fc.date === today
                            const diferencaFc = fc.fechamento ? fc.fechamento.saldoFisico - t.saldoEsperado : null
                            return (
                                <div
                                    key={fc.id}
                                    onClick={() => setSelected(fc.id)}
                                    className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center cursor-pointer transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-700/20 ${isToday ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}
                                >
                                    {/* Data */}
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-sm font-bold text-gray-800 dark:text-gray-200 tabular-nums'>{fmtShort(fc.date)}</span>
                                            {isToday && (
                                                <span className='text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400'>
                                                    HOJE
                                                </span>
                                            )}
                                        </div>
                                        <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1'>
                                            <HiOutlineUser className='w-3 h-3' />
                                            {fc.responsavel}
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <StatusBadge status={fc.status} />

                                    {/* Entradas */}
                                    <span className='text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-right'>
                                        {fmt(t.totalEntradas)}
                                    </span>

                                    {/* Saídas */}
                                    <span className='text-sm font-semibold text-rose-500 dark:text-rose-400 tabular-nums text-right'>
                                        {fmt(t.totalSaidas)}
                                    </span>

                                    {/* Resultado */}
                                    <div className='text-right'>
                                        <span className={`text-sm font-bold tabular-nums ${t.resultado >= 0 ? 'text-gray-800 dark:text-gray-200' : 'text-rose-500'}`}>
                                            {fmt(t.resultado)}
                                        </span>
                                        {diferencaFc !== null && Math.abs(diferencaFc) >= 0.01 && (
                                            <p className={`text-[10px] font-semibold tabular-nums ${diferencaFc > 0 ? 'text-sky-500' : 'text-rose-500'}`}>
                                                {diferencaFc > 0 ? '▲' : '▼'} {fmt(Math.abs(diferencaFc))} no caixa
                                            </p>
                                        )}
                                    </div>

                                    {/* Action */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelected(fc.id) }}
                                        className='flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 transition whitespace-nowrap'
                                    >
                                        Ver detalhe
                                        <HiOutlineChevronRight className='w-3 h-3' />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Detail drawer */}
            {selectedFc && (
                <ClosingDetail
                    fechamento={selectedFc}
                    onClose={() => setSelected(null)}
                    onFechar={handleFechar}
                />
            )}
        </div>
    )
}

export default CashClosingIndex
