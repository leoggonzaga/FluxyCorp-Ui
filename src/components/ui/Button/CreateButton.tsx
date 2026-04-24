import React from 'react'
import classNames from 'classnames'
import Button from './Button'
import { HiOutlinePlus } from 'react-icons/hi'

type Props = any

const CreateButton = ({ children, className, icon, ...rest }: Props) => {
    const base = 'flex items-center gap-2'
    return (
        <Button
            variant={rest.variant ?? 'solid'}
            size={rest.size ?? 'sm'}
            color={rest.color ?? 'violet-600'}
            shape={rest.shape ?? 'round'}
            className={classNames(base, className)}
            icon={icon ?? <HiOutlinePlus />}
            {...rest}
        >
            {children}
        </Button>
    )
}

export default CreateButton
