import { useState } from 'react'
import {
    HiOutlineShieldCheck,
    HiOutlineRefresh,
    HiOutlineExclamation,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineClock,
    HiOutlineArrowCircleUp,
    HiOutlineDocumentText,
    HiOutlineUser,
    HiOutlineClipboard,
    HiOutlineCalendar,
    HiOutlineBadgeCheck,
    HiOutlineInformationCircle,
} from 'react-icons/hi'

// ─── mock data ────────────────────────────────────────────────────────────────

const LONG_TREATMENTS = [
    { patient: 'Ana Carvalho',      professional: 'Dr. Marcos',   sessions: 28, expected: 8,  days: 210, procedure: 'Canal Radicular',    severity: 'critico'  },
    { patient: 'Roberto Figueiredo',professional: 'Dra. Letícia', sessions: 21, expected: 6,  days: 185, procedure: 'Aparelho Ortodôntico', severity: 'atencao'  },
    { patient: 'Beatriz Nunes',     professional: 'Dr. André',    sessions: 17, expected: 5,  days: 143, procedure: 'Implante Dental',     severity: 'atencao'  },
    { patient: 'Carlos Drummond',   professional: 'Dra. Paula',   sessions: 14, expected: 6,  days: 120, procedure: 'Prótese Total',       severity: 'atencao'  },
    { patient: 'Fernanda Lima',     professional: 'Dr. Marcos',   sessions: 12, expected: 4,  days: 98,  procedure: 'Clareamento',         severity: 'leve'     },
    { patient: 'Jorge Santos',      professional: 'Dr. André',    sessions: 11, expected: 5,  days: 89,  procedure: 'Endodontia',          severity: 'leve'     },
]

const EXCESSIVE_RETURNS = [
    { patient: 'Maria das Graças',  professional: 'Dra. Letícia', returns: 9,  threshold: 3, lastReturn: '18/04/2026', reason: 'Revisão de prótese',     severity: 'critico' },
    { patient: 'Paulo Salave\'a',   professional: 'Dr. Marcos',   returns: 7,  threshold: 3, lastReturn: '20/04/2026', reason: 'Dor pós-procedimento',   severity: 'critico' },
    { patient: 'Cláudia Meireles',  professional: 'Dr. André',    returns: 6,  threshold: 3, lastReturn: '15/04/2026', reason: 'Ajuste oclusal',         severity: 'atencao' },
    { patient: 'Antônio Ferreira',  professional: 'Dra. Paula',   returns: 5,  threshold: 3, lastReturn: '10/04/2026', reason: 'Revisão implante',       severity: 'atencao' },
    { patient: 'Silvia Machado',    professional: 'Dra. Letícia', returns: 4,  threshold: 3, lastReturn: '22/04/2026', reason: 'Sensibilidade',          severity: 'leve'    },
]

const REWORK = [
    { patient: 'Eduardo Braga',     professional: 'Dr. Marcos',   procedure: 'Restauração Classe II',  reworkCount: 3, firstDate: '10/01/2026', lastDate: '05/04/2026', severity: 'critico' },
    { patient: 'Vanessa Correia',   professional: 'Dra. Paula',   procedure: 'Coroa Cerâmica — molar', reworkCount: 3, firstDate: '15/02/2026', lastDate: '19/04/2026', severity: 'critico' },
    { patient: 'Luciano Pires',     professional: 'Dr. André',    procedure: 'Extração + enxerto',     reworkCount: 2, firstDate: '05/03/2026', lastDate: '02/04/2026', severity: 'atencao' },
    { patient: 'Tatiane Oliveira',  professional: 'Dra. Letícia', procedure: 'Canal — pré-molar',      reworkCount: 2, firstDate: '20/02/2026', lastDate: '18/04/2026', severity: 'atencao' },
    { patient: 'Renato Barbosa',    professional: 'Dr. Marcos',   procedure: 'Restauração Classe I',   reworkCount: 2, firstDate: '14/03/2026', lastDate: '24/04/2026', severity: 'atencao' },
]

const INCOMPLETE_RECORDS = [
    { patient: 'Diego Monteiro',    professional: 'Dr. André',    missing: ['Anamnese', 'Rx inicial', 'Plano de trat.'], lastSession: '21/04/2026', severity: 'critico' },
    { patient: 'Isabela Rocha',     professional: 'Dr. Marcos',   missing: ['Rx inicial', 'Evolução clínica'],           lastSession: '19/04/2026', severity: 'atencao' },
    { patient: 'Marcelo Teixeira',  professional: 'Dra. Paula',   missing: ['Plano de trat.', 'Consentimento'],          lastSession: '17/04/2026', severity: 'atencao' },
    { patient: 'Juliana Fonseca',   professional: 'Dra. Letícia', missing: ['Evolução clínica'],                         lastSession: '23/04/2026', severity: 'leve'    },
    { patient: 'Felipe Azevedo',    professional: 'Dr. André',    missing: ['Rx pós-operatório'],                        lastSession: '22/04/2026', severity: 'leve'    },
    { patient: 'Camila Borges',     professional: 'Dr. Marcos',   missing: ['Consentimento'],                            lastSession: '20/04/2026', severity: 'leve'    },
    { patient: 'Rafael Dantas',     professional: 'Dra. Paula',   missing: ['Anamnese'],                                 lastSession: '16/04/2026', severity: 'leve'    },
]

// ─── helpers ──────────────────────────────────────────────────────────────────

const SEV = {
    critico: {
        pill:   'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40',
        dot:    'bg-red-400',
        label:  'Crítico',
    },
    atencao: {
        pill:   'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40',
        dot:    'bg-amber-400',
        label:  'Atenção',
    },
    leve: {
        pill:   'bg-sky-50 text-sky-600 border border-sky-100 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800/40',
        dot:    'bg-sky-400',
        label:  'Leve',
    },
}

const countBySev = (items) => ({
    critico: items.filter(i => i.severity === 'critico').length,
    atencao: items.filter(i => i.severity === 'atencao').length,
    leve:    items.filter(i => i.severity === 'leve').length,
})

function SeverityPill({ severity }) {
    const s = SEV[severity]
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    )
}

function SectionBadge({ counts }) {
    return (
        <div className='flex items-center gap-1.5'>
            {counts.critico > 0 && (
                <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400'>
                    {counts.critico} crítico{counts.critico > 1 ? 's' : ''}
                </span>
            )}
            {counts.atencao > 0 && (
                <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400'>
                    {counts.atencao} atenção
                </span>
            )}
            {counts.leve > 0 && (
                <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100 dark:bg-sky-900/20 dark:text-sky-400'>
                    {counts.leve} leve{counts.leve > 1 ? 's' : ''}
                </span>
            )}
        </div>
    )
}

// ─── AuditSection ─────────────────────────────────────────────────────────────

function AuditSection({ icon, title, description, tip, counts, total, children, accentColor }) {
    const [open, setOpen] = useState(true)

    const accent = {
        red:    'border-l-red-400',
        amber:  'border-l-amber-400',
        violet: 'border-l-violet-400',
        indigo: 'border-l-indigo-400',
    }[accentColor] ?? 'border-l-gray-300'

    return (
        <div className={`bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm border-l-4 ${accent} overflow-hidden`}>
            {/* header */}
            <button
                type='button'
                onClick={() => setOpen(o => !o)}
                className='w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors text-left'
            >
                <div className='flex items-center gap-3 min-w-0'>
                    <div className='w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0'>
                        {icon}
                    </div>
                    <div className='min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap'>
                            <h3 className='text-sm font-bold text-gray-800 dark:text-gray-100'>{title}</h3>
                            <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'>
                                {total} caso{total !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate'>{description}</p>
                    </div>
                </div>
                <div className='flex items-center gap-3 flex-shrink-0 ml-3'>
                    <div className='hidden sm:flex'>
                        <SectionBadge counts={counts} />
                    </div>
                    {open
                        ? <HiOutlineChevronUp className='w-4 h-4 text-gray-400' />
                        : <HiOutlineChevronDown className='w-4 h-4 text-gray-400' />
                    }
                </div>
            </button>

            {/* body */}
            {open && (
                <div className='border-t border-gray-100 dark:border-gray-700/50'>
                    {children}
                    {/* tip */}
                    <div className='flex items-start gap-2 mx-5 mb-4 mt-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700/50'>
                        <HiOutlineInformationCircle className='w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5' />
                        <p className='text-[11px] text-gray-500 dark:text-gray-400'>{tip}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Section 1 — Tratamentos longos ──────────────────────────────────────────

function LongTreatmentsSection() {
    const counts = countBySev(LONG_TREATMENTS)
    return (
        <AuditSection
            icon={<HiOutlineClock className='w-5 h-5' />}
            title='Tratamentos Longos Demais'
            description='Pacientes com sessões muito acima do esperado para o procedimento'
            tip='Tratamentos que excedem 2× a média esperada de sessões indicam possível subdivisão incorreta, falhas de protocolo ou falta de reavaliação periódica.'
            counts={counts}
            total={LONG_TREATMENTS.length}
            accentColor='red'
        >
            <div className='overflow-x-auto'>
                <table className='w-full text-xs'>
                    <thead>
                        <tr className='text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                            <th className='text-left py-2.5 px-5 font-semibold'>Paciente</th>
                            <th className='text-left py-2.5 pr-4 font-semibold hidden md:table-cell'>Procedimento</th>
                            <th className='text-left py-2.5 pr-4 font-semibold hidden sm:table-cell'>Profissional</th>
                            <th className='text-center py-2.5 pr-4 font-semibold'>Sessões</th>
                            <th className='text-center py-2.5 pr-4 font-semibold hidden md:table-cell'>Dias</th>
                            <th className='text-right py-2.5 pr-5 font-semibold'>Gravidade</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-50 dark:divide-gray-700/40'>
                        {LONG_TREATMENTS.map((r, i) => (
                            <tr key={i} className='hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors'>
                                <td className='py-3 px-5'>
                                    <div className='flex items-center gap-2'>
                                        <div className='w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0'>
                                            <HiOutlineUser className='w-3.5 h-3.5 text-gray-400' />
                                        </div>
                                        <span className='font-medium text-gray-700 dark:text-gray-200'>{r.patient}</span>
                                    </div>
                                </td>
                                <td className='py-3 pr-4 text-gray-500 dark:text-gray-400 hidden md:table-cell'>{r.procedure}</td>
                                <td className='py-3 pr-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell'>{r.professional}</td>
                                <td className='py-3 pr-4 text-center'>
                                    <span className='font-bold text-gray-800 dark:text-gray-100'>{r.sessions}</span>
                                    <span className='text-gray-400 dark:text-gray-500 ml-1'>/ {r.expected} prev.</span>
                                </td>
                                <td className='py-3 pr-4 text-center text-gray-500 dark:text-gray-400 hidden md:table-cell'>{r.days}d</td>
                                <td className='py-3 pr-5 text-right'><SeverityPill severity={r.severity} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuditSection>
    )
}

// ─── Section 2 — Retorno excessivo ───────────────────────────────────────────

function ExcessiveReturnsSection() {
    const counts = countBySev(EXCESSIVE_RETURNS)
    return (
        <AuditSection
            icon={<HiOutlineArrowCircleUp className='w-5 h-5' />}
            title='Retorno Excessivo'
            description='Pacientes que retornam além do limite esperado para o tratamento'
            tip='Retornos acima de 3× após o procedimento principal podem indicar insatisfação, intercorrências clínicas ou falta de definição de alta.'
            counts={counts}
            total={EXCESSIVE_RETURNS.length}
            accentColor='amber'
        >
            <div className='overflow-x-auto'>
                <table className='w-full text-xs'>
                    <thead>
                        <tr className='text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                            <th className='text-left py-2.5 px-5 font-semibold'>Paciente</th>
                            <th className='text-left py-2.5 pr-4 font-semibold hidden sm:table-cell'>Profissional</th>
                            <th className='text-left py-2.5 pr-4 font-semibold hidden md:table-cell'>Motivo declarado</th>
                            <th className='text-center py-2.5 pr-4 font-semibold'>Retornos</th>
                            <th className='text-center py-2.5 pr-4 font-semibold hidden md:table-cell'>Último</th>
                            <th className='text-right py-2.5 pr-5 font-semibold'>Gravidade</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-50 dark:divide-gray-700/40'>
                        {EXCESSIVE_RETURNS.map((r, i) => (
                            <tr key={i} className='hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors'>
                                <td className='py-3 px-5'>
                                    <div className='flex items-center gap-2'>
                                        <div className='w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0'>
                                            <HiOutlineUser className='w-3.5 h-3.5 text-gray-400' />
                                        </div>
                                        <span className='font-medium text-gray-700 dark:text-gray-200'>{r.patient}</span>
                                    </div>
                                </td>
                                <td className='py-3 pr-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell'>{r.professional}</td>
                                <td className='py-3 pr-4 text-gray-500 dark:text-gray-400 hidden md:table-cell'>{r.reason}</td>
                                <td className='py-3 pr-4 text-center'>
                                    <span className='font-bold text-gray-800 dark:text-gray-100'>{r.returns}</span>
                                    <span className='text-gray-400 dark:text-gray-500 ml-1'>/ {r.threshold} limit.</span>
                                </td>
                                <td className='py-3 pr-4 text-center text-gray-500 dark:text-gray-400 hidden md:table-cell'>{r.lastReturn}</td>
                                <td className='py-3 pr-5 text-right'><SeverityPill severity={r.severity} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuditSection>
    )
}

// ─── Section 3 — Retrabalho ───────────────────────────────────────────────────

function ReworkSection() {
    const counts = countBySev(REWORK)
    return (
        <AuditSection
            icon={<HiOutlineExclamation className='w-5 h-5' />}
            title='Retrabalho Recorrente'
            description='Procedimentos refeitos 2 ou mais vezes no mesmo paciente'
            tip='Retrabalho recorrente no mesmo procedimento é um sinal claro de falha técnica, materiais inadequados ou expectativas mal gerenciadas. Requer revisão do protocolo do profissional.'
            counts={counts}
            total={REWORK.length}
            accentColor='red'
        >
            <div className='overflow-x-auto'>
                <table className='w-full text-xs'>
                    <thead>
                        <tr className='text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                            <th className='text-left py-2.5 px-5 font-semibold'>Paciente</th>
                            <th className='text-left py-2.5 pr-4 font-semibold hidden sm:table-cell'>Profissional</th>
                            <th className='text-left py-2.5 pr-4 font-semibold hidden md:table-cell'>Procedimento refeito</th>
                            <th className='text-center py-2.5 pr-4 font-semibold'>Vezes</th>
                            <th className='text-center py-2.5 pr-4 font-semibold hidden md:table-cell'>1ª vez</th>
                            <th className='text-center py-2.5 pr-4 font-semibold hidden md:table-cell'>Última vez</th>
                            <th className='text-right py-2.5 pr-5 font-semibold'>Gravidade</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-50 dark:divide-gray-700/40'>
                        {REWORK.map((r, i) => (
                            <tr key={i} className='hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors'>
                                <td className='py-3 px-5'>
                                    <div className='flex items-center gap-2'>
                                        <div className='w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0'>
                                            <HiOutlineUser className='w-3.5 h-3.5 text-gray-400' />
                                        </div>
                                        <span className='font-medium text-gray-700 dark:text-gray-200'>{r.patient}</span>
                                    </div>
                                </td>
                                <td className='py-3 pr-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell'>{r.professional}</td>
                                <td className='py-3 pr-4 text-gray-500 dark:text-gray-400 hidden md:table-cell'>{r.procedure}</td>
                                <td className='py-3 pr-4 text-center'>
                                    <span className='font-bold text-red-500'>{r.reworkCount}×</span>
                                </td>
                                <td className='py-3 pr-4 text-center text-gray-500 dark:text-gray-400 hidden md:table-cell'>{r.firstDate}</td>
                                <td className='py-3 pr-4 text-center text-gray-500 dark:text-gray-400 hidden md:table-cell'>{r.lastDate}</td>
                                <td className='py-3 pr-5 text-right'><SeverityPill severity={r.severity} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuditSection>
    )
}

// ─── Section 4 — Prontuário incompleto ───────────────────────────────────────

function IncompleteRecordsSection() {
    const counts = countBySev(INCOMPLETE_RECORDS)
    return (
        <AuditSection
            icon={<HiOutlineDocumentText className='w-5 h-5' />}
            title='Prontuário Incompleto'
            description='Pacientes com sessões recentes e documentação clínica faltando'
            tip='Prontuários incompletos expõem a clínica a riscos legais e dificultam a continuidade do tratamento. Preencha as pendências antes da próxima consulta.'
            counts={counts}
            total={INCOMPLETE_RECORDS.length}
            accentColor='indigo'
        >
            <div className='overflow-x-auto'>
                <table className='w-full text-xs'>
                    <thead>
                        <tr className='text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                            <th className='text-left py-2.5 px-5 font-semibold'>Paciente</th>
                            <th className='text-left py-2.5 pr-4 font-semibold hidden sm:table-cell'>Profissional</th>
                            <th className='text-left py-2.5 pr-4 font-semibold'>Pendências</th>
                            <th className='text-center py-2.5 pr-4 font-semibold hidden md:table-cell'>Última sessão</th>
                            <th className='text-right py-2.5 pr-5 font-semibold'>Gravidade</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-50 dark:divide-gray-700/40'>
                        {INCOMPLETE_RECORDS.map((r, i) => (
                            <tr key={i} className='hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors'>
                                <td className='py-3 px-5'>
                                    <div className='flex items-center gap-2'>
                                        <div className='w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0'>
                                            <HiOutlineUser className='w-3.5 h-3.5 text-gray-400' />
                                        </div>
                                        <span className='font-medium text-gray-700 dark:text-gray-200'>{r.patient}</span>
                                    </div>
                                </td>
                                <td className='py-3 pr-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell'>{r.professional}</td>
                                <td className='py-3 pr-4'>
                                    <div className='flex flex-wrap gap-1'>
                                        {r.missing.map((m, j) => (
                                            <span key={j} className='text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/40'>
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className='py-3 pr-4 text-center text-gray-500 dark:text-gray-400 hidden md:table-cell'>{r.lastSession}</td>
                                <td className='py-3 pr-5 text-right'><SeverityPill severity={r.severity} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuditSection>
    )
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, colorClass, bgClass }) {
    return (
        <div className={`${bgClass} rounded-2xl border p-4 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                {icon}
            </div>
            <div>
                <p className='text-2xl font-bold text-gray-800 dark:text-gray-100 tabular-nums'>{value}</p>
                <p className='text-xs font-medium text-gray-500 dark:text-gray-400'>{label}</p>
                {sub && <p className='text-[10px] text-gray-400 dark:text-gray-500 mt-0.5'>{sub}</p>}
            </div>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const totalCritico = [LONG_TREATMENTS, EXCESSIVE_RETURNS, REWORK, INCOMPLETE_RECORDS]
    .flat().filter(i => i.severity === 'critico').length
const totalAtencao = [LONG_TREATMENTS, EXCESSIVE_RETURNS, REWORK, INCOMPLETE_RECORDS]
    .flat().filter(i => i.severity === 'atencao').length
const totalLeve = [LONG_TREATMENTS, EXCESSIVE_RETURNS, REWORK, INCOMPLETE_RECORDS]
    .flat().filter(i => i.severity === 'leve').length
const totalAll = totalCritico + totalAtencao + totalLeve

export default function ClinicalAuditIndex() {
    const [refreshKey, setRefreshKey] = useState(0)
    const now = new Date().toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    return (
        <div className='p-4 md:p-6 space-y-5'>

            {/* ── Header ── */}
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
                <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40 flex items-center justify-center flex-shrink-0'>
                        <HiOutlineShieldCheck className='w-5 h-5 text-violet-500' />
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-gray-800 dark:text-gray-100'>Auditoria Clínica</h1>
                        <p className='text-sm text-gray-400 dark:text-gray-500 mt-0.5'>
                            Detecta anomalias em tratamentos, retornos, retrabalhos e prontuários
                        </p>
                    </div>
                </div>
                <div className='flex items-center gap-2 flex-shrink-0'>
                    <span className='hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500'>
                        <HiOutlineCalendar className='w-3.5 h-3.5' />
                        Atualizado em {now}
                    </span>
                    <button
                        onClick={() => setRefreshKey(k => k + 1)}
                        className='flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                    >
                        <HiOutlineRefresh className='w-4 h-4' />
                        <span className='hidden sm:inline'>Atualizar</span>
                    </button>
                </div>
            </div>

            {/* ── KPIs ── */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                <KpiCard
                    label='Total de alertas'
                    value={totalAll}
                    sub='4 categorias'
                    icon={<HiOutlineShieldCheck className='w-5 h-5 text-violet-500' />}
                    colorClass='bg-violet-50 dark:bg-violet-900/20 text-violet-500'
                    bgClass='bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50'
                />
                <KpiCard
                    label='Críticos'
                    value={totalCritico}
                    sub='Ação imediata'
                    icon={<HiOutlineExclamation className='w-5 h-5 text-red-500' />}
                    colorClass='bg-red-50 dark:bg-red-900/20 text-red-500'
                    bgClass='bg-white dark:bg-gray-800/50 border-red-100 dark:border-red-800/30'
                />
                <KpiCard
                    label='Atenção'
                    value={totalAtencao}
                    sub='Investigar'
                    icon={<HiOutlineClipboard className='w-5 h-5 text-amber-500' />}
                    colorClass='bg-amber-50 dark:bg-amber-900/20 text-amber-500'
                    bgClass='bg-white dark:bg-gray-800/50 border-amber-100 dark:border-amber-800/30'
                />
                <KpiCard
                    label='Leves'
                    value={totalLeve}
                    sub='Monitorar'
                    icon={<HiOutlineBadgeCheck className='w-5 h-5 text-sky-500' />}
                    colorClass='bg-sky-50 dark:bg-sky-900/20 text-sky-500'
                    bgClass='bg-white dark:bg-gray-800/50 border-sky-100 dark:border-sky-800/30'
                />
            </div>

            {/* ── Banner aviso dados demo ── */}
            <div className='flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30'>
                <HiOutlineInformationCircle className='w-4 h-4 text-amber-500 flex-shrink-0' />
                <p className='text-xs text-amber-700 dark:text-amber-400'>
                    <strong>Modo demonstração</strong> — os dados abaixo são ilustrativos. A integração com prontuários reais está em desenvolvimento.
                </p>
            </div>

            {/* ── Sections ── */}
            <LongTreatmentsSection key={`lt-${refreshKey}`} />
            <ExcessiveReturnsSection key={`er-${refreshKey}`} />
            <ReworkSection key={`rw-${refreshKey}`} />
            <IncompleteRecordsSection key={`ir-${refreshKey}`} />

        </div>
    )
}
