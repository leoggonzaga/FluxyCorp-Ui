import { useEffect, useRef, useState } from 'react'
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
    HiOutlineClipboardList, HiOutlineTag, HiOutlineCheckCircle,
    HiOutlineX, HiOutlineCheck,
} from 'react-icons/hi'
import { Card, Dialog, Notification, Tabs, toast } from '@/components/ui'
import { ConfirmDialog } from '@/components/shared'
import ConsultationTypeUpsert from './consultationTypeUpsert'
import {
    consultationTypeApiGetTypes,
    consultationTypeApiDelete,
    consultationCategoryApiGetAll,
    consultationCategoryApiCreate,
    consultationCategoryApiUpdate,
    consultationCategoryApiDelete,
} from '@/api/consultation/consultationService'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hexToRgba = (hex, alpha = 1) => {
    const h = (hex ?? '#6366f1').replace('#', '').slice(0, 6)
    const r = parseInt(h.substring(0, 2), 16)
    const g = parseInt(h.substring(2, 4), 16)
    const b = parseInt(h.substring(4, 6), 16)
    return `rgba(${r},${g},${b},${alpha})`
}

// ─── Shared skeletons / empty ─────────────────────────────────────────────────

const SkeletonRow = () => (
    <div className='flex items-center gap-4 px-4 py-3.5 animate-pulse'>
        <div className='w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0' />
        <div className='flex-1 space-y-1.5'>
            <div className='h-3.5 w-36 bg-gray-200 dark:bg-gray-700 rounded-full' />
            <div className='h-2.5 w-52 bg-gray-100 dark:bg-gray-800 rounded-full' />
        </div>
        <div className='h-5 w-14 bg-gray-100 dark:bg-gray-800 rounded-full' />
    </div>
)

// ─── Types tab ────────────────────────────────────────────────────────────────

const TypeRow = ({ type, cats, onEdit, onDelete }) => {
    const catName = cats.find((c) => c.id === type.categoryId)?.name
    return (
    <div
        onClick={() => onEdit(type)}
        className='group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-150 border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50 cursor-pointer'
    >
        <div
            className='w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center'
            style={{ backgroundColor: (type.color ?? '#6366f1') + '20' }}
        >
            <div
                className='w-4 h-4 rounded-full'
                style={{ backgroundColor: type.color ?? '#6366f1' }}
            />
        </div>
        <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-gray-800 dark:text-gray-100 truncate'>{type.name ?? type.title}</p>
            {catName && (
                <p className='text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1'>
                    <HiOutlineTag className='w-3 h-3 flex-shrink-0' />{catName}
                </p>
            )}
        </div>
        <span className='hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'>
            <HiOutlineCheckCircle className='w-3 h-3' />
            Ativo
        </span>
        <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0'>
            <button
                onClick={(e) => { e.stopPropagation(); onEdit(type) }}
                className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition'
                title='Editar'
            >
                <HiOutlinePencil className='w-4 h-4' />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(type) }}
                className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition'
                title='Excluir'
            >
                <HiOutlineTrash className='w-4 h-4' />
            </button>
        </div>
    </div>
    )
}

const TypesEmptyState = ({ onNew }) => (
    <div className='flex flex-col items-center justify-center py-16 gap-4 text-center'>
        <div className='w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center'>
            <HiOutlineClipboardList className='w-8 h-8 text-indigo-400' />
        </div>
        <div>
            <p className='font-semibold text-gray-700 dark:text-gray-300 text-sm'>Nenhum tipo cadastrado</p>
            <p className='text-xs text-gray-400 mt-1'>Crie o primeiro tipo de atendimento da clínica</p>
        </div>
        <button
            onClick={onNew}
            className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm shadow-violet-200'
        >
            <HiOutlinePlus className='w-4 h-4' /> Novo Tipo
        </button>
    </div>
)

// ─── Categories tab ───────────────────────────────────────────────────────────

const CategoryRow = ({ cat, onEdit, onDelete }) => (
    <div
        onClick={() => onEdit(cat)}
        className='group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-150 border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50 cursor-pointer'
    >
        <div className='w-10 h-10 rounded-xl flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center'>
            <HiOutlineTag className='w-5 h-5 text-amber-500' />
        </div>
        <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-gray-800 dark:text-gray-100 truncate'>{cat.name}</p>
        </div>
        <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0'>
            <button
                onClick={(e) => { e.stopPropagation(); onEdit(cat) }}
                className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition'
                title='Editar'
            >
                <HiOutlinePencil className='w-4 h-4' />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(cat) }}
                className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition'
                title='Excluir'
            >
                <HiOutlineTrash className='w-4 h-4' />
            </button>
        </div>
    </div>
)

const CategoriesEmptyState = ({ onNew }) => (
    <div className='flex flex-col items-center justify-center py-16 gap-4 text-center'>
        <div className='w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center'>
            <HiOutlineTag className='w-8 h-8 text-amber-400' />
        </div>
        <div>
            <p className='font-semibold text-gray-700 dark:text-gray-300 text-sm'>Nenhuma categoria cadastrada</p>
            <p className='text-xs text-gray-400 mt-1'>Organize os tipos de atendimento em categorias</p>
        </div>
        <button
            onClick={onNew}
            className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm shadow-amber-200'
        >
            <HiOutlinePlus className='w-4 h-4' /> Nova Categoria
        </button>
    </div>
)

// ─── Category upsert dialog ───────────────────────────────────────────────────

const CategoryUpsert = ({ data, onClose, onSaved }) => {
    const isEdit = !!data
    const [name, setName]     = useState(data?.name ?? '')
    const [error, setError]   = useState('')
    const [saving, setSaving] = useState(false)
    const inputRef = useRef(null)

    useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50) }, [])

    const handleSubmit = async () => {
        if (!name.trim()) { setError('O nome é obrigatório'); return }
        setSaving(true)
        try {
            if (isEdit) {
                await consultationCategoryApiUpdate(data.id, { name: name.trim() })
            } else {
                await consultationCategoryApiCreate({ name: name.trim() })
            }
            toast.push(
                <Notification type='success' title={isEdit ? 'Categoria atualizada' : 'Categoria criada'} />,
                { placement: 'top-center' }
            )
            onSaved?.()
        } catch {
            toast.push(
                <Notification type='danger' title='Erro ao salvar categoria' />,
                { placement: 'top-center' }
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className='p-1'>
            <div className='flex items-center gap-3 mb-6'>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                    {isEdit
                        ? <HiOutlinePencil className='w-5 h-5 text-amber-600' />
                        : <HiOutlinePlus className='w-5 h-5 text-violet-600' />
                    }
                </div>
                <div>
                    <h4 className='font-bold text-gray-800 dark:text-gray-100'>
                        {isEdit ? 'Editar Categoria' : 'Nova Categoria'}
                    </h4>
                    <p className='text-xs text-gray-400 mt-0.5'>
                        {isEdit ? `Editando: ${data.name}` : 'Preencha o nome da categoria'}
                    </p>
                </div>
            </div>

            <div className='mb-6'>
                <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                    Nome <span className='text-rose-500'>*</span>
                </label>
                <input
                    ref={inputRef}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder='Ex: Cirúrgico, Clínico, Preventivo…'
                    className={[
                        'w-full px-3 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-900',
                        'text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all',
                        error
                            ? 'border-rose-400 focus:ring-rose-400/30'
                            : 'border-gray-200 dark:border-gray-700 focus:ring-violet-400/30 focus:border-violet-400',
                    ].join(' ')}
                />
                {error && <p className='text-xs text-rose-500 mt-1'>{error}</p>}
            </div>

            <div className='flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800'>
                <button
                    onClick={onClose}
                    disabled={saving}
                    className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition'
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50 transition shadow-sm ${
                        isEdit ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-violet-600 hover:bg-violet-700 shadow-violet-200'
                    }`}
                >
                    {saving ? (
                        <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' /> Salvando…</>
                    ) : (
                        <><HiOutlineCheck className='w-4 h-4' /> {isEdit ? 'Salvar' : 'Criar'}</>
                    )}
                </button>
            </div>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const ConsultationTypeList = () => {
    const { TabNav, TabList, TabContent } = Tabs

    // types
    const [types, setTypes]               = useState([])
    const [typesLoading, setTypesLoading] = useState(true)
    const [upsertOpen, setUpsertOpen]     = useState(false)
    const [selected, setSelected]         = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting]         = useState(false)

    // categories
    const [cats, setCats]                   = useState([])
    const [catsLoading, setCatsLoading]     = useState(true)
    const [catUpsertOpen, setCatUpsertOpen] = useState(false)
    const [selectedCat, setSelectedCat]     = useState(null)
    const [deleteCat, setDeleteCat]         = useState(null)
    const [deletingCat, setDeletingCat]     = useState(false)

    // active tab (to control which "Novo" button shows)
    const [activeTab, setActiveTab] = useState('types')

    const loadTypes = () => {
        setTypesLoading(true)
        consultationTypeApiGetTypes()
            .then((data) => setTypes(Array.isArray(data) ? data : []))
            .catch(() => toast.push(<Notification type='danger' title='Erro ao carregar tipos' />, { placement: 'top-center' }))
            .finally(() => setTypesLoading(false))
    }

    const loadCats = () => {
        setCatsLoading(true)
        consultationCategoryApiGetAll()
            .then((data) => setCats(Array.isArray(data) ? data : []))
            .catch(() => toast.push(<Notification type='danger' title='Erro ao carregar categorias' />, { placement: 'top-center' }))
            .finally(() => setCatsLoading(false))
    }

    useEffect(() => { loadTypes(); loadCats() }, [])

    // type handlers
    const openNew    = () => { setSelected(null); setUpsertOpen(true) }
    const openEdit   = (t) => { setSelected(t); setUpsertOpen(true) }
    const openDelete = (t) => setDeleteTarget(t)

    const handleSaved   = () => { setUpsertOpen(false); loadTypes() }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await consultationTypeApiDelete(deleteTarget.id ?? deleteTarget.publicId)
            toast.push(<Notification type='success' title='Tipo excluído' />, { placement: 'top-center' })
            setDeleteTarget(null)
            loadTypes()
        } catch {
            toast.push(<Notification type='danger' title='Erro ao excluir' />, { placement: 'top-center' })
        } finally {
            setDeleting(false)
        }
    }

    // category handlers
    const openNewCat    = () => { setSelectedCat(null); setCatUpsertOpen(true) }
    const openEditCat   = (c) => { setSelectedCat(c); setCatUpsertOpen(true) }
    const openDeleteCat = (c) => setDeleteCat(c)

    const handleCatSaved = () => { setCatUpsertOpen(false); loadCats() }

    const handleDeleteCat = async () => {
        if (!deleteCat) return
        setDeletingCat(true)
        try {
            await consultationCategoryApiDelete(deleteCat.id)
            toast.push(<Notification type='success' title='Categoria excluída' />, { placement: 'top-center' })
            setDeleteCat(null)
            loadCats()
        } catch {
            toast.push(<Notification type='danger' title='Erro ao excluir categoria' />, { placement: 'top-center' })
        } finally {
            setDeletingCat(false)
        }
    }

    return (
        <div className='space-y-6'>

            {/* ── Header ── */}
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-lg font-bold text-gray-900 dark:text-gray-100'>Tipos de Atendimento</h3>
                    <p className='text-xs text-gray-400 mt-0.5'>Gerencie os tipos e categorias utilizados nos agendamentos</p>
                </div>
                {activeTab === 'types' ? (
                    <button
                        onClick={openNew}
                        className='flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm shadow-violet-200 whitespace-nowrap'
                    >
                        <HiOutlinePlus className='w-4 h-4' /> Novo Tipo
                    </button>
                ) : (
                    <button
                        onClick={openNewCat}
                        className='flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm shadow-violet-200 whitespace-nowrap'
                    >
                        <HiOutlinePlus className='w-4 h-4' /> Nova Categoria
                    </button>
                )}
            </div>

            {/* ── Tabs ── */}
            <Tabs defaultValue='types' onChange={setActiveTab}>
                <TabList>
                    <TabNav value='types'>
                        <span className='flex items-center gap-1.5'>
                            <HiOutlineClipboardList className='w-4 h-4' />
                            Tipos
                            {!typesLoading && types.length > 0 && (
                                <span className='ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'>
                                    {types.length}
                                </span>
                            )}
                        </span>
                    </TabNav>
                    <TabNav value='categories'>
                        <span className='flex items-center gap-1.5'>
                            <HiOutlineTag className='w-4 h-4' />
                            Categorias
                            {!catsLoading && cats.length > 0 && (
                                <span className='ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'>
                                    {cats.length}
                                </span>
                            )}
                        </span>
                    </TabNav>
                </TabList>

                <div className='mt-4'>
                    {/* Types */}
                    <TabContent value='types'>
                        <Card className='border border-gray-100 dark:border-gray-700/50 overflow-hidden'>
                            {typesLoading ? (
                                <div className='p-2 space-y-0.5'>
                                    {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
                                </div>
                            ) : types.length === 0 ? (
                                <TypesEmptyState onNew={openNew} />
                            ) : (
                                <div className='p-2 space-y-0.5'>
                                    {types.map((t) => (
                                        <TypeRow
                                            key={t.id ?? t.publicId}
                                            type={t}
                                            cats={cats}
                                            onEdit={openEdit}
                                            onDelete={openDelete}
                                        />
                                    ))}
                                </div>
                            )}
                        </Card>
                    </TabContent>

                    {/* Categories */}
                    <TabContent value='categories'>
                        <Card className='border border-gray-100 dark:border-gray-700/50 overflow-hidden'>
                            {catsLoading ? (
                                <div className='p-2 space-y-0.5'>
                                    {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
                                </div>
                            ) : cats.length === 0 ? (
                                <CategoriesEmptyState onNew={openNewCat} />
                            ) : (
                                <div className='p-2 space-y-0.5'>
                                    {cats.map((c) => (
                                        <CategoryRow
                                            key={c.id}
                                            cat={c}
                                            onEdit={openEditCat}
                                            onDelete={openDeleteCat}
                                        />
                                    ))}
                                </div>
                            )}
                        </Card>
                    </TabContent>
                </div>
            </Tabs>

            {/* ── Type upsert dialog ── */}
            <Dialog
                isOpen={upsertOpen}
                onRequestClose={() => setUpsertOpen(false)}
                onClose={() => setUpsertOpen(false)}
                width={460}
            >
                <ConsultationTypeUpsert
                    data={selected}
                    onClose={() => setUpsertOpen(false)}
                    onSaved={handleSaved}
                />
            </Dialog>

            {/* ── Category upsert dialog ── */}
            <Dialog
                isOpen={catUpsertOpen}
                onRequestClose={() => setCatUpsertOpen(false)}
                onClose={() => setCatUpsertOpen(false)}
                width={400}
            >
                <CategoryUpsert
                    data={selectedCat}
                    onClose={() => setCatUpsertOpen(false)}
                    onSaved={handleCatSaved}
                />
            </Dialog>

            {/* ── Confirm delete type ── */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onRequestClose={() => setDeleteTarget(null)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                type='danger'
                confirmText={deleting ? 'Excluindo…' : 'Excluir'}
                cancelText='Cancelar'
            >
                <p className='font-semibold text-gray-800 dark:text-gray-100 text-center'>
                    Excluir <span className='text-rose-600'>"{deleteTarget?.name ?? deleteTarget?.title}"</span>?
                </p>
                <p className='text-sm text-gray-400 text-center mt-1'>Esta ação não pode ser desfeita.</p>
            </ConfirmDialog>

            {/* ── Confirm delete category ── */}
            <ConfirmDialog
                isOpen={!!deleteCat}
                onRequestClose={() => setDeleteCat(null)}
                onClose={() => setDeleteCat(null)}
                onConfirm={handleDeleteCat}
                type='danger'
                confirmText={deletingCat ? 'Excluindo…' : 'Excluir'}
                cancelText='Cancelar'
            >
                <p className='font-semibold text-gray-800 dark:text-gray-100 text-center'>
                    Excluir categoria <span className='text-rose-600'>"{deleteCat?.name}"</span>?
                </p>
                <p className='text-sm text-gray-400 text-center mt-1'>Os tipos vinculados a ela não serão excluídos.</p>
            </ConfirmDialog>
        </div>
    )
}

export default ConsultationTypeList
