import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Card, Notification, toast } from '@/components/ui'
import { ConfirmDialog } from '@/components/shared'
import { Pattern1 } from '@/components/shared/listPatterns'
import {
    HiOutlineShieldCheck,
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineX,
    HiOutlineCheck,
    HiOutlineIdentification,
    HiOutlinePhone,
    HiOutlineMail,
    HiOutlineHashtag,
} from 'react-icons/hi'
import {
    operadorasGetByCompany,
    operadorasTipos,
    operadorasCreate,
    operadorasUpdate,
    operadorasDelete,
} from '@/api/enterprise/EnterpriseService'

// ─── Masks ────────────────────────────────────────────────────────────────────

const maskCnpj = (v) =>
    v.replace(/\D/g, '').slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')

const maskPhone = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
    return d.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3')
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const EMPTY = { name: '', insuranceTypeId: '', cnpj: '', email: '', phoneNumber: '', ansCode: '' }

/** Rota PUT/DELETE e estado local usam publicId; API .NET pode serializar como PublicId. */
const pickPublicId = (o) => o?.publicId ?? o?.PublicId

const normalizeOperadora = (raw) => {
    if (!raw || typeof raw !== 'object') return raw
    return {
        publicId:          pickPublicId(raw),
        name:              raw.name ?? raw.Name ?? '',
        taxId:             raw.taxId ?? raw.TaxId ?? null,
        insuranceTypeId: raw.insuranceTypeId ?? raw.InsuranceTypeId ?? null,
        insuranceTypeName: raw.insuranceTypeName ?? raw.InsuranceTypeName ?? raw.insuranceType?.name ?? null,
        email:             raw.email ?? raw.Email ?? null,
        phoneNumber:       raw.phoneNumber ?? raw.PhoneNumber ?? null,
        ansCode:             raw.ansCode ?? raw.AnsCode ?? null,
    }
}

const fromDto = (d) => ({
    name:            d.name              ?? '',
    insuranceTypeId: d.insuranceTypeId   ?? '',
    cnpj:            d.taxId             ? maskCnpj(d.taxId) : '',
    email:           d.email             ?? '',
    phoneNumber:     d.phoneNumber       ? maskPhone(d.phoneNumber) : '',
    ansCode:         d.ansCode           ?? '',
})

// ─── Field wrapper (fora do dialog para evitar remontagem a cada render) ──────

const Field = ({ label, icon, error, children }) => (
    <div>
        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide'>
            {label}
        </label>
        <div className='relative'>
            {icon && (
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                    {icon}
                </span>
            )}
            {children}
        </div>
        {error && <p className='text-xs text-rose-500 mt-1'>{error}</p>}
    </div>
)

// ─── Upsert Dialog ────────────────────────────────────────────────────────────

const UpsertDialog = ({ isOpen, onClose, onSuccess, initial }) => {
    const isEdit = !!initial
    const [form, setForm]   = useState(EMPTY)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [tipos, setTipos]   = useState([])
    const companyPublicId = useSelector((s) => s.auth.user.companyPublicId)

    useEffect(() => {
        operadorasTipos().then((data) => setTipos(Array.isArray(data) ? data : [])).catch(() => {})
    }, [])

    useEffect(() => {
        if (!isOpen) return
        setErrors({})
        setForm(initial ? fromDto(initial) : EMPTY)
    }, [isOpen, initial])

    if (!isOpen) return null

    const set = (k, v) => {
        setForm((p) => ({ ...p, [k]: v }))
        if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }))
    }

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Nome é obrigatório'
        return e
    }

    const handleSubmit = async () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setSaving(true)
        const payload = {
            name:            form.name.trim(),
            insuranceTypeId: form.insuranceTypeId ? Number(form.insuranceTypeId) : null,
            taxId:           form.cnpj.replace(/\D/g, '') || null,
            email:           form.email.trim() || null,
            phoneNumber:     form.phoneNumber.replace(/\D/g, '') || null,
            ansCode:         form.ansCode.trim() || null,
            companyPublicId,
        }
        const operadoraId = pickPublicId(initial)
        if (isEdit && !operadoraId) {
            setSaving(false)
            toast.push(<Notification type='danger' title='Erro'>Identificador da operadora inválido. Recarregue a lista e tente de novo.</Notification>, { placement: 'top-center' })
            return
        }
        const result = isEdit
            ? await operadorasUpdate(operadoraId, payload)
            : await operadorasCreate(payload)
        setSaving(false)
        if (result === null) return
        onSuccess(result, isEdit)
    }

    const accent = isEdit
        ? 'focus:ring-amber-400/30 focus:border-amber-400'
        : 'focus:ring-violet-400/30 focus:border-violet-400'

    const inputCls = (err) => [
        'w-full py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100',
        'focus:outline-none focus:ring-2 transition-all pl-9 pr-3',
        err
            ? 'border-rose-400 focus:ring-rose-400/30'
            : `border-gray-200 dark:border-gray-700 ${accent}`,
    ].join(' ')

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden'>

                {/* Header */}
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                        <HiOutlineShieldCheck className={`w-5 h-5 ${isEdit ? 'text-amber-600 dark:text-amber-400' : 'text-violet-600 dark:text-violet-400'}`} />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100 text-base'>
                            {isEdit ? 'Editar Operadora' : 'Nova Operadora'}
                        </h3>
                        <p className='text-xs text-gray-400 mt-0.5'>
                            {isEdit ? `Editando: ${initial.name}` : 'Cadastro de convênio / operadora'}
                        </p>
                    </div>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>

                {/* Body */}
                <div className='px-6 py-5 space-y-4 overflow-y-auto'>
                    <div className='grid grid-cols-2 gap-3'>
                        <Field label='Nome da Operadora *' icon={<HiOutlineShieldCheck className='w-4 h-4' />} error={errors.name}>
                            <input
                                placeholder='Ex: Unimed, Bradesco Saúde, Amil…'
                                value={form.name}
                                onChange={(e) => set('name', e.target.value)}
                                className={inputCls(errors.name)}
                            />
                        </Field>
                        <Field label='Tipo'>
                            <select
                                value={form.insuranceTypeId}
                                onChange={(e) => set('insuranceTypeId', e.target.value)}
                                className={inputCls(false).replace('pl-9', 'pl-3')}
                            >
                                <option value=''>Selecionar</option>
                                {tipos.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </Field>
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                        <Field label='CNPJ' icon={<HiOutlineIdentification className='w-4 h-4' />}>
                            <input
                                placeholder='00.000.000/0001-00'
                                value={form.cnpj}
                                onChange={(e) => set('cnpj', maskCnpj(e.target.value))}
                                className={inputCls(false)}
                            />
                        </Field>
                        <Field label='Código ANS' icon={<HiOutlineHashtag className='w-4 h-4' />}>
                            <input
                                placeholder='000000'
                                value={form.ansCode}
                                onChange={(e) => set('ansCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className={inputCls(false)}
                            />
                        </Field>
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                        <Field label='Telefone' icon={<HiOutlinePhone className='w-4 h-4' />}>
                            <input
                                placeholder='(00) 00000-0000'
                                value={form.phoneNumber}
                                onChange={(e) => set('phoneNumber', maskPhone(e.target.value))}
                                className={inputCls(false)}
                            />
                        </Field>
                        <Field label='E-mail' icon={<HiOutlineMail className='w-4 h-4' />}>
                            <input
                                type='email'
                                placeholder='contato@operadora.com.br'
                                value={form.email}
                                onChange={(e) => set('email', e.target.value)}
                                className={inputCls(false)}
                            />
                        </Field>
                    </div>
                </div>

                {/* Footer */}
                <div className='flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button
                        onClick={() => !saving && onClose()}
                        disabled={saving}
                        className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition'
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 text-white transition shadow-sm ${
                            isEdit
                                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                                : 'bg-violet-600 hover:bg-violet-700 shadow-violet-200'
                        }`}
                    >
                        {saving ? (
                            <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' /> Salvando…</>
                        ) : (
                            <><HiOutlineCheck className='w-4 h-4' /> {isEdit ? 'Salvar Alterações' : 'Cadastrar'}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const OperadorasIndex = () => {
    const companyPublicId = useSelector((s) => s.auth.user.companyPublicId)
    const [items, setItems]           = useState([])
    const [loading, setLoading]       = useState(false)
    const [search, setSearch]         = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing]       = useState(null)
    const [deleting, setDeleting]     = useState(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [tiposList, setTiposList] = useState([])

    useEffect(() => {
        operadorasTipos().then((data) => setTiposList(Array.isArray(data) ? data : [])).catch(() => {})
    }, [])

    const tipoNameById = useMemo(() => {
        const m = {}
        for (const t of tiposList) if (t?.id != null) m[t.id] = t.name
        return m
    }, [tiposList])

    const load = () => {
        if (!companyPublicId) return
        setLoading(true)
        operadorasGetByCompany(companyPublicId)
            .then((data) => (Array.isArray(data) ? data : []).map(normalizeOperadora))
            .then(setItems)
            .catch(() => toast.push(<Notification type='danger' title='Erro ao carregar operadoras' />, { placement: 'top-center' }))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [companyPublicId])

    const openNew  = () => { setEditing(null); setDialogOpen(true) }
    const openEdit = (raw) => { setEditing(normalizeOperadora(raw)); setDialogOpen(true) }
    const openDelete = (raw) => { setDeleting(normalizeOperadora(raw)); setConfirmOpen(true) }

    const handleSuccess = (result, isEdit) => {
        setDialogOpen(false)
        if (isEdit) {
            load()
            toast.push(<Notification type='success' title='Operadora atualizada' />, { placement: 'top-center' })
            return
        }
        if (result) {
            setItems((prev) => [normalizeOperadora(result), ...prev])
            toast.push(<Notification type='success' title='Operadora cadastrada' />, { placement: 'top-center' })
        }
    }

    const handleDelete = async () => {
        if (!deleting) return
        const delId = pickPublicId(deleting)
        if (!delId) {
            setConfirmOpen(false)
            setDeleting(null)
            return
        }
        const ok = await operadorasDelete(delId)
        if (ok !== null) {
            setItems((prev) => prev.filter((i) => i.publicId !== delId))
            toast.push(<Notification type='success' title='Operadora removida' />, { placement: 'top-center' })
        }
        setConfirmOpen(false)
        setDeleting(null)
    }

    const tipoLabel = (o) =>
        o.insuranceTypeName ??
        o.insuranceType?.name ??
        (o.insuranceTypeId != null ? tipoNameById[o.insuranceTypeId] : null)

    const filtered = items.filter((i) => {
        const q = search.toLowerCase()
        const t = tipoLabel(i)?.toLowerCase() ?? ''
        return (
            i.name?.toLowerCase().includes(q) ||
            t.includes(q) ||
            i.ansCode?.includes(search) ||
            i.taxId?.includes(search.replace(/\D/g, ''))
        )
    })

    const toPattern = (o) => {
        const typeName = tipoLabel(o)
        return {
            id:          o.publicId,
            name:        o.name,
            email:       o.ansCode ? `ANS: ${o.ansCode}` : (o.email ?? ''),
            emailIcon:   HiOutlineHashtag,
            meta:        o.taxId
                ? o.taxId.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                : (o.phoneNumber ?? ''),
            badge:       typeName ?? 'Tipo não informado',
            badgeColor:  typeName
                ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
            status:      'ativo',
            avatarName:  o.name,
            _raw:        o,
        }
    }

    const actions = [
        {
            key: 'edit',
            icon: <HiOutlinePencil />,
            tooltip: 'Editar',
            onClick: (item) => openEdit(item._raw),
        },
        {
            key: 'delete',
            icon: <HiOutlineTrash />,
            tooltip: 'Excluir',
            onClick: (item) => openDelete(item._raw),
            className: 'hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
        },
    ]

    return (
        <div className='w-full p-4 space-y-4'>

            <UpsertDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSuccess={handleSuccess}
                initial={editing}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                type='danger'
                title='Excluir Operadora'
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
            >
                <p>Deseja excluir <strong>{deleting?.name}</strong>? Essa ação não poderá ser desfeita.</p>
            </ConfirmDialog>

            {/* ── Header ── */}
            <div className='flex items-center justify-between gap-3'>
                <div>
                    <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
                        <HiOutlineShieldCheck className='w-6 h-6 text-teal-500' />
                        Operadoras de Convênio
                    </h2>
                    <p className='text-sm text-gray-400 mt-0.5'>Gerencie os convênios e planos de saúde aceitos pela clínica</p>
                </div>
                <button
                    onClick={openNew}
                    className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm shadow-violet-200 whitespace-nowrap'
                >
                    <HiOutlinePlus className='w-4 h-4' />
                    Nova Operadora
                </button>
            </div>

            {/* ── Busca ── */}
            <Card className='border border-gray-100 dark:border-gray-700/50'>
                <div className='relative'>
                    <HiOutlineShieldCheck className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4' />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='Buscar por nome, CNPJ ou código ANS…'
                        className='w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 placeholder-gray-400 transition-all'
                    />
                </div>
            </Card>

            {/* ── Lista ── */}
            <Card className='border border-gray-100 dark:border-gray-700/50'>
                <div className='flex items-center justify-between px-1 pb-3'>
                    <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                        {filtered.length} operadora{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Pattern1
                    items={filtered.map(toPattern)}
                    loading={loading}
                    actions={actions}
                    onItemClick={(item) => openEdit(item._raw)}
                    emptyMessage='Nenhuma operadora cadastrada'
                    alwaysShowBadge
                />
            </Card>
        </div>
    )
}

export default OperadorasIndex
