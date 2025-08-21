import { NumericFormat } from 'react-number-format'
import Input from '@/components/ui/Input'
import { HiCurrencyDollar } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

const NumberInput = ({ inputSuffix, inputPrefix, ...props }) => {
    return (
        <Input
            {...props}
            value={props.value}
            suffix={inputSuffix}
            prefix={inputPrefix}
        />
    )
}

const NumberFormatInput = ({ onValueChange, form, field, ...rest }) => {
    return (
        <NumericFormat
            customInput={NumberInput}
            form={form}
            field={field}
            onBlur={field?.onBlur}
            onValueChange={onValueChange}
            {...rest}
        />
    )
}

const FormNumericInput = ({ form, field, inputSuffix, inputPrefix, onValueChange, defaultValue, ...rest }) => {

    const { i18n } = useTranslation()
    const lang = i18n.language || 'pt-BR'

    const pref = inputPrefix || (lang == 'pt-BR' ? 'R$' : '$')
    const thousandSeparator = lang == 'en' ? ',' : '.'
    const decimalSeparator = lang == 'en' ? '.' : ','

    return (
        <NumberFormatInput
            form={form}
            field={field}
            inputPrefix={pref}
            inputSuffix={inputSuffix}
            onValueChange={onValueChange}
            thousandSeparator={thousandSeparator}
            decimalSeparator={decimalSeparator}
            decimalScale={2}
            placeholder={`0${decimalSeparator}00`}
            fixedDecimalScale
            value={defaultValue}
            {...rest}
        />
    )
}

export default FormNumericInput
