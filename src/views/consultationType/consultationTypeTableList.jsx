import { HiCheck, HiCheckCircle, HiOutlineCheckCircle, HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { Button, Card, Dialog, Pagination, Tabs, Tag } from "../../components/ui";
import { useState } from "react";
import ConsultationTypeUpsert from "./consultationTypeUpsert";
import { ConfirmDialog } from "../../components/shared";
import ConsultationTypeCategoryTableList from "./consultationTypeCategoryTableList";

const ConsultationTypeTableList = ({ data, onOpenUpsert, onDeleteType }) => {
    return (
        <div>
            {
                data?.length > 0 ?
                    <div className='gap-2 flex flex-col'>
                        {data.map((type) => {
                            return (
                                <Card
                                    key={type.id}
                                // className='odd:bg-indigo-100/50 even:bg-indigo-50/40 first:rounded-t-lg last:rounded-b-lg h-[80px] p-4 flex items-center justify-between'
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className='flex items-center gap-2'>
                                            <div className={`p-4 rounded-lg border-2 border-gray-100`} style={{ backgroundColor: type.color }} />
                                            <span className='font-bold text-base'>{type.title}</span>
                                            <HiCheckCircle className='text-emerald-600' size={15} />
                                        </div>

                                        <div className='flex gap-2'>
                                            <Button
                                                size="xs"
                                                icon={<HiOutlinePencil />}
                                                className="text-sky-700"
                                                onClick={() => onOpenUpsert(type)}
                                            />
                                            <Button
                                                size="xs"
                                                icon={<HiOutlineTrash />}
                                                className="text-red-700"
                                                onClick={() => onDeleteType(type.id)}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                        <div className='flex justify-center mt-3'>
                            <Pagination
                                pageSize={10}
                                currentPage={1}
                                total={1}
                            />
                        </div>

                    </div>

                    :

                    <div className='w-full justify-center flex'>
                        Nenhum Tipo de Atendimento Cadastrado.
                    </div>
            }
        </div>
    )
}

export default ConsultationTypeTableList;