import { HiCheck, HiCheckCircle, HiOutlineCheckCircle, HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { Button, Card, Dialog, Pagination, Tabs, Tag } from "../../components/ui";
import { useState } from "react";
import ConsultationTypeUpsert from "./consultationTypeUpsert";
import { ConfirmDialog } from "../../components/shared";
import ConsultationTypeCategoryTableList from "./consultationTypeCategoryTableList";
import ConsultationTypeTableList from "./consultationTypeTableList";

const ConsultationTypeList = () => {

    const { TabNav, TabList, TabContent } = Tabs

    const [isUpsertOpen, setIsUpertOpen] = useState(false)
    const [typeSelected, setTypeSelected] = useState(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [typeIdDelete, setTypeIdDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false)

    const consultationTypelist = [
        { id: 1, title: 'Avaliação', color: '#15851fff' },
        { id: 2, title: 'Cirurgia', color: '#d64d4dff' },
        { id: 3, title: 'Manutenção Ortodôntica', color: '#d628abff' }
    ]

    const onOpenUpsert = (type) => {
        setIsUpertOpen(true)
        setTypeSelected(type)
    }

    const onCloseUpsert = () => {
        setIsUpertOpen(false);
        setTypeSelected(null);
    }

    const onCloseDelete = () => {
        setIsDeleteOpen(false)
        setTypeIdDelete(null)
    }

    const onDeleteType = (id) => {
        setTypeIdDelete(id)
        setIsDeleteOpen(true)
    }

    const handleEditType = (item) => {
        setIsUpertOpen(true);
        setTypeSelected(item)
    }

    return (
        <>
            <div className='flex items-center gap-2'>
                <h2>Tipos de Atendimento</h2>
                <Button
                    shape='circle'
                    icon={<HiOutlinePlus />}
                    variant='solid'
                    size='xs'
                    onClick={() => setIsUpertOpen(true)}
                />
            </div>
            <div className=''>
                <Tabs defaultValue="tab1">
                    <TabList>
                        <div className="flex items-center justify-center w-full">
                            <TabNav value="tab1">Tipo de Atendimento</TabNav>
                            <TabNav value="tab2">Categorias</TabNav>
                        </div>
                    </TabList>
                    <div className="p-4">
                        <TabContent value="tab1">
                                <ConsultationTypeTableList data={consultationTypelist} onOpenUpsert={onOpenUpsert} onDeleteType={onDeleteType}/>
                        </TabContent>
                        <TabContent value="tab2">
                            <ConsultationTypeCategoryTableList data={consultationTypelist} onOpenDelete={onDeleteType}/>
                        </TabContent>
                    </div>
                </Tabs>
            </div>

            <Dialog
                isOpen={isUpsertOpen}
                onRequestClose={onCloseUpsert}
                onClose={onCloseUpsert}
            >
                <ConsultationTypeUpsert data={typeSelected} onClose={onCloseUpsert} />
            </Dialog>

            <ConfirmDialog
                isOpen={isDeleteOpen}
                onRequestClose={onCloseDelete}
                onClose={onCloseDelete}
                type='danger'
                confirmButtonColor="red"
                confirmText={isDeleting ? 'Excluindo...' : 'Excluir'}
            >
                Tem certeza que deseja deletar o item {typeIdDelete}
            </ConfirmDialog>
        </>
    )
}

export default ConsultationTypeList;