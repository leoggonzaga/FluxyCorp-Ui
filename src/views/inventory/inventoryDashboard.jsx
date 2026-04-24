import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    HiOutlinePlus, HiOutlineSearch, HiOutlineCube, HiOutlineExclamation,
    HiOutlineCurrencyDollar, HiOutlineTag, HiOutlineAdjustments,
    HiOutlineTruck, HiOutlineChevronLeft, HiOutlineChevronRight,
    HiOutlineClipboardList,
} from 'react-icons/hi'
import { Button, Card, Dialog, Input, Notification, Select, toast } from '@/components/ui'
import { ConfirmDialog, Loading } from '@/components/shared'
import {
    getProductsPaged, getCategories, getSuppliers, deleteProduct,
    getStockRequestsPaged,
} from '@/api/inventory/inventoryService'
import StockStatusBadge from './components/StockStatusBadge'
import StockMovementDialog from './components/StockMovementDialog'
import StockRequestDialog from './components/StockRequestDialog'
import ProductUpsert from './components/ProductUpsert'

const KpiCard = ({ icon, label, value, color, sub }) => {
    const len = String(value).length
    const valCls = len > 14 ? 'text-base' : len > 10 ? 'text-lg' : len > 6 ? 'text-xl' : 'text-2xl'
    return (
        <Card className={`border-l-4 ${color} bg-white/80 backdrop-blur-sm`}>
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500 font-medium truncate">{label}</p>
                    <p className={`${valCls} font-bold text-gray-800 mt-1 leading-tight break-words`}>{value}</p>
                    <p className={`text-xs mt-1 ${sub ? 'text-gray-400' : 'invisible'}`}>{sub ?? '·'}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 shrink-0">{icon}</div>
            </div>
        </Card>
    )
}

const InventoryDashboard = () => {
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [suppliers, setSuppliers] = useState([])
    const [loading, setLoading] = useState(true)
    const [paging, setPaging] = useState({ pageNumber: 1, pageSize: 15, total: 0 })
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [filterCategory, setFilterCategory] = useState(null)
    const [filterLowStock, setFilterLowStock] = useState(false)
    const [filterPendingPickup, setFilterPendingPickup] = useState(false)
    const [pendingCount, setPendingCount] = useState(0)
    const [isUpsertOpen, setIsUpsertOpen] = useState(false)
    const [editProduct, setEditProduct] = useState(null)
    const [movProduct, setMovProduct] = useState(null)
    const [reqProduct, setReqProduct] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const load = async () => {
        setLoading(true)
        const result = await getProductsPaged({
            pageNumber: paging.pageNumber,
            pageSize: paging.pageSize,
            searchTerm: search || undefined,
            categoryPublicId: filterCategory?.value || undefined,
            lowStockOnly: filterLowStock || undefined,
            pendingPickupOnly: filterPendingPickup || undefined,
        })
        if (result?.items) {
            setProducts(result.items)
            setPaging(prev => ({ ...prev, total: result.totalItemCount }))
        }
        setLoading(false)
    }

    const loadMeta = async () => {
        const [cats, sups, requests] = await Promise.all([
            getCategories(),
            getSuppliers(),
            getStockRequestsPaged({ status: 'AguardandoRetirada', pageSize: 1 }),
        ])
        setCategories(Array.isArray(cats) ? cats : [])
        setSuppliers(Array.isArray(sups) ? sups : [])
        setPendingCount(requests?.totalItemCount ?? 0)
    }

    const refreshPendingCount = async () => {
        const result = await getStockRequestsPaged({ status: 'AguardandoRetirada', pageSize: 1 })
        setPendingCount(result?.totalItemCount ?? 0)
    }

    useEffect(() => { loadMeta() }, [])
    useEffect(() => { load() }, [paging.pageNumber, paging.pageSize, search, filterCategory, filterLowStock, filterPendingPickup])

    const handleSearchInput = (value) => {
        setSearchInput(value)
        if (value.length === 0 || value.length >= 3) {
            setSearch(value)
            setPaging(prev => ({ ...prev, pageNumber: 1 }))
        }
    }

    const handleDelete = async () => {
        const result = await deleteProduct(deleteTarget.publicId)
        if (result !== null) {
            toast.push(<Notification type="success" title="Removido">Produto excluído.</Notification>)
            setDeleteTarget(null)
            load()
        }
    }

    const togglePendingPickup = () => {
        setFilterPendingPickup(v => !v)
        setPaging(p => ({ ...p, pageNumber: 1 }))
    }

    const totalValue = products.reduce((acc, p) => acc + (p.costPrice || 0) * p.currentStock, 0)
    const lowStockCount = products.filter(p => p.isLowStock).length
    const pages = Math.ceil(paging.total / paging.pageSize)

    const PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100]

    const handlePageSizeChange = (size) => {
        setPaging(p => ({ ...p, pageSize: size, pageNumber: 1 }))
    }

    const catOptions = categories.map(c => ({ value: c.publicId, label: c.name }))

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Estoque</h2>
                    <p className="text-sm text-gray-500 mt-1">Controle de produtos, movimentações e fornecedores</p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="plain" icon={<HiOutlineTag />} onClick={() => navigate('/inventory/categories')}>
                        Categorias
                    </Button>
                    <Button size="sm" variant="plain" icon={<HiOutlineTruck />} onClick={() => navigate('/inventory/suppliers')}>
                        Fornecedores
                    </Button>
                    <Button size="sm" variant="solid" icon={<HiOutlinePlus />} onClick={() => { setEditProduct(null); setIsUpsertOpen(true) }}>
                        Novo Produto
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <KpiCard
                    icon={<HiOutlineCube className="w-7 h-7 text-indigo-600" />}
                    label="Total de produtos"
                    value={paging.total}
                    color="border-indigo-500"
                />
                <KpiCard
                    icon={<HiOutlineExclamation className="w-7 h-7 text-amber-600" />}
                    label="Estoque baixo"
                    value={lowStockCount}
                    color="border-amber-500"
                    sub="nesta página"
                />
                <KpiCard
                    icon={<HiOutlineCurrencyDollar className="w-7 h-7 text-emerald-600" />}
                    label="Valor em estoque"
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                    color="border-emerald-500"
                    sub="nesta página"
                />
                <KpiCard
                    icon={<HiOutlineTag className="w-7 h-7 text-purple-600" />}
                    label="Categorias"
                    value={categories.length}
                    color="border-purple-500"
                />
                <KpiCard
                    icon={<HiOutlineClipboardList className="w-7 h-7 text-orange-600" />}
                    label="Aguardando retirada"
                    value={pendingCount}
                    color="border-orange-500"
                    sub="solicitações ativas"
                />
            </div>

            {/* Filters */}
            <Card className="bg-white/70 backdrop-blur-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-1 min-w-48">
                        <Input
                            placeholder="Buscar por nome ou SKU…"
                            prefix={<HiOutlineSearch className="text-gray-400" />}
                            value={searchInput}
                            onChange={e => handleSearchInput(e.target.value)}
                        />
                    </div>
                    <div className="w-52">
                        <Select
                            placeholder="Todas as categorias"
                            options={catOptions}
                            isClearable
                            value={filterCategory}
                            onChange={v => { setFilterCategory(v); setPaging(p => ({ ...p, pageNumber: 1 })) }}
                        />
                    </div>
                    <button
                        onClick={() => { setFilterLowStock(v => !v); setPaging(p => ({ ...p, pageNumber: 1 })) }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                            filterLowStock
                                ? 'bg-amber-50 border-amber-300 text-amber-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600'
                        }`}
                    >
                        <HiOutlineExclamation className="w-4 h-4" />
                        Só estoque baixo
                    </button>
                    <button
                        onClick={togglePendingPickup}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                            filterPendingPickup
                                ? 'bg-orange-50 border-orange-300 text-orange-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
                        }`}
                    >
                        <HiOutlineClipboardList className="w-4 h-4" />
                        Aguardando retirada
                        {pendingCount > 0 && (
                            <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold leading-none ${
                                filterPendingPickup ? 'bg-orange-200 text-orange-800' : 'bg-orange-100 text-orange-600'
                            }`}>
                                {pendingCount}
                            </span>
                        )}
                    </button>
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<HiOutlineAdjustments />}
                        onClick={() => navigate('/inventory/movements')}
                    >
                        Histórico
                    </Button>
                </div>
            </Card>

            {/* Paginação topo */}
            {pages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Itens por página:</span>
                        <div className="flex gap-1">
                            {PAGE_SIZE_OPTIONS.map(size => (
                                <button
                                    key={size}
                                    onClick={() => handlePageSizeChange(size)}
                                    className={`w-8 h-7 rounded text-xs font-semibold transition-colors ${
                                        paging.pageSize === size
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                            {((paging.pageNumber - 1) * paging.pageSize) + 1}–{Math.min(paging.pageNumber * paging.pageSize, paging.total)} de {paging.total}
                        </span>
                        <div className="flex items-center gap-0.5">
                            <button
                                disabled={paging.pageNumber === 1}
                                onClick={() => setPaging(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                                className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiOutlineChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                                const offset = Math.max(0, Math.min(paging.pageNumber - 3, pages - 5))
                                const pg = i + 1 + offset
                                return (
                                    <button
                                        key={pg}
                                        onClick={() => setPaging(p => ({ ...p, pageNumber: pg }))}
                                        className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                                            pg === paging.pageNumber
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'
                                        }`}
                                    >
                                        {pg}
                                    </button>
                                )
                            })}
                            <button
                                disabled={paging.pageNumber === pages}
                                onClick={() => setPaging(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                                className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiOutlineChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product List */}
            <Loading loading={loading}>
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <HiOutlineCube className="w-16 h-16 mb-3 opacity-30" />
                        <p className="text-sm font-medium">Nenhum produto encontrado</p>
                        <p className="text-xs mt-1">Cadastre o primeiro produto do estoque</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {products.map(p => (
                            <Card
                                key={p.publicId}
                                className="border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all duration-150"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div
                                            className="w-2 h-10 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: p.categoryColor || '#e5e7eb' }}
                                        />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-gray-800 truncate">{p.name}</span>
                                                <StockStatusBadge current={p.currentStock} min={p.minStock} />
                                                {p.pendingRequestCount > 0 && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                                                        <HiOutlineClipboardList className="w-3 h-3" />
                                                        {p.pendingRequestCount} aguardando
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
                                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{p.sku}</span>
                                                <span>{p.categoryName}</span>
                                                {p.supplierName && <span>· {p.supplierName}</span>}
                                                {p.location && <span>· {p.location}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className={`text-2xl font-bold ${p.currentStock === 0 ? 'text-red-600' : p.isLowStock ? 'text-amber-600' : 'text-gray-800'}`}>
                                                {p.currentStock}
                                            </p>
                                            <p className="text-xs text-gray-400">{p.unit}</p>
                                        </div>
                                        <div className="text-center hidden md:block">
                                            <p className="text-xs text-gray-400">Mín / Máx</p>
                                            <p className="text-sm font-medium text-gray-600">{p.minStock} / {p.maxStock ?? '—'}</p>
                                        </div>
                                        {p.costPrice && (
                                            <div className="text-center hidden lg:block">
                                                <p className="text-xs text-gray-400">Custo unit.</p>
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.costPrice)}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => setReqProduct(p)}
                                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                            >
                                                Solicitar
                                            </button>
                                            <button
                                                onClick={() => setMovProduct(p)}
                                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                            >
                                                Movimentar
                                            </button>
                                            <button
                                                onClick={() => { setEditProduct(p); setIsUpsertOpen(true) }}
                                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(p)}
                                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Loading>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                        {((paging.pageNumber - 1) * paging.pageSize) + 1}–{Math.min(paging.pageNumber * paging.pageSize, paging.total)} de {paging.total} produtos
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={paging.pageNumber === 1}
                            onClick={() => setPaging(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiOutlineChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                            const offset = Math.max(0, Math.min(paging.pageNumber - 3, pages - 5))
                            const pg = i + 1 + offset
                            return (
                                <button
                                    key={pg}
                                    onClick={() => setPaging(p => ({ ...p, pageNumber: pg }))}
                                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                                        pg === paging.pageNumber
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                                    }`}
                                >
                                    {pg}
                                </button>
                            )
                        })}
                        <button
                            disabled={paging.pageNumber === pages}
                            onClick={() => setPaging(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiOutlineChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Upsert Dialog */}
            <Dialog isOpen={isUpsertOpen} onClose={() => setIsUpsertOpen(false)} onRequestClose={() => setIsUpsertOpen(false)} width={680}>
                <ProductUpsert
                    data={editProduct}
                    categories={categories}
                    suppliers={suppliers}
                    onClose={() => setIsUpsertOpen(false)}
                    onSuccess={load}
                />
            </Dialog>

            {/* Movement Dialog */}
            <StockMovementDialog
                isOpen={!!movProduct}
                product={movProduct}
                onClose={() => setMovProduct(null)}
                onSuccess={() => { load(); refreshPendingCount() }}
            />

            {/* Request Dialog */}
            <StockRequestDialog
                isOpen={!!reqProduct}
                product={reqProduct}
                onClose={() => setReqProduct(null)}
                onSuccess={refreshPendingCount}
            />

            {/* Delete Confirm */}
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
                Excluir <strong>{deleteTarget?.name}</strong>? Esta ação não pode ser desfeita.
            </ConfirmDialog>
        </div>
    )
}

export default InventoryDashboard
