const ProductList = ({data}) => {
    return(
        <div>
            {
                data?.length == 0 &&
                <span className="bg-gray-50 rounded-lg py-2 flex w-full justify-center font-semibold text-gray-700">Nenhum Produto Cadastrado</span>
            }
        </div>
    )
}

export default ProductList;