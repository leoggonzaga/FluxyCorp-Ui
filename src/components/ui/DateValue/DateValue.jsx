import { useTranslation } from "react-i18next";

const DateValue = ({ value, className, timeOrientation = 'vertical', isDateOnly = true}) => {
    const { i18n } = useTranslation();
    const lang = i18n?.language || 'pt-BR';
    const dateOnly = { day: '2-digit', month: '2-digit', year: 'numeric' }
    const timeOnly = { hour: '2-digit', minute: '2-digit', hour12: false }

    const str = typeof value === 'string' ? value : '';
    const t = str.match(/[T\s](\d{2}):(\d{2})/);
    const hasExplicitTime = !!t;
    const zeroTimeInString = t && t[1] === '00' && t[2] === '00';

    const d = value ? new Date(value) : null;
    const showTime =
        typeof value === 'string'
            ? hasExplicitTime && !zeroTimeInString
            : d instanceof Date && !isNaN(d) && (d.getHours() !== 0 || d.getMinutes() !== 0);

    return (
        <div className='flex'>
            {!!value && (
                showTime && !isDateOnly ? (
                    <div className={`${className} ${timeOrientation == 'horizontal' ? 'flex gap-1 items-center' : 'flex flex-col'}`}>
                        <span>{d.toLocaleDateString(lang, dateOnly)}</span>
                        <span className={`${timeOrientation == 'horizontal' ? '' : 'flex justify-center'}`}>{d.toLocaleTimeString(lang, timeOnly)}</span>
                    </div>
                ) : (
                    <div className={className}>{d.toLocaleDateString(lang, dateOnly)}</div>
                )
            )}
        </div>
    )
}

export default DateValue;
