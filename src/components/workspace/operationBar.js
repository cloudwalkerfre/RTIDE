import React from "react"
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore'
import { ReactSVG } from 'react-svg'

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
                { store.py.isPyodideReady ?
                    <>
                          Run Python   
                        <ReactSVG src='icons/start.svg' onClick={ handleRunPython } />
                    </> :
                    <>
                          Python loading...
                    </>
                }
            </div>
        )
    }

    return Bar()
})

export default OperationBar