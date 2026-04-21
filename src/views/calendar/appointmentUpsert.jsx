import { Formik, Field, Form } from 'formik'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { HiOutlineBan, HiOutlineCheckCircle, HiOutlineClock, HiOutlineTrash, HiOutlineUser, HiOutlineCalendar } from "react-icons/hi"
import dayjs from 'dayjs'
import { Button, Input, Notification, Select, toast, InputPhone, InputNationalDocument, TimeInput, Avatar } from '../../components/ui';
import * as Yup from 'yup'
import DatePickerInputtable from '../../components/ui/DatePicker/DatePickerInputtable';
import TimeInputRange from '../../components/ui/TimeInput/TimeInputRange';
import { components } from 'react-select'
import Loading from '../../components/shared/Loading'
import ConsumerSearchInput from '@/components/shared/ConsumerSearchInput'
import { enterpriseApiGetEmployees, enterpriseApiGetEmployeeSimplifiedById, roomsGetAll } from '../../api/enterprise/EnterpriseService';
import { useEffect, useState } from 'react';
import { consultationTypeApiGetTypes } from '../../api/consultation/consultationService';
import CreatableSelect from 'react-select/creatable'



const { MultiValueLabel, Control } = components


const CustomControl = ({ children, ...props }) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            <Avatar
                className="ltr:ml-4 rtl:mr-4"
                shape="circle"
                size={25}
                icon={<HiOutlineUser size={15} />}
            />
            {children}
        </Control>
    )
}

const CustomSelectOption = ({ innerProps, label, data, isSelected }) => {
    return (
        <div
            className={`flex items-center justify-between p-2 ${isSelected
                ? 'bg-gray-100 dark:bg-gray-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            {...innerProps}
        >
            <div className="flex items-center">
                <Avatar shape="circle" size={20} src={data.imgPath} />
                <span className="ml-2 rtl:mr-2">{label}</span>
            </div>
            {isSelected && <HiCheck className="text-emerald-500 text-xl" />}
        </div>
    )
}

const AppointmentUpsert = ({ data, onClose }) => {
    console.log(data);

    const [isLoading, setIsLoading] = useState(false);
    const [phoneKey, setPhoneKey] = useState(0);

    const [employees, setEmployees] = useState([]);
    const [consultationTypes, setConsultationTypes] = useState([]);
    const [rooms, setRooms] = useState([]);

    const getEmployees = async () => {
        const result = await enterpriseApiGetEmployees();
        if (result?.data)
            setEmployees(result.data.map(x => ({ label: x.fullName, value: x.publicId })));
    }

    const getConsultationTypes = async () => {
        const result = await consultationTypeApiGetTypes();
        const list = Array.isArray(result) ? result : result?.data;
        if (Array.isArray(list))
            setConsultationTypes(list.map(x => ({ label: x.name, value: x.publicId })));
    }

    const getRooms = async () => {
        const result = await roomsGetAll();
        const list = Array.isArray(result) ? result : result?.data;
        if (Array.isArray(list))
            setRooms(
                list
                    .filter(x => x.isAvailable)
                    .map(x => ({
                        label: `${x.name}`,
                        value: x.publicId,
                    }))
            );
    }

    const handleCreate = (values) => {
    }

    const handleUpdate = (values) => {
    }

    const validationSchema = Yup.object().shape({

    })

    useEffect(() => {
        setIsLoading(true);

        Promise.all([
            getEmployees(),
            getConsultationTypes(),
            getRooms(),
        ])
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <div>
            <Loading loading={isLoading}>
                <div className='flex w-full justify-center'>
                    <h3>{data ? 'Editar' : 'Cadastrar'} Agendamento</h3>
                </div>


                {/* Badge de range pré-selecionado (só aparece quando vem do drag) */}
                {data?.timeRange && (
                    <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40">
                        <HiOutlineCalendar className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="text-xs text-indigo-700 dark:text-indigo-300">
                            Horário selecionado:{' '}
                            <strong>
                                {dayjs(data.start).format('DD/MM/YYYY')}
                                {' · '}
                                {dayjs(data.start).format('HH:mm')}
                                {' – '}
                                {dayjs(data.end).format('HH:mm')}
                            </strong>
                        </span>
                    </div>
                )}

                <Formik
                    enableReinitialize
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
                                        label="Paciente"
                                        asterisk
                                        invalid={errors.consumerName && touched.consumerName}
                                        errorMessage={errors.consumerName}
                                    >
                                        <Field name='consumerName'>
                                            {({ field, form }) => (
                                                <ConsumerSearchInput
                                                    value={field.value || ''}
                                                    onChange={(term) => form.setFieldValue(field.name, term)}
                                                    onSelect={(consumer) => {
                                                        form.setFieldValue('consumerPublicId', consumer.publicId ?? null)
                                                        form.setFieldValue('consumerName', consumer.socialName || consumer.name)
                                                        form.setFieldValue('email', consumer.email || '')
                                                        form.setFieldValue('customerPhone', consumer.phoneNumber || '')
                                                        setPhoneKey(k => k + 1)
                                                    }}
                                                    allowFreeText
                                                    placeholder='Buscar por nome, nome social ou CPF…'
                                                    className='w-full'
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <FormItem
                                                label="Email"
                                                invalid={errors.customerEmail && touched.customerEmail}
                                                errorMessage={errors.customerEmail}
                                            >
                                                <Field name='email'>
                                                    {({ field }) => (
                                                        <Input
                                                            {...field}
                                                            placeholder='Email'
                                                            className='w-[380px]'
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                        </div>

                                        <div>
                                            <FormItem
                                                label="Telefone"
                                                invalid={errors.customerEmail && touched.customerEmail}
                                                errorMessage={errors.customerEmail}
                                            >
                                                <Field name='customerPhone'>
                                                    {({ field, form }) => (
                                                        <InputPhone
                                                            key={phoneKey}
                                                            field={field}
                                                            form={form}
                                                            mask="(00) 00000-0000"
                                                            className='w-[190px]'
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                        </div>
                                    </div>

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
                                            label="Horário"
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

                                        <FormItem
                                            label="Sala"
                                            asterisk
                                            invalid={errors.roomPublicId && touched.roomPublicId}
                                            errorMessage={errors.roomPublicId}
                                        >
                                            <Field name='roomPublicId'>
                                                {({ field, form }) => (
                                                    <Select
                                                        options={rooms}
                                                        placeholder="Sala"
                                                        className='w-[180px]'
                                                        size='lg'
                                                        onChange={(opt) => form.setFieldValue(field.name, opt?.value)}
                                                        defaultValue={values?.roomPublicId ? rooms.find(x => x.value === values.roomPublicId) : null}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>

                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <FormItem
                                                asterisk
                                                label="Tipo de Atendimento"
                                                invalid={errors.consultationTypePublicId && touched.consultationTypePublicId}
                                                errorMessage={errors.consultationTypePublicId}
                                                className='w-full'
                                            >
                                                <Field name='consultationTypePublicId'>
                                                    {({ field, form }) => (
                                                        <Select
                                                            options={consultationTypes}
                                                            placeholder='Tipo de Atendimento'
                                                            onChange={(opt) => form.setFieldValue(field.name, opt?.value)}
                                                            defaultValue={values?.consultationTypePublicId ? consultationTypes.find(x => x.value === values.consultationTypePublicId) : null}
                                                            className='w-[290px]'
                                                            size='lg'
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                        </div>

                                        <div>
                                            <FormItem
                                                asterisk
                                                label="Dentista"
                                                invalid={errors.employeePublicId && touched.employeePublicId}
                                                errorMessage={errors.employeePublicId}
                                                className='w-full'
                                            >
                                                <Field name='employeePublicId'>
                                                    {({ field, form }) => (
                                                        <Select
                                                            options={employees}
                                                            placeholder='Selecione o Profissional'
                                                            onChange={(options) => {
                                                                form.setFieldValue(
                                                                    field.name,
                                                                    options.value
                                                                )
                                                            }
                                                            }
                                                            defaultValue={values?.employeePublicId ? employees.find(x => x.value == values.employeePublicId) : null}
                                                            className='w-[280px]'
                                                            size='lg'
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                        </div>
                                    </div>



                                    <FormItem
                                        label="Observações"
                                        invalid={errors.note && touched.note}
                                        errorMessage={errors.note}
                                    >
                                        <Field name='note'>
                                            {({ field, form }) => (
                                                <Input
                                                    textArea
                                                    placeholder='Observações'
                                                />
                                            )}
                                        </Field>
                                    </FormItem>



                                </div>

                                <div className='flex items-center gap-2 justify-between mt-3'>
                                    <div className='flex items-center gap-2'>
                                        <Button
                                            variant="twoTone"
                                            icon={<HiOutlineCheckCircle />}
                                            size='sm'
                                            color='emerald-500'
                                        >
                                            Confirmar
                                        </Button>

                                        <Button
                                            variant="twoTone"
                                            icon={<HiOutlineBan />}
                                            size='sm'
                                            color='orange-500'
                                        >
                                            Desmarcar
                                        </Button>

                                        <Button
                                            variant="twoTone"
                                            icon={<HiOutlineTrash />}
                                            size='sm'
                                            color='red-500'
                                        >
                                            Excluir
                                        </Button>
                                    </div>


                                    <div >




                                        <Button
                                            variant='solid'
                                            icon={<HiOutlineCheckCircle />}
                                            size='sm'
                                        >
                                            Salvar
                                        </Button>
                                    </div>


                                </div>
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </Loading>
        </div>
    )
}

export default AppointmentUpsert