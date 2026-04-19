import { useEffect, useState } from 'react'
import { useAppSelector } from '@/store'
import { Card } from '@/components/ui'
import {
    HiOutlineCalendar, HiOutlineUsers, HiOutlineClock,
    HiOutlineCurrencyDollar, HiOutlineChartBar, HiOutlineExclamationCircle,
    HiOutlineCheckCircle, HiOutlineClipboardList, HiOutlineBell,
    HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineRefresh,
    HiOutlineShieldExclamation, HiOutlineBeaker, HiOutlineDocumentText,
    HiOutlinePencilAlt, HiOutlineUserGroup, HiOutlineArchive,
    HiOutlineCreditCard, HiOutlineReceiptTax, HiOutlineThumbUp,
    HiOutlineX, HiOutlineArrowRight,
} from 'react-icons/hi'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
}

const fmtDate = (d) =>
    d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

const fmtTime = (d) =>
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

const fmtMoney = (v) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub, color = 'violet', trend, trendUp }) => {
    const colors = {
        violet:  { bg: 'bg-violet-50 dark:bg-violet-900/20',  icon: 'text-violet-600',  ring: 'ring-violet-100 dark:ring-violet-800' },
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600', ring: 'ring-emerald-100 dark:ring-emerald-800' },
        amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',    icon: 'text-amber-600',   ring: 'ring-amber-100 dark:ring-amber-800' },
        rose:    { bg: 'bg-rose-50 dark:bg-rose-900/20',      icon: 'text-rose-600',    ring: 'ring-rose-100 dark:ring-rose-800' },
        sky:     { bg: 'bg-sky-50 dark:bg-sky-900/20',        icon: 'text-sky-600',     ring: 'ring-sky-100 dark:ring-sky-800' },
        indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-900/20',  icon: 'text-indigo-600',  ring: 'ring-indigo-100 dark:ring-indigo-800' },
    }
    const c = colors[color] ?? colors.violet

    return (
        <Card className='border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow duration-200'>
            <div className='flex items-start justify-between'>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-1 ${c.bg} ${c.ring}`}>
                    <span className={`w-5 h-5 ${c.icon}`}>{icon}</span>
                </div>
                {trend !== undefined && (
                    <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {trendUp ? <HiOutlineTrendingUp className='w-3.5 h-3.5' /> : <HiOutlineTrendingDown className='w-3.5 h-3.5' />}
                        {trend}
                    </span>
                )}
            </div>
            <div className='mt-3'>
                <p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>{value}</p>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5'>{label}</p>
                {sub && <p className='text-xs text-gray-400 mt-1'>{sub}</p>}
            </div>
        </Card>
    )
}

// ─── Financial card ───────────────────────────────────────────────────────────

const FinCard = ({ icon, label, value, sub, color = 'emerald', highlight }) => {
    const colors = {
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', icon: 'text-emerald-600' },
        amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',     text: 'text-amber-700 dark:text-amber-400',     icon: 'text-amber-600' },
        rose:    { bg: 'bg-rose-50 dark:bg-rose-900/20',       text: 'text-rose-700 dark:text-rose-400',       icon: 'text-rose-600' },
        sky:     { bg: 'bg-sky-50 dark:bg-sky-900/20',         text: 'text-sky-700 dark:text-sky-400',         icon: 'text-sky-600' },
        violet:  { bg: 'bg-violet-50 dark:bg-violet-900/20',   text: 'text-violet-700 dark:text-violet-400',   icon: 'text-violet-600' },
    }
    const c = colors[color] ?? colors.emerald

    return (
        <div className={`flex items-center gap-4 p-4 rounded-xl ${c.bg} border border-transparent`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/70 dark:bg-gray-900/40 shadow-sm flex-shrink-0 ${c.icon}`}>
                {icon}
            </div>
            <div className='flex-1 min-w-0'>
                <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate'>{label}</p>
                <p className={`text-lg font-bold ${c.text} leading-tight`}>{value}</p>
                {sub && <p className='text-[11px] text-gray-400 mt-0.5'>{sub}</p>}
            </div>
        </div>
    )
}

// ─── Pending task row ─────────────────────────────────────────────────────────

const TaskRow = ({ icon, label, count, color = 'amber' }) => {
    const colors = {
        amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        rose:   'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
        sky:    'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
        gray:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    }
    return (
        <div className='flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0 group hover:bg-gray-50 dark:hover:bg-gray-800/40 -mx-4 px-4 rounded-lg transition-colors cursor-pointer'>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${colors[color] ?? colors.amber}`}>
                {icon}
            </span>
            <span className='flex-1 text-sm text-gray-700 dark:text-gray-300'>{label}</span>
            {count > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[color] ?? colors.amber}`}>{count}</span>
            )}
            <HiOutlineArrowRight className='w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity' />
        </div>
    )
}

// ─── Alert row ────────────────────────────────────────────────────────────────

const AlertRow = ({ icon, label, sub, color = 'rose' }) => {
    const colors = {
        rose:   { dot: 'bg-rose-500',   bg: 'bg-rose-50 dark:bg-rose-900/20',   text: 'text-rose-700 dark:text-rose-400' },
        amber:  { dot: 'bg-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400' },
        orange: { dot: 'bg-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400' },
    }
    const c = colors[color] ?? colors.rose
    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl mb-2 last:mb-0 ${c.bg}`}>
            <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
            <div className='min-w-0'>
                <p className={`text-sm font-semibold ${c.text}`}>{label}</p>
                {sub && <p className='text-xs text-gray-400 mt-0.5'>{sub}</p>}
            </div>
        </div>
    )
}

// ─── Clinical indicator ───────────────────────────────────────────────────────

const ClinicalRow = ({ icon, label, value, color = 'indigo' }) => {
    const colors = {
        indigo:  'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
        violet:  'text-violet-600 bg-violet-50 dark:bg-violet-900/20',
        emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
        amber:   'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
        rose:    'text-rose-600 bg-rose-50 dark:bg-rose-900/20',
        sky:     'text-sky-600 bg-sky-50 dark:bg-sky-900/20',
    }
    return (
        <div className='flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0'>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${colors[color] ?? colors.indigo}`}>
                {icon}
            </span>
            <span className='flex-1 text-sm text-gray-600 dark:text-gray-400'>{label}</span>
            <span className='text-sm font-bold text-gray-800 dark:text-gray-200'>{value}</span>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const Home = () => {
    const userName    = useAppSelector((s) => s.auth.user.userName)
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 30000)
        return () => clearInterval(t)
    }, [])

    const firstName = userName?.split(' ')[0] ?? 'Usuário'

    // ── mock data (substituir por chamadas reais de API) ──────────────────────

    const today = {
        appointments: 18,
        attended: 11,
        waiting: 3,
        absent: 2,
        attendanceRate: 85,
    }

    const financial = {
        today:       4850.00,
        month:       62340.00,
        pending:     18920.00,
        insurance:   7450.00,
        payable:     3200.00,
        avgTicket:   312.50,
    }

    const clinical = {
        proceduresToday:   14,
        evaluationsConverted: 7,
        prosthesisOngoing: 5,
        implantsOngoing:   3,
        orthodonticsActive: 22,
        absenceRate:       '11%',
    }

    const pendingTasks = [
        { label: 'Autorizações de convênio pendentes', count: 4, color: 'amber',  icon: <HiOutlineShieldExclamation /> },
        { label: 'Orçamentos aguardando aprovação',    count: 7, color: 'violet', icon: <HiOutlineReceiptTax /> },
        { label: 'Exames para analisar',               count: 2, color: 'sky',    icon: <HiOutlineBeaker /> },
        { label: 'Assinaturas pendentes',              count: 3, color: 'rose',   icon: <HiOutlinePencilAlt /> },
        { label: 'Documentos incompletos',             count: 5, color: 'amber',  icon: <HiOutlineDocumentText /> },
        { label: 'Prontuários não finalizados',        count: 6, color: 'gray',   icon: <HiOutlineClipboardList /> },
    ]

    const alerts = [
        { label: 'Convênio Unimed vencendo em 3 dias', sub: 'Renovar contrato antes de 21/04', color: 'rose' },
        { label: 'Estoque crítico: Luvas P',            sub: 'Apenas 2 caixas restantes',        color: 'amber' },
        { label: '3 boletos vencem amanhã',             sub: 'Total: R$ 1.240,00',               color: 'rose' },
        { label: 'Equipamento: Autoclave precisa de revisão', sub: 'Última manutenção: 60 dias', color: 'orange' },
    ]

    const totalPending = pendingTasks.reduce((acc, t) => acc + t.count, 0)

    return (
        <div className='space-y-6 pb-8'>

            {/* ── Welcome header ── */}
            <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4f39f6] via-[#6d4ff6] to-[#8b5cf6] p-6 text-white shadow-xl shadow-violet-200/40 dark:shadow-violet-900/30'>
                <div className='absolute inset-0 opacity-10' style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
                <div className='relative flex items-start justify-between gap-4 flex-wrap'>
                    <div>
                        <p className='text-violet-200 text-sm font-medium mb-1'>{fmtDate(now)}</p>
                        <h2 className='text-2xl font-bold'>{greeting()}, {firstName} 👋</h2>
                        <p className='text-violet-200 text-sm mt-1'>
                            Você tem <span className='text-white font-semibold'>{today.appointments - today.attended} pacientes</span> restantes hoje
                            e <span className='text-white font-semibold'>{totalPending} pendências</span> operacionais.
                        </p>
                    </div>
                    <div className='text-right'>
                        <p className='text-4xl font-bold tabular-nums tracking-tight'>{fmtTime(now)}</p>
                        <p className='text-violet-200 text-xs mt-1'>atualizado agora</p>
                    </div>
                </div>

                {/* Mini progress bar of the day */}
                <div className='relative mt-5'>
                    <div className='flex justify-between text-xs text-violet-200 mb-1.5'>
                        <span>{today.attended} atendidos</span>
                        <span>{today.appointments} agendados</span>
                    </div>
                    <div className='h-2 bg-white/20 rounded-full overflow-hidden'>
                        <div
                            className='h-full bg-white rounded-full transition-all duration-700'
                            style={{ width: `${(today.attended / today.appointments) * 100}%` }}
                        />
                    </div>
                    <p className='text-xs text-violet-200 mt-1'>
                        {Math.round((today.attended / today.appointments) * 100)}% do dia concluído
                    </p>
                </div>
            </div>

            {/* ── Today overview ── */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                <StatCard
                    icon={<HiOutlineCalendar className='w-5 h-5' />}
                    label='Agendamentos Hoje'
                    value={today.appointments}
                    sub='Total do dia'
                    color='violet'
                    trend='+3 vs ontem'
                    trendUp
                />
                <StatCard
                    icon={<HiOutlineCheckCircle className='w-5 h-5' />}
                    label='Pacientes Atendidos'
                    value={today.attended}
                    sub={`${today.waiting} aguardando`}
                    color='emerald'
                />
                <StatCard
                    icon={<HiOutlineClock className='w-5 h-5' />}
                    label='Aguardando'
                    value={today.waiting}
                    sub='Na sala de espera'
                    color='amber'
                />
                <StatCard
                    icon={<HiOutlineUsers className='w-5 h-5' />}
                    label='Taxa de Presença'
                    value={`${today.attendanceRate}%`}
                    sub={`${today.absent} falt${today.absent === 1 ? 'a' : 'as'} hoje`}
                    color='sky'
                    trend='+5% vs média'
                    trendUp
                />
            </div>

            {/* ── Financial + Clinical ── */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

                {/* Financial */}
                <div className='lg:col-span-2'>
                    <Card className='border border-gray-100 dark:border-gray-700/50 h-full'>
                        <div className='flex items-center justify-between mb-4'>
                            <div>
                                <h4 className='font-bold text-gray-900 dark:text-gray-100'>Financeiro</h4>
                                <p className='text-xs text-gray-400'>Resumo em tempo real</p>
                            </div>
                            <div className='w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center'>
                                <HiOutlineCurrencyDollar className='w-4 h-4 text-emerald-600' />
                            </div>
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                            <FinCard
                                icon={<HiOutlineTrendingUp className='w-4 h-4' />}
                                label='Faturamento Hoje'
                                value={fmtMoney(financial.today)}
                                sub='Recebido até agora'
                                color='emerald'
                            />
                            <FinCard
                                icon={<HiOutlineChartBar className='w-4 h-4' />}
                                label='Faturamento do Mês'
                                value={fmtMoney(financial.month)}
                                sub='Abril / 2026'
                                color='violet'
                            />
                            <FinCard
                                icon={<HiOutlineClock className='w-4 h-4' />}
                                label='Recebimentos Pendentes'
                                value={fmtMoney(financial.pending)}
                                sub='A receber'
                                color='amber'
                            />
                            <FinCard
                                icon={<HiOutlineShieldExclamation className='w-4 h-4' />}
                                label='Convênios a Receber'
                                value={fmtMoney(financial.insurance)}
                                sub='Em aberto'
                                color='sky'
                            />
                            <FinCard
                                icon={<HiOutlineCreditCard className='w-4 h-4' />}
                                label='Contas a Pagar'
                                value={fmtMoney(financial.payable)}
                                sub='Vencimento próximo'
                                color='rose'
                            />
                            <FinCard
                                icon={<HiOutlineReceiptTax className='w-4 h-4' />}
                                label='Ticket Médio'
                                value={fmtMoney(financial.avgTicket)}
                                sub='Últimos 30 dias'
                                color='emerald'
                            />
                        </div>
                    </Card>
                </div>

                {/* Clinical production */}
                <div>
                    <Card className='border border-gray-100 dark:border-gray-700/50 h-full'>
                        <div className='flex items-center justify-between mb-4'>
                            <div>
                                <h4 className='font-bold text-gray-900 dark:text-gray-100'>Produção Clínica</h4>
                                <p className='text-xs text-gray-400'>Indicadores do dia</p>
                            </div>
                            <div className='w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center'>
                                <HiOutlineThumbUp className='w-4 h-4 text-indigo-600' />
                            </div>
                        </div>
                        <div>
                            <ClinicalRow
                                icon={<HiOutlineCheckCircle className='w-4 h-4' />}
                                label='Procedimentos realizados hoje'
                                value={clinical.proceduresToday}
                                color='emerald'
                            />
                            <ClinicalRow
                                icon={<HiOutlineTrendingUp className='w-4 h-4' />}
                                label='Avaliações convertidas'
                                value={clinical.evaluationsConverted}
                                color='violet'
                            />
                            <ClinicalRow
                                icon={<HiOutlineRefresh className='w-4 h-4' />}
                                label='Próteses em andamento'
                                value={clinical.prosthesisOngoing}
                                color='amber'
                            />
                            <ClinicalRow
                                icon={<HiOutlineBeaker className='w-4 h-4' />}
                                label='Implantes em andamento'
                                value={clinical.implantsOngoing}
                                color='sky'
                            />
                            <ClinicalRow
                                icon={<HiOutlineUserGroup className='w-4 h-4' />}
                                label='Ortodontia ativa'
                                value={clinical.orthodonticsActive}
                                color='indigo'
                            />
                            <ClinicalRow
                                icon={<HiOutlineX className='w-4 h-4' />}
                                label='Taxa de faltas'
                                value={clinical.absenceRate}
                                color='rose'
                            />
                        </div>
                    </Card>
                </div>
            </div>

            {/* ── Pending tasks + Alerts ── */}
            <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>

                {/* Pending tasks */}
                <div className='lg:col-span-3'>
                    <Card className='border border-gray-100 dark:border-gray-700/50'>
                        <div className='flex items-center justify-between mb-2'>
                            <div>
                                <h4 className='font-bold text-gray-900 dark:text-gray-100'>Pendências Operacionais</h4>
                                <p className='text-xs text-gray-400'>{totalPending} itens aguardando resolução</p>
                            </div>
                            <span className='px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'>
                                {totalPending}
                            </span>
                        </div>
                        <div>
                            {pendingTasks.map((t, i) => (
                                <TaskRow key={i} {...t} />
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Alerts */}
                <div className='lg:col-span-2'>
                    <Card className='border border-gray-100 dark:border-gray-700/50 h-full'>
                        <div className='flex items-center justify-between mb-3'>
                            <div>
                                <h4 className='font-bold text-gray-900 dark:text-gray-100'>Alertas</h4>
                                <p className='text-xs text-gray-400'>Requerem atenção imediata</p>
                            </div>
                            <div className='w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center'>
                                <HiOutlineBell className='w-4 h-4 text-rose-600' />
                            </div>
                        </div>
                        <div>
                            {alerts.map((a, i) => (
                                <AlertRow key={i} {...a} />
                            ))}
                        </div>

                        {/* Stock summary */}
                        <div className='mt-4 pt-4 border-t border-gray-100 dark:border-gray-800'>
                            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3'>Estoque</p>
                            <div className='grid grid-cols-3 gap-2'>
                                {[
                                    { label: 'Materiais críticos', value: 3, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
                                    { label: 'Itens vencendo',     value: 5, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
                                    { label: 'Compras pendentes',  value: 2, color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
                                ].map((s) => (
                                    <div key={s.label} className={`text-center py-2.5 px-1 rounded-xl ${s.color}`}>
                                        <p className='text-xl font-bold'>{s.value}</p>
                                        <p className='text-[10px] font-medium leading-tight mt-0.5'>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

        </div>
    )
}

export default Home
