import { HiOutlineCalendar, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { Button, Card, Dialog, Pagination } from '../../components/ui'
import CreateButton from '../../components/ui/Button/CreateButton'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import CatalogUpsert from './catalogUpsert'
import { ConfirmDialog } from '../../components/shared'
import { Pattern1 } from '../../components/shared/listPatterns'
import { catalogApiDeleteCatalogs, catalogApiGetCatalogs } from '../../api/catalog/catalogService'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : ''

const CatalogIndex = () => {
    const navigate = useNavigate()

    const [paging, setPaging]           = useState({ pageNumber: 1, pageSize: 20, total: 0 })
    const [catalogs, setCatalogs]       = useState([])
    const [isLoading, setIsLoading]     = useState(true)
    const [isUpsertOpen, setIsUpsertOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [deleteId, setDeleteId]       = useState(null)

    const onOpenUpsert  = (item = null) => { setSelectedItem(item); setIsUpsertOpen(true) }
    const onCloseUpsert = ()            => { setSelectedItem(null); setIsUpsertOpen(false) }
    const onOpenDelete  = (id)          => { setDeleteId(id); setIsDeleteOpen(true) }
    const onCloseDelete = ()            => { setDeleteId(null); setIsDeleteOpen(false) }

    const getCatalogs = async () => {
        setIsLoading(true)
        const result = await catalogApiGetCatalogs({ pageNumber: paging.pageNumber })
        if (result?.data?.items) {
            setCatalogs(result.data.items)
            setPaging(prev => ({ ...prev, total: result.data.totalItemCount }))
        }
        setIsLoading(false)
    }

    const handleDelete = async () => {
        await catalogApiDeleteCatalogs(deleteId)
        onCloseDelete()
        getCatalogs()
    }

    useEffect(() => { getCatalogs() }, [paging.pageNumber])

    const items = catalogs.map(item => ({
        id:          item.publicId,
        name:        item.name,
        email:       item.description || undefined,
        meta:        item.validFrom && item.validTo
                         ? `${fmtDate(item.validFrom)} → ${fmtDate(item.validTo)}`
                         : undefined,
        metaIcon:    HiOutlineCalendar,
        badge:       'Ativo',
        badgeColor:  'bg-emerald-50 text-emerald-600 border border-emerald-100',
        status:      'ativo',
        _raw:        item,
    }))

    const actions = [
        {
            key:       'edit',
            icon:      <HiOutlinePencil size={15} />,
            tooltip:   'Editar',
            onClick:   (item) => onOpenUpsert(item._raw),
            className: 'p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors',
        },
        {
            key:       'delete',
            icon:      <HiOutlineTrash size={15} />,
            tooltip:   'Excluir',
            onClick:   (item) => onOpenDelete(item._raw.publicId),
            className: 'p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors',
        },
    ]

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex justify-end'>
                <CreateButton onClick={() => onOpenUpsert()}>
                    Novo Catálogo
                </CreateButton>
            </div>

            <Card className='border border-gray-100'>
                <Pattern1
                    items={items}
                    loading={isLoading}
                    actions={actions}
                    onItemClick={(item) => navigate(`/catalog/${item._raw.publicId}`)}
                    emptyMessage='Nenhum catálogo cadastrado'
                />
            </Card>

            {paging.total > paging.pageSize && (
                <div className='flex justify-center'>
                    <Pagination
                        total={paging.total}
                        currentPage={paging.pageNumber}
                        pageSize={paging.pageSize}
                        onChange={(page) => setPaging(prev => ({ ...prev, pageNumber: page }))}
                    />
                </div>
            )}

            <Dialog isOpen={isUpsertOpen} onClose={onCloseUpsert} onRequestClose={onCloseUpsert}>
                <CatalogUpsert data={selectedItem} onClose={onCloseUpsert} load={getCatalogs} />
            </Dialog>

            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={onCloseDelete}
                onRequestClose={onCloseDelete}
                confirmText='Excluir'
                cancelText='Cancelar'
                confirmButtonColor='red-600'
                type='danger'
                onCancel={onCloseDelete}
                onConfirm={handleDelete}
            >
                Tem certeza que deseja excluir?
            </ConfirmDialog>
        </div>
    )
}

export default CatalogIndex
