import { useTranslation } from "react-i18next"

const MoneyValue = ({value = 0, className}) => {

    const { i18n } = useTranslation()
    
    const locale = i18n?.language || "pt-BR"
    const symbol = locale == 'pt-BR' ? "R$" : "$"

    return(
        <div className={`flex ${className}`}>
            {symbol} {value.toLocaleString(locale, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </div>
    )
}

export default MoneyValue