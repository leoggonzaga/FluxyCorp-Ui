import { HiOutlineCheckCircle, HiOutlinePencil } from 'react-icons/hi'
import { Button, Card, Input } from '../../../../components/ui'
import { useState } from 'react'

const EmployeeTabProfessional = ({ data }) => {
    const [isEditing, setIsEditing] = useState(false)

    const p = data?.professional || data || {}

    const get = (camel, pascal) => p?.[camel] ?? p?.[pascal]

    const fieldGroups = [
        {
            title: 'Vínculo Profissional',
            fields: [
                { label: 'Data de Contratação', value: get('hireDate', 'HireDate') },
                { label: 'Matrícula',            value: get('employeeNumber', 'EmployeeNumber') },
                { label: 'Email',                value: get('email', 'Email') },
                {
                    label: 'Cargo',
                    value:
                        p?.jobTitle?.name ??
                        p?.JobTitle?.name ??
                        p?.jobTitleName ??
                        p?.jobTitle,
                },
            ],
        },
        {
            title: 'Conselho / Federação Profissional',
            fields: [
                { label: 'Código',  value: get('professionalFderationCode',   'ProfessionalFderationCode') },
                { label: 'Número',  value: get('professionalFderationNumber', 'ProfessionalFderationNumber') },
                { label: 'UF',      value: get('professionalFderationUF',     'ProfessionalFderationUF') },
            ],
        },
        {
            title: 'Classificação Ocupacional',
            fields: [
                {
                    label: 'CBO',
                    value: p?.cbo?.name ?? p?.CBO?.name ?? p?.cboName,
                },
            ],
        },
    ]

    return (
        <Card className='flex flex-col'>
            <div className='flex items-center gap-2 w-full justify-end mb-1'>
                {isEditing && (
                    <Button size='sm' onClick={() => setIsEditing(false)}>
                        Cancelar
                    </Button>
                )}
                <Button
                    size='sm'
                    variant='solid'
                    icon={isEditing ? <HiOutlineCheckCircle /> : <HiOutlinePencil />}
                    onClick={() => setIsEditing((prev) => !prev)}
                >
                    {isEditing ? 'Salvar' : 'Editar'}
                </Button>
            </div>

            <div className='mt-3 space-y-5'>
                {fieldGroups.map((group) => (
                    <div key={group.title}>
                        <p className='font-bold text-sm text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide'>
                            {group.title}
                        </p>
                        <ul className='border border-indigo-100 dark:border-indigo-900/40 rounded-xl overflow-hidden'>
                            {group.fields.map((row, index) => (
                                <li
                                    key={`${group.title}-${row.label}`}
                                    className={`flex items-center w-full px-4 py-3 ${
                                        index % 2 === 0
                                            ? 'bg-indigo-50/50 dark:bg-indigo-900/10'
                                            : 'bg-white dark:bg-gray-800/20'
                                    }`}
                                >
                                    <div className='w-2/6 text-sm font-semibold text-gray-500 dark:text-gray-400'>
                                        {row.label}
                                    </div>
                                    <div className='w-4/6 text-sm text-gray-800 dark:text-gray-100'>
                                        {isEditing ? (
                                            <Input size='sm' defaultValue={row.value || ''} />
                                        ) : (
                                            <span className={!row.value ? 'text-gray-300 dark:text-gray-600' : ''}>
                                                {row.value || '—'}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Card>
    )
}

export default EmployeeTabProfessional
