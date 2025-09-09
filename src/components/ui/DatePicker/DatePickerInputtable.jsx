import React, { useState, useRef, forwardRef, useEffect } from 'react'
import dayjs from 'dayjs'
import useControllableState from '../hooks/useControllableState'
import useMergedRef from '../hooks/useMergeRef'
import Calendar from './Calendar'
import BasePicker from './BasePicker'
import { useConfig } from '../ConfigProvider'
import capitalize from '../utils/capitalize'
import { useTranslation } from 'react-i18next'

const localeDateConfig = {
  'pt-BR': { mask: '00/00/0000', format: 'DD/MM/YYYY' },
  en: { mask: '00/00/0000', format: 'MM/DD/YYYY' },
  'en-US': { mask: '00/00/0000', format: 'MM/DD/YYYY' },
  fr: { mask: '00.00.0000', format: 'DD.MM.YYYY' },
  de: { mask: '00.00.0000', format: 'DD.MM.YYYY' },
  es: { mask: '00.00.0000', format: 'DD.MM.YYYY' },
  eu: { mask: '00.00.0000', format: 'DD.MM.YYYY' },
}

const getIn = (obj, path) => {
  if (!obj || !path) return undefined
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}

const setIn = (obj, path, value) => {
  const keys = path.split('.')
  const clone = Array.isArray(obj) ? [...obj] : { ...(obj || {}) }
  let cur = clone
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    const next = cur[k]
    cur[k] = Array.isArray(next) ? [...next] : { ...(next || {}) }
    cur = cur[k]
  }
  cur[keys[keys.length - 1]] = value
  return clone
}

const DatePickerInputtable = forwardRef((props, ref) => {
  const {
    className,
    clearable = true,
    clearButton,
    closePickerOnChange = true,
    dateViewCount,
    dayClassName,
    dayStyle,
    defaultMonth,
    defaultOpen = false,
    defaultValue,
    defaultView,
    disabled = false,
    disableDate,
    enableHeaderLabel,
    disableOutOfMonth,
    firstDayOfWeek = 'monday',
    hideOutOfMonthDates,
    hideWeekdays,
    inputtable,
    labelFormat = { month: 'MMM', year: 'YYYY' },
    locale,
    maxDate,
    minDate,
    name = 'date',
    onBlur,
    onChange,
    onFocus,
    onDropdownClose,
    onDropdownOpen,
    openPickerOnClear = false,
    renderDay,
    size,
    style,
    type,
    value,
    weekendDays,
    yearLabelFormat,
    form,
    field,
    applyRules,
    touchOnChange = true,
    ...rest
  } = props

  const { locale: themeLocale } = useConfig()
  const { i18n } = useTranslation()
  const finalLocale = locale || themeLocale || i18n.language

  const { mask, format: dateFormat } =
    localeDateConfig[finalLocale] || localeDateConfig['pt-BR']

  const isFormik = !!form
  const fieldName = field?.name || name

  const readFormikValue = () => (isFormik ? getIn(form.values, fieldName) : undefined)
  const writeFormikValue = (v) => {
    if (isFormik) {
      form.setFieldValue(fieldName, v)
      if (touchOnChange) form.setFieldTouched(fieldName, true, false)
    }
    onChange?.(v)
  }

  const [dropdownOpened, setDropdownOpened] = useState(defaultOpen)
  const inputRef = useRef(null)

  const parseInitialDefaultValue = (val) => {
    if (val == null) return null
    if (typeof val === 'string') {
      const parsed = dayjs(val, dateFormat, finalLocale).toDate()
      return dayjs(parsed).isValid() ? parsed : null
    }
    return val instanceof Date && dayjs(val).isValid() ? val : null
  }

  const externalControlledValue = isFormik ? readFormikValue() : value
  const initialDefaultValue = parseInitialDefaultValue(
    isFormik ? readFormikValue() ?? defaultValue : defaultValue
  )

  const [lastValidValue, setLastValidValue] = useState(initialDefaultValue)
  const [_value, _setValue] = useControllableState({
    prop: externalControlledValue,
    defaultProp: initialDefaultValue,
    onChange: (v) => {
      if (!isFormik) onChange?.(v)
    }
  })

  const commit = (next, source) => {
    let v = next
    if (maxDate && dayjs(v).isAfter(maxDate)) v = maxDate
    if (minDate && dayjs(v).isBefore(minDate)) v = minDate
    if (applyRules) v = applyRules(v, { source, prev: _value, minDate, maxDate, locale: finalLocale, name: fieldName })
    if (isFormik) writeFormikValue(v)
    else _setValue(v)
    setLastValidValue(v)
  }

  const [calendarMonth, setCalendarMonth] = useState(
    _value || defaultMonth || new Date()
  )
  const [focused, setFocused] = useState(false)
  const [inputState, setInputState] = useState(
    _value instanceof Date
      ? capitalize(dayjs(_value).locale(finalLocale).format(dateFormat))
      : ''
  )

  const closeDropdown = () => {
    setDropdownOpened(false)
    onDropdownClose?.()
  }
  const openDropdown = () => {
    setDropdownOpened(true)
    onDropdownOpen?.()
  }

  useEffect(() => {
    if (!_value) {
      if (maxDate && dayjs(calendarMonth).isAfter(maxDate)) setCalendarMonth(maxDate)
      if (minDate && dayjs(calendarMonth).isBefore(minDate)) setCalendarMonth(minDate)
    }
  }, [minDate, maxDate])

  useEffect(() => {
    const v = externalControlledValue
    if (v === null && !focused) {
      setInputState('')
    } else if ((v instanceof Date || typeof v === 'string') && !focused) {
      const parsed = typeof v === 'string' ? dayjs(v, dateFormat, finalLocale).toDate() : v
      if (dayjs(parsed).isValid()) {
        setInputState(capitalize(dayjs(parsed).locale(finalLocale).format(dateFormat)))
        setCalendarMonth(parsed)
      }
    }
  }, [externalControlledValue, focused, finalLocale])

  const parseDate = (str) => dayjs(str, dateFormat, finalLocale).toDate()
  const applyMask = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    const sep = mask[2]
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return digits.slice(0, 2) + sep + digits.slice(2)
    return digits.slice(0, 2) + sep + digits.slice(2, 4) + sep + digits.slice(4, 8)
  }

  const handleChangeInput = (e) => {
    openDropdown()
    const raw = e.target.value
    const masked = applyMask(raw)
    setInputState(masked)
    const date = parseDate(masked)
    if (dayjs(date).isValid()) {
      commit(date, 'input')
      setCalendarMonth(date)
    }
  }

  const setDateFromInput = () => {
    let date = parseDate(inputState)
    if (dayjs(date).isValid()) {
      commit(date, 'inputCommit')
      setInputState(capitalize(dayjs(date).locale(finalLocale).format(dateFormat)))
      setCalendarMonth(date)
    } else {
      if (isFormik) {
        const v = readFormikValue()
        setInputState(
          v
            ? capitalize(dayjs(v).locale(finalLocale).format(dateFormat))
            : ''
        )
      } else {
        _setValue(lastValidValue)
        setInputState(
          lastValidValue
            ? capitalize(dayjs(lastValidValue).locale(finalLocale).format(dateFormat))
            : ''
        )
      }
    }
    closePickerOnChange && closeDropdown()
  }

  const handleBlur = (e) => { onBlur?.(e); setFocused(false); inputtable && setDateFromInput() }
  const handleFocus = (e) => { onFocus?.(e); setFocused(true) }
  const handleKeyDown = (e) => e.key === 'Enter' && inputtable && setDateFromInput()
  const handleClear = () => {
    if (applyRules) {
      const v = applyRules(null, { source: 'clear', prev: _value, minDate, maxDate, locale: finalLocale, name: fieldName })
      if (v) {
        commit(v, 'clear')
        setInputState(capitalize(dayjs(v).locale(finalLocale).format(dateFormat)))
      } else {
        if (isFormik) writeFormikValue(null); else _setValue(null)
        setLastValidValue(null)
        setInputState('')
      }
    } else {
      if (isFormik) writeFormikValue(null); else _setValue(null)
      setLastValidValue(null)
      setInputState('')
    }
    openPickerOnClear && openDropdown()
  }

  return (
    <BasePicker
      ref={useMergedRef(ref, inputRef)}
      inputtable={inputtable}
      dropdownOpened={dropdownOpened}
      setDropdownOpened={setDropdownOpened}
      size={size}
      style={style}
      className={className}
      name={fieldName}
      inputLabel={inputState}
      clearable={type === 'date' ? false : clearable && !!_value && !disabled}
      clearButton={clearButton}
      disabled={disabled}
      type={type}
      onChange={handleChangeInput}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onClear={handleClear}
      {...rest}
    >
      <Calendar
        locale={finalLocale}
        month={inputtable ? calendarMonth : undefined}
        defaultMonth={defaultMonth || (_value instanceof Date ? _value : new Date())}
        value={_value instanceof Date ? _value : _value && dayjs(_value).toDate()}
        labelFormat={labelFormat}
        dayClassName={dayClassName}
        dayStyle={dayStyle}
        disableOutOfMonth={disableOutOfMonth}
        minDate={minDate}
        maxDate={maxDate}
        disableDate={disableDate}
        firstDayOfWeek={firstDayOfWeek}
        preventFocus={inputtable}
        dateViewCount={dateViewCount}
        enableHeaderLabel={enableHeaderLabel}
        defaultView={defaultView}
        hideOutOfMonthDates={hideOutOfMonthDates}
        hideWeekdays={hideWeekdays}
        renderDay={renderDay}
        weekendDays={weekendDays}
        yearLabelFormat={yearLabelFormat}
        onMonthChange={setCalendarMonth}
        onChange={(d) => {
          commit(d, 'calendar')
          setInputState(capitalize(dayjs(d).locale(finalLocale).format(dateFormat)))
          closePickerOnChange && closeDropdown()
        }}
      />
    </BasePicker>
  )
})

DatePickerInputtable.displayName = 'DatePickerInputtable'
export default DatePickerInputtable
