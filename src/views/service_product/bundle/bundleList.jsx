const BundleList = ({data}) => {
    return (
        <div>
            {
                data?.length == 0 &&
                <span className="bg-gray-50 rounded-lg py-2 flex w-full justify-center font-semibold text-gray-700">Nenhum Kit Cadastrado</span>
            }
        </div>
    )
}

export default BundleList;