import { HiOutlineBriefcase, HiOutlineClock, HiOutlineFingerPrint, HiOutlineUser } from "react-icons/hi";
import Loading from "../../../components/shared/Loading";
import { Card, Tabs } from "../../../components/ui";
import TabList from "../../../components/ui/Tabs/TabList";
import TabNav from "../../../components/ui/Tabs/TabNav";
import TabContent from "../../../components/ui/Tabs/TabContent";
import EmployeeTabPersonal from "./tabs/employeeTabPersonal";
import EmployeeTabProfessional from "./tabs/employeeTabProfessional";
import EmployeeTabAvailableSchedule from "./tabs/employeeTabAvailableSchedule";
import EmployeeTabPermissions from "./tabs/employeeTabPermissions";


const EmployeeViewTabs = ({ data, refresh }) => {
    return (
        <Card className='w-4/6'>
            <Tabs defaultValue="tabPersonal" >
                <TabList>
                    <TabNav value='tabPersonal' icon={<HiOutlineUser/>}>
                        Dados Cadastrais
                    </TabNav>
                    <TabNav value='tabProfessional' icon={<HiOutlineBriefcase/>}>
                        Dados Profissionais
                    </TabNav>
                    <TabNav value='tabTimes' icon={<HiOutlineClock/>}>
                        Horários
                    </TabNav>
                    <TabNav value='tabPermissions' icon={<HiOutlineFingerPrint/>}>
                        Permissões
                    </TabNav>
                </TabList>
                <div className="py-3">
                    <TabContent value='tabPersonal'>
                        <EmployeeTabPersonal data={data} refresh={refresh}/>
                    </TabContent>
                    <TabContent value='tabProfessional'>
                        <EmployeeTabProfessional data={data} refresh={refresh}/>
                    </TabContent>
                    <TabContent value='tabTimes'>
                        <EmployeeTabAvailableSchedule data={data}/>
                    </TabContent>
                    <TabContent value='tabPermissions'>
                        <EmployeeTabPermissions data={data}/>
                    </TabContent>
                </div>
            </Tabs>
        </Card>
    )
}

export default EmployeeViewTabs;