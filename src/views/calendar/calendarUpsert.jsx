import { Formik, Field, Form } from 'formik'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { HiOutlineCheckCircle, HiOutlineClock } from "react-icons/hi"
import { Button, Input, Notification, Select, toast, InputPhone, InputNationalDocument, TimeInput } from '../../components/ui';
import * as Yup from 'yup'
import DatePickerInputtable from '../../components/ui/DatePicker/DatePickerInputtable';
import TimeInputRange from '../../components/ui/TimeInput/TimeInputRange';

const CalendarUpsert = ({ data, onClose }) => {

    const handleCreate = (values) => {
        debugger;
    }

    const handleUpdate = (values) => {
        debugger;
    }

    const validationSchema = Yup.object().shape({

    })

    return (
        <div>
            <div className='flex w-full justify-center'>
                <h3>{data ? 'Editar' : 'Cadastrar'} Agendamento</h3>
            </div>


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
                {({ values, touched, errors, resetForm }) => (
                    <Form>
                        <FormContainer>

                            <div className='mt-4'>
                                <FormItem
                                    label="Nome Completo"
                                    asterisk
                                    invalid={errors.patientFullName && touched.patientFullName}
                                    errorMessage={errors.patientFullName}
                                >
                                    <Field
                                        type="text"
                                        value={values?.patientFullName}
                                        name="patientFullName"
                                        placeholder="Nome Completo"
                                        component={Input}
                                    />
                                </FormItem>

                                <div className='flex items-center gap-2 '>
                                    <FormItem
                                        asterisk
                                        label="Data"
                                        invalid={errors.start && touched.start}
                                        errorMessage={errors.start}
                                    >
                                        <Field name='start'>
                                            {({ field, form }) => (
                                                <DatePickerInputtable
                                                    inputtable
                                                    defaultValue={values?.start}
                                                    placeholder='Data'
                                                    name='start'
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

                                    <FormItem
                                        asterisk
                                        label="Início e Fim"
                                        invalid={errors.timeRange && touched.timeRange}
                                        errorMessage={errors.timeRange}
                                    >
                                        <Field name='timeRange'>
                                            {({ field, form }) => (
                                                <TimeInputRange
                                                    suffix={null}
                                                    prefix={null}
                                                    defaultValue={values?.timeRange}
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

                                <div className='flex items-center gap-2'>
                                    <FormItem
                                        asterisk
                                        label="Dentista"
                                        invalid={errors.timeRange && touched.timeRange}
                                        errorMessage={errors.timeRange}
                                        className='w-full'

                                    >
                                        <Field name='timeRange'>
                                            {({ field, form }) => (
                                                <Select
                                                    options={[]}
                                                    placeholder='Selecione o Profissional'
                                                    field={field}
                                                    form={form}
                                                    onChange={(options) => {
                                                        form.setFieldValue(
                                                            field.name,
                                                            options.value
                                                        )
                                                    }
                                                    }
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    <FormItem
                                        asterisk
                                        label="Tipo de Atendimento"
                                        invalid={errors.timeRange && touched.timeRange}
                                        errorMessage={errors.timeRange}
                                        className='w-full'
                                    >
                                        <Field name='timeRange'>
                                            {({ field, form }) => (
                                                <Select
                                                    options={[]}
                                                    placeholder='Selecione o Profissional'
                                                    field={field}
                                                    form={form}
                                                    onChange={(options) => {
                                                        form.setFieldValue(
                                                            field.name,
                                                            options.value
                                                        )
                                                    }
                                                    }
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
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
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default CalendarUpsert