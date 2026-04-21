import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Card, Notification, Spinner, toast } from '@/components/ui'
import {
    HiOutlineOfficeBuilding,
    HiOutlineIdentification,
    HiOutlinePhone,
    HiOutlineClock,
    HiOutlineDocumentText,
    HiOutlineFolder,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineCamera,
    HiOutlineTrash,
    HiOutlineMail,
    HiOutlineLocationMarker,
    HiOutlineUserCircle,
    HiOutlineCalendar,
    HiOutlineShieldCheck,
    HiOutlineClipboardCheck,
    HiOutlinePencil,
    HiOutlineUpload,
    HiOutlinePaperClip,
    HiOutlineExclamation,
    HiOutlineGlobeAlt,
    HiOutlineStar,
    HiOutlineInformationCircle,
    HiOutlineRefresh,
} from 'react-icons/hi'
import {
    estabelecimentoGetSettings,
    estabelecimentoUpdateSettings,
    estabelecimentoAddDocument,
    estabelecimentoDeleteDocument,
} from '@/api/enterprise/EnterpriseService'

// ─── Defaults ─────────────────────────────────────────────────────────────────

const EMPTY_HOURS = { open: '08:00', close: '18:00', isOpen: true }
const DEFAULT_SCHEDULE = {
    seg: { ...EMPTY_HOURS },
    ter: { ...EMPTY_HOURS },
    qua: { ...EMPTY_HOURS },
    qui: { ...EMPTY_HOURS },
    sex: { ...EMPTY_HOURS },
    sab: { open: '08:00', close: '12:00', isOpen: true },
    dom: { open: '08:00', close: '12:00', isOpen: false },
}

const EMPTY = {
    nome: '', nomeFantasia: '', razaoSocial: '', tipo: 'juridica', logo: null,
    telefone1: '', telefone2: '', email: '', website: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
    schedule: DEFAULT_SCHEDULE,
    cnpj: '', cpf: '', ie: '',
    alvaraNumero: '', alvaraAutorizacao: '', alvaraValidade: '',
    licenca: '', vigilanciaSanitaria: '', cnes: '', nre: '',
    responsavelNome: '', responsavelCpf: '', responsavelCro: '', responsavelEspecialidade: '',
    dataFundacao: '',
    arquivos: [],
}

// ─── API mapping ──────────────────────────────────────────────────────────────

const fromApi = (dto) => ({
    nome:                dto.name ?? '',
    nomeFantasia:        dto.tradingName ?? '',
    razaoSocial:         dto.legalName ?? '',
    tipo:                dto.tipo ?? 'juridica',
    logo:                dto.logoBase64 ?? null,
    telefone1:           dto.phoneNumber ?? '',
    telefone2:           dto.phoneNumber2 ?? '',
    email:               dto.email ?? '',
    website:             dto.website ?? '',
    cep:                 dto.addressCep ?? '',
    logradouro:          dto.addressStreet ?? '',
    numero:              dto.addressNumber ?? '',
    complemento:         dto.addressComplement ?? '',
    bairro:              dto.addressNeighborhood ?? '',
    cidade:              dto.addressCity ?? '',
    estado:              dto.addressState ?? '',
    schedule:            dto.businessHoursJson
                            ? (() => { try { return JSON.parse(dto.businessHoursJson) } catch(_) { return DEFAULT_SCHEDULE } })()
                            : DEFAULT_SCHEDULE,
    cnpj:                dto.tipo === 'juridica' ? (dto.identificationNumber ?? '') : '',
    cpf:                 dto.tipo === 'fisica'   ? (dto.identificationNumber ?? '') : '',
    ie:                  dto.stateRegistration ?? '',
    alvaraNumero:        dto.operatingLicenseNumber ?? '',
    alvaraAutorizacao:   dto.operatingLicenseAuth ?? '',
    alvaraValidade:      dto.operatingLicenseExpiry ?? '',
    licenca:             dto.sanitaryLicense ?? '',
    vigilanciaSanitaria: dto.sanitaryRegistration ?? '',
    cnes:                dto.cnes ?? '',
    nre:                 dto.nre ?? '',
    responsavelNome:     dto.techResponsibleName ?? '',
    responsavelCpf:      dto.techResponsibleCpf ?? '',
    responsavelCro:      dto.techResponsibleCouncil ?? '',
    responsavelEspecialidade: dto.techResponsibleSpecialty ?? '',
    dataFundacao:        dto.establishedDate ?? '',
    arquivos:            (dto.documents ?? []).map(d => ({
        id:          d.publicId,
        publicId:    d.publicId,
        name:        d.fileName,
        type:        d.contentType,
        size:        d.fileSize,
        category:    d.category,
        base64:      d.base64Content,
        uploadedAt:  d.uploadedAt,
    })),
})

const toApi = (data) => ({
    name:                   data.nome,
    tradingName:            data.nomeFantasia,
    legalName:              data.razaoSocial,
    tipo:                   data.tipo,
    logoBase64:             data.logo,
    establishedDate:        data.dataFundacao,
    website:                data.website,
    phoneNumber:            data.telefone1,
    phoneNumber2:           data.telefone2,
    email:                  data.email,
    addressCep:             data.cep,
    addressStreet:          data.logradouro,
    addressNumber:          data.numero,
    addressComplement:      data.complemento,
    addressNeighborhood:    data.bairro,
    addressCity:            data.cidade,
    addressState:           data.estado,
    businessHoursJson:      JSON.stringify(data.schedule),
    identificationNumber:   data.tipo === 'fisica' ? data.cpf : data.cnpj,
    stateRegistration:      data.ie,
    operatingLicenseNumber: data.alvaraNumero,
    operatingLicenseAuth:   data.alvaraAutorizacao,
    operatingLicenseExpiry: data.alvaraValidade,
    sanitaryLicense:        data.licenca,
    sanitaryRegistration:   data.vigilanciaSanitaria,
    cnes:                   data.cnes,
    nre:                    data.nre,
    techResponsibleName:      data.responsavelNome,
    techResponsibleCpf:       data.responsavelCpf,
    techResponsibleCouncil:   data.responsavelCro,
    techResponsibleSpecialty: data.responsavelEspecialidade,
})

// ─── Masks ────────────────────────────────────────────────────────────────────

const maskCNPJ = (v = '') => {
    const d = v.replace(/\D/g, '').slice(0, 14)
    return d
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
}
const maskCPF = (v = '') => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    return d
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}
const maskPhone = (v = '') => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 10)
        return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '')
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '')
}
const maskCEP = (v = '') => {
    const d = v.replace(/\D/g, '').slice(0, 8)
    return d.replace(/(\d{5})(\d)/, '$1-$2')
}
const maskDate = (v = '') => {
    const d = v.replace(/\D/g, '').slice(0, 8)
    return d.replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const Field = ({ label, error, hint, children, required }) => (
    <div>
        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide'>
            {label}{required && <span className='text-rose-400 ml-0.5'>*</span>}
        </label>
        {children}
        {hint && !error && <p className='text-xs text-gray-400 mt-1'>{hint}</p>}
        {error && <p className='text-xs text-rose-500 mt-1 flex items-center gap-1'><HiOutlineExclamation className='w-3 h-3'/>{error}</p>}
    </div>
)

const inp = (accent = 'violet') =>
    `w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-${accent}-400/40 focus:border-${accent}-400 outline-none transition placeholder:text-gray-300 dark:placeholder:text-gray-600`

const SectionTitle = ({ icon: Icon, title, sub }) => (
    <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800'>
        <div className='w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0'>
            <Icon className='w-5 h-5 text-violet-600 dark:text-violet-400' />
        </div>
        <div>
            <h3 className='text-base font-bold text-gray-800 dark:text-gray-100'>{title}</h3>
            {sub && <p className='text-xs text-gray-400 mt-0.5'>{sub}</p>}
        </div>
    </div>
)

const SaveBar = ({ dirty, saving, onSave, onDiscard }) => (
    <div className={`flex items-center justify-between gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 ${dirty ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 opacity-100' : 'opacity-0 pointer-events-none bg-transparent border-transparent'}`}>
        <div className='flex items-center gap-2 text-sm text-violet-700 dark:text-violet-300'>
            <HiOutlinePencil className='w-4 h-4' />
            <span className='font-medium'>Há alterações não salvas</span>
        </div>
        <div className='flex items-center gap-2'>
            <button onClick={onDiscard} className='px-3 py-1.5 text-sm font-medium rounded-lg border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition'>
                Descartar
            </button>
            <button onClick={onSave} disabled={saving} className='flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition disabled:opacity-60 shadow-sm'>
                {saving ? <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' />Salvando…</> : <><HiOutlineCheck className='w-4 h-4' />Salvar</>}
            </button>
        </div>
    </div>
)

const Badge = ({ color, children }) => {
    const map = {
        green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        red: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        gray: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    }
    return <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${map[color] ?? map.gray}`}>{children}</span>
}

// ─── Section: Principal ───────────────────────────────────────────────────────

const SecPrincipal = ({ data, set }) => {
    const fileRef = useRef()

    const handleLogo = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => set('logo', ev.target.result)
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    return (
        <div className='space-y-6'>
            <SectionTitle icon={HiOutlineOfficeBuilding} title='Dados Principais' sub='Identificação e branding do estabelecimento' />

            <Field label='Logotipo'>
                <div className='flex items-center gap-4'>
                    <div className='w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden flex-shrink-0 relative group cursor-pointer'
                        onClick={() => fileRef.current?.click()}>
                        {data.logo
                            ? <img src={data.logo} alt='logo' className='w-full h-full object-cover' />
                            : <HiOutlineCamera className='w-7 h-7 text-gray-300 dark:text-gray-600' />}
                        <div className='absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl'>
                            <HiOutlineCamera className='w-5 h-5 text-white' />
                        </div>
                    </div>
                    <div className='space-y-2'>
                        <button type='button' onClick={() => fileRef.current?.click()}
                            className='flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition'>
                            <HiOutlineUpload className='w-4 h-4' /> Enviar logo
                        </button>
                        {data.logo && (
                            <button type='button' onClick={() => set('logo', null)}
                                className='flex items-center gap-1 text-xs text-rose-400 hover:text-rose-600 transition'>
                                <HiOutlineTrash className='w-3.5 h-3.5' /> Remover
                            </button>
                        )}
                        <p className='text-xs text-gray-400'>PNG, JPG ou SVG · recomendado 200×200px</p>
                    </div>
                    <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={handleLogo} />
                </div>
            </Field>

            <Field label='Tipo de Pessoa'>
                <div className='flex gap-3'>
                    {[{ v: 'juridica', l: 'Pessoa Jurídica' }, { v: 'fisica', l: 'Pessoa Física' }].map(({ v, l }) => (
                        <button key={v} type='button' onClick={() => set('tipo', v)}
                            className={['flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all', data.tipo === v
                                ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300'
                                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'].join(' ')}>
                            {l}
                        </button>
                    ))}
                </div>
            </Field>

            <Field label='Nome' required>
                <input value={data.nome} onChange={e => set('nome', e.target.value)} placeholder='Nome do estabelecimento' className={inp()} />
            </Field>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <Field label='Nome Fantasia'>
                    <input value={data.nomeFantasia} onChange={e => set('nomeFantasia', e.target.value)} placeholder='Como é conhecido pelo público' className={inp()} />
                </Field>
                <Field label='Razão Social'>
                    <input value={data.razaoSocial} onChange={e => set('razaoSocial', e.target.value)} placeholder={data.tipo === 'fisica' ? 'Nome completo' : 'Razão Social'} className={inp()} />
                </Field>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <Field label='Data de Fundação'>
                    <div className='relative'>
                        <HiOutlineCalendar className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                        <input value={data.dataFundacao} onChange={e => set('dataFundacao', maskDate(e.target.value))} placeholder='DD/MM/AAAA' className={`${inp()} pl-9`} />
                    </div>
                </Field>
                <Field label='Website'>
                    <div className='relative'>
                        <HiOutlineGlobeAlt className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                        <input value={data.website} onChange={e => set('website', e.target.value)} placeholder='https://seusite.com.br' className={`${inp()} pl-9`} />
                    </div>
                </Field>
            </div>
        </div>
    )
}

// ─── Section: Contato & Endereço ──────────────────────────────────────────────

const SecContato = ({ data, set }) => (
    <div className='space-y-8'>
        <div className='space-y-5'>
            <SectionTitle icon={HiOutlinePhone} title='Contato' sub='Telefones e e-mail de contato' />
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <Field label='Telefone principal'>
                    <div className='relative'>
                        <HiOutlinePhone className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                        <input value={data.telefone1} onChange={e => set('telefone1', maskPhone(e.target.value))} placeholder='(00) 00000-0000' className={`${inp()} pl-9`} />
                    </div>
                </Field>
                <Field label='Telefone secundário'>
                    <div className='relative'>
                        <HiOutlinePhone className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                        <input value={data.telefone2} onChange={e => set('telefone2', maskPhone(e.target.value))} placeholder='(00) 00000-0000' className={`${inp()} pl-9`} />
                    </div>
                </Field>
            </div>
            <Field label='E-mail'>
                <div className='relative'>
                    <HiOutlineMail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                    <input type='email' value={data.email} onChange={e => set('email', e.target.value)} placeholder='contato@clinica.com.br' className={`${inp()} pl-9`} />
                </div>
            </Field>
        </div>

        <div className='space-y-5 pt-2 border-t border-gray-100 dark:border-gray-800'>
            <SectionTitle icon={HiOutlineLocationMarker} title='Endereço' sub='Localização física do estabelecimento' />
            <div className='grid grid-cols-3 gap-4'>
                <Field label='CEP'>
                    <input value={data.cep} onChange={e => set('cep', maskCEP(e.target.value))} placeholder='00000-000' className={inp()} />
                </Field>
                <div className='col-span-2'>
                    <Field label='Logradouro'>
                        <input value={data.logradouro} onChange={e => set('logradouro', e.target.value)} placeholder='Rua, Av., Alameda…' className={inp()} />
                    </Field>
                </div>
            </div>
            <div className='grid grid-cols-3 gap-4'>
                <Field label='Número'>
                    <input value={data.numero} onChange={e => set('numero', e.target.value)} placeholder='Nº' className={inp()} />
                </Field>
                <div className='col-span-2'>
                    <Field label='Complemento'>
                        <input value={data.complemento} onChange={e => set('complemento', e.target.value)} placeholder='Sala, Bloco, Andar…' className={inp()} />
                    </Field>
                </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <Field label='Bairro'>
                    <input value={data.bairro} onChange={e => set('bairro', e.target.value)} placeholder='Bairro' className={inp()} />
                </Field>
                <Field label='Cidade'>
                    <input value={data.cidade} onChange={e => set('cidade', e.target.value)} placeholder='Cidade' className={inp()} />
                </Field>
                <Field label='Estado'>
                    <select value={data.estado} onChange={e => set('estado', e.target.value)} className={inp()}>
                        <option value=''>UF</option>
                        {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                            <option key={uf} value={uf}>{uf}</option>
                        ))}
                    </select>
                </Field>
            </div>
        </div>
    </div>
)

// ─── Section: Horário ─────────────────────────────────────────────────────────

const DAYS = [
    { k: 'seg', l: 'Segunda-feira' },
    { k: 'ter', l: 'Terça-feira' },
    { k: 'qua', l: 'Quarta-feira' },
    { k: 'qui', l: 'Quinta-feira' },
    { k: 'sex', l: 'Sexta-feira' },
    { k: 'sab', l: 'Sábado' },
    { k: 'dom', l: 'Domingo' },
]
const timeInp = 'border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 outline-none transition w-24'

const SecHorario = ({ data, set }) => {
    const setDay = (k, field, val) =>
        set('schedule', { ...data.schedule, [k]: { ...data.schedule[k], [field]: val } })

    const copyFirst = () => {
        const first = data.schedule['seg']
        const updated = {}
        DAYS.forEach(({ k }) => { updated[k] = { ...first } })
        set('schedule', updated)
    }

    return (
        <div className='space-y-6'>
            <SectionTitle icon={HiOutlineClock} title='Horário de Funcionamento' sub='Defina os horários de abertura e fechamento por dia' />
            <div className='flex justify-end'>
                <button type='button' onClick={copyFirst} className='text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium'>
                    Replicar segunda-feira para todos
                </button>
            </div>
            <div className='space-y-2'>
                {DAYS.map(({ k, l }) => {
                    const day = data.schedule[k] ?? EMPTY_HOURS
                    return (
                        <div key={k} className={['flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all',
                            day.isOpen
                                ? 'border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-900'
                                : 'border-gray-100 dark:border-gray-700/30 bg-gray-50 dark:bg-gray-800/50 opacity-60'].join(' ')}>
                            <button type='button' onClick={() => setDay(k, 'isOpen', !day.isOpen)}
                                className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors duration-200 ${day.isOpen ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${day.isOpen ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                            <div className='w-32 flex-shrink-0'>
                                <p className='text-sm font-medium text-gray-700 dark:text-gray-200'>{l}</p>
                            </div>
                            {day.isOpen ? (
                                <div className='flex items-center gap-2 flex-1'>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-xs text-gray-400 font-medium w-12 text-right'>Abre</span>
                                        <input type='time' value={day.open} onChange={e => setDay(k, 'open', e.target.value)} className={timeInp} />
                                    </div>
                                    <span className='text-gray-300 dark:text-gray-600 mx-1'>—</span>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-xs text-gray-400 font-medium w-12 text-right'>Fecha</span>
                                        <input type='time' value={day.close} onChange={e => setDay(k, 'close', e.target.value)} className={timeInp} />
                                    </div>
                                </div>
                            ) : (
                                <div className='flex-1'><Badge color='gray'>Fechado</Badge></div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Section: Documentação ────────────────────────────────────────────────────

const DocField = ({ label, value, onChange, placeholder, mask, hint, icon: Icon, badge }) => (
    <div>
        <div className='flex items-center justify-between mb-1.5'>
            <label className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>{label}</label>
            {badge}
        </div>
        <div className='relative'>
            {Icon && <Icon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />}
            <input value={value} onChange={e => onChange(mask ? mask(e.target.value) : e.target.value)} placeholder={placeholder}
                className={`${inp()} ${Icon ? 'pl-9' : ''}`} />
        </div>
        {hint && <p className='text-xs text-gray-400 mt-1'>{hint}</p>}
    </div>
)

const DocSection = ({ title, icon: Icon, children }) => (
    <div className='space-y-4'>
        <div className='flex items-center gap-2'>
            <Icon className='w-4 h-4 text-violet-500' />
            <h4 className='text-sm font-bold text-gray-700 dark:text-gray-200'>{title}</h4>
        </div>
        <div className='pl-6 space-y-4'>{children}</div>
    </div>
)

const alvaraStatus = (validade) => {
    if (!validade || validade.length < 10) return null
    const [d, m, y] = validade.split('/').map(Number)
    if (!d || !m || !y) return null
    const date = new Date(y, m - 1, d)
    const diff = Math.floor((date - new Date()) / (1000 * 60 * 60 * 24))
    if (diff < 0)   return { color: 'red',   label: 'Vencido' }
    if (diff <= 30) return { color: 'amber', label: `Vence em ${diff}d` }
    return { color: 'green', label: 'Válido' }
}

const SecDocumentos = ({ data, set }) => {
    const alvStatus = alvaraStatus(data.alvaraValidade)
    return (
        <div className='space-y-8'>
            <SectionTitle icon={HiOutlineIdentification} title='Documentação Legal' sub='CNPJ/CPF, registros e licenças do estabelecimento' />

            <DocSection title='Identificação Fiscal' icon={HiOutlineIdentification}>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    {data.tipo === 'juridica'
                        ? <DocField label='CNPJ' value={data.cnpj} onChange={v => set('cnpj', v)} mask={maskCNPJ} placeholder='00.000.000/0000-00' />
                        : <DocField label='CPF'  value={data.cpf}  onChange={v => set('cpf', v)}  mask={maskCPF}  placeholder='000.000.000-00' />
                    }
                    <DocField label='Inscrição Estadual' value={data.ie} onChange={v => set('ie', v)} placeholder='000.000.000.000' />
                </div>
                <DocField label='E-mail' value={data.email} onChange={v => set('email', v)} placeholder='contato@clinica.com.br' icon={HiOutlineMail} />
            </DocSection>

            <div className='h-px bg-gray-100 dark:bg-gray-800' />
            <DocSection title='Alvará de Funcionamento' icon={HiOutlineShieldCheck}>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                    <DocField label='Número do Alvará' value={data.alvaraNumero} onChange={v => set('alvaraNumero', v)} placeholder='0000/2024' />
                    <DocField label='Nº Autorização' value={data.alvaraAutorizacao} onChange={v => set('alvaraAutorizacao', v)} placeholder='AUTH-00000' />
                    <div>
                        <div className='flex items-center justify-between mb-1.5'>
                            <label className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Validade</label>
                            {alvStatus && <Badge color={alvStatus.color}>{alvStatus.label}</Badge>}
                        </div>
                        <input value={data.alvaraValidade} onChange={e => set('alvaraValidade', maskDate(e.target.value))} placeholder='DD/MM/AAAA' className={inp()} />
                    </div>
                </div>
            </DocSection>

            <div className='h-px bg-gray-100 dark:bg-gray-800' />
            <DocSection title='Licenças e Registros' icon={HiOutlineClipboardCheck}>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <DocField label='Licença de Funcionamento' value={data.licenca} onChange={v => set('licenca', v)} placeholder='Número da licença' />
                    <DocField label='Vigilância Sanitária' value={data.vigilanciaSanitaria} onChange={v => set('vigilanciaSanitaria', v)} placeholder='Registro VISA' />
                    <DocField label='CNES' value={data.cnes} onChange={v => set('cnes', v)} placeholder='Cód. Nacional Est. Saúde' hint='Obrigatório para unidades de saúde' />
                    <DocField label='NRE' value={data.nre} onChange={v => set('nre', v)} placeholder='Núcleo Regional de Educação' />
                </div>
            </DocSection>
        </div>
    )
}

// ─── Section: Responsável ─────────────────────────────────────────────────────

const SecResponsavel = ({ data, set }) => (
    <div className='space-y-6'>
        <SectionTitle icon={HiOutlineUserCircle} title='Responsável Técnico' sub='Profissional responsável pelo estabelecimento de saúde' />
        <div className='p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30'>
            <div className='flex items-start gap-3'>
                <HiOutlineInformationCircle className='w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5' />
                <p className='text-xs text-violet-700 dark:text-violet-300 leading-relaxed'>
                    O responsável técnico é o profissional habilitado legalmente responsável pelos serviços prestados. Seu registro constará nos documentos oficiais e nas notificações à vigilância sanitária.
                </p>
            </div>
        </div>
        <Field label='Nome completo' required>
            <div className='relative'>
                <HiOutlineUserCircle className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                <input value={data.responsavelNome} onChange={e => set('responsavelNome', e.target.value)} placeholder='Nome do responsável técnico' className={`${inp()} pl-9`} />
            </div>
        </Field>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <Field label='CPF'>
                <input value={data.responsavelCpf} onChange={e => set('responsavelCpf', maskCPF(e.target.value))} placeholder='000.000.000-00' className={inp()} />
            </Field>
            <Field label='Nº do Conselho (CRO / CRM…)'>
                <input value={data.responsavelCro} onChange={e => set('responsavelCro', e.target.value)} placeholder='SP-12345' className={inp()} />
            </Field>
        </div>
        <Field label='Especialidade'>
            <input value={data.responsavelEspecialidade} onChange={e => set('responsavelEspecialidade', e.target.value)} placeholder='Ex: Odontologia Geral, Cirurgia Buco-maxilofacial…' className={inp()} />
        </Field>
    </div>
)

// ─── Section: Arquivos ────────────────────────────────────────────────────────

const FILE_CATS = [
    { v: 'alvara',   l: 'Alvará',              color: 'text-amber-500' },
    { v: 'licenca',  l: 'Licença',             color: 'text-violet-500' },
    { v: 'visa',     l: 'Vigilância Sanitária', color: 'text-rose-500' },
    { v: 'contrato', l: 'Contrato Social',      color: 'text-blue-500' },
    { v: 'outros',   l: 'Outros',               color: 'text-gray-400' },
]
const fileIcon = (name) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return '🖼'
    if (['pdf'].includes(ext)) return '📄'
    if (['doc','docx'].includes(ext)) return '📝'
    if (['xls','xlsx'].includes(ext)) return '📊'
    return '📎'
}

const SecArquivos = ({ arquivos, onUpload, onDelete }) => {
    const fileRef = useRef()
    const [selCat, setSelCat] = useState('outros')
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files ?? [])
        if (!files.length) return
        setUploading(true)
        try {
            for (const file of files) {
                const base64 = await new Promise((res) => {
                    const r = new FileReader()
                    r.onload = (ev) => res(ev.target.result)
                    r.readAsDataURL(file)
                })
                await onUpload({ fileName: file.name, category: selCat, contentType: file.type, fileSize: file.size, base64Content: base64 })
            }
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    const grouped = useMemo(() => {
        const g = {}
        FILE_CATS.forEach(c => { g[c.v] = [] })
        ;(arquivos ?? []).forEach(f => { const cat = f.category ?? 'outros'; if (!g[cat]) g[cat] = []; g[cat].push(f) })
        return g
    }, [arquivos])

    return (
        <div className='space-y-6'>
            <SectionTitle icon={HiOutlineFolder} title='Arquivos e Documentos' sub='Guarde digitalmente documentos do estabelecimento' />

            <div className='space-y-3'>
                <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>Categoria</span>
                    {FILE_CATS.map(c => (
                        <button key={c.v} type='button' onClick={() => setSelCat(c.v)}
                            className={['px-3 py-1.5 text-xs font-medium rounded-lg border transition-all', selCat === c.v
                                ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300'
                                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'].join(' ')}>
                            {c.l}
                        </button>
                    ))}
                </div>

                <div className='border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 dark:hover:bg-violet-900/10 transition group'
                    onClick={() => !uploading && fileRef.current?.click()}>
                    {uploading
                        ? <div className='flex items-center justify-center gap-2 text-violet-500'><div className='w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin' /><span className='text-sm font-medium'>Enviando…</span></div>
                        : <>
                            <HiOutlineUpload className='w-8 h-8 text-gray-300 dark:text-gray-600 group-hover:text-violet-400 transition mx-auto mb-2' />
                            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Clique para enviar ou arraste os arquivos</p>
                            <p className='text-xs text-gray-400 mt-0.5'>PDF, PNG, JPG, DOC, XLS · Categoria: <strong className='text-violet-500'>{FILE_CATS.find(c => c.v === selCat)?.l}</strong></p>
                          </>
                    }
                    <input ref={fileRef} type='file' multiple className='hidden' onChange={handleUpload} />
                </div>
            </div>

            {(arquivos ?? []).length === 0 ? (
                <div className='text-center py-8'>
                    <HiOutlinePaperClip className='w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-2' />
                    <p className='text-sm text-gray-400'>Nenhum arquivo enviado ainda</p>
                </div>
            ) : (
                <div className='space-y-4'>
                    {FILE_CATS.filter(c => grouped[c.v]?.length > 0).map(cat => (
                        <div key={cat.v}>
                            <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${cat.color}`}>{cat.l}</p>
                            <div className='space-y-1.5'>
                                {grouped[cat.v].map(f => (
                                    <div key={f.id ?? f.publicId} className='flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-900 hover:shadow-sm transition group'>
                                        <span className='text-xl flex-shrink-0'>{fileIcon(f.name)}</span>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-medium text-gray-700 dark:text-gray-200 truncate'>{f.name}</p>
                                            <p className='text-xs text-gray-400'>{fileSize(f.size)} · {new Date(f.uploadedAt).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        {f.base64 && (
                                            <a href={f.base64} download={f.name} className='p-1.5 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition opacity-0 group-hover:opacity-100'>
                                                <HiOutlineDocumentText className='w-4 h-4' />
                                            </a>
                                        )}
                                        <button onClick={() => onDelete(f.publicId ?? f.id)} className='p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition opacity-0 group-hover:opacity-100'>
                                            <HiOutlineTrash className='w-4 h-4' />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const SECTIONS = [
    { k: 'principal',   l: 'Principal',           icon: HiOutlineStar,          sub: 'Identidade e logo' },
    { k: 'contato',     l: 'Contato & Endereço',  icon: HiOutlinePhone,         sub: 'Telefones e localização' },
    { k: 'horario',     l: 'Horário',             icon: HiOutlineClock,         sub: 'Funcionamento semanal' },
    { k: 'documentos',  l: 'Documentação',        icon: HiOutlineIdentification,sub: 'CNPJ, Alvará, CNES…' },
    { k: 'responsavel', l: 'Responsável Técnico', icon: HiOutlineUserCircle,    sub: 'CRO / CRM' },
    { k: 'arquivos',    l: 'Arquivos',            icon: HiOutlineFolder,        sub: 'Docs digitalizados' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

const EstabelecimentoIndex = () => {
    const [data, setData]     = useState(EMPTY)
    const [saved, setSaved]   = useState(EMPTY)
    const [active, setActive] = useState('principal')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving]   = useState(false)
    const [error, setError]     = useState(null)

    const loadFromApi = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const dto = await estabelecimentoGetSettings()
            const mapped = fromApi(dto)
            setData(mapped)
            setSaved(mapped)
        } catch (e) {
            setError('Não foi possível carregar as configurações. Verifique se o servidor está ativo.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadFromApi() }, [loadFromApi])

    const dirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(saved), [data, saved])

    const set = useCallback((k, v) => setData(p => ({ ...p, [k]: v })), [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const dto = await estabelecimentoUpdateSettings(toApi(data))
            const mapped = fromApi({ ...dto, documents: saved.arquivos.map(a => ({
                publicId: a.publicId, fileName: a.name, contentType: a.type,
                fileSize: a.size, category: a.category, base64Content: a.base64, uploadedAt: a.uploadedAt,
            })) })
            // preserve arquivos (documents are managed separately)
            const updated = { ...mapped, arquivos: data.arquivos }
            setData(updated)
            setSaved(updated)
            toast.push(<Notification type='success' title='Configurações salvas com sucesso' />, { placement: 'top-center' })
        } catch (_) {
            toast.push(<Notification type='danger' title='Erro ao salvar as configurações' />, { placement: 'top-center' })
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = () => setData(saved)

    const handleUploadDoc = async (docData) => {
        try {
            const created = await estabelecimentoAddDocument(docData)
            const newFile = {
                id: created.publicId, publicId: created.publicId,
                name: created.fileName, type: created.contentType,
                size: created.fileSize, category: created.category,
                base64: created.base64Content, uploadedAt: created.uploadedAt,
            }
            setData(p => ({ ...p, arquivos: [newFile, ...p.arquivos] }))
            setSaved(p => ({ ...p, arquivos: [newFile, ...p.arquivos] }))
            toast.push(<Notification type='success' title='Arquivo enviado' />, { placement: 'top-center' })
        } catch (_) {
            toast.push(<Notification type='danger' title='Erro ao enviar arquivo' />, { placement: 'top-center' })
        }
    }

    const handleDeleteDoc = async (publicId) => {
        try {
            await estabelecimentoDeleteDocument(publicId)
            const filter = (arr) => arr.filter(f => (f.publicId ?? f.id) !== publicId)
            setData(p => ({ ...p, arquivos: filter(p.arquivos) }))
            setSaved(p => ({ ...p, arquivos: filter(p.arquivos) }))
            toast.push(<Notification type='success' title='Arquivo removido' />, { placement: 'top-center' })
        } catch (_) {
            toast.push(<Notification type='danger' title='Erro ao remover arquivo' />, { placement: 'top-center' })
        }
    }

    const estName = data.nomeFantasia || data.nome || 'Estabelecimento'

    if (loading) return (
        <div className='flex items-center justify-center min-h-[60vh]'>
            <div className='flex flex-col items-center gap-3 text-gray-400'>
                <div className='w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin' />
                <p className='text-sm'>Carregando configurações…</p>
            </div>
        </div>
    )

    if (error) return (
        <div className='flex items-center justify-center min-h-[60vh]'>
            <div className='text-center space-y-4'>
                <div className='w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto'>
                    <HiOutlineExclamation className='w-7 h-7 text-rose-500' />
                </div>
                <p className='text-sm text-gray-500 dark:text-gray-400 max-w-sm'>{error}</p>
                <button onClick={loadFromApi} className='flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition mx-auto'>
                    <HiOutlineRefresh className='w-4 h-4' /> Tentar novamente
                </button>
            </div>
        </div>
    )

    return (
        <div className='w-full p-4 space-y-4'>
            {/* Header */}
            <div className='flex items-start justify-between gap-3 flex-wrap'>
                <div>
                    <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
                        <HiOutlineOfficeBuilding className='w-6 h-6 text-violet-500' />
                        Configurações do Estabelecimento
                    </h2>
                    <p className='text-sm text-gray-400 mt-0.5'>Gerencie as informações institucionais, contato e documentação</p>
                </div>
                {(data.logo || data.nome) && (
                    <div className='flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700/50 shadow-sm'>
                        {data.logo
                            ? <img src={data.logo} alt='logo' className='w-8 h-8 rounded-lg object-cover flex-shrink-0' />
                            : <div className='w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0'>
                                <HiOutlineOfficeBuilding className='w-4 h-4 text-violet-600 dark:text-violet-400' />
                              </div>
                        }
                        <div className='leading-tight'>
                            <p className='text-sm font-bold text-gray-800 dark:text-gray-100'>{estName}</p>
                            {data.tipo === 'juridica' && data.cnpj && <p className='text-xs text-gray-400 font-mono'>{data.cnpj}</p>}
                        </div>
                    </div>
                )}
            </div>

            <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onDiscard={handleDiscard} />

            <div className='flex gap-4 items-start'>
                {/* Sidebar */}
                <div className='w-60 flex-shrink-0 sticky top-4'>
                    <Card className='border border-gray-100 dark:border-gray-700/50 p-2'>
                        <div className='space-y-0.5'>
                            {SECTIONS.map(s => {
                                const Icon = s.icon
                                const sel = active === s.k
                                return (
                                    <button key={s.k} onClick={() => setActive(s.k)}
                                        className={['w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all', sel
                                            ? 'bg-violet-50 dark:bg-violet-900/20'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'].join(' ')}>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${sel ? 'bg-violet-100 dark:bg-violet-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                            <Icon className={`w-4 h-4 ${sel ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'}`} />
                                        </div>
                                        <div className='min-w-0'>
                                            <p className={`text-sm font-semibold truncate ${sel ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-200'}`}>{s.l}</p>
                                            <p className='text-xs text-gray-400 truncate'>{s.sub}</p>
                                        </div>
                                        {sel && <div className='w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0' />}
                                    </button>
                                )
                            })}
                        </div>
                    </Card>
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                    <Card className='border border-gray-100 dark:border-gray-700/50'>
                        {active === 'principal'   && <SecPrincipal   data={data} set={set} />}
                        {active === 'contato'     && <SecContato     data={data} set={set} />}
                        {active === 'horario'     && <SecHorario     data={data} set={set} />}
                        {active === 'documentos'  && <SecDocumentos  data={data} set={set} />}
                        {active === 'responsavel' && <SecResponsavel data={data} set={set} />}
                        {active === 'arquivos'    && (
                            <SecArquivos
                                arquivos={data.arquivos}
                                onUpload={handleUploadDoc}
                                onDelete={handleDeleteDoc}
                            />
                        )}
                    </Card>
                    <div className='mt-4'>
                        <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onDiscard={handleDiscard} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EstabelecimentoIndex
