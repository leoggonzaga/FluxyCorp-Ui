import EmployeeTableList from './employeeTableList'
import { HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi'
import { enterpriseApiGetEmployees } from '../../api/enterprise/EnterpriseService'
import { useEffect, useState } from 'react'
import { Button, Dialog, Input, Notification, Pagination, toast } from '../../components/ui'
import CreateButton from '../../components/ui/Button/CreateButton'
import EmployeeUpsert from './employeeUpsert'

const EmployeeList = (props) => {
    const { data } = props

    const [employees, setEmployees] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [isUpsertOpen, setIsUpsertOpen] = useState(false)
    const [paging, setPaging] = useState({ page: 1, pageSize: 10, total: 0 })

    const loadEmployees = async () => {
        setLoading(true)
        const result = await enterpriseApiGetEmployees()
        if (result?.data) {
            setEmployees(result.data)
            setFiltered(result.data)
            setPaging(prev => ({ ...prev, total: result.data.length }))
        } else {
            toast.push(
                <Notification type='danger' title='Falha'>
                    Falha ao carregar a lista de funcionários. Tente novamente mais tarde.
                </Notification>
            )
        }
        setLoading(false)
    }

    useEffect(() => { loadEmployees() }, [paging.page])

    useEffect(() => {
        const q = search.toLowerCase().trim()
        setFiltered(
            q
                ? employees.filter(e =>
                    e.fullName?.toLowerCase().includes(q) ||
                    e.email?.toLowerCase().includes(q) ||
                    e.jobTitle?.toLowerCase().includes(q)
                )
                : employees
        )
        setPaging(prev => ({ ...prev, page: 1 }))
    }, [search, employees])

    const paginated = filtered.slice(
        (paging.page - 1) * paging.pageSize,
        paging.page * paging.pageSize
    )

    return (
        <div className='space-y-5'>
            {/* Header */}
            <div className='flex items-center justify-between gap-4'>
                <div>
                    <h3 className='text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight'>
                        Funcionários
                    </h3>
                    <p className='text-sm text-gray-400 dark:text-gray-500 mt-0.5'>
                        {!loading && (
                            <>
                                <span className='font-semibold text-indigo-500'>{employees.length}</span>
                                {' '}colaboradores cadastrados
                            </>
                        )}
                    </p>
                </div>
                <CreateButton onClick={() => setIsUpsertOpen(true)}>
                    Novo Funcionário
                </CreateButton>
            </div>

            {/* Busca */}
            <Input
                placeholder='Buscar por nome, e-mail ou cargo…'
                size='sm'
                prefix={<HiOutlineSearch className='text-gray-400' />}
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {/* Lista */}
            <EmployeeTableList data={paginated} loading={loading} />

            {/* Paginação */}
            {filtered.length > paging.pageSize && (
                <div className='flex justify-center pt-1'>
                    <Pagination
                        pageSize={paging.pageSize}
                        total={filtered.length}
                        currentPage={paging.page}
                        onChange={(p) => setPaging(prev => ({ ...prev, page: p }))}
                    />
                </div>
            )}

            <Dialog
                isOpen={isUpsertOpen}
                onClose={() => setIsUpsertOpen(false)}
                onRequestClose={() => setIsUpsertOpen(false)}
            >
                <EmployeeUpsert onClose={() => setIsUpsertOpen(false)} />
            </Dialog>
        </div>
    )
}

export default EmployeeList
