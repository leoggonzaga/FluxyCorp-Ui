import { HiOutlineCurrencyDollar, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { Card } from '../../../../components/ui'
import { Pattern1 } from '../../../../components/shared/listPatterns'

const fmtMoney = (v) => v != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    : ''

const CatalogItemTableList = ({ data, onEdit, onDelete }) => {
    const items = (data ?? []).map(item => ({
        id:         item.id,
        name:       item.name,
        badge:      fmtMoney(item.price),
        badgeColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        badgeIcon:  HiOutlineCurrencyDollar,
        _raw:       item,
    }))

    const actions = [
        {
            key:       'edit',
            icon:      <HiOutlinePencil size={15} />,
            tooltip:   'Editar',
            onClick:   (item) => onEdit(item._raw),
            className: 'p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors',
        },
        {
            key:       'delete',
            icon:      <HiOutlineTrash size={15} />,
            tooltip:   'Excluir',
            onClick:   (item) => onDelete(item._raw.id),
            className: 'p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors',
        },
    ]

    return (
        <Card className='border border-gray-100'>
            <Pattern1
                items={items}
                actions={actions}
                onItemClick={(item) => onEdit(item._raw)}
                emptyMessage='Nenhum item cadastrado neste catálogo'
            />
        </Card>
    )
}

export default CatalogItemTableList
