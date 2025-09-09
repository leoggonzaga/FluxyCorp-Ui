import { Button, ColorPicker, Input } from "../../components/ui"
import { Formik, Field, Form } from 'formik'
import { FormItem, FormContainer } from '@/components/ui/Form'
import * as Yup from 'yup'
import { HiOutlineCheckCircle } from "react-icons/hi"


const ConsultationTypeUpsert = ({ data, onClose }) => {
    const validationSchema = Yup.object().shape({

    })

    const handleCreate = async (values) => {
        console.log(values)
    }

    return (
        <div>
            <div className='flex justify-center'>
                <h3>{!data ? 'Cadastrar' : 'Editar'} Tipo de Atendimento</h3>
            </div>

            <div>
                <Formik
                    initialValues={data || {
                        color: data?.color || '#646464ff'
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        !data ?
                            handleCreate(values)
                            :
                            handleUpdate(values)
                    }}
                >
                    {({ values, touched, errors, resetForm }) => (
                        <Form>
                            <FormContainer>

                                <div className='mt-4'>
                                    <FormItem
                                        label="Título:"
                                        asterisk
                                        invalid={errors.title && touched.title}
                                        errorMessage={errors.title}
                                    >
                                        <Field
                                            type="text"
                                            value={values?.title}
                                            name="title"
                                            placeholder="Título"
                                            component={Input}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="Cor:"
                                        invalid={errors.start && touched.start}
                                        errorMessage={errors.start}
                                    >
                                        <Field name='start'>
                                            {({ field, form }) => (
                                                <ColorPicker
                                                    size={100}
                                                    color={values.color}
                                                    field={field}
                                                    form={form}
                                                    onChange={(value) => {
                                                        form.setFieldValue(
                                                            field.name,
                                                            value
                                                        )
                                                    }
                                                    }
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                <div className='flex items-center gap-2 justify-center mt-6'>
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
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}

export default ConsultationTypeUpsert