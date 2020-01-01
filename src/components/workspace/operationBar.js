import React from "react"
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore'
import { ReactSVG } from 'react-svg'

const OperationBar = observer(() => {
    const store = useStore()

    const handleRunPython = async () => {
        store.py.setIsPyodideBusy(true)
        let pr = await store.py.run(store.editor.getCurrentEditorValue())
        store.py.setIsPyodideBusy(false)
        store.os.termWrite(pr)
        console.log(pr)
    }

    const Bar = () => {
        return (
            <div
                className='operation-bar'
            >
                { store.py.isPyodideReady && store.file.isFileStoreReady ?
                    <>
                        { store.py.isPyodideBusy ?
                        <>
                            { 'Python Running...' }
                            <ReactSVG src='icons/start.svg' onClick={ handleRunPython } />
                        </>:
                        <>
                            { 'Run Python' + '\u00A0'.repeat(3) }
                            <ReactSVG src='icons/start.svg' onClick={ handleRunPython } />
                        </>
                        }
                    </> :
                    <>
                        { 'Python loading...' }
                    </>
                }
            </div>
        )
    }

    return Bar()
})

export default OperationBar