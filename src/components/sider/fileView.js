import React from "react"
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore'
import { regexFileType } from '../../util/util'
import { ReactSVG } from 'react-svg'

const FileView = observer(() => {
    const store = useStore()

    const NameTag = ({ file, className }) => {
        return (
            <div
                key={Math.random()}
                className={ className } 
                onClick={() => {
                    if(file.type === 'file'){
                        store.file.monoOpen(file.path + '/' + file.name)}
                    }
                }
            >
                <IconTag file={ file } />
                <div className='file-name-tag' >
                    { file.name }
                </div>
            </div>
        )
    }

    const IconTag = ({ file }) => {
        if(file.type === 'dir'){
            return (
                <>
                    <ReactSVG src='icons/chevron-down.svg' />
                    <ReactSVG src='icons/folder.svg' />
                </>
            )
        }else{
            return <ReactSVG src='icons/file.svg' />
        }
    }

    const FileRecur = (files) => {
        if(files.type === 'dir'){
            return (
                <div key={Math.random()} className='dir'>
                    <NameTag file={ files } className='folder-tag' />
                    <div className='subfolder'>
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
            { store.file.fileStoreReady && FileRecur(JSON.parse(store.file.directory))   }
        </div>
    )
})

export default FileView