import React from "react"
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore'
import { regexFileType } from '../../util/util'
import FileIcon, { defaultStyles } from 'react-file-icon';

const FileView = observer(() => {
    const store = useStore()

    const NameTag = (file) => {
        return (
            <div
                key={Math.random()}
                className='file-nametag'
                onClick={() => {
                    if(file.type === 'file'){
                        store.file.monoOpen(file.path + '/' + file.name)}
                    }
                }
            >
                { IconTag(file) }
                { file.name }
            </div>
        )
    }

    const IconTag = (file) => {
        if(file.type === 'dir'){
            return <FileIcon extension="folder" type='code' size={20} color='aliceblue' {...defaultStyles.code} />
        }else{
            return <FileIcon extension={ regexFileType(file.name) || 'file' } type='code' size={20} color='aliceblue' {...defaultStyles.code} />
        }
    }

    const FileRecur = (files) => {
        if(files.type === 'dir'){
            return (
                <div key={Math.random()} className='dir'>
                    { NameTag(files) }
                    <div className='file-subfolder'>
                        {files.children.map(c =>
                            FileRecur(c)
                        )}
                    </div>
                </div>
                )
        }else if(files.type === 'file'){
            return (
                <div key={Math.random()} className={files.type}>
                    { NameTag(files) }
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