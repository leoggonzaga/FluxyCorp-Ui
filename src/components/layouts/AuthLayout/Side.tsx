import { cloneElement } from 'react'
import Avatar from '@/components/ui/Avatar'
import Logo from '@/components/template/Logo'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'

interface SideProps extends CommonProps {
    content?: React.ReactNode
}

const Side = ({ children, content, ...rest }: SideProps) => {
    return (
        <div className="grid lg:grid-cols-3 h-full">
            <div className="col-span-2 flex flex-col justify-center items-center bg-white dark:bg-gray-800 lg:px-8">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px] flex flex-col justify-center min-h-[500px]">
                    <div className="mb-8 flex justify-center">{content}</div>
                    <div className="flex-1 flex items-center justify-center">
                        {children
                            ? cloneElement(children as React.ReactElement, {
                                  ...rest,
                              })
                            : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Side
