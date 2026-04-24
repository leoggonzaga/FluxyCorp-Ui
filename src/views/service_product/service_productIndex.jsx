import { useState } from 'react'
import { Button, Dialog, Dropdown, Input, Notification, Tabs, toast } from '../../components/ui'
import CreateButton from '../../components/ui/Button/CreateButton'
import TabContent from '../../components/ui/Tabs/TabContent'
import TabList from '../../components/ui/Tabs/TabList'
import TabNav from '../../components/ui/Tabs/TabNav'
import ServiceList from './service/serviceList'
import ProductList from './product/productList'
import BundleList from './bundle/bundleList'
import { HiOutlineSearch } from 'react-icons/hi'
import ServiceUpsert from './service/serviceUpsert'
import ProductUpsert from './product/productUpsert'
import BundleUpsert from './bundle/bundleUpsert'

const Service_ProductIndex = () => {
    const [search, setSearch]       = useState('')
    const [upsertType, setUpsertType] = useState(null)
    const [isUpsertOpen, setIsUpsertOpen] = useState(false)

    const [serviceRT, setServiceRT] = useState(0)
    const [productRT, setProductRT] = useState(0)
    const [bundleRT, setBundleRT]   = useState(0)

    const onOpenCreate  = (type) => { setUpsertType(type); setIsUpsertOpen(true) }
    const onCloseCreate = ()     => { setUpsertType(null); setIsUpsertOpen(false) }

    const afterCreate = () => {
        if (upsertType === 'service') setServiceRT(t => t + 1)
        if (upsertType === 'product') setProductRT(t => t + 1)
        if (upsertType === 'bundle')  setBundleRT(t => t + 1)
        onCloseCreate()
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <Input
                    size='sm'
                    prefix={<HiOutlineSearch />}
                    placeholder='Pesquisar...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='sm:max-w-xs'
                />
                <Dropdown
                    renderTitle={
                        <CreateButton>
                            Adicionar
                        </CreateButton>
                    }
                    placement='bottom-end'
                >
                    <Dropdown.Item onClick={() => onOpenCreate('service')}>Cadastrar Serviço</Dropdown.Item>
                    <Dropdown.Item onClick={() => onOpenCreate('product')}>Cadastrar Produto</Dropdown.Item>
                    <Dropdown.Item onClick={() => onOpenCreate('bundle')}>Cadastrar Kit</Dropdown.Item>
                </Dropdown>
            </div>

            <Tabs defaultValue='service'>
                <TabList>
                    <TabNav value='service'>Serviços</TabNav>
                    <TabNav value='product'>Produtos</TabNav>
                    <TabNav value='bundle'>Kits</TabNav>
                </TabList>

                <div className='mt-4'>
                    <TabContent value='service'>
                        <ServiceList search={search} reloadTrigger={serviceRT} />
                    </TabContent>
                    <TabContent value='product'>
                        <ProductList search={search} reloadTrigger={productRT} />
                    </TabContent>
                    <TabContent value='bundle'>
                        <BundleList search={search} reloadTrigger={bundleRT} />
                    </TabContent>
                </div>
            </Tabs>

            <Dialog isOpen={isUpsertOpen} onClose={onCloseCreate} onRequestClose={onCloseCreate} width={950}>
                {upsertType === 'service' && <ServiceUpsert data={null} onClose={onCloseCreate} load={afterCreate} onUpdate={() => {}} />}
                {upsertType === 'product' && <ProductUpsert data={null} onClose={onCloseCreate} load={afterCreate} onUpdate={() => {}} />}
                {upsertType === 'bundle'  && <BundleUpsert  data={null} onClose={onCloseCreate} load={afterCreate} onUpdate={() => {}} />}
            </Dialog>
        </div>
    )
}

export default Service_ProductIndex
