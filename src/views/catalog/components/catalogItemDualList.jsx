import { useEffect, useState } from "react"
import { Badge, Button, Card, Checkbox, MoneyValue, Notification, Select, Tabs, toast } from "../../../components/ui"
import TabNav from "../../../components/ui/Tabs/TabNav"
import TabList from "../../../components/ui/Tabs/TabList"
import TabContent from "../../../components/ui/Tabs/TabContent"
import { catalogApiGetProducts, catalogApiGetServices, catalogApiPostCatalogItem } from "../../../api/catalog/catalogService"
import { ConfirmDialog, FormNumericInput } from "../../../components/shared"
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi"

const CatalogItemDualList = ({ catalogId, onClose, onConfirmDialogClose }) => {
    const [currentTab, setCurrentTab] = useState('service')
    const [isLoading, setIsLoading] = useState(false)
    const [catalogItemsSubmitted, setCatalogItemsSubmitted] = useState([])

    const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

    const [itemByCategory, setItemByCategory] = useState({
        service: [],
        product: [],
        bundle: []
    })
    const [categorySelected, setCategorySelected] = useState({
        service: null,
        product: null,
        bundle: null
    })



    const patchCategories = (tab, updater) => {
        setItemByCategory(prev => ({ ...prev, [tab]: updater(prev[tab]) }))
    }

    const handleCheckItem = (value, itemId, categoryId, tab) => {
        patchCategories(tab, prev =>
            prev.map(cat =>
                cat.id === categoryId
                    ? { ...cat, items: cat.items.map(it => it.publicId === itemId ? { ...it, isCatalogItem: value } : it) }
                    : cat
            )
        )
    }

    const handleCategoryToggle = (categoryId, tab) => {
        patchCategories(tab, prev => prev.map(c => c.id === categoryId ? { ...c, isOpen: !c.isOpen } : c))
    }

    const handleCheckAllCategoryItems = (categoryId, value, tab) => {
        patchCategories(tab, prev =>
            prev.map(c => c.id === categoryId ? { ...c, items: c.items.map(it => ({ ...it, isCatalogItem: value })) } : c)
        )
    }

    const applyCategoryFilter = (tab) => {
        const selected = categorySelected[tab]
        patchCategories(tab, prev => {
            if (selected?.value) {
                return prev.map(cat => cat.id !== selected.value ? { ...cat, isVisible: false } : { ...cat, isVisible: true })
            }
            return prev.map(cat => ({ ...cat, isVisible: true }))
        })
    }

    const onSubmit = () => {
        debugger;
        const result = {}

        let itemTypes = Object.keys(itemByCategory);
        var items = []

        if (itemTypes?.length > 0) {
            for (var i = 0; i < itemTypes.length; i++) {
                itemByCategory[itemTypes[i]]?.forEach(category => {

                    category.items?.forEach(item => {
                        if (item.isCatalogItem == true && item.publicId) {
                            items.push({
                                ...item,
                                type: itemTypes[i]
                            });
                        }
                    })
                })
            }
        }

        if (items?.length > 0) {
            setCatalogItemsSubmitted(items)
            setConfirmSubmitOpen(true)
        }

    }

    const handleCreateCatalogItems = async () => {
        debugger;
        const items = catalogItemsSubmitted.map(catalogItem => { return ({ itemPublicId: catalogItem.publicId, price: catalogItem.price, itemType: catalogItem.type }) })

        const result = await catalogApiPostCatalogItem(catalogId, { items: items });

        setConfirmSubmitOpen(false)

        if (result?.data) {
            toast.push(
                <Notification type='success' title='Item de Catálogo Criado'>
                    Item de Catálogo criado com sucesso!
                </Notification>
            )

            onConfirmDialogClose();
        }
        else {
            toast.push(
                <Notification type='danger' title='Falha na Criação'>
                    Falha ao criar itens de catálogo. Tente novamente mais tarde.
                </Notification>
            )
        }
    }
    const getServicesAndProducts = async () => {
        setIsLoading(true)

        const resultService = await catalogApiGetServices()
        if (resultService?.data) {
            const categories = [
                ...new Map(resultService.data.map((it, idx) => [it.categoryId, { id: it.categoryId, name: (idx === 0 ? 'Avaliação' : 'Orto') }])).values()
            ]
            const mapped = categories.map(cat => ({
                ...cat,
                items: resultService.data.filter(x => x.categoryId === cat.id).map(s => ({
                    publicId: s.publicId,
                    name: s.name,
                    price: s.price,
                    categoryId: s.categoryId,
                    isCatalogItem: s.isCatalogItem || false
                })),
                isOpen: true,
                isVisible: true
            }))
            setItemByCategory(prev => ({ ...prev, service: mapped }))
        }

        const resultProduct = await catalogApiGetProducts()
        if (resultProduct?.data) {
            const prodWithCat = resultProduct.data.map((p, idx) => ({ ...p, categoryId: idx >= 0 ? 2 : 1, category: idx >= 0 ? 'Orto' : 'Avaliação' }))
            const prodCategories = [
                ...new Map(prodWithCat.map(it => [it.categoryId, { id: it.categoryId, name: it.category }])).values()
            ]
            const mappedProd = prodCategories.map(cat => ({
                ...cat,
                items: prodWithCat.filter(x => x.categoryId === cat.id).map(p => ({
                    publicId: p.publicId,
                    name: p.name,
                    price: p.price,
                    categoryId: p.categoryId,
                    isCatalogItem: p.isCatalogItem || false
                })),
                isOpen: true,
                isVisible: true
            }))
            setItemByCategory(prev => ({ ...prev, product: mappedProd }))
        }

        setItemByCategory(prev => ({
            ...prev,
            bundle: prev.bundle.length ? prev.bundle : []
        }))

        setIsLoading(false)
    }

    useEffect(() => {
        getServicesAndProducts()
    }, [])

    useEffect(() => {
        applyCategoryFilter(currentTab)
    }, [categorySelected, currentTab])

    const leftColumn = (tab) => {
        const categories = itemByCategory[tab] || []
        return (
            <>
                <Select
                    placeholder="Filtrar por Categoria"
                    options={categories.map(cat => ({ label: cat.name, value: cat.id }))}
                    isClearable
                    onChange={(option) => setCategorySelected(prev => ({ ...prev, [tab]: option }))}
                    value={categorySelected[tab]}
                />

                <div className="border-1 h-[400px] mt-4 rounded-lg p-2">
                    <div className="flex flex-col gap-2">
                        {
                            categories.filter(x => x.isVisible === true).map(category => {
                                if (category.items?.every(x => x.isCatalogItem === true)) return null
                                return (
                                    <div className="mb-6" key={`${tab}-${category.id}`}>
                                        <div className="font-bold text-sm flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                            <div className="flex items-center gap-1">
                                                <div className="flex items-center">
                                                    <Checkbox onChange={(value) => handleCheckAllCategoryItems(category.id, value, tab)} />
                                                    <span>{category.name}</span>
                                                </div>
                                                <span className="text-xs">{`(${category.items?.length})`}</span>
                                            </div>
                                            <div
                                                onClick={() => handleCategoryToggle(category.id, tab)}
                                                className="cursor-pointer p-1 hover:bg-gray-100 rounded-full"
                                            >
                                                {category.isOpen ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                                            </div>
                                        </div>

                                        {
                                            category.isOpen && category.items?.filter(x => !x.isCatalogItem).map(item => (
                                                <div className="flex items-center ml-8 mt-2" key={`${tab}-${item.id}`}>
                                                    <Checkbox onChange={(value) => handleCheckItem(value, item.publicId, category.id, tab)} checked={false} />
                                                    <span>{item.name}</span>
                                                    <MoneyValue className='text-emerald-600 font-semibold ml-4 mr-2' value={item.price} />
                                                </div>
                                            ))
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </>
        )
    }

    const rightColumn = (tab) => {
        const categories = itemByCategory[tab] || []
        const itemsFiltered = categories.filter(x => x?.items?.some(y => y?.isCatalogItem === true))
        const catalogItemsCount = categories.reduce((acc, cat) => {
            return acc + cat.items?.filter(it => it.isCatalogItem).length
        }, 0)

        return (
            <>
                <div className="h-[38px] flex items-center">
                    <span className="flex items-center font-semibold">Itens Selecionados ({catalogItemsCount})</span>
                </div>
                <div className="border-1 h-[400px] mt-4 rounded-lg p-3 ">
                    {
                        itemsFiltered.map(category => (
                            <div className="mb-6" key={`${tab}-sel-${category.id}`}>
                                <span className="font-bold text-sm">
                                    <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                                        <span>{category.name}</span>
                                    </div>
                                </span>

                                {
                                    category.items?.filter(x => x?.isCatalogItem === true).map((item, index) => (
                                        <div className="flex items-center ml-4 mt-1" key={`${tab}-sel-${item.id}`}>
                                            <div className="flex items-center w-6/10">
                                                <Checkbox
                                                    onChange={(value) => handleCheckItem(value, item.id, category.id, tab)}
                                                    checked={true}
                                                />
                                                <span>{item.name}</span>
                                            </div>

                                            <div className="w-4/10 ml-4 mr-2 mt-2">
                                                <FormNumericInput size='xs' className={`font-semibold ${index === 1 ? 'text-emerald-700' : ''}`} defaultValue={item.price} />
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        ))
                    }
                </div>
            </>

        )
    }

    return (
        <div className="">
            <Tabs
                defaultValue="service"
                onChange={(tab) => setCurrentTab(tab)}
            >
                <TabList>
                    <div className="flex items-center justify-center w-full">
                        <TabNav value='service' className="flex items-start">
                            <span>Serviço</span>
                        </TabNav>
                        <TabNav value='product'>Produto</TabNav>
                        <TabNav value='bundle'>Kit</TabNav>
                    </div>
                </TabList>

                <div className="mt-6 flex justify-center gap-4 h-[500px]">
                    <div className="w-[415px] border-1 h-full p-4 rounded-lg">
                        <div className="">
                            <TabContent value="service">
                                {leftColumn('service')}
                            </TabContent>
                            <TabContent value="product">
                                {leftColumn('product')}
                            </TabContent>
                            <TabContent value="bundle">
                                {leftColumn('bundle')}
                            </TabContent>
                        </div>
                    </div>

                    <div className="w-[400px] border-1 h-full p-4 rounded-lg">
                        <TabContent value="service">
                            {rightColumn('service')}
                        </TabContent>
                        <TabContent value="product">
                            {rightColumn('product')}
                        </TabContent>
                        <TabContent value="bundle">
                            {rightColumn('bundle')}
                        </TabContent>
                    </div>
                </div>
            </Tabs>

            <div className="flex items-center gap-2 justify-center mt-8">
                <Button
                    onClick={() => onClose()}
                >
                    Cancelar
                </Button>

                <Button
                    variant="solid"
                    onClick={() => onSubmit()}
                >
                    Salvar
                </Button>
            </div>

            <ConfirmDialog
                isOpen={confirmSubmitOpen}
                onCancel={() => setConfirmSubmitOpen(false)}
                onConfirm={() => handleCreateCatalogItems()}
                confirmText="Salvar"
                type="warning"
            >
                <span>Tem certeza que deseja <b>salvar</b> a operação?</span>
            </ConfirmDialog>
        </div>
    )
}

export default CatalogItemDualList
