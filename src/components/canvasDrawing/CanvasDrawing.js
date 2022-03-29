import React, { useLayoutEffect, useState, useEffect } from 'react';
import rough from 'roughjs/bundled/rough.esm'
import useHistory from '../../Hooks/useHistory';
import ElementTypes from '../elementTypes/ElementTypes';

const generator = rough.generator()

const createElement = (id, x1, y1, x2, y2, type) => {
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
     
    return { id, x1, y1, x2, y2, type, roughElement }
}

const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))

const nearPoint = (x, y, x1, y1, name) => {
    return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5? name:null
}

const positionWithinElement = (x, y, element) => {
    const { type, x1, x2, y1, y2 } = element
    if (type === "rectangle"){
        const topLeft = nearPoint(x, y, x1, y1, "tl")
        const topRight = nearPoint(x, y, x2, y1, "tr")
        const bottomLeft = nearPoint(x, y, x1, y2, "bl")
        const bottomRight = nearPoint(x, y, x2, y2, "br")
        const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? 'inside':null
        return topLeft || topRight || bottomLeft || bottomRight || inside
    } else {
        const a = { x: x1, y: y1 }
        const b = { x: x2, y: y2 }
        const c = { x, y }
        const offset = distance(a, b) - (distance(a, c) + distance(b, c))
        const start = nearPoint(x, y, x1, y1, "start")
        const end = nearPoint(x, y, x2, y2, "end")
        const inside = Math.abs(offset) < 1? "inside":null
        return start || end || inside
    }
}

const getElementAtPosition = (x, y, elements) => {
    return elements
        .map(element => ({...element, position: positionWithinElement(x, y, element)}))
        .find(ele => ele.position !== null)
}

const adjustElementsCoordinates = ({ x1, y1, x2, y2, type }) => {
    if(type === "rectangle"){
        const minX = Math.min(x1, x2)
        const maxX = Math.max(x1, x2)
        const minY = Math.min(y1, y2)
        const maxY = Math.max(y1, y2)
        return { x1: minX, y1: minY, x2: maxX, y2: maxY }
    } else {
        if(x1 < x2 || (x1 === x2 && y1 < y2)){
            return { x1, y1, x2, y2 }
        } else {
            return { x1: x2, y1: y2, x2: x1, y2: y1 }
        }
    }
}

const cursorForPosition = (position) => {
    switch (position) {
        case "tl":
        case "br":
        case "start":
        case "end":
            return "nwse-resize"
        case "tr":
        case "bl":
            return "nesw-resize"
        default: 
            return "move"
    }
}

const resizedCoordinates = (clientX, clientY, position, coordinates) => {
    const { x1, y1, x2, y2 } = coordinates
    switch (position) {
        case "tl": 
        case "start":
            return { x1: clientX, y1: clientY, x2, y2 } 
        case "tr": 
            return { x1, y1: clientY, x2: clientX, y2 }
        case "bl":
            return { x1: clientX, y1, x2, y2: clientY }
        case "br":
        case "end":
            return { x1, y1, x2: clientX, y2: clientY }
        default : 
            return null
    }
}

const CanvasDrawing = () => {
    const [ elements, setElements, undo, redo ] = useHistory([])
    const [ action, setAction ] = useState('none')
    const [ tool, setTool ] = useState("line")
    const [ selectedElement, setSelectedElement ] = useState(null)

    useLayoutEffect(() => {
        const canvas = document.getElementById("canvas")
        const context = canvas.getContext("2d")
        context.clearRect(0, 0, canvas.width, canvas.height)

        const roughCanvas = rough.canvas(canvas)

        elements?.forEach(({roughElement}) => roughCanvas.draw(roughElement))


    }, [elements])

    useEffect(() => {
        const undoRedoFunction = event => {  
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
                console.log("in")
                if (event.shiftKey) {
                    redo()
                } else {
                    undo()
                }
            } 
        }

        document.addEventListener("keydown", undoRedoFunction)
        return () => {
            document.removeEventListener("keydown", undoRedoFunction)
        }

    }, [undo, redo])

    const updateElement = (id, x1, y1, clientX, clientY, type) => {
        const updatedElement = createElement(id, x1, y1, clientX, clientY, type)   
        const elementsCopy = [...elements]
        elementsCopy[id] = updatedElement
        setElements(elementsCopy, true)
    }

    const handleTypeChange = (type) => {
        setTool(type)
    }

    const handleMouseDown = (event) => {
        const { clientX, clientY } = event
        if (tool === "selection"){
            const element = getElementAtPosition(clientX, clientY, elements)
            if(element) {
                const offsetX = clientX - element.x1
                const offsetY = clientY - element.y1
                setSelectedElement({...element, offsetX, offsetY})
                setElements(prevState => prevState)
                if(element.position === "inside"){
                    setAction("moving")
                } else {
                    setAction("resizing")
                }
                
            }
        } else {
            const id = elements.length
            const element = createElement(id, clientX, clientY, clientX, clientY)
            setElements(prevState => [...prevState, element])
            setSelectedElement(element)
            setAction("drawing")
        }
        
    }

    const handleMouseMove = (event) => {
        const { clientX, clientY } = event
        const element = getElementAtPosition(clientX, clientY, elements)
        if(tool === "selection"){
            event.target.style.cursor = element? cursorForPosition(element.position):"default"
        }

        if (action === 'drawing') {
            const index = elements.length - 1
            const requiredElement = elements[index]
            const { x1, y1 } = requiredElement
            updateElement(index, x1, y1, clientX, clientY, tool)
        } else if (action === 'moving') {
            const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement
            const width = x2 - x1
            const height = y2 - y1
            const newX1 = clientX - offsetX
            const newY1 = clientY - offsetY
            updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type)  
        } else if (action === 'resizing') {
            const { id, type, position, ...coordinates } = selectedElement
            const { x1, y1, x2, y2 } = resizedCoordinates(clientX, clientY, position, coordinates)
            updateElement(id, x1, y1, x2, y2, type)
        }

        
        
    }

    const handleMouseUp = () => {
        if (selectedElement){
            const index = selectedElement.id
            const {id, type} = elements[index]
            if (action === "drawing" || action === "resizing"){
                const { x1, y1, x2, y2 } = adjustElementsCoordinates(elements[index])
                updateElement(id, x1, y1, x2, y2, type)
            }
        }
        setAction("none")
        setSelectedElement(null)
        
    }

    return (
        <div style={{backgroundColor: 'aqua'}}>
            <ElementTypes 
                tool={tool} 
                handleTypeChange={handleTypeChange} 
            />
            <div style={{position: 'fixed', bottom: 0, padding: 10}}>
                <button onClick={undo}>Undo</button>
                <button onClick={redo}>Redo</button>
            </div>
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