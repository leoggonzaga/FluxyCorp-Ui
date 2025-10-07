import { HiOutlineCalendar, HiOutlinePencil, HiOutlinePlus, HiOutlineSearch, HiOutlineTrash } from "react-icons/hi";
import { Button, Card, DateValue, Dialog, Input, Pagination, Tag } from "../../components/ui";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CatalogUpsert from "./catalogUpsert";
import { ConfirmDialog, Loading } from "../../components/shared";
import { catalogApiDeleteCatalogs, catalogApiGetCatalogs } from "../../api/catalog/catalogService";

const CatalogIndex = () => {
    const navigate = useNavigate();

    const [paging, setPaging] = useState({
        pageNumber: 1,
        pageSize: 20,
        total: 0
    })

    const [isUpsertOpen, setIsUpsertOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)

    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    const [catalogs, setCatalogs] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const handleChangePage = (page) => {
        setPaging(prev => ({...prev, pageNumber: page}))
    }

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

        debugger;
        const result = await catalogApiGetCatalogs({
            pageNumber: paging.pageNumber
        });

        if (result?.data?.items) {
            setCatalogs(result.data.items)
            setPaging(prev => ({...prev, total: result.data.totalItemCount}))
        }

        setIsLoading(false)
    }

    const handleDelete = async () => {
        const result = await catalogApiDeleteCatalogs(deleteId)

        if (!result) {
            toast.push(
                <Notification type='danger' title='Falha'>
                    Falha ao excluir o catálogo. Tente novamente mais tarde.
                </Notification>
            )
        }

        onCloseDelete();
        getCatalogs();
    }

    useEffect(() => {
        getCatalogs();
    }, [paging.pageNumber])

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

            <div className="flex flex-col gap-2 mt-8">
                <Loading loading={isLoading}>
                    {
                        catalogs?.length == 0
                            ?
                            <>
                                <span className="font-semibold flex justify-center text-sm">Nenhum catálogo cadastrado</span>
                            </>

                            :

                            <>
                                {
                                    catalogs?.map((item) => {
                                        return (
                                            <Card>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold flex items-center gap-2">
                                                            <span className="text-lg text-gray-800">{item.name}</span>
                                                            <Tag className="bg-emerald-600 text-gray-100">Ativo</Tag>
                                                        </span>
                                                        <span className="text-base text-gray-600">{item.description}</span>

                                                        {
                                                            item.validFrom && item.validTo &&
                                                            <div className="flex items-center gap-1 font-semibold text-sm mt-6">
                                                                <HiOutlineCalendar size={16} />
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
                                                        <Button size="sm" variant="solid" onClick={() => navigate(`/catalog/${item.publicId}`)} icon={<HiOutlineSearch className="text-gray-100" />}>Acessar Catálogo</Button>
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

                                <div className="flex justify-center mt-4">
                                    <Pagination
                                        total={paging.total}
                                        currentPage={paging.pageNumber}
                                        pageSize={paging.pageSize}
                                        onChange={(page) => handleChangePage(page)}
                                    />
                                </div>
                            </>
                    }
                </Loading>
            </div>

            <Dialog
                isOpen={isUpsertOpen}
                onClose={() => onCloseUpsert()}
                onRequestClose={() => onCloseUpsert()}
            >
                <CatalogUpsert data={selectedItem} onClose={() => onCloseUpsert()} load={() => getCatalogs()} />
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
                onConfirm={() => handleDelete()}
            >
                Tem certeza que deseja excluir?
            </ConfirmDialog>
        </div>
    )
}

export default CatalogIndex;