const StockStatusBadge = ({ current, min }) => {
    if (current === 0)
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Esgotado</span>
    if (current <= min)
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Estoque baixo</span>
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Normal</span>
}

export default StockStatusBadge
