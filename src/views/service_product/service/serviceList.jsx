import { HiOutlinePencil, HiOutlineTag, HiOutlineTrash } from 'react-icons/hi'
import { Card, Dialog, Notification, toast } from '../../../components/ui'
import { useEffect, useState } from 'react'
import { ConfirmDialog } from '../../../components/shared'
import { Pattern1 } from '../../../components/shared/listPatterns'
import { catalogApiDeleteService, catalogApiGetServices } from '../../../api/catalog/catalogService'
import ServiceUpsert from './serviceUpsert'

const fmtMoney = (v) => v != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    : ''

const ServiceList = ({ search, reloadTrigger }) => {
    const [items, setItems]           = useState([])
    const [isLoading, setIsLoading]   = useState(true)
    const [editItem, setEditItem]     = useState(null)
    const [deleteId, setDeleteId]     = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const load = async () => {
        const result = await catalogApiGetServices()
        if (result?.data) setItems(result.data)
    }

    useEffect(() => { load().then(() => setIsLoading(false)) }, [])
    useEffect(() => { if (reloadTrigger > 0) load() }, [reloadTrigger])

    const onUpdate = (publicId, values) =>
        setItems(prev => prev.map(s => s.publicId === publicId ? { ...s, ...values } : s))

    const onCloseDelete = () => setDeleteId(null)

    const handleDelete = async () => {
        setIsDeleting(true)
        const result = await catalogApiDeleteService(deleteId)
        if (result?.data) {
            setItems(prev => prev.filter(s => s.publicId !== deleteId))
            toast.push(<Notification type='success' title='Excluído'>Item excluído com sucesso!</Notification>)
        } else {
            toast.push(<Notification type='danger' title='Falha'>Falha ao excluir. Tente novamente.</Notification>)
        }
        setIsDeleting(false)
        onCloseDelete()
    }

    const filtered = items.filter(i => i.name?.toLowerCase().includes((search ?? '').toLowerCase()))

    const patternItems = filtered.map(item => ({
        id:         item.publicId ?? item.id,
        name:       item.name,
        email:      item.category || undefined,
        emailIcon:  HiOutlineTag,
        meta:       item.description || undefined,
        badge:      fmtMoney(item.price),
        badgeColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        _raw:       item,
    }))

    const actions = [
        {
            key:       'edit',
            icon:      <HiOutlinePencil size={15} />,
            tooltip:   'Editar',
            onClick:   (item) => setEditItem(item._raw),
            className: 'p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors',
        },
        {
            key:       'delete',
            icon:      <HiOutlineTrash size={15} />,
            tooltip:   'Excluir',
            onClick:   (item) => setDeleteId(item._raw.publicId),
            className: 'p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors',
        },
    ]

    return (
        <>
            <Card className='border border-gray-100'>
                <Pattern1
                    items={patternItems}
                    loading={isLoading}
                    actions={actions}
                    onItemClick={(item) => setEditItem(item._raw)}
                    emptyMessage='Nenhum serviço cadastrado'
                />
            </Card>

            <Dialog isOpen={!!editItem} onClose={() => setEditItem(null)} onRequestClose={() => setEditItem(null)} width={950}>
                {editItem && (
                    <ServiceUpsert
                        data={editItem}
                        onClose={() => setEditItem(null)}
                        load={load}
                        onUpdate={onUpdate}
                    />
                )}
            </Dialog>

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={onCloseDelete}
                onRequestClose={onCloseDelete}
                onCancel={onCloseDelete}
                confirmButtonColor='red-600'
                confirmText={isDeleting ? 'Excluindo...' : 'Excluir'}
                confirmDisabled={isDeleting}
                cancelText='Cancelar'
                type='danger'
                onConfirm={handleDelete}
            >
                Tem certeza que deseja excluir este item? Esta ação não poderá ser desfeita.
            </ConfirmDialog>
        </>
    )
}

export default ServiceList
