import React from "react"
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore'
import { ReactSVG } from 'react-svg'

const InputTag = observer(({ file }) =>{
    const store = useStore()
    const inputRef = React.createRef()

    React.useEffect(() => {
        inputRef.current.focus()
        store.file.getFileViewRef().current.scrollTo(0, inputRef.current.offsetTop - 10)
        store.file.addNewTagInputBlurListener(inputRef)
    }, [])

    return (
            <input
                className='name-tag-edit'
                onKeyUp={ file.type === 'file' ? store.file.newFile2 : store.file.mkdir2 }
                placeholder={ file.name }
                ref={ inputRef }
            />
         )
})

const NameTag = observer(({ file, className }) => {
    const store = useStore()
    const nameTagRef = React.createRef()

    React.useEffect(() => {
        if(file.isCurrent){
            store.file.getFileViewRef().current.scrollTo(0, nameTagRef.current.offsetTop - 70)
        }
    }, [file.isCurrent])

    return (
        <div
            key={ Math.random() }
            className={ file.isCurrent ? className + ' name-tag-hover' : className }
            onClick={() => store.file.handleClick(file) }
            ref={ nameTagRef }
        >
            <IconTag file={ file } />
            <div className='file-name-tag' >
                { file.isNameEdit && <InputTag file={ file } /> }
                { !file.isNameEdit && file.name }
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
        <div className='fileview' ref={ fileviewRef } >
            { store.file.isFileStoreReady && FileRecur(store.file.directory)   }
        </div>
    )
})

export default FileView