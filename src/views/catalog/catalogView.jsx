import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Dialog, Notification, toast } from '../../components/ui'
import CreateButton from '../../components/ui/Button/CreateButton'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { catalogApiGetCatalogById } from '../../api/catalog/catalogService'
import { Loading } from '../../components/shared'
import CatalogItemDualList from './components/catalogItemDualList'
import CatalogItemList from './catalogItem/catalogItemList'

const CatalogView = () => {
    const { id }   = useParams()
    const navigate = useNavigate()

    const [isLoading, setIsLoading]               = useState(false)
    const [catalog, setCatalog]                   = useState({ items: [] })
    const [isDualListOpen, setIsDualListOpen] = useState(false)

    const closeDualList = () => setIsDualListOpen(false)

    const pushNewCatalogItems = (catalogItems) => {
        setCatalog(prev => ({ ...prev, items: catalogItems }))
    }

    const patchCatalogItemPrice = (itemId, newPrice) => {
        setCatalog(prev => ({
            ...prev,
            items: (prev.items ?? []).map(it => it.id === itemId ? { ...it, price: newPrice } : it),
        }))
    }

    const loadCatalog = async () => {
        setIsLoading(true)
        const result = await catalogApiGetCatalogById(id)
        if (result?.data) {
            setCatalog(result.data)
        } else {
            toast.push(
                <Notification type='danger' title='Falha'>
                    Falha ao acessar o catálogo.
                </Notification>
            )
        }
        setIsLoading(false)
    }

    useEffect(() => { loadCatalog() }, [])

    return (
        <Loading loading={isLoading}>
            {!catalog?.name ? (
                <div className='flex flex-col items-center justify-center mt-8 gap-2'>
                    <span className='font-bold text-lg text-gray-700 dark:text-gray-200'>
                        Catálogo não encontrado
                    </span>
                </div>
            ) : (
                <div className='flex flex-col gap-4'>

                    {/* Header */}
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                        <div className='flex items-center gap-3 min-w-0'>
                            <button
                                onClick={() => navigate(-1)}
                                className='p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0'
                            >
                                <HiOutlineArrowLeft size={18} />
                            </button>
                            <div className='min-w-0'>
                                <h1 className='text-xl font-bold text-gray-800 dark:text-gray-100 truncate'>
                                    {catalog.name}
                                </h1>
                                {catalog.description && (
                                    <p className='text-sm text-gray-400 dark:text-gray-500 mt-0.5 truncate'>
                                        {catalog.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        <CreateButton onClick={() => setIsDualListOpen(true)}>
                            Associar Itens
                        </CreateButton>
                    </div>

                    <CatalogItemList data={catalog} load={loadCatalog} onPriceUpdate={patchCatalogItemPrice} />
                </div>
            )}

            <Dialog
                isOpen={isDualListOpen}
                onClose={closeDualList}
                onRequestClose={closeDualList}
                width={960}
            >
                <CatalogItemDualList
                    catalogId={id}
                    existingItems={catalog.items ?? []}
                    onClose={closeDualList}
                    onConfirmDialogClose={closeDualList}
                    updateCatalogItems={pushNewCatalogItems}
                />
            </Dialog>
        </Loading>
    )
}

export default CatalogView
