import { useState, useEffect, useCallback } from 'react'
import {
    HiOutlineShieldCheck, HiOutlineCheck, HiOutlineX,
    HiOutlineHome, HiOutlineUserGroup, HiOutlineClipboard,
    HiOutlineCurrencyDollar, HiOutlineBeaker, HiOutlineCube,
    HiOutlineChartBar, HiOutlineCog, HiOutlineRefresh,
} from 'react-icons/hi'
import { Spinner, Notification, toast } from '@/components/ui'
import {
    roleProfilesGetAll,
    roleProfilesGetUserProfile,
    roleProfilesAssignUserProfile,
} from '@/api/authentication/AuthenticationService'
import { employeeUpdateRoleProfile } from '@/api/enterprise/EnterpriseService'

// ─── Feature groups (espelho do RoleManagement) ────────────────────────────────

const FEATURE_GROUPS = [
    {
        key: 'geral', label: 'Geral', color: 'indigo', Icon: HiOutlineHome,
        items: [{ key: 'home', label: 'Home' }],
    },
    {
        key: 'equipe', label: 'Equipe', color: 'sky', Icon: HiOutlineUserGroup,
        items: [
            { key: 'employees', label: 'Funcionários' },
            { key: 'comissionamento', label: 'Comissionamento' },
        ],
    },
    {
        key: 'crm', label: 'CRM', color: 'emerald', Icon: HiOutlineClipboard,
        items: [
            { key: 'attendanceToday', label: 'Prontuário do Dia' },
            { key: 'appointmentFlow', label: 'Fluxo de Atendimento' },
            { key: 'calendar', label: 'Calendário' },
            { key: 'patients', label: 'Prontuários' },
            { key: 'leads', label: 'Funil de Vendas' },
            { key: 'returnControl', label: 'Controle de Retorno' },
        ],
    },
    {
        key: 'finance', label: 'Financeiro', color: 'amber', Icon: HiOutlineCurrencyDollar,
        items: [
            { key: 'cashFlowDashboard', label: 'Dashboard Financeiro' },
            { key: 'accountsReceivable', label: 'Contas a Receber' },
            { key: 'accountsPayable', label: 'Contas a Pagar' },
            { key: 'cashClosing', label: 'Fechamento de Caixa' },
            { key: 'costCenterGoals', label: 'Metas por Centro de Custo' },
            { key: 'financialAccounts', label: 'Contas' },
        ],
    },
    {
        key: 'prosthetics', label: 'Próteses', color: 'violet', Icon: HiOutlineBeaker,
        items: [
            { key: 'prosthesis', label: 'Controle de Próteses' },
            { key: 'prosthesisTypes', label: 'Tipos de Prótese' },
            { key: 'prosthesisLaboratories', label: 'Laboratórios' },
        ],
    },
    {
        key: 'inventory', label: 'Estoque', color: 'orange', Icon: HiOutlineCube,
        items: [
            { key: 'inventoryAdmin', label: 'Administração' },
            { key: 'inventoryRequest', label: 'Solicitar Itens' },
            { key: 'inventorySuppliersNav', label: 'Fornecedores' },
            { key: 'inventoryCategoriesNav', label: 'Categorias' },
            { key: 'inventoryOperations', label: 'Operações de Estoque' },
        ],
    },
    {
        key: 'reports', label: 'Relatórios', color: 'rose', Icon: HiOutlineChartBar,
        items: [
            { key: 'clinicalAudit', label: 'Auditoria Clínica' },
            { key: 'professionalPerformance', label: 'Performance Profissional' },
        ],
    },
    {
        key: 'settings', label: 'Configurações', color: 'slate', Icon: HiOutlineCog,
        items: [
            { key: 'estabelecimento', label: 'Estabelecimento' },
            { key: 'consultationType', label: 'Tipos de Atendimento' },
            { key: 'services_catalog', label: 'Serviços e Produtos' },
            { key: 'clinicProducts', label: 'Produtos da Clínica' },
            { key: 'roleManagement', label: 'Gerenciar Perfis' },
            { key: 'settingsTemplates', label: 'Contratos e Receitas' },
            { key: 'operadoras', label: 'Operadoras de Convênio' },
            { key: 'rooms', label: 'Salas' },
            { key: 'paymentMethods', label: 'Meios de Pagamento' },
            { key: 'chartOfAccounts', label: 'Plano de Contas' },
            { key: 'monitorSettings', label: 'Monitor de Chamadas' },
        ],
    },
]

const ALL_KEYS = FEATURE_GROUPS.flatMap(g => g.items.map(i => i.key))

const COLOR_STYLES = {
    indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-900/20',   text: 'text-indigo-600 dark:text-indigo-400',   dot: 'bg-indigo-400' },
    sky:     { bg: 'bg-sky-50 dark:bg-sky-900/20',         text: 'text-sky-600 dark:text-sky-400',         dot: 'bg-sky-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-400' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',     text: 'text-amber-600 dark:text-amber-400',     dot: 'bg-amber-400' },
    violet:  { bg: 'bg-violet-50 dark:bg-violet-900/20',   text: 'text-violet-600 dark:text-violet-400',   dot: 'bg-violet-400' },
    orange:  { bg: 'bg-orange-50 dark:bg-orange-900/20',   text: 'text-orange-600 dark:text-orange-400',   dot: 'bg-orange-400' },
    rose:    { bg: 'bg-rose-50 dark:bg-rose-900/20',       text: 'text-rose-600 dark:text-rose-400',       dot: 'bg-rose-400' },
    slate:   { bg: 'bg-slate-50 dark:bg-slate-900/20',     text: 'text-slate-600 dark:text-slate-400',     dot: 'bg-slate-400' },
}

const AVATAR_COLORS = ['bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-orange-500', 'bg-teal-500']
const avatarColor = (idx) => AVATAR_COLORS[idx % AVATAR_COLORS.length]
const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()

function normalisePerms(raw = {}) {
    return Object.fromEntries(ALL_KEYS.map(k => [k, raw[k] === true]))
}

// ─── EmptyState ────────────────────────────────────────────────────────────────

const EmptyState = ({ icon, message, sub }) => (
    <div className='flex flex-col items-center justify-center py-10 gap-2.5 select-none'>
        <div className='w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600'>
            <span className='text-2xl'>{icon}</span>
        </div>
        <div className='text-center'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{message}</p>
            {sub && <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>{sub}</p>}
        </div>
    </div>
)

// ─── Profile card (selectable) ─────────────────────────────────────────────────

const ProfileCard = ({ profile, selected, onSelect, idx }) => {
    const enabledCount = ALL_KEYS.filter(k => profile.permissions?.[k]).length

    return (
        <button
            type='button'
            onClick={() => onSelect(profile.publicId)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border ${
                selected
                    ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700/60 ring-1 ring-violet-300 dark:ring-violet-700'
                    : 'bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/70'
            }`}
        >
            {/* radio indicator */}
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                selected ? 'border-violet-600' : 'border-gray-300 dark:border-gray-600'
            }`}>
                {selected && <div className='w-2 h-2 rounded-full bg-violet-600' />}
            </div>

            {/* avatar */}
            <div className={`w-8 h-8 rounded-full ${avatarColor(idx)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                {initials(profile.name)}
            </div>

            {/* info */}
            <div className='flex-1 min-w-0'>
                <p className={`text-xs font-semibold truncate ${selected ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-200'}`}>
                    {profile.name}
                </p>
                {profile.description && (
                    <p className='text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5'>
                        {profile.description}
                    </p>
                )}
            </div>

            {/* count badge */}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                selected ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
                {enabledCount}
            </span>
        </button>
    )
}

// ─── Permissions panel (read-only) ────────────────────────────────────────────

const PermissionsPanel = ({ profile }) => {
    if (!profile) return (
        <EmptyState
            icon={<HiOutlineShieldCheck />}
            message='Nenhum perfil selecionado'
            sub='Selecione um perfil à esquerda para ver suas permissões'
        />
    )

    const perms = profile.permissions ?? {}

    return (
        <div className='space-y-3'>
            {FEATURE_GROUPS.map(group => {
                const cs = COLOR_STYLES[group.color] ?? COLOR_STYLES.slate
                const enabledInGroup = group.items.filter(i => perms[i.key]).length

                return (
                    <div key={group.key} className='rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden'>
                        {/* group header */}
                        <div className={`flex items-center gap-2.5 px-3 py-2 ${cs.bg}`}>
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${cs.bg}`}>
                                <group.Icon className={`w-3 h-3 ${cs.text}`} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${cs.text}`}>{group.label}</span>
                            <span className='ml-auto text-[10px] text-gray-400 dark:text-gray-500'>
                                {enabledInGroup}/{group.items.length}
                            </span>
                        </div>

                        {/* items grid */}
                        <div className='bg-white dark:bg-gray-800/30 px-3 py-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1'>
                            {group.items.map(item => {
                                const on = !!perms[item.key]
                                return (
                                    <div key={item.key} className='flex items-center gap-2 py-1'>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            on ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-700/50'
                                        }`}>
                                            {on
                                                ? <HiOutlineCheck className='w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400' />
                                                : <HiOutlineX className='w-2.5 h-2.5 text-gray-400 dark:text-gray-600' />
                                            }
                                        </div>
                                        <span className={`text-xs ${on ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-400 dark:text-gray-600'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

const EmployeeTabPermissions = ({ data }) => {
    const [profiles,          setProfiles]          = useState([])
    const [currentProfileId,  setCurrentProfileId]  = useState(null)
    const [selectedProfileId, setSelectedProfileId] = useState(null)
    const [loading,           setLoading]           = useState(true)
    const [saving,            setSaving]            = useState(false)

    const load = useCallback(async () => {
        if (!data?.publicId) return
        setLoading(true)

        const [profilesRes, userProfileRes] = await Promise.all([
            roleProfilesGetAll(),
            roleProfilesGetUserProfile(data.publicId),
        ])

        if (profilesRes?.data) {
            setProfiles(profilesRes.data.map(p => ({
                ...p,
                permissions: normalisePerms(p.permissions),
            })))
        }

        const savedId = userProfileRes?.data?.profileId ?? null
        setCurrentProfileId(savedId)
        setSelectedProfileId(savedId)

        setLoading(false)
    }, [data?.publicId])

    useEffect(() => { load() }, [load])

    const isDirty = selectedProfileId !== currentProfileId

    const selectedProfile = profiles.find(p => p.publicId === selectedProfileId) ?? null

    const handleSave = async () => {
        setSaving(true)
        const [authResult, enterpriseResult] = await Promise.all([
            roleProfilesAssignUserProfile(data.publicId, selectedProfileId),
            employeeUpdateRoleProfile(data.publicId, selectedProfileId),
        ])
        if (authResult?.data !== undefined && enterpriseResult?.data !== undefined) {
            setCurrentProfileId(selectedProfileId)
            toast.push(<Notification type='success' title='Salvo'>Perfil de acesso atualizado com sucesso.</Notification>)
        }
        setSaving(false)
    }

    if (loading) return (
        <div className='flex items-center justify-center h-48'>
            <Spinner size='lg' />
        </div>
    )

    return (
        <div className='flex flex-col gap-4'>

            {/* ── Header ── */}
            <div className='flex items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/50'>
                <div className='flex items-center gap-2.5'>
                    <div className='w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0'>
                        <HiOutlineShieldCheck className='w-4 h-4 text-violet-600 dark:text-violet-400' />
                    </div>
                    <div>
                        <p className='text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight'>Perfil de Acesso</p>
                        <p className='text-[11px] text-gray-400 dark:text-gray-500'>
                            {selectedProfile ? `${selectedProfile.name} · ${ALL_KEYS.filter(k => selectedProfile.permissions?.[k]).length} permissões` : 'Nenhum perfil selecionado'}
                        </p>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={load}
                        className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors'
                        title='Recarregar'
                    >
                        <HiOutlineRefresh className='w-3.5 h-3.5' />
                    </button>
                    {isDirty && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors disabled:opacity-40'
                        >
                            {saving ? <Spinner size='xs' /> : <HiOutlineCheck className='w-3.5 h-3.5' />}
                            Salvar
                        </button>
                    )}
                </div>
            </div>

            {profiles.length === 0 ? (
                <EmptyState
                    icon={<HiOutlineShieldCheck />}
                    message='Nenhum perfil disponível'
                    sub='Crie perfis em Configurações → Gerenciar Perfis'
                />
            ) : (
                <div className='flex flex-col md:flex-row gap-4 md:gap-5'>

                    {/* ── Profile selector (left) ── */}
                    <div className='md:w-56 flex-shrink-0'>
                        <p className='text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1'>
                            Selecionar Perfil
                        </p>
                        <div className='space-y-1.5'>
                            {profiles.map((profile, i) => (
                                <ProfileCard
                                    key={profile.publicId}
                                    profile={profile}
                                    selected={profile.publicId === selectedProfileId}
                                    onSelect={setSelectedProfileId}
                                    idx={i}
                                />
                            ))}
                        </div>
                        {isDirty && (
                            <button
                                onClick={() => setSelectedProfileId(currentProfileId)}
                                className='mt-2 w-full text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-center'
                            >
                                Desfazer alteração
                            </button>
                        )}
                    </div>

                    {/* ── Permissions view (right) ── */}
                    <div className='flex-1 min-w-0'>
                        {selectedProfile ? (
                            <>
                                <p className='text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1'>
                                    O que este perfil pode acessar
                                </p>
                                <PermissionsPanel profile={selectedProfile} />
                            </>
                        ) : (
                            <div className='h-full flex items-center justify-center'>
                                <EmptyState
                                    icon={<HiOutlineShieldCheck />}
                                    message='Nenhum perfil selecionado'
                                    sub='Selecione um perfil à esquerda para ver as permissões'
                                />
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    )
}

export default EmployeeTabPermissions
