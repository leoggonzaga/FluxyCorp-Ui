import { useState, useMemo, useCallback, useEffect } from 'react'
import {
    HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineX,
    HiOutlineCheck, HiOutlineHome, HiOutlineUserGroup, HiOutlineClipboard,
    HiOutlineCurrencyDollar, HiOutlineBeaker, HiOutlineCube, HiOutlineChartBar,
    HiOutlineCog, HiOutlineShieldCheck, HiOutlineChevronDown, HiOutlineChevronUp,
    HiOutlineSwitchHorizontal, HiOutlineRefresh,
} from 'react-icons/hi'
import { Notification, toast, Spinner } from '@/components/ui'
import {
    roleProfilesGetAll,
    roleProfilesCreate,
    roleProfilesUpdate,
    roleProfilesDelete,
} from '@/api/authentication/AuthenticationService'

// ─── Feature groups ────────────────────────────────────────────────────────────

const FEATURE_GROUPS = [
    {
        key: 'geral',
        label: 'Geral',
        color: 'indigo',
        Icon: HiOutlineHome,
        items: [
            { key: 'home', label: 'Home' },
        ],
    },
    {
        key: 'equipe',
        label: 'Equipe',
        color: 'sky',
        Icon: HiOutlineUserGroup,
        items: [
            { key: 'employees',       label: 'Funcionários' },
            { key: 'comissionamento', label: 'Comissionamento' },
        ],
    },
    {
        key: 'crm',
        label: 'CRM',
        color: 'emerald',
        Icon: HiOutlineClipboard,
        items: [
            { key: 'attendanceToday',  label: 'Prontuário do Dia' },
            { key: 'appointmentFlow',  label: 'Fluxo de Atendimento' },
            { key: 'calendar',         label: 'Calendário' },
            { key: 'patients',         label: 'Prontuários' },
            { key: 'leads',            label: 'Funil de Vendas' },
            { key: 'returnControl',    label: 'Controle de Retorno' },
        ],
    },
    {
        key: 'finance',
        label: 'Financeiro',
        color: 'amber',
        Icon: HiOutlineCurrencyDollar,
        items: [
            { key: 'cashFlowDashboard',  label: 'Dashboard Financeiro' },
            { key: 'accountsReceivable', label: 'Contas a Receber' },
            { key: 'accountsPayable',    label: 'Contas a Pagar' },
            { key: 'cashClosing',        label: 'Fechamento de Caixa' },
            { key: 'costCenterGoals',    label: 'Metas por Centro de Custo' },
            { key: 'financialAccounts',  label: 'Contas' },
        ],
    },
    {
        key: 'prosthetics',
        label: 'Próteses',
        color: 'violet',
        Icon: HiOutlineBeaker,
        items: [
            { key: 'prosthesis',              label: 'Controle de Próteses' },
            { key: 'prosthesisTypes',         label: 'Tipos de Prótese' },
            { key: 'prosthesisLaboratories',  label: 'Laboratórios' },
        ],
    },
    {
        key: 'inventory',
        label: 'Estoque',
        color: 'orange',
        Icon: HiOutlineCube,
        items: [
            { key: 'inventoryAdmin',          label: 'Administração' },
            { key: 'inventoryRequest',        label: 'Solicitar Itens' },
            { key: 'inventorySuppliersNav',   label: 'Fornecedores' },
            { key: 'inventoryCategoriesNav',  label: 'Categorias' },
            { key: 'inventoryOperations',     label: 'Operações de Estoque' },
        ],
    },
    {
        key: 'reports',
        label: 'Relatórios',
        color: 'rose',
        Icon: HiOutlineChartBar,
        items: [
            { key: 'clinicalAudit',            label: 'Auditoria Clínica' },
            { key: 'professionalPerformance',  label: 'Performance Profissional' },
        ],
    },
    {
        key: 'settings',
        label: 'Configurações',
        color: 'slate',
        Icon: HiOutlineCog,
        items: [
            { key: 'estabelecimento',   label: 'Estabelecimento' },
            { key: 'consultationType',  label: 'Tipos de Atendimento' },
            { key: 'services_catalog',  label: 'Serviços e Produtos' },
            { key: 'clinicProducts',    label: 'Produtos da Clínica' },
            { key: 'roleManagement',    label: 'Gerenciar Perfis' },
            { key: 'settingsTemplates', label: 'Contratos e Receitas' },
            { key: 'operadoras',        label: 'Operadoras de Convênio' },
            { key: 'rooms',             label: 'Salas' },
            { key: 'paymentMethods',    label: 'Meios de Pagamento' },
            { key: 'chartOfAccounts',   label: 'Plano de Contas' },
            { key: 'monitorSettings',   label: 'Monitor de Chamadas' },
        ],
    },
]

const ALL_KEYS = FEATURE_GROUPS.flatMap(g => g.items.map(i => i.key))

const COLOR_STYLES = {
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500', ring: 'ring-indigo-200 dark:ring-indigo-800/60' },
    sky:    { bg: 'bg-sky-50 dark:bg-sky-900/20',       text: 'text-sky-600 dark:text-sky-400',       dot: 'bg-sky-500',    ring: 'ring-sky-200 dark:ring-sky-800/60' },
    emerald:{ bg: 'bg-emerald-50 dark:bg-emerald-900/20',text:'text-emerald-600 dark:text-emerald-400',dot:'bg-emerald-500', ring:'ring-emerald-200 dark:ring-emerald-800/60'},
    amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-600 dark:text-amber-400',   dot: 'bg-amber-500',  ring: 'ring-amber-200 dark:ring-amber-800/60' },
    violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500', ring: 'ring-violet-200 dark:ring-violet-800/60' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500', ring: 'ring-orange-200 dark:ring-orange-800/60' },
    rose:   { bg: 'bg-rose-50 dark:bg-rose-900/20',     text: 'text-rose-600 dark:text-rose-400',     dot: 'bg-rose-500',   ring: 'ring-rose-200 dark:ring-rose-800/60' },
    slate:  { bg: 'bg-slate-50 dark:bg-slate-900/20',   text: 'text-slate-600 dark:text-slate-400',   dot: 'bg-slate-400',  ring: 'ring-slate-200 dark:ring-slate-700/60' },
}

const AVATAR_COLORS = ['bg-violet-500','bg-sky-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-indigo-500','bg-orange-500','bg-teal-500']
function avatarColor(idx) { return AVATAR_COLORS[idx % AVATAR_COLORS.length] }
function initials(name = '') { return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase() }
function countEnabled(perms) { return ALL_KEYS.filter(k => perms[k]).length }
function allPerms() { return Object.fromEntries(ALL_KEYS.map(k => [k, true])) }
function noPerms()  { return Object.fromEntries(ALL_KEYS.map(k => [k, false])) }

// normalise API response → internal format (fill missing keys with false)
function normalisePerms(raw = {}) {
    return Object.fromEntries(ALL_KEYS.map(k => [k, raw[k] === true]))
}

// ─── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }) {
    return (
        <button
            type='button'
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                checked ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'
            } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                checked ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
        </button>
    )
}

// ─── Feature group section ──────────────────────────────────────────────────────

function FeatureGroup({ group, permissions, onChange }) {
    const [open, setOpen] = useState(true)
    const cs = COLOR_STYLES[group.color] ?? COLOR_STYLES.slate
    const allOn = group.items.every(i => permissions[i.key])
    const count = group.items.filter(i => permissions[i.key]).length

    const toggleAll = () => {
        const next = !allOn
        group.items.forEach(i => onChange(i.key, next))
    }

    return (
        <div className='rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden'>
            <div className={`flex items-center gap-3 px-4 py-3 ${cs.bg}`}>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${cs.bg} ring-1 ${cs.ring}`}>
                    <group.Icon className={`w-3.5 h-3.5 ${cs.text}`} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${cs.text}`}>{group.label}</span>
                <span className='ml-auto flex items-center gap-3'>
                    <span className='text-[10px] text-gray-400 dark:text-gray-500'>{count}/{group.items.length}</span>
                    <button
                        type='button'
                        onClick={toggleAll}
                        className={`text-[10px] font-semibold transition-colors ${
                            allOn ? 'text-red-500 hover:text-red-700' : 'text-violet-600 dark:text-violet-400 hover:text-violet-800'
                        }`}
                    >
                        {allOn ? 'Remover todos' : 'Ativar todos'}
                    </button>
                    <button type='button' onClick={() => setOpen(o => !o)} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
                        {open ? <HiOutlineChevronUp className='w-3.5 h-3.5' /> : <HiOutlineChevronDown className='w-3.5 h-3.5' />}
                    </button>
                </span>
            </div>

            {open && (
                <div className='bg-white dark:bg-gray-800/30 divide-y divide-gray-50 dark:divide-gray-700/30'>
                    {group.items.map(item => (
                        <div key={item.key} className='flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors'>
                            <div className='flex items-center gap-2.5 min-w-0'>
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${permissions[item.key] ? cs.dot : 'bg-gray-200 dark:bg-gray-600'}`} />
                                <span className={`text-sm transition-colors ${permissions[item.key] ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {item.label}
                                </span>
                            </div>
                            <Toggle checked={!!permissions[item.key]} onChange={v => onChange(item.key, v)} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Create/Edit modal ─────────────────────────────────────────────────────────

function ProfileModal({ open, onClose, onSave, profiles, editing, saving }) {
    const [name, setName]         = useState(editing?.name        ?? '')
    const [description, setDesc]  = useState(editing?.description ?? '')
    const [copyFrom, setCopyFrom] = useState('')

    useEffect(() => {
        if (open) {
            setName(editing?.name ?? '')
            setDesc(editing?.description ?? '')
            setCopyFrom('')
        }
    }, [open, editing])

    if (!open) return null

    const handleSave = () => {
        if (!name.trim()) {
            toast.push(<Notification type='warning' title='Aviso'>Informe o nome do perfil.</Notification>)
            return
        }
        const base = copyFrom
            ? profiles.find(p => p.publicId === copyFrom)?.permissions ?? noPerms()
            : editing?.permissions ?? noPerms()
        onSave({ name: name.trim(), description: description.trim(), permissions: { ...base } })
    }

    const isCreate = !editing
    const accentBg   = isCreate ? 'bg-violet-600 hover:bg-violet-700' : 'bg-amber-500 hover:bg-amber-600'
    const accentIcon = isCreate
        ? 'bg-violet-100 dark:bg-violet-900/30'
        : 'bg-amber-100 dark:bg-amber-900/30'
    const accentIconText = isCreate
        ? 'text-violet-600 dark:text-violet-400'
        : 'text-amber-600 dark:text-amber-400'

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onClose} />
            <div className='relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden'>
                <div className='flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className={`w-8 h-8 rounded-lg ${accentIcon} flex items-center justify-center`}>
                        <HiOutlineShieldCheck className={`w-4 h-4 ${accentIconText}`} />
                    </div>
                    <h3 className='text-sm font-bold text-gray-800 dark:text-gray-100 flex-1'>
                        {editing ? 'Editar Perfil' : 'Novo Perfil'}
                    </h3>
                    <button onClick={onClose} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'>
                        <HiOutlineX className='w-5 h-5' />
                    </button>
                </div>
                <div className='px-5 py-5 space-y-4'>
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Nome do perfil *</label>
                        <input
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder='Ex: Supervisor'
                            className='w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-violet-400 placeholder:text-gray-300 dark:placeholder:text-gray-600'
                        />
                    </div>
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Descrição</label>
                        <input
                            value={description}
                            onChange={e => setDesc(e.target.value)}
                            placeholder='Breve descrição do perfil'
                            className='w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-violet-400 placeholder:text-gray-300 dark:placeholder:text-gray-600'
                        />
                    </div>
                    {isCreate && profiles.length > 0 && (
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Copiar permissões de</label>
                            <select
                                value={copyFrom}
                                onChange={e => setCopyFrom(e.target.value)}
                                className='w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:border-violet-400'
                            >
                                <option value=''>Começar sem permissões</option>
                                {profiles.map(p => (
                                    <option key={p.publicId} value={p.publicId}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className='flex gap-2 pt-1'>
                        <button onClick={onClose} disabled={saving}
                            className='flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40'>
                            Cancelar
                        </button>
                        <button onClick={handleSave} disabled={saving}
                            className={`flex-1 py-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2 ${accentBg}`}>
                            {saving && <Spinner size='sm' />}
                            {editing ? 'Salvar' : 'Criar Perfil'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

const EmptyState = ({ icon, message, sub, action }) => (
    <div className='flex flex-col items-center justify-center py-8 gap-2.5 select-none'>
        <div className='w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600'>
            <span className='text-2xl'>{icon}</span>
        </div>
        <div className='text-center'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{message}</p>
            {sub && <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>{sub}</p>}
        </div>
        {action && <div className='mt-1'>{action}</div>}
    </div>
)

// ─── Main ──────────────────────────────────────────────────────────────────────

const RoleManagement = () => {
    const [profiles,    setProfiles]    = useState([])
    const [loading,     setLoading]     = useState(true)
    const [selectedId,  setSelectedId]  = useState(null)   // publicId string
    const [pending,     setPending]     = useState(null)   // draft permissions
    const [modal,       setModal]       = useState(null)   // null | 'create' | profile-object
    const [saving,      setSaving]      = useState(false)
    const [mobileView,  setMobileView]  = useState('list')

    // ── load from API ──────────────────────────────────────────────────────────

    const load = useCallback(async () => {
        setLoading(true)
        const result = await roleProfilesGetAll()
        if (result?.data) {
            const normalised = result.data.map(p => ({
                ...p,
                permissions: normalisePerms(p.permissions),
            }))
            setProfiles(normalised)
            if (normalised.length > 0 && !selectedId) {
                setSelectedId(normalised[0].publicId)
                setPending({ ...normalised[0].permissions })
            }
        }
        setLoading(false)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { load() }, [load])

    // ── derived ────────────────────────────────────────────────────────────────

    const selected = profiles.find(p => p.publicId === selectedId) ?? null

    const isDirty = useMemo(() => {
        if (!pending || !selected) return false
        return ALL_KEYS.some(k => pending[k] !== selected.permissions[k])
    }, [pending, selected])

    const enabledCount = pending ? ALL_KEYS.filter(k => pending[k]).length : 0

    // ── actions ────────────────────────────────────────────────────────────────

    const selectProfile = useCallback((profile) => {
        setSelectedId(profile.publicId)
        setPending({ ...profile.permissions })
        setMobileView('editor')
    }, [])

    const handleToggle = useCallback((key, value) => {
        setPending(p => ({ ...p, [key]: value }))
    }, [])

    const handleSelectAll   = () => setPending(allPerms())
    const handleDeselectAll = () => setPending(noPerms())
    const handleDiscard     = () => selected && setPending({ ...selected.permissions })

    const handleSave = async () => {
        if (!selected || !pending) return
        setSaving(true)
        const result = await roleProfilesUpdate(selected.publicId, {
            name:        selected.name,
            description: selected.description,
            permissions: pending,
        })
        if (result?.data) {
            const updated = { ...selected, permissions: normalisePerms(result.data.permissions) }
            setProfiles(ps => ps.map(p => p.publicId === selected.publicId ? updated : p))
            setPending({ ...updated.permissions })
            toast.push(<Notification type='success' title='Salvo'>Permissões atualizadas com sucesso.</Notification>)
        }
        setSaving(false)
    }

    const handleCreate = async ({ name, description, permissions }) => {
        setSaving(true)
        const result = await roleProfilesCreate({ name, description, permissions })
        if (result?.data) {
            const np = { ...result.data, permissions: normalisePerms(result.data.permissions) }
            setProfiles(ps => [...ps, np])
            setModal(null)
            selectProfile(np)
            toast.push(<Notification type='success' title='Criado'>Perfil criado com sucesso.</Notification>)
        }
        setSaving(false)
    }

    const handleEditInfo = async ({ name, description }) => {
        if (!selected) return
        setSaving(true)
        const result = await roleProfilesUpdate(selected.publicId, {
            name,
            description,
            permissions: selected.permissions,
        })
        if (result?.data) {
            const updated = { ...selected, name: result.data.name, description: result.data.description }
            setProfiles(ps => ps.map(p => p.publicId === selected.publicId ? updated : p))
            setModal(null)
            toast.push(<Notification type='success' title='Atualizado'>Perfil atualizado.</Notification>)
        }
        setSaving(false)
    }

    const handleDelete = async (publicId) => {
        if (profiles.length === 1) {
            toast.push(<Notification type='warning' title='Aviso'>O sistema precisa de ao menos um perfil.</Notification>)
            return
        }
        const result = await roleProfilesDelete(publicId)
        // delete returns 204 No Content → response.data is "" (truthy check fails), check for non-null
        if (result !== null && result !== undefined) {
            const remaining = profiles.filter(p => p.publicId !== publicId)
            setProfiles(remaining)
            if (selectedId === publicId && remaining.length > 0) selectProfile(remaining[0])
            toast.push(<Notification type='success' title='Removido'>Perfil removido.</Notification>)
        }
    }

    // ── render ─────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className='flex items-center justify-center h-64'>
                <Spinner size='lg' />
            </div>
        )
    }

    return (
        <div className='flex flex-col md:flex-row h-full min-h-[600px] gap-0 -m-1 md:-m-2'>

            {/* ── Left panel — profile list ── */}
            <div className={`md:w-64 md:flex-shrink-0 flex flex-col border-r border-gray-100 dark:border-gray-700/50 ${mobileView === 'editor' ? 'hidden md:flex' : 'flex'}`}>
                <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/50'>
                    <span className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>Perfis</span>
                    <div className='flex items-center gap-1.5'>
                        <button
                            onClick={load}
                            className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors'
                            title='Recarregar'
                        >
                            <HiOutlineRefresh className='w-3.5 h-3.5' />
                        </button>
                        <button
                            onClick={() => setModal('create')}
                            className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold transition-colors'
                        >
                            <HiOutlinePlus className='w-3 h-3' />
                            Novo
                        </button>
                    </div>
                </div>

                <div className='flex-1 overflow-y-auto py-2 space-y-0.5 px-2'>
                    {profiles.length === 0 ? (
                        <EmptyState
                            icon={<HiOutlineShieldCheck />}
                            message='Nenhum perfil criado'
                            sub='Crie o primeiro perfil de acesso'
                            action={
                                <button
                                    onClick={() => setModal('create')}
                                    className='px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors'
                                >
                                    Criar perfil
                                </button>
                            }
                        />
                    ) : profiles.map((profile, i) => {
                        const isActive = profile.publicId === selectedId
                        const count    = countEnabled(profile.permissions)
                        return (
                            <button
                                key={profile.publicId}
                                type='button'
                                onClick={() => selectProfile(profile)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group ${
                                    isActive
                                        ? 'bg-violet-50 dark:bg-violet-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full ${avatarColor(i)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                    {initials(profile.name)}
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                        {profile.name}
                                    </p>
                                    <p className='text-[10px] text-gray-400 dark:text-gray-500 mt-0.5'>
                                        {count} permissões
                                    </p>
                                </div>
                                {isActive && (
                                    <div className='w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0' />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ── Right panel — permission editor ── */}
            {selected && pending ? (
                <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>

                    {/* editor header */}
                    <div className='flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/40 dark:bg-gray-800/20'>
                        <button onClick={() => setMobileView('list')} className='md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 -ml-1 mr-1'>
                            ←
                        </button>
                        <div className={`w-8 h-8 rounded-full ${avatarColor(profiles.findIndex(p => p.publicId === selected.publicId))} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                            {initials(selected.name)}
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-bold text-gray-800 dark:text-gray-100 truncate'>{selected.name}</p>
                            <p className='text-[11px] text-gray-400 dark:text-gray-500 truncate'>{selected.description || 'Sem descrição'}</p>
                        </div>
                        <div className='flex items-center gap-1.5 flex-shrink-0'>
                            <span className='hidden sm:inline text-[11px] text-gray-400 dark:text-gray-500'>{enabledCount}/{ALL_KEYS.length} ativos</span>
                            {isDirty && (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    title='Salvar permissões'
                                    className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-violet-200 dark:border-violet-800/60 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-[11px] font-semibold hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors disabled:opacity-40'
                                >
                                    {saving ? <Spinner size='xs' /> : <HiOutlineCheck className='w-3 h-3' />}
                                    Salvar
                                </button>
                            )}
                            <button
                                onClick={() => setModal(selected)}
                                className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-amber-500 transition-colors'
                                title='Editar informações'
                            >
                                <HiOutlinePencil className='w-4 h-4' />
                            </button>
                            <button
                                onClick={() => handleDelete(selected.publicId)}
                                className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors'
                                title='Excluir perfil'
                            >
                                <HiOutlineTrash className='w-4 h-4' />
                            </button>
                        </div>
                    </div>

                    {/* quick actions */}
                    <div className='flex items-center gap-2 px-4 py-2.5 border-b border-gray-50 dark:border-gray-700/30'>
                        <HiOutlineSwitchHorizontal className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' />
                        <span className='text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0'>Seleção rápida:</span>
                        <button onClick={handleSelectAll}
                            className='text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-800 transition-colors'>
                            Ativar tudo
                        </button>
                        <span className='text-gray-300 dark:text-gray-700'>·</span>
                        <button onClick={handleDeselectAll}
                            className='text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors'>
                            Remover tudo
                        </button>
                        {isDirty && (
                            <>
                                <span className='text-gray-300 dark:text-gray-700 ml-auto'>·</span>
                                <span className='text-[11px] text-amber-500 font-semibold flex items-center gap-1'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block' />
                                    Alterações não salvas
                                </span>
                            </>
                        )}
                    </div>

                    {/* feature groups */}
                    <div className='flex-1 overflow-y-auto px-4 py-4 space-y-3'>
                        {FEATURE_GROUPS.map(group => (
                            <FeatureGroup
                                key={group.key}
                                group={group}
                                permissions={pending}
                                onChange={handleToggle}
                            />
                        ))}
                    </div>

                    {/* sticky footer */}
                    <div className='flex items-center gap-2 px-4 py-3 border-t border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-900'>
                        {isDirty && (
                            <button onClick={handleDiscard} disabled={saving}
                                className='px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40'>
                                Descartar
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!isDirty || saving}
                            className='ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                        >
                            {saving ? <Spinner size='sm' /> : <HiOutlineCheck className='w-4 h-4' />}
                            Salvar Permissões
                        </button>
                    </div>
                </div>
            ) : !loading && profiles.length === 0 ? (
                <div className='flex-1 flex items-center justify-center'>
                    <EmptyState
                        icon={<HiOutlineShieldCheck />}
                        message='Nenhum perfil encontrado'
                        sub='Crie um perfil para começar a gerenciar permissões'
                    />
                </div>
            ) : null}

            {/* ── Modals ── */}
            <ProfileModal
                open={modal === 'create'}
                onClose={() => setModal(null)}
                onSave={handleCreate}
                profiles={profiles}
                editing={null}
                saving={saving}
            />
            <ProfileModal
                open={modal !== null && modal !== 'create'}
                onClose={() => setModal(null)}
                onSave={({ name, description }) => handleEditInfo({ name, description })}
                profiles={profiles}
                editing={typeof modal === 'object' ? modal : null}
                saving={saving}
            />
        </div>
    )
}

export default RoleManagement
