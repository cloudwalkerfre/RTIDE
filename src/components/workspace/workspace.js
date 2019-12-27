import React from "react"
import { observer } from 'mobx-react-lite'
import Term from "./term"
import MonoEditor from "./editor"
import OperationBar from './operationBar'

const WorkSpace = observer(() => {
    return (
        <div className='workspace'>
            <OperationBar />
            <MonoEditor />
            <Term />
        </div>
    )
})

export default WorkSpace