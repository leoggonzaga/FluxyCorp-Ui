import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useAuth from '@/utils/hooks/useAuth'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi'
import type { CommonProps } from '@/@types/common'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    forgotPasswordUrl?: string
}

type SignInFormSchema = {
    userName: string
    password: string
    rememberMe: boolean
}

const validationSchema = Yup.object().shape({
    userName: Yup.string().required('Informe seu usuário'),
    password: Yup.string().required('Informe sua senha'),
    rememberMe: Yup.bool(),
})

const SignInForm = (props: SignInFormProps) => {
    const { disableSubmit = false, className, forgotPasswordUrl = '/forgot-password' } = props

    const [message, setMessage] = useTimeOutMessage()
    const { signIn } = useAuth()

    const onSignIn = async (
        values: SignInFormSchema,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        const { userName, password } = values
        setSubmitting(true)
        const result = await signIn(userName, password)
        if (result?.status === 'failed' || result?.status === 'error') {
            setMessage('Usuário ou senha incorretos.')
        }
        setSubmitting(false)
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-6" type="danger">
                    <>{message}</>
                </Alert>
            )}

            <Formik
                initialValues={{ userName: 'admin', password: '123Qwe', rememberMe: true }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSignIn(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer className="space-y-4">

                            <FormItem
                                label="Usuário ou e-mail"
                                invalid={(errors.userName && touched.userName) as boolean}
                                errorMessage={errors.userName}
                            >
                                <Field
                                    type="text"
                                    autoComplete="username"
                                    name="userName"
                                    placeholder="Usuário ou e-mail"
                                    prefix={<HiOutlineUser className="text-gray-400" />}
                                    component={Input}
                                />
                            </FormItem>

                            <FormItem
                                label="Senha"
                                invalid={(errors.password && touched.password) as boolean}
                                errorMessage={errors.password}
                            >
                                <Field
                                    autoComplete="current-password"
                                    name="password"
                                    placeholder="Senha"
                                    component={PasswordInput}
                                />
                            </FormItem>

                            <div className="flex items-center justify-between pt-2">
                                <Field
                                    className="mb-0"
                                    name="rememberMe"
                                    component={Checkbox}
                                >
                                    <span className="text-sm text-gray-500">Lembrar-me</span>
                                </Field>
                                <ActionLink
                                    to={forgotPasswordUrl}
                                    className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                                >
                                    Esqueci a senha
                                </ActionLink>
                            </div>

                            <div className="pt-4">
                                <Button
                                    block
                                    loading={isSubmitting}
                                    variant="solid"
                                    type="submit"
                                    className="!bg-violet-600 hover:!bg-violet-700 !rounded-xl !h-12 !text-sm !font-bold !shadow-lg !shadow-violet-200"
                                >
                                    {isSubmitting ? 'Entrando…' : 'Sign In'}
                                </Button>
                            </div>

                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignInForm
