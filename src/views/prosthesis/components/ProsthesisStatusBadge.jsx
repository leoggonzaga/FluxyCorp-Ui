const STATUS_STYLES = {
    'Solicitado': 'bg-blue-100 text-blue-700',
    'Em produção': 'bg-amber-100 text-amber-700',
    'Em prova': 'bg-purple-100 text-purple-700',
    'Ajuste solicitado': 'bg-orange-100 text-orange-700',
    'Finalizado no laboratório': 'bg-teal-100 text-teal-700',
    'Recebido na clínica': 'bg-indigo-100 text-indigo-700',
    'Instalado no paciente': 'bg-green-100 text-green-700',
    'Entregue': 'bg-emerald-100 text-emerald-700',
    'Garantia / manutenção': 'bg-red-100 text-red-700',
}

const ProsthesisStatusBadge = ({ status }) => {
    const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
            {status}
        </span>
    )
}

export default ProsthesisStatusBadge
