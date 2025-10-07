import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Dialog, Input } from "../../components/ui";
import { HiExclamation, HiOutlinePlus, HiOutlineSearch } from "react-icons/hi";
import { catalogApiGetCatalogById } from "../../api/catalog/catalogService";
import { ConfirmDialog, Loading } from "../../components/shared";
import CatalogItemDualList from "./components/catalogItemDualList";
import CatalogItemList from "./catalogItem/catalogItemList";



const CatalogView = () => {
    const { id } = useParams();

    const [isLoading, setIsLoading] = useState(false)

    const [catalog, setCatalog] = useState(null)

    const [isDualListOpen, setIsDualListOpen] = useState(false)
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)


    const onDialogClose = () => {
        setIsCancelDialogOpen(true)
    }

    const onConfirmDialogClose = () => {
        setIsCancelDialogOpen(false)
        setIsDualListOpen(false)
        setIsConfirmDialogOpen(false)
    }

    const loadCatalog = async () => {
        setIsLoading(true)

        const result = await catalogApiGetCatalogById(id);
        debugger;
        if (result) {
            debugger;
            setCatalog(result.data)
        }
        else {
            toast.push(
                <Notification type='danger' title='Falha'>
                    Falha ao acessar o catálogo.
                </Notification>
            )
        }

        setIsLoading(false)
    }

    const loadServices = async () => {
        const result = apiCatalog

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
    }

    useEffect(() => {
        loadCatalog();
    }, [])

    return (
        <Loading loading={isLoading}>


            {
                !catalog
                    ?
                    <div className="flex flex-col justify-center items-center mt-4">
                        <span className="font-bold text-lg">Catálogo não encontrado!</span>
                    </div>
                    :

                    <>
                        <div className="flex items-center gap-2">
                            <h2 className='text-gray-800'>{catalog.name}</h2>
                            <Button
                                shape='circle'
                                icon={<HiOutlinePlus />}
                                variant='solid'
                                size='xs'
                                onClick={() => setIsDualListOpen(true)}
                            />
                        </div>

                        <div className='flex justify-end mt-4'>
                            <Input placeholder="Pesquisar pelo Nome do Serviço" className="w-[280px]" prefix={<HiOutlineSearch />} size="sm"/>
                        </div>

                        <div className="mt-4 flex flex-col gap-2">
                            <CatalogItemList data={catalog} load={() => loadCatalog()} type='service'/>
                        </div>
                    </>
            }

            <Dialog
                isOpen={isDualListOpen}
                onClose={() => onDialogClose()}
                onRequestClose={() => onDialogClose()}
                width={900}
            >
                <div className='flex justify-center'>
                    <h3>Cadastrar Itens de Catálogo</h3>
                </div>

                <div className="mt-4">
                    <CatalogItemDualList catalogId={id} onClose={() => onDialogClose()} onConfirmDialogClose={() => onConfirmDialogClose()} />
                </div>
            </Dialog>

            <ConfirmDialog
                isOpen={isCancelDialogOpen}
                onConfirm={() => onConfirmDialogClose()}
                onCancel={() => setIsCancelDialogOpen(false)}
                onRequestClose={() => setIsCancelDialogOpen(false)}
                type="warning"
            >
                Tem certeza que deseja <b>cancelar</b> esta operação?
            </ConfirmDialog>
        </Loading>
    )
}

export default CatalogView;