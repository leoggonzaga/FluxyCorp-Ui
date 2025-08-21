import { useParams } from "react-router-dom";
import { Card, toast } from "../../../components/ui";
import EmployeeViewDetails from "./employeeViewDetails";
import { useEffect, useState } from "react";
import { enterpriseApiGetEmployeeById } from "../../../api/enterprise/EnterpriseService";
import EmployeeViewTabs from "./employeeViewTabs";
import Loading from "../../../components/shared/Loading";

const EmployeeView = () => {
    const { id } = useParams();

    const [employee, setEmployee] = useState(null)
    const [loading, setLoading] = useState(false);


    const loadEmployee = async () => {
        setLoading(true);

        const result = await enterpriseApiGetEmployeeById(id);

        if (!!result?.data) {
            setEmployee(result.data)
        }
        else {
            toast.push(
                <Notification type='danger' title='Falha'>
                    Falha ao carregar informações do colaborador. Tente novamente mais tarde.
                </Notification>
            )
        }

        setLoading(false);
    }

    useEffect(() => {
        loadEmployee();
    }, [])

    return (
        <Card className=''>
            <Loading>
                <div className='flex justify-between w-full gap-8'>
                    <EmployeeViewDetails data={employee} />
                    <EmployeeViewTabs data={employee} />
                </div>
            </Loading>
        </Card>
    )
}

export default EmployeeView;