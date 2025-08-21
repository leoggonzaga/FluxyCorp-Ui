import { useEffect, useRef, useState } from "react"
import { HexColorPicker } from "react-colorful"
import Floating from "../Floating"

const ColorPicker = ({ size, color, field, onChange, ...rest }) => {
    const anchorRef = useRef(null)
    const [open, setOpen] = useState(false)
    const [selectedColor, setSelectedColor] = useState(field?.value ?? color)

    useEffect(() => {
        setSelectedColor(field?.value ?? color)
    }, [field?.value, color])

    const handleColorChange = (v) => {
        setSelectedColor(v)
        onChange?.(v)
    }

    return (
        <div className="flex">
            <div
                style={{ backgroundColor: selectedColor, width: size, height: size }}
                className="p-2 border-2 rounded-lg"
                onClick={() => setOpen(true)}
                ref={anchorRef}
            />
            <Floating
                isOpen={open}
                onClose={() => setOpen(false)}
                anchorRef={anchorRef}
                className="z-50"
                contentClassName="bg-white p-3 rounded-lg shadow-lg"
                placement="right"
            >
                <HexColorPicker color={selectedColor} onChange={handleColorChange} {...rest} />
            </Floating>
        </div>
    )
}

export default ColorPicker
