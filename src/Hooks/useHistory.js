import { useState } from "react"

const useHistory = (initialState) => {
    const [ index, setIndex ] = useState(0)
    const [ history, setHistory ] = useState([initialState])

    const setState = (action, overWrite = false) => {
        const newState = typeof action === "function"? action(history[index]) : action
        if (overWrite) {
            const historyCopy = [...history]
            historyCopy[index] = newState
            setHistory(historyCopy)
        } else {
            const updatedState = history.slice(0, index + 1)
            setHistory(prevState => [...updatedState, newState])
            setIndex(prevState => prevState + 1)
        }  
    }

    const undo = () => index > 0 && setIndex(prevState => prevState - 1)

    const redo = () => index < history.length - 1 && setIndex(prevState => prevState + 1)

    return [ history[index], setState, undo, redo ]
}

export default useHistory