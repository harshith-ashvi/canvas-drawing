import React, { useLayoutEffect, useState } from 'react';
import rough from 'roughjs/bundled/rough.esm'

const generator = rough.generator()

const createElement = (x1, y1, x2, y2) => {
    const roughElement = generator.line(x1, y1, x2, y2)

    return { x1, y1, x2, y2, roughElement }
}

const CanvasDrawing = () => {
    const [ elements, setElements ] = useState([])
    const [ drawing, setDrawing ] = useState(false)

    useLayoutEffect(() => {
        const canvas = document.getElementById("canvas")
        const context = canvas.getContext("2d")
        context.clearRect(0, 0, canvas.width, canvas.height)

        const roughCanvas = rough.canvas(canvas)
        // const rect = generator.rectangle(10, 10, 100, 100)
        // const line = generator.line(10, 200, 200, 10)
        // roughCanvas.draw(rect)
        // roughCanvas.draw(line)
        elements.forEach(({roughElement}) => roughCanvas.draw(roughElement))


    }, [elements])

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
        const updatedElement = createElement(x1, y1, clientX, clientY)
        
        const elementsCopy = [...elements]
        elementsCopy[index] = updatedElement
        setElements(elementsCopy)
        
    }

    const handleMouseUp = () => {
        setDrawing(false)
    }

    return (
        <canvas 
            id="canvas" 
            style={{backgroundColor: 'aqua'}} 
            width={window.innerWidth} 
            height={window.innerHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            Canvas
        </canvas>
    )
}

export default CanvasDrawing