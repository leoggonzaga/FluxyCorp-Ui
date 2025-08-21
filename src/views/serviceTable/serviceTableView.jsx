import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Dialog, Input, MoneyValue, Tabs } from "../../components/ui";
import { HiOutlinePlus, HiOutlineSearch, HiOutlineUserAdd, HiOutlineX } from "react-icons/hi";
import TabList from "../../components/ui/Tabs/TabList";
import TabNav from "../../components/ui/Tabs/TabNav";
import TabContent from "../../components/ui/Tabs/TabContent";


const ServiceTableView = () => {
    const { id } = useParams();

    const [serviceTableInfo, setServiceTableInfo] = useState([])
    const [servicesByCategory, setServicesByCategory] = useState([])
    const [isUpsertOpen, setIsUpsertOpen] = useState(false)
    const [selectedService, setSelectedService] = useState(null)

    const onEdit = (service) => {
        setSelectedService(service)
        isUpsertOpen(true)
    }

    const onUpsertClose = () => {
        setSelectedService(null)
        setIsUpsertOpen(false)
    }

    const load = async () => {
        const result = {
            id: 1,
            name: 'Tabela 2025',
            categories: [
                {
                    id: 1,
                    name: 'Orto'
                },
                {
                    id: 2,
                    name: 'Endo'
                },
                {
                    id: 3,
                    name: 'Cirurgia'
                }
            ],
            services: [
                {
                    id: 1,
                    name: 'Manutenção Orto',
                    price: 123.56,
                    isActive: true,
                    categoryId: 1
                },
                {
                    id: 2,
                    name: 'Cirurgia Endo',
                    price: 4500,
                    isActive: true,
                    categoryId: 2
                },
                {
                    id: 3,
                    name: 'Avaliação Endo',
                    price: 500.78,
                    isActive: true,
                    categoryId: 2
                }
            ]
        }

        setServiceTableInfo(result)
        setServicesByCategory((result?.categories ?? []).map(category => {
            let s = (result.services ?? []).filter(x => x.categoryId == category.id);

            if (s?.length)
                return {
                    categoryId: category.id,
                    categoryName: category.name,
                    services: s
                }
        }).filter(Boolean)); //retira os valores falsy da lista, ou seja, categorias que não possuem procedimentos

        console.log(byCategory);
    }

    useEffect(() => {
        load();
    }, [])

    return (
        <div>
            <div className="flex items-center gap-2">
                <h2 className='text-gray-800'>{serviceTableInfo.name}</h2>
                <Button
                    variant="solid"
                    shape="circle"
                    size="xs"
                    icon={<HiOutlinePlus />}
                    onClick={() => setIsUpsertOpen(true)}
                />
            </div>

            <div className='flex justify-end mt-4'>
                <Input placeholder="Pesquisar pelo Nome do Serviço" className="w-[280px]" prefix={<HiOutlineSearch />} />
            </div>

            <div className="mt-4 flex flex-col gap-2">
                {
                    !serviceTableInfo?.services || serviceTableInfo?.services == 0 &&
                    <span className="flex justify-center">Nenhum Serviço Cadastrado</span>
                }

                {
                    serviceTableInfo?.services?.length > 0 &&
                    <>
                        <Tabs defaultValue="default" >
                            <TabList>
                                <div className='flex justify-center w-full'>
                                    <TabNav value='default'>
                                        Todos
                                    </TabNav>
                                    {
                                        serviceTableInfo.categories?.map(category => {
                                            return (
                                                <TabNav value={category.id}>
                                                    {category.name}
                                                </TabNav>
                                            )
                                        })
                                    }
                                </div>
                            </TabList>
                            <div className="py-3">
                                <TabContent value='defaults'>
                                    teste
                                </TabContent>
                            </div>
                        </Tabs>

                        {
                            servicesByCategory?.map(item => {
                                return (
                                    <div className="mt-4">
                                        <span className='text-lg font-bold'>{item.categoryName}</span>

                                        <div className="mt-1 flex flex-col gap-2">
                                            {
                                                item.services?.map(service => {
                                                    return (
                                                        <Card>
                                                            <div className='flex justify-between'>
                                                                <div>
                                                                    <span className='text-base font-semibold'>{service.name}</span>
                                                                </div>

                                                                <div>
                                                                    <MoneyValue className='text-base font-semibold text-emerald-600 ' value={service.price} />
                                                                </div>
                                                            </div>

                                                        </Card>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </>
                }
            </div>

            <Dialog
                isOpen={isUpsertOpen}
                onClose={() => onUpsertClose()}
                onRequestClose={() => onUpsertClose()}
            >
                {selectedService ? 'Editar' : 'Cadatrar'} Serviço
            </Dialog>
        </div>
    )
}

export default ServiceTableView;