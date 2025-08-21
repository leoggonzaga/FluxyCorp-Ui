import React, { useState } from "react"
import DrawnTeste from "./DrawnTeste"
import ImageMapper from 'react-img-mapper'
import { Button, Card } from "../components/ui"
import { HiOutlineChevronDown, HiOutlineChevronUp, HiOutlinePlus, HiPlusCircle, HiTrash } from "react-icons/hi"

const FaceChart = () => {
    const [areas, setAreas] = useState([
        { id: 'cheek-left', name: 'Bochecha Esquerda', shape: 'rect', coords: [89, 248, 136, 283] },
        { id: 'cheek-right', name: 'Bochecha Direita', shape: 'rect', coords: [346, 243, 301, 282] },
        { id: 'chin', name: 'Queixo', shape: 'rect', coords: [162, 396, 275, 460] },
        { id: 'forehead', name: 'Testa', shape: 'rect', coords: [116, 74, 318, 160] },
        { id: 'nose', name: 'Nariz', shape: 'rect', coords: [175, 271, 269, 328] }
    ])

    const procedures = [
        { id: 1, name: 'Botox Foda', areaId: 'chin' },
        { id: 2, name: 'Alongamento Queixal', areaId: 'chin' },
        { id: 3, name: 'Alongamento Queixal', areaId: 'chin' },
        { id: 4, name: 'Alongamento Queixal', areaId: 'chin' },
        { id: 5, name: 'Alongamento Queixal', areaId: 'chin' },
        { id: 6, name: 'Redução Bochechal', areaId: 'cheek-right' }
    ]

    const toggleExpanded = (area) => {
        if (!area) return
        setAreas(prev =>
            prev.map(item =>
                item.id === area.id
                    ? { ...item, expanded: !item.expanded }
                    : item
            )
        )
    }

    const onAreaClick = (area) => {
        if (!area) return
        setAreas(prev =>
            prev.map(item => {
                if (item.id !== area.id) 
                    return item

                const nextSelected = !item.selected
                const nextExpanded = !item.expanded
                return {
                    ...item,
                    selected: nextSelected,
                    expanded: nextExpanded,
                    preFillColor: nextSelected ? '#ff000023' : null
                }
            })
        )
    }

    return (
        <div className='flex '>
            <div>
                <ImageMapper
                    src="/img/facingFront.jpg"
                    name="face"
                    areas={areas}
                    parentWidth={400}
                    responsive={true}
                    onClick={(area) => onAreaClick(area)}
                />
            </div>
            <div className='border-1 rounded-tr-lg rounded-br-lg min-w-[500px] overflow-hidden'>
                <span className='flex justify-center font-bold text-base text-gray-900'>Procedimentos</span>

                <div className='mt-5 gap-4 flex flex-col max-h-[500px] overflow-y-auto px-6'>
                    {areas?.filter(x => x.selected == true)?.map((item) => {
                        return (
                            <div key={item.id}>
                                <div className='border-1 rounded-lg flex flex-col'>
                                    <div className='flex items-center p-2 justify-between'>
                                        <span className='text-gray-900 font-semibold text-base text-primary'>{item.name}</span>
                                        <div className='cursor-pointer hover:text-gray-800'>
                                            {item.expanded
                                                ? <HiOutlineChevronUp size={20} onClick={() => toggleExpanded(item)} />
                                                : <HiOutlineChevronDown size={20} onClick={() => toggleExpanded(item)} />
                                            }
                                        </div>
                                    </div>

                                    <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${item.expanded ? 'grid-rows-[1fr] opacity-100 pointer-events-auto' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                                        <div className='overflow-hidden flex flex-col'>
                                            <div className='flex justify-end mr-5'>
                                                <Button size="xs" icon={<HiOutlinePlus size={12} />} variant="solid" color="emerald-600">Anexar Procedimento</Button>
                                            </div>
                                            <ul className='max-h-[220px] overflow-y-auto px-1 my-2'>
                                                {procedures?.filter(x => x.areaId == item.id).map((procedure) => {
                                                    return (
                                                        <li key={procedure.id} className='even:bg-gray-100 odd:bg-gray-100/60 p-3 flex items-center justify-between first:rounded-tl-lg first:rounded-tr-lg last:rounded-bl-lg last:rounded-br-lg'>
                                                            <div className='flex flex-col'>
                                                                <div className='flex items-center gap-1 font-semibold text-gray-800 text-sm'>
                                                                    <span>{procedure.name}</span>
                                                                    <span>- 10 ml</span>
                                                                </div>
                                                                <span className='text-xs text-emerald-600 font-semibold'>R$ 5.000,00</span>
                                                            </div>
                                                            <div className='mr-1'>
                                                                <span className='hover:text-red-600 cursor-pointer'><HiTrash /></span>
                                                            </div>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default FaceChart
