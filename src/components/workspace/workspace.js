import React from "react"
import { observer } from 'mobx-react-lite'
// import SideBar from '../sider/sidebar'
import Term from "./term"
import MonoEditor from "./editor"
import OperationBar from './operationBar'
import { useStore } from '../../hooks/useStore'
import { Content } from 'rsuite'

const WorkSpace = observer(() => {
    return (
        <Content className='workspace'>
            <OperationBar />
            <MonoEditor />
            <Term />
        </Content>
    )
})

export default WorkSpace