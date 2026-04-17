import { HiOutlineCheckCircle, HiOutlinePencil } from 'react-icons/hi'
import { Button, Card, Input } from '../../../../components/ui'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

const EmployeeTabPersonal = ({ data }) => {
    const { state: routeState } = useLocation()
    const [isEditing, setIsEditing] = useState(!!routeState?.editMode)

    const person = data?.person || {}

    const fieldGroups = [
        {
            title: 'Identificação',
            fields: [
                { label: 'Nome Completo',    value: person?.fullName },
                { label: 'Nome Social',      value: person?.socialName },
                { label: 'Apelido',          value: person?.nickname },
                { label: 'Sexo Biológico',   value: person?.sexyType },
                { label: 'Gênero',           value: person?.gender?.name },
                { label: 'Raça / Etnia',     value: person?.race?.name },
            ],
        },
        {
            title: 'Filiação e Origem',
            fields: [
                { label: 'Nome da Mãe',          value: person?.motherName },
                { label: 'Data de Nascimento',    value: person?.birthDate },
                { label: 'Nacionalidade',         value: person?.nationality },
                { label: 'Cidade Natal',          value: person?.hometown },
                { label: 'País Natal',            value: person?.homeCountry },
                { label: 'Data de Naturalização', value: person?.naturalizationDate },
            ],
        },
        {
            title: 'Documentos Nacionais',
            fields: [
                { label: 'CPF',                value: person?.nationalDocumentNumber },
                { label: 'RG',                 value: person?.nationalDocumentNumberSec },
                { label: 'RG — Órgão Emissor', value: person?.nationalIdDepartment },
                { label: 'RG — UF',            value: person?.nationalIdUF },
                { label: 'RG — Data Emissão',  value: person?.nationalIdDate },
                { label: 'CNS',                value: person?.cns || person?.CNS },
            ],
        },
        {
            title: 'Passaporte (Estrangeiros)',
            fields: [
                { label: 'Número',       value: person?.passportNumber },
                { label: 'País Emissor', value: person?.passportIssuingCountry },
                { label: 'Emissão',      value: person?.passportIssueDate },
                { label: 'Validade',     value: person?.passportExpiryDate },
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

export default EmployeeTabPersonal
