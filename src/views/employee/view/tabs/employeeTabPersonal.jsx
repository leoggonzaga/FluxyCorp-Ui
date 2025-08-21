import { HiOutlineCheckCircle, HiOutlinePencil } from "react-icons/hi"
import { Button, Card, Input } from "../../../../components/ui"
import { useState } from "react"

const EmployeeTabPersonal = ({ data }) => {

    const [isEditing, setIsEditing] = useState(false)

    const toggle = () => {
        setIsEditing(prev => !prev);
    }

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

            <div className='mt-3'>
                <ul>
                    <li className='flex items-center w-full odd:bg-indigo-50/60 even:bg-indigo-50/60 p-4 rounded-t-lg'>
                        <div className='w-2/6 font-semibold'>
                            Nome Completo:
                        </div>
                        <div className='w-4/6'>
                            {
                                isEditing ?
                                    <Input defaultValue={data?.person?.fullName}/>
                                    :
                                    data?.person?.fullName
                            }

                        </div>
                    </li>
                    <li className='flex items-center w-full odd:bg-indigo-50/40 even:bg-indigo-50/40 p-4 rounded-b-lg'>
                        <div className='w-2/6 font-semibold'>
                            Nome Completo:
                        </div>
                        <div className='w-4/6'>
                            {data?.person?.fullName}
                        </div>
                    </li>
                </ul>
            </div>
        </Card>
    )
}

export default EmployeeTabPersonal