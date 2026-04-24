import { useState } from 'react'
import { HiOutlineCheckCircle, HiOutlineX, HiOutlineCurrencyDollar } from 'react-icons/hi'
import { Notification, toast } from '../../../components/ui'
import { FormNumericInput } from '../../../components/shared'
import { catalogApiPutCatalogItem } from '../../../api/catalog/catalogService'
import { useParams } from 'react-router-dom'

const TYPE_LABELS = {
    service: 'Serviço',
    product: 'Produto',
    bundle:  'Kit',
}

const CatalogItemUpsert = ({ data, onClose, onPriceUpdate }) => {
    const { id } = useParams()
    const item   = data?.item ?? {}

    const [price, setPrice]         = useState(item.price ?? 0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleUpdate = async () => {
        setIsSubmitting(true)
        try {
            const itemType = item.itemType ?? data?.type ?? ''
            const param = {
                [`${itemType}Id`]: item[`${itemType}Id`] ?? null,
                price,
            }
            await catalogApiPutCatalogItem(id, param)
            onPriceUpdate?.(item.id, price)
            toast.push(
                <Notification title='Item atualizado' type='success'>
                    Preço atualizado com sucesso!
                </Notification>
            )
            onClose()
        } catch {
            toast.push(
                <Notification title='Erro' type='danger'>
                    Falha ao atualizar o item. Tente novamente.
                </Notification>
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='flex flex-col'>
            {/* Header */}
            <div className='flex items-start gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50'>
                <div className='w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5'>
                    <HiOutlineCurrencyDollar className='w-5 h-5 text-amber-600 dark:text-amber-400' />
                </div>
                <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-gray-800 dark:text-gray-100'>Editar Item de Catálogo</h3>
                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>Atualize o preço deste item no catálogo</p>
                </div>
                <button
                    onClick={onClose}
                    className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors'
                >
                    <HiOutlineX className='w-4 h-4' />
                </button>
            </div>

            {/* Body */}
            <div className='px-6 py-5 space-y-4'>

                {/* Item info */}
                <div className='flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50'>
                    <div className='w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0'>
                        <span className='text-xs font-bold text-amber-700 dark:text-amber-300'>
                            {(item.name ?? '?')[0]?.toUpperCase()}
                        </span>
                    </div>
                    <div className='flex-1 min-w-0'>
                        <p className='text-sm font-semibold text-gray-800 dark:text-gray-100 truncate'>
                            {item.name ?? '—'}
                        </p>
                        {item.description && (
                            <p className='text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5'>
                                {item.description}
                            </p>
                        )}
                    </div>
                    {(item.itemType ?? data?.type) && (
                        <span className='text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shrink-0'>
                            {TYPE_LABELS[item.itemType ?? data?.type] ?? item.itemType ?? data?.type}
                        </span>
                    )}
                </div>

                {/* Price */}
                <div>
                    <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>
                        Preço no Catálogo <span className='text-rose-400'>*</span>
                    </label>
                    <FormNumericInput
                        className='w-full'
                        value={price}
                        onValueChange={(vals) => setPrice(vals.floatValue ?? 0)}
                    />
                    <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-1'>
                        Preço cobrado por este item neste catálogo específico.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className='flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700/50'>
                <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className='px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors'
                >
                    Cancelar
                </button>
                <button
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                    className='flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white transition-colors'
                >
                    {isSubmitting
                        ? <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' />Salvando…</>
                        : <><HiOutlineCheckCircle className='w-4 h-4' />Atualizar Preço</>
                    }
                </button>
            </div>
        </div>
    )
}

export default CatalogItemUpsert
