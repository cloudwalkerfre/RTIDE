import React from "react"
import { observer } from 'mobx-react-lite'
import Editor, {monaco} from "@monaco-editor/react"
import { useStore } from '../../hooks/useStore'
import { Button } from 'rsuite'

const OperationBar = observer(() => {
    const store = useStore()

    const handleRunPython = async () => {
        let pr = await store.py.getPyodide(store.editor.value)
        store.os.termWrite(pr)
        console.log(pr)
    }

    const Bar = () => {
        return (
            <div
                className='operation-bar'
            >
                <Button appearance="default" size='sm' onClick={ handleRunPython } disabled={ !store.py.isPyodideReady }>
                    Run Python
                </Button>
            </div>
        )
    }

    return Bar()
})

export default OperationBar