import { Pattern1 } from '@/components/shared/listPatterns'
import { useNavigate } from 'react-router-dom'

const toItem = (employee) => ({
    id:         employee.id,
    name:       employee.fullName,
    email:      employee.email,
    meta:       employee.nationalDocumentNumber,
    badge:      employee.jobTitle,
    status:     'ativo',
    avatarName: employee.fullName,
    _raw:       employee,
})

const EmployeeTableList = ({ data, loading }) => {
    const navigate = useNavigate()

    return (
        <Pattern1
            items={(data ?? []).map(toItem)}
            loading={loading}
            emptyMessage='Nenhum funcionário encontrado'
            onItemClick={(item) => navigate(`/employee-view/${item._raw.publicId}`)}
        />
    )
}

export default EmployeeTableList
