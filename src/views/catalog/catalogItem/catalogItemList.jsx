import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { Button, Dialog, MoneyValue, Pagination, Tabs } from "../../../components/ui";
import { useEffect, useState } from "react";
import CatalogItemUpsert from "./catalogItemUpsert";
import { ConfirmDialog } from "../../../components/shared";
import { catalogApiDeleteCatalogItem, catalogApiGetProducts, catalogApiGetServices } from "../../../api/catalog/catalogService";
import TabNav from "../../../components/ui/Tabs/TabNav";
import TabList from "../../../components/ui/Tabs/TabList";
import TabContent from "../../../components/ui/Tabs/TabContent";
import CatalogItemTableList from "./components/catalogItemTableList";

const CatalogItemList = ({ data, load, type }) => {
    const [currentTab, setCurrentTab] = useState('service')

    const [isUpsertOpen, setIsUpsertOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState({ item: {}, type: '' });

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState(null)

    const onEditItem = (item) => {
        setSelectedItem({ item: item, type: item.type });
        setIsUpsertOpen(true);
    }

    const onCloseUpsert = () => {
        setSelectedItem({ item: {}, type: '' });
        setIsUpsertOpen(false);
    }

    const onDelete = (id) => {
        setConfirmDeleteId(id)
        setIsConfirmDeleteOpen(true)
    }

    const onCloseDelete = () => {
        setConfirmDeleteId(null)
        setIsConfirmDeleteOpen(false)
    }

    const handleDeleteItem = async () => {
        const param = {
            [type + 'Id']: confirmDeleteId
        }

        const result = await catalogApiDeleteCatalogItem(data.publicId, param);

        if (result?.data) {
            onCloseDelete()
            load()
        }
    }

    return (
        <div>
            <Tabs defaultValue={currentTab}>
                <TabList>
                    <div className="flex items-center justify-center w-full">
                        <TabNav value="service">Serviços</TabNav>
                        <TabNav value="product">Produtos</TabNav>
                        <TabNav value="bundle">Kits</TabNav>
                    </div>
                </TabList>

                <TabContent value="service">
                    <CatalogItemTableList data={data?.items?.filter(x => x.itemType == 'service')} onEdit={(item) => onEditItem(item, 'service')} onDelete={(id) => onDelete(id)} />
                </TabContent>

                <TabContent value="product">
                    <CatalogItemTableList data={data?.items?.filter(x => x.itemType == 'product')} onEdit={(item) => onEditItem(item, 'product')} onDelete={(id) => onDelete(id)} />
                </TabContent>

                <TabContent value="bundle">
                    <CatalogItemTableList data={data?.items?.filter(x => x.itemType == 'bundle')} onEdit={(item) => onEditItem(item, 'bundle')} onDelete={(id) => onDelete(id)} />
                </TabContent>
            </Tabs>

            <Dialog
                isOpen={isUpsertOpen}
                onRequestClose={() => onCloseUpsert()}
                onClose={() => onCloseUpsert()}
            >
                <CatalogItemUpsert data={selectedItem} onClose={(createdItem) => onCloseUpsert(createdItem)} />
            </Dialog>

            <ConfirmDialog
                isOpen={isConfirmDeleteOpen}
                onClose={() => onCloseDelete()}
                onConfirm={() => handleDeleteItem()}
                onCancel={() => onCloseDelete()}
                confirmButtonColor="red-600"
                confirmText='Excluir'
                cancelText='Cancelar'
                type="danger"
            >
                Tem certeza que deseja excluir este item? Essa ação não poderá ser desfeita.
            </ConfirmDialog>
        </div>
    )
}

export default CatalogItemList;