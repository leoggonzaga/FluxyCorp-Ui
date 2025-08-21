import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import DatePickerInputtable, { DatePickerProps } from './DatePickerInputtable'
import DatePickerRange from './DatePickerRange'
import DateTimepicker from './DateTimepicker'

export type { DatePickerProps } from './DatePickerInputtable'
export type { DatePickerRangeProps } from './DatePickerRange'
export type { DateTimepickerProps } from './DateTimepicker'

type CompoundedComponent = ForwardRefExoticComponent<
    DatePickerProps & RefAttributes<HTMLSpanElement>
> & {
    DatePickerRange: typeof DatePickerRange
    DateTimepicker: typeof DateTimepicker
}

const DatePicker = DatePickerInputtable as CompoundedComponent

DatePicker.DatePickerRange = DatePickerRange
DatePicker.DateTimepicker = DateTimepicker

export { DatePicker }
export default DatePicker