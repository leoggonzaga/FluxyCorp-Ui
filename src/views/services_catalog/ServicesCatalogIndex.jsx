import { Tabs } from '../../components/ui'
import TabContent from '../../components/ui/Tabs/TabContent'
import TabList from '../../components/ui/Tabs/TabList'
import TabNav from '../../components/ui/Tabs/TabNav'
import { HiOutlineBookOpen, HiOutlineShoppingBag } from 'react-icons/hi'
import CatalogIndex from '../catalog/catalogIndex'
import Service_ProductIndex from '../service_product/service_productIndex'

const ServicesCatalogIndex = () => {
    return (
        <div className='flex flex-col gap-4'>
            <h4 className='font-semibold text-gray-700'>Serviços e Produtos</h4>
            <Tabs defaultValue='catalog'>
                <TabList className='justify-center'>
                    <TabNav value='catalog' icon={<HiOutlineBookOpen />}>
                        Catálogo
                    </TabNav>
                    <TabNav value='services_products' icon={<HiOutlineShoppingBag />}>
                        Produtos e Serviços
                    </TabNav>
                </TabList>
                <div className='mt-4'>
                    <TabContent value='catalog'>
                        <CatalogIndex />
                    </TabContent>
                    <TabContent value='services_products'>
                        <Service_ProductIndex />
                    </TabContent>
                </div>
            </Tabs>
        </div>
    )
}

export default ServicesCatalogIndex
