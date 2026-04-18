import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineArrowLeft } from 'react-icons/hi'
import { Button, Dialog, Input, Notification, Pagination, toast } from '@/components/ui'
import { ConfirmDialog } from '@/components/shared'
import { Pattern1 } from '@/components/shared/listPatterns'
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/api/inventory/inventoryService'

const EMPTY = { name: '', contactName: '', phone: '', email: '', taxId: '', address: '', city: '', state: '', notes: '' }

const toItem = (s) => ({
    id:         s.publicId,
    name:       s.name,
    email:      s.email || undefined,
    meta:       s.taxId ? `CNPJ: ${s.taxId}` : (s.phone || undefined),
    badge:      s.city ? `${s.city}${s.state ? ` / ${s.state}` : ''}` : (s.contactName || undefined),
    status:     'ativo',
    avatarName: s.name,
    _raw:       s,
})

const SuppliersIndex = () => {
    const navigate = useNavigate()
    const [suppliers, setSuppliers] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [paging, setPaging] = useState({ page: 1, pageSize: 10 })

    const load = async () => {
        setLoading(true)
        const result = await getSuppliers()
        const list = Array.isArray(result) ? result : []
        setSuppliers(list)
        setFiltered(list)
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    useEffect(() => {
        const q = search.toLowerCase().trim()
        setFiltered(
            q
                ? suppliers.filter(s =>
                    s.name?.toLowerCase().includes(q) ||
                    s.email?.toLowerCase().includes(q) ||
                    s.contactName?.toLowerCase().includes(q) ||
                    s.taxId?.includes(q) ||
                    s.city?.toLowerCase().includes(q)
                )
                : suppliers
        )
        setPaging(prev => ({ ...prev, page: 1 }))
    }, [search, suppliers])

    const paginated = filtered.slice(
        (paging.page - 1) * paging.pageSize,
        paging.page * paging.pageSize
    )

    const openNew = () => { setEditing(null); setForm(EMPTY); setIsOpen(true) }
    const openEdit = (s) => {
        setEditing(s)
        setForm({ name: s.name, contactName: s.contactName || '', phone: s.phone || '', email: s.email || '', taxId: s.taxId || '', address: s.address || '', city: s.city || '', state: s.state || '', notes: s.notes || '' })
        setIsOpen(true)
    }

    const bind = (key) => ({ value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) })

    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.push(<Notification type="danger" title="Obrigatório">Informe o nome do fornecedor.</Notification>)
            return
        }
        setSubmitting(true)
        const result = editing
            ? await updateSupplier(editing.publicId, form)
            : await createSupplier(form)
        setSubmitting(false)
        if (result) {
            toast.push(<Notification type="success" title="Sucesso">{editing ? 'Fornecedor atualizado.' : 'Fornecedor cadastrado.'}</Notification>)
            setIsOpen(false)
            load()
        }
    }

    const handleDelete = async () => {
        const result = await deleteSupplier(deleteTarget.publicId)
        if (result !== null) {
            toast.push(<Notification type="success" title="Removido">Fornecedor excluído.</Notification>)
            setDeleteTarget(null)
            load()
        }
    }

    const actions = [
        {
            key: 'edit',
            icon: <HiOutlinePencil size={15} />,
            tooltip: 'Editar',
            className: 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
            onClick: (item) => openEdit(item._raw),
        },
        {
            key: 'delete',
            icon: <HiOutlineTrash size={15} />,
            tooltip: 'Excluir',
            className: 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
            onClick: (item) => setDeleteTarget(item._raw),
        },
    ]

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button size="sm" variant="plain" icon={<HiOutlineArrowLeft />} onClick={() => navigate('/inventory')} />
                    <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                        Fornecedores
                    </h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                        {!loading && (
                            <>
                                <span className="font-semibold text-indigo-500">{suppliers.length}</span>
                                {' '}fornecedores cadastrados
                            </>
                        )}
                    </p>
                    </div>
                </div>
                <Button
                    icon={<HiOutlinePlus />}
                    variant="solid"
                    size="sm"
                    onClick={openNew}
                >
                    Novo Fornecedor
                </Button>
            </div>

            {/* Busca */}
            <Input
                placeholder="Buscar por nome, e-mail, CNPJ ou cidade…"
                size="sm"
                prefix={<HiOutlineSearch className="text-gray-400" />}
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {/* Lista */}
            <Pattern1
                items={paginated.map(toItem)}
                loading={loading}
                emptyMessage="Nenhum fornecedor cadastrado"
                actions={actions}
            />

            {/* Paginação */}
            {filtered.length > paging.pageSize && (
                <div className="flex justify-center pt-1">
                    <Pagination
                        pageSize={paging.pageSize}
                        total={filtered.length}
                        currentPage={paging.page}
                        onChange={(p) => setPaging(prev => ({ ...prev, page: p }))}
                    />
                </div>
            )}

            {/* Dialog upsert */}
            <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} onRequestClose={() => setIsOpen(false)} width={560}>
                <div className="p-1 space-y-3">
                    <h5 className="font-bold text-gray-800 dark:text-gray-100">{editing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h5>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nome <span className="text-red-500">*</span></label>
                            <Input placeholder="Razão social ou nome" {...bind('name')} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">CNPJ</label>
                            <Input placeholder="00.000.000/0000-00" {...bind('taxId')} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contato</label>
                            <Input placeholder="Nome do responsável" {...bind('contactName')} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Telefone</label>
                            <Input placeholder="(00) 00000-0000" {...bind('phone')} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">E-mail</label>
                            <Input placeholder="contato@fornecedor.com" {...bind('email')} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Endereço</label>
                            <Input placeholder="Rua, número, bairro" {...bind('address')} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cidade</label>
                            <Input placeholder="Cidade" {...bind('city')} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Estado</label>
                            <Input placeholder="SP" {...bind('state')} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Observações</label>
                            <Input placeholder="Condições de pagamento, prazo de entrega..." {...bind('notes')} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <Button onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button variant="solid" loading={submitting} onClick={handleSave}>Salvar</Button>
                    </div>
                </div>
            </Dialog>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onRequestClose={() => setDeleteTarget(null)}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                type="danger"
                confirmText="Excluir"
                cancelText="Cancelar"
            >
                Excluir fornecedor <strong>{deleteTarget?.name}</strong>?
            </ConfirmDialog>
        </div>
    )
}

export default SuppliersIndex
