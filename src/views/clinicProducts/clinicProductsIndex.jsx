import { useMemo, useState } from 'react'
import { Button, Dialog, Input, Notification, Pagination, Select, toast } from '@/components/ui'
import { ConfirmDialog } from '@/components/shared'
import { HiOutlinePlus, HiOutlineSearch, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import ClinicProductsTableList from './clinicProductsTableList'

const PRODUCT_CATEGORIES = [
    { value: 'Descartáveis',         label: 'Descartáveis' },
    { value: 'Anestésicos',          label: 'Anestésicos' },
    { value: 'Materiais Cirúrgicos', label: 'Materiais Cirúrgicos' },
    { value: 'Equipamentos',         label: 'Equipamentos' },
    { value: 'Medicamentos',         label: 'Medicamentos' },
    { value: 'Kits',                 label: 'Kits' },
    { value: 'Suprimentos',          label: 'Suprimentos' },
]

const EMPTY_FORM = { name: '', sku: '', category: '', stock: '', unit: '', description: '' }

const CATALOG = [
    { prefix: 'LUV', name: 'Luvas Cirúrgicas',         category: 'Descartáveis',         unit: 'par',     desc: 'Luvas esterilizadas para procedimentos cirúrgicos.' },
    { prefix: 'ANE', name: 'Anestesia Local',           category: 'Anestésicos',          unit: 'frasco',  desc: 'Anestésico local para procedimentos odontológicos.' },
    { prefix: 'OXI', name: 'Máscara de Oxigênio',       category: 'Equipamentos',         unit: 'unidade', desc: 'Máscara descartável de oxigênio para uso em pacientes.' },
    { prefix: 'SER', name: 'Seringa Descartável',       category: 'Descartáveis',         unit: 'unidade', desc: 'Seringa 5ml descartável estéril.' },
    { prefix: 'GAZ', name: 'Gaze Estéril',              category: 'Descartáveis',         unit: 'pacote',  desc: 'Gaze estéril 7,5x7,5cm para curativos.' },
    { prefix: 'ALG', name: 'Algodão Hidrófilo',         category: 'Descartáveis',         unit: 'rolo',    desc: 'Algodão hidrófilo para higienização e procedimentos.' },
    { prefix: 'ESP', name: 'Espátula de Madeira',       category: 'Descartáveis',         unit: 'caixa',   desc: 'Espátulas descartáveis de madeira.' },
    { prefix: 'AGU', name: 'Agulha Gengival',           category: 'Anestésicos',          unit: 'caixa',   desc: 'Agulhas gengivais curtas para anestesia infiltrativa.' },
    { prefix: 'LID', name: 'Lidocaína 2%',              category: 'Anestésicos',          unit: 'carpule', desc: 'Carpule de lidocaína 2% com epinefrina.' },
    { prefix: 'MEB', name: 'Mebocaína Tópica',          category: 'Anestésicos',          unit: 'bisnaga', desc: 'Anestésico tópico em gel para mucosa.' },
    { prefix: 'CUR', name: 'Curativo Adesivo',          category: 'Materiais Cirúrgicos', unit: 'caixa',   desc: 'Curativo adesivo estéril para feridas superficiais.' },
    { prefix: 'FIO', name: 'Fio de Sutura 3-0',         category: 'Materiais Cirúrgicos', unit: 'envelope',desc: 'Fio de sutura absorvível 3-0 com agulha.' },
    { prefix: 'BIS', name: 'Bisturi Descartável',       category: 'Materiais Cirúrgicos', unit: 'unidade', desc: 'Bisturi descartável com lâmina nº 15.' },
    { prefix: 'PIN', name: 'Pinça Hemostática',         category: 'Materiais Cirúrgicos', unit: 'unidade', desc: 'Pinça hemostática reta de aço inox.' },
    { prefix: 'DRE', name: 'Dreno de Penrose',          category: 'Materiais Cirúrgicos', unit: 'metro',   desc: 'Dreno de látex para drenagem de feridas.' },
    { prefix: 'EST', name: 'Estetoscópio',              category: 'Equipamentos',         unit: 'unidade', desc: 'Estetoscópio duplo para ausculta clínica.' },
    { prefix: 'EFI', name: 'Esfigmomanômetro',          category: 'Equipamentos',         unit: 'unidade', desc: 'Aparelho de pressão aneróide adulto.' },
    { prefix: 'OTI', name: 'Otoscópio',                 category: 'Equipamentos',         unit: 'unidade', desc: 'Otoscópio com fibra óptica para exame auricular.' },
    { prefix: 'TER', name: 'Termômetro Digital',        category: 'Equipamentos',         unit: 'unidade', desc: 'Termômetro axilar digital de leitura rápida.' },
    { prefix: 'PUL', name: 'Oxímetro de Pulso',         category: 'Equipamentos',         unit: 'unidade', desc: 'Oxímetro de pulso portátil com display LED.' },
    { prefix: 'AMP', name: 'Ampicilina 500mg',          category: 'Medicamentos',         unit: 'frasco',  desc: 'Ampicilina sódica 500mg para injeção IM/IV.' },
    { prefix: 'IBM', name: 'Ibuprofeno 600mg',          category: 'Medicamentos',         unit: 'caixa',   desc: 'Ibuprofeno comprimido revestido 600mg.' },
    { prefix: 'DIP', name: 'Dipirona 500mg',            category: 'Medicamentos',         unit: 'caixa',   desc: 'Dipirona monoidratada 500mg comprimido.' },
    { prefix: 'OME', name: 'Omeprazol 20mg',            category: 'Medicamentos',         unit: 'caixa',   desc: 'Omeprazol 20mg cápsula gastrorresistente.' },
    { prefix: 'AMO', name: 'Amoxicilina 500mg',         category: 'Medicamentos',         unit: 'caixa',   desc: 'Amoxicilina 500mg cápsula antibiótico.' },
    { prefix: 'KIT', name: 'Kit Emergência Básico',     category: 'Kits',                 unit: 'kit',     desc: 'Kit com adrenalina, seringa, luvas e torniquete.' },
    { prefix: 'KSU', name: 'Kit Sutura Completo',       category: 'Kits',                 unit: 'kit',     desc: 'Kit descartável para sutura com pinça, fio e bisturi.' },
    { prefix: 'KCU', name: 'Kit Curativo Avançado',     category: 'Kits',                 unit: 'kit',     desc: 'Kit para curativos complexos com gaze, soro e dreno.' },
    { prefix: 'SOA', name: 'Soro Fisiológico 0,9%',     category: 'Suprimentos',          unit: 'bolsa',   desc: 'Solução salina 0,9% 500ml para irrigação e EV.' },
    { prefix: 'GEL', name: 'Gel Condutor Ultrassom',    category: 'Suprimentos',          unit: 'frasco',  desc: 'Gel condutor para exames de ultrassonografia.' },
]

const INITIAL_PRODUCTS = Array.from({ length: 100 }, (_, i) => {
    const base  = CATALOG[i % CATALOG.length]
    const seq   = String(Math.floor(i / CATALOG.length) + 1).padStart(2, '0')
    const stock = Math.floor(Math.random() * 400)
    return {
        id:          i + 1,
        name:        i < CATALOG.length ? base.name : `${base.name} (Lote ${seq})`,
        sku:         `${base.prefix}-${String(i + 1).padStart(3, '0')}`,
        category:    base.category,
        stock,
        unit:        base.unit,
        description: base.desc,
    }
})

const PAGE_SIZE = 10

const TopPagination = ({ page, pageSize, total, onChange }) => {
    const from  = total === 0 ? 0 : (page - 1) * pageSize + 1
    const to    = Math.min(page * pageSize, total)
    const pages = Math.ceil(total / pageSize)

    return (
        <div className='flex items-center justify-between'>
            <p className='text-sm text-gray-400 dark:text-gray-500'>
                Exibindo{' '}
                <span className='font-semibold text-gray-600 dark:text-gray-300'>{from}–{to}</span>
                {' '}de{' '}
                <span className='font-semibold text-indigo-500'>{total}</span>
                {' '}produtos
            </p>

            <div className='flex items-center gap-1'>
                <button
                    disabled={page === 1}
                    onClick={() => onChange(page - 1)}
                    className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150'
                >
                    <HiChevronLeft size={14} />
                    Anterior
                </button>

                <div className='flex items-center gap-1 px-2'>
                    {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                        const offset = Math.max(0, Math.min(page - 3, pages - 5))
                        const p = i + 1 + offset
                        return (
                            <button
                                key={p}
                                onClick={() => onChange(p)}
                                className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors duration-150 ${
                                    p === page
                                        ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600'
                                }`}
                            >
                                {p}
                            </button>
                        )
                    })}
                </div>

                <button
                    disabled={page === pages}
                    onClick={() => onChange(page + 1)}
                    className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150'
                >
                    Próxima
                    <HiChevronRight size={14} />
                </button>
            </div>
        </div>
    )
}

const ClinicProductsIndex = () => {
    const [products, setProducts]               = useState(INITIAL_PRODUCTS)
    const [search, setSearch]                   = useState('')
    const [page, setPage]                       = useState(1)
    const [isUpsertOpen, setIsUpsertOpen]       = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [formData, setFormData]               = useState(EMPTY_FORM)
    const [productToDelete, setProductToDelete] = useState(null)

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return products
        return products.filter((p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        )
    }, [search, products])

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const openNew = () => {
        setSelectedProduct(null)
        setFormData(EMPTY_FORM)
        setIsUpsertOpen(true)
    }

    const openEdit = (item) => {
        const raw = item._raw
        setSelectedProduct(raw)
        setFormData({
            name:        raw.name,
            sku:         raw.sku,
            category:    raw.category,
            stock:       String(raw.stock),
            unit:        raw.unit,
            description: raw.description,
        })
        setIsUpsertOpen(true)
    }

    const closeDialog = () => {
        setSelectedProduct(null)
        setIsUpsertOpen(false)
    }

    const handleSave = () => {
        const { name, sku, category, stock, unit } = formData
        if (!name || !sku || !category || !stock || !unit) {
            toast.push(
                <Notification type='danger' title='Campos obrigatórios'>
                    Preencha nome, SKU, categoria, estoque e unidade.
                </Notification>
            )
            return
        }
        const saved = {
            id:          selectedProduct ? selectedProduct.id : Date.now(),
            name:        formData.name,
            sku:         formData.sku,
            category:    formData.category,
            stock:       Number(formData.stock),
            unit:        formData.unit,
            description: formData.description,
        }
        setProducts((curr) =>
            selectedProduct
                ? curr.map((p) => (p.id === selectedProduct.id ? saved : p))
                : [saved, ...curr]
        )
        toast.push(
            <Notification type='success' title='Produto salvo'>
                {selectedProduct ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.'}
            </Notification>
        )
        closeDialog()
    }

    const handleDelete = () => {
        setProducts((curr) => curr.filter((p) => p.id !== productToDelete.id))
        toast.push(
            <Notification type='success' title='Produto removido'>
                O produto foi excluído com sucesso.
            </Notification>
        )
        setProductToDelete(null)
    }

    const bind = (key) => ({
        value:    formData[key],
        onChange: (e) => setFormData((prev) => ({ ...prev, [key]: e.target.value })),
    })

    return (
        <div className='space-y-5'>
            {/* Header */}
            <div className='flex items-center justify-between gap-4'>
                <div>
                    <h3 className='text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight'>
                        Produtos da Clínica
                    </h3>
                    <p className='text-sm text-gray-400 dark:text-gray-500 mt-0.5'>
                        <span className='font-semibold text-indigo-500'>{products.length}</span>
                        {' '}produtos cadastrados
                    </p>
                </div>
                <Button icon={<HiOutlinePlus />} variant='solid' size='sm' onClick={openNew}>
                    Novo Produto
                </Button>
            </div>

            {/* Busca */}
            <Input
                placeholder='Buscar por nome, SKU ou categoria…'
                size='sm'
                prefix={<HiOutlineSearch className='text-gray-400' />}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />

            {/* Paginação superior */}
            {filtered.length > PAGE_SIZE && (
                <TopPagination
                    page={page}
                    pageSize={PAGE_SIZE}
                    total={filtered.length}
                    onChange={setPage}
                />
            )}

            {/* Lista Pattern1 */}
            <ClinicProductsTableList
                data={paginated}
                onItemClick={openEdit}
                onDelete={setProductToDelete}
            />

            {/* Paginação */}
            {filtered.length > PAGE_SIZE && (
                <div className='flex justify-center pt-1'>
                    <Pagination
                        pageSize={PAGE_SIZE}
                        total={filtered.length}
                        currentPage={page}
                        onChange={setPage}
                    />
                </div>
            )}

            {/* Dialog Upsert */}
            <Dialog isOpen={isUpsertOpen} onClose={closeDialog} onRequestClose={closeDialog} width={600}>
                <div className='p-2 space-y-5'>
                    <div>
                        <h4 className='text-lg font-bold text-gray-800 dark:text-gray-100'>
                            {selectedProduct ? 'Editar produto' : 'Novo produto'}
                        </h4>
                        <p className='text-sm text-gray-400 mt-0.5'>
                            Preencha os dados do insumo utilizado nos procedimentos.
                        </p>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div className='col-span-2'>
                            <label className='block text-xs font-semibold text-gray-500 mb-1.5'>Nome</label>
                            <Input placeholder='Nome do produto' {...bind('name')} />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 mb-1.5'>SKU</label>
                            <Input placeholder='Código de identificação' {...bind('sku')} />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 mb-1.5'>Categoria</label>
                            <Select
                                options={PRODUCT_CATEGORIES}
                                value={PRODUCT_CATEGORIES.find((o) => o.value === formData.category) || null}
                                onChange={(opt) => setFormData((prev) => ({ ...prev, category: opt?.value || '' }))}
                                placeholder='Selecione'
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 mb-1.5'>Estoque</label>
                            <Input type='number' placeholder='Quantidade disponível' {...bind('stock')} />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 mb-1.5'>Unidade</label>
                            <Input placeholder='Ex: par, frasco, unidade' {...bind('unit')} />
                        </div>
                        <div className='col-span-2'>
                            <label className='block text-xs font-semibold text-gray-500 mb-1.5'>Descrição</label>
                            <Input textArea rows={3} placeholder='Descrição e uso em procedimentos' {...bind('description')} />
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700'>
                        <Button variant='plain' onClick={closeDialog}>Cancelar</Button>
                        <Button variant='solid' onClick={handleSave}>
                            {selectedProduct ? 'Salvar alterações' : 'Cadastrar'}
                        </Button>
                    </div>
                </div>
            </Dialog>

            <ConfirmDialog
                isOpen={!!productToDelete}
                onClose={() => setProductToDelete(null)}
                onRequestClose={() => setProductToDelete(null)}
                onCancel={() => setProductToDelete(null)}
                onConfirm={handleDelete}
                type='danger'
                confirmText='Excluir'
                cancelText='Cancelar'
            >
                Tem certeza que deseja excluir <strong>{productToDelete?.name}</strong>? Esta ação não poderá ser desfeita.
            </ConfirmDialog>
        </div>
    )
}

export default ClinicProductsIndex
