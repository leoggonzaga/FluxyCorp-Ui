import { HiOutlinePencil, HiOutlinePlus, HiOutlineSearch, HiOutlineTrash } from "react-icons/hi";
import { Button, Card, DateValue, Dialog, Input, Tag } from "../../components/ui";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CatalogUpsert from "./catalogUpsert";
import { ConfirmDialog, Loading } from "../../components/shared";
import { catalogApiGetCatalogs } from "../../api/catalog/catalogService";

const CatalogIndex = () => {
    const navigate = useNavigate();

    const [isUpsertOpen, setIsUpsertOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)

    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    const [catalogs, setCatalogs] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const onOpenUpsert = (item = null) => {
        setIsUpsertOpen(true)
        setSelectedItem(item)
    }

    const onCloseUpsert = () => {
        setIsUpsertOpen(false)
        setSelectedItem(null)
    }

    const onOpenDelete = (id) => {
        setDeleteId(id)
        setIsDeleteOpen(true)
    }

    const onCloseDelete = () => {
        setDeleteId(null)
        setIsDeleteOpen(false)
    }

    const getCatalogs = async () => {
        setIsLoading(true)

        const result = await catalogApiGetCatalogs();

        if (result?.data) {
            setCatalogs(result.data)
        }

        setIsLoading(false)
    }

    useEffect(() => {
        getCatalogs();
    }, [])

    return (
        <div>
            <div className="flex items-center gap-1">
                <h2 className='text-gray-800'>Catálogos</h2>
                <Button
                    shape='circle'
                    icon={<HiOutlinePlus />}
                    variant='solid'
                    size='xs'
                    onClick={() => setIsUpsertOpen(true)}
                />
            </div>

            <div className="flex flex-col gap-2 mt-4">
                <Loading isLoading={isLoading}>
                    {
                        catalogs?.map((item) => {
                            console.log(item)
                            return (
                                <Card>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-700 flex items-center gap-2">
                                                <span className="text-lg">{item.name}</span>
                                                <Tag className="bg-emerald-600 text-gray-100">Ativo</Tag>
                                            </span>
                                            <span className="text-base">{item.description}</span>

                                            {
                                                item.validFrom && item.validTo &&
                                                <div className="flex items-center gap-1 font-semibold text-sm mt-6">
                                                    <span>
                                                        <DateValue value={item.validFrom} />
                                                    </span>
                                                    {'->'}
                                                    <span>
                                                        <DateValue value={item.validTo} />
                                                    </span>
                                                </div>
                                            }
                                        </div>
                                        <div className='flex items-center gap-3'>
                                            <Button size="sm" variant="solid" onClick={() => navigate(`/catalog/${item.id}`)} icon={<HiOutlineSearch className="text-gray-100" />}>Acessar Catálogo</Button>
                                            <div className="flex gap-1">
                                                <Button size="sm" onClick={() => onOpenUpsert(item)} icon={<HiOutlinePencil className="text-sky-700" />} />
                                                <Button size="sm" icon={<HiOutlineTrash className="text-red-700" />} onClick={() => onOpenDelete(item.publicId)} />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })
                    }
                </Loading>
            </div>

            <Dialog
                isOpen={isUpsertOpen}
                onClose={() => onCloseUpsert()}
                onRequestClose={() => onCloseUpsert()}
            >
                <CatalogUpsert data={selectedItem} onClose={() => onCloseUpsert()} load={() => getCatalogs()}/>
            </Dialog>

            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => onCloseDelete()}
                onRequestClose={() => onCloseDelete()}
                confirmText='Excluir'
                cancelText='Cancelar'
                confirmButtonColor="red-600"
                type="danger"
                onCancel={() => onCloseDelete()}
            >
                Deseja realmente excluir este item?
            </ConfirmDialog>
        </div>
    )
}

export default CatalogIndex;