
import { HiOutlineAcademicCap, HiOutlineIdentification, HiOutlineMail, HiOutlineUser } from 'react-icons/hi';
import { Avatar, Button, Spinner, Tag, Card } from '../../components/ui';
import ActionLink from '@/components/shared/ActionLink'
import Loading from '../../components/shared/Loading'
import { useNavigate } from 'react-router-dom';


const EmployeeTableList = (props) => {
    const { data, loading } = props

    const navigate = useNavigate()

    return (
        <Loading loading={loading}>
            <div className='flex flex-col gap-2 '>
                {data?.map(((item) => {
                    return (
                        <div
                            className='cursor-pointer hover:bg-indigo-50/60 border-1 p-3 rounded-lg'
                            key={item.id}
                            onClick={() => navigate(`/employee-view/${item.identifier}`)}
                        >
                            <div className='items-center flex'>
                                <div className='flex items-center w-1/3'>
                                    <Avatar shape="circle" className="mr-4" size={50} icon={<HiOutlineUser />} src="/img/avatars/thumb-1.jpg"/>

                                    <div className='flex flex-col'>
                                        <span className='font-semibold text-base text-[#3b2bb3] flex items-center gap-2'>
                                            {item.fullName}
                                        </span>

                                        <span className='flex items-center gap-1'>
                                            <HiOutlineMail size={15} />
                                            {item.email}
                                        </span>

                                        <span className='flex items-center gap-1'>
                                            <HiOutlineIdentification size={15} />
                                            {item.nationalDocumentNumber}
                                        </span>
                                    </div>
                                </div>

                                <div className=' text-sm flex justify-center w-1/3'>
                                    <span className='flex items-center justify-start gap-1 text-[#3b2bb3]'>
                                        <HiOutlineAcademicCap size={15} />
                                        {item.jobTitle}
                                    </span>
                                </div>

                                <div className='flex justify-end w-1/3'>
                                    <Tag className='bg-emerald-600 text-gray-100 text-xs'>Ativo</Tag>
                                </div>

                            </div>
                        </div>
                    )
                }))}
            </div>

        </Loading>
    )
}

export default EmployeeTableList;