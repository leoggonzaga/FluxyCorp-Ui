import { useState } from "react";
import { Button, Dialog, Dropdown, Input, Notification, Tabs, toast } from "../../components/ui";
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
import { catalogApi } from "../../api/apiBaseService";
import { catalogApiDeleteProduct, catalogApiDeleteService, catalogApiGetBundle, catalogApiGetProducts, catalogApiGetServices } from "../../api/catalog/catalogService";
import { ConfirmDialog } from "../../components/shared";

const Service_ProductIndex = () => {
    const [currentTab, setCurrentTab] = useState('service');

    const [isUpsertOpen, setIsUpsertOpen] = useState(false)
    const [itemSelected, setItemSelected] = useState(null)
    const [upsertType, setUpsertType] = useState(null)

    const [services, setServices] = useState([]);
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



    const getServices = async () => {
        const result = await catalogApiGetServices();

        if (result?.data) {
            setServices(result.data)
        }
        else {
            toast.push(
                <Notification type='danger' title="Falha na Consulta">
                    Falha ao consultar a lista de serviços. Tente novamente mais tarde
                </Notification>
            )
        }
    }

    const getBundles = async () => {
        const result = await catalogApiGetBundle();
        debugger;
        if (result?.data) {
            setBundles(result.data)
        }
        else {
            toast.push(
                <Notification type='danger' title="Falha na Consulta">
                    Falha ao consultar a lista de kits. Tente novamente mais tarde
                </Notification>
            )
        }
    }

    const getProducts = async () => {
        const result = await catalogApiGetProducts();

        if (result?.data) {
            setProducts(result.data)
        }
        else {
            toast.push(
                <Notification type='danger' title="Falha na Consulta">
                    Falha ao consultar a lista de produtos. Tente novamente mais tarde
                </Notification>
            )
        }
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
                            <ServiceList
                                data={services}
                                load={() => getServices()}
                                onOpenUpsert={(item) => onOpenUpsert('service', item)}
                            />
                        </TabContent>
                        <TabContent value="product">
                            <ProductList
                                data={products}
                                load={() => getProducts()}
                                onOpenUpsert={(item) => onOpenUpsert('product', item)}
                            />
                        </TabContent>
                        <TabContent value="bundle">
                            <BundleList 
                                data={bundles}
                                load={() => getBundles()}
                                onOpenUpsert={(item) => onOpenUpsert('bundle', item)}
                            />
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
                    <ServiceUpsert data={itemSelected} onClose={() => onCloseUpsert()} load={() => getServices()} />
                }
                {
                    upsertType == 'product' &&
                    <ProductUpsert data={itemSelected} onClose={() => onCloseUpsert()} load={() => getProducts()} />
                }
                {
                    upsertType == 'bundle' &&
                    <BundleUpsert data={itemSelected} onClose={() => onCloseUpsert()} load={() => getBundles()} />
                }
            </Dialog>
        </div>
    )
}

export default Service_ProductIndex;