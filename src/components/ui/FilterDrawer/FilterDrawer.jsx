import { HiOutlineFilter } from "react-icons/hi"
import {Drawer, Button} from '@/components/ui'
import { useState } from "react";


const FilterDrawer = () => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                shape="circle"
                size="base"
                variant="solid"
                icon={<HiOutlineFilter/>}
                onClick={() => setIsOpen(true)}
            />

            <Drawer
                title='Filtro'
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onRequestClose={() => setIsOpen(false)}
            >
                teste
            </Drawer>
        </>


    )
}

export default FilterDrawer