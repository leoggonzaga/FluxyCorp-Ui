import { HiOutlineBriefcase, HiOutlineClock, HiOutlineFingerPrint, HiOutlineUser } from "react-icons/hi";
import Loading from "../../../components/shared/Loading";
import { Card, Tabs } from "../../../components/ui";
import TabList from "../../../components/ui/Tabs/TabList";
import TabNav from "../../../components/ui/Tabs/TabNav";
import TabContent from "../../../components/ui/Tabs/TabContent";
import EmployeeTabPersonal from "./tabs/employeeTabPersonal";

const EmployeeViewTabs = ({data}) => {
    return (
        <Card className='w-4/6'>
            <Tabs defaultValue="tabPersonal" >
                <TabList>
                    <TabNav value='tabPersonal' icon={<HiOutlineUser/>}>
                        Dados Cadastrais
                    </TabNav>
                    <TabNav value='tabProfessional' icon={<HiOutlineBriefcase/>}>
                        Dados Cadastrais
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
                        <EmployeeTabPersonal data={data}/>
                    </TabContent>
                    <TabContent value='tabProfessional'>
                        Professional
                    </TabContent>
                </div>
            </Tabs>
        </Card>
    )
}

export default EmployeeViewTabs;