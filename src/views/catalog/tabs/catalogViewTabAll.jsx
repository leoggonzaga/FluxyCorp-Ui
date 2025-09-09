import { HiOutlineDotsHorizontal, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { Button, Card, Dropdown, MoneyValue } from "../../../components/ui";


const CatalogViewTabAll = ({ servicesByCategory }) => {
    return (
        <div>
            {
                servicesByCategory?.map(item => {
                    return (
                        <div className="mt-4">
                            <span className='text-lg font-bold'>{item.categoryName}</span>

                            <div className="mt-1 flex flex-col gap-2">
                                {
                                    item.services?.map(service => {
                                        return (
                                            <Card>
                                                <div className='flex justify-between'>
                                                    <div className="flex items-center gap-2">
                                                        <span className='text-base font-semibold'>{service.name}</span>
                                                        {' - '}
                                                        <MoneyValue className='text-base font-semibold text-emerald-600 ' value={service.price} />
                                                    </div>

                                                    <div className="flex justify-between gap-10">
                                                        {/* <MoneyValue className='text-base font-semibold text-emerald-600 ' value={service.price} /> */}

                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                icon={<HiOutlinePencil className="text-sky-700" />}
                                                                size="xs"
                                                            />

                                                            <Button
                                                                icon={<HiOutlineTrash className="text-red-700" />}
                                                                size="xs"
                                                            />
                                                        </div>

                                                        {/* <Dropdown
                                                            renderTitle={
                                                                <Button
                                                                    shape="circle"
                                                                    size="sm"
                                                                    icon={<HiOutlineDotsHorizontal/>}
                                                                />
                                                            }
                                                        >
                                                            <Dropdown.Item>
                                                                teste
                                                            </Dropdown.Item>
                                                        </Dropdown> */}
                                                    </div>
                                                </div>

                                            </Card>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default CatalogViewTabAll;