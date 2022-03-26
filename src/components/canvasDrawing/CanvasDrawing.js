import React, { useLayoutEffect } from 'react';

const CanvasDrawing = () => {

    useLayoutEffect(() => {
        const canvas = document.getElementById("canvas")
        const context = canvas.getContext("2d")

        
    })

    return (
        <canvas 
            id="canvas" 
            style={{backgroundColor: 'aqua'}} 
            width={window.innerWidth} 
            height={window.innerHeight}
        >
            Canvas
        </canvas>
    )
}

export default CanvasDrawing