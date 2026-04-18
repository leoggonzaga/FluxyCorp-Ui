import { useEffect, useState } from 'react'
import { Formik, Field, Form } from 'formik'
import * as Yup from 'yup'
import { Button, Input, Notification, Select, toast } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { createProduct, updateProduct } from '@/api/inventory/inventoryService'
import { HiOutlineCheckCircle } from 'react-icons/hi'

const UNIT_OPTIONS = [
    'unidade', 'caixa', 'frasco', 'par', 'pacote', 'rolo', 'metro',
    'litro', 'ml', 'g', 'kg', 'carpule', 'bisnaga', 'envelope', 'kit', 'bolsa',
].map(u => ({ value: u, label: u }))

const validationSchema = Yup.object({
    name: Yup.string().required('Campo obrigatório'),
    sku: Yup.string().required('Campo obrigatório'),
    unit: Yup.mixed().required('Campo obrigatório'),
    categoryPublicId: Yup.mixed().required('Campo obrigatório'),
    minStock: Yup.number().min(0).required('Campo obrigatório'),
})

const ProductUpsert = ({ data, categories, suppliers, onClose, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false)

    const catOptions = categories.map(c => ({ value: c.publicId, label: c.name, color: c.color }))
    const supOptions = [{ value: null, label: '— Sem fornecedor —' }, ...suppliers.map(s => ({ value: s.publicId, label: s.name }))]

    const initial = data ? {
        name: data.name,
        description: data.description || '',
        sku: data.sku,
        barcode: data.barcode || '',
        unit: data.unit ? { value: data.unit, label: data.unit } : null,
        costPrice: data.costPrice || '',
        salePrice: data.salePrice || '',
        minStock: data.minStock,
        maxStock: data.maxStock || '',
        location: data.location || '',
        categoryPublicId: data.categoryPublicId ? { value: data.categoryPublicId, label: data.categoryName } : null,
        supplierPublicId: data.supplierPublicId ? { value: data.supplierPublicId, label: data.supplierName } : null,
        initialStock: 0,
    } : {
        name: '', description: '', sku: '', barcode: '', unit: null,
        costPrice: '', salePrice: '', minStock: 5, maxStock: '', location: '',
        categoryPublicId: null, supplierPublicId: null, initialStock: 0,
    }

    const handleSubmit = async (values) => {
        setSubmitting(true)
        const payload = {
            ...values,
            unit: values.unit?.value,
            categoryPublicId: values.categoryPublicId?.value,
            supplierPublicId: values.supplierPublicId?.value || null,
            costPrice: values.costPrice ? parseFloat(values.costPrice) : null,
            salePrice: values.salePrice ? parseFloat(values.salePrice) : null,
            maxStock: values.maxStock ? parseInt(values.maxStock) : null,
            minStock: parseInt(values.minStock),
            initialStock: parseInt(values.initialStock || 0),
        }
        const result = data
            ? await updateProduct(data.publicId, payload)
            : await createProduct(payload)

        setSubmitting(false)
        if (result) {
            toast.push(<Notification type="success" title="Sucesso">{data ? 'Produto atualizado.' : 'Produto cadastrado.'}</Notification>)
            onClose()
            onSuccess?.()
        }
    }

    return (
        <Formik initialValues={initial} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, errors, touched, setFieldValue }) => (
                <Form>
                    <FormContainer>
                        <h5 className="font-bold text-gray-800 mb-4">{data ? 'Editar Produto' : 'Novo Produto'}</h5>

                        <div className="grid grid-cols-2 gap-3">
                            <FormItem label="Nome" asterisk className="col-span-2" invalid={errors.name && touched.name} errorMessage={errors.name}>
                                <Field name="name" placeholder="Nome do produto" component={Input} />
                            </FormItem>

                            <FormItem label="SKU" asterisk invalid={errors.sku && touched.sku} errorMessage={errors.sku}>
                                <Field name="sku" placeholder="Ex: LUV-001" component={Input} />
                            </FormItem>

                            <FormItem label="Código de barras">
                                <Field name="barcode" placeholder="EAN / código" component={Input} />
                            </FormItem>

                            <FormItem label="Categoria" asterisk invalid={errors.categoryPublicId && touched.categoryPublicId} errorMessage={errors.categoryPublicId}>
                                <Select
                                    options={catOptions}
                                    value={values.categoryPublicId}
                                    onChange={v => setFieldValue('categoryPublicId', v)}
                                    placeholder="Selecione"
                                />
                            </FormItem>

                            <FormItem label="Unidade" asterisk invalid={errors.unit && touched.unit} errorMessage={errors.unit}>
                                <Select
                                    options={UNIT_OPTIONS}
                                    value={values.unit}
                                    onChange={v => setFieldValue('unit', v)}
                                    placeholder="Selecione"
                                />
                            </FormItem>

                            <FormItem label="Fornecedor">
                                <Select
                                    options={supOptions}
                                    value={values.supplierPublicId}
                                    onChange={v => setFieldValue('supplierPublicId', v?.value ? v : null)}
                                    placeholder="— Sem fornecedor —"
                                />
                            </FormItem>

                            <FormItem label="Localização (prateleira)">
                                <Field name="location" placeholder="Ex: A-02, Gaveta 3" component={Input} />
                            </FormItem>

                            <FormItem label="Custo unitário (R$)">
                                <Field name="costPrice" type="number" step="0.01" placeholder="0,00" component={Input} />
                            </FormItem>

                            <FormItem label="Preço de venda (R$)">
                                <Field name="salePrice" type="number" step="0.01" placeholder="0,00" component={Input} />
                            </FormItem>

                            <FormItem label="Estoque mínimo" asterisk invalid={errors.minStock && touched.minStock} errorMessage={errors.minStock}>
                                <Field name="minStock" type="number" min="0" placeholder="5" component={Input} />
                            </FormItem>

                            <FormItem label="Estoque máximo">
                                <Field name="maxStock" type="number" min="0" placeholder="—" component={Input} />
                            </FormItem>

                            {!data && (
                                <FormItem label="Estoque inicial" className="col-span-2">
                                    <Field name="initialStock" type="number" min="0" placeholder="0" component={Input} />
                                </FormItem>
                            )}

                            <FormItem label="Descrição" className="col-span-2">
                                <Field name="description">
                                    {({ field }) => (
                                        <Input textArea rows={2} placeholder="Uso, observações..." {...field} />
                                    )}
                                </Field>
                            </FormItem>
                        </div>

                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                            <Button type="button" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" variant="solid" loading={submitting} icon={<HiOutlineCheckCircle />}>
                                {data ? 'Salvar' : 'Cadastrar'}
                            </Button>
                        </div>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
}

export default ProductUpsert
