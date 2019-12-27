import React from "react"
import FileView from './fileView'
import FileHandle from './fileHandle'

const SideBar = () => {
    return (
        <div className='sidebar'>
            <FileHandle />
            <FileView />
        </div>
    )
}

export default SideBar