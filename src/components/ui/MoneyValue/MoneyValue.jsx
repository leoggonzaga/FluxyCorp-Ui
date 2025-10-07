import { useTranslation } from "react-i18next"

const MoneyValue = ({value = 0, className}) => {

    const { i18n } = useTranslation()
    
    const locale = i18n?.language || "pt-BR"
    const symbol = locale == 'pt-BR' ? "R$" : "$"

    return(
        <div className={`flex items-center gap-1 ${className}`}>
            <span>{symbol}</span>
            <span>{value.toLocaleString(locale, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        </div>
    )
}

export default MoneyValue