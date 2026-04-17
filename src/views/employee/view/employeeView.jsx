import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Notification, toast } from '../../../components/ui'
import Loading from '../../../components/shared/Loading'
import { enterpriseApiGetEmployeeById } from '../../../api/enterprise/EnterpriseService'
import EmployeeViewDetails from './employeeViewDetails'
import EmployeeViewTabs from './employeeViewTabs'

const EmployeeView = () => {
    const { id } = useParams()
    const [employee, setEmployee] = useState(null)
    const [loading, setLoading]   = useState(false)

    const loadEmployee = async () => {
        setLoading(true)
        const result = await enterpriseApiGetEmployeeById(id)
        if (result?.data) {
            setEmployee(result.data)
        } else {
            toast.push(
                <Notification type='danger' title='Falha'>
                    Falha ao carregar informações do colaborador. Tente novamente mais tarde.
                </Notification>
            )
        }
        setLoading(false)
    }

    useEffect(() => {
        loadEmployee()
    }, [])

    return (
        <Loading loading={loading}>
            <div className='flex gap-6 w-full items-start'>
                <EmployeeViewDetails data={employee} />
                <EmployeeViewTabs data={employee} />
            </div>
        </Loading>
    )
}

export default EmployeeView
