import { useEffect, useState } from 'react'
import { Notification, toast } from '../../../components/ui'
import TabContent from '../../../components/ui/Tabs/TabContent'
import TabList from '../../../components/ui/Tabs/TabList'
import TabNav from '../../../components/ui/Tabs/TabNav'
import { Tabs } from '../../../components/ui'
import { FormNumericInput } from '../../../components/shared'
import {
    catalogApiGetServices,
    catalogApiGetProducts,
    catalogApiGetBundle,
    catalogApiPostCatalogItem,
} from '../../../api/catalog/catalogService'
import {
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineSearch,
    HiOutlineCheckCircle,
    HiOutlineX,
} from 'react-icons/hi'

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (v) =>
    v != null
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
        : '—'

// CatalogItemDto.publicId é mapeado para o publicId do serviço/produto/bundle associado.
// Compara case-insensitive pois C# pode retornar uppercase e JS lowercase.
function findExisting(existingItems, publicId) {
    const norm = (v) => v?.toString().toLowerCase()
    return existingItems?.find(ci => norm(ci.publicId) === norm(publicId)) ?? null
}

function groupByCategory(items) {
    const map = new Map()
    for (const it of items) {
        const catId   = it.categoryId   ?? '__sem_cat'
        const catName = it.categoryName ?? it.category ?? 'Sem categoria'
        if (!map.has(catId)) map.set(catId, { id: catId, name: catName, items: [], isOpen: true })
        map.get(catId).items.push(it)
    }
    return [...map.values()]
}

// ─── Sub-componentes fora do componente pai para evitar remount no re-render ──

function EmptyPanel({ message }) {
    return (
        <div className='flex flex-col items-center justify-center h-full gap-2 text-center py-8'>
            <div className='w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl'>
                📦
            </div>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{message}</p>
        </div>
    )
}

function AvailablePanel({ tab, categories, isLoading, onToggleCategory, onCheckAll, onPatchItem }) {
    const hasAny = categories.some(c => c.items.some(it => !it.isCatalogItem))

    if (isLoading) return (
        <div className='flex-1 space-y-2 animate-pulse'>
            {[...Array(3)].map((_, i) => (
                <div key={i} className='h-10 rounded-xl bg-gray-100 dark:bg-gray-700' />
            ))}
        </div>
    )

    if (!hasAny) return <EmptyPanel message='Todos os itens já estão no catálogo' />

    return (
        <div className='flex-1 overflow-y-auto space-y-2 pr-1'>
            {categories.map(cat => {
                const available = cat.items.filter(it => !it.isCatalogItem)
                if (!available.length) return null

                const allSelected  = available.every(it => it.selected)
                const someSelected = available.some(it => it.selected)

                return (
                    <div key={cat.id} className='rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden'>
                        <div
                            className='flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50 cursor-pointer select-none'
                            onClick={() => onToggleCategory(tab, cat.id)}
                        >
                            <label className='flex items-center gap-2 cursor-pointer' onClick={e => e.stopPropagation()}>
                                <input
                                    type='checkbox'
                                    checked={allSelected}
                                    ref={el => { if (el) el.indeterminate = !allSelected && someSelected }}
                                    onChange={e => onCheckAll(tab, cat.id, e.target.checked)}
                                    className='w-3.5 h-3.5 rounded accent-amber-500'
                                />
                                <span className='text-xs font-semibold text-gray-700 dark:text-gray-200'>{cat.name}</span>
                                <span className='text-[10px] text-gray-400'>({available.length})</span>
                            </label>
                            <span className='text-gray-400'>
                                {cat.isOpen
                                    ? <HiOutlineChevronUp className='w-3.5 h-3.5' />
                                    : <HiOutlineChevronDown className='w-3.5 h-3.5' />}
                            </span>
                        </div>

                        {cat.isOpen && (
                            <div className='divide-y divide-gray-50 dark:divide-gray-700/30'>
                                {available.map(item => (
                                    <label
                                        key={item.publicId}
                                        className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                                            item.selected
                                                ? 'bg-amber-50/60 dark:bg-amber-900/10'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'
                                        }`}
                                    >
                                        <input
                                            type='checkbox'
                                            checked={item.selected ?? false}
                                            onChange={e => onPatchItem(tab, cat.id, item.publicId, { selected: e.target.checked })}
                                            className='w-3.5 h-3.5 rounded accent-amber-500 shrink-0'
                                        />
                                        <span className='flex-1 text-xs text-gray-700 dark:text-gray-200 truncate'>{item.name}</span>
                                        <span className='text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums shrink-0'>
                                            {fmt(item.basePrice)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function SelectedPanel({ tab, categories, onPatchItem }) {
    const selected = categories
        .flatMap(cat => cat.items.filter(it => it.selected).map(it => ({ ...it, categoryId: cat.id })))

    if (!selected.length) return <EmptyPanel message='Nenhum item selecionado ainda' />

    return (
        <div className='flex-1 overflow-y-auto space-y-2 pr-1'>
            {selected.map(item => (
                <div
                    key={item.publicId}
                    className={`rounded-xl border p-3 flex items-center gap-3 transition-colors ${
                        item.isCatalogItem
                            ? 'border-amber-100 dark:border-amber-800/30 bg-amber-50/40 dark:bg-amber-900/10'
                            : 'border-amber-100 dark:border-amber-800/30 bg-amber-50/30 dark:bg-amber-900/5'
                    }`}
                >
                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-1.5 flex-wrap'>
                            <p className='text-xs font-semibold text-gray-800 dark:text-gray-100 truncate'>{item.name}</p>
                            {item.isCatalogItem && (
                                <span className='text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 shrink-0'>
                                    já no catálogo
                                </span>
                            )}
                        </div>
                        <p className='text-[10px] text-gray-400 dark:text-gray-500 mt-0.5'>
                            Preço base: {fmt(item.basePrice)}
                        </p>
                    </div>
                    <div className='w-28 shrink-0'>
                        <FormNumericInput
                            size='xs'
                            value={item.price}
                            onValueChange={(vals) =>
                                onPatchItem(tab, item.categoryId, item.publicId, { price: vals.floatValue ?? 0 })
                            }
                        />
                    </div>
                    <button
                        onClick={() => onPatchItem(tab, item.categoryId, item.publicId, { selected: false, isCatalogItem: false })}
                        className='p-1 rounded-lg text-gray-300 dark:text-gray-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shrink-0'
                        title='Remover'
                    >
                        <HiOutlineX className='w-3.5 h-3.5' />
                    </button>
                </div>
            ))}
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const CatalogItemDualList = ({
    catalogId,
    existingItems = [],
    onClose,
    onConfirmDialogClose,
    updateCatalogItems,
}) => {
    const [isLoading, setIsLoading]     = useState(false)
    const [search, setSearch]           = useState('')
    const [isSaving, setIsSaving]       = useState(false)

    const [itemByCategory, setItemByCategory] = useState({ service: [], product: [], bundle: [] })

    // ── Patch helpers ──────────────────────────────────────────────────────

    const patchItem = (tab, categoryId, publicId, patch) => {
        setItemByCategory(prev => ({
            ...prev,
            [tab]: prev[tab].map(cat =>
                cat.id !== categoryId ? cat : {
                    ...cat,
                    items: cat.items.map(it =>
                        it.publicId !== publicId ? it : { ...it, ...patch }
                    ),
                }
            ),
        }))
    }

    const toggleCategory = (tab, categoryId) => {
        setItemByCategory(prev => ({
            ...prev,
            [tab]: prev[tab].map(cat =>
                cat.id === categoryId ? { ...cat, isOpen: !cat.isOpen } : cat
            ),
        }))
    }

    const checkAll = (tab, categoryId, value) => {
        setItemByCategory(prev => ({
            ...prev,
            [tab]: prev[tab].map(cat =>
                cat.id !== categoryId ? cat : {
                    ...cat,
                    items: cat.items.map(it => ({ ...it, selected: value })),
                }
            ),
        }))
    }

    // ── Load data ─────────────────────────────────────────────────────────

    const buildItems = (rawList, type) =>
        rawList.map(item => {
            const existing = findExisting(existingItems, item.publicId)
            return {
                publicId:      item.publicId,
                name:          item.name,
                basePrice:     item.price ?? 0,
                price:         existing?.price ?? item.price ?? 0,
                categoryId:    item.categoryId   ?? '__sem_cat',
                categoryName:  item.categoryName ?? item.category ?? 'Sem categoria',
                isCatalogItem: !!existing,
                selected:      !!existing,
            }
        })

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [resSvc, resProd, resBun] = await Promise.all([
                catalogApiGetServices().catch(() => null),
                catalogApiGetProducts().catch(() => null),
                catalogApiGetBundle().catch(() => null),
            ])

            setItemByCategory({
                service: groupByCategory(buildItems(resSvc?.data ?? [], 'service')),
                product: groupByCategory(buildItems(resProd?.data ?? [], 'product')),
                bundle:  groupByCategory(buildItems(resBun?.data  ?? [], 'bundle')),
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { loadData() }, [])

    // ── Search filter ──────────────────────────────────────────────────────

    const filteredCategories = (tab) => {
        const q = search.trim().toLowerCase()
        return itemByCategory[tab].map(cat => ({
            ...cat,
            items: q
                ? cat.items.filter(it => it.name.toLowerCase().includes(q))
                : cat.items,
        })).filter(cat => cat.items.length > 0)
    }

    // ── Selected items (across all tabs) ──────────────────────────────────

    const selectedAll = Object.entries(itemByCategory).flatMap(([type, cats]) =>
        cats.flatMap(cat => cat.items.filter(it => it.selected).map(it => ({ ...it, type })))
    )

    // ── Submit ────────────────────────────────────────────────────────────

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const items = selectedAll.map(it => ({
                itemPublicId: it.publicId,
                price:        it.price,
                itemType:     it.type,
            }))
            const result = await catalogApiPostCatalogItem(catalogId, { items })
            if (result?.data) {
                updateCatalogItems(result.data)
                toast.push(
                    <Notification type='success' title='Itens salvos'>
                        Itens de catálogo salvos com sucesso!
                    </Notification>
                )
                onConfirmDialogClose()
            } else {
                throw new Error()
            }
        } catch {
            toast.push(
                <Notification type='danger' title='Falha'>
                    Falha ao salvar os itens. Tente novamente.
                </Notification>
            )
        } finally {
            setIsSaving(false)
        }
    }

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <div className='flex flex-col gap-0'>

            {/* Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/50'>
                <div>
                    <h3 className='font-semibold text-gray-800 dark:text-gray-100'>Gerenciar Itens do Catálogo</h3>
                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                        Selecione os itens e defina o preço de cada um neste catálogo
                    </p>
                </div>
                {selectedAll.length > 0 && (
                    <span className='text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'>
                        {selectedAll.length} selecionado{selectedAll.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Search */}
            <div className='px-6 pt-4 pb-2'>
                <div className='relative'>
                    <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder='Buscar item por nome...'
                        className='w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400'
                    />
                </div>
            </div>

            {/* Tabs + panels */}
            <div className='px-6 pb-2'>
                <Tabs defaultValue='service'>
                    <TabList>
                        <TabNav value='service'>Serviços</TabNav>
                        <TabNav value='product'>Produtos</TabNav>
                        <TabNav value='bundle'>Kits</TabNav>
                    </TabList>

                    <div className='mt-4 grid grid-cols-2 gap-4 h-[400px]'>

                        {/* Left: disponíveis */}
                        <div className='flex flex-col gap-2 h-full overflow-hidden'>
                            <span className='text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>
                                Disponíveis
                            </span>
                            <div className='flex-1 overflow-hidden flex flex-col'>
                                <TabContent value='service'>
                                    <AvailablePanel
                                        tab='service'
                                        categories={filteredCategories('service')}
                                        isLoading={isLoading}
                                        onToggleCategory={toggleCategory}
                                        onCheckAll={checkAll}
                                        onPatchItem={patchItem}
                                    />
                                </TabContent>
                                <TabContent value='product'>
                                    <AvailablePanel
                                        tab='product'
                                        categories={filteredCategories('product')}
                                        isLoading={isLoading}
                                        onToggleCategory={toggleCategory}
                                        onCheckAll={checkAll}
                                        onPatchItem={patchItem}
                                    />
                                </TabContent>
                                <TabContent value='bundle'>
                                    <AvailablePanel
                                        tab='bundle'
                                        categories={filteredCategories('bundle')}
                                        isLoading={isLoading}
                                        onToggleCategory={toggleCategory}
                                        onCheckAll={checkAll}
                                        onPatchItem={patchItem}
                                    />
                                </TabContent>
                            </div>
                        </div>

                        {/* Right: selecionados */}
                        <div className='flex flex-col gap-2 h-full overflow-hidden border-l border-gray-100 dark:border-gray-700/50 pl-4'>
                            <span className='text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>
                                Selecionados — preço no catálogo
                            </span>
                            <div className='flex-1 overflow-hidden flex flex-col'>
                                <TabContent value='service'>
                                    <SelectedPanel
                                        tab='service'
                                        categories={itemByCategory['service']}
                                        onPatchItem={patchItem}
                                    />
                                </TabContent>
                                <TabContent value='product'>
                                    <SelectedPanel
                                        tab='product'
                                        categories={itemByCategory['product']}
                                        onPatchItem={patchItem}
                                    />
                                </TabContent>
                                <TabContent value='bundle'>
                                    <SelectedPanel
                                        tab='bundle'
                                        categories={itemByCategory['bundle']}
                                        onPatchItem={patchItem}
                                    />
                                </TabContent>
                            </div>
                        </div>
                    </div>
                </Tabs>
            </div>

            {/* Footer */}
            <div className='flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700/50 mt-2'>
                <p className='text-xs text-gray-400 dark:text-gray-500'>
                    {selectedAll.length === 0
                        ? 'Nenhum item selecionado'
                        : `${selectedAll.length} item${selectedAll.length !== 1 ? 's' : ''} pronto${selectedAll.length !== 1 ? 's' : ''} para salvar`}
                </p>
                <div className='flex gap-2'>
                    <button
                        onClick={onClose}
                        className='px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={selectedAll.length === 0 || isSaving}
                        className='flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors'
                    >
                        {isSaving
                            ? <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' />Salvando…</>
                            : <><HiOutlineCheckCircle className='w-4 h-4' />Salvar Seleção</>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CatalogItemDualList
