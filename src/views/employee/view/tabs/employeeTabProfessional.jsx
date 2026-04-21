import { useEffect, useState } from 'react'
import { HiOutlineCheckCircle, HiOutlinePencil } from 'react-icons/hi'
import { Button, Card, Input, Notification, toast } from '../../../../components/ui'
import { enterpriseApiGetAllJobTitles, employeeUpdateProfessionalInfo } from '../../../../api/enterprise/EnterpriseService'

const toDate = (v) => (v ? v.substring(0, 10) : '')

const initForm = (d) => ({
    email:            d?.email                        || '',
    jobTitleId:       d?.jobTitleId                   ?? '',
    hireDate:         toDate(d?.hireDate),
    employeeNumber:   d?.employeeNumber               || '',
    federationCode:   d?.professionalFderationCode    || '',
    federationNumber: d?.professionalFderationNumber  || '',
    federationUF:     d?.professionalFderationUF      || '',
    cboId:            d?.cboId                        ?? '',
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

const EmployeeTabProfessional = ({ data, refresh }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving]       = useState(false)
    const [form, setForm]           = useState(() => initForm(data))
    const [jobTitles, setJobTitles] = useState([])

    useEffect(() => { setForm(initForm(data)) }, [data])

    useEffect(() => {
        enterpriseApiGetAllJobTitles().then((res) => setJobTitles(res?.data || []))
    }, [])

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

    const handleCancel = () => { setForm(initForm(data)); setIsEditing(false) }

    const handleSave = async () => {
        if (!data?.publicId) return
        setSaving(true)
        try {
            const result = await employeeUpdateProfessionalInfo(data.publicId, {
                email:            form.email,
                jobTitleId:       Number(form.jobTitleId),
                hireDate:         form.hireDate || new Date().toISOString().substring(0, 10),
                employeeNumber:   form.employeeNumber   || null,
                federationCode:   form.federationCode   || null,
                federationNumber: form.federationNumber || null,
                federationUF:     form.federationUF     || null,
                cboId:            form.cboId ? Number(form.cboId) : null,
            })
            if (result === null) return
            toast.push(<Notification type='success' title='Dados salvos'>Dados profissionais atualizados com sucesso.</Notification>)
            setIsEditing(false)
            refresh?.()
        } catch {
            toast.push(<Notification type='danger' title='Erro ao salvar'>Não foi possível salvar. Tente novamente.</Notification>)
        } finally {
            setSaving(false)
        }
    }

    const e = isEditing
    const jobTitleLabel = data?.jobTitle?.name || jobTitles.find((j) => j.id == form.jobTitleId)?.name || '—'

    return (
        <Card className='flex flex-col'>
            <div className='flex items-center justify-between w-full mb-4 pb-3 border-b border-gray-200 dark:border-gray-700'>
                <p className='text-sm font-semibold text-gray-700 dark:text-gray-200'>Dados Profissionais</p>
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
                <FieldGroup title='Vínculo Profissional'>
                    <FieldRow label='Email'               isEditing={e} value={form.email}          onChange={set('email')}          type='email' />
                    <FieldRow label='Cargo'               isEditing={e} value={jobTitleLabel}>
                        {e && (
                            <select value={form.jobTitleId} onChange={set('jobTitleId')}
                                className='w-full h-8 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100'>
                                <option value=''>— Selecione —</option>
                                {jobTitles.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                            </select>
                        )}
                    </FieldRow>
                    <FieldRow label='Data de Contratação' isEditing={e} value={form.hireDate}        onChange={set('hireDate')}        type='date' />
                    <FieldRow label='Matrícula'           isEditing={e} value={form.employeeNumber}  onChange={set('employeeNumber')} />
                </FieldGroup>

                <FieldGroup title='Conselho / Federação Profissional'>
                    <FieldRow label='Código'  isEditing={e} value={form.federationCode}   onChange={set('federationCode')} />
                    <FieldRow label='Número'  isEditing={e} value={form.federationNumber} onChange={set('federationNumber')} />
                    <FieldRow label='UF'      isEditing={e} value={form.federationUF}     onChange={set('federationUF')} />
                </FieldGroup>

                <FieldGroup title='Classificação Ocupacional'>
                    <FieldRow label='CBO (ID)' isEditing={e} value={form.cboId} onChange={set('cboId')} type='number' />
                </FieldGroup>
            </div>
        </Card>
    )
}

export default EmployeeTabProfessional
