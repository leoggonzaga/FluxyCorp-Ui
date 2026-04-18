import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlinePlus, HiOutlineArrowLeft, HiOutlineTag } from 'react-icons/hi'
import { Button, Card, Dialog, Input, Notification, toast } from '@/components/ui'
import { ConfirmDialog, Loading } from '@/components/shared'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/inventory/inventoryService'

const COLOR_PRESETS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16']

const CategoriesIndex = () => {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' })
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    const load = async () => {
        setLoading(true)
        const result = await getCategories()
        setCategories(Array.isArray(result) ? result : [])
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const openNew = () => { setEditing(null); setForm({ name: '', description: '', color: '#6366f1' }); setIsOpen(true) }
    const openEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, description: cat.description || '', color: cat.color || '#6366f1' }); setIsOpen(true) }

    const handleSave = async () => {
        if (!form.name.trim()) { toast.push(<Notification type="danger" title="Obrigatório">Informe o nome da categoria.</Notification>); return }
        setSubmitting(true)
        const result = editing
            ? await updateCategory(editing.publicId, form)
            : await createCategory(form)
        setSubmitting(false)
        if (result) {
            toast.push(<Notification type="success" title="Sucesso">{editing ? 'Categoria atualizada.' : 'Categoria criada.'}</Notification>)
            setIsOpen(false)
            load()
        }
    }

    const handleDelete = async () => {
        const result = await deleteCategory(deleteTarget.publicId)
        if (result !== null) {
            toast.push(<Notification type="success" title="Removida">Categoria excluída.</Notification>)
            setDeleteTarget(null)
            load()
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button size="sm" variant="plain" icon={<HiOutlineArrowLeft />} onClick={() => navigate('/inventory')} />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Categorias de Produto</h2>
                        <p className="text-sm text-gray-500">Organize os produtos do estoque por categoria</p>
                    </div>
                </div>
                <Button variant="solid" icon={<HiOutlinePlus />} onClick={openNew}>Nova Categoria</Button>
            </div>

            <Loading loading={loading}>
                {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <HiOutlineTag className="w-16 h-16 mb-3 opacity-30" />
                        <p className="text-sm">Nenhuma categoria cadastrada</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categories.map(cat => (
                            <Card key={cat.publicId} className="border border-gray-100 hover:shadow-sm transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color || '#6366f1' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 truncate">{cat.name}</p>
                                        {cat.description && <p className="text-xs text-gray-500 truncate">{cat.description}</p>}
                                        <p className="text-xs text-gray-400 mt-0.5">{cat.productCount} produto{cat.productCount !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors text-xs">Editar</button>
                                        <button onClick={() => setDeleteTarget(cat)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors text-xs">Excluir</button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Loading>

            <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} onRequestClose={() => setIsOpen(false)} width={440}>
                <div className="p-1 space-y-4">
                    <h5 className="font-bold text-gray-800">{editing ? 'Editar Categoria' : 'Nova Categoria'}</h5>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nome</label>
                        <Input placeholder="Ex: Descartáveis, Anestésicos..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Descrição</label>
                        <Input placeholder="Opcional" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Cor</label>
                        <div className="flex gap-2 flex-wrap">
                            {COLOR_PRESETS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setForm(f => ({ ...f, color: c }))}
                                    className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
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
                Excluir categoria <strong>{deleteTarget?.name}</strong>?
            </ConfirmDialog>
        </div>
    )
}

export default CategoriesIndex
