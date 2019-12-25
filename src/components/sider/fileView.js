import React from "react"
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore'
import { ReactSVG } from 'react-svg'

const NameTag = observer(({ file, className }) => {
    const store = useStore()

    return (
        <div
            key={Math.random()}
            className={ file.isOpen ? className + ' name-tag-hover' : className }
            onClick={() => store.file.handleClick(file) }
        >
            <IconTag file={ file } />
            <div className='file-name-tag' >
                { file.name }
            </div>
        </div>
    )
})

const IconTag = ({ file }) => {
    if(file.type === 'dir'){
        return (
            <>
                { file.isExpend ? <ReactSVG src='icons/chevron-down.svg' /> : <ReactSVG src='icons/chevron-right.svg' />}
                <ReactSVG src='icons/folder.svg' />
            </>
        )
    }else{
        return <ReactSVG src='icons/file.svg' />
    }
}

const FileView = observer(() => {
    const store = useStore()

    const FileRecur = (files) => {
        if(files.type === 'dir'){
            return (
                <div key={Math.random()} className='dir'>
                    <NameTag file={ files } className='folder-tag' />
                    <div className={ files.isExpend ? 'subfolder' : 'subfolder-collapse' }>
                        {files.children.map(c =>
                            FileRecur(c)
                        )}
                    </div>
                </div>
                )
        }else if(files.type === 'file'){
            return (
                <div key={Math.random()} className={files.type}>
                    <NameTag file={ files } className='file-tag' />
                </div>
            )
        }
    }

    return (
        <div className='fileview'>
            { store.file.fileStoreReady && FileRecur(store.file.directory)   }
        </div>
    )
})

export default FileView