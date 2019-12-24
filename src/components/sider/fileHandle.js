import React from "react"
import { useStore } from '../../hooks/useStore'

const FileHandle = () => {
    const store = useStore()

    const Handle = () => {
        return (
            <div
                className='file-handle'
            >
                 ↓ FILES
            </div>
        )
    }

    return Handle()
}

export default FileHandle