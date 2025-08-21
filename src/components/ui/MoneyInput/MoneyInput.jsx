import Input from "../Input";

const MoneyInput = ({className, value, ...rest}) => {
    return (
        <Input type="number" {...rest}/>
    )
}

export default MoneyInput;