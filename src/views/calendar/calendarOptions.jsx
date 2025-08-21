import { HiArrowCircleLeft, HiArrowCircleRight, HiFilter, HiOutlineArrowRight, HiOutlinePlus } from "react-icons/hi";
import { Badge, Button, Calendar, Card, Checkbox } from "../../components/ui";
import { Loading } from "../../components/shared"
import { enterpriseApiGetEmployees, enterpriseApiGetEmployeeSimplifiedById } from "../../api/enterprise/EnterpriseService";
import { useEffect, useState } from "react";

const CalendarOptions = ({ handleChangeDate, openUpsert, closeUpsert }) => {

    const [employees, setEmployees] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [employeesChecked, setEmployeesChecked] = useState([])
    const [isOptionsOpen, setIsOptionsOpen] = useState(true)
    const [selectedDate, setSelectedDate] = useState(null)

    const atividades = [
        { name: 'Consulta Agendada', color: '#FFFF', id: 1 },
        { name: 'Avaliação', color: '#ff0404ff', id: 2 },
        { name: 'Cirurgia', color: '#045cffff', id: 3 },
        { name: 'Consulta Agendada', color: '#FFFF', id: 4 },
        { name: 'Avaliação', color: '#ff0404ff', id: 5 },
        { name: 'Cirurgia', color: '#045cffff', id: 6 },
        { name: 'Consulta Agendada', color: '#FFFF', id: 7 },
        { name: 'Avaliação', color: '#ff0404ff', id: 8 },
        { name: 'Cirurgia', color: '#045cffff', id: 9 },
    ]

    const handleCheckEmployee = (employeeId) => {

    }

    const getEmployees = async () => {
        const result = await enterpriseApiGetEmployees();

        if (result?.data) {
            setEmployees(result.data)
        }
    }

    useEffect(() => {
        setIsLoading(true)

        getEmployees().then(() => {
            setIsLoading(false)
        })
    }, [])

    return (
        <div className='flex justify-center w-full'>
            {
                !isOptionsOpen
                    ?
                    <>
                        <HiArrowCircleRight
                            size={40}
                            className={`absolute top-1/2 -translate-y-1/2 right-0 translate-x-4 z-9 bg-gray-100 cursor-pointer rounded-full text-[#4f39f6] transition-opacity duration-200`}
                            onClick={() => setIsOptionsOpen(true)} />

                    </>

                    :

                    <>
                        <HiArrowCircleLeft
                            size={40}
                            onClick={() => setIsOptionsOpen(false)}
                            className={`absolute top-1/2 -translate-y-1/2 right-0 translate-x-3 z-9 bg-gray-100 cursor-pointer rounded-full text-[#4f39f6] transition-opacity duration-200`}

                        />

                        <div className="p-6">
                            <div className={`transition-all duration-300 ease-out ${isOptionsOpen ? 'max-h-[2000px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'}`}>
                                <div>
                                    <div className='flex justify-center'>
                                        <Button
                                            icon={<HiOutlinePlus size={12} />}
                                            variant="solid"
                                            className="text-xs"
                                            onClick={openUpsert}
                                        >
                                            Cadastrar Agendamento
                                        </Button>
                                    </div>

                                    <Card className='mt-3'>
                                        <Calendar
                                            className='calendarOption'
                                            style={{ fontSize: 12 }}
                                            onChange={(date) => {
                                                setSelectedDate(date)
                                                handleChangeDate(date)
                                            }}
                                            value={selectedDate}
                                        />
                                    </Card>
                                </div>

                                <div>
                                    <hr className='my-4' />
                                    <span className='text-xs font-bold opacity-60'>Funcionários: </span>
                                    <div className='flex min-h-[90px] flex-col gap-1 mt-4 overflow-y-auto'>
                                        <Loading loading={isLoading}>
                                            {employees?.map((employee) => {
                                                return (
                                                    <div className='flex items-center' key={employee.id}>
                                                        <Checkbox onChange={() => handleCheckEmployee(employee.id)} />
                                                        {employee?.fullName}
                                                    </div>
                                                )
                                            })}
                                        </Loading>
                                    </div>

                                    <hr className='my-4' />
                                    <span className='text-xs font-bold opacity-60'>Tipos de Atendimento: </span>
                                    <div className='mt-4 min-h-[90px] max-h-[100px] overflow-y-auto flex flex-col gap-1'>
                                        <Loading loading={isLoading}>
                                            {atividades?.map((type) => {
                                                return (
                                                    <div className='flex items-center' key={type.id}>
                                                        <Checkbox onChange={() => handleCheckEmployee(type.id)} />
                                                        {type?.name}
                                                    </div>
                                                )
                                            })}
                                        </Loading>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
            }





        </div>
    )
}

export default CalendarOptions;