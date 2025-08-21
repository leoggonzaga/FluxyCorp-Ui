import EmployeeTableList from './employeeTableList';
import { HiOutlineCheckCircle, HiOutlinePlus, HiOutlineSearch, HiOutlineUserGroup, HiUserGroup } from "react-icons/hi"
import { enterpriseApiGetEmployees } from '../../api/enterprise/EnterpriseService';
import { useEffect, useState } from 'react';
import { Button, Card, Dialog, Input, Notification, Pagination, Select, toast } from '../../components/ui';
import EmployeeUpsert from './employeeUpsert';
import { useSelector } from 'react-redux';



const employeeList = (props) => {
    const { data } = props

    // const state = useSelector((state) => state)

    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)
    const [isUpsertOpen, setIsUpsertOpen] = useState(false);
    const [paging, setPaging] = useState({
        page: 1,
        pageSize: 10,
        total: 0
    });

    const loadEmployees = async () => {
        setLoading(true)

        const result = await enterpriseApiGetEmployees();

        if (!!result?.data) {
            setEmployees(result.data);
            setPaging(prev => ({ ...prev, total: result.data.length }))
        }
        else {
            toast.push(
                <Notification type='danger' title='Falha'>
                    Falha ao carregar a lista de Funcionários. Tente novamente, mais tarde.
                </Notification>
            )
        }

        setLoading(false)
    }

    useEffect(() => {
        loadEmployees();
    }, [paging.page])

    return (
        <>
            <div className='flex items-center gap-2'>
                <h2 className='text-gray-800'>Funcionários</h2>
                <Button
                    shape='circle'
                    icon={<HiOutlinePlus />}
                    variant='solid'
                    size='xs'
                    onClick={() => setIsUpsertOpen(true)}
                />
            </div>

            <div className='flex w-full justify-end items-center gap-2'>
                <Input
                    className='w-[500px]'
                    placeholder={'Insira o nome do Profissional'}
                    size='sm'
                    prefix={<HiOutlineSearch className='text-lg' />}
                />
            </div>

            <div className='mt-4'>
                <div>
                    <div className=''>
                        <EmployeeTableList data={employees} loading={loading} />
                    </div>

                    <div className='flex w-full justify-center mt-4'>
                        <Pagination
                            pageSize={paging.pageSize}
                            total={paging.total}
                            currentPage={paging.page}
                            onChange={(newPage) => { setPaging(prev => ({ ...prev, page: newPage })) }}
                        />
                    </div>
                </div>

                <Dialog
                    isOpen={isUpsertOpen}
                    onClose={() => setIsUpsertOpen(false)}
                    onRequestClose={() => setIsUpsertOpen(false)}
                >
                    <EmployeeUpsert data={data} onClose={() => setIsUpsertOpen(false)} load={() => loadEmployees()}/>
                </Dialog>
            </div>
        </>
    )
}

export default employeeList;