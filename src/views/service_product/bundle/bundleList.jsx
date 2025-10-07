import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { Button, MoneyValue, Notification, toast } from "../../../components/ui";
import { useEffect, useState } from "react";
import { ConfirmDialog, Loading } from "../../../components/shared";
import { catalogApiDeleteBundle } from "../../../api/catalog/catalogService";

const BundleList = ({ data, load, onOpenUpsert }) => {
    const [isLoading, setIsLoading] = useState(true)

    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [deletedItemId, setDeletedItemId] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)


    const onDelete = (publicId) => {
        setIsDeleteOpen(true)
        setDeletedItemId(publicId)
    }

    const onCloseDelete = () => {
        setIsDeleteOpen(false)
        setDeletedItemId(null)
    }

    const handleDelete = async () => {
        setIsDeleting(true)

        const result = await catalogApiDeleteBundle(deletedItemId);

        if (result?.data) {
            toast.push(
                <Notification type="success" title="Excluído">
                    Item Excluído com sucesso!
                </Notification>
            )
            load();
            onCloseDelete();
        }
        else {
            toast.push(
                <Notification type="danger" title="Falha na Exclusão">
                    Falha na exclusão do item. Tente novamente mais tarde.
                </Notification>
            )
            onCloseDelete();
        }

        setIsDeleting(false)
    }


    useEffect(() => {
        Promise.all([
            load()
        ]).then(() => setIsLoading(false))
    }, [])

    return (
        <div>
            <Loading loading={isLoading}>
                <div>
                    {data?.length == 0 && (
                        <span className="bg-gray-50 rounded-lg py-2 flex w-full justify-center font-semibold text-gray-700">
                            Nenhum Kit Cadastrado
                        </span>
                    )}

                    {data?.length > 0 && (
                        <ul>
                            {data?.map(item => (
                                <li key={item.id} className="first:rounded-t-lg last:rounded-b-lg odd:bg-gray-50 even:bg-gray-100 p-4 flex justify-between">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-800 text-base font-semibold">{item.name}</span>
                                            {' - '}
                                            <MoneyValue className='text-base font-bold text-emerald-600' value={item.price} />
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-gray-600 font-semibold">{item.category}</span>
                                            <span>{item.description}</span>

                                            {
                                                item.items?.length > 0 &&
                                                <div
                                                    className="flex items-center gap-1 mt-4"
                                                >
                                                    {item.items?.map((bundleItem, index) => {
                                                        return (
                                                            <div>
                                                                {bundleItem.name}
                                                                {(index + 1) < item.items.length ? ', ' : ''}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            }
                                        </div>


                                        {item.catalogList?.length > 0 && (
                                            <div className="flex items-center gap-1 text-sm mt-2">
                                                <span>Catálogos:</span>
                                                {item.catalogList?.map((catalog, index) => (
                                                    <div key={catalog.id}>
                                                        <span className="font-semibold">{catalog.name}</span>
                                                        {index + 1 < item.catalogList?.length ? ' / ' : ''}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button icon={<HiOutlinePencil />} onClick={() => onOpenUpsert(item)} className="text-sky-700" size="xs" />
                                        <Button icon={<HiOutlineTrash />} onClick={() => onDelete(item.publicId)} className="text-red-700" size='xs' />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Loading>

            <ConfirmDialog
                isOpen={isDeleteOpen}
                onRequestClose={() => onCloseDelete()}
                onClose={() => onCloseDelete()}
                onCancel={() => onCloseDelete()}
                confirmButtonColor="red-600"
                confirmText={isDeleting ? 'Excluindo...' : 'Excluir'}
                confirmDisabled={isDeleting}
                cancelText='Cancelar'
                type='danger'
                onConfirm={() => handleDelete()}
            >
                Tem certeza que deseja excluir este item? Esta ação não poderá ser desfeita.
            </ConfirmDialog>
        </div>
    )
}

export default BundleList;
