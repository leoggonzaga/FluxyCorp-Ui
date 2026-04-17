import { HiOutlineTrash } from 'react-icons/hi'
import { Pattern1 } from '@/components/shared/listPatterns'

const toItem = (product) => ({
    id:         product.id,
    name:       product.name,
    email:      product.description || '',
    meta:       `SKU ${product.sku}  ·  ${product.stock} ${product.unit}`,
    badge:      product.category,
    status:     product.stock > 0 ? 'ativo' : 'inativo',
    avatarName: product.name,
    _raw:       product,
})

const ClinicProductsTableList = ({ data, loading, onItemClick, onDelete }) => (
    <Pattern1
        items={(data ?? []).map(toItem)}
        loading={loading}
        emptyMessage='Nenhum produto cadastrado'
        onItemClick={onItemClick}
        actions={[
            {
                key:       'delete',
                icon:      <HiOutlineTrash size={15} />,
                tooltip:   'Excluir produto',
                onClick:   (item) => onDelete?.(item._raw),
                className: 'text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20',
            },
        ]}
    />
)

export default ClinicProductsTableList
