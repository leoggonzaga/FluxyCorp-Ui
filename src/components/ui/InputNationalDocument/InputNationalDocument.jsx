import { forwardRef, useState, useEffect, useMemo, useRef } from 'react'
import { IMaskInput } from 'react-imask'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useConfig } from '../ConfigProvider'
import { useForm } from '../Form/context'
import { useInputGroup } from '../InputGroup/context'
import { CONTROL_SIZES } from '../utils/constants'
import isEmpty from 'lodash/isEmpty'
import isNil from 'lodash/isNil'
import get from 'lodash/get'

const InputNationalDocument = forwardRef((props, ref) => {
    const {
        asElement: Component = 'input',
        className,
        disabled,
        invalid,
        prefix,
        size,
        suffix,
        textArea,
        rows,
        style,
        unstyle = false,
        field,
        form,
        onChange,
        ...rest
    } = props

    const [prefixGutter, setPrefixGutter] = useState(0)
    const [suffixGutter, setSuffixGutter] = useState(0)
    const prefixNode = useRef(null)
    const suffixNode = useRef(null)

    const { i18n } = useTranslation()
    const { themeColor, controlSize, primaryColorLevel, direction } = useConfig()
    const formControlSize = useForm()?.size
    const inputGroupSize = useInputGroup()?.size
    const inputSize = size || inputGroupSize || formControlSize || controlSize
    const currentLang = i18n.language

    const documentMask = useMemo(() => {
        switch (currentLang) {
            case 'pt-BR':
                return '000.000.000-00'      // CPF
            case 'en':
            case 'en-US':
                return '000-00-0000'         // SSN (USA)
            case 'fr':
            case 'es':
            case 'de':
            case 'eu':
                return '00000000-A'          // European-style ID (generic)
            default:
                return '00000000-A'
        }
    }, [currentLang])

    const fixControlledValue = (val) => {
        if (typeof val === 'undefined' || val === null) return ''
        return val
    }

    if ('value' in props) {
        rest.value = fixControlledValue(props.value)
        delete rest.defaultValue
    }

    const isInvalid = useMemo(() => {
        let validate = false
        if (!isEmpty(form)) {
            const { touched, errors } = form
            const touchedField = get(touched, field?.name)
            const errorField = get(errors, field?.name)
            validate = touchedField && errorField
        }
        if (typeof invalid === 'boolean') {
            validate = invalid
        }
        return validate
    }, [form, invalid, field])

    const inputDefaultClass = 'input'
    const inputSizeClass = `input-${inputSize} h-${CONTROL_SIZES[inputSize]}`
    const inputFocusClass = `focus:ring-${themeColor}-${primaryColorLevel} focus-within:ring-${themeColor}-${primaryColorLevel} focus-within:border-${themeColor}-${primaryColorLevel} focus:border-${themeColor}-${primaryColorLevel}`
    const inputWrapperClass = `input-wrapper ${prefix || suffix ? className : ''}`
    const inputClass = classNames(
        inputDefaultClass,
        !textArea && inputSizeClass,
        !isInvalid && inputFocusClass,
        !prefix && !suffix ? className : '',
        disabled && 'input-disabled',
        isInvalid && 'input-invalid',
        textArea && 'input-textarea'
    )

    const getAffixSize = () => {
        if (!prefixNode.current && !suffixNode.current) return
        const prefixNodeWidth = prefixNode?.current?.offsetWidth
        const suffixNodeWidth = suffixNode?.current?.offsetWidth
        if (!isNil(prefixNodeWidth)) setPrefixGutter(prefixNodeWidth)
        if (!isNil(suffixNodeWidth)) setSuffixGutter(suffixNodeWidth)
    }

    useEffect(() => {
        getAffixSize()
    }, [prefix, suffix])

    const remToPxConvertion = (pixel) => 0.0625 * pixel

    const affixGutterStyle = () => {
        const leftGutter = `${remToPxConvertion(prefixGutter) + 1}rem`
        const rightGutter = `${remToPxConvertion(suffixGutter) + 1}rem`
        const gutterStyle = {}

        if (direction === 'ltr') {
            if (prefix) gutterStyle.paddingLeft = leftGutter
            if (suffix) gutterStyle.paddingRight = rightGutter
        }

        if (direction === 'rtl') {
            if (prefix) gutterStyle.paddingRight = leftGutter
            if (suffix) gutterStyle.paddingLeft = rightGutter
        }

        return gutterStyle
    }

    const inputProps = {
        className: !unstyle ? inputClass : '',
        disabled,
        type: 'text',
        ref,
        ...field,
        ...rest
    }

    const renderMaskedInput = (
        <IMaskInput
            {...inputProps}
            mask={documentMask}
            unmask={false}
            onAccept={(val, maskRef, e) => {
                if (onChange) {
                    onChange(e)
                }
            }}
            style={{ ...affixGutterStyle(), ...style }}
        />
    )

    const renderTextArea = (
        <textarea
            style={style}
            rows={rows}
            {...inputProps}
        ></textarea>
    )

    const renderAffixInput = (
        <span className={inputWrapperClass}>
            {prefix && (
                <div ref={prefixNode} className="input-suffix-start">
                    {prefix}
                </div>
            )}
            {renderMaskedInput}
            {suffix && (
                <div ref={suffixNode} className="input-suffix-end">
                    {suffix}
                </div>
            )}
        </span>
    )

    const renderChildren = () => {
        if (textArea) return renderTextArea
        if (prefix || suffix) return renderAffixInput
        return renderMaskedInput
    }

    return renderChildren()
})

InputNationalDocument.displayName = 'InputNationalDocument'

export default InputNationalDocument
