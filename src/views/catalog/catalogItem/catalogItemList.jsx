import { useState } from 'react'
import { Dialog, Notification, Tabs, toast } from '../../../components/ui'
import TabContent from '../../../components/ui/Tabs/TabContent'
import TabList from '../../../components/ui/Tabs/TabList'
import TabNav from '../../../components/ui/Tabs/TabNav'
import { ConfirmDialog } from '../../../components/shared'
import { catalogApiDeleteCatalogItem } from '../../../api/catalog/catalogService'
import CatalogItemUpsert from './catalogItemUpsert'
import CatalogItemTableList from './components/catalogItemTableList'

const CatalogItemList = ({ data, load, onPriceUpdate }) => {
    const [isUpsertOpen, setIsUpsertOpen]           = useState(false)
    const [selectedItem, setSelectedItem]           = useState({ item: {}, type: '' })
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId]     = useState(null)

    const onEditItem = (item) => {
        setSelectedItem({ item, type: item.type })
        setIsUpsertOpen(true)
    }

    const onCloseUpsert = () => {
        setSelectedItem({ item: {}, type: '' })
        setIsUpsertOpen(false)
    }

    const onDelete      = (id) => { setConfirmDeleteId(id); setIsConfirmDeleteOpen(true) }
    const onCloseDelete = ()   => { setConfirmDeleteId(null); setIsConfirmDeleteOpen(false) }

    const handleDeleteItem = async () => {
        const result = await catalogApiDeleteCatalogItem(data.publicId, confirmDeleteId)
        if (result?.data) {
            onCloseDelete()
            load()
            toast.push(<Notification title='Excluído' type='success'>Item excluído com sucesso!</Notification>)
        } else {
            toast.push(<Notification title='Falha' type='danger'>Falha ao excluir. Tente novamente.</Notification>)
        }
    }

    return (
        <>
            <Tabs defaultValue='service'>
                <TabList className='justify-center'>
                    <TabNav value='service'>Serviços</TabNav>
                    <TabNav value='product'>Produtos</TabNav>
                    <TabNav value='bundle'>Kits</TabNav>
                </TabList>

                <div className='mt-4'>
                    <TabContent value='service'>
                        <CatalogItemTableList
                            data={data?.items?.filter(x => x.itemType === 'service')}
                            onEdit={onEditItem}
                            onDelete={onDelete}
                        />
                    </TabContent>
                    <TabContent value='product'>
                        <CatalogItemTableList
                            data={data?.items?.filter(x => x.itemType === 'product')}
                            onEdit={onEditItem}
                            onDelete={onDelete}
                        />
                    </TabContent>
                    <TabContent value='bundle'>
                        <CatalogItemTableList
                            data={data?.items?.filter(x => x.itemType === 'bundle')}
                            onEdit={onEditItem}
                            onDelete={onDelete}
                        />
                    </TabContent>
                </div>
            </Tabs>

            <Dialog isOpen={isUpsertOpen} onRequestClose={onCloseUpsert} onClose={onCloseUpsert}>
                <CatalogItemUpsert data={selectedItem} onClose={onCloseUpsert} onPriceUpdate={onPriceUpdate} />
            </Dialog>

            <ConfirmDialog
                isOpen={isConfirmDeleteOpen}
                onClose={onCloseDelete}
                onConfirm={handleDeleteItem}
                onCancel={onCloseDelete}
                confirmButtonColor='red-600'
                confirmText='Excluir'
                cancelText='Cancelar'
                type='danger'
            >
                Tem certeza que deseja excluir este item? Essa ação não poderá ser desfeita.
            </ConfirmDialog>
        </>
    )
}

export default CatalogItemList
