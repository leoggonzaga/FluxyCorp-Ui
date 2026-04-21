import { Card, Tabs } from "@/components/ui"
import RoleManagement from "./RoleManagement"
import TemplateManagement from "./TemplateManagement"
import PaymentMethodsIndex from "./PaymentMethodsIndex"

const Settings = () => {
    const { TabNav, TabList, TabContent } = Tabs

    return (
        <div className='p-6'>
            <Card>
                <Tabs defaultValue='roles'>
                    <TabList>
                        <div className='flex flex-wrap items-center gap-2'>
                            <TabNav value='roles'>Perfis e Permissoes</TabNav>
                            <TabNav value='templates'>Contratos e Receitas</TabNav>
                            <TabNav value='payment-methods'>Meios de Pagamento</TabNav>
                        </div>
                    </TabList>

                    <div className='pt-4'>
                        <TabContent value='roles'>
                            <RoleManagement />
                        </TabContent>
                        <TabContent value='templates'>
                            <TemplateManagement />
                        </TabContent>
                        <TabContent value='payment-methods'>
                            <PaymentMethodsIndex />
                        </TabContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    )
}

export default Settings
