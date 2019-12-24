import React from "react"
import { useStore } from '../../hooks/useStore'
import { ReactSVG } from 'react-svg'

const FileHandle = () => {
    const store = useStore()

    const Handle = () => {
        return (
            <div
                className='file-handle'
            >
                {/* <ReactSVG src='icons/chevron-down.svg' /> */}
                <div className='file-handle-text' >RTIDE</div>
                <ReactSVG src='icons/new-file.svg' />
                <ReactSVG src='icons/new-folder.svg' />
                <ReactSVG src='icons/collapse-all.svg' />
            </div>
        )
    }

    return Handle()
}

export default FileHandle