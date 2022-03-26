import React from 'react'

import { elementTypes } from '../../constants/elementTypes'

const ElementTypes = ({elementType, handleTypeChange}) => {
    return (
        <div style={{position: "fixed", display: 'flex'}}>
            {elementTypes.map(element => {
                return (
                    <div key={element.type}>
                        <input
                            type="radio"
                            id={element.type} 
                            checked={elementType === element.type}
                            onChange={() => handleTypeChange(element.type)}
                        />
                        <label>{element.label}</label>
                    </div>
                )
            })}
        </div>
    )
}

export default ElementTypes