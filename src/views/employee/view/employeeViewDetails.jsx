import { HiOutlineUser } from "react-icons/hi";
import Loading from "../../../components/shared/Loading";
import { Avatar, Card } from "../../../components/ui";

const EmployeeViewDetails = (props) => {
    const { data } = props
    
    return (
        <Card className='flex flex-col w-2/6'>
            <div className='flex justify-center'>
                <Avatar shape="circle" size={90} icon={1==1 ? <HiOutlineUser/> : null} src="/img/avatars/thumb-1.jpg"/>
            </div>

            <div>
                <span className='text-base'>{data?.fullName}</span>
            </div>

            <hr className='my-4'/>

            <div className='flex flex-col'>
                <span ><b>Nome:</b> {data?.person?.fullName}</span>
                <span ><b>CPF:</b> {data?.person?.nationalDocumentNumber}</span>
                <span ><b>Cargo:</b> {data?.jobTItle?.name}</span>
                <span ><b>Email:</b> {data?.email}</span>
            </div>
        </Card>
    )
}

export default EmployeeViewDetails;