import FaceChart from "./FaceChart"
import { Button, Card, MoneyValue, Tabs } from "../components/ui"
import TabList from "../components/ui/Tabs/TabList"
import TabNav from "../components/ui/Tabs/TabNav"
import TabContent from "../components/ui/Tabs/TabContent"
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi"
import { useContext, useState } from "react"
import useAuth from "../utils/hooks/useAuth"
import WebSocketContext, { WSContext } from "../webSocket/WebSocketContext"

const OfferTableList = ({ data }) => {
    return (
        <ul className="flex flex-col w-full">

            {
                data?.length == 0 &&
                <span className="flex w-full justify-center text-bold text-gray-700 bg-gray-50 rounded-lg py-2">Nenhum Produto Vinculado</span>
            }

            {data?.map(item => {
                return (
                    <li key={item.id} className="even:bg-gray-100 odd:bg-gray-50 first:rounded-t-lg last:rounded-b-lg p-5 flex w-full justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col ">
                                <span className="text-base font-semibold text-gray-700">{item.name}</span>
                                <span>{item.categoryName}</span>
                            </div>
                            <div>
                                <MoneyValue className='text-emerald-600 font-semibold text-lg' value={item.price} />
                            </div>

                        </div>

                        <div className="flex items-center gap-2">

                            <Button
                                className="text-red-700"
                                icon={<HiOutlineTrash />}
                                size="sm"
                            />
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

const Home = () => {
    const [currentTab, setCurrentTab] = useState('service')

    const docs = [
        { id: 1, name: 'Atestado Médico', responsibleUserName: 'Matheus Costa' }
    ]

    const services = [
        {
            id: 1,
            name: 'Serviço Atendimento Simples',
            price: 123.54,
            isActive: true,
            categoryName: 'Avaliação'
        },
        {
            id: 2,
            name: 'Manutenção Aparelho',
            price: 250.99,
            isActive: true,
            categoryName: 'Ortodontia'
        }
    ]

    const changeCurrentTab = (tab) => {
        setCurrentTab(tab)
    }

    
    return (
        <div>Home

            <div className="border-1 p-2 rounded-lg">
                <div className="flex flex-col items-center justify-center">

                    <div className="flex flex-col w-full">
                        <Tabs defaultValue="service" className="flex w-full p-2 flex-col border-1 rounded-lg" onChange={(tab) => changeCurrentTab(tab)}>
                            <TabList>
                                <div className="flex items-center justify-center items-center w-full">
                                    <TabNav value="service">
                                        Serviço
                                    </TabNav>
                                    <TabNav value="product">
                                        Produto
                                    </TabNav>
                                    <TabNav value="bundle">
                                        Kit
                                    </TabNav>
                                </div>
                            </TabList>
                            <div className="flex flex-col w-full ">
                                <div className="my-3 flex  justify-between">
                                    <div className="flex items-end">
                                        <Button size="sm" variant="solid" color="sky-600" className="text-gray-800" icon={<HiOutlinePlus size={12} />}>Anexar {currentTab == 'service' ? 'Serviço' : 'Produto'}</Button>
                                    </div>

                                    <div className="flex gap-2 items-center">
                                        <Card>
                                            <div className="flex flex-col justify-center items-center">
                                                <span className="font-bold text-xs">Total Serviços (2): </span>
                                                <MoneyValue value={4200.30} className='text-base text-gray-700 font-semibold' />
                                            </div>
                                        </Card>
                                        <Card>
                                            <div className="flex flex-col justify-center items-center">
                                                <span className="font-bold text-xs">Total Produtos (1): </span>
                                                <MoneyValue value={300.37} className='text-base text-gray-700 font-semibold' />
                                            </div>
                                        </Card>
                                        <Card className="bg-emerald-600 text-gray-100">
                                            <div className="flex flex-col justify-center items-center">
                                                <span className="font-bold text-xs">Total:  </span>
                                                <MoneyValue value={4500.67} className='text-base font-semibold' />
                                            </div>
                                        </Card>
                                    </div>
                                </div>

                                <TabContent value="service" className="flex w-full">
                                    <OfferTableList data={services} />
                                </TabContent>
                                <TabContent value="product" className="flex w-full">
                                    <OfferTableList data={[]} />
                                </TabContent>
                                <TabContent value="bundle" className="flex w-full">
                                    <OfferTableList data={[]} />
                                </TabContent>
                            </div>
                        </Tabs>

                        <div className="flex mt-2 items-center">
                            <div className="flex justify-end w-full gap-2">
                                <Button>Cancelar</Button>
                                <Button variant="solid">Salvar</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <FaceChart className='mt-8' /> */}

            <div>
                <div className="flex items-center gap-2 mt-8">
                    <h3>Documentos</h3>
                    <Button
                        shape='circle'
                        icon={<HiOutlinePlus />}
                        variant='solid'
                        size='xs'
                        onClick={() => setIsUpsertOpen(true)}
                    />
                </div>

                <Card>
                    <ul>
                        {

                        }
                    </ul>
                </Card>
            </div>

        </div>
    )
}

export default Home
