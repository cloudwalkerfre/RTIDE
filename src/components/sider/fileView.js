import React from "react"
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore'
import { ReactSVG } from 'react-svg'

const InputTag = observer(({ file, store }) =>{
    const inputRef = React.createRef()
    React.useEffect(() => {
        inputRef.current.focus()
        store.file.getFileViewRef().current.scrollTo(0, inputRef.current.offsetTop)
    }, [file.isEdit])

    return <input
            className='name-tag-edit'
            onKeyUp={ store.file.mkdir2 }
            placeholder={ file.name }
            ref={ inputRef }
         />
})

const NameTag = observer(({ file, store, className }) => {
    return (
        <div
            key={ Math.random() }
            className={ file.isCurrent ? className + ' name-tag-hover' : className }
            onClick={() => store.file.handleClick(file) }
        >
            <IconTag file={ file } />
            <div className='file-name-tag' >
                { file.isEdit && <InputTag file={ file } store={ store } /> }
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
    const fileviewRef = React.createRef()
    store.file.setFileViewRef(fileviewRef)

    const FileRecur = (files) => {
        if(files.type === 'dir'){
            return (
                <div key={Math.random()} className='dir'>
                    <NameTag file={ files } store={ store } className='folder-tag' />
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
                    <NameTag file={ files }  store={ store } className='file-tag' />
                </div>
            )
        }
    }

    return (
        <div className='fileview' ref={ fileviewRef } >
            { store.file.fileStoreReady && FileRecur(store.file.directory)   }
        </div>
    )
})

export default FileView