import { useEffect, useState } from 'react'
import {
    HiOutlineSearch, HiOutlineCube, HiOutlineClipboardCheck,
    HiOutlineClock, HiOutlineUser,
} from 'react-icons/hi'
import { Card, Input, Select } from '@/components/ui'
import { Loading } from '@/components/shared'
import { useAppSelector } from '@/store'
import { getProductsPaged, getCategories, getStockRequestsPaged } from '@/api/inventory/inventoryService'
import StockStatusBadge from './components/StockStatusBadge'
import StockRequestDialog from './components/StockRequestDialog'

const STATUS_LABEL = {
    AguardandoRetirada: { label: 'Aguardando retirada', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    Retirado: { label: 'Retirado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    Cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500 border-gray-200' },
}

const InventoryRequestView = () => {
    const { userName, employeePublicId } = useAppSelector(state => state.auth.user)

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [myRequests, setMyRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingRequests, setLoadingRequests] = useState(false)
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState(null)
    const [reqProduct, setReqProduct] = useState(null)

    const loadProducts = async () => {
        setLoading(true)
        const result = await getProductsPaged({
            pageNumber: 1,
            pageSize: 100,
            searchTerm: search || undefined,
            categoryPublicId: filterCategory?.value || undefined,
        })
        if (result?.items) setProducts(result.items)
        setLoading(false)
    }

    const loadMyRequests = async () => {
        if (!employeePublicId) return
        setLoadingRequests(true)
        const result = await getStockRequestsPaged({
            requestedByEmployeePublicId: employeePublicId,
            status: 'AguardandoRetirada',
            pageSize: 10,
        })
        setMyRequests(result?.items ?? [])
        setLoadingRequests(false)
    }

    useEffect(() => {
        getCategories().then(cats => setCategories(Array.isArray(cats) ? cats : []))
    }, [])

    useEffect(() => { loadProducts() }, [search, filterCategory])

    const handleSearchInput = (value) => {
        setSearchInput(value)
        if (value.length === 0 || value.length >= 3) setSearch(value)
    }

    const catOptions = categories.map(c => ({ value: c.publicId, label: c.name }))

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
        })
    }

    const initial = userName?.charAt(0)?.toUpperCase() || '?'

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Solicitar Item</h2>
                    <p className="text-sm text-gray-500 mt-1">Selecione o produto e registre sua solicitação</p>
                </div>
                <div className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        {initial !== '?' ? (
                            <span className="text-indigo-700 text-sm font-bold">{initial}</span>
                        ) : (
                            <HiOutlineUser className="w-4 h-4 text-indigo-600" />
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 leading-none">Solicitante</p>
                        <p className="text-sm font-semibold text-gray-700 leading-tight mt-0.5">{userName || '—'}</p>
                    </div>
                </div>
            </div>

            {/* Minhas Solicitações Pendentes */}
            {!loadingRequests && myRequests.length > 0 && (
                <Card className="bg-orange-50/60 border border-orange-100 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <HiOutlineClock className="w-4 h-4 text-orange-500" />
                        <p className="text-sm font-semibold text-orange-700">
                            Minhas solicitações pendentes ({myRequests.length})
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        {myRequests.map(req => {
                            const st = STATUS_LABEL[req.status] || STATUS_LABEL.AguardandoRetirada
                            return (
                                <div
                                    key={req.publicId}
                                    className="flex items-center justify-between bg-white rounded-xl border border-orange-100 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                                            <HiOutlineCube className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{req.productName}</p>
                                            {req.reason && (
                                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-48">{req.reason}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-orange-600">{req.quantity}</p>
                                            <p className="text-xs text-gray-400">{req.productUnit}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${st.color}`}>
                                                {st.label}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">{formatDate(req.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            )}

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
                            onChange={v => setFilterCategory(v)}
                        />
                    </div>
                </div>
            </Card>

            {/* Product List */}
            <Loading loading={loading}>
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <HiOutlineCube className="w-16 h-16 mb-3 opacity-30" />
                        <p className="text-sm font-medium">Nenhum produto encontrado</p>
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
                                            <p className={`text-2xl font-bold ${
                                                p.currentStock === 0 ? 'text-red-600'
                                                : p.isLowStock ? 'text-amber-600'
                                                : 'text-gray-800'
                                            }`}>
                                                {p.currentStock}
                                            </p>
                                            <p className="text-xs text-gray-400">{p.unit}</p>
                                        </div>
                                        <div className="text-center hidden md:block">
                                            <p className="text-xs text-gray-400">Mín / Máx</p>
                                            <p className="text-sm font-medium text-gray-600">{p.minStock} / {p.maxStock ?? '—'}</p>
                                        </div>

                                        <button
                                            onClick={() => setReqProduct(p)}
                                            disabled={p.currentStock === 0}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                p.currentStock === 0
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                            }`}
                                        >
                                            <HiOutlineClipboardCheck className="w-3.5 h-3.5" />
                                            {p.currentStock === 0 ? 'Sem estoque' : 'Solicitar'}
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Loading>

            {/* Request Dialog */}
            <StockRequestDialog
                isOpen={!!reqProduct}
                product={reqProduct}
                onClose={() => setReqProduct(null)}
                onSuccess={() => {}}
            />
        </div>
    )
}

export default InventoryRequestView
