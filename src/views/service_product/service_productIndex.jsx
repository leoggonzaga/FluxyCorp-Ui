import { useState } from "react";
import { Button, Dialog, Dropdown, Input, Tabs } from "../../components/ui";
import TabContent from "../../components/ui/Tabs/TabContent";
import TabList from "../../components/ui/Tabs/TabList";
import TabNav from "../../components/ui/Tabs/TabNav";
import ServiceList from "./service/serviceList";
import ProductList from "./product/productList";
import BundleList from "./bundle/bundleList";
import { HiOutlineClipboard, HiOutlinePlus, HiOutlineSearch, HiOutlineTag } from "react-icons/hi";
import ServiceUpsert from "./service/serviceUpsert";
import ProductUpsert from "./product/productUpsert";
import BundleUpsert from "./bundle/bundleUpsert";

const Service_ProductIndex = () => {
    const [currentTab, setCurrentTab] = useState('service');
    const [isUpsertOpen, setIsUpsertOpen] = useState(false)
    const [itemSelected, setItemSelected] = useState(null)
    const [upsertType, setUpsertType] = useState(null)

    const [services, setServices] = useState([
        {
            id: 1,
            name: 'Avaliação Orto',
            price: 345.78,
            isActive: true,
            category: {
                id: 1,
                name: 'Ortodontia'
            },
            catalogList: [
                {
                    id: 1,
                    name: 'Catálogo 2025 UniOdonto'
                },
                {
                    id: 2,
                    name: 'Catálogo 2024 UniOdonto'
                }
            ]
        },
        {
            id: 2,
            name: 'Manutenção Orto',
            price: 1123.49,
            isActive: true,
            category: {
                id: 2,
                name: 'Endodontia'
            },
            catalogList: []
        }
    ]);
    const [products, setProducts] = useState([]);
    const [bundles, setBundles] = useState([]);

    const handleChangeCurrentTab = (tab) => {
        setCurrentTab(tab)
    }

    const onOpenUpsert = (type = null, item = null) => {
        setItemSelected(item)
        setIsUpsertOpen(true)
        setUpsertType(type)
    }

    const onCloseUpsert = () => {
        setItemSelected(null)
        setIsUpsertOpen(false)
        setUpsertType(null)
    }

    return (
        <div>
            <div className="flex items-center gap-2">
                <h2 className='text-gray-800'>Serviços & Produtos</h2>
                <Dropdown
                    renderTitle={
                        <Button
                            shape='circle'
                            icon={<HiOutlinePlus />}
                            variant='solid'
                            size='xs'
                            className="mr-1"
                        // onClick={() => setIsUpsertOpen(true)}
                        />
                    }
                    placement="middle-start-top"
                >
                    <Dropdown.Item className="" onClick={() => onOpenUpsert('service')}>
                        Cadastrar Serviço
                    </Dropdown.Item>
                    <Dropdown.Item className="" onClick={() => onOpenUpsert('product')}>
                        Cadastar Produto
                    </Dropdown.Item>
                    <Dropdown.Item className="" onClick={() => onOpenUpsert('bundle')}>
                        Cadastar Kit
                    </Dropdown.Item>
                </Dropdown>

            </div>


            <div className="flex w-full justify-end mt-4">
                <Input size="sm" prefix={<HiOutlineSearch />} placeholder="Pesquisar por Serviço..." className="w-[250px]" />
            </div>

            <div className="">
                <Tabs defaultValue='service' onChange={(tab) => handleChangeCurrentTab(tab)}>
                    <div className="">
                        <TabList>
                            <div className="flex items-center justify-center w-full">
                                <TabNav value="service">Serviços</TabNav>
                                <TabNav value="product">Produtos</TabNav>
                                <TabNav value="bundle">Kits</TabNav>
                            </div>
                        </TabList>
                    </div>

                    <div className="mt-2">
                        <TabContent value="service">
                            <ServiceList data={services} onOpenUpsert={onOpenUpsert}/>
                        </TabContent>
                        <TabContent value="product">
                            <ProductList data={products} />
                        </TabContent>
                        <TabContent value="bundle">
                            <BundleList data={bundles} />
                        </TabContent>
                    </div>

                </Tabs>
            </div>

            <Dialog
                isOpen={isUpsertOpen}
                onClose={onCloseUpsert}
                onRequestClose={onCloseUpsert}
                width={950}
            >
                {
                    upsertType == 'service' &&
                    <ServiceUpsert data={itemSelected} onClose={() => onCloseUpsert()}/>
                }
                {
                    upsertType == 'product' &&
                    <ProductUpsert data={itemSelected} onClose={() => onCloseUpsert()}/>
                }
                {
                    upsertType == 'bundle' &&
                    <BundleUpsert data={itemSelected} onClose={() => onCloseUpsert()}/>
                }
            </Dialog>
        </div>
    )
}

export default Service_ProductIndex;