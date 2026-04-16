import { HiOutlineCheckCircle, HiOutlinePencil } from "react-icons/hi"
import { Button, Card, Input } from "../../../../components/ui"
import { useState } from "react"

const EmployeeTabProfessional = ({ data }) => {

    const [isEditing, setIsEditing] = useState(false)

    const toggle = () => {
        setIsEditing(prev => !prev);
    }

    const professional = data?.professional || data || {}

    const getValue = (camelKey, pascalKey) => {
        return professional?.[camelKey] ?? professional?.[pascalKey]
    }

    const fieldGroups = [
        {
            title: 'Vinculo Profissional',
            fields: [
                { label: 'UserId', value: getValue('userId', 'UserId'), readOnly: true },
                { label: 'Data de Contratacao', value: getValue('hireDate', 'HireDate') },
                { label: 'Matricula', value: getValue('employeeNumber', 'EmployeeNumber') },
                { label: 'Email', value: getValue('email', 'Email') },
                { label: 'JobTitleId', value: getValue('jobTitleId', 'JobTitleId') },
                {
                    label: 'Cargo',
                    value:
                        professional?.jobTitle?.name ??
                        professional?.JobTitle?.name ??
                        professional?.jobTitleName ??
                        professional?.jobTitle,
                },
            ],
        },
        {
            title: 'Conselho / Federacao Profissional',
            fields: [
                {
                    label: 'Codigo da Federacao',
                    value: getValue('professionalFderationCode', 'ProfessionalFderationCode'),
                },
                {
                    label: 'Numero da Federacao',
                    value: getValue('professionalFderationNumber', 'ProfessionalFderationNumber'),
                },
                {
                    label: 'UF da Federacao',
                    value: getValue('professionalFderationUF', 'ProfessionalFderationUF'),
                },
            ],
        },
        {
            title: 'Classificacao Ocupacional',
            fields: [
                { label: 'CBOId', value: getValue('cboId', 'CBOId') },
                {
                    label: 'CBO',
                    value:
                        professional?.cbo?.name ??
                        professional?.CBO?.name ??
                        professional?.cboName,
                },
            ],
        },
    ]

    return (
        <Card className='flex flex-col'>
            <div className='flex items-center gap-2 w-full justify-end'>
                <Button
                    size="sm"
                    onClick={() => toggle()}
                >
                    Cancelar
                </Button>
                <Button
                    size="sm"
                    variant="solid"
                    icon={isEditing ? <HiOutlineCheckCircle /> : <HiOutlinePencil />}
                    onClick={() => toggle()}
                >
                    {isEditing ? 'Salvar' : 'Editar'}
                </Button>

            </div>

            <div className='mt-3 space-y-5'>
                {fieldGroups.map((group) => (
                    <div key={group.title}>
                        <div className='font-bold text-base text-gray-800 mb-2'>{group.title}</div>
                        <ul className='border border-indigo-100 rounded-lg overflow-hidden'>
                            {group.fields.map((row, index) => (
                                <li
                                    key={`${group.title}-${row.label}`}
                                    className={`flex items-center w-full p-4 ${index % 2 === 0 ? 'bg-indigo-50/60' : 'bg-indigo-50/40'}`}
                                >
                                    <div className='w-2/6 font-semibold'>
                                        {row.label}:
                                    </div>
                                    <div className='w-4/6'>
                                        {isEditing && !row.readOnly ? (
                                            <Input defaultValue={row.value || ''} />
                                        ) : (
                                            row.value || '-'
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