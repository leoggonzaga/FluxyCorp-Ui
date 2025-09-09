import { Formik, Form, Field } from "formik";
import { FormItem, FormContainer } from '@/components/ui/Form'
import { HiOutlineCheckCircle, HiOutlinePlus, HiOutlinePlusSm } from "react-icons/hi"
import { Button, Checkbox, Input, InputPhone, MoneyInput, Select } from "../../../components/ui";
import * as Yup from 'yup'
import { FormNumericInput, Loading } from "../../../components/shared";
import { useState } from "react";


const BundleUpsert = ({ data, onClose }) => {

    const [isLoading, setIsLoading] = useState(false);

    const [selectValues, setSelectValues] = useState(null)

    const catalogs = [
        {
            id: 1,
            name: 'ortodonto 2025 uniodonto'
        },
        {
            id: 2,
            name: 'endo 2024 Uni'
        }
    ]

    const options = [
        {
            label: 'Produtos',
            options: [
                { value: 1, label: 'Produto 1' },
                { value: 2, label: 'Produto 2' }
            ]
        },
        {
            label: 'Serviços',
            options: [
                { value: 3, label: 'Serviço 1' },
                { value: 4, label: 'Serviço 2' }
            ]
        }
    ]

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Email inválido').required('Campo Obrigatório'),
        fullName: Yup.string().required('Campo Obrigatório'),
        nationalDocumentNumber: Yup.string().required('Campo Obrigatório'),
    })

    return (
        <Formik
            initialValues={data || {}}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                !data ?
                    handleCreate(values)
                    :
                    handleUpdate(values)
            }}
        >
            {({ touched, errors, resetForm }) => (
                <Form>
                    <FormContainer className='min-h-[300px] flex flex-col justify-center text-gray-700'>
                        <Loading loading={isLoading}>
                            <h3 className='flex justify-center'>
                                {!data ? 'Cadastrar' : 'Editar'} Kit
                            </h3>

                            <div className="flex gap-4 w-full mt-4">
                                <div className='mt-2 w-6/10'>
                                    <FormItem
                                        label="Nome do Kit"
                                        asterisk
                                        invalid={errors.fullName && touched.fullName}
                                        errorMessage={errors.fullName}
                                    >
                                        <Field
                                            type="text"
                                            name="fullName"
                                            placeholder="Nome do Kit"
                                            component={Input}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label='Produtos & Serviços'
                                        asterisk
                                        invalid={errors.email && touched.email}
                                        errorMessage={errors.email}

                                    >
                                        <Field name="email">
                                            {({ field, form }) => (
                                                <Select
                                                    placeholder='Selecione os Produtos/Serviços'
                                                    isMulti
                                                    options={options}
                                                    formatGroupLabel={(data) => <span>{data.label}</span>}
                                                    onChange={(option) => { debugger; setSelectValues(option) }}
                                                    value={selectValues}
                                                    defaultValue={null}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    <div className="flex items-center gap-2 justify-between">
                                        <div className="w-1/2">
                                            <FormItem
                                                label='Valor'
                                                asterisk
                                                invalid={errors.email && touched.email}
                                                errorMessage={errors.email}

                                            >
                                                <Field name="email">
                                                    {({ field, form }) => (
                                                        <FormNumericInput className='w-full flex' />
                                                    )}
                                                </Field>
                                            </FormItem>
                                        </div>

                                        <div className="w-1/2">
                                            <FormItem
                                                label='Valor Mínimo'
                                                asterisk
                                                invalid={errors.email && touched.email}
                                                errorMessage={errors.email}

                                            >
                                                <Field name="email">
                                                    {({ field, form }) => (
                                                        <FormNumericInput />
                                                    )}
                                                </Field>
                                            </FormItem>
                                        </div>
                                    </div>


                                    <FormItem
                                        label='Descrição'
                                        asterisk
                                        invalid={errors.email && touched.email}
                                        errorMessage={errors.email}

                                    >
                                        <Field name="email">
                                            {({ field, form }) => (
                                                <Input textArea placeholder="Descrição do Kit" />
                                            )}
                                        </Field>
                                    </FormItem>

                                </div>

                                <div className="h-auto border-1 border-gray-800" />

                                <div className="flex flex-col w-4/10">
                                    <span className="font-semibold text-base flex items-center gap-1">
                                        Catálogos
                                        <Button shape="circle" className="w-[20px] h-[20px]" variant="solid" icon={<HiOutlinePlus size={14} />} />
                                    </span>

                                    <div className="">
                                        {
                                            catalogs?.length == 0 &&
                                            <span className=" p-2 rounded-lg">Nenhum Catálogo Vinculado</span>
                                        }

                                        {
                                            catalogs?.map(catalog => {
                                                return (
                                                    <div className="mt-2">
                                                        <span className="items-center flex">
                                                            <Checkbox defaultChecked={true} disabled={true} />
                                                            {catalog.name}
                                                        </span>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className='flex items-center gap-2 justify-center mt-3'>
                                <Button
                                    type='button'
                                    onClick={onClose}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant='solid'
                                    icon={<HiOutlineCheckCircle />}
                                >
                                    Salvar
                                </Button>
                            </div>
                        </Loading>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
}

export default BundleUpsert;