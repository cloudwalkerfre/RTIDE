import React from "react"
import { Sidebar } from 'rsuite'
import FileView from './fileView'
import FileHandle from './fileHandle'

const SideBar = () => {
    return (
        <Sidebar className='sidebar'>
            <FileHandle />
            <FileView />
        </Sidebar>
    )
}

export default SideBar