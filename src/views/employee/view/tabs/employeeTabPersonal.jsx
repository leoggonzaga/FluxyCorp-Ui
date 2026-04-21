import { useEffect, useState } from 'react'
import { HiOutlineCheckCircle, HiOutlinePencil } from 'react-icons/hi'
import { Button, Card, Input, Notification, toast } from '../../../../components/ui'
import { enterpriseApiGetGender, employeeUpdatePersonalInfo } from '../../../../api/enterprise/EnterpriseService'

const toDate = (v) => (v ? v.substring(0, 10) : '')

const SEX_OPTIONS = [
    { value: 0, label: 'Masculino' },
    { value: 1, label: 'Feminino' },
]

const initForm = (person) => ({
    fullName:               person?.fullName                   || '',
    socialName:             person?.socialName                 || '',
    nickname:               person?.nickname                   || '',
    sexyType:               person?.sexyType                   ?? 0,
    genderId:               person?.genderId                   ?? '',
    raceId:                 person?.raceId                     ?? '',
    motherName:             person?.motherName                 || '',
    birthDate:              toDate(person?.birthDate),
    nationality:            person?.nationality                || '',
    hometown:               person?.hometown                   || '',
    homeCountry:            person?.homeCountry                || '',
    naturalizationDate:     toDate(person?.naturalizationDate),
    cpf:                    person?.nationalDocumentNumber     || '',
    rg:                     person?.nationalDocumentNumberSec  || '',
    rgDepartment:           person?.nationalIdDepartment       || '',
    rgUF:                   person?.nationalIdUF               || '',
    rgDate:                 person?.nationalIdDate             || '',
    cns:                    person?.cns || person?.CNS         || '',
    passportNumber:         person?.passportNumber             || '',
    passportIssuingCountry: person?.passportIssuingCountry     || '',
    passportIssueDate:      toDate(person?.passportIssueDate),
    passportExpiryDate:     toDate(person?.passportExpiryDate),
})

// ─── sub-componentes fora do pai para evitar remount a cada keystroke ─────────

const FieldRow = ({ label, isEditing, value, onChange, type = 'text', children }) => (
    <li className='flex items-center w-full px-4 py-2.5'>
        <div className='w-2/6 text-sm font-semibold text-gray-500 dark:text-gray-400 shrink-0'>{label}</div>
        <div className='w-4/6 text-sm text-gray-800 dark:text-gray-100'>
            {isEditing ? (
                children ?? <Input size='sm' type={type} value={value} onChange={onChange} />
            ) : (
                <span className={!value ? 'text-gray-300 dark:text-gray-600' : ''}>{value || '—'}</span>
            )}
        </div>
    </li>
)

const FieldGroup = ({ title, children }) => (
    <div>
        <p className='font-bold text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest'>{title}</p>
        <ul className='border border-indigo-100 dark:border-indigo-900/40 rounded-xl overflow-hidden divide-y divide-indigo-50 dark:divide-indigo-900/20'>
            {children}
        </ul>
    </div>
)

// ─────────────────────────────────────────────────────────────────────────────

const EmployeeTabPersonal = ({ data, refresh }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving]       = useState(false)
    const [form, setForm]           = useState(() => initForm(data?.person))
    const [genders, setGenders]     = useState([])

    useEffect(() => { setForm(initForm(data?.person)) }, [data])

    useEffect(() => {
        enterpriseApiGetGender().then((res) => setGenders(res?.data || []))
    }, [])

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

    const handleCancel = () => { setForm(initForm(data?.person)); setIsEditing(false) }

    const handleSave = async () => {
        if (!data?.publicId) return
        setSaving(true)
        try {
            const result = await employeeUpdatePersonalInfo(data.publicId, {
                fullName:               form.fullName,
                socialName:             form.socialName             || null,
                nickname:               form.nickname               || null,
                sexyType:               Number(form.sexyType),
                genderId:               form.genderId    ? Number(form.genderId)  : null,
                raceId:                 form.raceId      ? Number(form.raceId)    : null,
                motherName:             form.motherName             || null,
                birthDate:              form.birthDate              || null,
                nationality:            form.nationality            || null,
                hometown:               form.hometown               || null,
                homeCountry:            form.homeCountry            || null,
                naturalizationDate:     form.naturalizationDate     || null,
                cpf:                    form.cpf                    || null,
                rg:                     form.rg                     || null,
                rgDepartment:           form.rgDepartment           || null,
                rgUF:                   form.rgUF                   || null,
                rgDate:                 form.rgDate                 || null,
                cns:                    form.cns                    || null,
                passportNumber:         form.passportNumber         || null,
                passportIssuingCountry: form.passportIssuingCountry || null,
                passportIssueDate:      form.passportIssueDate      || null,
                passportExpiryDate:     form.passportExpiryDate     || null,
            })
            if (result === null) return
            toast.push(<Notification type='success' title='Dados salvos'>Dados cadastrais atualizados com sucesso.</Notification>)
            setIsEditing(false)
            refresh?.()
        } catch {
            toast.push(<Notification type='danger' title='Erro ao salvar'>Não foi possível salvar. Tente novamente.</Notification>)
        } finally {
            setSaving(false)
        }
    }

    const e = isEditing

    return (
        <Card className='flex flex-col'>
            <div className='flex items-center justify-between w-full mb-4 pb-3 border-b border-gray-200 dark:border-gray-700'>
                <p className='text-sm font-semibold text-gray-700 dark:text-gray-200'>Dados Cadastrais</p>
                <div className='flex items-center gap-2'>
                    {e && <Button size='sm' variant='plain' onClick={handleCancel} disabled={saving}>Cancelar</Button>}
                    <Button
                        size='sm'
                        variant={e ? 'solid' : 'default'}
                        icon={e ? <HiOutlineCheckCircle /> : <HiOutlinePencil />}
                        onClick={e ? handleSave : () => setIsEditing(true)}
                        loading={saving}
                    >
                        {e ? 'Salvar' : 'Editar'}
                    </Button>
                </div>
            </div>

            <div className='space-y-5'>
                <FieldGroup title='Identificação'>
                    <FieldRow label='Nome Completo' isEditing={e} value={form.fullName}   onChange={set('fullName')} />
                    <FieldRow label='Nome Social'   isEditing={e} value={form.socialName} onChange={set('socialName')} />
                    <FieldRow label='Apelido'       isEditing={e} value={form.nickname}   onChange={set('nickname')} />
                    <FieldRow label='Sexo Biológico' isEditing={e} value={SEX_OPTIONS.find(o => o.value == form.sexyType)?.label || '—'}>
                        {e && (
                            <select value={form.sexyType} onChange={set('sexyType')}
                                className='w-full h-8 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100'>
                                {SEX_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        )}
                    </FieldRow>
                    <FieldRow label='Gênero' isEditing={e} value={genders.find(g => g.genderId == form.genderId)?.name || form.genderId || '—'}>
                        {e && (
                            <select value={form.genderId} onChange={set('genderId')}
                                className='w-full h-8 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100'>
                                <option value=''>— Selecione —</option>
                                {genders.map((g) => <option key={g.genderId} value={g.genderId}>{g.name}</option>)}
                            </select>
                        )}
                    </FieldRow>
                    <FieldRow label='Raça / Etnia' isEditing={e} value={form.raceId} onChange={set('raceId')} />
                </FieldGroup>

                <FieldGroup title='Filiação e Origem'>
                    <FieldRow label='Nome da Mãe'          isEditing={e} value={form.motherName}         onChange={set('motherName')} />
                    <FieldRow label='Data de Nascimento'    isEditing={e} value={form.birthDate}          onChange={set('birthDate')}          type='date' />
                    <FieldRow label='Nacionalidade'         isEditing={e} value={form.nationality}        onChange={set('nationality')} />
                    <FieldRow label='Cidade Natal'          isEditing={e} value={form.hometown}           onChange={set('hometown')} />
                    <FieldRow label='País Natal'            isEditing={e} value={form.homeCountry}        onChange={set('homeCountry')} />
                    <FieldRow label='Data de Naturalização' isEditing={e} value={form.naturalizationDate} onChange={set('naturalizationDate')} type='date' />
                </FieldGroup>

                <FieldGroup title='Documentos Nacionais'>
                    <FieldRow label='CPF'                isEditing={e} value={form.cpf}          onChange={set('cpf')} />
                    <FieldRow label='RG'                 isEditing={e} value={form.rg}           onChange={set('rg')} />
                    <FieldRow label='RG — Órgão Emissor' isEditing={e} value={form.rgDepartment} onChange={set('rgDepartment')} />
                    <FieldRow label='RG — UF'            isEditing={e} value={form.rgUF}         onChange={set('rgUF')} />
                    <FieldRow label='RG — Data Emissão'  isEditing={e} value={form.rgDate}       onChange={set('rgDate')} />
                    <FieldRow label='CNS'                isEditing={e} value={form.cns}          onChange={set('cns')} />
                </FieldGroup>

                <FieldGroup title='Passaporte (Estrangeiros)'>
                    <FieldRow label='Número'       isEditing={e} value={form.passportNumber}         onChange={set('passportNumber')} />
                    <FieldRow label='País Emissor' isEditing={e} value={form.passportIssuingCountry} onChange={set('passportIssuingCountry')} />
                    <FieldRow label='Emissão'      isEditing={e} value={form.passportIssueDate}      onChange={set('passportIssueDate')}  type='date' />
                    <FieldRow label='Validade'     isEditing={e} value={form.passportExpiryDate}     onChange={set('passportExpiryDate')} type='date' />
                </FieldGroup>
            </div>
        </Card>
    )
}

export default EmployeeTabPersonal
