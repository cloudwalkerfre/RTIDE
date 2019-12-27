import React from "react"
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore'
import { ReactSVG } from 'react-svg'

const FileHandle = observer(() => {
    const store = useStore()

    const Handle = () => {
        return (
            <div
                className='file-handle'
            >
                {/* <ReactSVG src='icons/chevron-down.svg' /> */}
                <div className='file-handle-text' >RTIDE</div>
                {/* /TODO */}
                {
                    store.os.isKernelReady &&
                    <>
                        <ReactSVG src='icons/new-file.svg'  onClick={ store.file.newFile1 } />
                        <ReactSVG src='icons/new-folder.svg' onClick={ store.file.mkdir1 } />
                        <ReactSVG src='icons/refresh.svg' onClick={ store.file.refresh } />
                        <ReactSVG src='icons/collapse-all.svg' onClick={ store.file.collapseAll } />
                    </>
                }
            </div>
        )
    }

    return Handle()
})

export default FileHandle