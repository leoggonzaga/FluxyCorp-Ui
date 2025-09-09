import { Card, MoneyValue } from "../../../components/ui";

const CatalogViewTabBundle = ({ serviceBundles }) => {
    return (
        <div>
            {
                (!serviceBundles || serviceBundles?.length == 0) &&
                <span className='flex justify-center'>Nenhum Conjunto Cadastrado</span>
            }

            <div className="flex flex-col gap-4">
                {
                    serviceBundles?.map(item => {
                        return (
                            <Card >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <span className="text-lg font-semibold">{item.name}</span>
                                            {' - '}
                                            <MoneyValue className='text-base text-emerald-600 font-semibold' value={item.price} />
                                        </div>

                                        <div className="flex flex-col ml-1 text-sm">
                                            {
                                                item.services?.map(service => {
                                                    return (
                                                        <span>- {service.name}</span>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>

                                    <div className='flex justify-end'>
                                        {/* <MoneyValue className='text-base text-emerald-600 font-semibold' value={item.price}/> */}
                                    </div>
                                </div>
                            </Card>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default CatalogViewTabBundle;