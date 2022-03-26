import React, { useLayoutEffect, useState } from 'react';
import rough from 'roughjs/bundled/rough.esm'
import ElementTypes from '../elementTypes/ElementTypes';

const generator = rough.generator()

const createElement = (x1, y1, x2, y2, type) => {
    let roughElement
    switch (type) {
        case "line":
            roughElement = generator.line(x1, y1, x2, y2)
            break
        case "rectangle": 
            roughElement = generator.rectangle(x1, y1, x2-x1, y2-y1)
            break
        default :
            roughElement = generator.line(x1, y1, x2, y2)
            break
    }   
     
    return { x1, y1, x2, y2, roughElement }
}

const CanvasDrawing = () => {
    const [ elements, setElements ] = useState([])
    const [ drawing, setDrawing ] = useState(false)
    const [ elementType, setElementType ] = useState("line")

    useLayoutEffect(() => {
        const canvas = document.getElementById("canvas")
        const context = canvas.getContext("2d")
        context.clearRect(0, 0, canvas.width, canvas.height)

        const roughCanvas = rough.canvas(canvas)

        elements.forEach(({roughElement}) => roughCanvas.draw(roughElement))


    }, [elements])

    const handleTypeChange = (type) => {
        setElementType(type)
    }

    const handleMouseDown = (event) => {
        setDrawing(true)
        const { clientX, clientY } = event
        const element = createElement(clientX, clientY, clientX, clientY)
        setElements(prevState => [...prevState, element])
    }

    const handleMouseMove = (event) => {
        if (!drawing) return

        const index = elements.length - 1
        const requiredElement = elements[index]
        const { x1, y1 } = requiredElement
        const { clientX, clientY } = event
        const updatedElement = createElement(x1, y1, clientX, clientY, elementType)
        
        const elementsCopy = [...elements]
        elementsCopy[index] = updatedElement
        setElements(elementsCopy)
        
    }

    const handleMouseUp = () => {
        setDrawing(false)
    }

    return (
        <div style={{backgroundColor: 'aqua'}}>
            <ElementTypes 
                elementType={elementType} 
                handleTypeChange={handleTypeChange} 
            />
            <canvas 
                id="canvas" 
                width={window.innerWidth} 
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                Canvas
            </canvas>
        </div>
    )
}

export default CanvasDrawing