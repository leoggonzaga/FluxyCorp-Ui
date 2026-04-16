import { useMemo, useState } from 'react'
import { Badge, Button, Card, Dialog, Input, Notification, Select, toast } from '@/components/ui'
import { HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'

const PRODUCT_CATEGORIES = [
    { value: 'Descartáveis', label: 'Descartáveis' },
    { value: 'Anestésicos', label: 'Anestésicos' },
    { value: 'Materiais Cirúrgicos', label: 'Materiais Cirúrgicos' },
    { value: 'Equipamentos', label: 'Equipamentos' },
    { value: 'Medicamentos', label: 'Medicamentos' },
    { value: 'Kits', label: 'Kits' },
    { value: 'Suprimentos', label: 'Suprimentos' },
]

const INITIAL_PRODUCTS = [
    { id: 1, name: 'Luvas Cirúrgicas', sku: 'LUV-001', category: 'Descartáveis', stock: 320, unit: 'par', description: 'Luvas esterilizadas para procedimentos cirúrgicos.' },
    { id: 2, name: 'Anestesia Local', sku: 'ANE-002', category: 'Farmácia', stock: 120, unit: 'frasco', description: 'Anestésico local para procedimentos odontológicos.' },
    { id: 3, name: 'Máscara de Oxigênio', sku: 'OXI-003', category: 'Equipamentos', stock: 45, unit: 'unidade', description: 'Máscara descartável de oxigênio para uso em pacientes.' },
]

const ClinicProductsIndex = () => {
    const [products, setProducts] = useState(INITIAL_PRODUCTS)
    const [filter, setFilter] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [formData, setFormData] = useState({ name: '', sku: '', category: '', stock: '', unit: '', description: '' })

    const filteredProducts = useMemo(() => {
        const term = filter.trim().toLowerCase()
        if (!term) return products
        return products.filter((product) =>
            product.name.toLowerCase().includes(term) ||
            product.sku.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
        )
    }, [filter, products])

    const openNewProduct = () => {
        setSelectedProduct(null)
        setFormData({ name: '', sku: '', category: '', stock: '', unit: '', description: '' })
        setIsDialogOpen(true)
    }

    const openEditProduct = (product) => {
        setSelectedProduct(product)
        setFormData({
            name: product.name,
            sku: product.sku,
            category: product.category,
            stock: String(product.stock),
            unit: product.unit,
            description: product.description,
        })
        setIsDialogOpen(true)
    }

    const closeDialog = () => {
        setSelectedProduct(null)
        setIsDialogOpen(false)
    }

    const handleSaveProduct = () => {
        const { name, sku, category, stock, unit } = formData
        if (!name || !sku || !category || !stock || !unit) {
            toast.push(
                <Notification type='danger' title='Campos obrigatórios'>
                    Preencha nome, SKU, categoria, estoque e unidade.
                </Notification>
            )
            return
        }

        const newProduct = {
            id: selectedProduct ? selectedProduct.id : Date.now(),
            name: formData.name,
            sku: formData.sku,
            category: formData.category,
            stock: Number(formData.stock),
            unit: formData.unit,
            description: formData.description,
        }

        setProducts((current) => {
            if (selectedProduct) {
                return current.map((item) => (item.id === selectedProduct.id ? newProduct : item))
            }
            return [newProduct, ...current]
        })

        toast.push(
            <Notification type='success' title='Produto salvo'>
                O produto foi cadastrado com sucesso.
            </Notification>
        )
        closeDialog()
    }

    const handleDeleteProduct = (productId) => {
        setProducts((current) => current.filter((item) => item.id !== productId))
        toast.push(
            <Notification type='success' title='Produto removido'>
                O produto foi removido da lista.
            </Notification>
        )
    }

    return (
        <div className='w-full p-4 space-y-4'>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-900'>Produtos da Clínica</h2>
                    <p className='mt-1 text-sm text-gray-500'>Cadastre materiais e insumos utilizados em procedimentos, como luvas, anestesia e kits.</p>
                </div>

                <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                    <div className='relative w-full sm:w-[260px]'>
                        <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                        <Input
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder='Buscar por nome, SKU ou categoria'
                            className='pl-10 pr-4'
                        />
                    </div>
                    <Button onClick={openNewProduct} variant='solid' icon={<HiOutlinePlus />}>
                        Novo produto
                    </Button>
                </div>
            </div>

            <Card>
                <div className='overflow-x-auto'>
                    <table className='min-w-full text-left text-sm text-gray-700'>
                        <thead>
                            <tr className='border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500'>
                                <th className='px-4 py-3'>Nome</th>
                                <th className='px-4 py-3'>SKU</th>
                                <th className='px-4 py-3'>Categoria</th>
                                <th className='px-4 py-3'>Estoque</th>
                                <th className='px-4 py-3'>Unidade</th>
                                <th className='px-4 py-3'>Descrição</th>
                                <th className='px-4 py-3 text-right'>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className='px-4 py-8 text-center text-gray-500'>Nenhum produto encontrado.</td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className='border-b border-gray-100 hover:bg-gray-50'>
                                        <td className='px-4 py-4 font-semibold text-gray-800'>{product.name}</td>
                                        <td className='px-4 py-4 text-gray-600'>{product.sku}</td>
                                        <td className='px-4 py-4 text-gray-600'>{product.category}</td>
                                        <td className='px-4 py-4'>
                                            <Badge color={product.stock > 50 ? 'green' : product.stock > 10 ? 'amber' : 'red'}>
                                                {product.stock}
                                            </Badge>
                                        </td>
                                        <td className='px-4 py-4 text-gray-600'>{product.unit}</td>
                                        <td className='px-4 py-4 text-gray-500 truncate max-w-[220px]'>{product.description}</td>
                                        <td className='px-4 py-4 text-right space-x-2'>
                                            <Button size='sm' variant='ghost' icon={<HiOutlinePencil />} onClick={() => openEditProduct(product)}>
                                                Editar
                                            </Button>
                                            <Button size='sm' variant='ghost' className='text-rose-600 hover:bg-rose-50' icon={<HiOutlineTrash />} onClick={() => handleDeleteProduct(product.id)}>
                                                Excluir
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog isOpen={isDialogOpen} onClose={closeDialog} onRequestClose={closeDialog} width={720}>
                <Card className='space-y-6 p-6'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                            <h3 className='text-xl font-semibold text-gray-900'>{selectedProduct ? 'Editar produto' : 'Novo produto'}</h3>
                            <p className='text-sm text-gray-500'>Preencha os dados do insumo utilizado em procedimentos.</p>
                        </div>
                        <Button size='sm' variant='outline' onClick={closeDialog}>
                            Fechar
                        </Button>
                    </div>

                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div>
                            <label className='block text-xs font-semibold text-gray-600 mb-2'>Nome</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder='Nome do produto'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-600 mb-2'>SKU</label>
                            <Input
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                placeholder='Código de identificação'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-600 mb-2'>Categoria</label>
                            <Select
                                options={PRODUCT_CATEGORIES}
                                value={PRODUCT_CATEGORIES.find((item) => item.value === formData.category) || null}
                                onChange={(option) => setFormData({ ...formData, category: option ? option.value : '' })}
                                placeholder='Selecione a categoria'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-600 mb-2'>Estoque</label>
                            <Input
                                type='number'
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                placeholder='Quantidade disponível'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-600 mb-2'>Unidade</label>
                            <Input
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                placeholder='Ex: par, frasco, unidade'
                            />
                        </div>
                    </div>
                    <div>
                        <label className='block text-xs font-semibold text-gray-600 mb-2'>Descrição</label>
                        <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            textArea
                            rows={4}
                            placeholder='Descrição do produto e uso em procedimentos'
                        />
                    </div>

                    <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
                        <Button variant='outline' onClick={closeDialog} className='w-full sm:w-auto'>
                            Cancelar
                        </Button>
                        <Button variant='solid' onClick={handleSaveProduct} className='w-full sm:w-auto'>
                            {selectedProduct ? 'Salvar alterações' : 'Cadastrar produto'}
                        </Button>
                    </div>
                </Card>
            </Dialog>
        </div>
    )
}

export default ClinicProductsIndex
