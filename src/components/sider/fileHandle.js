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
                {/* /TODO */}
                <ReactSVG src='icons/new-file.svg' />
                <ReactSVG src='icons/new-folder.svg' onClick={ store.file.mkdir } />
                <ReactSVG src='icons/refresh.svg' onClick={ store.file.refresh } />
                <ReactSVG src='icons/collapse-all.svg' onClick={ store.file.collapseAll } />
            </div>
        )
    }

    return Handle()
}

export default FileHandle