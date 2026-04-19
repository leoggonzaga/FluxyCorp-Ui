import { useEffect, useRef, useState } from 'react'
import { useAppSelector } from '@/store'
import { Notification, toast } from '@/components/ui'
import {
    createConsumer,
    updateConsumer,
    getConsumerById,
    getConsumerConvenios,
    createConsumerConvenio,
    updateConsumerConvenio,
    deleteConsumerConvenio,
} from '@/api/consumer/consumerService'
import { operadorasGetByCompany } from '@/api/enterprise/EnterpriseService'
import { mergeConsumerConvenioForUi } from '@/views/patient/mergeConsumerConvenio'
import {
    HiOutlineUser,
    HiOutlineIdentification,
    HiOutlineLocationMarker,
    HiOutlineX,
    HiOutlineChevronRight,
    HiOutlineChevronLeft,
    HiOutlineCheck,
    HiOutlinePhone,
    HiOutlineMail,
    HiOutlineBriefcase,
    HiOutlineGlobe,
    HiOutlineMap,
    HiOutlinePencil,
    HiOutlineShieldCheck,
    HiOutlineHashtag,
    HiOutlineCalendar,
    HiOutlineUserGroup,
} from 'react-icons/hi'

// ─── masks ────────────────────────────────────────────────────────────────────
const maskCpf = (v) =>
    v.replace(/\D/g, '').slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

const maskPhone = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
    return d.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3')
}

const maskCep = (v) =>
    v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{0,3})$/, '$1-$2')

const maskDate = (v) =>
    v.replace(/\D/g, '').slice(0, 8)
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')

const dateToISO = (ddmmyyyy) => {
    const [d, m, y] = ddmmyyyy.split('/')
    if (!d || !m || !y || y.length < 4) return null
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00`
}

const isoToDisplay = (iso) => {
    if (!iso) return ''
    const [y, m, day] = iso.slice(0, 10).split('-')
    return `${day}/${m}/${y}`
}

// ─── kind map ─────────────────────────────────────────────────────────────────
const COMPANY_KIND_MAP = {
    '1': { value: 'Dental', label: 'Odontológico',        icon: '🦷' },
    '2': { value: 'Pet',    label: 'Animal de Estimação', icon: '🐾' },
    '3': { value: 'Human',  label: 'Humano',              icon: '👤' },
}
const DEFAULT_KIND = { value: 'Human', label: 'Humano', icon: '👤' }
const resolveKind = (companyTypeId) => COMPANY_KIND_MAP[String(companyTypeId)] ?? DEFAULT_KIND

const pickConsumerPublicId = (o) => o?.publicId ?? o?.PublicId

const BLOOD_TYPES    = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GENDERS        = ['Masculino', 'Feminino', 'Não-binário', 'Prefiro não informar']
const MARITAL_STATUS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável']
const BR_STATES      = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const STEPS = [
    { id: 1, label: 'Identificação',  icon: <HiOutlineUser /> },
    { id: 2, label: 'Perfil Pessoal', icon: <HiOutlineIdentification /> },
    { id: 3, label: 'Endereço',       icon: <HiOutlineLocationMarker /> },
]

const TABS = [
    { id: 'identification', label: 'Identificação',  icon: <HiOutlineUser className="w-4 h-4" /> },
    { id: 'profile',        label: 'Perfil Pessoal', icon: <HiOutlineIdentification className="w-4 h-4" /> },
    { id: 'address',        label: 'Endereço',       icon: <HiOutlineLocationMarker className="w-4 h-4" /> },
    { id: 'insurance',      label: 'Convênio',       icon: <HiOutlineShieldCheck className="w-4 h-4" /> },
]

const EMPTY_FORM = {
    name: '', socialName: '', cpf: '', birthDate: '', gender: '',
    maritalStatus: '', nationality: 'Brasileiro(a)', phoneNumber: '',
    email: '', occupation: '', bloodType: '',
    zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', country: 'Brasil',
    insuranceEnabled: false,
    insuranceName: '',
    insurancePublicId: '',
    convenioPublicId: '',
    insurancePlan: '',
    insuranceNumber: '',
    insuranceExpiry: '',
    insuranceHolder: '',
}

const formFromData = (d) => ({
    name:         d.name          ?? '',
    socialName:   d.socialName    ?? '',
    cpf:          d.cpf ? maskCpf(d.cpf) : '',
    birthDate:    isoToDisplay(d.birthDate),
    gender:       d.gender        ?? '',
    maritalStatus: d.maritalStatus ?? '',
    nationality:  d.nationality   ?? 'Brasileiro(a)',
    phoneNumber:  d.phoneNumber   ? maskPhone(d.phoneNumber) : '',
    email:        d.email         ?? '',
    occupation:       d.occupation       ?? '',
    bloodType:        d.bloodType        ?? '',
    zipCode:          d.zipCode          ? maskCep(d.zipCode) : '',
    insuranceEnabled: !!(d.insuranceName ?? d.insurance ?? d.insuranceNumber),
    insuranceName:    d.insuranceName    ?? d.insurance ?? '',
    insurancePublicId: d.insurancePublicId ?? '',
    convenioPublicId:  d.convenioPublicId  ?? '',
    insurancePlan:    d.insurancePlan    ?? '',
    insuranceNumber:  d.insuranceNumber  ?? '',
    insuranceExpiry:  isoToDisplay(d.insuranceExpiry) || (d.insuranceExpiry ?? ''),
    insuranceHolder:  d.insuranceHolder  ?? '',
    street:       d.street        ?? '',
    number:       d.addressNumber ?? '',
    complement:   d.complement    ?? '',
    neighborhood: d.neighborhood  ?? '',
    city:         d.city          ?? '',
    state:        d.state         ?? '',
    country:      d.country       ?? 'Brasil',
})

// ─── field components ─────────────────────────────────────────────────────────
const FieldLabel = ({ children, required }) => (
    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
        {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
)

const FieldInput = ({ icon, error, accentClass = 'focus:ring-violet-400/30 focus:border-violet-400', ...props }) => (
    <div className="relative">
        {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                {icon}
            </div>
        )}
        <input
            {...props}
            className={[
                'w-full py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100',
                'focus:outline-none focus:ring-2 transition-all',
                icon ? 'pl-9 pr-3' : 'px-3',
                error
                    ? 'border-rose-400 focus:ring-rose-400/30 focus:border-rose-400'
                    : `border-gray-200 dark:border-gray-700 ${accentClass}`,
            ].join(' ')}
        />
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
)

const FieldSelect = ({ children, error, accentClass = 'focus:ring-violet-400/30 focus:border-violet-400', ...props }) => (
    <div>
        <select
            {...props}
            className={[
                'w-full px-3 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100',
                'focus:outline-none focus:ring-2 transition-all',
                error
                    ? 'border-rose-400 focus:ring-rose-400/30'
                    : `border-gray-200 dark:border-gray-700 ${accentClass}`,
            ].join(' ')}
        >
            {children}
        </select>
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
)

const maskExpiry = (v) =>
    v.replace(/\D/g, '').slice(0, 8)
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')

// ─── CEP lookup ───────────────────────────────────────────────────────────────
const useCepLookup = (setForm) => {
    const [cepLoading, setCepLoading] = useState(false)
    const lookup = async (raw) => {
        const cep = raw.replace(/\D/g, '')
        if (cep.length !== 8) return
        setCepLoading(true)
        try {
            const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
            const data = await res.json()
            if (!data.erro) {
                setForm(prev => ({
                    ...prev,
                    street:       data.logradouro || prev.street,
                    neighborhood: data.bairro     || prev.neighborhood,
                    city:         data.localidade || prev.city,
                    state:        data.uf         || prev.state,
                    country:      'Brasil',
                }))
            }
        } catch (_) {}
        setCepLoading(false)
    }
    return { cepLoading, lookup }
}

// ─── Seções de conteúdo (reutilizadas em steps e abas) ───────────────────────
const SectionIdentification = ({ form, errors, set, kind, accent }) => (
    <>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <span className="text-2xl">{kind.icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tipo de prontuário</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{kind.label}</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
                Definido pela licença
            </span>
        </div>
        <div>
            <FieldLabel required>Nome Completo</FieldLabel>
            <FieldInput
                icon={<HiOutlineUser className="w-4 h-4" />}
                accentClass={accent}
                placeholder="Ex: João da Silva"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                error={errors.name}
                autoFocus
            />
        </div>
    </>
)

const SectionProfile = ({ form, set, isPet, accent }) => (
    <div className="space-y-4">
        {!isPet ? (
            <>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <FieldLabel>CPF</FieldLabel>
                        <FieldInput
                            icon={<HiOutlineIdentification className="w-4 h-4" />}
                            accentClass={accent}
                            placeholder="000.000.000-00"
                            value={form.cpf}
                            onChange={e => set('cpf', maskCpf(e.target.value))}
                        />
                    </div>
                    <div>
                        <FieldLabel>Data de Nascimento</FieldLabel>
                        <FieldInput
                            accentClass={accent}
                            placeholder="dd/mm/aaaa"
                            value={form.birthDate}
                            onChange={e => set('birthDate', maskDate(e.target.value))}
                        />
                    </div>
                </div>
                <div>
                    <FieldLabel>Nome Social</FieldLabel>
                    <FieldInput
                        icon={<HiOutlineUser className="w-4 h-4" />}
                        accentClass={accent}
                        placeholder="Nome pelo qual prefere ser chamado(a)"
                        value={form.socialName}
                        onChange={e => set('socialName', e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <FieldLabel>Gênero</FieldLabel>
                        <FieldSelect accentClass={accent} value={form.gender} onChange={e => set('gender', e.target.value)}>
                            <option value="">Selecionar</option>
                            {GENDERS.map(g => <option key={g}>{g}</option>)}
                        </FieldSelect>
                    </div>
                    <div>
                        <FieldLabel>Estado Civil</FieldLabel>
                        <FieldSelect accentClass={accent} value={form.maritalStatus} onChange={e => set('maritalStatus', e.target.value)}>
                            <option value="">Selecionar</option>
                            {MARITAL_STATUS.map(m => <option key={m}>{m}</option>)}
                        </FieldSelect>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <FieldLabel>Telefone</FieldLabel>
                        <FieldInput
                            icon={<HiOutlinePhone className="w-4 h-4" />}
                            accentClass={accent}
                            placeholder="(00) 00000-0000"
                            value={form.phoneNumber}
                            onChange={e => set('phoneNumber', maskPhone(e.target.value))}
                        />
                    </div>
                    <div>
                        <FieldLabel>E-mail</FieldLabel>
                        <FieldInput
                            icon={<HiOutlineMail className="w-4 h-4" />}
                            accentClass={accent}
                            type="email"
                            placeholder="email@exemplo.com"
                            value={form.email}
                            onChange={e => set('email', e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <FieldLabel>Profissão</FieldLabel>
                        <FieldInput
                            icon={<HiOutlineBriefcase className="w-4 h-4" />}
                            accentClass={accent}
                            placeholder="Ex: Engenheiro(a)"
                            value={form.occupation}
                            onChange={e => set('occupation', e.target.value)}
                        />
                    </div>
                    <div>
                        <FieldLabel>Nacionalidade</FieldLabel>
                        <FieldInput
                            icon={<HiOutlineGlobe className="w-4 h-4" />}
                            accentClass={accent}
                            placeholder="Brasileiro(a)"
                            value={form.nationality}
                            onChange={e => set('nationality', e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <FieldLabel>Tipo Sanguíneo</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                        {BLOOD_TYPES.map(bt => (
                            <button
                                key={bt}
                                type="button"
                                onClick={() => set('bloodType', form.bloodType === bt ? '' : bt)}
                                className={[
                                    'w-12 h-10 rounded-xl text-sm font-bold border-2 transition-all',
                                    form.bloodType === bt
                                        ? 'bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-200'
                                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-rose-300 hover:text-rose-600',
                                ].join(' ')}
                            >
                                {bt}
                            </button>
                        ))}
                    </div>
                </div>
            </>
        ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                <span className="text-5xl">🐾</span>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Perfil de Animal de Estimação</p>
                <p className="text-xs text-gray-400 max-w-xs">
                    Os dados específicos do pet poderão ser preenchidos após o cadastro inicial.
                </p>
            </div>
        )}
    </div>
)

const SectionAddress = ({ form, set, cepLoading, lookup, accent }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
            <div>
                <FieldLabel>CEP</FieldLabel>
                <div className="relative">
                    <FieldInput
                        icon={<HiOutlineMap className="w-4 h-4" />}
                        accentClass={accent}
                        placeholder="00000-000"
                        value={form.zipCode}
                        onChange={e => {
                            const v = maskCep(e.target.value)
                            set('zipCode', v)
                            lookup(v)
                        }}
                    />
                    {cepLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-3.5 h-3.5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Preenchimento automático via CEP</p>
            </div>
            <div>
                <FieldLabel>País</FieldLabel>
                <FieldInput
                    icon={<HiOutlineGlobe className="w-4 h-4" />}
                    accentClass={accent}
                    placeholder="Brasil"
                    value={form.country}
                    onChange={e => set('country', e.target.value)}
                />
            </div>
        </div>
        <div>
            <FieldLabel>Logradouro</FieldLabel>
            <FieldInput
                icon={<HiOutlineLocationMarker className="w-4 h-4" />}
                accentClass={accent}
                placeholder="Rua / Avenida / Travessa..."
                value={form.street}
                onChange={e => set('street', e.target.value)}
            />
        </div>
        <div className="grid grid-cols-3 gap-3">
            <div>
                <FieldLabel>Número</FieldLabel>
                <FieldInput
                    accentClass={accent}
                    placeholder="Nº"
                    value={form.number}
                    onChange={e => set('number', e.target.value)}
                />
            </div>
            <div className="col-span-2">
                <FieldLabel>Complemento</FieldLabel>
                <FieldInput
                    accentClass={accent}
                    placeholder="Apto, Bloco, etc."
                    value={form.complement}
                    onChange={e => set('complement', e.target.value)}
                />
            </div>
        </div>
        <div>
            <FieldLabel>Bairro</FieldLabel>
            <FieldInput
                accentClass={accent}
                placeholder="Bairro"
                value={form.neighborhood}
                onChange={e => set('neighborhood', e.target.value)}
            />
        </div>
        <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
                <FieldLabel>Cidade</FieldLabel>
                <FieldInput
                    accentClass={accent}
                    placeholder="Cidade"
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                />
            </div>
            <div>
                <FieldLabel>UF</FieldLabel>
                <FieldSelect accentClass={accent} value={form.state} onChange={e => set('state', e.target.value)}>
                    <option value="">UF</option>
                    {BR_STATES.map(s => <option key={s}>{s}</option>)}
                </FieldSelect>
            </div>
        </div>
    </div>
)

// ─── Operadora Combo ──────────────────────────────────────────────────────────

const OperadoraCombo = ({ value, publicId, onChange, companyPublicId, accent }) => {
    const [open, setOpen]           = useState(false)
    const [search, setSearch]       = useState('')
    const [options, setOptions]     = useState([])
    const [loading, setLoading]     = useState(false)
    const [loaded, setLoaded]       = useState(false)
    const containerRef              = useRef(null)

    useEffect(() => {
        if (!open || loaded) return
        setLoading(true)
        operadorasGetByCompany(companyPublicId)
            .then((data) => { setOptions(Array.isArray(data) ? data : []); setLoaded(true) })
            .catch(() => setOptions([]))
            .finally(() => setLoading(false))
    }, [open, loaded, companyPublicId])

    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const filtered = options.filter((o) =>
        o.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.ansCode?.includes(search)
    )

    const handleSelect = (op) => {
        onChange({ name: op.name, publicId: op.publicId })
        setOpen(false)
        setSearch('')
    }

    const ringCls = accent.includes('amber')
        ? 'focus:ring-amber-400/30 focus:border-amber-400'
        : 'focus:ring-violet-400/30 focus:border-violet-400'

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={[
                    'w-full flex items-center gap-2 pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-900 transition-all focus:outline-none focus:ring-2 text-left',
                    open
                        ? `${ringCls} border-current`
                        : 'border-gray-200 dark:border-gray-700',
                ].join(' ')}
            >
                <HiOutlineShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                {value
                    ? <span className="font-semibold text-gray-800 dark:text-gray-100 truncate flex-1">{value}</span>
                    : <span className="text-gray-400 flex-1">Selecionar operadora…</span>
                }
                <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar operadora…"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/40 placeholder-gray-400"
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <p className="text-sm text-center text-gray-400 py-4">
                                {options.length === 0 ? 'Nenhuma operadora cadastrada' : 'Nenhum resultado'}
                            </p>
                        ) : filtered.map((op) => (
                            <button
                                key={op.publicId}
                                type="button"
                                onMouseDown={() => handleSelect(op)}
                                className={[
                                    'w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-indigo-50 dark:hover:bg-gray-700 transition border-b last:border-0 border-gray-100 dark:border-gray-700',
                                    op.publicId === publicId ? 'bg-indigo-50 dark:bg-indigo-900/20' : '',
                                ].join(' ')}
                            >
                                <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center flex-shrink-0">
                                    <HiOutlineShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{op.name}</p>
                                    {op.ansCode && <p className="text-xs text-gray-400">ANS: {op.ansCode}</p>}
                                </div>
                                {op.publicId === publicId && (
                                    <HiOutlineCheck className="w-4 h-4 text-indigo-500 ml-auto flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Section Insurance ────────────────────────────────────────────────────────

const SectionInsurance = ({ form, set, accent, companyPublicId }) => {
    const hasInsurance = form.insuranceEnabled

    const clearAll = () => {
        set('insuranceEnabled', false)
        set('insuranceName', '')
        set('insurancePublicId', '')
        set('convenioPublicId', '')
        set('insurancePlan', '')
        set('insuranceNumber', '')
        set('insuranceExpiry', '')
        set('insuranceHolder', '')
    }

    return (
        <div className="space-y-5">
            {/* Toggle convênio */}
            <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                hasInsurance
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                    : 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40'
            }`}
                onClick={() => !hasInsurance && set('insuranceEnabled', true)}
            >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    hasInsurance ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                    <HiOutlineShieldCheck className={`w-5 h-5 ${hasInsurance ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {hasInsurance ? 'Paciente possui convênio' : 'Paciente sem convênio'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {hasInsurance ? 'Selecione a operadora abaixo' : 'Clique para informar um convênio'}
                    </p>
                </div>
                {hasInsurance && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); clearAll() }}
                        className="text-xs font-semibold text-red-400 hover:text-red-600 transition px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        Remover
                    </button>
                )}
            </div>

            {hasInsurance && (
                <>
                    <div>
                        <FieldLabel required>Operadora / Convênio</FieldLabel>
                        <OperadoraCombo
                            value={form.insuranceName}
                            publicId={form.insurancePublicId}
                            onChange={({ name, publicId }) => {
                                set('insuranceName', name)
                                set('insurancePublicId', publicId)
                            }}
                            companyPublicId={companyPublicId}
                            accent={accent}
                        />
                    </div>

                    <div>
                        <FieldLabel>Plano</FieldLabel>
                        <FieldInput
                            accentClass={accent}
                            placeholder="Ex: Gold, Empresarial, Nacional…"
                            value={form.insurancePlan}
                            onChange={e => set('insurancePlan', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>Número da Carteirinha</FieldLabel>
                            <FieldInput
                                icon={<HiOutlineHashtag className="w-4 h-4" />}
                                accentClass={accent}
                                placeholder="000000000"
                                value={form.insuranceNumber}
                                onChange={e => set('insuranceNumber', e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                        <div>
                            <FieldLabel>Validade</FieldLabel>
                            <FieldInput
                                icon={<HiOutlineCalendar className="w-4 h-4" />}
                                accentClass={accent}
                                placeholder="dd/mm/aaaa"
                                value={form.insuranceExpiry}
                                onChange={e => set('insuranceExpiry', maskExpiry(e.target.value))}
                            />
                        </div>
                    </div>

                    <div>
                        <FieldLabel>Titular</FieldLabel>
                        <FieldInput
                            icon={<HiOutlineUserGroup className="w-4 h-4" />}
                            accentClass={accent}
                            placeholder="Nome do titular (deixe em branco se for o próprio)"
                            value={form.insuranceHolder}
                            onChange={e => set('insuranceHolder', e.target.value)}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Preencha apenas se o paciente for dependente</p>
                    </div>
                </>
            )}
        </div>
    )
}

// ─── ConsumerUpsertDialog ─────────────────────────────────────────────────────
const ConsumerUpsertDialog = ({ isOpen, onClose, onSuccess, mode = 'create', initialData = null }) => {
    const [step, setStep]           = useState(1)
    const [activeTab, setActiveTab] = useState('identification')
    const [form, setForm]           = useState(EMPTY_FORM)
    const [errors, setErrors]       = useState({})
    const [saving, setSaving]       = useState(false)
    const { cepLoading, lookup }    = useCepLookup(setForm)

    const companyPublicId = useAppSelector(s => s.auth.user.companyPublicId) || ''
    const companyTypeId   = useAppSelector(s => s.auth.user.companyTypeId)   || '0'
    const kind = resolveKind(companyTypeId)

    useEffect(() => {
        if (!isOpen) return
        setStep(1)
        setActiveTab('identification')
        setErrors({})
        setForm(mode === 'edit' && initialData ? formFromData(initialData) : EMPTY_FORM)
    }, [isOpen, mode, initialData])

    if (!isOpen) return null

    const isEdit = mode === 'edit'
    const isPet  = kind.value === 'Pet'
    const accent = isEdit ? 'focus:ring-amber-400/30 focus:border-amber-400' : 'focus:ring-violet-400/30 focus:border-violet-400'

    const set = (k, v) => {
        setForm(prev => ({ ...prev, [k]: v }))
        if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }))
    }

    const validateStep1 = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Nome é obrigatório'
        return e
    }

    const nextStep = () => {
        if (step === 1) {
            const e = validateStep1()
            if (Object.keys(e).length) { setErrors(e); return }
        }
        setStep(s => Math.min(s + 1, STEPS.length))
    }

    const prevStep = () => setStep(s => Math.max(s - 1, 1))

    const buildConvenioApiBody = () => ({
        operadoraPublicId: form.insurancePublicId,
        tipo: null,
        plano:       form.insurancePlan?.trim()    || null,
        numero:      form.insuranceNumber?.trim()  || null,
        validade:    form.insuranceExpiry.length === 10 ? dateToISO(form.insuranceExpiry) : null,
        titular:     form.insuranceHolder?.trim() || null,
    })

    const syncConvenioAfterConsumerSave = async (consumerPublicId) => {
        const list = await getConsumerConvenios(consumerPublicId).catch(() => null)
        const rows = Array.isArray(list) ? list : []
        const first = rows[0] ?? null
        const firstId = first?.publicId ?? first?.PublicId

        const wants = form.insuranceEnabled && !!String(form.insurancePublicId || '').trim()
        if (!wants) {
            if (firstId) {
                const del = await deleteConsumerConvenio(consumerPublicId, firstId)
                if (del === null) {
                    toast.push(
                        <Notification type="danger" title="Convênio">Não foi possível remover o convênio.</Notification>,
                        { placement: 'top-center' },
                    )
                    return false
                }
            }
            return true
        }

        const body = buildConvenioApiBody()
        if (!body.operadoraPublicId) {
            toast.push(
                <Notification type="danger" title="Convênio">Selecione a operadora.</Notification>,
                { placement: 'top-center' },
            )
            return false
        }

        if (firstId) {
            const up = await updateConsumerConvenio(consumerPublicId, firstId, body)
            if (up === null) {
                toast.push(
                    <Notification type="danger" title="Convênio">Não foi possível atualizar o convênio.</Notification>,
                    { placement: 'top-center' },
                )
                return false
            }
        } else {
            const cr = await createConsumerConvenio(consumerPublicId, body)
            if (cr === null) {
                toast.push(
                    <Notification type="danger" title="Convênio">Não foi possível salvar o convênio.</Notification>,
                    { placement: 'top-center' },
                )
                return false
            }
        }
        return true
    }

    const loadMergedForSuccess = async (consumerPublicId) => {
        const [c, convenios] = await Promise.all([
            getConsumerById(consumerPublicId),
            getConsumerConvenios(consumerPublicId).catch(() => []),
        ])
        if (!c) return null
        const ops = companyPublicId ? await operadorasGetByCompany(companyPublicId).catch(() => []) : []
        return mergeConsumerConvenioForUi(c, convenios, Array.isArray(ops) ? ops : [])
    }

    const buildPayload = () => ({
        name:            form.name.trim(),
        consumerKind:    kind.value,
        companyPublicId: companyPublicId || '00000000-0000-0000-0000-000000000000',
        companyId:       0,
        humanProfile: kind.value !== 'Pet' ? {
            socialName:    form.socialName    || null,
            cpf:           form.cpf.replace(/\D/g, '')         || null,
            birthDate:     form.birthDate.length === 10 ? dateToISO(form.birthDate) : null,
            gender:        form.gender        || null,
            maritalStatus: form.maritalStatus || null,
            nationality:   form.nationality   || null,
            phoneNumber:   form.phoneNumber.replace(/\D/g, '') || null,
            email:         form.email         || null,
            occupation:    form.occupation    || null,
            bloodType:     form.bloodType     || null,
        } : null,
        petProfile: kind.value === 'Pet' ? {
            species: null, breed: null, ownerName: null,
        } : null,
        address: (form.street || form.city || form.zipCode.replace(/\D/g, '').length > 0) ? {
            street:       form.street       || null,
            number:       form.number       || null,
            complement:   form.complement   || null,
            neighborhood: form.neighborhood || null,
            city:         form.city         || null,
            state:        form.state        || null,
            country:      form.country      || 'Brasil',
            zipCode:      form.zipCode.replace(/\D/g, '') || null,
        } : null,
    })

    const handleSubmit = async () => {
        const e = validateStep1()
        if (Object.keys(e).length) {
            setErrors(e)
            if (isEdit) setActiveTab('identification')
            else setStep(1)
            return
        }
        setSaving(true)
        try {
            const payload = buildPayload()
            const consumerPid = isEdit ? pickConsumerPublicId(initialData) : null
            if (isEdit && !consumerPid) {
                toast.push(
                    <Notification type="danger" title="Erro">Identificador do paciente inválido.</Notification>,
                    { placement: 'top-center' },
                )
                return
            }

            const result = isEdit
                ? await updateConsumer(consumerPid, payload)
                : await createConsumer(payload)

            if (result === null) return

            const savedConsumerId = pickConsumerPublicId(result) ?? consumerPid
            if (!savedConsumerId) return

            const convenioOk = await syncConvenioAfterConsumerSave(savedConsumerId)
            if (!convenioOk) return

            const merged = await loadMergedForSuccess(savedConsumerId)
            onSuccess?.(merged ?? result)
            onClose()
        } catch (_) {
            toast.push(
                <Notification type="danger" title="Erro ao salvar">
                    Verifique os dados e tente novamente.
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setSaving(false)
        }
    }

    const handleClose = () => { if (!saving) onClose() }

    const sharedProps = { form, set, kind, isPet, cepLoading, lookup, errors, accent }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

            <div
                className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
                style={{ maxWidth: isEdit ? '680px' : '560px', maxHeight: '90vh' }}
            >
                {/* ── Header ── */}
                <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                        {isEdit
                            ? <HiOutlinePencil className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            : <HiOutlineUser   className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        }
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">
                            {isEdit ? 'Editar Prontuário' : 'Novo Prontuário'}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isEdit ? `Editando: ${initialData?.name}` : 'Cadastro de paciente / consumer'}
                        </p>
                    </div>
                    <button onClick={handleClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition">
                        <HiOutlineX className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Tabs (edit) / Steps (create) ── */}
                {isEdit ? (
                    <div className="flex border-b border-gray-100 dark:border-gray-800 flex-shrink-0 px-6 gap-1 pt-1">
                        {TABS.map(tab => {
                            const active = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={[
                                        'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap',
                                        active
                                            ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                            : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-200 dark:hover:border-gray-700',
                                    ].join(' ')}
                                >
                                    <span className={active ? 'text-amber-500' : 'text-gray-400'}>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex items-center gap-0 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                        {STEPS.map((s, i) => (
                            <div key={s.id} className="flex items-center flex-1">
                                <button
                                    onClick={() => step > s.id && setStep(s.id)}
                                    className={[
                                        'flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all',
                                        step === s.id ? 'cursor-default' : step > s.id ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : 'cursor-default opacity-50',
                                    ].join(' ')}
                                >
                                    <div className={[
                                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all',
                                        step === s.id
                                            ? 'bg-violet-600 text-white shadow-md'
                                            : step > s.id
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400',
                                    ].join(' ')}>
                                        {step > s.id ? <HiOutlineCheck className="w-3.5 h-3.5" /> : s.id}
                                    </div>
                                    <span className={`text-xs font-semibold hidden sm:block ${step === s.id ? 'text-violet-600' : 'text-gray-400'}`}>
                                        {s.label}
                                    </span>
                                </button>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-px mx-1 ${step > s.id ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {isEdit ? (
                        <>
                            {activeTab === 'identification' && <SectionIdentification {...sharedProps} />}
                            {activeTab === 'profile'        && <SectionProfile {...sharedProps} />}
                            {activeTab === 'address'        && <SectionAddress {...sharedProps} />}
                            {activeTab === 'insurance'      && <SectionInsurance form={form} set={set} accent={accent} companyPublicId={companyPublicId} />}
                        </>
                    ) : (
                        <>
                            {step === 1 && <SectionIdentification {...sharedProps} />}
                            {step === 2 && <SectionProfile {...sharedProps} />}
                            {step === 3 && <SectionAddress {...sharedProps} />}
                        </>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                    {isEdit ? (
                        <>
                            <button
                                onClick={handleClose}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition"
                            >
                                Cancelar
                            </button>
                            <button onClick={handleSubmit} disabled={saving}
                                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white transition shadow-sm shadow-amber-200">
                                {saving ? (
                                    <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando…</>
                                ) : (
                                    <><HiOutlineCheck className="w-4 h-4" /> Salvar Alterações</>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={step === 1 ? handleClose : prevStep}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition"
                            >
                                {step === 1 ? 'Cancelar' : <><HiOutlineChevronLeft className="w-4 h-4" /> Voltar</>}
                            </button>

                            <div className="flex items-center gap-1">
                                {STEPS.map(s => (
                                    <div key={s.id}
                                        className={`h-1.5 rounded-full transition-all ${s.id === step ? 'w-6 bg-violet-500' : s.id < step ? 'w-3 bg-emerald-400' : 'w-3 bg-gray-200 dark:bg-gray-700'}`}
                                    />
                                ))}
                            </div>

                            {step < STEPS.length ? (
                                <button onClick={nextStep}
                                    className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm shadow-violet-200">
                                    Próximo <HiOutlineChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button onClick={handleSubmit} disabled={saving}
                                    className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition shadow-sm shadow-emerald-200">
                                    {saving ? (
                                        <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando…</>
                                    ) : (
                                        <><HiOutlineCheck className="w-4 h-4" /> Salvar Prontuário</>
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ConsumerUpsertDialog
